import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axiosConfig';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Logout function - now calls backend to clear cookies
  const logout = async () => {
    try {
      // Call backend logout to clear HTTP-only cookies
      await api.post('/session/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage (for backward compatibility)
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  // Refetch user data
  const refetchUser = useCallback(async () => {
    try {
      const { data } = await api.get('/users/me');
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Could not refetch user data:", error.response?.data?.message || error.message);
      if (error.response?.status === 401) {
        await logout();
      }
      return false;
    }
  }, []);

  // Initialize auth on app load
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (token || savedUser) {
        // Try to validate session (works with both cookies and localStorage)
        try {
          const success = await refetchUser();
          if (!success) {
            await logout();
          }
        } catch (error) {
          console.error("Session validation failed:", error);
          await logout();
        }
      }

      setLoading(false);
    };

    initializeAuth();
  }, [refetchUser]);

  // Login function - stores user data
  const login = (userData) => {
    // Store token for backward compatibility (cookies are primary now)
    if (userData.token) {
      localStorage.setItem('token', userData.token);
    }
    localStorage.setItem('user', JSON.stringify(userData.user));
    setUser(userData.user);
  };

  const value = {
    user,
    setUser,
    login,
    logout,
    isAuthenticated: !!user,
    refetchUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};