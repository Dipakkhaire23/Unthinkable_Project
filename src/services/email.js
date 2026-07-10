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
export const notifyComplaintStatusChange = async ({ complaintId, newStatus, adminNote, recipientEmail, residentName }) => {
  const timestamp = new Date().toLocaleString();
  const subject = `Complaint Status Update: #${complaintId.substring(0, 8)} is now ${newStatus}`;
  
  const bodyHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #0284c7; margin-bottom: 20px;">Society Maintenance Tracker</h2>
      <p>Hello <strong>${residentName}</strong>,</p>
      <p>The status of your complaint has been updated.</p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr style="background-color: #f8fafc;">
          <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Complaint ID</td>
          <td style="padding: 10px; border: 1px solid #e2e8f0;">${complaintId}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">New Status</td>
          <td style="padding: 10px; border: 1px solid #e2e8f0;">
            <span style="background-color: #e0f2fe; color: #0369a1; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">${newStatus}</span>
          </td>
        </tr>
        <tr style="background-color: #f8fafc;">
          <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Admin Note</td>
          <td style="padding: 10px; border: 1px solid #e2e8f0;">${adminNote || 'No additional notes.'}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Updated At</td>
          <td style="padding: 10px; border: 1px solid #e2e8f0;">${timestamp}</td>
        </tr>
      </table>
      
      <p>To view history, please log in to the Society Maintenance Tracker dashboard.</p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="font-size: 12px; color: #64748b; text-align: center;">This is an automated notification. Please do not reply directly to this email.</p>
    </div>
  `;

  return await sendEmail({ recipient: recipientEmail, subject, bodyHtml });
};

/**
 * Notify all residents when an important notice is posted.
 */
export const notifyImportantNotice = async ({ title, description, residentEmails }) => {
  const timestamp = new Date().toLocaleString();
  const subject = `⚠️ URGENT Notice: ${title}`;

  const bodyHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #fee2e2; border-radius: 8px; background-color: #fffbeb;">
      <h2 style="color: #dc2626; margin-bottom: 20px;">Society Important Announcement</h2>
      <p>Dear Resident,</p>
      <p>An important notice has been posted on the Notice Board.</p>
      
      <div style="background-color: #ffffff; padding: 15px; border-left: 4px solid #dc2626; border-radius: 4px; margin: 20px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
        <h3 style="margin-top: 0; color: #1e293b;">${title}</h3>
        <p style="white-space: pre-wrap; color: #475569;">${description}</p>
      </div>

      <p style="font-size: 13px; color: #475569;">Date Posted: ${timestamp}</p>
      <hr style="border: 0; border-top: 1px solid #fee2e2; margin: 20px 0;" />
      <p style="font-size: 12px; color: #64748b; text-align: center;">This is an automated announcement broadcasted to all registered residents.</p>
    </div>
  `;

  // Broadcast to all emails
  const promises = residentEmails.map((email) =>
    sendEmail({ recipient: email, subject, bodyHtml })
  );

  await Promise.all(promises);
};
