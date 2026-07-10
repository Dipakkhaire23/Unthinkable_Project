# Society Maintenance Tracker

A modern, full-stack web application designed for housing societies to streamline complaint management, resident ticketing, announcements, and admin workflows.

## Technology Stack
- **Frontend**: React (Vite), Tailwind CSS v3, React Router DOM, Context API, Recharts, Lucide Icons.
- **Backend (Database)**: Supabase PostgreSQL, Supabase Authentication, Supabase Storage.

---

## Features

### 🔑 Authentication
- Role-based routing: **RESIDENT** and **ADMIN**.
- Session persistence after browser refreshes.
- Automatic synchronisation: Signups via Supabase Auth automatically create public profile table entries through triggers.

### 🏢 Resident Portal
- **Dashboard**: High-level counters, active notice boards, and quick links to raise complaints.
- **Raise Complaint**: Dropdown categories, description constraints (minimum 20 characters), and optional photo upload.
- **My Complaints**: Search, filter, and track resolving states.
- **Timeline**: View detailed logs of status changes, admin notes, and dates.
- **Notice Board**: Displays announcements with critical posts pinned at the top.

### 👑 Admin Portal
- **Dashboard Analytics**: Graphical breakdowns of complaints by status (Pie chart) and categories (Bar chart), with quick listings of recent items.
- **Complaint Management**: Rich filtering by status, priority, category, date ranges, and resident names, with sort sorting metrics.
- **Update Logs**: Directly alter ticket status, allocate priorities, and insert customized notes.
- **Overdue Tracking**: Highlight overdue complaints in red and pin them to the top. The overdue day threshold is fully configurable in settings.
- **Notice Management**: Complete CRUD options for notice board items. Mark notices as important to pin them and send notification emails.
- **Notification Logs**: Review all outgoing mail logs.

---

## Step-by-Step Setup Instructions

### 1. Create a Supabase Project
1. Log in to [Supabase](https://supabase.com/).
2. Create a new project. Note your **API URL** and **Anon Key** from the Project Settings.

### 2. Configure Database Tables & Sample Seed
1. Navigate to the **SQL Editor** tab in your Supabase Dashboard.
2. Click **New Query**, copy the contents of [schema.sql](file:///d:/Desktop/Unthinkable_Project/schema.sql), and click **Run**.
3. Create another query, copy the contents of [seed.sql](file:///d:/Desktop/Unthinkable_Project/seed.sql), and click **Run** to load testing accounts and metrics.

### 3. Setup Supabase Storage
1. Navigate to the **Storage** tab in your Supabase Dashboard.
2. Click **New Bucket**, name it exactly `complaints`, and check the **Public** bucket option.
3. Save the bucket.

### 4. Setup Environment Config
Create a file named `.env` in the root of the project:
```env
VITE_SUPABASE_URL=your_supabase_project_api_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_public_key

# Optional: Set this key to send actual emails. 
# If not defined, emails are logged in the DB (email_logs) and simulated in the console.
VITE_RESEND_API_KEY=
```

### 5. Install Dependencies and Run App
Open a terminal in the project directory:
```powershell
# Install Node dependencies
npm install

# Run the local Vite dev server
npm run dev
```

---

## 👥 Sample Seed Accounts for Testing

Use these accounts to test the system right away (created via the `seed.sql` script):

### 1. Resident Portal
- **Email**: `resident@example.com`
- **Password**: `password123`
- **Details**: Sarah Connor, Flat A-402, Block A

### 2. Admin Portal
- **Email**: `admin@example.com`
- **Password**: `password123`
- **Details**: Arthur Pendragon, Club House
