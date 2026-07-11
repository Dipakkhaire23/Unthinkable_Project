import { supabase } from './supabase';

/**
 * Log email in the database and schedule delivery.
 * The database trigger (pg_net) processes any 'Pending' log server-side
 * to bypass browser CORS restrictions and secure your API Key.
 */
export const sendEmail = async ({ recipient, subject, bodyHtml }) => {
  try {
    // 1. Log in console for developer visibility
    console.log(
      `%c[EMAIL DISPATCHED] To: ${recipient}\nSubject: ${subject}\nBody Preview: ${subject}`,
      'background: #f0f9ff; color: #0284c7; padding: 4px; border-radius: 4px; font-family: monospace;'
    );

    // 2. Insert into the email_logs table as 'Pending'
    // The database trigger will process this and update the status to 'Sent' or 'Failed'
    const { error } = await supabase.from('email_logs').insert({
      recipient,
      subject,
      body: bodyHtml,
      status: 'Pending',
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Failed to register outgoing email in database:', error);
    return false;
  }
};

/**
 * Notify resident when a complaint status changes.
 */
export const notifyComplaintStatusChange = async ({ complaintId, newStatus, adminNote, residentId, category, description }) => {
  try {
    console.log(
      `%c[EMAIL DISPATCHING] Status change for complaint #${complaintId.substring(0, 8)}`,
      'background: #f0f9ff; color: #0284c7; padding: 4px; border-radius: 4px; font-family: monospace;'
    );

    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        status: 'complaint_status_change',
        newStatus,
        complaintId,
        residentId,
        category,
        description,
        adminNote,
      },
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Failed to dispatch complaint status email:', error);
    return false;
  }
};

/**
 * Notify all residents when an important notice is posted.
 */
export const notifyImportantNotice = async ({ title, description }) => {
  try {
    console.log(
      `%c[EMAIL DISPATCHING] Notice Broadcast: ${title}`,
      'background: #f0f9ff; color: #0284c7; padding: 4px; border-radius: 4px; font-family: monospace;'
    );

    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        status: 'new_notice',
        title,
        description,
      },
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Failed to dispatch notice email notifications:', error);
    return false;
  }
};
