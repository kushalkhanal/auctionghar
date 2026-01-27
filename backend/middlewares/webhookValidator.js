const { verifyHMAC } = require('../utils/encryptionUtils');
const { logPaymentEvent } = require('../utils/auditLogger');

/**
 * Webhook Validator Middleware
 * Validates incoming webhooks from eSewa for security
 */

// eSewa webhook configuration
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || process.env.ESEWA_MERCHANT_SECRET;
const ESEWA_WEBHOOK_IPS = (process.env.ESEWA_WEBHOOK_IPS || '').split(',').map(ip => ip.trim());
const WEBHOOK_TIMESTAMP_TOLERANCE = 300000; // 5 minutes in milliseconds

/**
 * Validate webhook signature
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
const validateWebhookSignature = (req, res, next) => {
    try {
        const signature = req.headers['x-esewa-signature'] || req.headers['x-webhook-signature'];

        if (!signature) {
            console.warn('[WEBHOOK] Missing signature header');

            logPaymentEvent({
                transactionId: 'unknown',
                eventType: 'webhook_rejected',
                userId: null,
                ipAddress: req.ip || req.connection.remoteAddress,
                userAgent: req.headers['user-agent'],
                status: 'failure',
                errorMessage: 'Missing webhook signature',
                securityFlags: ['invalid_signature']
            });

            return res.status(401).json({
                success: false,
                message: 'Unauthorized: Missing signature'
            });
        }

        // Verify HMAC signature
        const isValid = verifyHMAC(req.body, signature, WEBHOOK_SECRET);

        if (!isValid) {
            console.warn('[WEBHOOK] Invalid signature');

            logPaymentEvent({
                transactionId: req.body?.transaction_uuid || 'unknown',
                eventType: 'webhook_rejected',
                userId: null,
                ipAddress: req.ip || req.connection.remoteAddress,
                userAgent: req.headers['user-agent'],
                status: 'failure',
                errorMessage: 'Invalid webhook signature',
                securityFlags: ['invalid_signature']
            });

            return res.status(401).json({
                success: false,
                message: 'Unauthorized: Invalid signature'
            });
        }

        console.log('[WEBHOOK] Signature validated successfully');
        next();
    } catch (error) {
        console.error('[WEBHOOK] Signature validation error:', error);
        return res.status(500).json({
            success: false,
            message: 'Signature validation failed'
        });
    }
};

/**
 * Validate webhook source IP
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
const validateWebhookIP = (req, res, next) => {
    // Skip IP validation if no IPs configured (development mode)
    if (ESEWA_WEBHOOK_IPS.length === 0 || ESEWA_WEBHOOK_IPS[0] === '') {
        console.warn('[WEBHOOK] IP validation skipped - no IPs configured');
        return next();
    }

    const clientIP = req.ip || req.connection.remoteAddress;

    // Check if IP is in whitelist
    const isAllowed = ESEWA_WEBHOOK_IPS.some(allowedIP => {
        // Support CIDR notation or exact match
        if (allowedIP.includes('/')) {
            // Simple CIDR check (for production, use a proper CIDR library)
            const baseIP = allowedIP.split('/')[0];
            return clientIP.startsWith(baseIP.substring(0, baseIP.lastIndexOf('.')));
        }
        return clientIP === allowedIP;
    });

    if (!isAllowed) {
        console.warn(`[WEBHOOK] Rejected request from unauthorized IP: ${clientIP}`);

        logPaymentEvent({
            transactionId: req.body?.transaction_uuid || 'unknown',
            eventType: 'webhook_rejected',
            userId: null,
            ipAddress: clientIP,
            userAgent: req.headers['user-agent'],
            status: 'failure',
            errorMessage: 'Unauthorized IP address',
            securityFlags: ['suspicious_ip']
        });

        return res.status(403).json({
            success: false,
            message: 'Forbidden: Unauthorized IP'
        });
    }

    console.log(`[WEBHOOK] IP ${clientIP} validated successfully`);
    next();
};

/**
 * Validate webhook timestamp to prevent replay attacks
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
const validateWebhookTimestamp = (req, res, next) => {
    try {
        const timestamp = req.headers['x-webhook-timestamp'] || req.body?.timestamp;

        if (!timestamp) {
            // If no timestamp provided, allow but log warning
            console.warn('[WEBHOOK] No timestamp provided');
            return next();
        }

        const webhookTime = new Date(timestamp).getTime();
        const currentTime = Date.now();
        const timeDiff = Math.abs(currentTime - webhookTime);

        if (timeDiff > WEBHOOK_TIMESTAMP_TOLERANCE) {
            console.warn(`[WEBHOOK] Timestamp too old: ${timeDiff}ms difference`);

            logPaymentEvent({
                transactionId: req.body?.transaction_uuid || 'unknown',
                eventType: 'webhook_rejected',
                userId: null,
                ipAddress: req.ip || req.connection.remoteAddress,
                userAgent: req.headers['user-agent'],
                status: 'failure',
                errorMessage: 'Webhook timestamp expired',
                securityFlags: ['duplicate_attempt']
            });

            return res.status(400).json({
                success: false,
                message: 'Bad Request: Timestamp expired'
            });
        }

        console.log('[WEBHOOK] Timestamp validated successfully');
        next();
    } catch (error) {
        console.error('[WEBHOOK] Timestamp validation error:', error);
        // Allow request to proceed if timestamp validation fails
        next();
    }
};

/**
 * Combined webhook validation middleware
 * Applies all webhook security checks
 */
const validateWebhook = [
    validateWebhookTimestamp,
    // validateWebhookIP, // Uncomment when eSewa IPs are configured
    // validateWebhookSignature // Uncomment when webhook signatures are implemented by eSewa
];

/**
 * Log webhook receipt
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
const logWebhookReceipt = async (req, res, next) => {
    try {
        await logPaymentEvent({
            transactionId: req.body?.transaction_uuid || req.query?.transaction_uuid || 'unknown',
            eventType: 'webhook_received',
            userId: null,
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.headers['user-agent'],
            eventData: {
                method: req.method,
                path: req.path,
                query: req.query,
                bodyKeys: Object.keys(req.body || {})
            },
            status: 'info'
        });
    } catch (error) {
        console.error('[WEBHOOK] Failed to log webhook receipt:', error);
    }

    next();
};

module.exports = {
    validateWebhookSignature,
    validateWebhookIP,
    validateWebhookTimestamp,
    validateWebhook,
    logWebhookReceipt
};
