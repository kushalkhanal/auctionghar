const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
    {

        email: { type: String, required: true, unique: true },
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        password: { type: String, required: true },

        passwordResetOTP: { type: String },
        passwordResetExpires: { type: Date },

        // Multi-Factor Authentication (MFA) fields
        mfaEnabled: {
            type: Boolean,
            default: false
        },
        mfaSecret: {
            type: String,
            select: false // Don't return by default for security
        },
        mfaVerified: {
            type: Boolean,
            default: false
        },
        backupCodes: [{
            code: {
                type: String,
                required: true
            },
            used: {
                type: Boolean,
                default: false
            },
            usedAt: Date
        }],
        mfaEnabledAt: Date,

        // Account lockout fields for brute-force protection
        failedLoginAttempts: {
            type: Number,
            default: 0
        },
        lockoutUntil: {
            type: Date,
            default: null
        },
        lastFailedLogin: {
            type: Date
        },

        // Password history tracking for reuse prevention
        passwordHistory: [{
            hash: { type: String, required: true },
            changedAt: { type: Date, default: Date.now }
        }],

        // Password expiration tracking
        passwordChangedAt: {
            type: Date,
            default: Date.now
        },
        passwordExpiresAt: {
            type: Date,
            index: true
        },


        number: {
            type: String,
            required: true,
            unique: true,
            match: [/^\d{10}$/, 'Please fill a valid 10-digit mobile number']
        },

        role: {
            type: String,
            enum: ['user', 'moderator', 'admin', 'superadmin'],
            default: 'user'
        },

        // Custom permissions override (optional)
        // Allows granting specific permissions beyond role defaults
        customPermissions: {
            type: [String],
            default: []
        },

        wallet: { type: Number, default: 0 },
        profileImage: { type: String, default: '/uploads/default-avatar.png' },
        location: { type: String, default: '', maxLength: 100 },

        // Privacy settings - control what others can see
        privacy: {
            profileVisibility: {
                type: String,
                enum: ['public', 'bidders', 'private'],
                default: 'public'
            },
            showEmail: {
                type: Boolean,
                default: false
            },
            showLocation: {
                type: Boolean,
                default: true
            },
            showPhone: {
                type: Boolean,
                default: false
            }
        }
    },
    { timestamps: true }
);

// Pre-save hook to automatically calculate passwordExpiresAt
UserSchema.pre('save', function (next) {
    // Only calculate expiry if password or passwordChangedAt is modified
    if (this.isModified('password') || this.isModified('passwordChangedAt')) {
        const PASSWORD_EXPIRY_DAYS = 90;
        this.passwordExpiresAt = new Date(
            (this.passwordChangedAt || Date.now()) + PASSWORD_EXPIRY_DAYS * 24 * 60 * 60 * 1000
        );
    }
    next();
});

module.exports = mongoose.model("User", UserSchema);