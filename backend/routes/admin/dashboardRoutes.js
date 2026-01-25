
const express = require('express');
const router = express.Router();
const { hasPermission } = require('../../middlewares/rbacMiddleware.js');
const { PERMISSIONS } = require('../../config/permissions.js');
const { getDashboardStats } = require('../../controllers/admin/dashboardController.js');

// Dashboard requires DASHBOARD_READ permission
router.get('/', hasPermission(PERMISSIONS.DASHBOARD_READ), getDashboardStats);

module.exports = router;