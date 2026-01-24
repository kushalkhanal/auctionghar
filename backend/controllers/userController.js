const User = require("../models/userModel.js");
const BiddingRoom = require('../models/biddingRoomModel.js');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendPasswordResetOTP } = require('../services/emailService');
const otpGenerator = require('otp-generator');
const { validatePassword, getPasswordErrorMessage, validatePasswordReuse } = require('../utils/passwordValidator');
const { isPasswordExpired, getDaysUntilExpiration, shouldWarnExpiration, updatePasswordExpiry } = require('../utils/passwordExpiry');
const { PASSWORD_HISTORY_LIMIT } = require('../config/passwordConfig');


exports.registerUser = async (req, res) => {
    console.log(req.body);
    const { email, firstName, lastName, password, number } = req.body;

    if (!email || !firstName || !lastName || !password || !number) {
        return res.status(400).json({
            success: false,
            message: "Please fill all the fields"
        });
    }

    try {
        // Validate password strength
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: getPasswordErrorMessage(passwordValidation),
                requirements: passwordValidation.requirements
            });
        }

        // Check for existing email or number
        const existingUser = await User.findOne({
            $or: [{ email }, { number }]
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "An account with this email or phone number already exists."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            email,
            firstName,
            lastName,
            password: hashedPassword,
            number,
            passwordChangedAt: new Date(),
            passwordHistory: [] // Start with empty history
        });

        await newUser.save();

        return res.status(201).json({
            success: true,
            message: "User registered successfully"
        });

    } catch (e) {
        console.error("Error in registerUser:", e);
        // Provide a more specific error message if it's a validation error
        if (e.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: e.message });
        }
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


exports.loginUser = async (req, res) => {
    console.log(req.body);

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            "success": false,
            "message": "Email and password are required"
        });
    }

    try {
        const user = await User.findOne({ email: email });

        if (!user) {
            return res.status(404).json({
                "success": false,
                "message": "User not found"
            });
        }

        // Check if account is locked due to too many failed attempts
        if (user.lockoutUntil && user.lockoutUntil > new Date()) {
            const minutesRemaining = Math.ceil((user.lockoutUntil - new Date()) / 60000);
            return res.status(403).json({
                success: false,
                message: `Account is temporarily locked due to too many failed login attempts. Try again in ${minutesRemaining} minute${minutesRemaining !== 1 ? 's' : ''}.`,
                accountLocked: true,
                lockoutUntil: user.lockoutUntil
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            // Increment failed login attempts
            user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
            user.lastFailedLogin = new Date();

            // Lock account after 5 failed attempts
            const MAX_FAILED_ATTEMPTS = 5;
            const LOCKOUT_DURATION_MINUTES = 30;

            if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
                user.lockoutUntil = new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000);
                await user.save();

                return res.status(403).json({
                    success: false,
                    message: `Account locked due to too many failed login attempts. Try again in ${LOCKOUT_DURATION_MINUTES} minutes.`,
                    accountLocked: true,
                    lockoutUntil: user.lockoutUntil
                });
            }

            await user.save();

            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
                attemptsRemaining: MAX_FAILED_ATTEMPTS - user.failedLoginAttempts
            });
        }

        // Check if password has expired
        if (isPasswordExpired(user)) {
            return res.status(403).json({
                success: false,
                message: "Password has expired. Please reset your password.",
                passwordExpired: true
            });
        }

        // Password is correct - reset failed login attempts
        user.failedLoginAttempts = 0;
        user.lockoutUntil = null;
        user.lastFailedLogin = null;
        await user.save();

        // Check if MFA is enabled
        if (user.mfaEnabled && user.mfaVerified) {
            // Issue temporary token for MFA verification step
            const tempToken = jwt.sign(
                {
                    userId: user._id,
                    mfaPending: true
                },
                process.env.JWT_SECRET,
                { expiresIn: '10m' } // Short expiration for temp token
            );

            return res.status(200).json({
                success: true,
                mfaRequired: true,
                tempToken,
                message: 'Please provide your MFA verification code'
            });
        }

        // 5. The JWT payload no longer contains 'username'
        const token = jwt.sign(
            {
                userId: user._id,
                firstName: user.firstName, // Use firstName for display purposes
                role: user.role
            },
            process.env.JWT_SECRET, { expiresIn: "7d" }
        );

        // Prepare response with expiry warning if needed
        const response = {
            success: true,
            token,
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                number: user.number,
                role: user.role,
                wallet: user.wallet
            },
        };

        // Add password expiry warning if approaching expiration
        if (shouldWarnExpiration(user)) {
            const daysRemaining = getDaysUntilExpiration(user);
            response.passwordExpiryWarning = {
                daysRemaining,
                message: `Your password expires in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}. Please update soon.`
            };
        }

        return res.status(200).json(response);

    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};


