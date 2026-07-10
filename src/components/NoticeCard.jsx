import React from 'react';
import { Edit2, Trash2, Pin, Calendar, User } from 'lucide-react';

/**
 * Notice Card displaying announcements.
 * Pinned important notices use highlighted background and icon.
 * Supports edit/delete actions if isAdmin = true.
 */
export const NoticeCard = ({ notice, isAdmin = false, onEdit, onDelete }) => {
  const { id, title, description, important, created_at, author } = notice;

  // Format date nicely
  const formatDate = (isoStr) => {
    return new Date(isoStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const cardBorderClass = important
    ? 'border-amber-300 bg-amber-50/50 shadow-md shadow-amber-50 hover:bg-amber-50/80 ring-1 ring-amber-300'
    : 'border-slate-200/80 bg-white hover:bg-slate-50/50 shadow-sm';

  return (
    <div className={`relative overflow-hidden rounded-xl border p-5 transition-all duration-200 ${cardBorderClass}`}>
      {/* Important Notice Header Badge */}
      {important && (
        <div className="absolute top-0 right-0 flex items-center gap-1 rounded-bl-lg bg-amber-500 px-3 py-1 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
          <Pin className="h-3 w-3 fill-current" />
          Pinned
        </div>
      )}

      {/* Main notice title */}
      <h3 className={`pr-16 text-base font-bold text-slate-800 leading-snug tracking-tight ${important ? 'text-amber-900' : ''}`}>
        {title}
      </h3>

      {/* Notice description */}
      <p className="mt-3 text-sm text-slate-600 leading-relaxed white-space-pre-wrap">
        {description}
      </p>

      {/* Footer Info & Admin Actions */}
      <div className="mt-6 border-t border-slate-100/80 pt-4 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(created_at)}
          </span>
          {author && (
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              By: {author.full_name || 'Admin'}
            </span>
          )}
        </div>

        {/* Action Controls for Admin */}
        {isAdmin && (
          <div className="flex items-center gap-1.5 pl-3 border-l border-slate-200">
            <button
              onClick={() => onEdit(notice)}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-primary-600 transition-all-300 active:scale-90"
              title="Edit Notice"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this notice?')) {
                  onDelete(id);
                }
              }}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-rose-200 bg-white text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-all-300 active:scale-90"
              title="Delete Notice"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NoticeCard;
