import smtplib
import json
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


# # Load the HTML content from a file
# html_file_path = 'index.html'
# with open(html_file_path, 'r') as file:
#     html_content = file.read()

# Load the JSON file
json_file_path = 'config.json'
with open(json_file_path, 'r') as file:
    data = json.load(file)

# Email details
# Extract username and password
sender_email = data.get('username')
receiver_email = data.get('receiver')
password = data.get('password')
subject = "BLE-Notification"
body = "This is a test email sent from Python. \nBle-Notification by Striker"

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
        server.set_debuglevel(1)  # Enable debug output
        server.starttls()
        server.login(sender_email, password)
        server.sendmail(sender_email, receiver_email, msg.as_string())
    print("Email sent successfully!")
except Exception as e:
    print(f"Error: {e}")
