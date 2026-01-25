const User = require('../models/userModel');
const { getPermissionsForRole } = require('../config/permissions');

/**
 * Get user permissions
 * Useful for frontend to show/hide UI elements
 */
exports.getUserPermissions = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // Get permissions for user's role
        const permissions = getPermissionsForRole(req.user.role);

        // Add custom permissions if any
        if (req.user.customPermissions && Array.isArray(req.user.customPermissions)) {
            permissions.push(...req.user.customPermissions);
        }

        res.json({
            success: true,
            role: req.user.role,
            permissions: permissions
        });
    } catch (error) {
        console.error('Error getting user permissions:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/**
 * Update user role (admin/superadmin only)
 */
exports.updateUserRole = async (req, res) => {
    try {
        const { userId, newRole, customPermissions } = req.body;

        // Validate new role
        const validRoles = ['user', 'moderator', 'admin', 'superadmin'];
        if (!validRoles.includes(newRole)) {
            return res.status(400).json({
                success: false,
                message: `Invalid role. Must be one of: ${validRoles.join(', ')}`
            });
        }

        // Prevent non-superadmins from creating superadmins
        if (newRole === 'superadmin' && req.user.role !== 'superadmin') {
            return res.status(403).json({
                success: false,
                message: 'Only superadmins can create other superadmins'
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Prevent downgrading superadmins (unless you are superadmin)
        if (user.role === 'superadmin' && req.user.role !== 'superadmin') {
            return res.status(403).json({
                success: false,
                message: 'Cannot modify superadmin accounts'
            });
        }

        user.role = newRole;

        if (customPermissions && Array.isArray(customPermissions)) {
            user.customPermissions = customPermissions;
        }

        await user.save();

        res.json({
            success: true,
            message: `User role updated to ${newRole}`,
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                customPermissions: user.customPermissions
            }
        });
    } catch (error) {
        console.error('Error updating user role:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
