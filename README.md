# BLE Deanonymiser

The BLE Deanonymiser is a Python-based tool designed to analyze and process Bluetooth Low Energy (BLE) data. It provides capabilities for sniffing BLE signals, analyzing their characteristics (e.g., RSSI), and generating outputs for further use. This tool can also send notifications via email and store data in a database for persistent storage.

## Features

- **BLE Sniffing**: Captures BLE packets and processes them for analysis.
- **RSSI Analysis**: Uses RSSI values to deduce insights from the BLE data.
- **Database Integration**: Stores processed data for future analysis.
- **Email Notifications**: Sends email alerts based on configurable conditions.
- **Extensible Interfaces**: Modular design allows easy integration with other systems.

## Project Structure

- `main.py`: Entry point of the application.
- `db.py`: Handles database-related operations such as storing and retrieving data.
- `sniffer.py`: Manages BLE sniffing and data capture.
- `email_sender.py`: Sends email notifications using configurable templates.
- `interfaces.py`: Defines system interfaces for modularity.
- `outputs.py`: Processes and formats output data.
- `requirements.txt`: Lists all Python dependencies required to run the project.
- `config-example.json`: A sample configuration file for setting up the tool.
- `rssi_values.txt`: Contains sample or pre-processed RSSI data.

## Prerequisites

- Python 3.8 or higher.
- `tshark` (Wireshark Command-Line Tool) installed and accessible in the system PATH.
- Internet access for email notifications (if configured).

## Installation

1. Clone the repository:
   ```bash
   git clone git@github.com:alfa-meta/ble_deanonymiser.git
   cd ble_deanonymiser

2. Install requirements (Not fully implemented):
    ```pip install -r requirements.txt```

3.  ```python main.py```




## TODO
1. Test timeouts for Smartphones.
2. Test BLE tracking devices such as the Xiaomi 