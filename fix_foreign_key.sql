-- ============================================================================
-- SQL Script to Fix Foreign Key Constraint in public.complaint_history
-- Paste this script into your Supabase SQL Editor and click Run.
-- This allows you to delete users cleanly by cascading deletions to their
-- complaint history records.
-- ============================================================================

-- 1. Drop the existing foreign key constraint
ALTER TABLE public.complaint_history 
DROP CONSTRAINT IF EXISTS complaint_history_changed_by_fkey;

-- 2. Re-create the constraint with ON DELETE CASCADE
ALTER TABLE public.complaint_history 
ADD CONSTRAINT complaint_history_changed_by_fkey 
FOREIGN KEY (changed_by) 
REFERENCES public.users(id) 
ON DELETE CASCADE;
