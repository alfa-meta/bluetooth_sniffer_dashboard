# BLE Deanonymiser

**BLE Deanonymiser** is a tool designed for analyzing and processing Bluetooth Low Energy (BLE) signals to identify and deanonymize devices. It offers features such as data collection, signal processing, and visualization.

---

## Features

- **Signal Processing**: Sniff and process BLE signals using `sniffer.py`.
- **Database Integration**: Manage device information using a lightweight SQLite database (`db.py`).
- **Email Notifications**: Send email alerts based on configured events (`email_sender.py`).
- **Custom Configuration**: Easily customizable via `config.json` and `config-example.json`.
- **Interfaces**: Modular and extendable interface definitions for hardware and software integration.
- **RSSI Analysis**: Perform analysis on received signal strength indicator (RSSI) values.
- **Output Management**: Export and manage processed data.

---

## Project Structure

- **`main.py`**: Entry point of the application.
- **`db.py`**: Manages interactions with the SQLite database.
- **`email_sender.py`**: Handles email notifications.
- **`interfaces.py`**: Defines modular interfaces for system components.
- **`outputs.py`**: Manages the generation of outputs and reports.
- **`sniffer.py`**: Sniffs BLE signals and extracts useful information.
- **`requirements.txt`**: Lists Python dependencies for the project.
- **`config.json` & `config-example.json`**: Configuration files for project setup.

---

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