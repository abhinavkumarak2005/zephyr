import os
from reportlab.lib.pagesizes import A4, landscape
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from supabase import create_client, Client
from dotenv import load_dotenv

# Load env variables from frontend/.env
load_dotenv('frontend/.env')

url = os.environ.get("VITE_SUPABASE_URL")
key = os.environ.get("VITE_SUPABASE_ANON_KEY")

if not url or not key:
    print("Error: Supabase credentials not found in frontend/.env")
    exit(1)

supabase: Client = create_client(url, key)

# Fetch all Round 1 teams
response = supabase.table('teams').select('team_name').eq('current_round', 1).order('team_name').execute()
teams = response.data

if not teams:
    print("No teams found in Round 1.")
    # Fallback to generating some blank rows if no teams
    teams = [{'team_name': f'Team {i+1}'} for i in range(30)]

print(f"Generating PDF for {len(teams)} teams...")

pdf_file = "Judging_Criteria_Sheet.pdf"
doc = SimpleDocTemplate(pdf_file, pagesize=landscape(A4), leftMargin=20, rightMargin=20, topMargin=30, bottomMargin=30)
elements = []

styles = getSampleStyleSheet()
title_style = styles['Heading1']
title_style.alignment = 1

elements.append(Paragraph("Zéphyr Hackathon 2026 - Judging Evaluation Sheet", title_style))
elements.append(Spacer(1, 20))

# Criteria
criterias = [
    "Problem Relevance\n& Clarity",
    "Innovation\n& Originality",
    "Solution Approach &\nTechnical Feasibility",
    "Impact &\nScalability",
    "User-Centricity\n& Usability"
]

header = ["Team Name"] + [f"{c}\n(1-5)" for c in criterias] + ["Total Result\n(Tick One)"]

# Group teams into chunks of 10
chunk_size = 10
for i in range(0, len(teams), chunk_size):
    chunk = teams[i:i+chunk_size]
    
    data = [header]
    for team in chunk:
        row = [team['team_name']]
        # 5 criterias (blank boxes for 1-5)
        for _ in range(5):
            row.append("[1] [2] [3] [4] [5]")
        # Total Result
        row.append("[] Selected\n[] Not Selected")
        data.append(row)
        
    t = Table(data, colWidths=[130] + [85]*5 + [100])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#e2e8f0')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.HexColor('#0f172a')),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ALIGN', (0,1), (0,-1), 'LEFT'), # Left align team names
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 10),
        ('BOTTOMPADDING', (0,0), (-1,0), 12),
        ('TOPPADDING', (0,0), (-1,0), 12),
        ('GRID', (0,0), (-1,-1), 1, colors.black),
        ('FONTNAME', (0,1), (-1,-1), 'Helvetica'),
        ('FONTSIZE', (0,1), (-1,-1), 9),
        ('BOTTOMPADDING', (0,1), (-1,-1), 15),
        ('TOPPADDING', (0,1), (-1,-1), 15),
    ]))
    
    elements.append(t)
    elements.append(Spacer(1, 30))

doc.build(elements)
print(f"Successfully generated {pdf_file}")
