import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import { Calendar, RefreshCw, AlertTriangle, ChevronRight, User, MapPin } from 'lucide-react';

/**
 * Standard Complaint Card for resident & admin listings.
 * Highlights overdue items with custom warning border and red background glow.
 */
export const ComplaintCard = ({ complaint, isAdmin = false }) => {
  const navigate = useNavigate();
  const { id, category, description, photo_url, status, priority, is_overdue, created_at, updated_at, resident } = complaint;

  // Format dates nicely
  const formatDate = (isoStr) => {
    if (!isoStr) return 'N/A';
    return new Date(isoStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Determine path based on role
  const handleViewDetails = () => {
    if (isAdmin) {
      navigate(`/admin/complaints/${id}`);
    } else {
      navigate(`/resident/complaints/${id}`);
    }
  };

  // Red outline styles for overdue complaints that are not resolved
  const isOverdueActive = is_overdue && status !== 'Resolved';
  const cardBorderClass = isOverdueActive
    ? 'border-rose-300 bg-rose-50/40 hover:bg-rose-50 shadow-md shadow-rose-100 ring-1 ring-rose-300'
    : 'border-slate-200/80 bg-white hover:bg-slate-50/50 shadow-sm';

  return (
    <div className={`flex flex-col overflow-hidden rounded-xl border transition-all duration-200 hover:-translate-y-0.5 ${cardBorderClass}`}>
      {/* Red Alert bar at top if overdue */}
      {isOverdueActive && (
        <div className="flex items-center gap-1 bg-red-600 px-4 py-1 text-white text-[10px] font-bold uppercase tracking-wider">
          <AlertTriangle className="h-3 w-3" />
          Overdue Complaint
        </div>
      )}

      {/* Main card body */}
      <div className="flex flex-1 flex-col p-5">
        {/* Header: Category & Priority */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-800 leading-tight">
              {category}
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">
              ID: #{id?.substring(0, 8)}
            </span>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <StatusBadge status={status} />
            <PriorityBadge priority={priority} />
          </div>
        </div>

        {/* Resident Details (Admins only) */}
        {isAdmin && resident && (
          <div className="mt-3 flex flex-col gap-1 rounded-lg bg-slate-100/50 p-2.5 text-xs text-slate-600 border border-slate-200/40">
            <div className="flex items-center gap-1.5 font-medium text-slate-700">
              <User className="h-3.5 w-3.5 text-slate-400" />
              {resident.full_name}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 pl-5">
              <MapPin className="h-3 w-3 text-slate-400" />
              Flat {resident.flat_number}, {resident.building}
            </div>
          </div>
        )}

        {/* Complaint Image Thumbnail (if available) */}
        {photo_url ? (
          <div className="mt-4 aspect-video w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
            <img
              src={photo_url}
              alt={category}
              className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="mt-4 flex aspect-video w-full items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-xs text-slate-400">
            No image attached
          </div>
        )}

        {/* Description Snippet */}
        <p className="mt-4 flex-1 text-sm text-slate-500 line-clamp-3 leading-relaxed">
          {description}
        </p>

        {/* Dates */}
        <div className="mt-5 border-t border-slate-100 pt-4 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Created: {formatDate(created_at)}
          </span>
          <span className="flex items-center gap-1">
            <RefreshCw className="h-3 w-3" />
            Updated: {formatDate(updated_at)}
          </span>
        </div>
      </div>

      {/* Button: View details */}
      <button
        onClick={handleViewDetails}
        className={`flex items-center justify-center gap-1.5 border-t py-3 text-center text-xs font-semibold transition-colors duration-200 ${
          isOverdueActive
            ? 'border-rose-100 bg-rose-50 text-rose-700 hover:bg-rose-100/70'
            : 'border-slate-100 bg-slate-50 text-slate-600 hover:bg-slate-100/50'
        }`}
      >
        View Timeline & History
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

export default ComplaintCard;
