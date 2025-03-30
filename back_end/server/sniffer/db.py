import os
import sqlite3
from datetime import datetime
import time

"""
    WORK IN PROGRESS. CURRENTLY NOT IN USE
"""


def connect_db():
    # Ensure the 'outputs' directory exists
    os.makedirs('outputs', exist_ok=True)
    
    # Connect to the database (creates the file if it doesn't exist)
    conn = sqlite3.connect('outputs/devices.db')
    
    # Enable foreign keys in sqlite
    conn.execute("PRAGMA foreign_keys = ON")
    
    return conn

def create_tables():
    conn = connect_db()
    cursor = conn.cursor()
    
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS user (
        uid INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL
    )
    ''')

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS device (
        mac_address TEXT PRIMARY KEY,
        device_vendor TEXT,
        device_name TEXT NOT NULL,
        date_added INTEGER NOT NULL,
        email TEXT NOT NULL,
        FOREIGN KEY (email) REFERENCES user(email)
    )
    ''')

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS logs (
        mac_address TEXT PRIMARY KEY,
        device_vendor TEXT,
        target_device BOOLEAN DEFAULT FALSE,
        first_seen INTEGER NOT NULL,
        last_seen INTEGER NOT NULL,
        count INTEGER NOT NULL,
        scan_number INTEGER NOT NULL,
        FOREIGN KEY (mac_address) REFERENCES device(mac_address)
    )
    ''')

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS device_vendor (
        mac_address_prefix TEXT PRIMARY KEY,
        vendor_name TEXT NOT NULL
    )
    ''')

    conn.commit()
    conn.close()




###### Device ###########

def create_device(mac_address: str, device_vendor: str, device_name: str, date_added: int, email: str):
    conn = connect_db()
    cursor = conn.cursor()
    
    try:
        cursor.execute('''INSERT INTO device (mac_address, device_vendor, device_name, date_added, email)
                          VALUES (?, ?, ?, ?, ?)''',
                       (mac_address, device_vendor, device_name, date_added, email))
        conn.commit()
        print(f"Device with MAC Address {mac_address} added successfully.")
        print(mac_address, device_vendor, device_name, date_added, email)
    except sqlite3.IntegrityError as e:
        if "FOREIGN KEY constraint failed" in str(e):
            print(f"Error: The email '{email}' does not exist in the Users table.")
        else:
            print(f"Error: {e}")
    finally:
        conn.close()


def update_device(mac_address: str, device_vendor=None, device_name=None, date_added=None, email=None):
    conn = connect_db()
    cursor = conn.cursor()
    
    fields: list = []
    values: list = []

    if device_vendor is not None:
        fields.append("device_vendor = ?")
        values.append(device_vendor)
    if device_name is not None:
        fields.append("device_name = ?")
        values.append(device_name)
    if date_added is not None:
        fields.append("date_added = ?")
        values.append(date_added)
    if email is not None:
        fields.append("email = ?")
        values.append(email)

    if not fields:
        print("No fields to update.")
        conn.close()
        return

    values.append(mac_address)

    try:
        cursor.execute(f"UPDATE device SET {', '.join(fields)} WHERE mac_address = ?", values)
        conn.commit()
        print(f"Device with MAC Address {mac_address} updated successfully.")
    except sqlite3.IntegrityError as e:
        print(f"Error: {e}")
    finally:
        conn.close()


def delete_device(mac_address: str):
    conn = connect_db()
    cursor = conn.cursor()

    cursor.execute("SELECT mac_address FROM device WHERE mac_address = ?", (mac_address,))
    if not cursor.fetchone():
        print(f"No device found with MAC Address {mac_address}.")
        conn.close()
        return

    cursor.execute("DELETE FROM device WHERE mac_address = ?", (mac_address,))
    conn.commit()
    print(f"Device with MAC Address {mac_address} deleted successfully.")
    conn.close()


def fetch_all_devices():
    conn = connect_db()
    cursor = conn.cursor()

    print("Fetching all Devices from device")
    
    cursor.execute("SELECT * FROM device")
    devices = cursor.fetchall()
    device_list = []

    if devices:
        for device in devices:
            print(device)
            device_list.append({
                "mac_address": device[0],
                "device_vendor": device[1],
                "device_name": device[2],
                "date_added": device[3],
                "email": device[4]
            })

    conn.close()
    return device_list


###### User ###########

def add_user(username: str, password: str, email: str):
    conn = connect_db()
    cursor = conn.cursor()

    cursor.execute("SELECT email FROM user WHERE email = ?", (email,))
    if cursor.fetchone():
        print(f"User with email {email} already exists.")
        conn.close()
        return

    try:
        cursor.execute('''INSERT INTO user (username, password, email) VALUES (?, ?, ?)''', (username, password, email))
        conn.commit()
        print(f"User {username} with email {email} added successfully.")
    except sqlite3.IntegrityError as e:
        print(f"Error: {e}")
    finally:
        conn.close()

