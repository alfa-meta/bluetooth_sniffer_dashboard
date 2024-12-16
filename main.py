from interfaces import *
from outputs import *

todays_date = get_current_date()

if __name__ == "__main__":
    interfaces = get_tshark_interfaces()
    interface_found = check_for_nrf_sniffer(interfaces)


    if interface_found:
        print("nRF Sniffer for Bluetooth LE was found!")
        create_todays_directory()
    else:
        print("nRF Sniffer for Bluetooth LE was not found!")
        print("Exiting program!")
        exit()