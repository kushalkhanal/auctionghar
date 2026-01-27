
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const Payment = require('../models/paymentModel.js');
const User = require('../models/userModel.js');
const { log } = require('console');

// Security utilities
const { encrypt, decrypt } = require('../utils/encryptionUtils');
const { logPaymentEvent } = require('../utils/auditLogger');
const { validateTransaction, flagSuspiciousIP } = require('../utils/transactionMonitor');

let transaction_uuid_from_data = 'N/A'; // For logging


// Destructure environment variables for cleaner code
const {
    ESEWA_MERCHANT_CODE,
    ESEWA_MERCHANT_SECRET,
    ESEWA_API_URL,
    ESEWA_VERIFY_URL,
    FRONTEND_URL
} = process.env;

// Environment variables loaded (credentials hidden for security)


/**
 * @desc    Initiate a payment with eSewa
 * @route   POST /api/payment/initiate
 * @access  Private
 */
exports.initiateEsewaPayment = async (req, res) => {
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    const userId = req.user._id;

    try {
        const { amount } = req.body;

        if (!amount || amount < 10) {
            await logPaymentEvent({
                transactionId: 'N/A',
                eventType: 'payment_initiated',
                userId,
                ipAddress,
                userAgent,
                status: 'failure',
                errorMessage: 'Invalid amount',
                eventData: { amount }
            });

            return res.status(400).json({ success: false, message: 'Amount must be at least NPR 10.' });
        }

        // Comprehensive transaction validation
        const validation = await validateTransaction({
            userId,
            amount,
            ipAddress,
            userAgent
        });

        if (!validation.allowed) {
            await logPaymentEvent({
                transactionId: 'N/A',
                eventType: 'payment_initiated',
                userId,
                ipAddress,
                userAgent,
                status: 'failure',
                errorMessage: validation.errors.join(', '),
                securityFlags: validation.flags || [],
                eventData: { amount, fraudScore: validation.fraudScore }
            });

            return res.status(400).json({
                success: false,
                message: validation.errors[0] || 'Transaction validation failed'
            });
        }

        const transaction_uuid = uuidv4();

        // Encrypt sensitive payment details
        const paymentDetails = {
            amount,
            userId: userId.toString(),
            initiatedAt: new Date().toISOString(),
            ipAddress,
            userAgent
        };
        const encryptedDetails = encrypt(paymentDetails);

        // Create payment record with security fields
        const newPayment = new Payment({
            userId,
            amount,
            transaction_uuid,
            status: 'pending',
            paymentType: 'wallet_load',
            ipAddress,
            userAgent,
            encryptedDetails,
            fraudScore: validation.fraudScore,
            riskLevel: validation.riskLevel,
            securityFlags: validation.flags || []
        });
        await newPayment.save();

        // Log payment initiation
        await logPaymentEvent({
            transactionId: transaction_uuid,
            eventType: 'payment_initiated',
            userId,
            ipAddress,
            userAgent,
            status: 'success',
            eventData: {
                amount,
                fraudScore: validation.fraudScore,
                riskLevel: validation.riskLevel
            }
        });

        // Generate eSewa signature
        const message = `total_amount=${amount},transaction_uuid=${transaction_uuid},product_code=${ESEWA_MERCHANT_CODE}`;
        const hmac = crypto.createHmac('sha256', ESEWA_MERCHANT_SECRET);
        hmac.update(message);
        const signature = hmac.digest('base64');

        // Prepare form data for eSewa
        const formData = {
            amount: amount.toString(),
            tax_amount: "0",
            total_amount: amount.toString(),
            transaction_uuid,
            product_code: ESEWA_MERCHANT_CODE,
            product_service_charge: "0",
            product_delivery_charge: "0",
            signed_field_names: "total_amount,transaction_uuid,product_code",
            signature,
            success_url: `${FRONTEND_URL}/payment/success`,
            failure_url: `${FRONTEND_URL}/payment/failure`,
        };

        console.log(`[PAYMENT] Initiated transaction ${transaction_uuid} for user ${userId} - Amount: NPR ${amount} - Fraud Score: ${validation.fraudScore}`);

        res.status(200).json({
            success: true,
            data: formData,
            esewaUrl: ESEWA_API_URL
        });

    } catch (error) {
        console.error("eSewa initiation error:", error);

        await logPaymentEvent({
            transactionId: 'N/A',
            eventType: 'payment_initiated',
            userId,
            ipAddress,
            userAgent,
            status: 'failure',
            errorMessage: error.message,
            errorCode: 'SERVER_ERROR'
        });

        return res.status(500).json({ success: false, message: 'Server Error during payment initiation.' });
    }
};



