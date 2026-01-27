const mongoose = require('mongoose');

/**
 * Audit Log Schema for Transaction Events
 * Provides comprehensive audit trail for compliance and security
 */
const auditLogSchema = new mongoose.Schema({
    // Transaction reference
    transactionId: {
        type: String,
        required: true,
        index: true
    },

    // Event details
    eventType: {
        type: String,
        required: true,
        enum: [
            'payment_initiated',
            'payment_verified',
            'payment_completed',
            'payment_failed',
            'wallet_updated',
            'verification_attempt',
            'fraud_detected',
            'rate_limit_exceeded',
            'webhook_received',
            'webhook_validated',
            'webhook_rejected'
        ]
    },

    // User context
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },

    // Request metadata
    ipAddress: {
        type: String,
        required: true
    },

    userAgent: {
        type: String
    },

    // Event data
    eventData: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },

    // Status and result
    status: {
        type: String,
        enum: ['success', 'failure', 'warning', 'info'],
        default: 'info'
    },

    // Error details (if applicable)
    errorMessage: {
        type: String
    },

    errorCode: {
        type: String
    },

    // Security context
    securityFlags: [{
        type: String,
        enum: [
            'suspicious_ip',
            'high_velocity',
            'unusual_amount',
            'duplicate_attempt',
            'invalid_signature',
            'rate_limited',
            'fraud_score_high'
        ]
    }],

    // Timestamp (auto-generated)
}, { timestamps: true });

// Indexes for efficient querying
auditLogSchema.index({ transactionId: 1, createdAt: -1 });
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ eventType: 1, createdAt: -1 });
auditLogSchema.index({ status: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: -1 }); // For time-based queries

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

/**
 * Audit Logger Utility Functions
 */

/**
 * Log a payment event to the audit trail
 * @param {Object} params - Event parameters
 * @returns {Promise<Object>} Created audit log entry
 */
const logPaymentEvent = async ({
    transactionId,
    eventType,
    userId,
    ipAddress,
    userAgent,
    eventData = {},
    status = 'info',
    errorMessage = null,
    errorCode = null,
    securityFlags = []
}) => {
    try {
        const auditEntry = new AuditLog({
            transactionId,
            eventType,
            userId,
            ipAddress,
            userAgent,
            eventData,
            status,
            errorMessage,
            errorCode,
            securityFlags
        });

        await auditEntry.save();

        // Log to console for immediate visibility
        console.log(`[AUDIT] ${eventType} - Transaction: ${transactionId} - Status: ${status}`);

        return auditEntry;
    } catch (error) {
        console.error('Failed to create audit log:', error);
        // Don't throw - audit logging should not break the main flow
        return null;
    }
};

/**
 * Get audit trail for a specific transaction
 * @param {string} transactionId - Transaction UUID
 * @returns {Promise<Array>} Array of audit log entries
 */
const getTransactionAuditTrail = async (transactionId) => {
    try {
        return await AuditLog.find({ transactionId })
            .sort({ createdAt: 1 })
            .lean();
    } catch (error) {
        console.error('Failed to retrieve audit trail:', error);
        return [];
    }
};

/**
 * Get audit logs for a specific user
 * @param {string} userId - User ID
 * @param {number} limit - Maximum number of entries to return
 * @returns {Promise<Array>} Array of audit log entries
 */
const getUserAuditLogs = async (userId, limit = 50) => {
    try {
        return await AuditLog.find({ userId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();
    } catch (error) {
        console.error('Failed to retrieve user audit logs:', error);
        return [];
    }
};

/**
 * Get recent security events
 * @param {number} hours - Number of hours to look back
 * @returns {Promise<Array>} Array of security-related audit entries
 */
const getRecentSecurityEvents = async (hours = 24) => {
    try {
        const since = new Date(Date.now() - hours * 60 * 60 * 1000);

        return await AuditLog.find({
            createdAt: { $gte: since },
            $or: [
                { status: 'failure' },
                { status: 'warning' },
                { securityFlags: { $exists: true, $ne: [] } }
            ]
        })
            .sort({ createdAt: -1 })
            .limit(100)
            .lean();
    } catch (error) {
        console.error('Failed to retrieve security events:', error);
        return [];
    }
};

/**
 * Clean up old audit logs (for retention policy)
 * @param {number} days - Number of days to retain
 * @returns {Promise<number>} Number of deleted entries
 */
const cleanupOldAuditLogs = async (days = 90) => {
    try {
        const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        const result = await AuditLog.deleteMany({
            createdAt: { $lt: cutoffDate }
        });

        console.log(`[AUDIT CLEANUP] Deleted ${result.deletedCount} old audit logs`);
        return result.deletedCount;
    } catch (error) {
        console.error('Failed to cleanup audit logs:', error);
        return 0;
    }
};

/**
 * Get audit statistics
 * @param {number} hours - Time window in hours
 * @returns {Promise<Object>} Statistics object
 */
const getAuditStatistics = async (hours = 24) => {
    try {
        const since = new Date(Date.now() - hours * 60 * 60 * 1000);

        const stats = await AuditLog.aggregate([
            { $match: { createdAt: { $gte: since } } },
            {
                $group: {
                    _id: '$eventType',
                    count: { $sum: 1 },
                    failures: {
                        $sum: { $cond: [{ $eq: ['$status', 'failure'] }, 1, 0] }
                    }
                }
            }
        ]);

        return stats;
    } catch (error) {
        console.error('Failed to get audit statistics:', error);
        return [];
    }
};

module.exports = {
    AuditLog,
    logPaymentEvent,
    getTransactionAuditTrail,
    getUserAuditLogs,
    getRecentSecurityEvents,
    cleanupOldAuditLogs,
    getAuditStatistics
};
