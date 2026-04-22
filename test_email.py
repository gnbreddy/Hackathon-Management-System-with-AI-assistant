import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import sys

def send_test_email(sender_email, app_password, receiver_email):
    # Gmail SMTP settings
    smtp_server = "smtp.gmail.com"
    smtp_port = 587

    # Create the email
    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = receiver_email
    msg['Subject'] = "EHub — Standalone SMTP Test"

    body = f"""
    Hello! 
    
    This is a standalone test of your Gmail SMTP configuration for EHub.
    If you received this, your credentials are correct!
    
    Sender: {sender_email}
    """
    msg.attach(MIMEText(body, 'plain'))

    try:
        # Connect to server and send email
        print(f"Connecting to {smtp_server}...")
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()  # Secure the connection
        print("Logging in...")
        server.login(sender_email, app_password)
        print("Sending email...")
        server.send_message(msg)
        server.quit()
        print("\nSUCCESS! Test email sent.")
    except Exception as e:
        print(f"\nFAILURE: {str(e)}")
        print("\nCommon issues:")
        print("1. Incorrect Gmail Address or App Password.")
        print("2. 'App Passwords' not enabled in Google Account.")
        print("3. Check for 2-Factor Authentication requirement.")

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python test_email.py <your_gmail> <app_password> <receiver_email>")
    else:
        send_test_email(sys.argv[1], sys.argv[2], sys.argv[3])