const processSuccessfulPayment = async (transaction_uuid, ipAddress = 'unknown', userAgent = 'unknown') => {
    console.log(`[PROCESSOR] Attempting to process transaction: ${transaction_uuid}`);

    // Find a payment that is STILL 'pending' and atomically update its status to 'success'
    const updatedPayment = await Payment.findOneAndUpdate(
        { transaction_uuid: transaction_uuid, status: 'pending' },
        { $set: { status: 'success' } },
        { new: false } // Returns the document as it was before the update
    );

    // If 'updatedPayment' is null, another process already handled this
    if (!updatedPayment) {
        console.log(`[PROCESSOR] Transaction ${transaction_uuid} was already processed. No action taken.`);

        await logPaymentEvent({
            transactionId: transaction_uuid,
            eventType: 'payment_completed',
            userId: null,
            ipAddress,
            userAgent,
            status: 'warning',
            errorMessage: 'Duplicate processing attempt',
            securityFlags: ['duplicate_attempt']
        });

        return { alreadyProcessed: true };
    }

    // This is the FIRST and ONLY time this block will run for this transaction
    console.log(`[PROCESSOR] Successfully marked transaction ${transaction_uuid} as 'success'.`);

    // Update the user's wallet
    await User.findByIdAndUpdate(updatedPayment.userId, { $inc: { wallet: updatedPayment.amount } });
    console.log(`[PROCESSOR] Successfully credited ${updatedPayment.amount} to user ${updatedPayment.userId}'s wallet.`);

    // Log successful payment completion
    await logPaymentEvent({
        transactionId: transaction_uuid,
        eventType: 'payment_completed',
        userId: updatedPayment.userId,
        ipAddress,
        userAgent,
        status: 'success',
        eventData: {
            amount: updatedPayment.amount,
            walletUpdated: true
        }
    });

    await logPaymentEvent({
        transactionId: transaction_uuid,
        eventType: 'wallet_updated',
        userId: updatedPayment.userId,
        ipAddress,
        userAgent,
        status: 'success',
        eventData: {
            amount: updatedPayment.amount,
            transactionType: 'credit'
        }
    });

    return { alreadyProcessed: false };
};



/**
 * @desc    Verify the payment status with eSewa's server.
 * @route   GET /api/payment/verify
 * @access  Public (Called by eSewa's server)
 */
exports.verifyEsewaPayment = async (req, res) => {
    const successRedirectUrl = `${FRONTEND_URL}/payment/success`;
    const failureRedirectUrl = `${FRONTEND_URL}/payment/failure`;
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    try {
        const { data } = req.query;

        if (!data) {
            await logPaymentEvent({
                transactionId: 'unknown',
                eventType: 'verification_attempt',
                userId: null,
                ipAddress,
                userAgent,
                status: 'failure',
                errorMessage: 'No data provided in verification request'
            });
            return res.redirect(failureRedirectUrl + '?error=nodata');
        }

        const decodedData = JSON.parse(Buffer.from(data, 'base64').toString('utf-8'));
        const transaction_uuid = decodedData.transaction_uuid;

        // Update verification attempts
        await Payment.findOneAndUpdate(
            { transaction_uuid },
            {
                $inc: { verificationAttempts: 1 },
                $set: { lastVerificationAttempt: new Date() }
            }
        );

        await logPaymentEvent({
            transactionId: transaction_uuid,
            eventType: 'verification_attempt',
            userId: null,
            ipAddress,
            userAgent,
            status: 'info',
            eventData: { esewaStatus: decodedData.status }
        });

        if (decodedData.status !== "COMPLETE") {
            await logPaymentEvent({
                transactionId: transaction_uuid,
                eventType: 'payment_failed',
                userId: null,
                ipAddress,
                userAgent,
                status: 'failure',
                errorMessage: `eSewa status: ${decodedData.status}`
            });

            return res.redirect(failureRedirectUrl + `?error=status_${decodedData.status}`);
        }

        // Final verification call to eSewa's server
        const verificationUrl = `${ESEWA_VERIFY_URL}?product_code=${ESEWA_MERCHANT_CODE}&total_amount=${decodedData.total_amount}&transaction_uuid=${transaction_uuid}`;
        const response = await axios.get(verificationUrl);

        await logPaymentEvent({
            transactionId: transaction_uuid,
            eventType: 'webhook_validated',
            userId: null,
            ipAddress,
            userAgent,
            status: 'success',
            eventData: { esewaVerificationStatus: response.data.status }
        });

        if (response.data.status === 'COMPLETE') {
            // Call the shared atomic processor function
            await processSuccessfulPayment(transaction_uuid, ipAddress, userAgent);
        } else {
            await logPaymentEvent({
                transactionId: transaction_uuid,
                eventType: 'payment_failed',
                userId: null,
                ipAddress,
                userAgent,
                status: 'failure',
                errorMessage: 'eSewa verification failed'
            });

            return res.redirect(failureRedirectUrl + '?error=verification_failed');
        }

        res.redirect(successRedirectUrl + `?data=${data}`);

    } catch (error) {
        console.error("Fatal error in secure eSewa verification:", error.message);

        await logPaymentEvent({
            transactionId: 'unknown',
            eventType: 'verification_attempt',
            userId: null,
            ipAddress,
            userAgent,
            status: 'failure',
            errorMessage: error.message,
            errorCode: 'SERVER_ERROR'
        });

        res.redirect(failureRedirectUrl + '?error=server_error');
    }
};


