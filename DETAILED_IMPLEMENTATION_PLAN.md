# 🚀 Zephyr Hackathon: Phase-Wise Implementation Plan (Detailed)

This comprehensive plan covers the entire end-to-end implementation of the Zephyr Hackathon platform. It integrates the `overflow.sui.io` design system, the Spline 3D interactions, Supabase backend modifications, and the specific constraints around OTP, team sizing, and submission handling.

---

## Phase 1: Environment Initialization & Core Styling

**Objective:** Set up the React + Vite frontend and strictly port the `overflow.sui.io` UI system.

1. **Frontend Scaffolding:**
   - Initialize the `frontend/` directory using React + Vite.
   - Install dependencies: `@splinetool/react-spline` (for 3D), `framer-motion` (for GSAP-like animations), `@studio-freight/react-lenis` (for smooth scrolling).
   - Configure Tailwind CSS.

2. **Design System Integration (Referencing `UI reference` folder & `ui_research.md`):**
   - Import the CSS variables from `variables.css` and `tokens.json`.
   - Setup the exact `overflow.sui.io` color palette (e.g., Canvas `#ffffff`, Ink `#222222`, Accent `#3898ec` / Cyan).
   - Implement the Fluid Typography scaling system (`clamp()` functions) for responsive text.
   - Configure the base CSS to hide scrollbars while maintaining Lenis smooth scrolling.
   - Set up the Glassmorphism utility classes (blur backdrops, subtle borders) for cards and navigation bars.

---

## Phase 2: Supabase Schema & Auth Configuration

**Objective:** Secure the backend, adjust schemas for new rules, and implement OTP authentication.

1. **Database Schema Updates (`supabase/migrations/`):**
   - **Teams Table:**
     - Add `presentation_link` (TEXT) and `project_link` (TEXT) for Google Drive submissions.
     - Add `payment_utr_number` (TEXT) replacing the screenshot file URL.
   - **Validation & Triggers:**
     - Add strict frontend and backend validation for **Team Size: Minimum 2, Maximum 4 members**.

2. **Authentication Flow (Sign-in / Login):**
   - Build a dedicated `Auth.jsx` page (styled with the new UI, but no 3D element).
   - Implement **Supabase Email OTP**:
     - User inputs email.
     - Supabase triggers the OTP email.
     - UI renders the "Enter OTP" input screen.
     - Upon verification, user is granted a JWT session and redirected to the dashboard.
   - Ensure absolutely no data is lost during registration interruptions by temporarily saving state in `localStorage` until the team is fully committed to Supabase.

---

## Phase 3: The Landing Page (3D & Motion UI)

**Objective:** Build the public-facing landing page heavily inspired by `overflow.sui.io`.

1. **Layout Structure:**
   - **Left Side (Content):**
     - Text content about Microsoft and PTU.
     - High-impact Typography using the `TWK Everett` (or fallback) styling.
     - **Logo Placement:** Microsoft and PTU logos prominently placed as primary. The Hub logo placed as a sub-logo (footer or secondary header).
   - **Right Side (3D Canvas):**
     - Embed `<Spline scene="https://prod.spline.design/QKjzhoN9XWLKyZQF/scene.splinecode" />`.
     - Ensure the `pointer-events` allow the Spline element to follow the cursor movement natively as configured in Spline.

2. **Scroll & Motion Interactions:**
   - Implement `Framer Motion` to trigger section reveals via `clip-path` and fade-ups, exactly like `overflow.sui.io`.
   - Add a sticky timeline and problem statement section.
   - Display the **Rules and Regulations** (from the MIH docx) in a dedicated, styled section.

---

## Phase 4: The Registration Wizard

**Objective:** A seamless onboarding experience.

1. **Wizard UI:**
   - Multi-step form with glassmorphic cards and smooth transitions.
   - Step 1: Team Name & Problem Statement.
   - Step 2: Member Details (Enforcing min 2, max 4 members).
   - Step 3: Rules Acknowledgement (Must agree to MIH Rules).
   - Step 4: Payment (Input 12-digit UTR ID).
2. **Submission Handling:**
   - The UI will explicitly provide a "Template PPT Link" (Drive link provided by you).
   - Form inputs will only accept URLs (Drive links) for their actual project submissions.

---

## Phase 5: Participant & Admin Dashboards

**Objective:** Functional, beautiful dashboards using the same premium UI style, but *without* the Spline 3D background.

1. **Participant Dashboard:**
   - Display team members, selected problem statement, and UTR payment status.
   - **Results View:** Will strictly display "Qualified" or "Not Qualified" (Marks and Grades are fully hidden).

2. **Admin Dashboard:**
   - **Payment Queue:** Teams only appear in the active evaluation view *after* the Admin verifies their UTR ID.
   - **Grading Flow:**
     - Admin selects a **Grade (S, A, B, C, D)**.
     - System prompts for a specific **Mark** strictly within the selected Grade's range.
   - **Evaluated Teams Review:**
     - A dedicated staging area where Admins review evaluated teams.
     - Admin can tweak results, and finally click **Publish Results** to sync to the Participant dashboard.

---

## Phase 6: Final Vercel Deployment & Testing
- Deploy the React frontend to **Vercel**.
- Connect environment variables to the production **Supabase** instance.
- Run end-to-end tests: OTP login -> Registration -> UTR Submission -> Admin Grading -> Participant Dashboard verification.
- Ensure 0% data loss across all network interactions.
