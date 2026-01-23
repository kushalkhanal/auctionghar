// src/layouts/MainLayout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../layouts/Header'; // optional
import PasswordExpiryWarning from '../components/PasswordExpiryWarning';
import { useAuth } from '../context/AuthContext';

const MainLayout = () => {
  const { user } = useAuth();
  const [expiryWarning, setExpiryWarning] = useState(null);

  useEffect(() => {
    // Check for password expiry warning in session storage
    const warningData = sessionStorage.getItem('passwordExpiryWarning');
    if (warningData && user) {
      try {
        const parsed = JSON.parse(warningData);
        setExpiryWarning(parsed);
      } catch (e) {
        console.error('Failed to parse password expiry warning:', e);
      }
    } else {
      setExpiryWarning(null);
    }
  }, [user]);

  const handleDismissWarning = () => {
    sessionStorage.removeItem('passwordExpiryWarning');
    setExpiryWarning(null);
  };

  return (
    <>
      <Header />
      <main className="p-4">
        {user && expiryWarning && (
          <div className="max-w-7xl mx-auto mb-4">
            <PasswordExpiryWarning
              daysRemaining={expiryWarning.daysRemaining}
              onDismiss={handleDismissWarning}
            />
          </div>
        )}
        <Outlet />
      </main>
    </>
  );
};
export default MainLayout;
