import React, { useState, useEffect } from 'react';
import { getAllComplaints } from '../services/complaints';
import { supabase } from '../services/supabase';
import ComplaintCard from '../components/ComplaintCard';
import Loader from '../components/Loader';
import { Search, Filter, SlidersHorizontal, Calendar, ArrowUpDown } from 'lucide-react';

export const ManageComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [overdueDays, setOverdueDays] = useState(7);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtering states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [residentFilter, setResidentFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Sorting
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest', 'oldest', 'priority'

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

  useEffect(() => {
    const fetchComplaintsData = async () => {
      try {
        const [complaintsData, { data: settingData }] = await Promise.all([
          getAllComplaints(),
          supabase.from('settings').select('value').eq('key', 'overdue_days').single(),
        ]);

        if (settingData) {
          setOverdueDays(parseInt(settingData.value, 10));
        }

        // Compute is_overdue dynamically based on settings
        const processedComplaints = complaintsData.map((c) => {
          if (c.status === 'Resolved') {
            return { ...c, is_overdue: false };
          }
          const createdDate = new Date(c.created_at);
          const diffTime = Math.abs(new Date() - createdDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          const isOverdue = diffDays > (parseInt(settingData?.value, 10) || 7);
          return { ...c, is_overdue: isOverdue };
        });

        setComplaints(processedComplaints);
        setFilteredComplaints(processedComplaints);
      } catch (err) {
        console.error('Error fetching complaints:', err);
        setError('Failed to load complaints registry.');
      } finally {
        setLoading(false);
      }
    };

    fetchComplaintsData();
  }, []);

  // Filter and sort complaints
  useEffect(() => {
    let result = [...complaints];

    // Search query: ID or description or resident name
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (c) =>
          c.description.toLowerCase().includes(term) ||
          c.category.toLowerCase().includes(term) ||
          c.id.toLowerCase().includes(term) ||
          c.resident?.full_name.toLowerCase().includes(term)
      );
    }

    // Status Filter
    if (statusFilter !== 'All') {
      result = result.filter((c) => c.status === statusFilter);
    }

    // Priority Filter
    if (priorityFilter !== 'All') {
      result = result.filter((c) => c.priority === priorityFilter);
    }

    // Category Filter
    if (categoryFilter !== 'All') {
      result = result.filter((c) => c.category === categoryFilter);
    }

    // Resident Name specific filter
    if (residentFilter.trim()) {
      const nameTerm = residentFilter.toLowerCase();
      result = result.filter((c) =>
        c.resident?.full_name.toLowerCase().includes(nameTerm)
      );
    }

    // Date Range filters
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      result = result.filter((c) => new Date(c.created_at) >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      result = result.filter((c) => new Date(c.created_at) <= end);
    }

    // Sorting logic (Overdue complaints always stay on top, then apply selected sorting rule!)
    result.sort((a, b) => {
      // 1. Prioritize overdue status: active overdue (not resolved and is_overdue true)
      const aOverdue = a.is_overdue && a.status !== 'Resolved';
      const bOverdue = b.is_overdue && b.status !== 'Resolved';

      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;

      // 2. Secondary sort based on selected rule
      if (sortOrder === 'newest') {
        return new Date(b.created_at) - new Date(a.created_at);
      }
      if (sortOrder === 'oldest') {
        return new Date(a.created_at) - new Date(b.created_at);
      }
      if (sortOrder === 'priority') {
        const priorityWeights = { High: 3, Medium: 2, Low: 1 };
        const weightA = priorityWeights[a.priority] || 0;
        const weightB = priorityWeights[b.priority] || 0;
        if (weightB !== weightA) {
          return weightB - weightA;
        }
        return new Date(b.created_at) - new Date(a.created_at); // fallback to newest
      }
      return 0;
    });

    setFilteredComplaints(result);
  }, [
    searchTerm,
    statusFilter,
    priorityFilter,
    categoryFilter,
    residentFilter,
    startDate,
    endDate,
    sortOrder,
    complaints,
  ]);

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800">Complaint Registry</h1>
        <p className="text-xs text-slate-400">Review resident tickets, allocate priority, log statuses, and track overdue tickets</p>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-800 animate-fade-in">
          {error}
        </div>
      )}

      {/* Advanced Filters Drawer Panel */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4">
        {/* Core Search & Sort */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Main Search */}
          <div className="relative md:col-span-2">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Search by ID, category, description, or resident name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-xs placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-white"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <ArrowUpDown className="h-4 w-4" />
            </span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="block w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-xs focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white font-medium text-slate-700"
            >
              <option value="newest">Sort by Newest</option>
              <option value="oldest">Sort by Oldest</option>
              <option value="priority">Sort by Priority (High to Low)</option>
            </select>
          </div>
        </div>

        {/* Sub filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 pt-2 border-t border-slate-100">
          {/* Status filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full rounded-md border border-slate-300 py-1.5 px-2.5 text-xs bg-white text-slate-600 focus:outline-hidden focus:ring-1 focus:ring-primary-500"
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          {/* Priority filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="block w-full rounded-md border border-slate-300 py-1.5 px-2.5 text-xs bg-white text-slate-600 focus:outline-hidden focus:ring-1 focus:ring-primary-500"
            >
              <option value="All">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          {/* Category filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="block w-full rounded-md border border-slate-300 py-1.5 px-2.5 text-xs bg-white text-slate-600 focus:outline-hidden focus:ring-1 focus:ring-primary-500"
            >
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Resident Specific name search */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Resident</label>
            <input
              type="text"
              placeholder="e.g. John"
              value={residentFilter}
              onChange={(e) => setResidentFilter(e.target.value)}
              className="block w-full rounded-md border border-slate-300 py-1.5 px-2 text-xs bg-white text-slate-600 placeholder-slate-300 focus:outline-hidden focus:ring-1 focus:ring-primary-500"
            />
          </div>

          {/* Date range start */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="block w-full rounded-md border border-slate-300 py-1.5 px-2 text-xs bg-white text-slate-600 focus:outline-hidden focus:ring-1 focus:ring-primary-500"
            />
          </div>

          {/* Date range end */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="block w-full rounded-md border border-slate-300 py-1.5 px-2 text-xs bg-white text-slate-600 focus:outline-hidden focus:ring-1 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Grid of Complaint cards */}
      {filteredComplaints.length === 0 ? (
        <div className="rounded-xl border border-slate-200/60 bg-white p-12 text-center text-slate-400 shadow-sm flex flex-col items-center justify-center">
          <p className="text-base font-semibold text-slate-500">No matching tickets found</p>
          <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
            Try clearing the filters or modifying your search criteria to scan the entire registry.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {filteredComplaints.map((complaint) => (
            <ComplaintCard key={complaint.id} complaint={complaint} isAdmin={true} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageComplaints;