def fetch_all_users():
    conn = connect_db()
    cursor = conn.cursor()

    print("Fetching all Users from user table...")
    
    cursor.execute("SELECT * FROM user")
    users = cursor.fetchall()
    user_list = []

    if users:
        for user in users:
            user_list.append({
                "uid": user[0],
                "username": user[1],
                "password": user[2],
                "email": user[3]
            })

    conn.close()
    return user_list

def display_all_users():
    conn = connect_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM user")
    users = cursor.fetchall()
    if users:
        print("All Users:")
        for user in users:
            print(f"uid: {user[0]}, username: {user[1]}, email: {user[3]}")
    else:
        print("No users found.")

    conn.close()

def query_user_data_by_email(email: str):
    conn = connect_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM user WHERE email = ?", (email,))
    user = cursor.fetchone()
    if not user:
        print(f"No user found with email '{email}'.")
        conn.close()
        return None  # Return None if no user found

    user_dict = {
        "uid": user[0],
        "username": user[1],
        "password": user[2],
        "email": user[3]
    }

    conn.close()
    return user_dict

###### Logs ############

def update_logs(device_list: list):
    conn = connect_db()
    cursor = conn.cursor()

    cursor.execute("SELECT MAX(scan_number) FROM logs")
    result = cursor.fetchone()[0]
    new_scan_number = (result if result is not None else 0) + 1

    current_time = int(time.time())
    for device in device_list:
        mac = device.get("mac_address")
        
        # 1. Try to get vendor from device table
        cursor.execute("SELECT device_vendor FROM device WHERE mac_address = ?", (mac,))
        result = cursor.fetchone()
        if result and result[0]:
            device_vendor = result[0]
        else:
            # 2. Try to get vendor from device_vendor table
            mac_prefix = mac[:8].upper()
            cursor.execute("SELECT vendor_name FROM device_vendor WHERE mac_address_prefix = ?", (mac_prefix,))
            result = cursor.fetchone()
            device_vendor = result[0] if result else device.get("device_vendor", "Unknown")

        cursor.execute("SELECT 1 FROM device WHERE mac_address = ?", (mac,))
        target_device = 1 if cursor.fetchone() else 0

        cursor.execute("SELECT count FROM logs WHERE mac_address = ?", (mac,))
        row = cursor.fetchone()
        if row:
            new_count = row[0] + 1
            cursor.execute("""
                UPDATE logs 
                SET last_seen = ?, count = ?, scan_number = ?, target_device = ?, device_vendor = ?
                WHERE mac_address = ?
            """, (current_time, new_count, new_scan_number, target_device, device_vendor, mac))
        else:
            cursor.execute("""
                INSERT INTO logs (mac_address, device_vendor, target_device, first_seen, last_seen, count, scan_number) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (mac, device_vendor, target_device, current_time, current_time, 1, new_scan_number))

    print(f"Logs were updated at {datetime.now()}")
    conn.commit()
    conn.close()





###### Logs ############

###### Device Vendor ###

def get_logs_with_vendor():
    conn = connect_db()
    cursor = conn.cursor()

    cursor.execute('''
        SELECT 
            logs.mac_address,
            COALESCE(device_vendor.vendor_name, 'Unknown') AS vendor_name,
            logs.first_seen,
            logs.last_seen,
            logs.count,
            logs.scan_number
        FROM logs
        LEFT JOIN device_vendor
        ON logs.mac_address LIKE device_vendor.mac_address_prefix || '%'
    ''')

    results = cursor.fetchall()
    conn.close()
    return results


###### Device Vendor ###
def display_database():
    conn = connect_db()
    cursor = conn.cursor()

    print("Users Table:")
    cursor.execute("SELECT * FROM user")
    users = cursor.fetchall()
    if users:
        for user in users:
            print(user)
    else:
        print("No users found.")

    print("\nDevices Table:")
    cursor.execute("SELECT * FROM device")
    devices = cursor.fetchall()
    if devices:
        for device in devices:
            print(device)
    else:
        print("No devices found.")
    conn.close()



## Example usage

# def main():
#     create_tables()

#     add_user(username="Administrator", password="nRF52840", email="example@examplemail.com")  # Default Credentials
#     default_user = query_user_data_by_email("example@examplemail.com")  # Correct email used here
    
#     if default_user:  # Ensure default_user is not None before proceeding
#         create_device(mac_address="AA:BB:CC:DD:EE:FF", device_name="Device1", last_seen=0, email="john.doe@example.com")
#         create_device(mac_address="AA:BB:CC:11:22:33", device_name="TestDevice1", last_seen=0, email=default_user["email"])
#         update_device(mac_address="AA:BB:CC:DD:EE:FF", device_name="")
#     else:
#         print("Default user not found; aborting further operations.")

# if __name__ == "__main__":
#     main()
#     display_database()