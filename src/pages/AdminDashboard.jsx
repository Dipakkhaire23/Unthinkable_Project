import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllComplaints } from '../services/complaints';
import { getAllNotices } from '../services/notice';
import { supabase } from '../services/supabase';
import Loader from '../components/Loader';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  ClipboardList,
  AlertCircle,
  Play,
  CheckCircle,
  Calendar,
  ChevronRight,
  Megaphone,
  Clock,
  User,
} from 'lucide-react';

export const AdminDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [notices, setNotices] = useState([]);
  const [overdueDays, setOverdueDays] = useState(7);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardMetrics = async () => {
      try {
        const [complaintsData, noticesData] = await Promise.all([
          getAllComplaints(),
          getAllNotices(),
        ]);

        // Fetch overdue setting
        const { data: settingData } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'overdue_days')
          .single();

        if (settingData) {
          setOverdueDays(parseInt(settingData.value, 10));
        }

        setComplaints(complaintsData);
        setNotices(noticesData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to fetch admin metrics.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardMetrics();
  }, []);

  if (loading) return <Loader />;

  // 1. Calculate general stats
  const total = complaints.length;
  const open = complaints.filter((c) => c.status === 'Open').length;
  const inProgress = complaints.filter((c) => c.status === 'In Progress').length;
  const resolved = complaints.filter((c) => c.status === 'Resolved').length;

  // Overdue check: if status !== 'Resolved' and age is > overdueDays
  const overdueComplaints = complaints.filter((c) => {
    if (c.status === 'Resolved') return false;
    const createdDate = new Date(c.created_at);
    const diffTime = Math.abs(new Date() - createdDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > overdueDays;
  });
  const overdueCount = overdueComplaints.length;

  // 2. Format Data for Charts
  // Status Breakdown Chart
  const statusChartData = [
    { name: 'Open', value: open, color: '#3b82f6' },
    { name: 'In Progress', value: inProgress, color: '#f59e0b' },
    { name: 'Resolved', value: resolved, color: '#10b981' },
  ].filter((d) => d.value > 0);

  // Category Breakdown Chart
  const categories = [
    'Water Leakage',
    'Electricity',
    'Lift',
    'Parking',
    'Security',
    'Garbage',
    'Cleaning',
    'Others',
  ];
  const categoryChartData = categories
    .map((cat) => {
      const count = complaints.filter((c) => c.category === cat).length;
      return { category: cat, count };
    })
    .filter((d) => d.count > 0);

  return (
    <div className="space-y-6">
      {/* Welcome & Overview Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800">Admin Analytics Dashboard</h1>
        <p className="text-xs text-slate-400">Real-time complaint tracking, overdue alerts, and notice distributions</p>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-rose-800 text-sm">
          {error}
        </div>
      )}

      {/* Metrics Cards GRID */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {/* Total Complaints */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Requests</span>
            <ClipboardList className="h-4.5 w-4.5 text-slate-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-800">{total}</p>
        </div>

        {/* Open */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500">Open</span>
            <AlertCircle className="h-4.5 w-4.5 text-blue-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-800">{open}</p>
        </div>

        {/* In Progress */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500">In Progress</span>
            <Play className="h-4.5 w-4.5 text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-800">{inProgress}</p>
        </div>

        {/* Resolved */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">Resolved</span>
            <CheckCircle className="h-4.5 w-4.5 text-emerald-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-800">{resolved}</p>
        </div>

        {/* Overdue (Highlighted in red) */}
        <div className={`rounded-xl border p-4 shadow-2xs flex flex-col justify-between ${
          overdueCount > 0
            ? 'border-rose-200 bg-rose-50 text-rose-700 shadow-rose-50'
            : 'border-slate-200/80 bg-white'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500">Overdue ({overdueDays}d)</span>
            <AlertCircle className="h-4.5 w-4.5 text-rose-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-800">{overdueCount}</p>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Chart 1: Status Breakdown */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Complaints by Status</h3>
          <div className="h-64">
            {statusChartData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">No active complaints logged</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusChartData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} Ticket(s)`, 'Count']} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 2: Category Breakdown */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Complaints by Category</h3>
          <div className="h-64">
            {categoryChartData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">No complaints categorized yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData} margin={{ bottom: 10 }}>
                  <XAxis dataKey="category" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="count" fill="#0ea5e9" radius={[4, 4, 0, 0]}>
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="#0284c7" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid Split: Recent complaints / Recent Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Complaints */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800">Recent Service Tickets</h3>
            <Link to="/admin/complaints" className="text-xs font-semibold text-primary-600 hover:underline">
              View All
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {complaints.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">No complaints registered yet.</div>
            ) : (
              complaints.slice(0, 5).map((comp) => (
                <div key={comp.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-700 truncate">{comp.category}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                      Flat {comp.resident?.flat_number} • Ticket: #{comp.id.substring(0, 8)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={comp.status} />
                    <Link
                      to={`/admin/complaints/${comp.id}`}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors"
                      title="Manage details"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Notices */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Megaphone className="h-4 w-4 text-primary-600" />
              Notices & Announcements
            </h3>
            <Link to="/admin/notices" className="text-xs font-semibold text-primary-600 hover:underline">
              Manage Board
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {notices.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">No notifications posted yet.</div>
            ) : (
              notices.slice(0, 5).map((not) => (
                <div key={not.id} className="py-3 flex flex-col gap-1.5">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-xs font-bold text-slate-700 leading-tight">
                      {not.title}
                    </p>
                    {not.important && (
                      <span className="shrink-0 bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.5 rounded border border-amber-200 uppercase tracking-wide">
                        Pinned
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-1 leading-normal">{not.description}</p>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(not.created_at).toLocaleDateString()}</span>
                    <span className="text-slate-200">•</span>
                    <User className="h-3 w-3" />
                    <span>{not.author?.full_name || 'Admin'}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
