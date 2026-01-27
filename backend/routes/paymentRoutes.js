
const express = require('express');
const router = express.Router();

const {
    initiateEsewaPayment,
    verifyEsewaPayment,
    getTransactionHistory,
    confirmFrontendPayment,
    getFailedPayments,
    getPaymentAuditLog,
    getSuspiciousTransactions,
} = require('../controllers/paymentController.js');

const { protect } = require('../middlewares/authMiddleware.js');
const { logWebhookReceipt, validateWebhook } = require('../middlewares/webhookValidator.js');

// Import rate limiters
const rateLimit = require('express-rate-limit');

// Payment initiation rate limiter - 5 requests per 15 minutes per user
const paymentInitiationRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: {
        success: false,
        message: 'Too many payment attempts. Please try again in 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: 'Too many payment attempts. Please try again in 15 minutes.',
            retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
        });
    }
});

// Webhook rate limiter - 20 requests per minute globally
const webhookRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 20,
    message: {
        success: false,
        message: 'Too many webhook requests'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// User routes
router.post("/initiate", protect, paymentInitiationRateLimiter, initiateEsewaPayment);
router.get("/history", protect, getTransactionHistory);
router.post("/confirm-from-frontend", protect, confirmFrontendPayment);

// Webhook route (called by eSewa)
router.get("/verify", webhookRateLimiter, logWebhookReceipt, validateWebhook, verifyEsewaPayment);

// Admin routes (require admin permissions)
router.get("/failed", protect, getFailedPayments);
router.get("/audit/:transactionId", protect, getPaymentAuditLog);
router.get("/monitor/suspicious", protect, getSuspiciousTransactions);

module.exports = router;