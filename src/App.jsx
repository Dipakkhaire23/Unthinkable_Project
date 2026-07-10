import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';
import { isConfigured } from './services/supabase';
import SetupRequired from './components/SetupRequired';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ResidentDashboard from './pages/ResidentDashboard';
import ResidentComplaints from './pages/ResidentComplaints';
import RaiseComplaint from './pages/RaiseComplaint';
import ComplaintDetails from './pages/ComplaintDetails';
import NoticeBoard from './pages/NoticeBoard';
import AdminDashboard from './pages/AdminDashboard';
import ManageComplaints from './pages/ManageComplaints';
import ManageNotices from './pages/ManageNotices';
import Settings from './pages/Settings';

function App() {
  if (!isConfigured) {
    return <SetupRequired />;
  }

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Resident Protected Portal Routes */}
          <Route
            path="/resident"
            element={
              <ProtectedRoute allowedRole="RESIDENT">
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<ResidentDashboard />} />
            <Route path="complaints" element={<ResidentComplaints />} />
            <Route path="raise-complaint" element={<RaiseComplaint />} />
            <Route path="complaints/:id" element={<ComplaintDetails />} />
            <Route path="notices" element={<NoticeBoard />} />
          </Route>

          {/* Admin Protected Portal Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRole="ADMIN">
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="complaints" element={<ManageComplaints />} />
            <Route path="complaints/:id" element={<ComplaintDetails />} />
            <Route path="notices" element={<ManageNotices />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Fallback Root Directives */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
