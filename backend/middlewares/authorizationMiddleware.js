/**
 * Authorization Middleware
 * Prevents users from accessing or modifying resources they don't own
 */

/**
 * Verify Resource Ownership
 * Ensures the authenticated user can only access their own resources
 */
const verifyResourceOwnership = (req, res, next) => {
    // Ensure user is authenticated (should be handled by protect middleware first)
    if (!req.user || !req.user.id) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    // Prevent users from tampering with userId in request body
    if (req.body.userId && req.body.userId !== req.user.id) {
        return res.status(403).json({
            success: false,
            message: 'Forbidden: Cannot modify other user profiles'
        });
    }

    // Prevent users from changing their role
    if (req.body.role) {
        return res.status(403).json({
            success: false,
            message: 'Forbidden: Cannot modify user role'
        });
    }

    // Prevent users from modifying wallet balance directly
    if (req.body.wallet !== undefined) {
        return res.status(403).json({
            success: false,
            message: 'Forbidden: Cannot modify wallet balance directly. Use wallet endpoints.'
        });
    }

    next();
};

/**
 * Verify Profile Ownership
 * For routes with :userId parameter, ensure user can only access their own profile
 */
const verifyProfileOwnership = (req, res, next) => {
    const requestedUserId = req.params.userId;
    const authenticatedUserId = req.user.id;

    // Allow if viewing own profile
    if (requestedUserId === authenticatedUserId) {
        return next();
    }

    // Allow if admin (optional - can remove if not needed)
    if (req.user.role === 'admin') {
        return next();
    }

    // Otherwise, deny access
    return res.status(403).json({
        success: false,
        message: 'Forbidden: Cannot access other user profiles'
    });
};

module.exports = {
    verifyResourceOwnership,
    verifyProfileOwnership
};
