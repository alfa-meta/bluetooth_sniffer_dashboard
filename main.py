from interfaces import *

if __name__ == "__main__":
    interfaces = get_tshark_interfaces()
    interface_found = check_for_nrf_sniffer(interfaces)
    if interface_found:
        print("nRF Sniffer for Bluetooth LE was found!")
    else:
        print("nRF Sniffer for Bluetooth LE was not found!")