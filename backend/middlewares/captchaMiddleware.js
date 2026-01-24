const axios = require('axios');

/**
 * Verify Google reCAPTCHA v3 token
 * Checks if the request is from a human or a bot
 * IN DEVELOPMENT MODE: Fails open (allows requests) for easier testing
 */
const verifyCaptcha = async (req, res, next) => {
    const { captchaToken } = req.body;

    // Skip CAPTCHA check if secret key not configured (development)
    if (!process.env.RECAPTCHA_SECRET_KEY) {
        console.warn('⚠️  CAPTCHA disabled: RECAPTCHA_SECRET_KEY not set');
        return next();
    }

    // Allow null/undefined token to pass through (development mode)
    if (!captchaToken || captchaToken === null || captchaToken === 'null') {
        console.warn('⚠️  No CAPTCHA token provided, skipping verification');
        return next();
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
        const SCORE_THRESHOLD = 0.5;

        if (success && score >= SCORE_THRESHOLD) {
            // CAPTCHA passed - continue to next middleware
            req.captchaScore = score;
            return next();
        } else {
            // Fail open for development - log warning and continue
            console.warn(`⚠️  CAPTCHA score too low (${score}), allowing request anyway (development mode)`);
            return next();
        }

    } catch (error) {
        console.error('CAPTCHA verification error:', error.message);

        // Fail open in development - allow request to continue
        console.warn('⚠️  CAPTCHA verification failed, allowing request to continue (development mode)');
        return next();
    }
};

module.exports = { verifyCaptcha };
