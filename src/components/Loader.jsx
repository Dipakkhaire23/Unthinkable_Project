import React from 'react';

/**
 * A highly styled loading spinner.
 * Supports inline or full-screen overlay mode.
 */
export const Loader = ({ fullScreen = false, size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-10 w-10 border-3',
    lg: 'h-16 w-16 border-4',
  };

  const spinner = (
    <div
      className={`animate-spin rounded-full border-t-primary-600 border-r-transparent border-b-primary-600 border-l-transparent ${
        sizeClasses[size] || sizeClasses.md
      }`}
      style={{ borderStyle: 'solid' }}
    />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/10 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-3 p-6 bg-white/95 rounded-2xl shadow-xl border border-slate-100">
          {spinner}
          <p className="text-sm font-medium text-slate-500 animate-pulse">Loading tracker data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-4">
      {spinner}
    </div>
  );
};

export default Loader;
