import smtplib
import csv
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import time
import os

# ================= CONFIGURATION =================
# Your email credentials
SMTP_SERVER = "smtp.gmail.com"  # Change to smtp.office365.com if PTU uses Microsoft Outlook
SMTP_PORT = 587
SENDER_EMAIL = "zephyr@ptuniv.edu.in"
# You CANNOT use your normal password here. You MUST generate an "App Password".
# For Google: Go to Google Account Settings -> Security -> 2-Step Verification -> App Passwords
APP_PASSWORD = "isyj zifr oihe ijsv" 

SUBJECT = "URGENT ACTION REQUIRED: Reminder to Submit Your PPT for ZÉPHYR 2026"
HTML_TEMPLATE_PATH = "frontend/reminder_email_template.html"
RECIPIENTS_CSV_PATH = "test.csv"
# =================================================

def main():
    if not os.path.exists(HTML_TEMPLATE_PATH):
        print(f"Error: HTML template not found at {HTML_TEMPLATE_PATH}")
        return
        
    if not os.path.exists(RECIPIENTS_CSV_PATH):
        print(f"Error: Recipients CSV not found at {RECIPIENTS_CSV_PATH}. Please create one with an 'email' column.")
        return

    # Read the HTML template
    with open(HTML_TEMPLATE_PATH, "r", encoding="utf-8") as f:
        html_content = f.read()

    # Read recipients
    recipients = []
    with open(RECIPIENTS_CSV_PATH, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            if "email" in row and row["email"].strip():
                recipients.append(row["email"].strip())

    if not recipients:
        print(f"No valid emails found in {RECIPIENTS_CSV_PATH}")
        return

    print(f"Found {len(recipients)} recipients. Connecting to SMTP server...")

    # Chunk the recipients into groups of 50 to avoid SMTP BCC limits
    chunk_size = 50
    recipient_chunks = [recipients[i:i + chunk_size] for i in range(0, len(recipients), chunk_size)]

    try:
        # Connect to SMTP Server
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SENDER_EMAIL, APP_PASSWORD)
        print("Successfully logged in!")

        for i, chunk in enumerate(recipient_chunks):
            print(f"Sending chunk {i+1}/{len(recipient_chunks)} ({len(chunk)} recipients)...")
            
            # Create the email message
            msg = MIMEMultipart()
            msg["From"] = f"Zephyr Hackathon <{SENDER_EMAIL}>"
            msg["To"] = SENDER_EMAIL  # Send to yourself
            # smtplib handles the actual BCC delivery implicitly via sendmail args
            
            msg["Subject"] = SUBJECT

            # Attach HTML content
            msg.attach(MIMEText(html_content, "html"))

            # Send email
            server.sendmail(SENDER_EMAIL, [SENDER_EMAIL] + chunk, msg.as_string())
            
            # Small delay between chunks
            time.sleep(1) 

        server.quit()
        print("\n✅ All reminder emails sent successfully!")

    except Exception as e:
        print(f"\n❌ Failed to send emails: {e}")

if __name__ == "__main__":
    main()
