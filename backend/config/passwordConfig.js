/**
 * Password Security Configuration
 * Centralized constants for password expiration and history policies
 */

module.exports = {
    // Number of days until password expires
    PASSWORD_EXPIRY_DAYS: 90,

    // Number of previous passwords to store and prevent reuse
    PASSWORD_HISTORY_LIMIT: 5,

    // Number of days before expiration to show warning
    EXPIRY_WARNING_DAYS: 7
};
