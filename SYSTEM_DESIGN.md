# System Design Write-Up: Society Maintenance Tracker

This document details the architectural choices, database design, and key workflows implemented within the Society Maintenance Tracker system.

---

## 1. Complaint History & Audit Model
To ensure accountability and transparency, the application maintains a strict audit trail of all actions performed on a complaint through the `complaint_history` table.

### Schema Design:
- `complaint_id`: Foreign key referencing the parent complaint.
- `old_status` / `new_status`: Captures the transition states (`Open`, `In Progress`, `Resolved`).
- `note`: Rich descriptive text detailing the reason or action taken (e.g., admin remarks).
- `changed_by`: Reference to `users.id` identifying the actor.
- `changed_at`: Timestamp.

### Change Workflows:
1. **Resident Registration**: When a resident creates a complaint, the service initiates the first entry in `complaint_history` (e.g., `new_status: 'Open'`, `'Complaint registered successfully'`).
2. **Resident Updates**: Residents can edit descriptions/categories only if the ticket is still `Open`. Any edits trigger a new history log.
3. **Admin Actions**: Admins transition statuses or modify priorities, prompting required admin notes that are written to the history log.
4. **Database Automation**: A database trigger `on_complaint_status_change` automatically intercepts status modifications on the `complaints` table, setting `closed_at = NOW()` when resolved, and resetting it to `NULL` if reopened, guaranteeing structural integrity independent of frontend state.

---

## 2. Dynamic Overdue Detection
The system implements a configurable SLA threshold for complaint resolution.

### Mechanism:
1. **Configuration**: A key-value pair (`overdue_days`, default `7`) is stored in the `settings` table, allowing administrators to dynamically alter the SLA timeline in-app.
2. **Calculation**: The system dynamically flags complaints as overdue rather than storing stale state. In the complaints registry:
   $$\text{diffDays} = \left\lceil \frac{\text{CurrentTime} - \text{c.created\_at}}{1000 \times 60 \times 60 \times 24} \right\rceil$$
   If a ticket is unresolved (`status != 'Resolved'`) and $\text{diffDays} > \text{overdue\_days}$, the system tags the record as `is_overdue = true`.
3. **UI/UX Pinned Priority**: In the administrator dashboard and complaint registry, overdue complaints are styled with a distinct red highlight. During list rendering, the sorting algorithm overrides normal ordering rules, forcing active overdue complaints to stay pinned at the very top of the interface, ensuring immediate admin attention.

---

## 3. Secure Photo Handling Workflow
Allowing visual proof is critical for maintenance complaints. The system utilizes Supabase Storage integrated directly into the database.

### Workflow:
1. **Upload & Isolation**: When creating/updating a complaint, the resident attaches an image. The frontend calls `uploadComplaintPhoto()`, which streams the file to a public Supabase Storage bucket named `complaints`.
2. **Path Structuring**: Files are written to folders named after the resident's UUID: `bucket/resident_id/filename.ext`. The filename is generated dynamically using a combination of a random hash and a unix timestamp to prevent naming collisions.
3. **Database Mapping**: On successful upload, Supabase Storage returns a public URL. The frontend inserts/updates this URL in the complaint's `photo_url` column.
4. **Lifecycle Operations**: If a resident decides to update a ticket and check "Remove Photo", the system sets `photo_url` to `NULL` while RLS policies ensure residents can only modify files under their own directory path.

---

## 4. Multi-Channel Notification Flow
The application implements two robust paradigms for email dispatch to bypass browser-side CORS restrictions and protect credentials.

### Mechanism A: Supabase Edge Functions (Primary)
Used for notice board announcements and ticket status updates:
- **Event**: Admin creates an important notice or changes a complaint's status.
- **Invocation**: Frontend calls `supabase.functions.invoke('send-email', { body: ... })` using the authenticated user session.
- **Execution**: The Edge Function (Deno) running server-side retrieves `GMAIL_USER` and `GMAIL_PASS` securely from Supabase Secrets. It instantiates a Nodemailer Gmail transporter to email target resident(s) using HTML templates (e.g. including status change cards).
- **Logging**: The Edge Function records the outcome directly into `email_logs`.

### Mechanism B: Database-Level pg_net HTTP Triggers (Fallback/Automated)
Used for direct database-level events:
- **Event**: A record is inserted into `email_logs` with a `Pending` status.
- **Trigger**: The PostgreSQL trigger `trigger_on_pending_email` fires `process_outbound_emails()`.
- **Execution**: Using the `pg_net` database extension, the database makes an asynchronous outbound HTTP POST request to the Resend API (`https://api.resend.com/emails`), sending the email payload. The Resend API Key is read securely from the `settings` table.
- **Outcome**: The trigger automatically updates the email status to `Sent` or `Failed`.
