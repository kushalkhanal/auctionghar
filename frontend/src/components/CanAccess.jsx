import React from 'react';
import { usePermissions } from '../context/PermissionContext';

/**
 * Component wrapper that conditionally renders children based on permissions
 * 
 * Usage:
 * <CanAccess permission="users:delete">
 *   <DeleteButton />
 * </CanAccess>
 * 
 * <CanAccess role={['admin', 'superadmin']}>
 *   <AdminPanel />
 * </CanAccess>
 * 
 * <CanAccess anyPermission={['users:update', 'users:delete']}>
 *   <EditUserButton />
 * </CanAccess>
 */
const CanAccess = ({
    permission,
    anyPermission,
    allPermissions,
    role,
    fallback = null,
    children
}) => {
    const { hasPermission, hasAnyPermission, hasAllPermissions, hasRole } = usePermissions();

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

    return hasAccess ? <>{children}</> : <>{fallback}</>;
};

export default CanAccess;
