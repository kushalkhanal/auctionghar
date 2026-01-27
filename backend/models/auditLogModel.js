const mongoose = require('mongoose');

/**
 * Audit Log Schema
 * Tracks all security-relevant actions for accountability
 */
const AuditLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true // For fast queries by user
    },
    action: {
        type: String,
        required: true,
        enum: [
            'profile_update',
            'password_change',
            'password_reset',
            'mfa_enable',
            'mfa_disable',
            'login',
            'logout',
            'failed_login'
        ],
        index: true // For filtering by action type
    },
    changes: {
        type: Map,
        of: String // Maps field name to "oldValue → newValue"
    },
    ipAddress: {
        type: String,
        required: true
    },
    userAgent: {
        type: String,
        required: true
    },
    success: {
        type: Boolean,
        default: true
    },
    errorMessage: String,
    timestamp: {
        type: Date,
        default: Date.now
        // index removed - using compound and TTL indexes below instead
    }
}, {
    timestamps: true // Adds createdAt and updatedAt
});

// Compound index for efficient user + time range queries
AuditLogSchema.index({ userId: 1, timestamp: -1 });

// TTL index - automatically delete logs older than 90 days
AuditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

// Check if model already exists to prevent OverwriteModelError
module.exports = mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);

