import React from 'react';

/**
 * Modern Priority Badge indicating task urgency.
 */
export const PriorityBadge = ({ priority }) => {
  const styles = {
    'Low': 'bg-slate-100 text-slate-700 border-slate-200 ring-slate-500/10',
    'Medium': 'bg-indigo-50 text-indigo-700 border-indigo-200/60 ring-indigo-500/10',
    'High': 'bg-rose-50 text-rose-700 border-rose-200/60 ring-rose-500/10',
  };

  const dots = {
    'Low': 'bg-slate-400',
    'Medium': 'bg-indigo-500',
    'High': 'bg-rose-500',
  };

  const currentStyle = styles[priority] || 'bg-slate-100 text-slate-700 border-slate-200 ring-slate-500/10';
  const currentDot = dots[priority] || 'bg-slate-400';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ring-1 ring-inset ${currentStyle}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${currentDot}`} />
      {priority}
    </span>
  );
};

export default PriorityBadge;
