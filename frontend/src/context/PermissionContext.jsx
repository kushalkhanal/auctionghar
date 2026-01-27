import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from './AuthContext';

const PermissionContext = createContext();

export const usePermissions = () => {
    const context = useContext(PermissionContext);
    if (!context) {
        throw new Error('usePermissions must be used within a PermissionProvider');
    }
    return context;
};

export const PermissionProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const [permissions, setPermissions] = useState([]);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch user permissions from backend
    const fetchPermissions = async () => {
        if (!isAuthenticated) {
            setPermissions([]);
            setRole(null);
            setLoading(false);
            return;
        }

        try {
            const { data } = await api.get('/rbac/permissions');
            setPermissions(data.permissions || []);
            setRole(data.role || null);

            // Cache permissions in localStorage for quick access
            localStorage.setItem('userPermissions', JSON.stringify(data.permissions));
            localStorage.setItem('userRole', data.role);
        } catch (error) {
            console.error('Failed to fetch permissions:', error);
            // Fallback to cached permissions
            const cachedPermissions = localStorage.getItem('userPermissions');
            const cachedRole = localStorage.getItem('userRole');
            if (cachedPermissions) {
                setPermissions(JSON.parse(cachedPermissions));
            }
            if (cachedRole) {
                setRole(cachedRole);
            }
        } finally {
            setLoading(false);
        }
    };

    // Fetch permissions when user logs in
    useEffect(() => {
        fetchPermissions();
    }, [isAuthenticated, user]);

    // Clear permissions on logout
    useEffect(() => {
        if (!isAuthenticated) {
            setPermissions([]);
            setRole(null);
            localStorage.removeItem('userPermissions');
            localStorage.removeItem('userRole');
        }
    }, [isAuthenticated]);

    /**
     * Check if user has a specific permission
     * @param {string} permission - Permission to check (e.g., 'users:delete')
     * @returns {boolean}
     */
    const hasPermission = (permission) => {
        if (!isAuthenticated) return false;
        return permissions.includes(permission);
    };

    /**
     * Check if user has ANY of the specified permissions
     * @param {...string} perms - Permissions to check
     * @returns {boolean}
     */
    const hasAnyPermission = (...perms) => {
        if (!isAuthenticated) return false;
        return perms.some(p => permissions.includes(p));
    };

    /**
     * Check if user has ALL of the specified permissions
     * @param {...string} perms - Permissions to check
     * @returns {boolean}
     */
    const hasAllPermissions = (...perms) => {
        if (!isAuthenticated) return false;
        return perms.every(p => permissions.includes(p));
    };

    /**
     * Check if user has a specific role
     * @param {...string} roles - Roles to check
     * @returns {boolean}
     */
    const hasRole = (...roles) => {
        if (!isAuthenticated || !role) return false;
        return roles.includes(role);
    };

    /**
     * Check if user is admin or superadmin
     * @returns {boolean}
     */
    const isAdmin = () => {
        return hasRole('admin', 'superadmin');
    };

    /**
     * Check if user is moderator or higher
     * @returns {boolean}
     */
    const isModerator = () => {
        return hasRole('moderator', 'admin', 'superadmin');
    };

    /**
     * Refresh permissions from server
     */
    const refreshPermissions = async () => {
        await fetchPermissions();
    };

    const value = {
        permissions,
        role,
        loading,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        hasRole,
        isAdmin,
        isModerator,
        refreshPermissions
    };

    return (
        <PermissionContext.Provider value={value}>
            {children}
        </PermissionContext.Provider>
    );
};
