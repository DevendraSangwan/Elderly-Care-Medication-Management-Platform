# 🏥 CareBridge — Elderly Care & Medication Management Platform

An interconnected, accessible healthcare ecosystem designed to help elderly individuals independently manage their daily medications, appointments, and health routines while keeping family members and caregivers informed in real time.

## 🚀 Live Deployment
- **Live Web App (Vercel):** https://elderly-care-medication-management.vercel.app
- **Backend API (Render):** https://elderly-care-medication-management.onrender.com

## ✨ Key Features
- **3 Role-Based Dashboards:** Dedicated interfaces for **Elderly Individuals**, **Family Members**, and **Caregivers**.
- **6-Digit Care Passcode Linking:** Securely connect family members and caregivers to an elderly profile with Role-Based Access Control (RBAC).
- **Medication & Adherence Tracking:** Daily schedules, one-click *Mark as Taken*, visual adherence analytics, and missed-dose alerts.
- **Automated Reminders & Email Notifications:** Built-in cron scheduler (`node-cron` + `Nodemailer`) for upcoming doses, missed-dose escalation, and doctor appointments.
- **Elderly-First Accessibility & Innovation:**
  - 🗣️ **Voice Assistant** (Web Speech API) for spoken medication schedules.
  - 🚨 **Emergency SOS Modal** with quick-access emergency contacts.
  - 🤖 **AI Health Routine Assistant** (with informational medical disclaimer).
  - 👓 High-contrast UI, large readable typography, and mobile-responsive layout.

## 🛠️ Tech Stack
- **Frontend:** React 18, Vite, Tailwind CSS, Lucide Icons
- **Backend:** Node.js, Express.js, JWT Authentication, Node-Cron, Nodemailer
- **Database:** MongoDB Atlas & Mongoose
