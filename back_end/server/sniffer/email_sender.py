import smtplib
import json
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def import_json_file(path: str):
    # Load the JSON file
    with open(path, 'r') as file:
        data = json.load(file)

    return data


def send_email(text: str, email=None):
    ## TODO make it work with multiple emails

    data = import_json_file(path='config.json')
    # Email details
    # Extract username and password
    sender_email = data.get('username')
    if email == None:
        receiver_email = data.get('receiver')
    else:
        receiver_email = email
    password = data.get('password')
    websocket = data.get('websocket_connected')

    if websocket == False:
        raise ValueError("Websocket was closed in email sender")


    subject = "Bluetooth Sniffer Dashboard Notification"
    body = f"Target device is within the vicinity.\n\n{text} \n\n\nBluetooth Sniffer Dashboard Notification via Bluetooth Sniffer"

    # Create the email
    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = receiver_email
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'plain'))

    # Send the email
    try:
        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.ehlo()
            server.starttls()
            server.login(sender_email, password)
            server.sendmail(sender_email, receiver_email, msg.as_string())
        print(f"Email sent to {receiver_email} successfully!")
    except Exception as e:
        print(f"Error: {e}")