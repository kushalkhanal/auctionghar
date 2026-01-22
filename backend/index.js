const express = require('express');
const cors = require('cors');
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

// Create Express app
const app = express();

// Core Middlewares
app.use(cors());
app.use(express.json());

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Public Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bidding-rooms', biddingRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/notifications', notificationRoutes);

// Admin Routes
app.use('/api/admin/dashboard', protect, isAdmin, adminDashboardRoutes);
app.use('/api/admin/users', protect, isAdmin, adminUserRoutes);
app.use('/api/admin/bidding-rooms', protect, isAdmin, adminBiddingRoomRoutes);

module.exports = app;
