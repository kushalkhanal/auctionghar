import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axiosConfig';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // V V V V V  STEP 1: DEFINE `logout` FIRST (if needed by refetchUser) V V V V V
  // We define logout here so it can be used in refetchUser's error handling.
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // V V V V V  STEP 2: DEFINE `refetchUser` SECOND V V V V V
  // Now it can safely be called by the useEffect hook below.
  const refetchUser = useCallback(async () => {
    try {
      const { data } = await api.get('/users/me');
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        return true; // Indicate success
      }
      return false; // Indicate failure
    } catch (error) {
      console.error("Could not refetch user data:", error.response?.data?.message || error.message);
      if (error.response?.status === 401) {
        logout();
      }
      return false; // Indicate failure
    }
  }, []); // useCallback dependency array is empty as logout is defined in the same scope

  // V V V V V  STEP 3: DEFINE `useEffect` THIRD V V V V V
  // This useEffect runs on initial app load.
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (token) {
        // If we have a token, try to validate it
        try {
          const success = await refetchUser();
          if (!success) {
            // If token validation failed, clear everything
            logout();
          }
        } catch (error) {
          console.error("Token validation failed:", error);
          logout();
        }
      } else if (savedUser) {
        // If no token but saved user, clear it
        localStorage.removeItem('user');
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, [refetchUser]); // Dependency array is correct.

  // V V V V V  STEP 4: DEFINE `login` FOURTH V V V V V
  const login = (userData) => {
    localStorage.setItem('token', userData.token);
    localStorage.setItem('user', JSON.stringify(userData.user));
    setUser(userData.user);
  };

  // V V V V V  STEP 5: DEFINE THE `value` OBJECT LAST V V V V V
  const value = {
    user,
    setUser,
    login,
    logout,
    isAuthenticated: !!user,
    refetchUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};