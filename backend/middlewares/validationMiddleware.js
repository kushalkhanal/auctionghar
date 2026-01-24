const { body, validationResult } = require('express-validator');

/**
 * Validation rules for profile updates
 * Prevents XSS, validates formats, enforces length limits
 */
const validateProfileUpdate = [
    body('firstName')
        .trim()
        .notEmpty()
        .withMessage('First name is required')
        .isLength({ min: 1, max: 50 })
        .withMessage('First name must be 1-50 characters')
        .matches(/^[a-zA-Z\s'-]+$/)
        .withMessage('First name can only contain letters, spaces, hyphens, and apostrophes'),

    body('lastName')
        .trim()
        .notEmpty()
        .withMessage('Last name is required')
        .isLength({ min: 1, max: 50 })
        .withMessage('Last name must be 1-50 characters')
        .matches(/^[a-zA-Z\s'-]+$/)
        .withMessage('Last name can only contain letters, spaces, hyphens, and apostrophes'),

    body('location')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 100 })
        .withMessage('Location must be less than 100 characters')
        .matches(/^[a-zA-Z0-9\s,.-]+$/)
        .withMessage('Location contains invalid characters'),

    body('number')
        .trim()
        .matches(/^\d{10}$/)
        .withMessage('Phone number must be exactly 10 digits'),
];

/**
 * Middleware to check validation results
 * Returns 400 with error details if validation fails
 */
const checkValidation = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }

    next();
};

module.exports = {
    validateProfileUpdate,
    checkValidation
};
