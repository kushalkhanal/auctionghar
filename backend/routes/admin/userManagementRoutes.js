const express = require('express');
const router = express.Router();
const { hasPermission } = require('../../middlewares/rbacMiddleware.js');
const { PERMISSIONS } = require('../../config/permissions.js');
const { getAllUsers, deleteUserById } = require('../../controllers/admin/userManagementController.js');

// All routes require authentication (applied in index.js)
router.get('/', hasPermission(PERMISSIONS.USERS_READ), getAllUsers);
router.delete('/:id', hasPermission(PERMISSIONS.USERS_DELETE), deleteUserById);

module.exports = router;