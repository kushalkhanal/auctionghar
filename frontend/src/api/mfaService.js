import api from './axiosConfig';

/**
 * MFA API Service
 * Handles all Multi-Factor Authentication related API calls
 */

/**
 * Request MFA setup - Get QR code and secret
 * @returns {Promise} QR code data URL and secret
 */
export const enableMFA = async () => {
    const response = await api.post('/mfa/enable');
    return response.data;
};

/**
 * Verify MFA setup with TOTP token
 * @param {string} token - 6-digit TOTP code from authenticator app
 * @returns {Promise} Backup codes (only shown once)
 */
export const verifyMFASetup = async (token) => {
    const response = await api.post('/mfa/verify-setup', { token });
    return response.data;
};

/**
 * Verify MFA during login
 * @param {string} token - TOTP code or backup code
 * @param {boolean} isBackupCode - Whether the token is a backup code
 * @param {string} tempToken - Temporary token from initial login
 * @returns {Promise} Full JWT token and user data
 */
export const verifyMFALogin = async (token, isBackupCode, tempToken) => {
    const response = await api.post('/mfa/verify-login',
        { token, isBackupCode },
        {
            headers: {
                Authorization: `Bearer ${tempToken}`
            }
        }
    );
    return response.data;
};

/**
 * Disable MFA for user account
 * @param {string} password - User's current password
 * @returns {Promise}
 */
export const disableMFA = async (password) => {
    const response = await api.post('/mfa/disable', { password });
    return response.data;
};

/**
 * Regenerate backup codes
 * @returns {Promise} New set of backup codes
 */
export const regenerateBackupCodes = async () => {
    const response = await api.post('/mfa/backup-codes/regenerate');
    return response.data;
};

/**
 * Get MFA status for current user
 * @returns {Promise} MFA status information
 */
export const getMFAStatus = async () => {
    const response = await api.get('/mfa/status');
    return response.data;
};
