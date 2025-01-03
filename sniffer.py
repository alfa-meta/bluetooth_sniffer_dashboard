import subprocess
import os
import math
from datetime import datetime, timedelta
from email_sender import send_email, import_json_file

class Sniffer():
    def __init__(self, number_of_packets: int, user_data: list, device_data: list, sniffer_mode="tshark"):
        print("Initialising Sniffer Object")
        self.number_of_packets = str(number_of_packets)
        self.last_check = datetime.now()
        self.user_data: list = user_data
        self.device_data: list = device_data
        self.sniffer_mode: str = sniffer_mode

        print(f"{len(user_data)} users found in the Database")
        print(f"{len(device_data)} devices found in the Database")

    def run_tshark(self, input_interface, output_json):
        """
            Run the tshark command and stream the output into a JSON file.
            
            :param input_interface: The input interface (e.g., 'COM5-4.4').
            :param output_json: The name of the output JSON file (e.g., 'output.json').
        """
        # Construct the tshark command
        command = [
            "tshark",
            "-i", input_interface,   # Input interface
            "-T", "json",            # Output in JSON format
            "-c", self.number_of_packets
        ]
        
        try:
            # Open the output file and run the tshark command, streaming output to the file
            with open("outputs\\" + output_json + "\\" + output_json + ".json", "w") as output_file:
                subprocess.run(command, stdout=output_file, check=True)
        except subprocess.CalledProcessError as e:
            print(f"Error running tshark: {e}")
        except FileNotFoundError:
            print("Tshark is not installed or not found in the PATH.")

    def has_three_minutes_passed(self):
        """
            Checks if three minutes have passed since last time a check has been made.
            This is so that the user does not get spammed with notifications. So a notification every three minutes

            :return three_minutes_passed: Boolean value if three minutes have passed.
        """
        # Define the time of the last check
        last_check_time = self.last_check - timedelta(minutes=3)

        # Check if 3 minutes have passed
        time_elapsed = self.last_check - last_check_time
        three_minutes_passed = time_elapsed >= timedelta(minutes=3)

        if three_minutes_passed == False:
            self.last_check = datetime.now()

        return three_minutes_passed

    # def load_env_file(self, file_path):
    #     """
    #         Load the .env file and extract BLE device information.

    #         :return ble_devices: list of all ble_devices that have been set in the .env file
    #     """
    #     if not os.path.exists(file_path):
    #         print(f"File not found: {file_path}")
    #         return None

    #     ble_devices = {}
    #     with open(file_path, 'r') as file:
    #         for line in file:
    #             # Ignore empty lines or comments
    #             if line.strip() and not line.strip().startswith('#'):
    #                 key, value = line.split('=', 1)
    #                 key = key.strip()
    #                 value, *comment = value.split('#', 1)
    #                 value = value.strip().strip('"').strip("'")  # Clean quotes if present
    #                 ble_devices[key] = value
        
    #     return ble_devices

    def extract_addresses_and_rssi(self, json_file):
        """
            Imports json file
            Check for packets
            Separates traffic from nordic ble sniffer
            Counts the number of packets found in the file per MAC Address.

            :param json_file: captured packets in json format form Wireshark.
            :return adress_rssi_list: returs the list of all counted up MAC Addresses.
        """
        data = import_json_file(path=json_file)
        address_rssi_counts = {}

        for packet in data:
            try:
                layers = packet["_source"]["layers"]
                btle_layer = layers.get("btle", {})
                nordic_ble_layer = layers.get("nordic_ble", {})
                
                source_address = btle_layer.get("btle.advertising_address")
                rssi = nordic_ble_layer.get("nordic_ble.rssi")

                if source_address and rssi:
                    if source_address in address_rssi_counts:
                        address_rssi_counts[source_address]["count"] += 1
                        address_rssi_counts[source_address]["rssi"].append(int(rssi))
                    else:
                        address_rssi_counts[source_address] = {
                            "count": 1,
                            "rssi": [int(rssi)]
                        }
            except KeyError:
                continue

        address_rssi_list = [
            (address, data["count"], sum(data["rssi"]) / len(data["rssi"]))
            for address, data in address_rssi_counts.items()
        ]

        return address_rssi_list
    
    def output_source_addresses(self, json_file_path: str):
        if self.sniffer_mode == "tshark":
            self.output_source_addresses_via_tshark(json_file_path)
            return True
        
        if self.sniffer_mode == "bluetoothctl":
            self.output_source_addresses_via_blueoothctl()
            return True

        print("Sniffer mode has not been recognised.")

        return None
    
    def output_source_addresses_via_bluetoothctl(self):
        print("Extracting bluetooth Mac Addresses.")


    def output_source_addresses_via_tshark(self, json_file_path: str):
        """
            Processes source MAC addresses from JSON file and matches them with BLE device MAC addresses.

            :param json_file_path: File path to extracted tshark packets.
        """
        # Extract source addresses from the JSON file
        addresses = self.extract_addresses_and_rssi(json_file_path)
        
        # Use self.device_data directly
        ble_devices = self.device_data

        if not ble_devices:
            print("No BLE devices loaded.")
            return

        print("BLE Devices:")
        print([{device['mac_address']: device['device_name']} for device in ble_devices])

        print("\nSource Addresses:")
        matched_addresses = []

        # Convert BLE device MAC addresses to lowercase for case-insensitive matching
        ble_device_map = {device['mac_address'].lower(): device['device_name'] for device in ble_devices}

        for address, count, average_rssi in addresses:
            # Compare lowercase source address with BLE MAC addresses
            if address.lower() in ble_device_map:
                device_name = ble_device_map[address.lower()]
                matched_addresses.append((address, count, average_rssi, device_name))

            print(f"{address}: Count={count}, Average RSSI={average_rssi:.2f} dBm")

        # Display matches
        if matched_addresses:
            print("\nMatched Addresses:")
            for address, count, average_rssi, device_name in matched_addresses:
                print(f"{address} ({device_name}): Count={count}, Average RSSI={average_rssi:.2f} dBm")
            
            # Format the matched addresses for the email
            email_content = "\n".join(
                f"{address} ({device_name}): Count={count}, Average RSSI={average_rssi:.2f} dBm"
                for address, count, average_rssi, device_name in matched_addresses
            )
            send_email(f"Matched Addresses:\n{email_content}")
        else:
            print("\nNo BLE devices matched any source addresses.")


    def calculate_distance(self, rssi, tx_power):
        """
            Calculate the distance between the beacon and peripheral using RSSI.
            
            :param rssi: The received signal strength indicator (in dBm).
            :param tx_power: The measured signal strength at 1 meter (in dBm).
            
            Returns: Estimated distance in meters.
        """
        # # Example usage
        # rssi_value = -65  # Example RSSI value in dBm
        # tx_power_value = -59  # Example TX power in dBm (adjust as per your beacon specs)

        # distance = calculate_distance(rssi_value, tx_power_value)
        # print(f"Estimated distance: {distance:.2f} meters")

        if rssi == 0:
            return -1  # Cannot determine distance

        # Path-loss model for distance calculation
        ratio = rssi / tx_power
        if ratio < 1.0:
            return math.pow(10, ratio)
        else:
            return math.pow(10, (tx_power - rssi) / (10 * 2))