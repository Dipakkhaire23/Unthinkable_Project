import React from 'react';

/**
 * Modern Status Badge with solid dot indicator and matching colors.
 */
export const StatusBadge = ({ status }) => {
  const styles = {
    'Open': 'bg-blue-50 text-blue-700 border-blue-200/60 ring-blue-500/10',
    'In Progress': 'bg-amber-50 text-amber-700 border-amber-200/60 ring-amber-500/10',
    'Resolved': 'bg-emerald-50 text-emerald-700 border-emerald-200/60 ring-emerald-500/10',
  };

  const dots = {
    'Open': 'bg-blue-500',
    'In Progress': 'bg-amber-500',
    'Resolved': 'bg-emerald-500',
  };

  const currentStyle = styles[status] || 'bg-slate-50 text-slate-700 border-slate-200 ring-slate-500/10';
  const currentDot = dots[status] || 'bg-slate-500';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ring-1 ring-inset ${currentStyle}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${currentDot}`} />
      {status}
    </span>
  );
};

export default StatusBadge;
