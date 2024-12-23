import smtplib
import json
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


# # Load the HTML content from a file
# html_file_path = 'index.html'
# with open(html_file_path, 'r') as file:
#     html_content = file.read()

def import_json_file(path: str):
    # Load the JSON file
    with open(path, 'r') as file:
        data = json.load(file)

    return data


def send_email(text: str):

    data = import_json_file(path='config.json')
    # Email details
    # Extract username and password
    sender_email = data.get('username')
    receiver_email = data.get('receiver')
    password = data.get('password')
    subject = "BLE-Notification"
    body = f"{text} \nBle-Notification by Striker"

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
        print("Email sent successfully!")
    except Exception as e:
        print(f"Error: {e}")