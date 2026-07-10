import { supabase } from './supabase';

/**
 * Upload a complaint photo to the Supabase Storage bucket 'complaints'.
 */
export const uploadComplaintPhoto = async (photoFile, residentId) => {
  if (!photoFile) return null;

  const fileExt = photoFile.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
  const filePath = `${residentId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('complaints')
    .upload(filePath, photoFile);

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('complaints')
    .getPublicUrl(filePath);

  return publicUrl;
};

/**
 * Create a new complaint.
 */
export const createComplaint = async ({ residentId, category, description, photoFile }) => {
  let photoUrl = null;

  // 1. Upload photo if present
  if (photoFile) {
    photoUrl = await uploadComplaintPhoto(photoFile, residentId);
  }

  // 2. Insert complaint record
  const { data, error } = await supabase
    .from('complaints')
    .insert({
      resident_id: residentId,
      category,
      description,
      photo_url: photoUrl,
      status: 'Open',
      priority: 'Low',
      is_overdue: false,
    })
    .select()
    .single();

  if (error) throw error;

  // Create initial history record
  await supabase.from('complaint_history').insert({
    complaint_id: data.id,
    old_status: null,
    new_status: 'Open',
    note: 'Complaint registered successfully.',
    changed_by: residentId,
  });

  return data;
};

/**
 * Fetch all complaints raised by a specific resident.
 */
export const getComplaintsForResident = async (residentId) => {
  const { data, error } = await supabase
    .from('complaints')
    .select('*')
    .eq('resident_id', residentId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

/**
 * Fetch all complaints for Admin view, supporting rich filtering, search, and sorting.
 */
export const getAllComplaints = async () => {
  const { data, error } = await supabase
    .from('complaints')
    .select('*, resident:users(*)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

/**
 * Fetch a single complaint, including the resident info and its status history timeline.
 */
export const getComplaintById = async (complaintId) => {
  // 1. Fetch complaint
  const { data: complaint, error: compError } = await supabase
    .from('complaints')
    .select('*, resident:users(*)')
    .eq('id', complaintId)
    .single();

  if (compError) throw compError;

  // 2. Fetch history with join to user profile (changer)
  const { data: history, error: histError } = await supabase
    .from('complaint_history')
    .select('*, changer:users(full_name, role)')
    .eq('complaint_id', complaintId)
    .order('changed_at', { ascending: true });

  if (histError) throw histError;

  return {
    ...complaint,
    history: history || [],
  };
};

/**
 * Update a complaint's status and priority, and insert a log in the history table.
 */
export const updateComplaintAdmin = async (complaintId, { status, priority, note, adminId, oldStatus }) => {
  // 1. Update the complaint table
  const updatePayload = { priority };
  
  // If status is updated, include it (closed_at is updated automatically via trigger if Resolved)
  if (status) {
    updatePayload.status = status;
  }

  const { data: updatedComplaint, error: updateError } = await supabase
    .from('complaints')
    .update(updatePayload)
    .eq('id', complaintId)
    .select()
    .single();

  if (updateError) throw updateError;

  // 2. Insert record into complaint_history
  if (status && status !== oldStatus) {
    const { error: histError } = await supabase.from('complaint_history').insert({
      complaint_id: complaintId,
      old_status: oldStatus,
      new_status: status,
      note: note || `Status updated to ${status}.`,
      changed_by: adminId,
    });

    if (histError) {
      console.error('Failed to log complaint history:', histError);
    }
  }

  return updatedComplaint;
};

/**
 * Update an existing complaint by the resident (only allowed if status is 'Open').
 */
export const updateComplaintResident = async (complaintId, { category, description, photoFile, removePhoto, residentId }) => {
  let photoUrl = undefined;

  if (photoFile) {
    photoUrl = await uploadComplaintPhoto(photoFile, residentId);
  } else if (removePhoto) {
    photoUrl = null;
  }

  const updatePayload = {
    category,
    description,
  };

  if (photoUrl !== undefined) {
    updatePayload.photo_url = photoUrl;
  }

  const { data, error } = await supabase
    .from('complaints')
    .update(updatePayload)
    .eq('id', complaintId)
    .select()
    .single();

  if (error) throw error;

  // Add history record for the edit
  await supabase.from('complaint_history').insert({
    complaint_id: complaintId,
    old_status: data.status,
    new_status: data.status,
    note: 'Complaint details updated by resident.',
    changed_by: residentId,
  });

  return data;
};

/**
 * Toggle the overdue status of a complaint.
 */
export const setComplaintOverdue = async (complaintId, isOverdue) => {
  const { data, error } = await supabase
    .from('complaints')
    .update({ is_overdue: isOverdue })
    .eq('id', complaintId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Delete a complaint.
 */
export const deleteComplaint = async (complaintId) => {
  const { error } = await supabase
    .from('complaints')
    .delete()
    .eq('id', complaintId);

  if (error) throw error;
  return true;
};
