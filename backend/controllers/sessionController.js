const Session = require('../models/sessionModel');
const User = require('../models/userModel');
const {
    generateAccessToken,
    verifyRefreshToken,
    getCookieOptions,
    parseDeviceInfo
} = require('../utils/tokenUtils');

/**
 * Refresh access token using refresh token
 */
exports.refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.cookies;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token not found'
            });
        }

        // Verify refresh token
        let decoded;
        try {
            decoded = verifyRefreshToken(refreshToken);
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired refresh token'
            });
        }

        // Find session
        const session = await Session.findOne({
            refreshToken,
            userId: decoded.userId,
            isActive: true
        });

        if (!session) {
            return res.status(401).json({
                success: false,
                message: 'Session not found or expired'
            });
        }

        // Check if session has expired
        if (session.expiresAt < new Date()) {
            session.isActive = false;
            await session.save();
            return res.status(401).json({
                success: false,
                message: 'Session has expired. Please login again.'
            });
        }

        // Get user
        const user = await User.findById(decoded.userId).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Generate new access token
        const tokenPayload = {
            userId: user._id,
            firstName: user.firstName,
            role: user.role
        };

        const accessToken = generateAccessToken(tokenPayload);

        // Update session last activity
        await session.updateActivity();

        // Set new access token cookie
        const accessTokenExpiry = 15 * 60 * 1000; // 15 minutes
        res.cookie('accessToken', accessToken, getCookieOptions(accessTokenExpiry));

        return res.status(200).json({
            success: true,
            message: 'Token refreshed successfully',
            token: accessToken // For backward compatibility
        });

    } catch (error) {
        console.error('Refresh token error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/**
 * Logout user and invalidate session
 */
exports.logout = async (req, res) => {
    try {
        const { refreshToken } = req.cookies;

        if (refreshToken) {
            // Find and revoke session
            const session = await Session.findOne({ refreshToken });
            if (session) {
                await session.revoke();
            }
        }

        // Clear cookies
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');

        return res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });

    } catch (error) {
        console.error('Logout error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/**
 * Get all active sessions for the current user
 */
exports.getSessions = async (req, res) => {
    try {
        const userId = req.user._id;

        const sessions = await Session.find({
            userId,
            isActive: true,
            expiresAt: { $gt: new Date() }
        }).sort({ lastActivity: -1 });

        const formattedSessions = sessions.map(session => ({
            id: session._id,
            deviceInfo: session.deviceInfo,
            lastActivity: session.lastActivity,
            createdAt: session.createdAt,
            isCurrent: session.refreshToken === req.cookies.refreshToken
        }));

        return res.status(200).json({
            success: true,
            sessions: formattedSessions
        });

    } catch (error) {
        console.error('Get sessions error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/**
 * Revoke a specific session
 */
exports.revokeSession = async (req, res) => {
    try {
        const userId = req.user._id;
        const { sessionId } = req.params;

        const session = await Session.findOne({
            _id: sessionId,
            userId
        });

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }

        // Don't allow revoking current session (use logout instead)
        if (session.refreshToken === req.cookies.refreshToken) {
            return res.status(400).json({
                success: false,
                message: 'Cannot revoke current session. Use logout instead.'
            });
        }

        await session.revoke();

        return res.status(200).json({
            success: true,
            message: 'Session revoked successfully'
        });

    } catch (error) {
        console.error('Revoke session error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/**
 * Revoke all sessions except current
 */
exports.revokeAllSessions = async (req, res) => {
    try {
        const userId = req.user._id;
        const currentRefreshToken = req.cookies.refreshToken;

        await Session.updateMany(
            {
                userId,
                refreshToken: { $ne: currentRefreshToken },
                isActive: true
            },
            {
                isActive: false
            }
        );

        return res.status(200).json({
            success: true,
            message: 'All other sessions revoked successfully'
        });

    } catch (error) {
        console.error('Revoke all sessions error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
