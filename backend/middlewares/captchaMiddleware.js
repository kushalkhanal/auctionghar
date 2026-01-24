const axios = require('axios');

/**
 * Verify Google reCAPTCHA v3 token
 * Checks if the request is from a human or a bot
 */
const verifyCaptcha = async (req, res, next) => {
    const { captchaToken } = req.body;

    // Skip CAPTCHA check if token is not required (for development)
    if (!process.env.RECAPTCHA_SECRET_KEY) {
        console.warn('⚠️  CAPTCHA disabled: RECAPTCHA_SECRET_KEY not set');
        return next();
    }

    if (!captchaToken) {
        return res.status(400).json({
            success: false,
            message: 'CAPTCHA verification required. Please refresh the page and try again.'
        });
    }

    try {
        // Verify with Google reCAPTCHA API
        const response = await axios.post(
            'https://www.google.com/recaptcha/api/siteverify',
            null,
            {
                params: {
                    secret: process.env.RECAPTCHA_SECRET_KEY,
                    response: captchaToken
                }
            }
        );

        const { success, score, action } = response.data;

        // For reCAPTCHA v3: Check score threshold (0.0 = bot, 1.0 = human)
        // Recommended threshold is 0.5
        const SCORE_THRESHOLD = 0.5;

        if (success && score >= SCORE_THRESHOLD) {
            // CAPTCHA passed - continue to next middleware
            req.captchaScore = score; // Store score for logging
            next();
        } else {
            return res.status(400).json({
                success: false,
                message: 'CAPTCHA verification failed. Please try again.',
                score: score // For debugging (remove in production)
            });
        }

    } catch (error) {
        console.error('CAPTCHA verification error:', error.message);

        // In production, you might want to fail open (allow request) or closed (deny request)
        // For security, we'll fail closed and deny the request
        return res.status(500).json({
            success: false,
            message: 'CAPTCHA verification error. Please try again later.'
        });
    }
};

module.exports = { verifyCaptcha };
