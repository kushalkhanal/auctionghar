const { getPermissionsForRole } = require('../config/permissions');

/**
 * RBAC Middleware
 * Provides role-based and permission-based access control
 */

/**
 * Check if user has a specific permission
 * @param {string} requiredPermission - Permission required to access route
 */
const hasPermission = (requiredPermission) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // Get all permissions for user's role (includes inherited)
        const userPermissions = getPermissionsForRole(req.user.role);

        // Add custom permissions if user has any
        if (req.user.customPermissions && Array.isArray(req.user.customPermissions)) {
            userPermissions.push(...req.user.customPermissions);
        }

        // Check if user has the required permission
        if (userPermissions.includes(requiredPermission)) {
            return next();
        }

        return res.status(403).json({
            success: false,
            message: `Access denied. Required permission: ${requiredPermission}`,
            requiredPermission
        });
    };
};

/**
 * Check if user has one of the specified roles
 * @param {...string} allowedRoles - Roles that can access the route
 */
const hasRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (allowedRoles.includes(req.user.role)) {
            return next();
        }

        return res.status(403).json({
            success: false,
            message: `Access denied. Required role: ${allowedRoles.join(' or ')}`,
            requiredRoles: allowedRoles,
            userRole: req.user.role
        });
    };
};

/**
 * Check if user has ANY of the specified permissions
 * @param {...string} permissions - Permissions (at least one required)
 */
const hasAnyPermission = (...permissions) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const userPermissions = getPermissionsForRole(req.user.role);
        if (req.user.customPermissions && Array.isArray(req.user.customPermissions)) {
            userPermissions.push(...req.user.customPermissions);
        }

        // Check if user has at least one of the required permissions
        const hasAny = permissions.some(p => userPermissions.includes(p));

        if (hasAny) {
            return next();
        }

        return res.status(403).json({
            success: false,
            message: `Access denied. Required at least one of: ${permissions.join(', ')}`,
            requiredPermissions: permissions
        });
    };
};

/**
 * Check if user has ALL of the specified permissions
 * @param {...string} permissions - Permissions (all required)
 */
const hasAllPermissions = (...permissions) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const userPermissions = getPermissionsForRole(req.user.role);
        if (req.user.customPermissions && Array.isArray(req.user.customPermissions)) {
            userPermissions.push(...req.user.customPermissions);
        }

        // Check if user has all required permissions
        const hasAll = permissions.every(p => userPermissions.includes(p));

        if (hasAll) {
            return next();
        }

        const missingPermissions = permissions.filter(p => !userPermissions.includes(p));

        return res.status(403).json({
            success: false,
            message: `Access denied. Missing permissions: ${missingPermissions.join(', ')}`,
            requiredPermissions: permissions,
            missingPermissions
        });
    };
};

/**
 * Backward compatible isAdmin middleware
 * Allows admin and superadmin roles
 */
const isAdmin = hasRole('admin', 'superadmin');

/**
 * Check if user is moderator or higher
 */
const isModerator = hasRole('moderator', 'admin', 'superadmin');

/**
 * Middleware to attach user permissions to request object
 * Useful for controllers to check permissions dynamically
 */
const attachPermissions = (req, res, next) => {
    if (req.user) {
        req.userPermissions = getPermissionsForRole(req.user.role);

        if (req.user.customPermissions && Array.isArray(req.user.customPermissions)) {
            req.userPermissions.push(...req.user.customPermissions);
        }
    }
    next();
};

module.exports = {
    hasPermission,
    hasRole,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin,
    isModerator,
    attachPermissions
};
