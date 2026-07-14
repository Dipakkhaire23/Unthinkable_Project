# Society Maintenance Tracker

A modern full-stack web application for housing societies to streamline complaint management, resident ticketing, announcements, and admin workflows.

## 🔗 Project Links
- **Hosted Application URL**: [https://unthinkable-maintenance-tracker.vercel.app](https://unthinkable-project-beige.vercel.app/)
- **System Design Write-Up**: [SYSTEM_DESIGN.md](file:///d:/Desktop/Unthinkable_Project/SYSTEM_DESIGN.md)

---

## 📋 Portal Features Overview

The platform supports two distinct interfaces using role-based routing (configured via Supabase Auth and User Database Profiles).

### 🏢 Resident Portal Features
* **Interactive Dashboard**: Displays active notice boards, personal ticket summary metrics, and quick action cards.
* **Submit Complaints**: Lodge tickets under dedicated categories (Water Leakage, Electricity, Lift, Security, Parking, Garbage, Cleaning, and Others) with a 20-character validation constraint.
* **Photo Evidence Upload**: Attach optional images dynamically saved to isolated folders in Supabase Storage.
* **My Complaints Directory**: List, search, filter, and delete personal complaints (deletion is allowed only if the complaint is still `Open`).
* **Detailed Timeline Audit**: Track the resolution status changes, timestamps, and admin remarks chronologically.
* **Announcements Notice Board**: Access announcements and notes sorted with important updates pinned at the top.

### 👑 Admin Portal Features
* **Real-time Analytics Dashboard**: View visual charts (complaints by status in a Pie Chart, categories breakdown in a Bar Chart) and quick list feeds.
* **Central Registry Control**: Access all resident complaints with multi-field search and filters (status, category, priority, resident name, and date range).
* **Ticket Actions**: Modify priority states (`Low`, `Medium`, `High`), update resolving status, and log required admin comments.
* **Configurable Overdue SLA**: Admins can configure the SLA resolution day threshold in the settings tab. Overdue complaints are dynamically highlighted in red and pinned at the top of the queue.
* **Notice Board CRUD**: Full creation, editing, and deletion controls over notices, with toggle pinning options to flag important notices and email them to residents.
* **System Email Logs**: Review database records of outgoing email notifications and their dispatch outcomes (Sent, Pending, Failed).

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
