import { supabase } from './supabase';

/**
 * Fetch all notices.
 * Standard sorting puts important (pinned) notices first, then sorted by newest.
 */
export const getAllNotices = async () => {
  const { data, error } = await supabase
    .from('notices')
    .select('*, author:users(full_name)')
    .order('important', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

/**
 * Create a new notice.
 */
export const createNotice = async ({ title, description, important, adminId }) => {
  const { data, error } = await supabase
    .from('notices')
    .insert({
      title,
      description,
      important,
      created_by: adminId,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Update an existing notice.
 */
export const updateNotice = async (noticeId, { title, description, important }) => {
  const { data, error } = await supabase
    .from('notices')
    .update({
      title,
      description,
      important,
    })
    .eq('id', noticeId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Delete a notice.
 */
export const deleteNotice = async (noticeId) => {
  const { error } = await supabase
    .from('notices')
    .delete()
    .eq('id', noticeId);

  if (error) throw error;
  return true;
};
