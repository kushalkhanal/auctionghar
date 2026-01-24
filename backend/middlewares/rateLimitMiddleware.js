const rateLimit = require('express-rate-limit');

/**
 * Rate Limiter for Login Attempts
 * - Prevents brute-force password attacks
 * - 5 attempts per 15 minutes per IP
 */
const loginRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: {
        success: false,
        message: 'Too many login attempts from this IP. Please try again in 15 minutes.'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    // Skip successful requests (only count failed login attempts)
    skipSuccessfulRequests: false, // Count all attempts to prevent enumeration
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: 'Too many login attempts from this IP. Please try again in 15 minutes.',
            retryAfter: Math.ceil(req.rateLimit.resetTime / 1000) // Unix timestamp
        });
    }
});

/**
 * Rate Limiter for Registration
 * - Prevents account creation spam
 * - 3 registrations per hour per IP
 */
const registrationRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    message: {
        success: false,
        message: 'Too many accounts created from this IP. Please try again after an hour.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: 'Too many accounts created from this IP. Please try again after an hour.',
            retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
        });
    }
});

/**
 * Rate Limiter for Password Reset Requests
 * - Prevents email flooding and user harassment
 * - 3 requests per hour per IP
 */
const passwordResetRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    message: {
        success: false,
        message: 'Too many password reset requests from this IP. Please try again after an hour.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: 'Too many password reset requests from this IP. Please try again after an hour.',
            retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
        });
    }
});

/**
 * Rate Limiter for MFA Verification
 * - Prevents TOTP/backup code brute-forcing
 * - 5 attempts per 5 minutes per IP
 */
const mfaVerificationRateLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 5,
    message: {
        success: false,
        message: 'Too many MFA verification attempts. Please try again in 5 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: 'Too many MFA verification attempts. Please try again in 5 minutes.',
            retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
        });
    }
});

/**
 * General API Rate Limiter (Optional)
 * - Prevents DoS attacks
 * - 100 requests per 15 minutes per IP
 */
const generalApiRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: {
        success: false,
        message: 'Too many requests from this IP. Please slow down.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: 'Too many requests from this IP. Please slow down.',
            retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
        });
    }
});

/**
 * Rate Limiter for Profile Updates
 * - Prevents spam profile updates
 * - 5 updates per 15 minutes per user
 */
const profileUpdateRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: {
        success: false,
        message: 'Too many profile updates. Please try again in 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: 'Too many profile updates. Please try again in 15 minutes.',
            retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
        });
    }
});

module.exports = {
    loginRateLimiter,
    registrationRateLimiter,
    passwordResetRateLimiter,
    mfaVerificationRateLimiter,
    profileUpdateRateLimiter,
    generalApiRateLimiter
};
