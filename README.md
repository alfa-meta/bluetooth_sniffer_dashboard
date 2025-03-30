# Bluetooh Sniffer Dashboard

## Overview

Bluetooh Sniffer Dashboard is a tool designed to analyze and identify Bluetooth Low Energy (BLE) devices by extracting and processing relevant data. It helps security researchers and developers understand BLE device and user behaviours.

## Features

- Captures and processes BLE advertising packets
- Identifies unique BLE devices
- Provides insights into potential privacy risks
- Frontend interface for visualization

## Installation

- ** NOTE: Linux ONLY as of 30/03/2025

### Prerequisites

- **Node.js and npm** (for frontend)
- **Python 3** (for backend, if applicable)
- **Required dependencies** (install with `npm install` and `pip install -r requirements.txt` if Python is used)

### Setup

1. **Clone the repository:**
   ```sh
   git clone https://github.com/alfa-meta/bluetooth_sniffer_dashboard.git
   cd bluetooth_sniffer_dashboard
   ```
2. **Install frontend dependencies:**
   ```sh
   cd front_end
   npm install
   ```
3. **Install backend dependencies:**
   ```sh
   cd ../backend
   python3 -m venv venv
   source venv/bin/activate ## Linux & Mac
   .\\venv\\Scripts\\Activate.ps1 # Windows Powershell
   venv\\Scripts\\activate # Windows Command-line
   pip install -r requirements.txt
   ```

## Usage

### Running the Frontend

```sh
cd front_end
npm start
```

### Running the Backend

```sh
cd backend
python main.py
```

## Contributing

Feel free to submit issues and pull requests to improve the project.

## License

This project is licensed under the **MIT License**.

