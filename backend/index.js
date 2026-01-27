const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

const connectDB = require('./config/db.js');

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

// Create Express app
const app = express();

// Trust proxy - Required for rate limiting to work behind proxies (Nginx, Cloudflare, etc.)
app.set('trust proxy', 1);

// Core Middlewares
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true // Allow cookies to be sent
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

// Admin Routes - Protected with authentication
// RBAC permissions are applied within each route file
app.use('/api/admin/dashboard', protect, adminDashboardRoutes);
app.use('/api/admin/users', protect, adminUserRoutes);
app.use('/api/admin/bidding-rooms', protect, adminBiddingRoomRoutes);

module.exports = app;
