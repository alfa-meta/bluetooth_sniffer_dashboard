from interfaces import *
from outputs import *
from sniffer import Sniffer
from db import fetch_all_users, fetch_all_devices, fetch_all_logs
import math


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

if __name__ == "__main__":
    ## Make sure database exists before running this code
    sniffer_mode = "bluetoothctl"
    user_data = fetch_all_users()
    device_data = fetch_all_devices()
    logs_data = fetch_all_logs()
    interfaces = [] ##get_tshark_interfaces()
    interface_found = check_for_nrf_sniffer(interfaces=interfaces, sniffer_mode=sniffer_mode)
    todays_date = str(get_current_date())
    sniffer = Sniffer(100, user_data=user_data, device_data=device_data, sniffer_mode=sniffer_mode)

    if interface_found:
        print("nRF Sniffer for Bluetooth LE was found!")
        create_todays_directory()
        sniffer.output_source_addresses(f"outputs\\{todays_date}\\{todays_date}"+".json")  
    else:
        print("nRF Sniffer for Bluetooth LE was not found!")
        print("Exiting program!")
        exit()