import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';

/**
 * Route protection wrapper based on authentication state and user roles.
 */
export const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();

  // If session is still loading, display the spinner
  if (loading) {
    return <Loader fullScreen={true} />;
  }

  // If user is not authenticated, redirect to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Role validation
  if (allowedRole && user.role !== allowedRole) {
    // Prevent cross-access by redirecting to their respective dashboards
    if (user.role === 'ADMIN') {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/resident" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
