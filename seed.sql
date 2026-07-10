-- ============================================================================
-- Society Maintenance Tracker - Sample Seed Data Script
-- Paste this script into the Supabase SQL Editor AFTER executing schema.sql.
-- This script creates a Resident account, an Admin account, and populates the 
-- database with sample complaints, histories, notices, and email logs.
-- ============================================================================

-- Clean up existing seed data (optional, only for clean slate testing)
TRUNCATE TABLE public.email_logs CASCADE;
TRUNCATE TABLE public.notices CASCADE;
TRUNCATE TABLE public.complaint_history CASCADE;
TRUNCATE TABLE public.complaints CASCADE;
DELETE FROM public.users;
DELETE FROM auth.users;

-- ============================================================================
-- 1. Create Authenticated Users in auth.users
-- ============================================================================

-- Create Resident user: resident@example.com (Password: password123)
-- Create Admin user: admin@example.com (Password: password123)
-- User metadata is stored as JSONB to trigger handle_new_user automatically.

INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
) VALUES (
    '00055555-5555-5555-5555-500000000000',
    '33333333-3333-3333-3333-333333333333', -- Resident UUID
    'authenticated',
    'authenticated',
    'resident@example.com',
    crypt('password123', gen_salt('bf', 10)), -- blowfish crypt password
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Sarah Connor", "phone": "9876543210", "flat_number": "A-402", "building": "Block A", "role": "RESIDENT"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
), (
    '00055555-5555-5555-5555-500000000000',
    '99999999-9999-9999-9999-999999999999', -- Admin UUID
    'authenticated',
    'authenticated',
    'admin@example.com',
    crypt('password123', gen_salt('bf', 10)), -- blowfish crypt password
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Arthur Pendragon", "phone": "9998887776", "flat_number": "Office-101", "building": "Club House", "role": "ADMIN"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
);

-- ============================================================================
-- 2. Update Public User Table (Trigger handles insertions, we adjust Admin role)
-- ============================================================================

-- Ensure roles are correctly synchronised (especially the ADMIN role)
UPDATE public.users 
SET role = 'ADMIN' 
WHERE id = '99999999-9999-9999-9999-999999999999';


-- ============================================================================
-- 3. Populate Notices Table
-- ============================================================================

INSERT INTO public.notices (id, title, description, important, created_by, created_at)
VALUES 
(
    '11111111-1111-1111-1111-111111111111',
    '⚠️ Scheduled Power Outage - Block A & B',
    'Please note that there will be a scheduled power outage on July 15th from 10:00 AM to 2:00 PM for high-voltage panel maintenance. Generators will backup lifts and common lobby lights only. Please plan your work accordingly.',
    true, -- Pinned/Important
    '99999999-9999-9999-9999-999999999999',
    NOW() - INTERVAL '1 day'
),
(
    '22222222-2222-2222-2222-222222222222',
    '🏊 swimming Pool Guidelines & Timings',
    'The swimming pool will remain open from 6:00 AM to 10:00 AM in the morning and 4:00 PM to 8:00 PM in the evening. Residents are requested to wear proper swimming attire and register guests at the clubhouse entrance.',
    false,
    '99999999-9999-9999-9999-999999999999',
    NOW() - INTERVAL '3 days'
),
(
    '33333333-3333-3333-3333-333333333333',
    '🚨 Security Update: Visitor Verification',
    'Starting Monday, all visitors, including delivery executives, must register via the Gatekeeper App. Unverified entry will be restricted. Residents are advised to pre-approve known visitors to avoid delays.',
    true, -- Pinned/Important
    '99999999-9999-9999-9999-999999999999',
    NOW() - INTERVAL '5 days'
),
(
    '44444444-4444-4444-4444-444444444444',
    '🧹 Rainwater Harvesting Cleaning Drive',
    'We will be conducting a maintenance clean-up drive of the rainwater harvesting pits this Saturday. Common area parking around Block C will be temporarily closed from 9:00 AM to 1:00 PM. Thank you for your cooperation.',
    false,
    '99999999-9999-9999-9999-999999999999',
    NOW() - INTERVAL '7 days'
);


-- ============================================================================
-- 4. Populate Complaints Table
-- ============================================================================

