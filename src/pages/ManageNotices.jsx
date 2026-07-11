import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAllNotices, createNotice, updateNotice, deleteNotice } from '../services/notice';
import { notifyImportantNotice } from '../services/email';
import { supabase } from '../services/supabase';
import NoticeCard from '../components/NoticeCard';
import Loader from '../components/Loader';
import { Plus, Megaphone, X, Pin, Mail, AlertTriangle } from 'lucide-react';

export const ManageNotices = () => {
  const { user } = useAuth();
  
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [activeNoticeId, setActiveNoticeId] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    important: false,
  });

  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const fetchNotices = async () => {
    try {
      const data = await getAllNotices();
      setNotices(data);
    } catch (err) {
      console.error('Error fetching notices:', err);
      setError('Failed to fetch announcements.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const openCreateModal = () => {
    setModalMode('create');
    setFormData({ title: '', description: '', important: false });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (notice) => {
    setModalMode('edit');
    setActiveNoticeId(notice.id);
    setFormData({
      title: notice.title,
      description: notice.description,
      important: notice.important,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Helper to fetch all resident email addresses
  const fetchResidentEmails = async () => {
    try {
      const { data, error: userError } = await supabase
        .from('users')
        .select('email')
        .eq('role', 'RESIDENT');

      if (userError) throw userError;
      return data.map((u) => u.email);
    } catch (err) {
      console.error('Failed to retrieve resident emails:', err);
      return [];
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setError('');
    setStatusMsg('');

    try {
      if (modalMode === 'create') {
        const created = await createNotice({
          title: formData.title,
          description: formData.description,
          important: formData.important,
          adminId: user.id,
        });

        // Whenever an important notice is posted, broadcast email notifications to all residents
        if (formData.important) {
          setStatusMsg('Notice created! Dispatching emails to residents...');
          await notifyImportantNotice({
            title: formData.title,
            description: formData.description,
          });
        }
      } else {
        await updateNotice(activeNoticeId, {
          title: formData.title,
          description: formData.description,
          important: formData.important,
        });

        // Trigger email broadcast on edit if newly marked as important
        const originalNotice = notices.find((n) => n.id === activeNoticeId);
        if (formData.important && !originalNotice?.important) {
          setStatusMsg('Notice updated! Dispatching emails to residents...');
          await notifyImportantNotice({
            title: formData.title,
            description: formData.description,
          });
        }
      }

      await fetchNotices();
      setIsModalOpen(false);
      setStatusMsg('');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to save notice announcement.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (noticeId) => {
    setError('');
    try {
      await deleteNotice(noticeId);
      await fetchNotices();
    } catch (err) {
      console.error(err);
      setError('Failed to delete the notice.');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-primary-600" />
            Notice Board Announcements
          </h1>
          <p className="text-xs text-slate-400">Post announcements, schedule maintenance notices, and broadcast warnings</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-primary-500/20 hover:bg-primary-700 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="h-4.5 w-4.5" />
          Create Notice
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-800 animate-fade-in">
          {error}
        </div>
      )}

      {/* Grid List */}
      {notices.length === 0 ? (
        <div className="rounded-xl border border-slate-200/60 bg-white p-12 text-center text-slate-400 shadow-sm">
          No notices posted. Click the Create Notice button to publish an announcement.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {notices.map((notice) => (
            <NoticeCard
              key={notice.id}
              notice={notice}
              isAdmin={true}
              onEdit={openEditModal}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modals Form Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl space-y-5 animate-fade-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800">
                {modalMode === 'create' ? 'Create Notice Announcement' : 'Edit Notice Announcement'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1 hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Broadcast warning alert */}
            {formData.important && (
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 flex items-center gap-2">
                <Mail className="h-4.5 w-4.5 text-amber-600 animate-pulse" />
                <span>
                  <strong>Important Notice:</strong> Saving this will broadcast email alerts to all registered residents.
                </span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Notice Title */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Notice Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. Schedule for Water Tank Cleaning"
                  className={`block w-full rounded-lg border py-2 px-3 text-xs focus:outline-hidden focus:ring-2 transition-all ${
                    formErrors.title
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20'
                      : 'border-slate-300 focus:border-primary-500 focus:ring-primary-500/20'
                  }`}
                />
                {formErrors.title && <p className="mt-1 text-xs text-rose-600">{formErrors.title}</p>}
              </div>

              {/* Description body */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Detailed Announcement
                </label>
                <textarea
                  name="description"
                  rows={6}
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Provide all details including timings, impact, or instructions..."
                  className={`block w-full rounded-lg border py-2 px-3 text-xs focus:outline-hidden focus:ring-2 transition-all ${
                    formErrors.description
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20'
                      : 'border-slate-300 focus:border-primary-500 focus:ring-primary-500/20'
                  }`}
                />
                {formErrors.description && <p className="mt-1 text-xs text-rose-600">{formErrors.description}</p>}
              </div>

              {/* Checkbox: Mark Important (Pinned) */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="important"
                  name="important"
                  checked={formData.important}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="important" className="text-xs font-semibold text-slate-700 flex items-center gap-1 cursor-pointer">
                  <Pin className="h-3 w-3 text-amber-500 fill-current" />
                  Mark as Important (Pin Announcement & Broadcast Email)
                </label>
              </div>

              {statusMsg && (
                <div className="rounded-lg bg-blue-50 border border-blue-200 p-2.5 text-xs text-blue-700 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-500 animate-ping" />
                  {statusMsg}
                </div>
              )}

              {/* Action Buttons */}
              <div className="border-t border-slate-100 pt-4 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-650 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center justify-center rounded-lg bg-primary-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-primary-500/20 hover:bg-primary-700 active:scale-95 disabled:opacity-50 transition-all duration-200"
                >
                  {submitting ? 'Publishing...' : modalMode === 'create' ? 'Post Notice' : 'Save Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageNotices;
