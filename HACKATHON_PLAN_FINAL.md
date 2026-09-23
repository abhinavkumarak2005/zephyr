# 🚀 Microsoft Hackathon Platform — Detailed Implementation Plan
### Collaborated with College PTO | Built with React + Python + Supabase

---

## 📌 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [System Architecture](#3-system-architecture)
4. [Database Schema (Supabase / PostgreSQL)](#4-database-schema)
5. [Participant Dashboard — Features & Flow](#5-participant-dashboard)
6. [Admin Dashboard — Features & Flow](#6-admin-dashboard)
7. [API Design (API framework not used)](#7-api-design)
8. [Email System (external email service not used)](#8-email-system)
9. [Authentication Flow](#9-authentication-flow)
10. [Payment Flow](#10-payment-flow)
11. [Evaluation & Grading System](#11-evaluation--grading-system)
12. [Round & Timeline Management](#12-round--timeline-management)
13. [Frontend Structure](#13-frontend-structure)
14. [Folder Structure](#14-folder-structure)
15. [Deployment Notes](#15-deployment-notes)
16. [Development Milestones](#16-development-milestones)
17. [Architecture Decision Summary](#17-architecture-decision-summary)
18. [Open Questions / Future Scope](#18-open-questions--future-scope)

---

## 1. Project Overview

A full-stack hackathon management platform for a **Microsoft x PTO (College) Hackathon** with:

- A **Participant Dashboard** for team registration, problem statement selection, payment confirmation, round status tracking, and result viewing.
- An **Admin/Judge Dashboard** for reviewing registrations, grading teams across rounds, publishing results, and sending result notifications.

**Scope constraints (current phase):**
- No live domain → email verification links skipped for now; emails still sent via external email service not used for notifications.
- Single admin/judge login (no per-judge accounts).
- Payment flow is tracked (paid / not paid) but gateway integration is separate.

---

## 2. Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| **Frontend** | React + Vite | Dynamic, component-based UI, reusable layouts, attractive dashboards, easy state management |
| **Backend** | Python | Application/business logic without API framework not used or another API framework |
| **Database** | Supabase PostgreSQL | Managed PostgreSQL, Row Level Security, indexes, transactions, scalable cloud database |
| **Authentication** | Supabase Auth | JWT-based authentication, refresh tokens, password auth, session management |
| **Email / OTP** | Supabase Auth | OTP delivery and verification; no external email service not used or email API required |
| **File/Media Storage** | Supabase Storage | Payment screenshot uploads and secure file access |
| **Payment Tracking** | Manual + UPI screenshot upload | No payment gateway required for the current scope |
| **Deployment** | Vercel (React frontend) + Python API framework not used hosting | CDN/serverless frontend on Vercel; Python backend can run on a Python-capable deployment target |
| **Optional Real-time** | Supabase Realtime | Only if live round/result updates are required; not needed for the core platform |

**Additional Python Libraries:**
```
fastapi
uvicorn[standard]
supabase-py
resend
python-jose[cryptography]
python-multipart
pydantic
python-dotenv
passlib[bcrypt]
httpx
```

---

## 3. System Architecture

The platform uses a **React + Vite frontend, Python backend, and Supabase**.

There is **no API framework not used, Express, REST API, custom API not used layer, or external email service not used** in the current architecture.

Supabase provides the managed services required by the application:

- Authentication
- OTP generation and verification
- PostgreSQL database
- Row Level Security (RLS)
- Storage
- User sessions

React is deployed on Vercel. Python contains the backend/business logic that is required by the project and can be executed through the selected Python runtime/deployment approach without introducing an API framework.

```text
┌─────────────────────────────────────────────────────────────────┐
│                            VERCEL                               │
│                                                                 │
│                    React + Vite Frontend                        │
│                                                                 │
│   ┌──────────────────────┐      ┌───────────────────────────┐   │
│   │ Participant Portal   │      │ Admin Dashboard            │   │
│   │ Registration         │      │ Teams / Evaluation         │   │
│   │ Dashboard / Results  │      │ Rounds / Results           │   │
│   └────────────┬─────────┘      └─────────────┬─────────────┘   │
└────────────────┼──────────────────────────────┼─────────────────┘
                 │                              │
                 └──────────────┬───────────────┘
                                │
                         Supabase Client
                                │
          ┌─────────────────────┼─────────────────────┐
          │                     │                     │
          ▼                     ▼                     ▼
   ┌────────────┐       ┌──────────────┐      ┌──────────────┐
   │ Supabase   │       │ PostgreSQL   │      │ Supabase     │
   │ Auth       │       │ Database     │      │ Storage      │
   │ OTP        │       │ + RLS        │      │ Payment      │
   │ Sessions   │       │ Teams        │      │ Screenshots  │
   └────────────┘       │ Members      │      └──────────────┘
                        │ Evaluations  │
                        │ Rounds       │
                        │ Results      │
                        └──────────────┘

                    ┌─────────────────┐
                    │     Python      │
                    │ Backend Logic   │
                    │ No API Framework│
                    └─────────────────┘
```

### Authentication and OTP

Use **Supabase Auth** for the complete authentication flow.

```text
Participant
    ↓
React Auth Screen
    ↓
Supabase Auth
    ↓
OTP Email
    ↓
Participant enters OTP
    ↓
Supabase verifies OTP
    ↓
Authenticated Supabase session
    ↓
React Dashboard
```

There is **no custom OTP API**.

Do not implement `/send-otp`, `/verify-otp`, custom JWT handling, or a separate OTP database. Supabase Auth manages this functionality.

### Database

React uses the Supabase JavaScript client to access PostgreSQL.

Supabase **Row Level Security (RLS)** must enforce permissions so that:

- Participants can access their own account/team information.
- Participants cannot access another team's private data.
- Participants can view only results intended for them.
- Public data such as active problem statements/timeline information can be read according to its policy.
- Admin operations are protected separately.

### Storage

Payment screenshots are stored in **Supabase Storage**.

```text
React
  ↓
Supabase Storage
  ↓
payment-proofs/
  ↓
Admin review
```

Storage policies must prevent participants from browsing other teams' private payment proofs.

### Email

No external email service/API is required.

- **OTP:** Supabase Auth
- **Registration announcements:** Manual
- **Event reminders:** Manual
- **Round announcements:** Manual
- **Shortlist announcements:** Manual
- **Result announcements:** Manual

The organizers will send bulk/student communications manually.

### API Decision

**No custom application API is required for the current project.**

| Service | Required? | Purpose |
|---|---|---|
| **React + Vite** | Yes | Frontend and dynamic UI |
| **Python** | Yes | Backend/business logic |
| **Supabase Auth** | Yes | Authentication, OTP verification and sessions |
| **Supabase PostgreSQL** | Yes | Application database |
| **Supabase Storage** | Yes | Payment screenshot storage |
| **Supabase RLS** | Yes | Authorization and data protection |
| **Vercel** | Yes | React deployment |
| **API framework not used** | **No** | Not used |
| **Custom REST/API layer** | **No** | Not used |
| **external email service not used** | **No** | Not used |
| **Payment Gateway API** | No | Manual UPI + screenshot verification |
| **Bulk Email API** | No | Organizers send emails manually |

## 4. Database Schema

### 4.1 `profiles` table *(extends Supabase Auth)*

```sql
CREATE TABLE public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  name        TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### 4.2 `teams` table

```sql
CREATE TABLE public.teams (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id                TEXT UNIQUE NOT NULL,  -- e.g., MS-2026-0001 (auto-generated)
  team_name              TEXT NOT NULL,
  problem_statement_id   INT REFERENCES public.problem_statements(id),
  college                TEXT NOT NULL,
  department             TEXT,
  payment_status         TEXT DEFAULT 'pending'
                         CHECK (payment_status IN ('pending', 'pending_verification', 'paid', 'rejected')),
  payment_utr_number     TEXT,                  -- 12-digit UTR ID from UPI app
  registration_confirmed BOOLEAN DEFAULT FALSE, -- TRUE only after payment verified by admin
  current_round          INT DEFAULT 0,         -- 0=registered, 1=R1, 2=R2, 3=R3
  is_eliminated          BOOLEAN DEFAULT FALSE,
  created_at             TIMESTAMPTZ DEFAULT NOW(),
  updated_at             TIMESTAMPTZ DEFAULT NOW()
);
```

### 4.3 `team_members` table

```sql
CREATE TABLE public.team_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id     UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT,
  college     TEXT NOT NULL,
  department  TEXT,
  year        TEXT,           -- '1st', '2nd', '3rd', '4th'
  is_leader   BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### 4.4 `problem_statements` table

```sql
CREATE TABLE public.problem_statements (
  id          SERIAL PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT,
  domain      TEXT,           -- e.g., 'AI/ML', 'Web3', 'HealthTech', 'Sustainability'
  is_active   BOOLEAN DEFAULT TRUE
);

-- SEED: Insert 10 problem statements
INSERT INTO public.problem_statements (title, description, domain) VALUES
  ('PS Title 1', 'Description here', 'Domain'),
  -- ... 9 more rows (provide the actual 10 PS to fill)
  ;
```

### 4.5 `rounds` table

```sql
CREATE TABLE public.rounds (
  id                 SERIAL PRIMARY KEY,
  round_number       INT NOT NULL,         -- 1, 2, 3
  name               TEXT NOT NULL,        -- 'Online Screening', 'Prototype', 'Grand Finale'
  description        TEXT,
  start_time         TIMESTAMPTZ,
  end_time           TIMESTAMPTZ,
  is_active          BOOLEAN DEFAULT FALSE,
  is_completed       BOOLEAN DEFAULT FALSE,
  results_published  BOOLEAN DEFAULT FALSE
);

-- SEED
INSERT INTO public.rounds (round_number, name) VALUES
  (1, 'Online Screening'),
  (2, 'Prototype Demo'),
  (3, 'Grand Finale');
```

### 4.6 `evaluations` table

```sql
CREATE TABLE public.evaluations (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id               UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  round_number          INT NOT NULL,
  
  -- Criteria scores (0-10 each) — update column names to match actual criteria
  innovation_score      INT CHECK (innovation_score BETWEEN 0 AND 10),
  feasibility_score     INT CHECK (feasibility_score BETWEEN 0 AND 10),
  technical_depth_score INT CHECK (technical_depth_score BETWEEN 0 AND 10),
  presentation_score    INT CHECK (presentation_score BETWEEN 0 AND 10),
  impact_score          INT CHECK (impact_score BETWEEN 0 AND 10),
  
  total_score  NUMERIC GENERATED ALWAYS AS (
    innovation_score + feasibility_score + technical_depth_score +
    presentation_score + impact_score
  ) STORED,
  
  grade        TEXT CHECK (grade IN ('S', 'A', 'B', 'C', 'D')),
  remarks      TEXT,
  is_selected  BOOLEAN DEFAULT FALSE,   -- Advancing to next round?
  is_published BOOLEAN DEFAULT FALSE,   -- Visible to participant?
  evaluated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE (team_id, round_number)        -- One evaluation per team per round
);
```

**Auto-Grading Logic:**

| Total Score (out of 50) | Grade | Label |
|---|---|---|
| 46 – 50 | **S** | Outstanding |
| 38 – 45 | **A** | Excellent |
| 28 – 37 | **B** | Good |
| 18 – 27 | **C** | Average |
| 0 – 17 | **D** | Below Expectation |

### 4.7 `admin_users` table

```sql
CREATE TABLE public.admin_users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username      TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,      -- bcrypt hashed
  role          TEXT DEFAULT 'judge'
                CHECK (role IN ('superadmin', 'judge')),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
-- Single shared judge login as per requirement
```

### 4.8 `notifications` table *(audit trail for emails sent)*

```sql
CREATE TABLE public.notifications (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id   UUID REFERENCES public.teams(id),
  type      TEXT,       -- 'registration', 'payment_confirmed', 'result', 'custom'
  email_to  TEXT,
  subject   TEXT,
  status    TEXT DEFAULT 'sent',
  sent_at   TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 5. Participant Dashboard

The participant dashboard is a **high-priority product experience**. It should feel like a polished hackathon portal rather than a basic CRUD page.

### 5.1 Pages / Routes

**Hackathon Rules & Regulations:**
The following rules must be displayed prominently on the **Landing Page** (before login) and as a mandatory acknowledgement step during the **Registration** flow:
- Participants must adhere to the schedule, guidelines, and instructions communicated by the organizing committee throughout the hackathon.
- Each participant may be part of only one team. Any changes to the team after confirmation require approval from the organizing committee.
- Teams must select and develop a solution within one of the specified hackathon problem domains.
- All submitted ideas and projects must be original. Plagiarism, copying another team's work, or misrepresenting existing projects as new work will lead to disqualification.
- Teams may use open-source libraries, APIs, datasets, AI tools, and other third-party technologies, provided that applicable licenses and sources are properly acknowledged.
- Shortlisted teams must participate in all mandatory stages, including idea screening, progress reviews, and the Grand Finale, as scheduled by the organizers.
- Teams must submit the required project materials, including the presentation, prototype/demo, and other documents, within the specified deadlines.
- During presentations and demonstrations, teams must be able to clearly explain their problem statement, solution, technical implementation, and the technologies used.
- Participants must maintain professional and respectful conduct towards other participants, mentors, judges, organizers, and guests. Any form of misconduct or disruption may result in disqualification.
- Teams must not interfere with, copy, damage, or intentionally disrupt the work of other participants.
- Projects will be evaluated based on criteria communicated by the organizing committee. The decision of the judges shall be final.
- The organizing committee reserves the right to modify the schedule or event arrangements if required. Any decision regarding matters not covered by these rules shall rest with the organizing committee.

| Page | Route | Access |
|---|---|---|
| Landing Page | `/` | Public |
| Sign In / Sign Up | `/auth` | Public |
| Registration | `/register` | Auth required |
| Participant Dashboard | `/dashboard` | Auth + registered |
| Team Details | `/dashboard/team` | Auth + registered |
| Results | `/dashboard/results` | Auth + published |
| Event Timeline | `/dashboard/timeline` | Auth |
| Profile / Account | `/dashboard/profile` | Auth |

### 5.2 Dashboard Design Goals

The dashboard should be **visually attractive, responsive and information-dense without feeling cluttered**.

Recommended React UI:

- Modern card-based layout
- Responsive sidebar/bottom navigation
- Event branding and Microsoft/organizer branding where permitted
- Clear typography and visual hierarchy
- Status badges for payment, registration and rounds
- Progress indicators
- Countdown to the next event/round
- Timeline with completed/current/upcoming states
- Animated but subtle transitions
- Skeleton loaders while data is loading
- Toast notifications for successful actions/errors
- Empty states and clear error states
- Mobile-first responsive design
- Accessible forms and keyboard navigation

### 5.3 Dashboard Home

The first screen should immediately show:

```text
┌───────────────────────────────────────────────────────────────┐
│ Good morning, [Participant Name]                              │
│ Team: [Team Name]   Team ID: MS-2026-XXXX                    │
│                                                               │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐   │
│ │ Registration│ │ Payment     │ │ Current Round           │   │
│ │ ✓ Confirmed │ │ ✓ Paid      │ │ Round 1 • Active       │   │
│ └─────────────┘ └─────────────┘ └─────────────────────────┘   │
│                                                               │
│ NEXT EVENT                                                     │
│ ┌───────────────────────────────────────────────────────────┐  │
│ │ Round 2 — Prototype Demo                                  │  │
│ │ Sep 10, 2026 • 10:00 AM                                  │  │
│ │ Starts in 4 days 08:31:22                                │  │
│ │ [View Timeline]                                           │  │
│ └───────────────────────────────────────────────────────────┘  │
│                                                               │
│ YOUR TEAM                                                     │
│ ┌───────────────────────────────────────────────────────────┐  │
│ │ Team Alpha     MS-2026-0001                              │  │
│ │ PS #3 — Smart Traffic Management                         │  │
│ │ 4 Members • Registration Confirmed                       │  │
│ │ [View Team Details]                                       │  │
│ └───────────────────────────────────────────────────────────┘  │
│                                                               │
│ EVENT TIMELINE                                                 │
│ ● Registration ✓                                              │
│ ● Round 1       ✓                                             │
│ ◉ Round 2       Upcoming                                      │
│ ○ Grand Finale  Upcoming                                      │
└───────────────────────────────────────────────────────────────┘
```

### 5.4 Participant Details

Participants must be able to see **exactly what they entered during registration**.

Display:

- Team ID
- Team name
- Team leader
- Every team member
- Member name
- Email
- Phone
- College
- Department
- Year of study
- Leader badge
- Selected problem statement
- Registration date/time
- Payment status
- Registration confirmation status
- Uploaded payment proof status

Provide a clear **View / Edit** model. Editing should be disabled after the relevant registration lock point if the organizers decide that submissions must become immutable.

### 5.5 Event Timeline

The dashboard must prominently show the **next coming events**, not just completed rounds.

Each timeline item should contain:

- Round/event name
- Start date and time
- End date and time
- Status: Upcoming / Active / Completed
- Countdown for the next event
- Participant/team status
- Instructions or location/link when provided
- Result availability when published

Example:

```text
REGISTRATION
   ✓ Completed

ROUND 1 — ONLINE SCREENING
   ✓ Completed
   Your Status: Advanced to Round 2

ROUND 2 — PROTOTYPE DEMO
   ◉ Upcoming
   Sep 10 – Sep 15, 2026
   Starts in: 4d 08h
   Your Status: Qualified

ROUND 3 — GRAND FINALE
   ○ Upcoming
   Sep 20, 2026
```

### 5.6 Results Experience

When results are published, show:

- Grade
- Total score / maximum score
- Score per criterion
- Judge remarks
- Selected for next round
- Publication timestamp
- Round name

Use visual score bars/rings/cards rather than a plain table wherever appropriate.

### 5.7 React Component Structure

Recommended component structure:

```text
src/
├── components/
│   ├── layout/
│   │   ├── AppShell.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Topbar.jsx
│   │   └── MobileNav.jsx
│   ├── dashboard/
│   │   ├── WelcomeHeader.jsx
│   │   ├── StatusCards.jsx
│   │   ├── NextEventCard.jsx
│   │   ├── EventTimeline.jsx
│   │   ├── TeamSummary.jsx
│   │   └── ResultCard.jsx
│   ├── team/
│   │   ├── TeamDetails.jsx
│   │   └── MemberCard.jsx
│   ├── registration/
│   │   ├── RegistrationWizard.jsx
│   │   ├── TeamInfoStep.jsx
│   │   ├── MembersStep.jsx
│   │   ├── ProblemStatementStep.jsx
│   │   └── ReviewStep.jsx
│   └── ui/
│       ├── Button.jsx
│       ├── Card.jsx
│       ├── Modal.jsx
│       ├── Badge.jsx
│       ├── Toast.jsx
│       └── Skeleton.jsx
├── pages/
├── hooks/
├── services/
├── lib/
└── styles/
```

### 5.8 Full User Flow

```text
[Landing Page]
    ↓
[Supabase Auth]
    ↓
[Registration Wizard]
    ↓
[API framework not used validation + team creation]
    ↓
[Participant Dashboard]
    ├── Team Details
    ├── Payment
    ├── Next Event
    ├── Timeline
    └── Results
```

## 6. Admin Dashboard

### 6.1 Admin Login

- URL: `/admin/login.html`
- Single shared credentials (username + bcrypt-hashed password from `.env`)
- Returns JWT stored in `localStorage` with 8-hour expiry
- All admin pages check token on load; redirect to login if missing/expired

### 6.2 Admin Pages & Features

#### `/admin/dashboard.html` — Overview
| Card | Value |
|---|---|
| Total Registrations | Count of all teams |
| Confirmed (Paid) | payment_status = 'paid' |
| Payment Pending | payment_status = 'pending' or 'pending_verification' |
| Active Round | Current round name |
| Recent Signups | Last 10 teams table |

- Bar chart: Registrations per problem statement
- Donut chart: Payment status breakdown

#### `/admin/teams.html` — Teams Management

Full paginated table:
```
[ Search by Team ID ] [ Filter: PS ▼ ] [ Filter: Payment ▼ ] [ Filter: Round ▼ ]

┌────────────┬──────────────┬───────────┬──────────────────┬────────┬─────────┬─────────┬──────────┐
│ Team ID    │ Team Name    │ College   │ Problem Statement │ Members│ Payment │ Round   │ Actions  │
├────────────┼──────────────┼───────────┼──────────────────┼────────┼─────────┼─────────┼──────────┤
│ MS-2026-001│ Team Alpha   │ MIT       │ PS #3            │ 4      │ Paid    │ Round 1 │ View | ✉ │
└────────────┴──────────────┴───────────┴──────────────────┴────────┴─────────┴─────────┴──────────┘
```

- Click **View** → goes to `/admin/team-detail.html?id=<team_id>`
- Bulk select → Bulk mark paid / Send email

#### `/admin/team-detail.html` — Individual Team Profile

- Team info: ID, name, college, PS selected
- Member list: name, email, phone, year, leader badge
- Payment section:
  - View uploaded screenshot (from Supabase storage)
  - Buttons: [Mark as Paid] [Mark as Rejected]
- Evaluation history: tabs for Round 1 / 2 / 3, each showing scores and grade
- Quick email: compose and send custom email to team leader

#### `/admin/evaluate.html` — Evaluation Form

```
Team: Team Alpha (MS-2026-001) | Round: [ 1 ] [ 2 ] [ 3 ]
Problem Statement: PS #3 — Smart Traffic Management

╔══════════════════════════════════════════════════════╗
║  Criterion            │ Score (0–10)  │ Weight        ║
╠══════════════════════════════════════════════════════╣
║  Innovation           │ [ slider/num ]│ 20%           ║
║  Technical Feasibility│ [ slider/num ]│ 20%           ║
║  Technical Depth      │ [ slider/num ]│ 20%           ║
║  Presentation Quality │ [ slider/num ]│ 20%           ║
║  Real-world Impact    │ [ slider/num ]│ 20%           ║
╠══════════════════════════════════════════════════════╣
║  Total Score          │ [auto] / 50   │               ║
║  Grade                │ [auto: S/A/B/C/D]             ║
╚══════════════════════════════════════════════════════╝

Selected for next round?  ○ Yes  ○ No

Remarks / Feedback:
┌─────────────────────────────────────────────┐
│                                             │
└─────────────────────────────────────────────┘

[ Save Draft ]          [ Submit Evaluation ]
```

> ⚠️ **Criteria columns will be renamed** once you share the evaluation criteria document.

#### `/admin/problem-report.html` — PS-wise Report

```
┌──────┬──────────────────────────────┬──────────┬──────┬─────────┐
│ PS # │ Title                        │ Total Reg│ Paid │ Pending │
├──────┼──────────────────────────────┼──────────┼──────┼─────────┤
│  1   │ Smart Traffic Management     │    12    │  8   │   4     │
│  2   │ AI-powered Healthcare        │    15    │ 11   │   4     │
│  ...                                                            │
│ 10   │ Sustainable Energy           │     9    │  7   │   2     │
└──────┴──────────────────────────────┴──────────┴──────┴─────────┘
```
- Click any row → expands to show team list under that PS

#### `/admin/rounds.html` — Round Management

Per round card:
```
┌─ Round 1: Online Screening ──────────────────────────────────┐
│  Start: [date picker]    End: [date picker]                  │
│  Status: ○ Upcoming  ● Active  ○ Completed                  │
│                                                              │
│  [Activate Round]   [Mark Complete]   [Publish Results]      │
│                                                              │
│  Teams shortlisted for Round 2:                              │
│  [ ] MS-2026-001 Team Alpha    [ ] MS-2026-002 Team Beta     │
│  [Save Shortlist]                                            │
└──────────────────────────────────────────────────────────────┘
```

#### `/admin/results.html` — Result Publication

- List of evaluated teams for selected round
- Per team: name, grade, is_selected, publish status toggle
- [Publish All] button → sets is_published = TRUE for all evaluated teams in round
- [Send Result Emails] → triggers external email service not used to mail all teams with published results

---

## 7. Python Backend

The project includes **Python backend logic**, but does not use API framework not used or another API framework.

Python should be used for backend/business logic that is genuinely required by the application. Supabase remains responsible for managed authentication, database and storage services.

### Python Responsibilities

- Application/business rules that require Python
- Data processing or calculations
- Evaluation/score processing where Python is useful
- Administrative processing logic
- Utility scripts
- Data import/export and maintenance scripts
- Other server-side tasks that do not require a custom HTTP API

### What Python Does Not Handle

Python should not duplicate functionality already provided by Supabase.

Do not build custom Python implementations for:

- OTP generation
- OTP verification
- User session management
- Password hashing/authentication
- PostgreSQL connection proxying for ordinary client queries
- File storage
- Bulk email delivery

Those are handled by Supabase or manually by organizers.

## 8. Email System

### OTP Email

OTP authentication is handled entirely by **Supabase Auth**.

```text
React
  ↓
Supabase Auth
  ↓
OTP Email
  ↓
Participant
  ↓
Supabase verifies OTP
  ↓
Authenticated session
```

No external email service not used and no custom email API are required.

### Bulk / Event Emails

The platform will **not automate bulk student emails**.

Organizers will manually send:

- Registration announcements
- Registration reminders
- Round announcements
- Shortlist announcements
- Result announcements
- Other event communications

This keeps the application simple and avoids unnecessary email infrastructure.

## 9. Authentication Flow

### Participant (Supabase Auth)

```
1. User submits email + password to POST /api/auth/signin
2. API framework not used calls Supabase Auth → returns access_token (JWT) + refresh_token
3. Frontend stores token in localStorage
4. Every API request: Authorization: Bearer <access_token>
5. API framework not used middleware decodes token using Supabase JWT secret
6. Extracts user UUID → used to find team membership
7. Token expires in 1 hour → use refresh_token to get new access_token
```

### Admin (Custom JWT)

```
1. Admin submits username + password to POST /api/admin/login
2. API framework not used looks up admin_users table
3. Verifies password against bcrypt hash
4. Issues custom JWT: { sub: username, role: "admin", exp: now + 8h }
5. All /api/admin/* routes use Depends(require_admin) middleware
6. Middleware checks JWT validity + role claim
```

---

## 10. Payment Flow

```
[Registration submitted]
  └─ teams.payment_status = 'pending'
  └─ teams.registration_confirmed = FALSE
  └─ Email: "Registration received, please pay"

[Participant submits Payment UTR ID]
  └─ teams.payment_utr_number = UTR ID
  └─ teams.payment_status = 'pending_verification'

[Admin opens 'Pending Verification' queue in admin panel]
  └─ Sees UTR ID
  └─ Clicks [Mark as Paid] or [Reject]

[If PAID]
  └─ teams.payment_status = 'paid'
  └─ teams.registration_confirmed = TRUE
  └─ Email: "Payment confirmed! Team ID: MS-2026-XXXX"
  └─ Team now visible in evaluation views

[If REJECTED]
  └─ teams.payment_status = 'rejected'
  └─ Email: "Payment rejected — please resubmit your UTR number"
  └─ Participant can re-enter UTR ID
```

**Rule:** Teams with `registration_confirmed = FALSE` are completely excluded from the main Admin Teams view. 
- They only appear in a separate "Pending Verification" queue.
- Only after the admin gives "payment verified", the team will be shown as a registered team in the admin dashboard for evaluation and round shortlisting.
- Reports show them separately as "unconfirmed".

---

## 11. Evaluation & Grading System

### Criteria

Instead of individually entering criteria scores, the evaluation follows a top-down Grade-based flow.

1. **Select Grade:**
   - **S** (Outstanding)
   - **A** (Excellent)
   - **B** (Good)
   - **C** (Average)
   - **D** (Below Expectation)

2. **Input Mark:**
   Based on the grade selected, the admin inputs a specific mark in the corresponding range:
   - **S:** 46 – 50
   - **A:** 38 – 45
   - **B:** 28 – 37
   - **C:** 18 – 27
   - **D:** 0 – 17

*Note: The individual criteria (Innovation, Feasibility, etc.) are kept in mind by the judges, but the system explicitly asks for the Grade first, then the total mark within that range.*

```python
# backend/utils/grade_calculator.py
def compute_grade(total_score: float) -> str:
    if total_score >= 46:
        return "S"  # Outstanding
    elif total_score >= 38:
        return "A"  # Excellent
    elif total_score >= 28:
        return "B"  # Good
    elif total_score >= 18:
        return "C"  # Average
    else:
        return "D"  # Below Expectation
```

Grade is computed on backend whenever evaluation is saved/updated. Never trust the frontend's grade calculation.

### Evaluation Flow
1. Admin opens team detail or evaluate page.
2. Selects round (1, 2, or 3).
3. Selects the Grade (S, A, B, C, or D).
4. System prompts the admin to enter the final mark in the corresponding grade range.
5. Marks "Selected for next round": Yes / No.
6. Adds remarks (optional).
7. Clicks [Save Evaluation].

### Evaluated Teams Section (Admin Review Before Publish)
- After evaluation, teams are moved to a separate **"Evaluated Teams"** section in the admin dashboard.
- This section shows a consolidated view of who is Qualified vs Not Qualified for the next round.
- The admin can make changes/adjustments here (re-evaluating or changing the qualified status).
- Once the admin is satisfied, they click **[Publish Results]**.
- **Important:** Hitting publish triggers the results to appear on the participant dashboard.

### Participant Result View
- Participants **do NOT see their marks or grades** on their dashboard.
- The dashboard ONLY shows their status: **"Qualified"** or **"Not Qualified"** for the next round.

---

## 12. Round & Timeline Management

### Round Definitions

| Round | Name | Typical Content |
|---|---|---|
| 1 | Online Screening | Abstract/idea submission review, short pitch deck |
| 2 | Prototype Demo | Working demo or MVP presentation |
| 3 | Grand Finale | Final pitch to judges, Q&A |

### Round State Machine

```
NOT STARTED → [Admin activates] → ACTIVE → [Admin completes] → COMPLETED
                                                    ↓
                                     [Admin publishes results] → RESULTS PUBLISHED
```

### Timeline on Participant Dashboard

```
● Round 1: Online Screening          Aug 30 – Sep 5, 2026
  [COMPLETED] Your Status: Advanced to Round 2 ✅

◉ Round 2: Prototype Demo            Sep 10 – Sep 15, 2026
  [ACTIVE] Your Status: Evaluation Pending ⏳

○ Round 3: Grand Finale              Sep 20, 2026
  [UPCOMING]
```

### Admin Round Actions

| Action | Effect |
|---|---|
| Set Dates | Updates `start_time`, `end_time` |
| Activate Round | `is_active = TRUE`, others = FALSE |
| Save Shortlist | Updates `teams.current_round` for selected teams |
| Mark Complete | `is_completed = TRUE`, `is_active = FALSE` |
| Publish Results | `evaluations.is_published = TRUE` for round's teams |

---

## 13. Frontend Structure

The frontend is built with **React + Vite** to allow a dynamic, polished user experience.

### Participant Pages

| Route | Purpose |
|---|---|
| `/` | Landing page, event information, problem statements, timeline, FAQ, Rules & Regulations |
| `/auth` | Sign in / sign up |
| `/register` | Multi-step registration wizard |
| `/dashboard` | Main participant dashboard |
| `/dashboard/team` | Full participant/team details |
| `/dashboard/timeline` | Upcoming and completed events |
| `/dashboard/results` | Published round results |
| `/dashboard/profile` | Account/session settings |

### Admin Pages

| Route | Purpose |
|---|---|
| `/admin/login` | Admin authentication |
| `/admin/dashboard` | Stats overview |
| `/admin/teams` | Teams table, search, filtering |
| `/admin/teams/:teamId` | Individual team details |
| `/admin/evaluate/:teamId` | Evaluation form |
| `/admin/rounds` | Round management |
| `/admin/results` | Result publication |
| `/admin/problem-report` | PS-wise registration report |

### Shared React Services

```text
src/
├── lib/
│   ├── supabaseClient.js
│   └── apiClient.js
├── services/
│   ├── authService.js
│   ├── teamService.js
│   ├── eventService.js
│   ├── resultService.js
│   └── adminService.js
├── hooks/
│   ├── useAuth.js
│   ├── useTeam.js
│   └── useCountdown.js
└── components/
```

Use `fetch` or Axios for API framework not used calls. Use the official Supabase JavaScript client for Supabase Auth and approved direct database/storage operations.

## 14. Folder Structure

```text
ms-hackathon/
│
├── src/                              # React + Vite application
│   ├── components/
│   │   ├── layout/
│   │   ├── dashboard/
│   │   ├── team/
│   │   ├── registration/
│   │   ├── timeline/
│   │   ├── results/
│   │   └── ui/
│   ├── pages/
│   │   ├── Landing.jsx
│   │   ├── Auth.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   ├── TeamDetails.jsx
│   │   ├── Timeline.jsx
│   │   ├── Results.jsx
│   │   └── Profile.jsx
│   ├── admin/
│   │   ├── Dashboard.jsx
│   │   ├── Teams.jsx
│   │   ├── TeamDetails.jsx
│   │   ├── Evaluate.jsx
│   │   ├── Rounds.jsx
│   │   ├── Results.jsx
│   │   └── ProblemReport.jsx
│   ├── hooks/
│   ├── services/
│   │   ├── authService.js
│   │   ├── teamService.js
│   │   ├── eventService.js
│   │   ├── resultService.js
│   │   └── storageService.js
│   ├── lib/
│   │   └── supabaseClient.js
│   ├── context/
│   ├── assets/
│   ├── styles/
│   ├── App.jsx
│   └── main.jsx
│
├── python/
│   ├── business_logic/
│   ├── calculations/
│   ├── scripts/
│   └── utils/
│
├── public/
│
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql
│       └── 002_seed_data.sql
│
├── package.json
├── vite.config.js
└── README.md
```

## 15. Deployment Notes

### Production Architecture

```text
React + Vite
     │
     ▼
  Vercel
     │
     ▼
  Supabase
 ┌───────────────┬────────────────┬────────────────┐
 │ Auth + OTP    │ PostgreSQL     │ Storage        │
 │ Sessions      │ Teams          │ Payment proofs │
 │               │ Members        │                │
 │               │ Evaluations    │                │
 │               │ Rounds/Results │                │
 └───────────────┴────────────────┴────────────────┘

Python backend/business logic runs separately where required,
without API framework not used or a custom API not used framework.
```

### Frontend

Deploy the React/Vite application to Vercel.

```env
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=...
```

### Supabase

Supabase provides:

- Auth
- OTP
- PostgreSQL
- RLS
- Storage

Configure:

- Authentication/OTP settings
- Database schema
- RLS policies
- Storage buckets and policies
- Indexes
- Database constraints

### Python

Keep Python backend/business logic separate from the React client.

Python must not contain credentials that are exposed to the browser.

If Python needs privileged Supabase access, use server-side secrets in the Python runtime only. Do not place a Supabase service-role key in `VITE_*` variables.

### Concurrent Users / Performance

The application is designed without a custom API not used server.

Vercel serves the React application and Supabase handles authentication, database and storage operations.

There is no fixed universal concurrent-user number. Practical capacity depends on:

- Supabase plan limits
- Database query efficiency
- Authentication traffic
- Storage upload traffic
- Number of requests per user
- Registration-time traffic spikes

For a normal college hackathon workload, this architecture should be straightforward to operate. Before the event, load-test registration, login/OTP and dashboard flows against expected peak traffic.

### Performance Rules

- Use indexed database columns for search/filter operations.
- Avoid fetching complete tables unnecessarily.
- Paginate admin tables.
- Avoid N+1 queries.
- Compress/limit payment screenshot uploads.
- Lazy-load heavy React pages/components.
- Use skeleton loaders for dashboard requests.
- Keep the participant dashboard lightweight and responsive.
- Use RLS rather than fetching extra data and filtering it in React.

## 16. Development Milestones

### Phase 1 — Foundation (Day 1–2)
- [ ] Create Supabase project + run migration SQL
- [ ] Seed 10 problem statements + 3 rounds
- [ ] Scaffold React + Vite frontend
- [ ] Scaffold API framework not used project (main.py, config, routers)
- [ ] Implement admin login endpoint + JWT issuance
- [ ] Create admin user seed script
- [ ] Test API at `/docs` (Swagger UI)

### Phase 2 — Participant Registration (Day 2–3)
- [ ] Build React landing page (hero, PS cards, timeline, FAQ)
- [ ] React auth screens — sign up + sign in (Supabase Auth)
- [ ] 4-step registration form
- [ ] Team creation API (`POST /api/register/team`)
- [ ] Payment proof upload (Supabase Storage)
- [ ] Registration & payment emails (external email service not used sandbox)

### Phase 3 — Admin Panel (Day 3–4)
- [ ] Admin login page + token guard
- [ ] Admin dashboard (stats cards)
- [ ] Teams table with search by Team ID + filters
- [ ] Individual team detail page
- [ ] Payment approval flow (mark paid/rejected)
- [ ] PS-wise report page

### Phase 4 — Evaluation & Results (Day 4–5)
- [ ] Evaluation form (score inputs, auto grade)
- [ ] Save draft + submit evaluation APIs
- [ ] Round management page (activate, shortlist, publish)
- [ ] Results publication (toggle is_published)
- [ ] Participant dashboard shows results after publish
- [ ] Result email send from admin panel

### Phase 5 — Polish & Testing (Day 5–6)
- [ ] Mobile responsive CSS for all pages
- [ ] Loading spinners, error toasts, empty states
- [ ] End-to-end test: register → pay → evaluate → publish → see result
- [ ] Admin edge cases: duplicate emails, same PS full, etc.
- [ ] Final review + handoff

---

## 17. Architecture Decision Summary

### Final Technology Choice

**Frontend:** React + Vite  
**Backend:** Python  
**Database:** Supabase PostgreSQL  
**Authentication:** Supabase Auth + OTP  
**File Storage:** Supabase Storage  
**Authorization:** Supabase Row Level Security  
**Hosting:** Vercel  
**Bulk Student Emails:** Manual by organizers

### Explicitly Not Used

- API framework not used
- Flask
- Express/Node API
- Custom REST API
- Custom OTP service
- external email service not used
- Automated bulk-email service
- Payment gateway API

### OTP Decision

OTP is completely handled by **Supabase Auth**.

```text
React
  ↓
Supabase Auth
  ↓
OTP email
  ↓
Participant enters OTP
  ↓
Supabase verifies OTP
  ↓
Authenticated session
  ↓
React Dashboard
```

### Security Rule

The browser is an untrusted client.

Never expose:

```text
SUPABASE_SERVICE_ROLE_KEY
```

Use:

- Supabase Auth for identity
- RLS for database authorization
- Storage policies for uploaded files
- Database constraints for data integrity

### Product Priority

The **participant dashboard is a primary feature**.

The first implementation should prioritize:

1. Beautiful responsive dashboard
2. Complete participant/team details
3. Clear payment/registration status
4. Prominent upcoming-event countdown
5. Interactive event timeline
6. Round-by-round status
7. Attractive published results
8. Excellent mobile experience

## 18. Open Questions / Future Scope

### 🔴 Decisions Needed Before Building

| # | Question | Default Assumed |
|---|---|---|
| 1 | **Evaluation Criteria** — share the actual criteria doc | 5 generic criteria, 10 pts each |
| 2 | **Problem Statements** — titles + descriptions for all 10 | Placeholder titles |
| 3 | **Team Size** — min and max members per team? | 1–4 members |
| 4 | **Payment Amount** — how much is the registration fee? | Not set |
| 5 | **Payment Method** — UPI ID / QR image to show participants? | UPI (provide details) |
| 6 | **College Restriction** — all colleges or specific ones? | All colleges allowed |
| 7 | **Event Dates** — hackathon date, round dates? | TBD |
| 8 | **Prizes** — what to show in landing page prizes section? | TBD |

### 🟡 Post-Domain Tasks (Once domain is ready)
- [ ] Set up external email service not used verified domain
- [ ] Enable email verification on sign-up (Supabase magic link)
- [ ] Add email for registration confirmation with verification link
- [ ] Configure custom domain on Vercel/Netlify

### 🟢 Future Enhancements
- [ ] Razorpay / Stripe payment gateway (auto-confirms payment)
- [ ] Real-time dashboard updates (Supabase Realtime)
- [ ] Per-judge accounts (role-based)
- [ ] Team submission portal (PPT, GitHub, video link upload per round)
- [ ] Automated certificate generation (PDF)
- [ ] WhatsApp notifications (Twilio WATI)
- [ ] Analytics charts in admin (Chart.js)
- [ ] Export to Excel (team data, results)

---

## ✅ Immediate Action Checklist

```
Before writing a single line of code, gather:

□ Evaluation criteria document          → maps to DB columns + form fields
□ 10 problem statement titles/desc      → seeds problem_statements table
□ Min/max team size                     → registration form validation
□ Registration fee amount               → payment instructions screen
□ UPI ID / QR code for payment         → shown on dashboard after registration
□ Event date and round dates            → timeline section + round records
□ Prize details                         → landing page prizes section

Then run:
□ Create Supabase project (supabase.com)
□ Create external email service not used account (resend.com) — sandbox mode for now
□ Python 3.11+ ready (python3 --version)
□ Node.js ready for frontend serve (node --version)
```

---

*Document Version: 1.0*
*Created: 2026-08-27*
*Project: MS Hackathon x PTO — [ms-hackathon]*
