const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    action: {
        type: String,
        required: true,
        index: true,
        enum: [
            // Authentication
            'user_login',
            'user_logout',
            'user_register',
            'password_change',
            'password_reset_request',
            'password_reset_complete',
            'mfa_enabled',
            'mfa_disabled',
            'login_failed',

            // Auction
            'auction_created',
            'auction_updated',
            'auction_deleted',
            'auction_viewed',
            'bid_placed',
            'bid_failed',
            'auction_won',

            // Payment
            'payment_initiated',
            'payment_completed',
            'payment_failed',
            'wallet_updated',
            'wallet_viewed',

            // Profile
            'profile_updated',
            'profile_viewed',
            'email_changed',

            // Admin
            'admin_action',
            'user_banned',
            'user_unbanned',
            'admin_login',

            // Other
            'file_upload',
            'file_delete',
            'search_performed',
            'notification_sent'
        ]
    },

    category: {
        type: String,
        required: true,
        index: true,
        enum: ['auth', 'auction', 'payment', 'profile', 'admin', 'system']
    },

    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },

    ipAddress: {
        type: String,
        required: true,
        index: true
    },

    userAgent: {
        type: String,
        default: null
    },

    status: {
        type: String,
        enum: ['success', 'failure', 'pending'],
        default: 'success',
        index: true
    },

    errorMessage: {
        type: String,
        default: null
    },

    duration: {
        type: Number, // in milliseconds
        default: null
    },

    resourceId: {
        type: String, // ID of related resource (auction, payment, etc.)
        default: null,
        index: true
    },

    resourceType: {
        type: String, // Type of resource (auction, payment, etc.)
        enum: ['auction', 'payment', 'user', 'bid', 'other', null],
        default: null
    }
}, {
    timestamps: true // Adds createdAt and updatedAt
});

// Compound indexes for efficient queries
activityLogSchema.index({ userId: 1, createdAt: -1 });
activityLogSchema.index({ action: 1, createdAt: -1 });
activityLogSchema.index({ category: 1, createdAt: -1 });
activityLogSchema.index({ status: 1, createdAt: -1 });
activityLogSchema.index({ createdAt: -1 }); // For general time-based queries

// TTL index to auto-delete logs older than 90 days (optional)
activityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

// Virtual for formatted timestamp
activityLogSchema.virtual('formattedTimestamp').get(function () {
    return this.createdAt.toLocaleString();
});

// Method to get human-readable action name
activityLogSchema.methods.getActionName = function () {
    const actionNames = {
        'user_login': 'User Login',
        'user_logout': 'User Logout',
        'user_register': 'User Registration',
        'password_change': 'Password Changed',
        'password_reset_request': 'Password Reset Requested',
        'password_reset_complete': 'Password Reset Completed',
        'mfa_enabled': 'MFA Enabled',
        'mfa_disabled': 'MFA Disabled',
        'login_failed': 'Login Failed',
        'auction_created': 'Auction Created',
        'auction_updated': 'Auction Updated',
        'auction_deleted': 'Auction Deleted',
        'auction_viewed': 'Auction Viewed',
        'bid_placed': 'Bid Placed',
        'bid_failed': 'Bid Failed',
        'auction_won': 'Auction Won',
        'payment_initiated': 'Payment Initiated',
        'payment_completed': 'Payment Completed',
        'payment_failed': 'Payment Failed',
        'wallet_updated': 'Wallet Updated',
        'wallet_viewed': 'Wallet Viewed',
        'profile_updated': 'Profile Updated',
        'profile_viewed': 'Profile Viewed',
        'email_changed': 'Email Changed',
        'admin_action': 'Admin Action',
        'user_banned': 'User Banned',
        'user_unbanned': 'User Unbanned',
        'admin_login': 'Admin Login'
    };

    return actionNames[this.action] || this.action;
};

module.exports = mongoose.model('ActivityLog', activityLogSchema);
