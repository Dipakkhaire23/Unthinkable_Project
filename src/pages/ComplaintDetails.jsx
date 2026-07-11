import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getComplaintById, updateComplaintAdmin, updateComplaintResident, deleteComplaint } from '../services/complaints';
import { notifyComplaintStatusChange } from '../services/email';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import Timeline from '../components/Timeline';
import Loader from '../components/Loader';
import { ArrowLeft, User, Phone, Mail, Home, Building2, Calendar, Clipboard, AlertCircle, FileEdit, CheckCircle } from 'lucide-react';

export const ComplaintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'ADMIN';

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Admin action states
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [note, setNote] = useState('');
  const [updating, setUpdating] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  // Resident action states
  const [isEditing, setIsEditing] = useState(false);
  const [editCategory, setEditCategory] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPhotoFile, setEditPhotoFile] = useState(null);
  const [editPhotoPreview, setEditPhotoPreview] = useState('');
  const [removePhoto, setRemovePhoto] = useState(false);

  const handleResidentUpdate = async (e) => {
    e.preventDefault();
    if (editDescription.trim().length < 20) return;

    setUpdating(true);
    setError('');
    setActionSuccess('');

    try {
      await updateComplaintResident(id, {
        category: editCategory,
        description: editDescription,
        photoFile: editPhotoFile,
        removePhoto,
        residentId: currentUser.id,
      });

      setActionSuccess('Complaint details updated successfully!');
      setIsEditing(false);
      
      // Refresh details
      await fetchComplaintDetails();

      setTimeout(() => {
        setActionSuccess('');
      }, 3000);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to update complaint details.');
    } finally {
      setUpdating(false);
    }
  };

  const handleResidentDelete = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this complaint? This cannot be undone.')) {
      return;
    }

    setUpdating(true);
    setError('');

    try {
      await deleteComplaint(id);
      setActionSuccess('Complaint deleted successfully. Redirecting...');
      setTimeout(() => {
        navigate('/resident/complaints');
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to delete complaint.');
      setUpdating(false);
    }
  };

  const fetchComplaintDetails = async () => {
    try {
      setLoading(true);
      const data = await getComplaintById(id);
      
      // If resident, verify they own this complaint
      if (!isAdmin && data.resident_id !== currentUser?.id) {
        setError('Unauthorized: You do not have permission to view this complaint.');
        setLoading(false);
        return;
      }

      setComplaint(data);
      setStatus(data.status);
      setPriority(priority || data.priority); // keep edited priority or fetch
    } catch (err) {
      console.error('Error fetching complaint details:', err);
      setError('Failed to load complaint details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && currentUser) {
      fetchComplaintDetails();
    }
  }, [id, currentUser]);

  useEffect(() => {
    if (searchParams.get('edit') === 'true' && complaint && !isAdmin && complaint.status === 'Open') {
      setIsEditing(true);
      setEditCategory(complaint.category);
      setEditDescription(complaint.description);
      setEditPhotoPreview(complaint.photo_url || '');
    }
  }, [searchParams, complaint, isAdmin]);

  const handleAdminUpdate = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;

    setUpdating(true);
    setError('');
    setActionSuccess('');

    try {
      const isStatusChanged = status !== complaint.status;

      // Update complaint in DB
      const updated = await updateComplaintAdmin(id, {
        status,
        priority,
        note: isStatusChanged ? note : `Priority updated to ${priority}.`,
        adminId: currentUser.id,
        oldStatus: complaint.status,
      });

      // Send email notification on status change
      if (isStatusChanged && complaint.resident) {
        try {
          await notifyComplaintStatusChange({
            complaintId: id,
            newStatus: status,
            adminNote: note,
            residentId: complaint.resident_id,
            category: complaint.category,
            description: complaint.description,
          });
        } catch (emailErr) {
          console.error('Email notification failed:', emailErr);
        }
      }

      setActionSuccess('Changes saved and logged successfully!');
      setNote(''); // clear admin note input
      
      // Refresh timeline and complaint state
      const refreshedData = await getComplaintById(id);
      setComplaint(refreshedData);
      
      setTimeout(() => {
        setActionSuccess('');
      }, 3000);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to update complaint details.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <Loader fullScreen={false} />;

  if (error) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-all active:scale-95"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
        </button>
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-6 text-rose-800 text-sm">
          {error}
        </div>
      </div>
    );
  }

  // Overdue status check
  const isOverdueActive = complaint.is_overdue && complaint.status !== 'Resolved';

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Back button and Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-all active:scale-95"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            Complaint Detail Log
            {isOverdueActive && (
              <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider animate-pulse border border-red-200">
                Overdue
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-400">View ticket summary, history, and admin resolutions</p>
        </div>
      </div>

      {actionSuccess && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-800 flex items-center gap-2.5 animate-fade-in shadow-xs">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white">
            <CheckCircle className="h-4 w-4" />
          </span>
          <span className="font-semibold text-sm">{actionSuccess}</span>
        </div>
      )}

      {/* Main Grid: Details, Image vs Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Information Cards */}
        <div className="space-y-6 lg:col-span-2">
          {isEditing ? (
            /* Editing Form Panel for Resident */
            <form onSubmit={handleResidentUpdate} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800">Edit Complaint Details</h3>
                <span className="text-[10px] font-mono text-slate-400">ID: #{complaint.id?.substring(0, 8)}</span>
              </div>
              
              {/* Category Dropdown */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Category</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="block w-full rounded-lg border border-slate-300 py-2.5 px-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white font-medium text-slate-700"
                >
                  {['Water Leakage', 'Electricity', 'Lift', 'Parking', 'Security', 'Garbage', 'Cleaning', 'Others'].map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Description Body */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Description (min 20 characters)</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={5}
                  className="block w-full rounded-lg border border-slate-300 py-2.5 px-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-slate-700"
                />
                {editDescription.trim().length < 20 && (
                  <p className="mt-1 text-xs text-rose-600 font-semibold">Description must be at least 20 characters long.</p>
                )}
              </div>

              {/* Photo Upload Options */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Attachment Photo</label>
                {editPhotoPreview ? (
                  <div className="relative rounded-lg border border-slate-200 overflow-hidden bg-slate-50 p-2 max-w-md">
                    <img src={editPhotoPreview} alt="Preview" className="w-full object-cover rounded-md max-h-56" />
                    <button
                      type="button"
                      onClick={() => {
                        setEditPhotoPreview('');
                        setEditPhotoFile(null);
                        setRemovePhoto(true);
                      }}
                      className="absolute top-4 right-4 flex h-7 w-7 items-center justify-center rounded-full bg-slate-900/60 text-white hover:bg-slate-900/80 transition-all font-bold"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setEditPhotoFile(file);
                        setRemovePhoto(false);
                        const reader = new FileReader();
                        reader.onloadend = () => setEditPhotoPreview(reader.result);
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                  />
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-650 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editDescription.trim().length < 20 || updating}
                  className="rounded-lg bg-primary-600 px-5 py-2 text-xs font-semibold text-white hover:bg-primary-700 disabled:opacity-50 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            /* Complaint Details Panel */
            <div className={`rounded-xl border bg-white p-6 shadow-sm overflow-hidden relative ${
              isOverdueActive ? 'border-red-200 shadow-red-50/20 shadow-md ring-1 ring-red-200' : 'border-slate-200/80'
            }`}>
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Category</span>
                  <h2 className="text-lg font-bold text-slate-800 leading-tight">{complaint.category}</h2>
                  <p className="text-[11px] font-mono text-slate-400 mt-1">Ticket: #{complaint.id}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={complaint.status} />
                  <PriorityBadge priority={complaint.priority} />
                </div>
              </div>

              {/* Description Text */}
              <div className="mt-5">
                <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase block mb-1">Description</span>
                <p className="text-sm text-slate-600 leading-relaxed white-space-pre-wrap">
                  {complaint.description}
                </p>
              </div>

              {/* Timestamps */}
              <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4 border-t border-slate-100 pt-4 text-xs text-slate-500 bg-slate-50/50 -mx-6 -mb-6 p-6">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Created At</p>
                    <p className="font-medium text-slate-700">{new Date(complaint.created_at).toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Last Updated</p>
                    <p className="font-medium text-slate-700">{new Date(complaint.updated_at).toLocaleString()}</p>
                  </div>
                </div>

                {complaint.closed_at && (
                  <div className="flex items-center gap-1.5 col-span-2 md:col-span-1">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">Resolved At</p>
                      <p className="font-medium text-slate-700">{new Date(complaint.closed_at).toLocaleString()}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Optional Attachment Image Preview */}
          {complaint.photo_url && (
            <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase block mb-3">Attached Photo</span>
              <a href={complaint.photo_url} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-lg border border-slate-100 max-h-96">
                <img
                  src={complaint.photo_url}
                  alt={complaint.category}
                  className="w-full object-contain max-h-96 hover:scale-[1.01] transition-transform duration-300 bg-slate-50"
                />
              </a>
            </div>
          )}

          {/* Timeline of History logs */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase block mb-5">History Resolution Timeline</span>
            <Timeline history={complaint.history} />
          </div>
        </div>

        {/* Right Column: Resident Details & Admin Controls */}
        <div className="space-y-6">
          {/* Resident Profile Card (For Admin only) */}
          {isAdmin && complaint.resident && (
            <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2.5">
                Resident Details
              </h3>
              <div className="space-y-3 text-sm">
                {/* Full name */}
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase">Resident Name</p>
                    <p className="font-medium text-slate-700">{complaint.resident.full_name}</p>
                  </div>
                </div>

                {/* Flat & Building */}
                <div className="flex items-center gap-3">
                  <Home className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase">Flat / Building</p>
                    <p className="font-medium text-slate-700">
                      Flat {complaint.resident.flat_number}, {complaint.resident.building}
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase">Phone Number</p>
                    <a href={`tel:${complaint.resident.phone}`} className="font-medium text-primary-600 hover:underline">
                      {complaint.resident.phone}
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase">Email Address</p>
                    <a href={`mailto:${complaint.resident.email}`} className="font-medium text-primary-600 hover:underline break-all">
                      {complaint.resident.email}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Admin Management Dashboard Actions */}
          {isAdmin && (
            <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2.5 flex items-center gap-2">
                <FileEdit className="h-4 w-4 text-primary-600" />
                Admin Actions
              </h3>
              
              <form onSubmit={handleAdminUpdate} className="space-y-4">
                {/* Status Dropdown */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Update Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="block w-full rounded-lg border border-slate-300 py-2 px-3 text-xs focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white font-medium text-slate-700"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>

                {/* Priority Dropdown */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Update Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="block w-full rounded-lg border border-slate-300 py-2 px-3 text-xs focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white font-medium text-slate-700"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                {/* Add Status Update Note */}
                {status !== complaint.status && (
                  <div className="animate-fade-in">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                      Status Change Note <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Explain the status change to the resident..."
                      required
                      rows={3}
                      className="block w-full rounded-lg border border-slate-300 py-2 px-3 text-xs focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 placeholder-slate-400 bg-white text-slate-700"
                    />
                  </div>
                )}

                {/* Action button */}
                <button
                  type="submit"
                  disabled={updating || (status === complaint.status && priority === complaint.priority)}
                  className="flex w-full items-center justify-center rounded-lg bg-primary-600 py-2.5 text-xs font-semibold text-white shadow-sm shadow-primary-500/20 hover:bg-primary-700 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none transition-all duration-200"
                >
                  {updating ? 'Saving logs...' : 'Save Changes'}
                </button>
              </form>
            </div>
          )}

          {/* Simple Resident-only side card displaying resolution alert */}
          {!isAdmin && (
            <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 text-primary-600" />
                Ticket Information
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                This complaint is registered to Flat <strong>{currentUser?.flat_number}</strong>. If there are updates or questions, they will be logged in the history timeline.
              </p>
              <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-150 text-[11px] text-slate-500 flex flex-col gap-1 mb-3">
                <span><strong>Status:</strong> {complaint.status}</span>
                <span><strong>Priority:</strong> {complaint.priority}</span>
              </div>

              {/* Resident Options to Edit/Delete Complaint if Status is Open */}
              {complaint.status === 'Open' && (
                <div className="flex gap-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setEditCategory(complaint.category);
                      setEditDescription(complaint.description);
                      setEditPhotoPreview(complaint.photo_url || '');
                      setRemovePhoto(false);
                    }}
                    className="flex-1 rounded-lg border border-slate-200 py-2 text-center text-xs font-semibold text-slate-700 hover:bg-slate-150 transition-colors"
                  >
                    Edit Ticket
                  </button>
                  <button
                    onClick={handleResidentDelete}
                    className="flex-1 rounded-lg border border-rose-200 py-2 text-center text-xs font-semibold text-rose-700 hover:bg-rose-50 transition-colors"
                  >
                    Delete Ticket
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetails;
