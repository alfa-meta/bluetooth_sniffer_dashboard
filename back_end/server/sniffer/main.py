from interfaces import *
from outputs import *
from sniffer import Sniffer
from db import fetch_all_users, fetch_all_devices
import math
import sys

todays_date = ""
tx_power_dict: dict = {}


def estimate_tx_power(rssi, distance):
    """
        Estimate the Tx Power based on RSSI and known distance.
        This function is not needed in the main code base. But is used at the start of
        every project to estimate the power of your device.
        
        :param rssi: The received signal strength (in dBm).
        :param distance: The distance from the transmitter (in meters).
        :return: Estimated Tx Power (in dBm).
    """
    n = 2  # Path-loss exponent (can vary, use 2 for free space)
    tx_power = rssi + (10 * n * math.log10(distance))
    return tx_power

# Default values
DEFAULT_PACKETS = 100
DEFAULT_SCAN_TIME = 15

if __name__ == "__main__":
    sniffer_mode = "bluetoothctl"
    user_data = fetch_all_users()
    device_data = fetch_all_devices()
    interfaces = []  # get_tshark_interfaces()
    interface_found = check_for_nrf_sniffer(interfaces=interfaces, sniffer_mode=sniffer_mode)
    todays_date = str(get_current_date())

    # Read from arguments or use defaults
    try:
        packets = int(sys.argv[1])
        scan_time = int(sys.argv[2])
    except (IndexError, ValueError):
        packets = DEFAULT_PACKETS
        scan_time = DEFAULT_SCAN_TIME

    print(f"Sniffer received {packets} packets, and {scan_time} scan_time in seconds")

    sniffer = Sniffer(number_of_packets=packets, scan_time=scan_time,
                      user_data=user_data, device_data=device_data,
                      sniffer_mode=sniffer_mode)

    if interface_found:
        sniffer.output_source_addresses(f"outputs\\{todays_date}\\{todays_date}.json")
    else:
        print("nRF Sniffer for Bluetooth LE was not found!")
        print("Exiting program!")
        exit()
