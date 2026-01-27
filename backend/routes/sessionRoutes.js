const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
    refreshToken,
    logout,
    getSessions,
    revokeSession,
    revokeAllSessions
} = require('../controllers/sessionController');

// Refresh access token
router.post('/refresh', refreshToken);

// Logout
router.post('/logout', logout);

// Session management (requires authentication)
router.get('/sessions', protect, getSessions);
router.delete('/sessions/:sessionId', protect, revokeSession);
router.delete('/sessions', protect, revokeAllSessions);

module.exports = router;
