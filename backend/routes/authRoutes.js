
const express = require('express');
const router = express.Router();
const { registerUser, loginUser, forgotPassword,
    resetPassword } = require('../controllers/userController.js');
const {
    loginRateLimiter,
    registrationRateLimiter,
    passwordResetRateLimiter
} = require('../middlewares/rateLimitMiddleware.js');
const { verifyCaptcha } = require('../middlewares/captchaMiddleware.js');

// Apply rate limiters and CAPTCHA to prevent brute-force attacks
router.post('/register', registrationRateLimiter, verifyCaptcha, registerUser);
router.post('/login', loginRateLimiter, verifyCaptcha, loginUser);
router.post('/forgot-password', passwordResetRateLimiter, forgotPassword);
router.post('/reset-password', passwordResetRateLimiter, resetPassword);

module.exports = router;