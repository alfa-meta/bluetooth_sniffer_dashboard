import subprocess
import os
import math
from datetime import datetime, timedelta
from email_sender import send_email, import_json_file

class Sniffer():
    def __init__(self, number_of_packets: int):
        self.number_of_packets = str(number_of_packets)
        self.last_check = datetime.now()

        print("Initialising Sniffer Object")

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
        # Define the time of the last check
        last_check_time = self.last_check - timedelta(minutes=3)

        # Check if 3 minutes have passed
        time_elapsed = self.last_check - last_check_time
        three_minutes_passed = time_elapsed >= timedelta(minutes=3)

        if three_minutes_passed == False:
            self.last_check = datetime.now()

        return three_minutes_passed

    def load_env_file(self, file_path):
        """
            Load the .env file and extract BLE device information.
        """
        if not os.path.exists(file_path):
            print(f"File not found: {file_path}")
            return None

        ble_devices = {}
        with open(file_path, 'r') as file:
            for line in file:
                # Ignore empty lines or comments
                if line.strip() and not line.strip().startswith('#'):
                    key, value = line.split('=', 1)
                    key = key.strip()
                    value, *comment = value.split('#', 1)
                    value = value.strip().strip('"').strip("'")  # Clean quotes if present
                    ble_devices[key] = value
        
        return ble_devices

    def extract_addresses_and_rssi(self, json_file):
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
        # Extract source addresses from the JSON file
        addresses = self.extract_addresses_and_rssi(json_file_path)
        # Load BLE devices from the .env file
        env_file_path = '.env'
        ble_devices = self.load_env_file(env_file_path)

        if not ble_devices:
            print("No BLE devices loaded from .env file.")
            return

        print("BLE Devices:")
        print(ble_devices)

        print("\nSource Addresses:")
        matched_addresses = []

        # Convert BLE device addresses to lowercase for case-insensitive matching
        ble_device_addresses = {key: value.lower() for key, value in ble_devices.items()}

        for address, count, average_rssi in addresses:
            # Compare lowercase source address with BLE device addresses
            if address.lower() in ble_device_addresses.values():
                matched_addresses.append((address, count, average_rssi))

            print(f"{address}: Count={count}, Average RSSI={average_rssi:.2f} dBm")

        # Display matches
        if matched_addresses:
            print("\nMatched Addresses:")
            for address, count, average_rssi in matched_addresses:
                print(f"{address}: Count={count}, Average RSSI={average_rssi:.2f} dBm")
            send_email(f"Matched Addresses:\n    {matched_addresses}")
        else:
            print("\nNo BLE devices matched any source addresses.")

    def calculate_distance(self, rssi, tx_power):
        """
        Calculate the distance between the beacon and peripheral using RSSI.
        
        :param rssi: The received signal strength indicator (in dBm).
        :param tx_power: The measured signal strength at 1 meter (in dBm).
        :return: Estimated distance in meters.
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