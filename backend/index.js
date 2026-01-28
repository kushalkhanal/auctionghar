const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const path = require('path');

const connectDB = require('./config/db.js');
const { corsOptions, allowedOrigins } = require('./config/corsConfig.js');
const { createRedisClient, closeRedis } = require('./config/redisConfig.js');

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
const healthRoutes = require('./routes/healthRoutes.js');

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
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.socket.io"],
            connectSrc: ["'self'", "ws:", "wss:"],
            imgSrc: ["'self'", "data:", "https:"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            fontSrc: ["'self'", "data:"],
        },
    },
    // HTTP Strict Transport Security
    hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true
    },
    // X-Frame-Options
    frameguard: {
        action: 'deny'
    },
    // X-Content-Type-Options
    noSniff: true,
    // X-XSS-Protection
    xssFilter: true
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
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
app.use('/api/health', healthRoutes);

// Admin Routes - Protected with authentication
// RBAC permissions are applied within each route file
app.use('/api/admin/dashboard', protect, adminDashboardRoutes);
app.use('/api/admin/users', protect, adminUserRoutes);
app.use('/api/admin/bidding-rooms', protect, adminBiddingRoomRoutes);

// Start Server
const PORT = process.env.PORT || 5050;

// Initialize database and Redis, then start server
const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectDB();

        // Connect to Redis (non-blocking - app continues if Redis fails)
        try {
            await createRedisClient();
        } catch (redisError) {
            console.warn('⚠️  Redis connection failed, continuing without cache');
            console.warn('   Error:', redisError.message);
        }

        // Start HTTP server
        const server = app.listen(PORT, () => {
            console.log(`\n🚀 Server running on port ${PORT}`);
            console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`   URL: http://localhost:${PORT}\n`);
        });

        // Graceful shutdown handling
        const gracefulShutdown = async (signal) => {
            console.log(`\n${signal} received. Starting graceful shutdown...`);

            // Close HTTP server
            server.close(async () => {
                console.log('✅ HTTP server closed');

                // Close Redis connection
                try {
                    await closeRedis();
                } catch (error) {
                    console.error('❌ Error closing Redis:', error.message);
                }

                // Exit process
                console.log('✅ Graceful shutdown complete');
                process.exit(0);
            });

            // Force shutdown after 10 seconds
            setTimeout(() => {
                console.error('⚠️  Forced shutdown after timeout');
                process.exit(1);
            }, 10000);
        };

        // Listen for termination signals
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

// Start the server
startServer();
