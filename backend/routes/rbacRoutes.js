const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { hasPermission, hasRole } = require('../middlewares/rbacMiddleware');
const { PERMISSIONS } = require('../config/permissions');
const { getUserPermissions, updateUserRole } = require('../controllers/rbacController');

// Get current user's permissions
router.get('/permissions', protect, getUserPermissions);

// Update user role (admin/superadmin only)
router.put('/role', protect, hasRole('admin', 'superadmin'), updateUserRole);

module.exports = router;
