import json
import os

def load_env_file(file_path):
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

def extract_source_addresses(json_file):
    with open(json_file, 'r') as file:
        data = json.load(file)

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

def output_source_addresses(json_file_path: str):
    # Extract source addresses from the JSON file
    addresses = extract_source_addresses(json_file_path)
    # Load BLE devices from the .env file
    env_file_path = '.env'
    ble_devices = load_env_file(env_file_path)

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
    else:
        print("\nNo BLE devices matched any source addresses.")
