from interfaces import *
from outputs import *
from sniffer import Sniffer
from analyser import *

todays_date = ""

if __name__ == "__main__":
    interfaces = get_tshark_interfaces()
    interface_found = check_for_nrf_sniffer(interfaces)
    todays_date = get_current_date()
    sniffer = Sniffer()

    if interface_found:
        print("nRF Sniffer for Bluetooth LE was found!")
        create_todays_directory()
        sniffer.run_tshark("COM5-4.4", todays_date)
        output_source_addresses(f"outputs\\{todays_date}\\{todays_date}"+".json")
    else:
        print("nRF Sniffer for Bluetooth LE was not found!")
        print("Exiting program!")
        exit()