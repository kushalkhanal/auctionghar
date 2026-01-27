/**
 * Frontend Permission Constants
 * Mirror of backend permissions for type safety and consistency
 */

export const PERMISSIONS = {
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

export const ROLES = {
    USER: 'user',
    MODERATOR: 'moderator',
    ADMIN: 'admin',
    SUPERADMIN: 'superadmin'
};
