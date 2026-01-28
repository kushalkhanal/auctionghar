const xss = require('xss');

/**
 * Sanitize string input to prevent XSS attacks
 * @param {string} input - The input string to sanitize
 * @param {number} maxLength - Maximum allowed length
 * @returns {string} - Sanitized string
 */
const sanitizeString = (input, maxLength = 1000) => {
    if (!input) return '';
    if (typeof input !== 'string') return String(input);

    // Remove HTML tags and dangerous content
    let sanitized = xss(input, {
        whiteList: {}, // No HTML tags allowed
        stripIgnoreTag: true,
        stripIgnoreTagBody: ['script', 'style']
    });

    // Trim whitespace and limit length
    sanitized = sanitized.trim().substring(0, maxLength);

    return sanitized;
};

/**
 * Sanitize object with multiple fields based on schema
 * @param {Object} obj - Object to sanitize
 * @param {Object} schema - Schema defining field types and constraints
 * @returns {Object} - Sanitized object
 */
const sanitizeObject = (obj, schema) => {
    if (!obj || typeof obj !== 'object') return {};

    const sanitized = {};

    for (const [key, config] of Object.entries(schema)) {
        if (obj[key] !== undefined && obj[key] !== null) {
            switch (config.type) {
                case 'string':
                    sanitized[key] = sanitizeString(obj[key], config.maxLength || 1000);
                    break;

                case 'array':
                    if (Array.isArray(obj[key])) {
                        sanitized[key] = obj[key]
                            .slice(0, config.maxItems || 100)
                            .map(item => sanitizeString(item, config.itemMaxLength || 100));
                    }
                    break;

                case 'number':
                    const num = Number(obj[key]);
                    if (!isNaN(num)) {
                        sanitized[key] = num;
                    }
                    break;

                case 'boolean':
                    sanitized[key] = Boolean(obj[key]);
                    break;

                case 'date':
                    const date = new Date(obj[key]);
                    if (!isNaN(date.getTime())) {
                        sanitized[key] = date;
                    }
                    break;

                default:
                    // For unknown types, just copy the value
                    sanitized[key] = obj[key];
            }
        }
    }

    return sanitized;
};

/**
 * Sanitize MongoDB query to prevent NoSQL injection
 * Removes $ operators from user-controlled input
 * @param {Object} query - Query object to sanitize
 * @returns {Object} - Sanitized query
 */
const sanitizeMongoQuery = (query) => {
    if (typeof query !== 'object' || query === null) {
        return query;
    }

    // Handle arrays
    if (Array.isArray(query)) {
        return query.map(item => sanitizeMongoQuery(item));
    }

    const sanitized = {};

    for (const [key, value] of Object.entries(query)) {
        // Remove MongoDB operators from user input to prevent injection
        if (key.startsWith('$')) {
            console.warn(`Blocked potential NoSQL injection attempt: ${key}`);
            continue;
        }

        // Recursively sanitize nested objects
        if (typeof value === 'object' && value !== null) {
            sanitized[key] = sanitizeMongoQuery(value);
        } else {
            sanitized[key] = value;
        }
    }

    return sanitized;
};

/**
 * Sanitize search query for safe regex usage
 * @param {string} searchTerm - Search term to sanitize
 * @returns {string} - Escaped search term safe for regex
 */
const sanitizeSearchQuery = (searchTerm) => {
    if (!searchTerm || typeof searchTerm !== 'string') return '';

    // Remove XSS
    let sanitized = sanitizeString(searchTerm, 100);

    // Escape regex special characters
    sanitized = sanitized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    return sanitized;
};

/**
 * Sanitize email address
 * @param {string} email - Email to sanitize
 * @returns {string} - Sanitized and normalized email
 */
const sanitizeEmail = (email) => {
    if (!email || typeof email !== 'string') return '';

    // Convert to lowercase and trim
    let sanitized = email.toLowerCase().trim();

    // Remove any HTML/XSS attempts
    sanitized = sanitizeString(sanitized, 100);

    return sanitized;
};

module.exports = {
    sanitizeString,
    sanitizeObject,
    sanitizeMongoQuery,
    sanitizeSearchQuery,
    sanitizeEmail
};
