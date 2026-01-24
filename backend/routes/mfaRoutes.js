const express = require('express');
const router = express.Router();
const {
    enableMFA,
    verifyMFASetup,
    verifyMFALogin,
    disableMFA,
    regenerateBackupCodes,
    getMFAStatus
} = require('../controllers/mfaController.js');
const { protect } = require('../middlewares/authMiddleware.js');

// Protected routes (require authentication)
router.post('/enable', protect, enableMFA);
router.post('/verify-setup', protect, verifyMFASetup);
router.post('/disable', protect, disableMFA);
router.post('/backup-codes/regenerate', protect, regenerateBackupCodes);
router.get('/status', protect, getMFAStatus);

// Public route (for MFA verification during login - uses temp token)
router.post('/verify-login', verifyMFALogin);

module.exports = router;
