/**
 * CORS Configuration for Production-Ready Security
 * 
 * Features:
 * - Origin whitelist with environment variable support
 * - Dynamic origin validation
 * - Preflight caching (24 hours)
 * - Exposed headers for pagination and rate limiting
 * - Development mode support
 * - Request/response logging
 */

// Build allowed origins list from environment variables and defaults
const allowedOrigins = [
    // Development origins
    'http://localhost:5173',      // Vite dev server (default)
    'http://localhost:3000',      // Alternative React dev server
    'http://localhost:5050',      // Backend server
    'http://127.0.0.1:5173',      // Localhost alternative
    'http://127.0.0.1:3000',      // Localhost alternative

    // Environment-specific origins
    process.env.FRONTEND_URL,     // Configured frontend URL
    process.env.PRODUCTION_URL,   // Production frontend URL

    // Additional origins from comma-separated env variable
    ...(process.env.ALLOWED_ORIGINS?.split(',').map(origin => origin.trim()) || [])
].filter(Boolean);  // Remove undefined/null values

// Add development-specific origins
if (process.env.NODE_ENV === 'development') {
    allowedOrigins.push(
        'http://localhost:4173',  // Vite preview server
        'http://localhost:8080'   // Alternative dev port
    );
}

// CORS configuration object
const corsOptions = {
    /**
     * Dynamic origin validation function
     * Validates incoming requests against whitelist
     */
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, Postman, curl, server-to-server)
        if (!origin) {
            return callback(null, true);
        }

        // Check if origin is in whitelist
        if (allowedOrigins.indexOf(origin) !== -1) {
            // Log successful CORS validation in development
            if (process.env.NODE_ENV === 'development') {
                console.log(`✅ CORS allowed: ${origin}`);
            }
            callback(null, true);
        } else {
            // Log blocked origin
            console.warn(`❌ CORS blocked request from origin: ${origin}`);

            // In production, you might want to log this to a monitoring service
            // Example: logToMonitoring('cors_violation', { origin, timestamp: new Date() });

            callback(new Error('Not allowed by CORS policy'));
        }
    },

    /**
     * Allow credentials (cookies, authorization headers, TLS client certificates)
     * Required for session-based authentication
     */
    credentials: true,

    /**
     * Allowed HTTP methods
     * Restricts which methods can be used in cross-origin requests
     */
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    /**
     * Allowed request headers
     * Whitelist of headers that can be sent by the client
     */
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
        'X-CSRF-Token'  // For CSRF protection
    ],

    /**
     * Exposed response headers
     * Headers that the frontend JavaScript can access
     * Useful for pagination, rate limiting, etc.
     */
    exposedHeaders: [
        'X-Total-Count',          // Total number of items (pagination)
        'X-Page-Count',           // Total number of pages (pagination)
        'X-Current-Page',         // Current page number (pagination)
        'X-Rate-Limit-Limit',     // Rate limit maximum requests
        'X-Rate-Limit-Remaining', // Rate limit remaining requests
        'X-Rate-Limit-Reset',     // Rate limit reset timestamp
        'X-Response-Time'         // Server response time
    ],

    /**
     * Preflight cache duration (in seconds)
     * Browsers will cache preflight responses for this duration
     * 86400 seconds = 24 hours
     * Reduces OPTIONS requests overhead
     */
    maxAge: 86400,

    /**
     * Pass CORS preflight response to next handler
     * false = end the request after preflight
     */
    preflightContinue: false,

    /**
     * Success status code for OPTIONS requests
     * 204 = No Content (recommended for OPTIONS)
     */
    optionsSuccessStatus: 204
};

// Export CORS options and allowed origins for reference
module.exports = {
    corsOptions,
    allowedOrigins  // Export for logging/debugging purposes
};
