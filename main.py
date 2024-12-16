from interfaces import *
from outputs import *
from sniffer import Sniffer

todays_date = get_current_date()

if __name__ == "__main__":
    interfaces = get_tshark_interfaces()
    interface_found = check_for_nrf_sniffer(interfaces)
    sniffer = Sniffer()

    if interface_found:
        print("nRF Sniffer for Bluetooth LE was found!")
        create_todays_directory()
        sniffer.run_tshark("COM5-4.4", todays_date)
    else:
        print("nRF Sniffer for Bluetooth LE was not found!")
        print("Exiting program!")
        exit()