/**
 * @desc    Get user's successful transaction history
 * @route   GET /api/payment/history
 * @access  Private
 */
exports.getTransactionHistory = async (req, res) => {
    try {
        const userId = req.user._id;
        // Find only successful payments for the user's history
        const payments = await Payment.find({ userId, status: 'success' })
            .sort({ createdAt: -1 }); // Show newest first

        return res.status(200).json({ success: true, data: payments });

    } catch (error) {
        console.error("Get transaction history error:", error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};




exports.confirmFrontendPayment = async (req, res) => {
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    try {
        const { transaction_uuid } = req.body;
        if (!transaction_uuid) {
            return res.status(400).json({ success: false, message: "Transaction UUID is required." });
        }

        // Call the shared atomic processor function
        await processSuccessfulPayment(transaction_uuid, ipAddress, userAgent);

        res.status(200).json({ success: true, message: "Wallet update processed." });

    } catch (error) {
        console.error("[DEV-CONFIRM] Error confirming payment:", error);
        res.status(500).json({ success: false, message: "Server error during confirmation." });
    }
};

/**
 * @desc    Get failed payments (Admin only)
 * @route   GET /api/payment/failed
 * @access  Private/Admin
 */
exports.getFailedPayments = async (req, res) => {
    try {
        const failedPayments = await Payment.find({ status: 'failed' })
            .populate('userId', 'name email')
            .sort({ createdAt: -1 })
            .limit(100)
            .lean();

        return res.status(200).json({
            success: true,
            data: failedPayments
        });
    } catch (error) {
        console.error("Get failed payments error:", error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

/**
 * @desc    Get audit log for a specific transaction (Admin only)
 * @route   GET /api/payment/audit/:transactionId
 * @access  Private/Admin
 */
exports.getPaymentAuditLog = async (req, res) => {
    try {
        const { transactionId } = req.params;
        const { getTransactionAuditTrail } = require('../utils/auditLogger');

        const auditTrail = await getTransactionAuditTrail(transactionId);

        return res.status(200).json({
            success: true,
            data: auditTrail
        });
    } catch (error) {
        console.error("Get audit log error:", error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

/**
 * @desc    Get suspicious transactions for monitoring (Admin only)
 * @route   GET /api/payment/monitor/suspicious
 * @access  Private/Admin
 */
exports.getSuspiciousTransactions = async (req, res) => {
    try {
        const { getSuspiciousTransactions } = require('../utils/transactionMonitor');
        const hours = parseInt(req.query.hours) || 24;

        const suspiciousTransactions = await getSuspiciousTransactions(hours);

        return res.status(200).json({
            success: true,
            data: suspiciousTransactions
        });
    } catch (error) {
        console.error("Get suspicious transactions error:", error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};