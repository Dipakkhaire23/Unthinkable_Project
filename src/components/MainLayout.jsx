import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

/**
 * Standard Main Layout wrapper that provides Sidebar drawer navigation
 * and sticky top Navbar across all dashboards.
 */
export const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
      {/* Sidebar (Desktop Permanent / Mobile Drawer overlay) */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main viewport area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Sticky Header */}
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        {/* Content Outlet scroll-box */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
