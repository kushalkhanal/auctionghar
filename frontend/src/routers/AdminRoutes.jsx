import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../context/PermissionContext';

const AdminRoute = () => {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const { hasRole, loading: permLoading } = usePermissions();

    if (authLoading || permLoading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    // Allow moderator, admin, and superadmin roles
    const isAdminUser = isAuthenticated && hasRole('moderator', 'admin', 'superadmin');

    return isAdminUser ? (
        <Outlet />
    ) : (
        <Navigate to="/" replace />
    );
};

export default AdminRoute;