import json

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
    addresses = extract_source_addresses(json_file_path)

    print("Source Addresses:")
    for address in addresses:
        print(address)
