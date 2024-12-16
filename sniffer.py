import subprocess

class Sniffer():
    def __init__(self):
        print("Initialising Sniffer Object")

    def run_tshark(self, input_interface, output_json):
        """
        Run the tshark command and stream the output into a JSON file.
        
        :param input_interface: The input interface (e.g., 'COM5-4.4').
        :param output_json: The name of the output JSON file (e.g., 'output.json').
        """
        # Construct the tshark command
        command = [
            "tshark",
            "-i", input_interface,  # Input interface
            "-T", "json",            # Output in JSON format
            "-c", "200"
        ]
        
        try:
            # Open the output file and run the tshark command, streaming output to the file
            with open("outputs\\" + output_json + "\\" + output_json + ".json", "w") as output_file:
                subprocess.run(command, stdout=output_file, check=True)
        except subprocess.CalledProcessError as e:
            print(f"Error running tshark: {e}")
        except FileNotFoundError:
            print("Tshark is not installed or not found in the PATH.")
