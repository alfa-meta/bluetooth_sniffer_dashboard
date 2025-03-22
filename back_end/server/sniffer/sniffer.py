import subprocess
import time
import math
from datetime import datetime, timedelta
from email_sender import send_email, import_json_file
import sys
import os
from db import update_logs

sys.path.append(os.path.abspath(os.path.dirname(__file__)))


class Sniffer():
    def __init__(self, number_of_packets: int, user_data: list, device_data: list, sniffer_mode="tshark"):
        print("Initialising Sniffer Object")
        self.number_of_packets = str(number_of_packets)
        self.last_check = datetime.now()
        self.user_data: list = user_data
        self.device_data: list = device_data
        self.scan_time: int = 15
        self.sniffer_mode: str = sniffer_mode

        print(f"{len(user_data)} users found in the Database")
        print(f"{len(device_data)} devices found in the Database")

    def run_bluetoothctl(self):
        """
            This function interacts with the bluetoothctl command to scan for nearby Bluetooth devices,
            and returns the output as a string.
        """
        try:
            # Start the bluetoothctl process
            process = subprocess.Popen(
                ["bluetoothctl"],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            # Send commands to bluetoothctl
            commands = [
                "power on\n",
                "scan on\n",
            ]
            
            # Write commands to the process
            for command in commands:
                process.stdin.write(command)
                process.stdin.flush()
            
            print(f"Scanning for Bluetooth Devices for {self.scan_time} seconds.")
            # Allow time for scanning
            time.sleep(self.scan_time)
            
            # Turn off scanning and exit
            process.stdin.write("scan off\n")
            process.stdin.write("exit\n")
            process.stdin.flush()
            
            # Capture output and errors
            output, error = process.communicate()

            if error:
                raise RuntimeError(f"Error occurred: {error.strip()}")
            
            return output

        except Exception as e:
            return f"An error occurred: {str(e)}"

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
        if self.sniffer_mode == "bluetoothctl":
            output = self.run_bluetoothctl()
            self.compare_bluetoothctl_output(output)
            return True

        print("Sniffer mode has not been recognised.")

        return None

    def compare_bluetoothctl_output(self, bluetoothctl_output):
        """
            Compares the output of bluetoothctl with the list of known BLE devices.

            :param bluetoothctl_output: The output string from the bluetoothctl scan.
            :return: A list of matched devices, including their MAC address, device name, and signal strength (if available).
        """
        matched_devices = []
        lines = bluetoothctl_output.splitlines()
        scanned_devices = {}

        # Parse bluetoothctl output
        for line in lines:
            if "Device" in line:
                parts = line.split()
                if len(parts) >= 5:
                    mac_address = parts[3].strip()
                    device_name = " ".join(parts[4:]).strip()
                    scanned_devices[mac_address.lower()] = device_name
                    print(mac_address)

        # Build devices list for logs from scanned_devices
        formatted_devices_list = []
        for mac, name in scanned_devices.items():
            current_device = {
                "mac_address": mac,
                "device_name": name,
                "timestamp": time.time()
            }
            formatted_devices_list.append(current_device)
            
        # # Optionally check if this scanned device is in known devices
        # for device in self.device_data:
        #     if device['mac_address'].lower() == mac:
        #         matched_devices.append({
        #             "mac_address": mac,
        #             "device_name": device['device_name'],
        #             "scanned_device_name": name,
        #             "timestamp": time.time()
        #         })

        # Log and optionally email matched devices
        if matched_devices:
            print("Matched devices found:")
            for match in matched_devices:
                print(f"MAC: {match['mac_address']}, "
                    f"Known Name: {match['device_name']}, "
                    f"Scanned Name: {match['scanned_device_name']}")
            send_email(f"Matched Addresses:\n{matched_devices}")
        else:
            print("No matched devices found.")
        
        update_logs(device_list=formatted_devices_list)

        return matched_devices

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