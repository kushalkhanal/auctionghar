const Payment = require('../models/paymentModel');
const { logPaymentEvent } = require('./auditLogger');

/**
 * Transaction Monitor for Fraud Detection
 * Implements real-time monitoring and anomaly detection
 */

// Configuration from environment variables
const MAX_VELOCITY = parseInt(process.env.PAYMENT_VELOCITY_LIMIT) || 3;
const VELOCITY_WINDOW = parseInt(process.env.PAYMENT_VELOCITY_WINDOW) || 3600000; // 1 hour in ms
const MAX_AMOUNT = parseInt(process.env.MAX_PAYMENT_AMOUNT) || 100000;
const MIN_AMOUNT = parseInt(process.env.MIN_PAYMENT_AMOUNT) || 10;
const HIGH_VALUE_THRESHOLD = parseInt(process.env.HIGH_VALUE_TRANSACTION_THRESHOLD) || 10000;

// In-memory tracking for suspicious IPs (could be moved to Redis for production)
const suspiciousIPs = new Map();
const ipAttempts = new Map();

/**
 * Check if user has exceeded transaction velocity limits
 * @param {string} userId - User ID
 * @returns {Promise<Object>} { allowed: boolean, reason: string, count: number }
 */
const checkTransactionVelocity = async (userId) => {
    try {
        const windowStart = new Date(Date.now() - VELOCITY_WINDOW);

        const recentTransactions = await Payment.countDocuments({
            userId,
            createdAt: { $gte: windowStart },
            status: { $in: ['pending', 'success'] }
        });

        if (recentTransactions >= MAX_VELOCITY) {
            return {
                allowed: false,
                reason: `Transaction velocity limit exceeded. Maximum ${MAX_VELOCITY} transactions per hour.`,
                count: recentTransactions
            };
        }

        return {
            allowed: true,
            count: recentTransactions
        };
    } catch (error) {
        console.error('Velocity check error:', error);
        // Fail open for availability, but log the error
        return { allowed: true, count: 0, error: error.message };
    }
};

/**
 * Validate transaction amount
 * @param {number} amount - Transaction amount
 * @returns {Object} { valid: boolean, reason: string }
 */
const validateAmount = (amount) => {
    if (amount < MIN_AMOUNT) {
        return {
            valid: false,
            reason: `Amount must be at least NPR ${MIN_AMOUNT}`
        };
    }

    if (amount > MAX_AMOUNT) {
        return {
            valid: false,
            reason: `Amount cannot exceed NPR ${MAX_AMOUNT}`
        };
    }

    return { valid: true };
};

/**
 * Calculate fraud score for a transaction
 * @param {Object} params - Transaction parameters
 * @returns {Promise<Object>} { score: number, flags: Array, riskLevel: string }
 */
