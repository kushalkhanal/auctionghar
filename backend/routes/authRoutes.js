
const express = require('express');
const router = express.Router();
const { registerUser, loginUser, forgotPassword, resetPassword } = require('../controllers/userController.js');
const {
    loginRateLimiter,
    registrationRateLimiter,
    passwordResetRateLimiter
} = require('../middlewares/rateLimitMiddleware.js');
const { verifyCaptcha } = require('../middlewares/captchaMiddleware.js');
const {
    validateRegister,
    validateLogin,
    validatePasswordResetRequest,
    validatePasswordReset,
    checkValidation
} = require('../middlewares/validationMiddleware.js');

// Apply rate limiters, CAPTCHA, and validation to prevent brute-force attacks and invalid inputs
router.post('/register', registrationRateLimiter, verifyCaptcha, validateRegister, checkValidation, registerUser);
router.post('/login', loginRateLimiter, verifyCaptcha, validateLogin, checkValidation, loginUser);
router.post('/forgot-password', passwordResetRateLimiter, validatePasswordResetRequest, checkValidation, forgotPassword);
router.post('/reset-password', passwordResetRateLimiter, validatePasswordReset, checkValidation, resetPassword);

module.exports = router;