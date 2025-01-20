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
    git clone <repository-url>
    cd ble_deanonymiser-main
    ```

2. Install the dependencies:
    ```bash
    pip install -r requirements.txt
    ```

3. Configure the tool using `config-example.json`. Rename it to `config.json` and update it with your desired settings:
    ```json
    {
        "email": {
            "smtp_server": "smtp.example.com",
            "port": 587,
            "username": "your-email@example.com",
            "password": "your-password"
        },
        "database": {
            "type": "sqlite",
            "name": "ble_data.db"
        }
    }
    ```

## Usage

### Start the Application

Run the main script to begin processing BLE data:
```bash
python main.py
```

### Correct `tshark` Command
To generate JSON and PCAP files for BLE data processing, use the following commands:
```bash
tshark -i <interface-name> -T json > output.json
```
Replace `<interface-name>` with your BLE interface (e.g., `COM5-4.4`).

### Example Workflow
1. Run the sniffer to capture BLE data.
2. Analyze captured data using the RSSI analyzer.
3. Store the processed data in the database.
4. Trigger email notifications based on specific thresholds or events.