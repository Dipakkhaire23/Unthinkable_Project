import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { getCurrentUser, signInUser, signUpUser, signOutUser } from '../services/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to load user profile
  const fetchUserProfile = async () => {
    try {
      const profile = await getCurrentUser();
      setUser(profile);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 1. Initial Profile Load
    fetchUserProfile();

    // 2. Setup auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        // If logged in, fetch the profile
        await fetchUserProfile();
      } else {
        // If logged out, reset state
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await signInUser({ email, password });
      // Fetch profile after login to resolve role
      const profile = await getCurrentUser();
      setUser(profile);
      return profile;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const register = async ({ email, password, fullName, phone, flatNumber, building }) => {
    setLoading(true);
    try {
      const data = await signUpUser({ email, password, fullName, phone, flatNumber, building });
      setLoading(false);
      return data;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOutUser();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    refreshUser: fetchUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
