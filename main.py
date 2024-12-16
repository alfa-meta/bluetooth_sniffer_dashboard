from interfaces import *
from outputs import *
from datetime import date

if __name__ == "__main__":
    interfaces = get_tshark_interfaces()
    interface_found = check_for_nrf_sniffer(interfaces)


    if interface_found:
        print("nRF Sniffer for Bluetooth LE was found!")
        today = date.today().strftime("%d-%m-%Y")
        directory = f"outputs\\{today}"
        ensure_directory_exists(directory)
        ## Check if outputs directory exists
        ## Make outputs directory
        ## Check if Todays date directory exists
        ## Make "Todays date directory"
    else:
        print("nRF Sniffer for Bluetooth LE was not found!")
        print("Exiting program!")
        exit()