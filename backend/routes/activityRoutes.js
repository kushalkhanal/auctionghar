const express = require('express');
const router = express.Router();

const {
    getActivityLogs,
    getUserLogs,
    getMyLogs,
    getStats,
    getFailures,
    getUserTimeline,
    cleanupLogs,
    exportLogs
} = require('../controllers/activityController');

const { protect, isAdmin } = require('../middlewares/authMiddleware');

// User routes (authenticated users can view their own logs)
router.get('/my-logs', protect, getMyLogs);

// Admin routes
router.get('/logs', protect, isAdmin, getActivityLogs);
router.get('/user/:userId', protect, isAdmin, getUserLogs);
router.get('/stats', protect, isAdmin, getStats);
router.get('/failures', protect, isAdmin, getFailures);
router.get('/timeline/:userId', protect, isAdmin, getUserTimeline);
router.delete('/cleanup', protect, isAdmin, cleanupLogs);
router.get('/export', protect, isAdmin, exportLogs);

module.exports = router;
