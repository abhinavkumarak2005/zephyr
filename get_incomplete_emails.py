import urllib.request
import json
import csv
import ssl

# Bypass SSL verification for macOS python
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

URL = "https://duoctfpncojorbsnehrc.supabase.co/rest/v1/teams?select=id,presentation_link,team_members(email)&or=(presentation_link.is.null,presentation_link.eq.)&limit=2000"
API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1b2N0ZnBuY29qb3Jic25laHJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwMjgwOTQsImV4cCI6MjEwNTYwNDA5NH0.KRBhe8YMPKHfwP8us1K1HPuoTF9HpuOjkOYK1Wd_gjk"

try:
    req = urllib.request.Request(URL)
    req.add_header('apikey', API_KEY)
    req.add_header('Authorization', f'Bearer {API_KEY}')

    with urllib.request.urlopen(req, context=ctx) as response:
        data = json.loads(response.read().decode('utf-8'))

    emails = []
    for team in data:
        for member in team.get('team_members', []):
            if member.get('email'):
                emails.append(member['email'].strip())

    emails = list(set(emails))
    
    with open("missing_ppt_emails.csv", "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["email"])
        for email in emails:
            writer.writerow([email])

    print(f"Successfully extracted {len(emails)} unique emails to missing_ppt_emails.csv")
except Exception as e:
    print(f"Error: {e}")
