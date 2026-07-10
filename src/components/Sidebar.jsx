import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Home,
  ClipboardList,
  PlusCircle,
  FileText,
  Settings,
  X,
  ShieldAlert,
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  // Sidebar navigation options depending on roles
  const menuItems = isAdmin
    ? [
        { path: '/admin', label: 'Dashboard', icon: Home },
        { path: '/admin/complaints', label: 'Manage Complaints', icon: ClipboardList },
        { path: '/admin/notices', label: 'Announcements', icon: FileText },
        { path: '/admin/settings', label: 'Settings', icon: Settings },
      ]
    : [
        { path: '/resident', label: 'Dashboard', icon: Home },
        { path: '/resident/complaints', label: 'My Complaints', icon: ClipboardList },
        { path: '/resident/raise-complaint', label: 'Raise Complaint', icon: PlusCircle },
        { path: '/resident/notices', label: 'Notice Board', icon: FileText },
      ];

  const activeStyle = 'bg-primary-50 text-primary-700 font-semibold border-r-4 border-primary-600';
  const inactiveStyle = 'text-slate-600 hover:bg-slate-50 hover:text-slate-900';

  const sidebarContent = (
    <div className="flex h-full flex-col bg-white">
      {/* Sidebar Header */}
      <div className="flex h-16 items-center justify-between px-6 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white font-bold">
            S
          </div>
          <span className="text-base font-bold text-slate-800 tracking-tight">
            Resident Hub
          </span>
        </div>
        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 md:hidden"
          aria-label="Close Sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5 py-6 px-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all-300 ${
                  isActive ? activeStyle : inactiveStyle
                }`
              }
            >
              <Icon className="h-4.5 w-4.5" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* Sidebar Footer User Info */}
      <div className="border-t border-slate-100 p-4 bg-slate-50/30">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 font-semibold border border-slate-200 uppercase">
            {user?.full_name?.substring(0, 2)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-800">
              {user?.full_name}
            </p>
            <p className="truncate text-xs text-slate-400">
              {user?.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Drawer Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300 md:hidden ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Mobile Drawer Panel */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-white transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:z-0 md:flex md:w-64 md:flex-col md:border-r md:border-slate-200/80 shadow-lg md:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;
