# Society Maintenance Tracker

A modern full-stack web application for housing societies to streamline complaint management, resident ticketing, announcements, and admin workflows.

## 🔗 Project Links
- **Hosted Application URL**: [https://unthinkable-maintenance-tracker.vercel.app](https://unthinkable-project-beige.vercel.app/)
- **System Design Write-Up**: [SYSTEM_DESIGN.md](file:///d:/Desktop/Unthinkable_Project/SYSTEM_DESIGN.md)

---

## 🛠️ Step-by-Step Setup Guide

### 1. Database Setup (Supabase)
1. Create a project on [Supabase](https://supabase.com/).
2. Run the SQL script [schema.sql](file:///d:/Desktop/Unthinkable_Project/schema.sql) in the Supabase SQL Editor.
3. Run [seed.sql](file:///d:/Desktop/Unthinkable_Project/seed.sql) to load test accounts.
4. Create a **Public** Storage bucket named `complaints`.

### 2. Edge Function Deploy (Optional for Email)
1. Install Supabase CLI: `npm install -g supabase`.
2. Link your project: `supabase link --project-ref <project-ref>`.
3. Set secrets: `supabase secrets set GMAIL_USER="<email>" GMAIL_PASS="<app-pass>"`.
4. Deploy the function: `supabase functions deploy send-email`.

### 3. Run Locally
1. Create a `.env` file in the root directory (refer to [.env.example](file:///d:/Desktop/Unthinkable_Project/.env)):
   ```env
   VITE_SUPABASE_URL=your_supabase_project_api_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_public_key
   VITE_RESEND_API_KEY=your_optional_resend_api_key
   ```
2. Run the commands:
   ```bash
   npm install
   npm run dev
   ```

---

## 👥 Test Accounts
* **Resident**: `dipakhaire23@gmail.com` / `123456789`
* **Admin**: `om2004@gmail.com` / `123456789`

---

## 🗄️ Database Schema & API Docs

### Database Schema Overview
The database operates under the `public` schema. Detailed SQL schemas are located in [schema.sql](file:///d:/Desktop/Unthinkable_Project/schema.sql).
- **`users`**: Profiles synced from `auth.users` containing flat numbers and roles (`RESIDENT`, `ADMIN`).
- **`complaints`**: Track categories, descriptions, priorities, status, and attachment URLs.
- **`complaint_history`**: Audit trail mapping status updates, notes, and the actor UUID.
- **`notices`**: Notice board updates.
- **`settings`**: Configuration flags (e.g. `overdue_days`).
- **`email_logs`**: Logs all outgoing emails.

### API Documentation (Edge Function)
- **Endpoint**: `POST https://<project-ref>.supabase.co/functions/v1/send-email`
- **Headers**:
  ```http
  Authorization: Bearer <anon-key>
  Content-Type: application/json
  ```
- **Complaint Update Payload**:
  ```json
  {
    "status": "complaint_status_change",
    "complaintId": "complaint-uuid",
    "residentId": "resident-uuid",
    "category": "Water Leakage",
    "description": "...",
    "newStatus": "Resolved",
    "adminNote": "..."
  }
  ```
- **Important Notice Broadcast Payload**:
  ```json
  {
    "status": "new_notice",
    "title": "...",
    "description": "..."
  }
  ```
