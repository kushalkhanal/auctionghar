const jwt = require('jsonwebtoken');
const User = require('../models/userModel.js');
const { verifyAccessToken } = require('../utils/tokenUtils');


const protect = async (req, res, next) => {
    let token;

    // Try to get token from cookies first (preferred method)
    if (req.cookies && req.cookies.accessToken) {
        token = req.cookies.accessToken;
    }
    // Fallback to Authorization header for backward compatibility
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
        // Verify token
        const decoded = verifyAccessToken(token);

        // Get user from the token's ID and attach to the request object
        req.user = await User.findById(decoded.userId).select('-password');

        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized, user not found' });
        }

        next(); // Success! Proceed to the next middleware
    } catch (error) {
        console.error("TOKEN ERROR:", error.message);

        // Check if token expired
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                message: 'Token expired',
                tokenExpired: true
            });
        }

        return res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as an admin' });
    }
};

module.exports = { protect, isAdmin };