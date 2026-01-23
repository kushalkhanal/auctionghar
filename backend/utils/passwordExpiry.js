/**
 * Password Expiry Utility
 * Functions to manage password expiration logic and warnings
 */

const { PASSWORD_EXPIRY_DAYS, EXPIRY_WARNING_DAYS } = require('../config/passwordConfig');

/**
 * Check if user's password has expired
 * @param {Object} user - User document from database
 * @returns {boolean} - True if password has expired
 */
const isPasswordExpired = (user) => {
    if (!user.passwordExpiresAt) {
        return false;
    }
    return new Date() > new Date(user.passwordExpiresAt);
};

/**
 * Calculate days remaining until password expires
 * @param {Object} user - User document from database
 * @returns {number} - Days until expiration (negative if already expired)
 */
const getDaysUntilExpiration = (user) => {
    if (!user.passwordExpiresAt) {
        return Infinity;
    }

    const now = new Date();
    const expiryDate = new Date(user.passwordExpiresAt);
    const diffMs = expiryDate - now;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    return diffDays;
};

/**
 * Check if user should receive expiration warning
 * @param {Object} user - User document from database
 * @returns {boolean} - True if within warning period
 */
const shouldWarnExpiration = (user) => {
    const daysRemaining = getDaysUntilExpiration(user);
    return daysRemaining > 0 && daysRemaining <= EXPIRY_WARNING_DAYS;
};

/**
 * Update password expiration date after password change
 * @param {Object} user - User document from database
 * @returns {Date} - New expiration date
 */
const updatePasswordExpiry = (user) => {
    const now = new Date();
    user.passwordChangedAt = now;
    user.passwordExpiresAt = new Date(now.getTime() + PASSWORD_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
    return user.passwordExpiresAt;
};

module.exports = {
    isPasswordExpired,
    getDaysUntilExpiration,
    shouldWarnExpiration,
    updatePasswordExpiry
};
