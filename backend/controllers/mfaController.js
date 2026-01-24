const User = require('../models/userModel.js');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

/**
 * Enable MFA - Generate secret and QR code for authenticator app setup
 */
exports.enableMFA = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.mfaEnabled && user.mfaVerified) {
            return res.status(400).json({
                success: false,
                message: 'MFA is already enabled for this account'
            });
        }

        // Generate TOTP secret
        const secret = speakeasy.generateSecret({
            name: `AuctionGhar (${user.email})`,
            issuer: 'AuctionGhar'
        });

        // Store the secret temporarily (not verified yet)
        user.mfaSecret = secret.base32;
        user.mfaVerified = false;
        await user.save();

        // Generate QR code
        const qrCodeDataURL = await QRCode.toDataURL(secret.otpauth_url);

        res.status(200).json({
            success: true,
            message: 'MFA setup initiated. Scan the QR code with your authenticator app.',
            qrCode: qrCodeDataURL,
            secret: secret.base32, // Manual entry key
            otpAuthUrl: secret.otpauth_url
        });

    } catch (error) {
        console.error('Enable MFA error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while enabling MFA'
        });
    }
};

/**
 * Verify MFA Setup - Confirm TOTP token and complete enrollment
 */
exports.verifyMFASetup = async (req, res) => {
    try {
        const { token } = req.body;
        const userId = req.user.id;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Verification token is required'
            });
        }

        const user = await User.findById(userId).select('+mfaSecret');

        if (!user || !user.mfaSecret) {
            return res.status(400).json({
                success: false,
                message: 'MFA setup not initiated. Please enable MFA first.'
            });
        }

        // Verify the TOTP token
        const verified = speakeasy.totp.verify({
            secret: user.mfaSecret,
            encoding: 'base32',
            token: token,
            window: 2 // Allow 2 time steps before/after for clock skew
        });

        if (!verified) {
            return res.status(400).json({
                success: false,
                message: 'Invalid verification code. Please try again.'
            });
        }

        // Generate backup codes (10 codes)
        const backupCodes = [];
        const hashedBackupCodes = [];

        for (let i = 0; i < 10; i++) {
            const code = crypto.randomBytes(4).toString('hex').toUpperCase(); // 8-character hex
            backupCodes.push(code);
            const hashedCode = await bcrypt.hash(code, 10);
            hashedBackupCodes.push({
                code: hashedCode,
                used: false
            });
        }

        // Enable MFA
        user.mfaEnabled = true;
        user.mfaVerified = true;
        user.backupCodes = hashedBackupCodes;
        user.mfaEnabledAt = new Date();
        await user.save();

        res.status(200).json({
            success: true,
            message: 'MFA enabled successfully. Save your backup codes in a secure location.',
            backupCodes: backupCodes // Only shown once!
        });

    } catch (error) {
        console.error('Verify MFA setup error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while verifying MFA setup'
        });
    }
};

/**
 * Verify MFA Login - Verify TOTP token or backup code during login
 */
exports.verifyMFALogin = async (req, res) => {
    try {
        const { token, isBackupCode } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Verification code is required'
            });
        }

        // Extract userId from temporary token
        const tempToken = req.headers.authorization?.split(' ')[1];
        if (!tempToken) {
            return res.status(401).json({
                success: false,
                message: 'Temporary token is required'
            });
        }

        let decoded;
        try {
            decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired temporary token'
            });
        }

        if (!decoded.mfaPending) {
            return res.status(400).json({
                success: false,
                message: 'Invalid token type'
            });
        }

        const user = await User.findById(decoded.userId).select('+mfaSecret');

        if (!user || !user.mfaEnabled) {
            return res.status(400).json({
                success: false,
                message: 'MFA is not enabled for this account'
            });
        }

        let verified = false;

        if (isBackupCode) {
            // Verify backup code
            for (let i = 0; i < user.backupCodes.length; i++) {
                const backupCode = user.backupCodes[i];
                if (!backupCode.used) {
                    const isMatch = await bcrypt.compare(token.toUpperCase(), backupCode.code);
                    if (isMatch) {
                        // Mark backup code as used
                        user.backupCodes[i].used = true;
                        user.backupCodes[i].usedAt = new Date();
                        await user.save();
                        verified = true;
                        break;
                    }
                }
            }
        } else {
            // Verify TOTP token
            verified = speakeasy.totp.verify({
                secret: user.mfaSecret,
                encoding: 'base32',
                token: token,
                window: 2
            });
        }

        if (!verified) {
            return res.status(401).json({
                success: false,
                message: 'Invalid verification code'
            });
        }

        // Issue full JWT token
        const fullToken = jwt.sign(
            {
                userId: user._id,
                firstName: user.firstName,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({
            success: true,
            message: 'MFA verification successful',
            token: fullToken,
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                number: user.number,
                role: user.role,
                wallet: user.wallet
            }
        });

    } catch (error) {
        console.error('Verify MFA login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while verifying MFA'
        });
    }
};

/**
 * Disable MFA - Turn off MFA for user account
 */
exports.disableMFA = async (req, res) => {
    try {
        const { password } = req.body;
        const userId = req.user.id;

        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'Password is required to disable MFA'
            });
        }

        const user = await User.findById(userId).select('+mfaSecret');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Incorrect password'
            });
        }

        if (!user.mfaEnabled) {
            return res.status(400).json({
                success: false,
                message: 'MFA is not enabled for this account'
            });
        }

        // Disable MFA
        user.mfaEnabled = false;
        user.mfaVerified = false;
        user.mfaSecret = undefined;
        user.backupCodes = [];
        user.mfaEnabledAt = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'MFA disabled successfully'
        });

    } catch (error) {
        console.error('Disable MFA error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while disabling MFA'
        });
    }
};

/**
 * Regenerate Backup Codes - Generate new set of backup codes
 */
exports.regenerateBackupCodes = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (!user.mfaEnabled || !user.mfaVerified) {
            return res.status(400).json({
                success: false,
                message: 'MFA is not enabled for this account'
            });
        }

        // Generate new backup codes
        const backupCodes = [];
        const hashedBackupCodes = [];

        for (let i = 0; i < 10; i++) {
            const code = crypto.randomBytes(4).toString('hex').toUpperCase();
            backupCodes.push(code);
            const hashedCode = await bcrypt.hash(code, 10);
            hashedBackupCodes.push({
                code: hashedCode,
                used: false
            });
        }

        // Replace old backup codes
        user.backupCodes = hashedBackupCodes;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Backup codes regenerated successfully. Save them in a secure location.',
            backupCodes: backupCodes
        });

    } catch (error) {
        console.error('Regenerate backup codes error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while regenerating backup codes'
        });
    }
};

/**
 * Get MFA Status - Check if MFA is enabled for the user
 */
exports.getMFAStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            mfaEnabled: user.mfaEnabled,
            mfaVerified: user.mfaVerified,
            mfaEnabledAt: user.mfaEnabledAt,
            backupCodesCount: user.backupCodes?.filter(bc => !bc.used).length || 0
        });

    } catch (error) {
        console.error('Get MFA status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching MFA status'
        });
    }
};
