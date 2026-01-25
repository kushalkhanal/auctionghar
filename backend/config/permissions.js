/**
 * Permissions Configuration
 * Defines all available permissions and role-permission mappings
 */

// All available permissions in the system
const PERMISSIONS = {
    // User Management
    USERS_READ: 'users:read',
    USERS_CREATE: 'users:create',
    USERS_UPDATE: 'users:update',
    USERS_DELETE: 'users:delete',
    USERS_SUSPEND: 'users:suspend',

    // Profile Management
    PROFILE_READ: 'profile:read',
    PROFILE_UPDATE: 'profile:update',
    PROFILE_DELETE: 'profile:delete',

    // Bidding Room Management
    BIDDING_CREATE: 'bidding:create',
    BIDDING_READ: 'bidding:read',
    BIDDING_UPDATE: 'bidding:update',
    BIDDING_UPDATE_ANY: 'bidding:update:any',
    BIDDING_DELETE: 'bidding:delete',
    BIDDING_DELETE_ANY: 'bidding:delete:any',
    BIDDING_APPROVE: 'bidding:approve',

    // Bid Management
    BIDS_CREATE: 'bids:create',
    BIDS_READ: 'bids:read',
    BIDS_READ_ANY: 'bids:read:any',

    // Wallet/Payment
    WALLET_READ: 'wallet:read',
    WALLET_UPDATE: 'wallet:update',
    WALLET_MANAGE_ANY: 'wallet:manage:any',

    // Dashboard/Analytics
    DASHBOARD_READ: 'dashboard:read',
    ANALYTICS_READ: 'analytics:read',

    // System
    SYSTEM_CONFIG: 'system:config',
    AUDIT_READ: 'audit:read'
};

// Define permissions for each role (without inheritance)
const ROLE_PERMISSIONS = {
    user: [
        PERMISSIONS.PROFILE_READ,
        PERMISSIONS.PROFILE_UPDATE,
        PERMISSIONS.BIDDING_CREATE,
        PERMISSIONS.BIDDING_READ,
        PERMISSIONS.BIDDING_UPDATE,
        PERMISSIONS.BIDDING_DELETE,
        PERMISSIONS.BIDS_CREATE,
        PERMISSIONS.BIDS_READ,
        PERMISSIONS.WALLET_READ,
        PERMISSIONS.WALLET_UPDATE
    ],

    moderator: [
        PERMISSIONS.BIDDING_APPROVE,
        PERMISSIONS.BIDDING_UPDATE_ANY,
        PERMISSIONS.USERS_SUSPEND,
        PERMISSIONS.BIDS_READ_ANY
    ],

    admin: [
        PERMISSIONS.USERS_READ,
        PERMISSIONS.USERS_CREATE,
        PERMISSIONS.USERS_UPDATE,
        PERMISSIONS.USERS_DELETE,
        PERMISSIONS.BIDDING_DELETE_ANY,
        PERMISSIONS.WALLET_MANAGE_ANY,
        PERMISSIONS.DASHBOARD_READ,
        PERMISSIONS.ANALYTICS_READ
    ],

    superadmin: [
        PERMISSIONS.SYSTEM_CONFIG,
        PERMISSIONS.AUDIT_READ
    ]
};

// Role hierarchy (lower roles inherit from higher)
const ROLE_HIERARCHY = ['user', 'moderator', 'admin', 'superadmin'];

/**
 * Get all permissions for a role including inherited permissions
 * @param {string} role - User role
 * @returns {string[]} Array of permissions
 */
function getPermissionsForRole(role) {
    const permissions = new Set();

    // Find role index in hierarchy
    const roleIndex = ROLE_HIERARCHY.indexOf(role);

    if (roleIndex === -1) {
        return [];
    }

    // Add permissions from current role and all lower roles
    for (let i = 0; i <= roleIndex; i++) {
        const roleName = ROLE_HIERARCHY[i];
        const rolePerms = ROLE_PERMISSIONS[roleName] || [];
        rolePerms.forEach(p => permissions.add(p));
    }

    return Array.from(permissions);
}

/**
 * Check if a role has a specific permission
 * @param {string} role - User role
 * @param {string} permission - Permission to check
 * @returns {boolean}
 */
function roleHasPermission(role, permission) {
    const permissions = getPermissionsForRole(role);
    return permissions.includes(permission);
}

/**
 * Get role level (higher number = more permissions)
 * @param {string} role - User role
 * @returns {number}
 */
function getRoleLevel(role) {
    return ROLE_HIERARCHY.indexOf(role);
}

/**
 * Check if roleA is higher than roleB in hierarchy
 * @param {string} roleA 
 * @param {string} roleB 
 * @returns {boolean}
 */
function isHigherRole(roleA, roleB) {
    return getRoleLevel(roleA) > getRoleLevel(roleB);
}

module.exports = {
    PERMISSIONS,
    ROLE_PERMISSIONS,
    ROLE_HIERARCHY,
    getPermissionsForRole,
    roleHasPermission,
    getRoleLevel,
    isHigherRole
};
