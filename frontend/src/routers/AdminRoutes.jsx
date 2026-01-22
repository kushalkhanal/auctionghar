import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = () => {
    const { user, isAuthenticated, loading } = useAuth();


    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }


    return isAuthenticated && user?.role === 'admin' ? (
        <Outlet />
    ) : (
        <Navigate to="/" replace />
    );
};

export default AdminRoute;