INSERT INTO public.complaints (id, resident_id, category, description, photo_url, status, priority, is_overdue, created_at, updated_at, closed_at)
VALUES 
(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '33333333-3333-3333-3333-333333333333',
    'Water Leakage',
    'There is a severe water leakage in the master bedroom washroom ceiling. Water is dripping continuously and has damaged the paint work. Immediate plumbing attention is requested.',
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=600', -- sample unsplash washroom photo
    'In Progress',
    'High',
    false,
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '1 day',
    null
),
(
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '33333333-3333-3333-3333-333333333333',
    'Lift',
    'The secondary lift in Block A is making a grinding noise while traveling between the 4th and 7th floors. The doors also shake while closing. Please have the maintenance company look at it.',
    null,
    'Open',
    'Medium',
    false,
    NOW() - INTERVAL '5 hours',
    NOW() - INTERVAL '5 hours',
    null
),
(
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '33333333-3333-3333-3333-333333333333',
    'Electricity',
    'Corridor tube lights outside flat A-402 are flickering constantly. It causes complete darkness at night. Requesting replacements for the bulbs.',
    null,
    'Resolved',
    'Low',
    false,
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '8 days',
    NOW() - INTERVAL '8 days'
),
(
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    '33333333-3333-3333-3333-333333333333',
    'Cleaning',
    'The garbage chute area on the 4th floor has not been cleaned this week. The accumulation of trash has started causing a foul smell. Requesting a thorough sanitization and clearing.',
    null,
    'Open',
    'Medium',
    true, -- Flagged as Overdue (older than default 7 days limit)
    NOW() - INTERVAL '9 days',
    NOW() - INTERVAL '9 days',
    null
);


-- ============================================================================
-- 5. Populate Complaint History
-- ============================================================================

INSERT INTO public.complaint_history (id, complaint_id, old_status, new_status, note, changed_by, changed_at)
VALUES 
-- Water Leakage timeline
(
    gen_random_uuid(),
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    null,
    'Open',
    'Complaint registered successfully.',
    '33333333-3333-3333-3333-333333333333', -- resident
    NOW() - INTERVAL '2 days'
),
(
    gen_random_uuid(),
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Open',
    'In Progress',
    'Plumber has been assigned. They will visit your flat tomorrow afternoon to inspect the ceiling pipes.',
    '99999999-9999-9999-9999-999999999999', -- admin
    NOW() - INTERVAL '1 day'
),

-- Lift timeline
(
    gen_random_uuid(),
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    null,
    'Open',
    'Complaint registered successfully.',
    '33333333-3333-3333-3333-333333333333',
    NOW() - INTERVAL '5 hours'
),

-- Corridor lights timeline
(
    gen_random_uuid(),
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    null,
    'Open',
    'Complaint registered successfully.',
    '33333333-3333-3333-3333-333333333333',
    NOW() - INTERVAL '10 days'
),
(
    gen_random_uuid(),
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'Open',
    'In Progress',
    'Electrician scheduled to replace lights during common area round.',
    '99999999-9999-9999-9999-999999999999',
    NOW() - INTERVAL '9 days'
),
(
    gen_random_uuid(),
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'In Progress',
    'Resolved',
    'Two LED tube lights replaced on the 4th floor corridor outside A-402. Work verified.',
    '99999999-9999-9999-9999-999999999999',
    NOW() - INTERVAL '8 days'
),

-- Overdue Garbage timeline
(
    gen_random_uuid(),
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    null,
    'Open',
    'Complaint registered successfully.',
    '33333333-3333-3333-3333-333333333333',
    NOW() - INTERVAL '9 days'
);


-- ============================================================================
-- 6. Populate Email Logs
-- ============================================================================

INSERT INTO public.email_logs (id, recipient, subject, status, sent_at)
VALUES 
(
    gen_random_uuid(),
    'resident@example.com',
    'Complaint Status Update: #aaaaaaaa is now In Progress',
    'Sent',
    NOW() - INTERVAL '1 day'
),
(
    gen_random_uuid(),
    'resident@example.com',
    'Complaint Status Update: #cccccccc is now In Progress',
    'Sent',
    NOW() - INTERVAL '9 days'
),
(
    gen_random_uuid(),
    'resident@example.com',
    'Complaint Status Update: #cccccccc is now Resolved',
    'Sent',
    NOW() - INTERVAL '8 days'
);
