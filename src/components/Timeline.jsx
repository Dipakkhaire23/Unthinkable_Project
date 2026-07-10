import React from 'react';
import { Calendar, User, Clock, FileText } from 'lucide-react';

/**
 * Renders a vertical timeline showing status updates, notes, timestamps, and executor names.
 */
export const Timeline = ({ history = [] }) => {
  // Format datetime
  const formatDateTime = (isoStr) => {
    return new Date(isoStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!history || history.length === 0) {
    return (
      <div className="text-center py-6 text-sm text-slate-400">
        No history records found for this complaint.
      </div>
    );
  }

  return (
    <div className="relative border-l-2 border-slate-100 pl-6 ml-3 space-y-8 py-2">
      {history.map((event, index) => {
        const isFirst = index === 0;
        const isLast = index === history.length - 1;
        const changerName = event.changer?.full_name || 'System';
        const changerRole = event.changer?.role === 'ADMIN' ? 'Admin' : 'Resident';

        // Choose marker color based on status
        let markerColor = 'bg-slate-300 ring-slate-100';
        if (event.new_status === 'Open') markerColor = 'bg-blue-500 ring-blue-100';
        if (event.new_status === 'In Progress') markerColor = 'bg-amber-500 ring-amber-100';
        if (event.new_status === 'Resolved') markerColor = 'bg-emerald-500 ring-emerald-100';

        return (
          <div key={event.id || index} className="relative animate-fade-in">
            {/* Vertical timeline node dot */}
            <span
              className={`absolute -left-[31px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full ring-4 ${markerColor}`}
            />

            {/* Event Details Card */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 shadow-xs hover:bg-slate-50 transition-all duration-200">
              {/* Event Title */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/50 pb-2">
                <span className="text-sm font-bold text-slate-800">
                  {event.old_status ? (
                    <>
                      Status changed to{' '}
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                        event.new_status === 'Resolved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : event.new_status === 'In Progress'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {event.new_status}
                      </span>
                    </>
                  ) : (
                    <span className="text-blue-700">Complaint Created</span>
                  )}
                </span>
                
                {/* Timestamp */}
                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Clock className="h-3 w-3" />
                  {formatDateTime(event.changed_at)}
                </span>
              </div>

              {/* Note body */}
              {event.note && (
                <div className="mt-3 text-sm text-slate-600 flex items-start gap-2 bg-white rounded-lg p-2.5 border border-slate-100 shadow-2xs">
                  <FileText className="h-4 w-4 shrink-0 text-slate-400 mt-0.5" />
                  <p className="leading-relaxed italic">"{event.note}"</p>
                </div>
              )}

              {/* Actor footer */}
              <div className="mt-3 flex items-center justify-end gap-1 text-[11px] text-slate-400">
                <User className="h-3.5 w-3.5" />
                <span>Changed by: <strong>{changerName}</strong> ({changerRole})</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Timeline;
