import { supabase } from './supabase';

/**
 * Register a new resident user.
 * Fields like full_name, phone, flat_number, building, and role are passed in user metadata.
 * The DB trigger on auth.users automatically inserts these fields into public.users.
 */
export const signUpUser = async ({ email, password, fullName, phone, flatNumber, building }) => {
  // Sign up using Supabase auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone,
        flat_number: flatNumber,
        building,
        role: 'RESIDENT', // Automatically default to resident on signup
      },
    },
  });

  if (error) throw error;
  return data;
};

/**
 * Sign in a user (Admin or Resident).
 */
export const signInUser = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

/**
 * Sign out current authenticated user.
 */
export const signOutUser = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

/**
 * Retrieve the current authenticated user session and their public profile.
 */
export const getCurrentUser = async () => {
  // Get auth session user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return null;

  // Retrieve user's details from public.users table
  const { data: profile, error: profileError } = await supabase.query
    ? await supabase.from('users').select('*').eq('id', user.id).single()
    : await supabase.from('users').select('*').eq('id', user.id).single();

  if (profileError) {
    // If profile row doesn't exist yet, construct metadata profile as fallback
    return {
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || 'Resident User',
      phone: user.user_metadata?.phone || '',
      flat_number: user.user_metadata?.flat_number || '',
      building: user.user_metadata?.building || '',
      role: user.user_metadata?.role || 'RESIDENT',
      created_at: user.created_at,
    };
  }

  return profile;
};

/**
 * Fetch a specific user's public profile details.
 */
export const getUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
};
