import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getComplaintsForResident } from '../services/complaints';
import ComplaintCard from '../components/ComplaintCard';
import Loader from '../components/Loader';
import { PlusCircle, Search, Filter, SlidersHorizontal } from 'lucide-react';

export const ResidentComplaints = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtering & Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  const fetchComplaints = async () => {
    try {
      if (!user) return;
      const data = await getComplaintsForResident(user.id);
      setComplaints(data);
      setFilteredComplaints(data);
    } catch (err) {
      console.error('Error fetching complaints:', err);
      setError('Failed to load your complaints list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [user]);

  // Apply filters whenever search or filter dropdowns modify
  useEffect(() => {
    let result = [...complaints];

    // Category or description search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (c) =>
          c.category.toLowerCase().includes(term) ||
          c.description.toLowerCase().includes(term) ||
          c.id.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (statusFilter !== 'All') {
      result = result.filter((c) => c.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== 'All') {
      result = result.filter((c) => c.priority === priorityFilter);
    }

    setFilteredComplaints(result);
  }, [searchTerm, statusFilter, priorityFilter, complaints]);

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">My Complaints</h1>
          <p className="text-xs text-slate-400">View and track all maintenance requests registered from your flat</p>
        </div>
        <button
          onClick={() => navigate('/resident/raise-complaint')}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-primary-500/20 hover:bg-primary-700 active:scale-95 transition-all duration-200 self-start sm:self-auto"
        >
          <PlusCircle className="h-4.5 w-4.5" />
          Raise Complaint
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-800">
          {error}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Search by ID or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 bg-white"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap w-full md:w-auto items-center gap-3">
          {/* Status */}
          <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block rounded-lg border border-slate-300 py-1.5 px-3 text-xs focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-white font-medium text-slate-600"
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          {/* Priority */}
          <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
            <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="block rounded-lg border border-slate-300 py-1.5 px-3 text-xs focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-white font-medium text-slate-600"
            >
              <option value="All">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid List */}
      {filteredComplaints.length === 0 ? (
        <div className="rounded-xl border border-slate-200/60 bg-white p-12 text-center text-slate-400 shadow-sm flex flex-col items-center justify-center">
          <p className="text-base font-semibold text-slate-500">No complaints found</p>
          <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
            {searchTerm || statusFilter !== 'All' || priorityFilter !== 'All'
              ? 'Try modifying your search query or clear the active dropdown filters.'
              : 'You have not raised any complaints yet. Use the Raise Complaint button to add one.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredComplaints.map((complaint) => (
            <ComplaintCard key={complaint.id} complaint={complaint} isAdmin={false} onDeleteSuccess={fetchComplaints} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ResidentComplaints;
