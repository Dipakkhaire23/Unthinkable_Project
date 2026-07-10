-- ============================================================================
-- SQL Script to Fix Storage Bucket Row Level Security (RLS) Policies
-- Paste this script into your Supabase SQL Editor and click Run.
-- This allows authenticated users to upload, update, and delete photos in 
-- the 'complaints' storage bucket.
-- ============================================================================

-- 1. Enable INSERT (Upload) policy for authenticated users
CREATE POLICY "Allow authenticated uploads to complaints"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'complaints');

-- 2. Enable SELECT (View) policy for everyone (Public read access)
CREATE POLICY "Allow public read access to complaints"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'complaints');

-- 3. Enable UPDATE policy for authenticated users
CREATE POLICY "Allow authenticated updates to complaints"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'complaints')
WITH CHECK (bucket_id = 'complaints');

-- 4. Enable DELETE policy for authenticated users
CREATE POLICY "Allow authenticated deletes from complaints"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'complaints');
