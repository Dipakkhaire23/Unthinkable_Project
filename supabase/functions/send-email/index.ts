import nodemailer from "npm:nodemailer";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Retrieve environment variables securely from Supabase Secrets
const GMAIL_USER = Deno.env.get("GMAIL_USER") || "";
const GMAIL_PASS = Deno.env.get("GMAIL_PASS") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// Initialize Supabase Client with service role key (bypasses RLS for queries)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    const { status, newStatus, title, description, complaintId, category, residentId, adminNote } = await req.json();

    if (!GMAIL_USER || !GMAIL_PASS) {
      throw new Error("Gmail credentials (GMAIL_USER, GMAIL_PASS) are not configured in edge function environment variables");
    }

    // Initialize nodemailer Gmail transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_PASS,
      },
    });

    const results = [];

    // Helper to log emails in the DB
    const logEmail = async (recipient: string, subject: string, body: string, emailStatus: string) => {
      try {
        await supabase.from("email_logs").insert({
          recipient,
          subject,
          body,
          status: emailStatus,
        });
      } catch (err) {
        console.error("Failed to insert email log:", err);
      }
    };

    if (status === "new_notice") {
      if (!title || !description) {
        throw new Error("Missing 'title' or 'description' for new_notice notification");
      }

      // Fetch all users in the database with role 'RESIDENT'
      const { data: residents, error: fetchError } = await supabase
        .from("users")
        .select("email, full_name")
        .eq("role", "RESIDENT");

      if (fetchError) {
        throw new Error(`Failed to fetch residents: ${fetchError.message}`);
      }

      if (!residents || residents.length === 0) {
        return new Response(
          JSON.stringify({ success: true, message: "No registered residents to notify." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }

      console.log(`Sending notice notifications to ${residents.length} residents...`);

      // Send email to each resident
      for (const resident of residents) {
        const subject = `New Notice: ${title}`;
        const html = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f8fafc;">
                <tr>
                  <td align="center" style="padding: 40px 20px;">
                    <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
                      <tr>
                        <td style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px; text-align: center;">
                          <span style="font-size: 48px; display: block; margin-bottom: 12px;">📢</span>
                          <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.025em;">
                            New Society Notice
                          </h1>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 40px;">
                          <p style="margin: 0 0 20px 0; font-size: 16px; font-weight: 600; color: #1e293b;">
                            Hi ${resident.full_name || 'Resident'}! 👋
                          </p>
                          <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #475569;">
                            An important notice has been posted on the Notice Board. Please find the details below:
                          </p>
                          <div style="background: #fffbeb; padding: 24px; border-left: 4px solid #f59e0b; border-radius: 8px; margin-bottom: 28px;">
                            <h3 style="margin: 0 0 8px 0; font-size: 18px; color: #92400e; font-weight: 700;">
                              ${title}
                            </h3>
                            <p style="margin: 0; font-size: 14px; color: #78350f; line-height: 1.5; white-space: pre-wrap;">
                              ${description}
                            </p>
                          </div>
                          <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #64748b;">
                            Log in to the Society Maintenance Tracker dashboard to see all active notices.
                          </p>
                          <hr style="border: 0; border-top: 1px solid #f1f5f9; margin-bottom: 24px;">
                          <p style="margin: 0; font-size: 12px; color: #94a3b8; text-align: center;">
                            © ${new Date().getFullYear()} Society Maintenance Tracker. All rights reserved.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
          </html>
        `;

        try {
          const info = await transporter.sendMail({
            from: `"Society Maintenance" <${GMAIL_USER}>`,
            to: resident.email,
            subject,
            html,
            text: `Hi ${resident.full_name},\n\nAn important notice has been posted:\n\nTitle: ${title}\nDescription: ${description}`,
          });
          results.push({ email: resident.email, success: true, messageId: info.messageId });
          await logEmail(resident.email, subject, html, "Sent");
        } catch (sendErr) {
          console.error(`Failed to send email to ${resident.email}:`, sendErr);
          results.push({ email: resident.email, success: false, error: sendErr.message });
          await logEmail(resident.email, subject, html, "Failed");
        }
      }
    } else if (status === "complaint_status_change") {
      if (!complaintId || !residentId || !category || !description || !newStatus) {
        throw new Error("Missing parameters for complaint_status_change notification. Required: 'complaintId', 'residentId', 'category', 'description', 'newStatus'");
      }

      // Fetch the specific resident's email and full_name
      const { data: resident, error: fetchError } = await supabase
        .from("users")
        .select("email, full_name")
        .eq("id", residentId)
        .single();

      if (fetchError || !resident) {
        throw new Error(`Resident details not found in database: ${fetchError?.message || 'No record'}`);
      }

      const subject = `Complaint Update: #${complaintId.substring(0, 8)} is now ${newStatus}`;
      const headerGradient = newStatus === 'Resolved'
        ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' // Green
        : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'; // Blue

      const statusIcon = newStatus === 'Resolved' ? '✅' : '🔔';

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
            <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f8fafc;">
              <tr>
                <td align="center" style="padding: 40px 20px;">
                  <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
                    <tr>
                      <td style="background: ${headerGradient}; padding: 40px; text-align: center;">
                        <span style="font-size: 48px; display: block; margin-bottom: 12px;">${statusIcon}</span>
                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.025em;">
                          Complaint Status Update
                        </h1>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 40px;">
                        <p style="margin: 0 0 20px 0; font-size: 16px; font-weight: 600; color: #1e293b;">
                          Hi ${resident.full_name || 'Resident'}! 👋
                        </p>
                        <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #475569;">
                          The status of your registered complaint has been updated to <strong style="color: #1d4ed8;">${newStatus}</strong>.
                        </p>
                        
                        <div style="background: #f8fafc; padding: 24px; border-left: 4px solid #3b82f6; border-radius: 8px; margin-bottom: 24px;">
                          <p style="margin: 0 0 12px 0; font-size: 14px; color: #1e293b;">
                            <strong>Complaint ID:</strong> <span style="font-family: monospace; color: #0f766e;">#${complaintId.substring(0, 8)}</span><br>
                            <strong>Category:</strong> ${category}<br>
                            <strong>Description:</strong> ${description}
                          </p>
                          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 12px 0;">
                          <p style="margin: 0; font-size: 14px; color: #334155; font-style: italic;">
                            <strong>Admin Note:</strong> ${adminNote || 'No additional note provided.'}
                          </p>
                        </div>

                        <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #64748b;">
                          Log in to your dashboard to track full timelines and communication logs.
                        </p>
                        <hr style="border: 0; border-top: 1px solid #f1f5f9; margin-bottom: 24px;">
                        <p style="margin: 0; font-size: 12px; color: #94a3b8; text-align: center;">
                          © ${new Date().getFullYear()} Society Maintenance Tracker. All rights reserved.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `;

      try {
        const info = await transporter.sendMail({
          from: `"Society Maintenance" <${GMAIL_USER}>`,
          to: resident.email,
          subject,
          html,
          text: `Hi ${resident.full_name},\n\nYour complaint status has changed to ${newStatus}:\n\nCategory: ${category}\nDescription: ${description}\nAdmin Note: ${adminNote || 'None'}`,
        });
        results.push({ email: resident.email, success: true, messageId: info.messageId });
        await logEmail(resident.email, subject, html, "Sent");
      } catch (sendErr) {
        console.error(`Failed to send email to ${resident.email}:`, sendErr);
        results.push({ email: resident.email, success: false, error: sendErr.message });
        await logEmail(resident.email, subject, html, "Failed");
      }
    } else {
      throw new Error(`Invalid status: ${status}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Operation completed",
        results,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("❌ Error running edge function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
