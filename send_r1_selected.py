import smtplib
import csv
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import time
import os

# ================= CONFIGURATION =================
SMTP_SERVER = "smtp.gmail.com"  
SMTP_PORT = 587
SENDER_EMAIL = "zephyr@ptuniv.edu.in"
APP_PASSWORD = "isyj zifr oihe ijsv" 

SUBJECT = "Congratulations! You're Selected for Round 2 - Zéphyr 2026"
HTML_TEMPLATE_PATH = "frontend/r1_selected_template.html"
RECIPIENTS_CSV_PATH = "selected_teams.csv" # Ensure this file has an 'email' column
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

    # Remove duplicates
    recipients = list(set(recipients))

    if not recipients:
        print("No valid emails found in recipients.csv")
        return

    print(f"Found {len(recipients)} unique recipients. Connecting to SMTP server...")

    # Chunk the recipients into groups of 50 to avoid SMTP BCC limits
    chunk_size = 50
    recipient_chunks = [recipients[i:i + chunk_size] for i in range(0, len(recipients), chunk_size)]

    try:
        # Connect to SMTP server
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SENDER_EMAIL, APP_PASSWORD)
        print("Successfully logged into SMTP server.")

        total_sent = 0

        for chunk_idx, chunk in enumerate(recipient_chunks):
            # Create a single email with multiple BCC recipients
            msg = MIMEMultipart()
            msg['From'] = f"ZÉPHYR 2026 <{SENDER_EMAIL}>"
            msg['To'] = SENDER_EMAIL 
            msg['Subject'] = SUBJECT

            # Attach HTML content
            msg.attach(MIMEText(html_content, 'html'))

            print(f"\nSending chunk {chunk_idx + 1}/{len(recipient_chunks)} ({len(chunk)} recipients)...")
            try:
                server.sendmail(SENDER_EMAIL, [SENDER_EMAIL] + chunk, msg.as_string())
                total_sent += len(chunk)
                print(f"Successfully sent chunk {chunk_idx + 1}.")
                
                # Sleep between chunks to avoid rate limiting
                if chunk_idx < len(recipient_chunks) - 1:
                    print("Waiting 5 seconds before sending next chunk...")
                    time.sleep(5)
            except Exception as e:
                print(f"Failed to send chunk {chunk_idx + 1}. Error: {e}")

        print(f"\nFinished! Sent {total_sent} out of {len(recipients)} emails.")
        
    except Exception as e:
        print(f"Failed to connect to SMTP server: {e}")
    finally:
        try:
            server.quit()
        except:
            pass

if __name__ == "__main__":
    main()
