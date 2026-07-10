import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getComplaintsForResident } from '../services/complaints';
import { getAllNotices } from '../services/notice';
import NoticeCard from '../components/NoticeCard';
import Loader from '../components/Loader';
import { PlusCircle, FileText, ClipboardList, CheckCircle2, Play, Flame, AlertCircle } from 'lucide-react';

export const ResidentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [complaints, setComplaints] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        if (!user) return;
        const [complaintsData, noticesData] = await Promise.all([
          getComplaintsForResident(user.id),
          getAllNotices(),
        ]);
        setComplaints(complaintsData);
        setNotices(noticesData);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Failed to fetch dashboard metrics.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  if (loading) return <Loader fullScreen={false} />;

  // Calculate statistics
  const total = complaints.length;
  const open = complaints.filter((c) => c.status === 'Open').length;
  const inProgress = complaints.filter((c) => c.status === 'In Progress').length;
  const resolved = complaints.filter((c) => c.status === 'Resolved').length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl border border-primary-200/50 bg-gradient-to-r from-primary-600 to-primary-800 p-6 md:p-8 text-white shadow-lg shadow-primary-500/10">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Welcome back, {user?.full_name}!
        </h1>
        <p className="mt-2 text-sm text-primary-100 max-w-xl">
          Track maintenance complaints for Flat <strong>{user?.flat_number}</strong> ({user?.building}) or post a new service ticket.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-rose-50 border border-rose-200 p-4 text-sm text-rose-800">
          {error}
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {/* Total Complaints */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <ClipboardList className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Requests</p>
            <p className="text-2xl font-bold text-slate-800">{total}</p>
          </div>
        </div>

        {/* Open Complaints */}
        <div className="rounded-xl border border-blue-100 bg-blue-50/20 p-5 shadow-xs flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-500/80">Open</p>
            <p className="text-2xl font-bold text-slate-800">{open}</p>
          </div>
        </div>

        {/* In Progress Complaints */}
        <div className="rounded-xl border border-amber-100 bg-amber-50/20 p-5 shadow-xs flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <Play className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-500/80">In Progress</p>
            <p className="text-2xl font-bold text-slate-800">{inProgress}</p>
          </div>
        </div>

        {/* Resolved Complaints */}
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/20 p-5 shadow-xs flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-500/80">Resolved</p>
            <p className="text-2xl font-bold text-slate-800">{resolved}</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Notices & Action Buttons */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Latest Announcements */}
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary-600" />
              Latest Announcements
            </h2>
            <Link
              to="/resident/notices"
              className="text-xs font-semibold text-primary-600 hover:text-primary-700 hover:underline transition-all"
            >
              View Notice Board
            </Link>
          </div>

          {notices.length === 0 ? (
            <div className="rounded-xl border border-slate-200/60 bg-white p-8 text-center text-slate-400 text-sm">
              No society announcements posted yet.
            </div>
          ) : (
            <div className="space-y-4">
              {notices.slice(0, 3).map((notice) => (
                <NoticeCard key={notice.id} notice={notice} isAdmin={false} />
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800">Quick Actions</h2>
          
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4">
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Service Desk</p>
            
            {/* Raise Complaint Card Link */}
            <div className="group relative rounded-lg border border-primary-100 bg-primary-50/10 p-4 transition-all duration-200 hover:bg-primary-50/30 hover:border-primary-200">
              <h3 className="text-sm font-bold text-primary-800 flex items-center gap-1.5">
                <PlusCircle className="h-4.5 w-4.5" />
                Raise Complaint
              </h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Facing an issue with water, plumbing, lift, electricity, security or cleanliness? File a ticket here.
              </p>
              <Link
                to="/resident/raise-complaint"
                className="absolute inset-0"
                aria-label="Raise new complaint"
              />
            </div>

            {/* View Tickets Card Link */}
            <div className="group relative rounded-lg border border-slate-100 bg-slate-50/30 p-4 transition-all duration-200 hover:bg-slate-100/50 hover:border-slate-200">
              <h3 className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                <ClipboardList className="h-4.5 w-4.5 text-slate-500" />
                Track My Tickets
              </h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Check status logs, view administrator notes, and review your complaint resolution timeline.
              </p>
              <Link
                to="/resident/complaints"
                className="absolute inset-0"
                aria-label="View current complaints"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResidentDashboard;
