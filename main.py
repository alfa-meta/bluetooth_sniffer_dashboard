from interfaces import *
from outputs import *
from sniffer import Sniffer
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
    interfaces = get_tshark_interfaces()
    interface_found = check_for_nrf_sniffer(interfaces)
    todays_date = str(get_current_date())
    sniffer = Sniffer(25)

    if interface_found:
        print("nRF Sniffer for Bluetooth LE was found!")
        create_todays_directory()
        sniffer.run_tshark("COM5-4.4", todays_date)
        sniffer.output_source_addresses(f"outputs\\{todays_date}\\{todays_date}"+".json")  
    else:
        print("nRF Sniffer for Bluetooth LE was not found!")
        print("Exiting program!")
        exit()