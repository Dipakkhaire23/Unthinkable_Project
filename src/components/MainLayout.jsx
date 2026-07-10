import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { Home, ClipboardList, PlusCircle, FileText, Settings } from 'lucide-react';

/**
 * Standard Main Layout wrapper that provides Sidebar drawer navigation
 * and sticky top Navbar across all dashboards.
 * Enhances UX with a native-feel mobile bottom navigation tab bar.
 */
export const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  // Mobile Bottom Tab Menu Items
  const mobileMenuItems = isAdmin
    ? [
        { path: '/admin', label: 'Home', icon: Home },
        { path: '/admin/complaints', label: 'Tickets', icon: ClipboardList },
        { path: '/admin/notices', label: 'Notices', icon: FileText },
        { path: '/admin/settings', label: 'Settings', icon: Settings },
      ]
    : [
        { path: '/resident', label: 'Home', icon: Home },
        { path: '/resident/complaints', label: 'Tickets', icon: ClipboardList },
        { path: '/resident/raise-complaint', label: 'Raise', icon: PlusCircle },
        { path: '/resident/notices', label: 'Notices', icon: FileText },
      ];

  const activeMobileTab = 'text-primary-600 scale-105';
  const inactiveMobileTab = 'text-slate-400 hover:text-slate-650';

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
      {/* Sidebar (Desktop Permanent / Mobile Drawer overlay) */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main viewport area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Sticky Header */}
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        {/* Content Outlet scroll-box */}
        {/* Added bottom padding pb-20 on mobile to clear the bottom navigation bar */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6 animate-fade-in">
          <Outlet />
        </main>

        {/* Mobile Bottom Tab Navigation Panel */}
        <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white/95 border-t border-slate-200/85 flex items-center justify-around px-2 pb-safe shadow-lg backdrop-blur-md md:hidden z-30 select-none">
          {mobileMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-semibold transition-all duration-200 active:scale-95 ${
                    isActive ? activeMobileTab : inactiveMobileTab
                  }`
                }
              >
                <Icon className="h-5 w-5 mb-0.5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default MainLayout;
