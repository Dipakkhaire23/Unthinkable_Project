import { createClient } from '@supabase/supabase-js';

// Read configuration from environment variables
let supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Clean the URL if it contains the "/rest/v1/" suffix
if (supabaseUrl) {
  supabaseUrl = supabaseUrl.replace(/\/rest\/v1\/?$/, '');
}

// Export configuration state to render warnings/setup guides
export const isConfigured = !!(supabaseUrl && supabaseAnonKey);

// Fallback to a mock project string if missing to prevent instant JS loading crash
const url = isConfigured ? supabaseUrl : 'https://placeholder-project.supabase.co';
const key = isConfigured ? supabaseAnonKey : 'placeholder-anon-key';

export const supabase = createClient(url, key);
