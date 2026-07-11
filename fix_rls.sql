-- ============================================================================
-- SQL Script to Fix Infinite Recursion in Row Level Security (RLS) Policies
-- Paste this script into your Supabase SQL Editor and click Run.
-- This script defines a SECURITY DEFINER helper function to check roles
-- without causing Postgres stack overflows, and updates all policies.
-- ============================================================================

-- 1. Create a helper function that runs with admin privileges (SECURITY DEFINER)
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


-- 2. Clean up existing recursive policies to avoid naming conflicts
DROP POLICY IF EXISTS "Users can read their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can update any profile, Users can update their own" ON public.users;

DROP POLICY IF EXISTS "Residents can view their own complaints, Admins view all" ON public.complaints;
DROP POLICY IF EXISTS "Admins can update any complaint, Residents can update their own if open" ON public.complaints;
DROP POLICY IF EXISTS "Admins can delete complaints" ON public.complaints;
DROP POLICY IF EXISTS "Admins can delete complaints, Residents can delete their own if open" ON public.complaints;

DROP POLICY IF EXISTS "Users can read history of their complaints, Admins read all" ON public.complaint_history;
DROP POLICY IF EXISTS "Only admins can manage notices" ON public.notices;
DROP POLICY IF EXISTS "Only admins can update settings" ON public.settings;
DROP POLICY IF EXISTS "Only admins can view email logs" ON public.email_logs;


-- 3. Re-create RLS Policies using the is_admin() helper function
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

-- ----------------------------------------
-- RLS: public.complaints
-- ----------------------------------------
CREATE POLICY "Residents can view their own complaints, Admins view all"
    ON public.complaints FOR SELECT
    TO authenticated
    USING (resident_id = auth.uid() OR public.is_admin(auth.uid()));

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

-- ----------------------------------------
-- RLS: public.notices
-- ----------------------------------------
CREATE POLICY "Only admins can manage notices"
    ON public.notices FOR ALL
    TO authenticated
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- ----------------------------------------
-- RLS: public.settings
-- ----------------------------------------
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
