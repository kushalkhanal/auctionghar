const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        refreshToken: {
            type: String,
            required: true,
            unique: true
        },
        deviceInfo: {
            userAgent: String,
            ip: String,
            browser: String,
            os: String,
            device: String
        },
        isActive: {
            type: Boolean,
            default: true
        },
        lastActivity: {
            type: Date,
            default: Date.now
        },
        expiresAt: {
            type: Date,
            required: true
            // index removed - using TTL index below instead
        }
    },
    { timestamps: true }
);

// Index for automatic cleanup of expired sessions
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Update last activity on access
SessionSchema.methods.updateActivity = function () {
    this.lastActivity = new Date();
    return this.save();
};

// Revoke session
SessionSchema.methods.revoke = function () {
    this.isActive = false;
    return this.save();
};

module.exports = mongoose.model('Session', SessionSchema);
