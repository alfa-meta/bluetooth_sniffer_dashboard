import os
import sqlite3
from datetime import datetime


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
        device_name TEXT NOT NULL,
        last_seen INTEGER NOT NULL,
        email TEXT NOT NULL,
        FOREIGN KEY (email) REFERENCES user(email) ON DELETE CASCADE
    )
    ''')

    conn.commit()
    conn.close()


###### Device ###########

def create_device(mac_address: str, device_name: str, last_seen: int, email: str):
    conn = connect_db()
    cursor = conn.cursor()
    
    try:
        cursor.execute('''INSERT INTO device (mac_address, device_name, last_seen, email) VALUES (?, ?, ?, ?)''',
                       (mac_address, device_name, last_seen, email))
        conn.commit()
        print(f"Device with MAC Address {mac_address} added successfully.")
        print(mac_address, device_name, last_seen, email)
    except sqlite3.IntegrityError as e:
        if "FOREIGN KEY constraint failed" in str(e):
            print(f"Error: The email '{email}' does not exist in the Users table.")
        else:
            print(f"Error: {e}")
    finally:
        conn.close()

def update_device(mac_address: str, device_name=None, last_seen=None, email=None):
    conn = connect_db()
    cursor = conn.cursor()
    
    fields: list = []
    values: list = []

    if device_name is not None:  # Allow empty strings
        fields.append("device_name = ?")
        values.append(device_name)
    if last_seen is not None:
        fields.append("last_seen = ?")
        values.append(last_seen)
    if email is not None:
        fields.append("email = ?")
        values.append(email)

    if not fields:  # No fields to update
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

    cursor.execute('''DELETE FROM device WHERE mac_address = ?''', (mac_address,))
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
                "device_name": device[1], 
                "last_seen": device[2], 
                "email": device[3]
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
            print(user)
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

def fetch_all_logs():
    conn = connect_db()
    cursor = conn.cursor()

    print("Fetching all Logs from logs")
    
    cursor.execute("SELECT * FROM logs")
    logs = cursor.fetchall()
    logs_list = []

    if logs_list:
        for log in logs_list:
            print(log)
            logs_list.append({
                "mac_address": log[0],
                "first_seen": log[1], 
                "last_seen": log[2],
                "count": log[3],
                "scan_number": log[4]
            })

    conn.close()
    return logs_list

###### Logs ############

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