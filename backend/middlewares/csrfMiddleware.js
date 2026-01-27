const crypto = require('crypto');

/**
 * CSRF Protection Middleware
 * Protects against Cross-Site Request Forgery attacks on payment endpoints
 */

// In-memory token store (use Redis in production for scalability)
const tokenStore = new Map();
const TOKEN_EXPIRY = 3600000; // 1 hour in milliseconds

/**
 * Generate a CSRF token
 * @param {string} userId - User ID
 * @returns {string} CSRF token
 */
const generateCSRFToken = (userId) => {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + TOKEN_EXPIRY;

    tokenStore.set(token, {
        userId,
        expiresAt,
        used: false
    });

    // Clean up expired tokens
    setTimeout(() => {
        tokenStore.delete(token);
    }, TOKEN_EXPIRY);

    return token;
};

/**
 * Validate CSRF token
 * @param {string} token - CSRF token to validate
 * @param {string} userId - User ID
 * @returns {boolean} True if valid
 */
const validateCSRFToken = (token, userId) => {
    const tokenData = tokenStore.get(token);

    if (!tokenData) {
        return false;
    }

    // Check if token has expired
    if (Date.now() > tokenData.expiresAt) {
        tokenStore.delete(token);
        return false;
    }

    // Check if token has already been used (one-time use)
    if (tokenData.used) {
        return false;
    }

    // Check if token belongs to the user
    if (tokenData.userId !== userId.toString()) {
        return false;
    }

    // Mark token as used
    tokenData.used = true;

    return true;
};

/**
 * Middleware to generate and send CSRF token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCSRFToken = (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: User not authenticated'
            });
        }

        const token = generateCSRFToken(req.user._id.toString());

        res.status(200).json({
            success: true,
            csrfToken: token
        });
    } catch (error) {
        console.error('CSRF token generation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate CSRF token'
        });
    }
};

/**
 * Middleware to validate CSRF token on protected routes
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
const validateCSRF = (req, res, next) => {
    try {
        // Skip CSRF validation for GET requests
        if (req.method === 'GET') {
            return next();
        }

        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: User not authenticated'
            });
        }

        // Get token from header or body
        const token = req.headers['x-csrf-token'] || req.body.csrfToken;

        if (!token) {
            console.warn('[CSRF] Missing CSRF token');
            return res.status(403).json({
                success: false,
                message: 'Forbidden: Missing CSRF token'
            });
        }

        const isValid = validateCSRFToken(token, req.user._id.toString());

        if (!isValid) {
            console.warn('[CSRF] Invalid or expired CSRF token');
            return res.status(403).json({
                success: false,
                message: 'Forbidden: Invalid or expired CSRF token'
            });
        }

        console.log('[CSRF] Token validated successfully');
        next();
    } catch (error) {
        console.error('[CSRF] Validation error:', error);
        return res.status(500).json({
            success: false,
            message: 'CSRF validation failed'
        });
    }
};

/**
 * Clean up expired tokens (run periodically)
 */
const cleanupExpiredTokens = () => {
    const now = Date.now();
    let cleaned = 0;

    for (const [token, data] of tokenStore.entries()) {
        if (now > data.expiresAt || data.used) {
            tokenStore.delete(token);
            cleaned++;
        }
    }

    if (cleaned > 0) {
        console.log(`[CSRF] Cleaned up ${cleaned} expired tokens`);
    }
};

// Run cleanup every 15 minutes
setInterval(cleanupExpiredTokens, 900000);

module.exports = {
    generateCSRFToken,
    validateCSRFToken,
    getCSRFToken,
    validateCSRF,
    cleanupExpiredTokens
};
