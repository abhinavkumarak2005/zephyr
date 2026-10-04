import smtplib
import csv
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
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
SUBJECT = "Request for Support: Promoting ZÉPHYR 2026 - National Level AI Hackathon"
HTML_TEMPLATE_PATH = "frontend/faculty_promotion_template.html"
RECIPIENTS_CSV_PATH = "test.csv"
POSTER_PATH = "ZEPHYR POSTER.pdf"
# =================================================

def main():
    if not os.path.exists(HTML_TEMPLATE_PATH):
        print(f"Error: HTML template not found at {HTML_TEMPLATE_PATH}")
        print("Please create the HTML template for faculty promotion.")
        return
        
    if not os.path.exists(RECIPIENTS_CSV_PATH):
        print(f"Error: Recipients CSV not found at {RECIPIENTS_CSV_PATH}. Please create one with an 'email' column.")
        return

    if not os.path.exists(POSTER_PATH):
        print(f"Warning: Poster not found at '{POSTER_PATH}'. Emails will be sent without the attachment.")

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

    print(f"Found {len(recipients)} faculty recipients. Connecting to SMTP server...")

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
            msg["Subject"] = SUBJECT

            # Attach HTML content
            msg.attach(MIMEText(html_content, "html"))

            # Attach the poster if it exists
            if os.path.exists(POSTER_PATH):
                with open(POSTER_PATH, "rb") as attachment:
                    part = MIMEBase("application", "octet-stream")
                    part.set_payload(attachment.read())
                
                # Encode file in ASCII characters to send by email    
                encoders.encode_base64(part)
                
                # Add header as key/value pair to attachment part
                part.add_header(
                    "Content-Disposition",
                    f"attachment; filename=ZEPHYR_POSTER.pdf",
                )
                msg.attach(part)

            # Send email via BCC
            server.sendmail(SENDER_EMAIL, [SENDER_EMAIL] + chunk, msg.as_string())
            
            # Small delay between chunks
            time.sleep(1) 

        server.quit()
        print("\n✅ All faculty promotion emails sent successfully!")

    except Exception as e:
        print(f"\n❌ Failed to send emails: {e}")

if __name__ == "__main__":
    main()