const calculateFraudScore = async ({
    userId,
    amount,
    ipAddress,
    userAgent,
    transactionHistory = []
}) => {
    let score = 0;
    const flags = [];

    // Check 1: High value transaction
    if (amount >= HIGH_VALUE_THRESHOLD) {
        score += 30;
        flags.push('high_value_transaction');
    }

    // Check 2: Suspicious IP
    if (suspiciousIPs.has(ipAddress)) {
        score += 40;
        flags.push('suspicious_ip');
    }

    // Check 3: Rapid transaction attempts from same IP
    const ipKey = `${ipAddress}_${userId}`;
    const attempts = ipAttempts.get(ipKey) || 0;
    if (attempts > 3) {
        score += 25;
        flags.push('high_velocity_ip');
    }

    // Check 4: First transaction (higher risk)
    if (transactionHistory.length === 0) {
        score += 15;
        flags.push('first_transaction');
    }

    // Check 5: Amount significantly different from user's average
    if (transactionHistory.length > 0) {
        const avgAmount = transactionHistory.reduce((sum, t) => sum + t.amount, 0) / transactionHistory.length;
        const deviation = Math.abs(amount - avgAmount) / avgAmount;

        if (deviation > 2) { // More than 200% different
            score += 20;
            flags.push('unusual_amount');
        }
    }

    // Check 6: Multiple failed attempts recently
    const recentFailed = transactionHistory.filter(t =>
        t.status === 'failed' &&
        new Date(t.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    ).length;

    if (recentFailed > 2) {
        score += 35;
        flags.push('multiple_failed_attempts');
    }

    // Determine risk level
    let riskLevel = 'low';
    if (score >= 70) {
        riskLevel = 'high';
    } else if (score >= 40) {
        riskLevel = 'medium';
    }

    return { score, flags, riskLevel };
};

/**
 * Check for duplicate transaction attempts
 * @param {string} userId - User ID
 * @param {number} amount - Transaction amount
 * @param {number} timeWindow - Time window in milliseconds (default 5 minutes)
 * @returns {Promise<Object>} { isDuplicate: boolean, existingTransaction: Object }
 */
const checkDuplicateTransaction = async (userId, amount, timeWindow = 300000) => {
    try {
        const windowStart = new Date(Date.now() - timeWindow);

        const existingTransaction = await Payment.findOne({
            userId,
            amount,
            createdAt: { $gte: windowStart },
            status: 'pending'
        });

        return {
            isDuplicate: !!existingTransaction,
            existingTransaction
        };
    } catch (error) {
        console.error('Duplicate check error:', error);
        return { isDuplicate: false };
    }
};

/**
 * Track IP attempt for rate limiting
 * @param {string} ipAddress - IP address
 * @param {string} userId - User ID
 */
const trackIPAttempt = (ipAddress, userId) => {
    const ipKey = `${ipAddress}_${userId}`;
    const attempts = ipAttempts.get(ipKey) || 0;
    ipAttempts.set(ipKey, attempts + 1);

    // Clean up after 1 hour
    setTimeout(() => {
        ipAttempts.delete(ipKey);
    }, 3600000);
};

/**
 * Mark IP as suspicious
 * @param {string} ipAddress - IP address to flag
 * @param {string} reason - Reason for flagging
 * @param {number} duration - Duration in milliseconds (default 24 hours)
 */
const flagSuspiciousIP = (ipAddress, reason, duration = 86400000) => {
    suspiciousIPs.set(ipAddress, {
        reason,
        flaggedAt: new Date(),
        expiresAt: new Date(Date.now() + duration)
    });

    console.log(`[SECURITY] IP ${ipAddress} flagged as suspicious: ${reason}`);

    // Auto-remove after duration
    setTimeout(() => {
        suspiciousIPs.delete(ipAddress);
    }, duration);
};

/**
 * Check if IP is flagged as suspicious
 * @param {string} ipAddress - IP address
 * @returns {Object} { isSuspicious: boolean, reason: string }
 */
const checkSuspiciousIP = (ipAddress) => {
    const flagData = suspiciousIPs.get(ipAddress);

    if (!flagData) {
        return { isSuspicious: false };
    }

    // Check if flag has expired
    if (new Date() > flagData.expiresAt) {
        suspiciousIPs.delete(ipAddress);
        return { isSuspicious: false };
    }

    return {
        isSuspicious: true,
        reason: flagData.reason,
        flaggedAt: flagData.flaggedAt
    };
};

/**
 * Get user's transaction history for analysis
 * @param {string} userId - User ID
 * @param {number} limit - Number of transactions to retrieve
 * @returns {Promise<Array>} Transaction history
 */
const getUserTransactionHistory = async (userId, limit = 10) => {
    try {
        return await Payment.find({ userId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();
    } catch (error) {
        console.error('Error fetching transaction history:', error);
        return [];
    }
};

/**
 * Perform comprehensive transaction validation
 * @param {Object} params - Transaction parameters
 * @returns {Promise<Object>} Validation result
 */
const validateTransaction = async ({
    userId,
    amount,
    ipAddress,
    userAgent
}) => {
    const validationResult = {
        allowed: true,
        warnings: [],
        errors: [],
        fraudScore: 0,
        riskLevel: 'low'
    };

    // 1. Validate amount
    const amountValidation = validateAmount(amount);
    if (!amountValidation.valid) {
        validationResult.allowed = false;
        validationResult.errors.push(amountValidation.reason);
        return validationResult;
    }

    // 2. Check velocity limits
    const velocityCheck = await checkTransactionVelocity(userId);
    if (!velocityCheck.allowed) {
        validationResult.allowed = false;
        validationResult.errors.push(velocityCheck.reason);
        return validationResult;
    }

    // 3. Check for duplicates
    const duplicateCheck = await checkDuplicateTransaction(userId, amount);
    if (duplicateCheck.isDuplicate) {
        validationResult.allowed = false;
        validationResult.errors.push('Duplicate transaction detected. Please wait before retrying.');
        return validationResult;
    }

    // 4. Check suspicious IP
    const ipCheck = checkSuspiciousIP(ipAddress);
    if (ipCheck.isSuspicious) {
        validationResult.warnings.push(`IP flagged: ${ipCheck.reason}`);
        validationResult.fraudScore += 40;
    }

    // 5. Calculate fraud score
    const transactionHistory = await getUserTransactionHistory(userId);
    const fraudAnalysis = await calculateFraudScore({
        userId,
        amount,
        ipAddress,
        userAgent,
        transactionHistory
    });

    validationResult.fraudScore = fraudAnalysis.score;
    validationResult.riskLevel = fraudAnalysis.riskLevel;
    validationResult.flags = fraudAnalysis.flags;

    // Block high-risk transactions
    if (fraudAnalysis.riskLevel === 'high') {
        validationResult.allowed = false;
        validationResult.errors.push('Transaction blocked due to high fraud risk. Please contact support.');
    }

    // Track this attempt
    trackIPAttempt(ipAddress, userId);

    return validationResult;
};

/**
 * Get suspicious transactions for admin review
 * @param {number} hours - Time window in hours
 * @returns {Promise<Array>} Suspicious transactions
 */
const getSuspiciousTransactions = async (hours = 24) => {
    try {
        const since = new Date(Date.now() - hours * 60 * 60 * 1000);

        return await Payment.find({
            createdAt: { $gte: since },
            $or: [
                { fraudScore: { $gte: 40 } },
                { status: 'failed' }
            ]
        })
            .populate('userId', 'name email')
            .sort({ fraudScore: -1, createdAt: -1 })
            .limit(50)
            .lean();
    } catch (error) {
        console.error('Error fetching suspicious transactions:', error);
        return [];
    }
};

module.exports = {
    checkTransactionVelocity,
    validateAmount,
    calculateFraudScore,
    checkDuplicateTransaction,
    trackIPAttempt,
    flagSuspiciousIP,
    checkSuspiciousIP,
    getUserTransactionHistory,
    validateTransaction,
    getSuspiciousTransactions
};
