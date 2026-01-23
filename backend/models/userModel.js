const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
    {

        email: { type: String, required: true, unique: true },
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        password: { type: String, required: true },

        passwordResetOTP: { type: String },
        passwordResetExpires: { type: Date },

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

        role: { type: String, enum: ['user', 'admin'], default: 'user' },
        wallet: { type: Number, default: 0 },
        profileImage: { type: String, default: '/uploads/default-avatar.png' },
        location: { type: String, default: '', maxLength: 100 },
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