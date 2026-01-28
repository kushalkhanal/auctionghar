const { body, param, query, validationResult } = require('express-validator');

/**
 * Validation rules for user registration
 */
const validateRegister = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail()
        .isLength({ max: 100 }).withMessage('Email must be less than 100 characters'),

    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 8, max: 128 }).withMessage('Password must be 8-128 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
        .withMessage('Password must contain uppercase, lowercase, number, and special character (@$!%*?&)'),

    body('firstName')
        .trim()
        .notEmpty().withMessage('First name is required')
        .isLength({ min: 1, max: 50 }).withMessage('First name must be 1-50 characters')
        .matches(/^[a-zA-Z\s'-]+$/).withMessage('First name can only contain letters, spaces, hyphens, and apostrophes'),

    body('lastName')
        .trim()
        .notEmpty().withMessage('Last name is required')
        .isLength({ min: 1, max: 50 }).withMessage('Last name must be 1-50 characters')
        .matches(/^[a-zA-Z\s'-]+$/).withMessage('Last name can only contain letters, spaces, hyphens, and apostrophes'),

    body('number')
        .trim()
        .notEmpty().withMessage('Phone number is required')
        .matches(/^\d{10}$/).withMessage('Phone number must be exactly 10 digits')
];

/**
 * Validation rules for user login
 */
const validateLogin = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 8, max: 128 }).withMessage('Invalid password length')
];

/**
 * Validation rules for profile updates
 */
const validateProfileUpdate = [
    body('firstName')
        .trim()
        .notEmpty().withMessage('First name is required')
        .isLength({ min: 1, max: 50 }).withMessage('First name must be 1-50 characters')
        .matches(/^[a-zA-Z\s'-]+$/).withMessage('First name can only contain letters, spaces, hyphens, and apostrophes'),

    body('lastName')
        .trim()
        .notEmpty().withMessage('Last name is required')
        .isLength({ min: 1, max: 50 }).withMessage('Last name must be 1-50 characters')
        .matches(/^[a-zA-Z\s'-]+$/).withMessage('Last name can only contain letters, spaces, hyphens, and apostrophes'),

    body('location')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 100 }).withMessage('Location must be less than 100 characters')
        .matches(/^[a-zA-Z0-9\s,.-]+$/).withMessage('Location contains invalid characters'),

    body('number')
        .trim()
        .matches(/^\d{10}$/).withMessage('Phone number must be exactly 10 digits'),
];

/**
 * Validation rules for auction creation
 */
const validateAuctionCreate = [
    body('name')
        .trim()
        .notEmpty().withMessage('Auction name is required')
        .isLength({ min: 3, max: 100 }).withMessage('Name must be 3-100 characters')
        .matches(/^[a-zA-Z0-9\s\-.,!?()&'"@#]+$/).withMessage('Name contains invalid characters'),

    body('description')
        .trim()
        .notEmpty().withMessage('Description is required')
        .isLength({ min: 10, max: 2000 }).withMessage('Description must be 10-2000 characters'),

    body('startingPrice')
        .notEmpty().withMessage('Starting price is required')
        .isFloat({ min: 0, max: 10000000 }).withMessage('Starting price must be between 0 and 10,000,000')
        .toFloat(),

    body('category')
        .notEmpty().withMessage('Category is required')
        .isIn(['Electronics', 'Fashion', 'Home & Garden', 'Sports & Outdoors',
            'Collectibles', 'Art', 'Jewelry', 'Vehicles', 'Books & Media',
            'Toys & Games', 'Other'])
        .withMessage('Invalid category'),

    body('tags')
        .optional()
        .isArray({ max: 10 }).withMessage('Maximum 10 tags allowed'),

    body('tags.*')
        .if(body('tags').exists())
        .trim()
        .isLength({ min: 1, max: 20 }).withMessage('Each tag must be 1-20 characters')
        .matches(/^[a-zA-Z0-9\s-]+$/).withMessage('Tags can only contain letters, numbers, spaces, and hyphens'),

    body('endTime')
        .notEmpty().withMessage('End time is required')
        .isISO8601().withMessage('Invalid date format')
        .toDate()
        .custom((value) => {
            const endDate = new Date(value);
            const now = new Date();
            const maxDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days

            if (endDate <= now) {
                throw new Error('End time must be in the future');
            }
            if (endDate > maxDate) {
                throw new Error('End time cannot be more than 90 days in the future');
            }
            return true;
        })
];

/**
 * Validation rules for auction updates
 */
const validateAuctionUpdate = [
    param('id')
        .isMongoId().withMessage('Invalid auction ID'),

    body('name')
        .optional()
        .trim()
        .isLength({ min: 3, max: 100 }).withMessage('Name must be 3-100 characters')
        .matches(/^[a-zA-Z0-9\s\-.,!?()&]+$/).withMessage('Name contains invalid characters'),

    body('description')
        .optional()
        .trim()
        .isLength({ min: 10, max: 2000 }).withMessage('Description must be 10-2000 characters'),

    body('category')
        .optional()
        .isIn(['Electronics', 'Fashion', 'Home & Garden', 'Sports & Outdoors',
            'Collectibles', 'Art', 'Jewelry', 'Vehicles', 'Books & Media',
            'Toys & Games', 'Other'])
        .withMessage('Invalid category'),

    body('tags')
        .optional()
        .isArray({ max: 10 }).withMessage('Maximum 10 tags allowed'),

    body('tags.*')
        .if(body('tags').exists())
        .trim()
        .isLength({ min: 1, max: 20 }).withMessage('Each tag must be 1-20 characters')
        .matches(/^[a-zA-Z0-9\s-]+$/).withMessage('Tags can only contain letters, numbers, spaces, and hyphens')
];

/**
 * Validation rules for bid placement
 */
const validateBid = [
    param('id')
        .isMongoId().withMessage('Invalid auction ID'),

    body('amount')
        .notEmpty().withMessage('Bid amount is required')
        .isFloat({ min: 0, max: 10000000 }).withMessage('Bid amount must be between 0 and 10,000,000')
        .toFloat()
];

/**
 * Validation rules for search queries
 */
const validateSearch = [
    query('search')
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage('Search query too long')
        .matches(/^[a-zA-Z0-9\s\-.,]+$/).withMessage('Search contains invalid characters'),

    query('category')
        .optional()
        .isIn(['Electronics', 'Fashion', 'Home & Garden', 'Sports & Outdoors',
            'Collectibles', 'Art', 'Jewelry', 'Vehicles', 'Books & Media',
            'Toys & Games', 'Other'])
        .withMessage('Invalid category'),

    query('tags')
        .optional()
        .trim()
        .isLength({ max: 50 }).withMessage('Tag filter too long'),

    query('page')
        .optional()
        .isInt({ min: 1, max: 1000 }).withMessage('Invalid page number')
        .toInt(),

    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
        .toInt()
];

/**
 * Validation rules for watchlist operations
 */
const validateWatchlistAdd = [
    body('auctionId')
        .notEmpty().withMessage('Auction ID is required')
        .isMongoId().withMessage('Invalid auction ID')
];

/**
 * Validation rules for MongoDB ID parameters
 */
const validateMongoId = [
    param('id')
        .isMongoId().withMessage('Invalid ID format')
];

/**
 * Validation rules for password reset request
 */
const validatePasswordResetRequest = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail()
];

/**
 * Validation rules for password reset
 */
const validatePasswordReset = [
    body('otp')
        .trim()
        .notEmpty().withMessage('OTP is required')
        .isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
        .isNumeric().withMessage('OTP must be numeric'),

    body('newPassword')
        .notEmpty().withMessage('New password is required')
        .isLength({ min: 8, max: 128 }).withMessage('Password must be 8-128 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
        .withMessage('Password must contain uppercase, lowercase, number, and special character')
];

/**
 * Middleware to check validation results
 * Returns 400 with error details if validation fails
 */
const checkValidation = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        console.log("VALIDATION ERRORS:", JSON.stringify(errors.array(), null, 2));
        console.log("REQ BODY:", req.body);
        return res.status(400).json({
            success: false,
            message: errors.array()[0].msg, // Return the first error message directly
            errors: errors.array().map(err => ({
                field: err.path || err.param,
                message: err.msg,
                value: err.value
            }))
        });
    }

    next();
};

module.exports = {
    validateRegister,
    validateLogin,
    validateProfileUpdate,
    validateAuctionCreate,
    validateAuctionUpdate,
    validateBid,
    validateSearch,
    validateWatchlistAdd,
    validateMongoId,
    validatePasswordResetRequest,
    validatePasswordReset,
    checkValidation
};
