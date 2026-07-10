import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import Loader from '../components/Loader';
import { Settings as SettingsIcon, AlertCircle, Save, CheckCircle, Mail, Database } from 'lucide-react';

export const Settings = () => {
  const [overdueDays, setOverdueDays] = useState('7');
  const [resendApiKey, setResendApiKey] = useState('');
  const [emailLogs, setEmailLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // States
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchSettingsAndLogs = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch settings keys
      const { data: settingData, error: setErr } = await supabase
        .from('settings')
        .select('*');
      
      if (settingData) {
        const overdue = settingData.find(s => s.key === 'overdue_days');
        const resend = settingData.find(s => s.key === 'resend_api_key');
        if (overdue) setOverdueDays(overdue.value);
        if (resend) setResendApiKey(resend.value);
      }

      // 2. Fetch recent email logs (limit to 50 for performance)
      const { data: logsData, error: logsErr } = await supabase
        .from('email_logs')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(50);
      
      if (logsData) {
        setEmailLogs(logsData);
      }
    } catch (err) {
      console.error('Error fetching settings/logs:', err);
      setErrorMsg('Failed to load settings details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettingsAndLogs();
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    if (!overdueDays || parseInt(overdueDays, 10) < 1) {
      setErrorMsg('Please enter a valid number of days (minimum 1).');
      return;
    }

    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // Save Overdue Days
      const { error: ovErr } = await supabase
        .from('settings')
        .upsert({ key: 'overdue_days', value: overdueDays.toString() });

      if (ovErr) throw ovErr;

      // Save Resend API Key
      const { error: reErr } = await supabase
        .from('settings')
        .upsert({ key: 'resend_api_key', value: resendApiKey.trim() });

      if (reErr) throw reErr;

      setSuccessMsg('Settings updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to save settings to the database.');
    } finally {
      setSaving(false);
    }
  };

  const handleClearLogs = async () => {
    if (!window.confirm('Are you sure you want to clear all email logs from the database?')) {
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase.from('email_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (error) throw error;
      setEmailLogs([]);
      setSuccessMsg('Logs cleared successfully.');
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to clear logs.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <SettingsIcon className="h-5 w-5 text-primary-600" />
          System Settings & Logs
        </h1>
        <p className="text-xs text-slate-400">Configure overdue limits and track outgoing email notifications</p>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-800 flex items-center gap-2 animate-fade-in text-sm font-semibold">
          <CheckCircle className="h-4.5 w-4.5" />
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-rose-800 flex items-center gap-2 animate-fade-in text-sm font-semibold">
          <AlertCircle className="h-4.5 w-4.5" />
          {errorMsg}
        </div>
      )}

      {/* Grid: Settings Panel + Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Config Panel */}
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2.5">
              General Configuration
            </h3>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              {/* Overdue Threshold Configuration */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Overdue Complaint Limit
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    min="1"
                    value={overdueDays}
                    onChange={(e) => setOverdueDays(e.target.value)}
                    className="block w-20 rounded-lg border border-slate-300 py-1.5 px-3 text-xs focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white font-medium text-slate-700"
                  />
                  <span className="text-xs text-slate-500">Days</span>
                </div>
                <p className="mt-2 text-[10px] text-slate-400 leading-relaxed">
                  Complaints not resolved within this threshold are flagged as <strong>Overdue</strong>, highlighted red, and pinned at the top.
                </p>
              </div>

              {/* Resend API Key Configuration */}
              <div className="pt-3 border-t border-slate-100">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Resend API Key
                </label>
                <input
                  type="password"
                  placeholder="re_1234567890abcdef..."
                  value={resendApiKey}
                  onChange={(e) => setResendApiKey(e.target.value)}
                  className="block w-full rounded-lg border border-slate-300 py-1.5 px-3 text-xs focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white font-medium text-slate-700"
                />
                <p className="mt-2 text-[10px] text-slate-400 leading-relaxed">
                  Enter your Resend API Key to deliver actual emails. Leave blank to run in simulated logging mode.
                </p>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={saving}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary-700 active:scale-95 disabled:opacity-50 transition-all w-full"
              >
                <Save className="h-3.5 w-3.5" />
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </form>
          </div>
        </div>

        {/* Right 2 Columns: Email Logs Panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Mail className="h-4.5 w-4.5 text-primary-650" />
                Notification Logs (`email_logs`)
              </h3>
              {emailLogs.length > 0 && (
                <button
                  onClick={handleClearLogs}
                  className="text-[10px] font-bold text-rose-600 hover:text-rose-700 uppercase tracking-wider hover:underline"
                >
                  Clear Logs
                </button>
              )}
            </div>

            {emailLogs.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
                <Database className="h-8 w-8 text-slate-300" />
                <span>No outbound notification history logs available.</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-bold">
                      <th className="py-2.5 pr-4">Recipient</th>
                      <th className="py-2.5 pr-4">Subject</th>
                      <th className="py-2.5 pr-4">Status</th>
                      <th className="py-2.5">Sent At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-650">
                    {emailLogs.map((log) => (
                      <tr key={log.id}>
                        <td className="py-2.5 pr-4 font-medium truncate max-w-[120px]">{log.recipient}</td>
                        <td className="py-2.5 pr-4 truncate max-w-[180px]">{log.subject}</td>
                        <td className="py-2.5 pr-4">
                          <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            log.status === 'Sent'
                              ? 'bg-emerald-50 text-emerald-700'
                              : log.status === 'Failed'
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="py-2.5 text-[11px] text-slate-400 whitespace-nowrap">
                          {new Date(log.sent_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
