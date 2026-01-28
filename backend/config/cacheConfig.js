/**
 * Cache TTL (Time To Live) Configuration
 * All values in seconds
 */
const CACHE_TTL = {
    // API Responses - Short TTL for frequently updated data
    AUCTION_LISTINGS: 30,        // 30 seconds (frequently updated)
    AUCTION_DETAIL: 60,          // 1 minute
    CATEGORY_STATS: 300,         // 5 minutes (rarely changes)
    POPULAR_TAGS: 600,           // 10 minutes (rarely changes)
    USER_PROFILE: 300,           // 5 minutes
    SEARCH_RESULTS: 60,          // 1 minute

    // Session & Authentication
    SESSION: 86400,              // 24 hours
    CSRF_TOKEN: 3600,            // 1 hour

    // Rate Limiting
    RATE_LIMIT: 3600,            // 1 hour

    // Static/Reference Data
    STATIC_DATA: 86400,          // 24 hours
    CATEGORIES: 3600,            // 1 hour

    // Short-lived data
    OTP: 600,                    // 10 minutes
    EMAIL_VERIFICATION: 3600     // 1 hour
};

/**
 * Cache Key Prefixes
 * Used to organize and identify cached data
 */
const CACHE_PREFIX = {
    AUCTION: 'auction:',
    AUCTION_LIST: 'auction:list:',
    CATEGORY: 'category:',
    TAG: 'tag:',
    USER: 'user:',
    SESSION: 'sess:',
    CSRF: 'csrf:',
    RATE_LIMIT: 'ratelimit:',
    SEARCH: 'search:',
    STATS: 'stats:'
};

/**
 * Generate cache key with prefix
 * @param {string} prefix - Cache prefix from CACHE_PREFIX
 * @param {string} identifier - Unique identifier
 * @returns {string} - Complete cache key
 */
const generateCacheKey = (prefix, identifier) => {
    return `${prefix}${identifier}`;
};

/**
 * Generate cache key for paginated lists
 * @param {string} prefix - Cache prefix
 * @param {object} params - Query parameters (page, limit, filters)
 * @returns {string} - Cache key
 */
const generateListCacheKey = (prefix, params = {}) => {
    const { page = 1, limit = 10, search = '', category = '', tags = '' } = params;
    const parts = [prefix, page, limit];

    if (search) parts.push(`search:${search}`);
    if (category) parts.push(`cat:${category}`);
    if (tags) parts.push(`tags:${tags}`);

    return parts.join(':');
};

module.exports = {
    CACHE_TTL,
    CACHE_PREFIX,
    generateCacheKey,
    generateListCacheKey
};
