
const express = require('express');
const router = express.Router();
const { registerUser, loginUser, forgotPassword,
    resetPassword } = require('../controllers/userController.js');
const {
    loginRateLimiter,
    registrationRateLimiter,
    passwordResetRateLimiter
} = require('../middlewares/rateLimitMiddleware.js');

// Apply rate limiters to prevent brute-force attacks
router.post('/register', registrationRateLimiter, registerUser);
router.post('/login', loginRateLimiter, loginUser);
router.post('/forgot-password', passwordResetRateLimiter, forgotPassword);
router.post('/reset-password', passwordResetRateLimiter, resetPassword);

module.exports = router;