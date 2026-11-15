# CareBridge: Elderly Care & Medication Management Platform

> A smart, secure, accessible, and collaborative healthcare management ecosystem designed to help elderly individuals manage their daily medications, doctor appointments, and healthcare routines while keeping their family members and caregivers actively informed in real time.

---

## 🌟 Live Demo Credentials

Use the **1-Click Quick Demo Buttons** on the login screen, or log in with any of the pre-seeded accounts:

| Role | User Name | Email | Password | Senior Quick PIN | Care Link Code |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Elderly Individual** | Martha Johnson (Age 76) | `martha@carebridge.health` | `password123` | **`1234`** | `CB-1001` |
| **Family Member** | David Johnson (Son) | `david@carebridge.health` | `password123` | **`2345`** | *Linked to Martha* |
| **Caregiver / Nurse** | Sarah Jenkins, RN (Visiting Nurse) | `sarah@carebridge.health` | `password123` | **`3456`** | *Linked to Martha* |

---

## 🚀 Key Features & Architectural Highlights

### 1. Three Distinct User Role Experiences
- **👵 Elderly Individual Dashboard:**
  - High-visibility daily medication routine organized by time of day (☀️ Morning, 🌤️ Afternoon, 🌅 Evening, 🌙 Bedtime).
  - Visual Pill cards showing pill color (blue, yellow, white, red, etc.), pill shape, dosage, and instructions.
  - **1-Click "I TOOK THIS PILL"** button with confetti animation and spoken audio praise.
  - **"Read My Schedule"** button using browser Web Speech Synthesis (`window.speechSynthesis`) for elderly users with vision impairments.
  - Quick access to Emergency SOS Beacon and upcoming appointments.

- **👨‍👩‍👧 Family Member Portal:**
  - Real-time monitoring of loved one's adherence status ("100% adherence today, 0 missed doses").
  - **Adherence Streak Tracker** (e.g. 🔥 12-day consecutive streak).
  - Live dose checklist with taken vs pending vs missed badges.
  - **Care Circle Activity Feed** with 1-click Check-In note box ("Brought groceries, Mom is feeling great!").
  - Instant doctor appointment reminder triggers.

- **🩺 Professional Caregiver / Clinical Nurse Portal:**
  - Clinical Action Bar: "Add Medication", "Log Health Vitals", "Book Doctor Visit", "Write Clinical Note".
  - Vital signs recorder (Blood pressure systolic/diastolic, blood glucose fasting/post-prandial, pulse rate, oxygen SpO2).
  - Low stock & refill alerts (triggers alerts when pill inventory falls below threshold).
  - Comprehensive 30-day therapeutic adherence analytics.

---

### 2. Core Modules

#### A. Authentication & Role-Based Authorization
- Dual sign-in options: **Standard Email/Password** and **Senior Quick 4-Digit PIN**.
- JWT bearer token authorization with secure password hashing (`bcryptjs`).
- Role-based route guards (`elderly`, `family`, `caregiver`).
- **Care Link Code System:** Elderly users generate a secure 6-character code (e.g. `CB-1001`) that family members and caregivers enter to link to their healthcare records.

#### B. Healthcare Profile Management
- Comprehensive medical profile: Date of birth, gender, and **verified Blood Group** (e.g. `O+`).
- Documented chronic conditions (Hypertension, Type 2 Diabetes, Osteoarthritis) with tag managers.
- Known severe allergies (Penicillin, Sulfa) with high-visibility warning badges.
- Emergency contacts directory with primary emergency tags and direct telephone links.
- Primary physician records (Name, clinic address, office phone).

#### C. Medication Management & Schedule
- Full medication CRUD with pill form (tablet, capsule, liquid, injection, inhaler, drops, patch).
- Custom frequency builder (daily, twice daily, three times daily, bedtime, PRN).
- Time-of-day scheduler with 24-hr time stamps.
- Visual pill customizer: customize pill colors and shapes so elderly users can recognize pills easily.
- Automatic inventory decrement on dose confirmation with low-stock warnings.

#### D. Automated Reminders & Smart Email Service
- Automated background scheduler (`node-cron`) checks every minute for upcoming doses and missed doses.
- **Missed Medication Detection:** Automatically detects doses unconfirmed >45 minutes past due and marks them as missed.
- **Consecutive Missed Doses High-Risk Safety Alert:** Proactively detects 2+ consecutive missed doses and alerts both family and caregivers immediately!
- **Nodemailer Integration:** Beautifully styled responsive HTML emails dispatched for medication reminders, missed dose notices, doctor appointment reminders, and SOS alerts.
- **Live In-App Email Inspector Modal:** Click the "Mail" button in the navigation header to inspect all real emails sent by Nodemailer in real time, complete with HTML previews.

#### E. Doctor Appointment Management
- Schedule upcoming clinic visits, lab tests, and doctor checkups.
- Doctor specialty, hospital/clinic address, appointment date & time.
- Pre-appointment preparation instructions (e.g. fasting 10 hours, previous blood reports).
- 1-Click "Send Reminder Email" button.

#### F. Adherence Tracking & Analytics
- 7-day and 30-day adherence percentage progress meters.
- Adherence streak counter.
- 7-day visual daily bar chart breakdown (taken, missed, pending).
- Time-of-day compliance analysis (Morning vs Afternoon vs Evening vs Bedtime).
- Filterable medication history log with status filters (taken, missed, pending) and date ranges.
- One-click Printable / Exportable healthcare summary report.

---

### 3. Innovative Accessibility & Smart Features

1. **Senior Accessibility Mode:**
   - One-click toggle in the header.
   - Increases font sizes, scales button targets to 48px+, adds high-visibility contrast borders.
2. **High Contrast Mode:**
   - High-contrast visual palette with distinct outlines for visually impaired seniors.
3. **Voice Assistant (Web Speech Recognition):**
   - Seniors can tap the microphone and speak naturally:
     - *"What pills do I take today?"*
     - *"Mark my morning pill as taken"*
     - *"When is my next doctor appointment?"*
     - *"Can I take Aspirin with Warfarin?"*
4. **Emergency SOS Distress Beacon:**
   - Unmistakable one-touch red SOS button.
   - Broadcasts instant emergency alerts & emails to all linked family members and caregivers.
   - Displays immediate Emergency Medical Card for first responders (blood group, allergies, address, physician).
   - Generates an audible alarm beacon via the Web Audio API synthesizer.
5. **AI Healthcare Routine Assistant:**
   - Clinical drug interaction checker (e.g. Aspirin + Warfarin bleeding risk, Calcium + Iron absorption interaction, Statins + Grapefruit).
   - Guidance on missed dose protocols.
   - Informational only disclaimer prominently presented to ensure patient safety.

---

## 🛠️ Technology Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Lucide React, Canvas Confetti
- **Backend:** Node.js, Express.js, Mongoose, Node-Cron, Nodemailer
- **Database:** MongoDB with Mongoose (Embedded MongoDB Engine for instant zero-config startup)
- **Authentication:** JSON Web Tokens (JWT) & PIN Passcode Verification

---

## 💻 Running the Platform Locally

### 1. Prerequisites
- Node.js (v18+)
- npm (v9+)

### 2. Backend Startup
```bash
cd backend
npm install
npm start
```
*Backend runs on `http://localhost:5050` and automatically connects to MongoDB, auto-seeding sample data on first start.*

### 3. Frontend Startup
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173` with proxy configured to backend `http://localhost:5050`.*
