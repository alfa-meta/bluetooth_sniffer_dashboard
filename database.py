import sqlite3
from datetime import datetime

def connect_db():
    return sqlite3.connect('outputs/devices.db')

def create_tables():
    conn = connect_db()
    cursor = conn.cursor()
    
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS user (
        uid INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL
    )
    ''')

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS device (
        mac_address TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        last_seen INTEGER NOT NULL,
        email TEXT NOT NULL,
        FOREIGN KEY (email) REFERENCES user(email)
    )
    ''')

    conn.commit()
    conn.close()

def create_device(mac_address, name, last_seen, email):
    conn = connect_db()
    cursor = conn.cursor()
    
    try:
        cursor.execute('''INSERT INTO device (mac_address, name, last_seen, email) VALUES (?, ?, ?, ?)''',
                       (mac_address, name, last_seen, email))
        conn.commit()
        print(f"Device with MAC Address {mac_address} added successfully.")
        print(mac_address, name, last_seen, email)
    except sqlite3.IntegrityError as e:
        print(f"Error: {e}")
    finally:
        conn.close()

def update_device(mac_address, name=None, last_seen=None, email=None):
    conn = connect_db()
    cursor = conn.cursor()
    
    fields = []
    values = []

    if name is not None:  # Allow empty strings
        fields.append("name = ?")
        values.append(name)
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


def delete_device(mac_address):
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

def add_user(name, email):
    conn = connect_db()
    cursor = conn.cursor()

    cursor.execute("SELECT email FROM user WHERE email = ?", (email,))
    if cursor.fetchone():
        print(f"User with email {email} already exists.")
        conn.close()
        return

    try:
        cursor.execute('''INSERT INTO user (name, email) VALUES (?, ?)''', (name, email))
        conn.commit()
        print(f"User {name} with email {email} added successfully.")
    except sqlite3.IntegrityError as e:
        print(f"Error: {e}")
    finally:
        conn.close()


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



def main():
    create_tables()

    # Example usage
    add_user("John Doe", "john.doe@example.com")
    create_device("AA:BB:CC:DD:EE:FF", "Device1", 0, "john.doe@example.com")
    update_device("AA:BB:CC:DD:EE:FF", name="")

if __name__ == "__main__":
    main()
    display_database()