exports.getMyBidHistory = async (req, res) => {
    console.log(req.body);

    try {
        const userId = req.user.id;
        const roomsBiddedOn = await BiddingRoom.find({ 'bids.bidder': userId })
            .populate('seller', 'firstName lastName')
            .sort({ updatedAt: -1 });

        const now = new Date();
        const bidHistory = { winning: [], activeOrOutbid: [] };

        for (const room of roomsBiddedOn) {
            if (room.bids && room.bids.length > 0) {
                const userBidsOnThisRoom = room.bids.filter(bid => bid.bidder && bid.bidder.toString() === userId);
                if (userBidsOnThisRoom.length > 0) {
                    const userHighestBid = userBidsOnThisRoom.reduce((max, bid) => (bid.amount > max.amount ? bid : max));
                    const isAuctionOver = now > new Date(room.endTime);
                    const isUserTheWinner = room.currentPrice === userHighestBid.amount;
                    if (isAuctionOver && isUserTheWinner) {
                        bidHistory.winning.push(room);
                    } else {
                        bidHistory.activeOrOutbid.push(room);
                    }
                }
            }
        }
        res.status(200).json(bidHistory);
    } catch (error) {
        console.error("Error fetching bid history:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    try {
        const user = await User.findOne({ email });

        // To prevent email enumeration, always return a generic success message.
        if (!user) {
            return res.status(200).json({ success: true, message: 'If an account with that email exists, an OTP has been sent.' });
        }

        // Generate a 6-digit OTP
        const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });

        // Set OTP and expiration on the user document (e.g., 10 minutes)
        user.passwordResetOTP = otp;
        user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes in ms
        await user.save();

        // Send the OTP via email
        await sendPasswordResetOTP(user.email, otp);

        res.status(200).json({ success: true, message: 'If an account with that email exists, an OTP has been sent.' });

    } catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).json({ success: false, message: 'Server error while processing request.' });
    }
};

exports.resetPassword = async (req, res) => {
    const { otp, email, newPassword } = req.body;

    if (!otp || !email || !newPassword) {
        return res.status(400).json({ success: false, message: 'Please provide OTP, email, and a new password.' });
    }

    try {
        // Validate new password strength
        const passwordValidation = validatePassword(newPassword);
        if (!passwordValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: getPasswordErrorMessage(passwordValidation),
                requirements: passwordValidation.requirements
            });
        }

        // Find the user by email, ensuring the OTP is correct and not expired
        const user = await User.findOne({
            email: email,
            passwordResetOTP: otp,
            passwordResetExpires: { $gt: Date.now() } // Check if the expiration is in the future
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'OTP is invalid or has expired. Please try again.' });
        }

        // Validate password reuse
        const reuseValidation = await validatePasswordReuse(newPassword, user.passwordHistory);
        if (!reuseValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: reuseValidation.message
            });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Add current password to history before updating
        if (!user.passwordHistory) {
            user.passwordHistory = [];
        }
        user.passwordHistory.push({
            hash: user.password,
            changedAt: user.passwordChangedAt || new Date()
        });

        // Keep only last PASSWORD_HISTORY_LIMIT entries
        if (user.passwordHistory.length > PASSWORD_HISTORY_LIMIT) {
            user.passwordHistory = user.passwordHistory.slice(-PASSWORD_HISTORY_LIMIT);
        }

        user.password = hashedPassword;
        updatePasswordExpiry(user);

        // Clear the OTP fields to prevent reuse
        user.passwordResetOTP = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        res.status(200).json({ success: true, message: 'Password has been reset successfully.' });

    } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({ success: false, message: 'Server error while resetting password.' });
    }
};





exports.getMe = async (req, res) => {
    try {
        // The 'protect' middleware has already found the user and attached it to req.user.
        // Since req.user is already the user object from the database, we can return it directly.
        // We just need to ensure we don't send the password.
        const user = req.user;

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        const response = {
            success: true,
            user: user
        };

        // Add password expiry warning if approaching expiration
        if (shouldWarnExpiration(user)) {
            const daysRemaining = getDaysUntilExpiration(user);
            response.passwordExpiryWarning = {
                daysRemaining,
                message: `Your password expires in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}. Please update soon.`
            };
        }

        res.status(200).json(response);

    } catch (error) {
        console.error("Error in getMe controller:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};


/**
 * Change Password for Authenticated Users
 * Allows users to change their password while logged in
 */
exports.changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({
            success: false,
            message: 'Please provide both current and new password.'
        });
    }

    try {
        // Find user with password field
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect.'
            });
        }

        // Validate new password strength
        const passwordValidation = validatePassword(newPassword);
        if (!passwordValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: getPasswordErrorMessage(passwordValidation),
                requirements: passwordValidation.requirements
            });
        }

        // Validate password reuse
        const reuseValidation = await validatePasswordReuse(newPassword, user.passwordHistory);
        if (!reuseValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: reuseValidation.message
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Add current password to history
        if (!user.passwordHistory) {
            user.passwordHistory = [];
        }
        user.passwordHistory.push({
            hash: user.password,
            changedAt: user.passwordChangedAt || new Date()
        });

        // Keep only last PASSWORD_HISTORY_LIMIT entries
        if (user.passwordHistory.length > PASSWORD_HISTORY_LIMIT) {
            user.passwordHistory = user.passwordHistory.slice(-PASSWORD_HISTORY_LIMIT);
        }

        // Update password and expiry
        user.password = hashedPassword;
        updatePasswordExpiry(user);
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password changed successfully.'
        });

    } catch (error) {
        console.error("Change password error:", error);
        res.status(500).json({ success: false, message: 'Server error while changing password.' });
    }
};
