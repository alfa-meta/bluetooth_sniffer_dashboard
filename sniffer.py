import subprocess
import os
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

    def extract_source_addresses(self, json_file):
        data = import_json_file(path=json_file)
        source_address_counts = {}

        for packet in data:
            try:
                layers = packet["_source"]["layers"]
                btle_layer = layers.get("btle", {})
                source_address = btle_layer.get("btle.advertising_address")
                if source_address:
                    if source_address in source_address_counts:
                        source_address_counts[source_address] += 1
                    else:
                        source_address_counts[source_address] = 1
            except KeyError:
                continue

        source_address_list = [(address, count) for address, count in source_address_counts.items()]

        return source_address_list

    def output_source_addresses(self, json_file_path: str):
        # Extract source addresses from the JSON file
        addresses = self.extract_source_addresses(json_file_path)
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

        for address, count in addresses:
            # Compare lowercase source address with BLE device addresses
            if address.lower() in ble_device_addresses.values():
                matched_addresses.append((address, count))

            print(f"{address}: {count}")

        # Display matches
        if matched_addresses:
            print("\nMatched Addresses:")
            for address, count in matched_addresses:
                print(f"{address}: {count}")
            send_email(f"Matched Addresses:\n    {matched_addresses}")
        else:
            print("\nNo BLE devices matched any source addresses.")