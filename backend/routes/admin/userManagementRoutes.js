const express = require('express');
const router = express.Router();
const { hasPermission } = require('../../middlewares/rbacMiddleware.js');
const { PERMISSIONS } = require('../../config/permissions.js');
const { getAllUsers, deleteUser, updateUser } = require('../../controllers/admin/userManagement.js');

// All routes require authentication (applied in index.js)
router.get('/', hasPermission(PERMISSIONS.USERS_READ), getAllUsers);
router.delete('/:id', hasPermission(PERMISSIONS.USERS_DELETE), deleteUser);
router.put('/:id', hasPermission(PERMISSIONS.USERS_UPDATE), updateUser);

module.exports = router;