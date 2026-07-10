-- ============================================================================
-- SQL Script to Set up Server-Side Email Delivery (Bypasses CORS restrictions)
-- Paste this script into your Supabase SQL Editor and click Run.
-- This script enables the pg_net extension, alters the email_logs table,
-- and attaches a trigger that calls the Resend API directly from the database server.
-- ============================================================================

-- 1. Enable the pg_net HTTP extension
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Add 'body' column to public.email_logs to store the email content
ALTER TABLE public.email_logs 
ADD COLUMN IF NOT EXISTS body TEXT;

-- 3. Insert Resend API Key setting placeholder (if it doesn't exist)
-- This allows the database to read your key securely without exposing it to browsers
INSERT INTO public.settings (key, value)
VALUES ('resend_api_key', '')
ON CONFLICT (key) DO NOTHING;


-- 4. Create the background trigger function to execute HTTP POST to Resend
CREATE OR REPLACE FUNCTION public.process_outbound_emails()
RETURNS TRIGGER AS $$
DECLARE
    resend_key TEXT;
BEGIN
    -- Retrieve Resend API key from database settings
    SELECT value INTO resend_key FROM public.settings WHERE key = 'resend_api_key';

    -- If key is empty or default placeholder, mark as Sent (local simulation fallback)
    IF resend_key IS NULL OR resend_key = '' OR resend_key = 'your_resend_api_key' THEN
        UPDATE public.email_logs 
        SET status = 'Sent' 
        WHERE id = NEW.id;
        
        RAISE NOTICE 'Resend API key is missing. Simulating email logging only.';
        RETURN NEW;
    END IF;

    -- Make server-side HTTP request to Resend using pg_net
    PERFORM net.http_post(
        url := 'https://api.resend.com/emails',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || resend_key
        ),
        body := jsonb_build_object(
            'from', 'Society Tracker <onboarding@resend.dev>',
            'to', ARRAY[NEW.recipient], -- Resend expects 'to' as string or array
            'subject', NEW.subject,
            'html', NEW.body
        )
    );

    -- Automatically transition status from 'Pending' to 'Sent'
    UPDATE public.email_logs 
    SET status = 'Sent' 
    WHERE id = NEW.id;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Capture any HTTP or database failure in logs
    UPDATE public.email_logs 
    SET status = 'Failed' 
    WHERE id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 5. Attach the trigger to public.email_logs table
DROP TRIGGER IF EXISTS trigger_on_pending_email ON public.email_logs;
CREATE TRIGGER trigger_on_pending_email
    AFTER INSERT ON public.email_logs
    FOR EACH ROW
    WHEN (NEW.status = 'Pending')
    EXECUTE FUNCTION public.process_outbound_emails();
