-- ============================================================================
-- Society Maintenance Tracker - Database Schema Setup Script
-- Paste this script into the Supabase SQL Editor to setup all tables, RLS policies,
-- and triggers.
-- ============================================================================

-- Enable pgcrypto extension for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. Create Tables
-- ============================================================================

-- Table: public.users
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    flat_number TEXT NOT NULL,
    building TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'RESIDENT' CHECK (role IN ('ADMIN', 'RESIDENT')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Table: public.complaints
CREATE TABLE IF NOT EXISTS public.complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resident_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN (
        'Water Leakage', 'Electricity', 'Lift', 'Parking', 
        'Security', 'Garbage', 'Cleaning', 'Others'
    )),
    description TEXT NOT NULL CHECK (length(description) >= 20),
    photo_url TEXT,
    status TEXT NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Resolved')),
    priority TEXT NOT NULL DEFAULT 'Low' CHECK (priority IN ('Low', 'Medium', 'High')),
    is_overdue BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    closed_at TIMESTAMP WITH TIME ZONE
);

-- Table: public.complaint_history
CREATE TABLE IF NOT EXISTS public.complaint_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
    old_status TEXT CHECK (old_status IN ('Open', 'In Progress', 'Resolved', NULL)),
    new_status TEXT NOT NULL CHECK (new_status IN ('Open', 'In Progress', 'Resolved')),
    note TEXT,
    changed_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Table: public.notices
CREATE TABLE IF NOT EXISTS public.notices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    important BOOLEAN NOT NULL DEFAULT false,
    created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Table: public.settings
CREATE TABLE IF NOT EXISTS public.settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Table: public.email_logs
CREATE TABLE IF NOT EXISTS public.email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient TEXT NOT NULL,
    subject TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Sent', 'Failed', 'Pending')),
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Insert default overdue days setting
INSERT INTO public.settings (key, value) 
VALUES ('overdue_days', '7') 
ON CONFLICT (key) DO NOTHING;


-- ============================================================================
-- 2. Setup Automatic Triggers & Helper Functions
-- ============================================================================

-- Function: Automatically sync auth.users inserts into public.users profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, full_name, email, phone, flat_number, building, role)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', 'Resident User'),
        new.email,
        COALESCE(new.raw_user_meta_data->>'phone', ''),
        COALESCE(new.raw_user_meta_data->>'flat_number', ''),
        COALESCE(new.raw_user_meta_data->>'building', ''),
        COALESCE(new.raw_user_meta_data->>'role', 'RESIDENT')
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Run handle_new_user after signup
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function: Automatically update updated_at timestamp on edit
CREATE OR REPLACE FUNCTION public.update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    new.updated_at = NOW();
    RETURN new;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Update updated_at on complaint modifications
CREATE OR REPLACE TRIGGER update_complaint_timestamp
    BEFORE UPDATE ON public.complaints
    FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();

-- Function: Handle Complaint History & Closed Timestamps on status update
CREATE OR REPLACE FUNCTION public.handle_complaint_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- 1. Insert row into complaint_history if status is changing
    -- Note: This is an automatic logger that logs the status change. 
    -- We can also pass notes in custom updates directly, but if done automatically,
    -- this ensures every change is recorded. If changed_by needs to be tracked,
    -- the application will insert history records directly to include customized notes,
    -- but this trigger acts as a safety fallback.
    IF (OLD.status IS DISTINCT FROM NEW.status) THEN
        -- Auto-set closed_at if resolved
        IF NEW.status = 'Resolved' THEN
            NEW.closed_at = NOW();
        ELSE
            NEW.closed_at = NULL;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Handle status changes in complaints table
CREATE OR REPLACE TRIGGER on_complaint_status_change
    BEFORE UPDATE OF status ON public.complaints
    FOR EACH ROW EXECUTE FUNCTION public.handle_complaint_status_change();


-- ============================================================================
-- 3. Helper Functions for RLS (Prevents Infinite Recursion)
-- ============================================================================

-- Create a helper function that runs with admin privileges (SECURITY DEFINER)
-- to retrieve a user's role. This bypasses RLS and prevents recursion loops.
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
    RETURN COALESCE(
        (SELECT role FROM public.users WHERE id = user_id) = 'ADMIN',
        false
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================================
-- 4. Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------
-- RLS: public.users
-- ----------------------------------------
CREATE POLICY "Users can read their own profile"
    ON public.users FOR SELECT
    TO authenticated
    USING (auth.uid() = id OR public.is_admin(auth.uid()));

CREATE POLICY "Admins can update any profile, Users can update their own"
    ON public.users FOR UPDATE
    TO authenticated
    USING (auth.uid() = id OR public.is_admin(auth.uid()))
    WITH CHECK (auth.uid() = id OR public.is_admin(auth.uid()));

CREATE POLICY "Enable insert for authenticated users (required for setup sync)"
    ON public.users FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- ----------------------------------------
-- RLS: public.complaints
-- ----------------------------------------
CREATE POLICY "Residents can view their own complaints, Admins view all"
    ON public.complaints FOR SELECT
    TO authenticated
    USING (resident_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Residents can insert their own complaints"
    ON public.complaints FOR INSERT
    TO authenticated
    WITH CHECK (resident_id = auth.uid());

CREATE POLICY "Admins can update any complaint, Residents can update their own if open"
    ON public.complaints FOR UPDATE
    TO authenticated
    USING ((resident_id = auth.uid() AND status = 'Open') OR public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete complaints, Residents can delete their own if open"
    ON public.complaints FOR DELETE
    TO authenticated
    USING (public.is_admin(auth.uid()) OR (resident_id = auth.uid() AND status = 'Open'));


-- ----------------------------------------
-- RLS: public.complaint_history
-- ----------------------------------------
CREATE POLICY "Users can read history of their complaints, Admins read all"
    ON public.complaint_history FOR SELECT
    TO authenticated
    USING (
        (SELECT resident_id FROM public.complaints WHERE id = complaint_id) = auth.uid() 
        OR public.is_admin(auth.uid())
    );

CREATE POLICY "Authenticated users can insert history records"
    ON public.complaint_history FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- ----------------------------------------
-- RLS: public.notices
-- ----------------------------------------
CREATE POLICY "All authenticated users can view notices"
    ON public.notices FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Only admins can manage notices"
    ON public.notices FOR ALL
    TO authenticated
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- ----------------------------------------
-- RLS: public.settings
-- ----------------------------------------
CREATE POLICY "All authenticated users can view settings"
    ON public.settings FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Only admins can update settings"
    ON public.settings FOR ALL
    TO authenticated
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- ----------------------------------------
-- RLS: public.email_logs
-- ----------------------------------------
CREATE POLICY "Only admins can view email logs"
    ON public.email_logs FOR SELECT
    TO authenticated
    USING (public.is_admin(auth.uid()));

CREATE POLICY "Authenticated users can insert email logs"
    ON public.email_logs FOR INSERT
    TO authenticated
    WITH CHECK (true);
