import React, { useState, useEffect } from 'react';
import { getAllNotices } from '../services/notice';
import NoticeCard from '../components/NoticeCard';
import Loader from '../components/Loader';
import { Megaphone, Pin, Search } from 'lucide-react';

export const NoticeBoard = () => {
  const [notices, setNotices] = useState([]);
  const [filteredNotices, setFilteredNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const data = await getAllNotices();
        setNotices(data);
        setFilteredNotices(data);
      } catch (err) {
        console.error('Error fetching notices:', err);
        setError('Failed to load notices. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, []);

  // Filter notices on search
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredNotices(notices);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = notices.filter(
        (n) =>
          n.title.toLowerCase().includes(term) ||
          n.description.toLowerCase().includes(term)
      );
      setFilteredNotices(filtered);
    }
  }, [searchTerm, notices]);

  if (loading) return <Loader />;

  // Split into pinned and regular for visual grouping (optional, as query sorts it already)
  const pinnedNotices = filteredNotices.filter((n) => n.important);
  const regularNotices = filteredNotices.filter((n) => !n.important);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-primary-600 animate-bounce" />
            Resident Notice Board
          </h1>
          <p className="text-xs text-slate-400">Stay updated with the latest news, maintenance schedules, and events</p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Search announcements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-lg border border-slate-300 py-1.5 pl-9 pr-3 text-xs placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-white"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-800 animate-fade-in">
          {error}
        </div>
      )}

      {filteredNotices.length === 0 ? (
        <div className="rounded-xl border border-slate-200/60 bg-white p-12 text-center text-slate-400 shadow-sm">
          <p className="text-base font-semibold text-slate-500 font-sans">No notices found</p>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            {searchTerm
              ? 'Try modifying your search query to find announcements.'
              : 'There are no active notices on the board right now.'}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Pinned Announcements Section */}
          {pinnedNotices.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1">
                <Pin className="h-3.5 w-3.5 fill-current" />
                Pinned Announcements
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {pinnedNotices.map((notice) => (
                  <NoticeCard key={notice.id} notice={notice} isAdmin={false} />
                ))}
              </div>
            </div>
          )}

          {/* Regular Announcements Section */}
          {regularNotices.length > 0 && (
            <div className="space-y-4">
              {pinnedNotices.length > 0 && (
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Recent Announcements
                </h2>
              )}
              <div className="grid grid-cols-1 gap-4">
                {regularNotices.map((notice) => (
                  <NoticeCard key={notice.id} notice={notice} isAdmin={false} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NoticeBoard;
