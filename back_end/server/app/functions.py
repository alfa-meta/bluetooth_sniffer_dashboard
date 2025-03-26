import json
import requests

def import_json_file(path: str):
    # Load the JSON file
    with open(path, 'r') as file:
        data = json.load(file)

    return data


def get_websocket_connected(path: str):
    # Load the current JSON data
    data = import_json_file(path)
    
    # Return the value for 'websocket_connected'
    return data.get("websocket_connected")

def set_websocket_connected(path: str, value: bool):
    # Load the current JSON data
    data = import_json_file(path)
    
    # Set the new value for websocket_connected
    data["websocket_connected"] = value
    
    # Write the updated data back to the file
    with open(path, 'w') as file:
        json.dump(data, file, indent=4)


def query_mac_vendors_api(mac_address: str) -> str:
    url = f"https://api.macvendors.com/{mac_address}"
    response = requests.get(url)
    return response.text if response.status_code == 200 else "Vendor not found"