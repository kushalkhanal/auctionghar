import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../context/PermissionContext';

/**
 * Protected route component that checks for permissions or roles
 * 
 * Usage:
 * <Route element={<ProtectedRoute permission="users:read" />}>
 *   <Route path="/admin/users" element={<UserManagement />} />
 * </Route>
 * 
 * <Route element={<ProtectedRoute role={['admin', 'superadmin']} />}>
 *   <Route path="/admin" element={<AdminDashboard />} />
 * </Route>
 */
const ProtectedRoute = ({
    permission,
    anyPermission,
    allPermissions,
    role,
    redirectTo = '/',
    children
}) => {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const location = useLocation();
    const {
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        hasRole,
        loading: permLoading
    } = usePermissions();

    // Show loading state while checking authentication and permissions
    if (authLoading || permLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Redirect if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    let hasAccess = false;

    // Check single permission
    if (permission) {
        hasAccess = hasPermission(permission);
    }
    // Check if user has ANY of the permissions
    else if (anyPermission && Array.isArray(anyPermission)) {
        hasAccess = hasAnyPermission(...anyPermission);
    }
    // Check if user has ALL permissions
    else if (allPermissions && Array.isArray(allPermissions)) {
        hasAccess = hasAllPermissions(...allPermissions);
    }
    // Check role
    else if (role) {
        const roles = Array.isArray(role) ? role : [role];
        hasAccess = hasRole(...roles);
    }
    // If no permission/role specified, just check authentication
    else {
        hasAccess = true;
    }

    return hasAccess ? (
        children || <Outlet />
    ) : (
        <Navigate to={redirectTo} replace />
    );
};

export default ProtectedRoute; 