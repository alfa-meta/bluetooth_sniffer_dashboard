import subprocess

def get_tshark_interfaces():
    """
    Get a list of available interfaces from tshark.
    
    Returns:
        list: A list of dictionaries, each containing interface name and description.
    """
    try:
        # Run the tshark command to list interfaces
        result = subprocess.run(
            ["tshark", "-D"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        # Check for errors
        if result.returncode != 0:
            print(f"Error running tshark: {result.stderr.strip()}")
            return []
        
        # Parse the output
        interfaces = []
        for line in result.stdout.splitlines():
            # Format: "1. <interface name> (<description>)"
            parts = line.split('.', 1)
            if len(parts) == 2:
                index = parts[0].strip()
                details = parts[1].strip()
                if '(' in details and ')' in details:
                    name, description = details.rsplit('(', 1)
                    description = description.strip(')')
                else:
                    name, description = details, "No description available"
                interfaces.append({
                    "index": index,
                    "name": name.strip(),
                    "description": description.strip()
                })
        
        return interfaces
    except FileNotFoundError:
        print("Tshark is not installed or not found in the system PATH.")
        return []
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return []
    
def check_for_nrf_sniffer(interfaces: list):
    """
        check_for_nrf_sniffer checks all the interfaces received by the 
        interfaces list. And checks for COM5-4.4 if it exists then it returns 
        a True Boolean. Otherwise returns False.

        :param interfaces: list of all interfaces found by tshark.

        Returns:
            boolean: a boolean value based on whether or not nRF sniffer was found
    """
    sniffer_boolean = False
    if interfaces:
        for interface in interfaces:
            #print(f"{interface['index']}. {interface['name']} - {interface['description']}")
            if interface['name'] == 'COM5-4.4':
                sniffer_boolean = True
    else:
        print("No interfaces found or unable to retrieve interfaces.")

    return sniffer_boolean