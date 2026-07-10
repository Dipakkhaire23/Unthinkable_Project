import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Menu, LogOut, User, Bell } from 'lucide-react';

export const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/85 px-4 backdrop-blur-md md:px-6 shadow-sm">
      {/* Left side: Hamburger (Mobile) & Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 active:scale-95 transition-all-300 md:hidden"
          aria-label="Toggle Menu"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white font-bold shadow-md shadow-primary-500/20">
            S
          </div>
          <span className="text-lg font-bold text-slate-800 tracking-tight hidden sm:inline-block">
            Society Maintenance Tracker
          </span>
          <span className="text-lg font-bold text-slate-800 tracking-tight sm:hidden">
            SMT
          </span>
        </div>
      </div>

      {/* Right side: Notifications & User Profile */}
      <div className="flex items-center gap-4">
        {/* Role tag */}
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
          user?.role === 'ADMIN'
            ? 'bg-red-50 text-red-700 border-red-200'
            : 'bg-primary-50 text-primary-700 border-primary-200'
        }`}>
          {user?.role === 'ADMIN' ? 'Admin Portal' : 'Resident Portal'}
        </span>

        {/* User Card */}
        <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
          <div className="hidden flex-col text-right md:flex">
            <span className="text-sm font-semibold text-slate-700 leading-tight">
              {user?.full_name}
            </span>
            <span className="text-xs text-slate-400">
              {user?.role === 'ADMIN' ? 'Administrator' : `Flat ${user?.flat_number}, ${user?.building}`}
            </span>
          </div>

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-primary-600 border border-slate-200 font-semibold uppercase">
            {user?.full_name?.substring(0, 2) || <User className="h-4 w-4" />}
          </div>

          {/* Logout Button */}
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to log out?')) {
                logout();
              }
            }}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 active:scale-95 transition-all-300"
            title="Log Out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
