const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const path = require('path');

const connectDB = require('./config/db.js');
const { corsOptions, allowedOrigins } = require('./config/corsConfig.js');

// Middleware
const { protect, isAdmin } = require('./middlewares/authMiddleware.js');

// Route files
const authRoutes = require('./routes/authRoutes.js');
const userRoutes = require('./routes/userRoutes.js');
const biddingRoutes = require('./routes/biddingRoomRoutes.js');
const adminDashboardRoutes = require('./routes/admin/dashboardRoutes.js');
const adminUserRoutes = require('./routes/admin/userManagementRoutes.js');
const adminBiddingRoomRoutes = require('./routes/admin/biddingRoomManagementRoutes.js');
const paymentRoutes = require('./routes/paymentRoutes.js');
const profileRoutes = require('./routes/profileRoutes.js');
const notificationRoutes = require('./routes/notificationRoutes.js');
const mfaRoutes = require('./routes/mfaRoutes.js');
const rbacRoutes = require('./routes/rbacRoutes.js');
const sessionRoutes = require('./routes/sessionRoutes.js');
const activityRoutes = require('./routes/activityRoutes.js');
const watchlistRoutes = require('./routes/watchlistRoutes.js');

// Create Express app
const app = express();

// Trust proxy - Required for rate limiting to work behind proxies (Nginx, Cloudflare, etc.)
app.set('trust proxy', 1);

// Enhanced CORS Configuration
// Supports multiple origins, dynamic validation, preflight caching, and exposed headers
app.use(cors(corsOptions));

// Log allowed origins on startup
console.log('🔒 CORS Configuration:');
console.log('   Allowed Origins:', allowedOrigins.length > 0 ? allowedOrigins : ['No origin (requests without origin)']);
console.log('   Credentials:', corsOptions.credentials);
console.log('   Preflight Cache:', `${corsOptions.maxAge / 3600} hours`);

// Security Headers with Helmet.js
app.use(helmet({
    // Content Security Policy - Allows Socket.IO and necessary resources
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for dynamic UI
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "blob:", "http://localhost:5050"], // Allow uploaded images
            connectSrc: [
                "'self'",
                "http://localhost:5050",
                "ws://localhost:5050",
                "wss://localhost:5050"
            ], // Socket.IO connections
            fontSrc: ["'self'", "data:"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"]
        }
    },
    // Disable for Socket.IO compatibility
    crossOriginEmbedderPolicy: false,
    // HTTP Strict Transport Security - Forces HTTPS in production
    hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true
    },
    // Prevent browsers from MIME-sniffing
    noSniff: true,
    // Prevent clickjacking attacks
    frameguard: {
        action: 'sameorigin'
    },
    // Hide X-Powered-By header
    hidePoweredBy: true,
    // Control DNS prefetching
    dnsPrefetchControl: {
        allow: false
    },
    // Prevent browsers from caching HTTPS content
    ieNoOpen: true,
    // XSS Filter for older browsers
    xssFilter: true
}));

app.use(express.json());
app.use(cookieParser());

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Public Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bidding-rooms', biddingRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/mfa', mfaRoutes);
app.use('/api/rbac', rbacRoutes);
app.use('/api/session', sessionRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/watchlist', watchlistRoutes);

// Admin Routes - Protected with authentication
// RBAC permissions are applied within each route file
app.use('/api/admin/dashboard', protect, adminDashboardRoutes);
app.use('/api/admin/users', protect, adminUserRoutes);
app.use('/api/admin/bidding-rooms', protect, adminBiddingRoomRoutes);

module.exports = app;
