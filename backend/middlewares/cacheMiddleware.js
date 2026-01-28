const { getRedisClient, isRedisConnected } = require('../config/redisConfig');

/**
 * Cache Middleware Factory
 * Creates middleware to cache GET requests
 * 
 * @param {number} duration - Cache duration in seconds
 * @param {function} keyGenerator - Optional custom key generator function
 * @returns {function} Express middleware
 */
const cacheMiddleware = (duration, keyGenerator = null) => {
    return async (req, res, next) => {
        // Only cache GET requests
        if (req.method !== 'GET') {
            return next();
        }

        // Skip if Redis not available
        if (!isRedisConnected()) {
            return next();
        }

        try {
            const redis = getRedisClient();
            if (!redis) {
                return next();
            }

            // Generate cache key
            const cacheKey = keyGenerator
                ? keyGenerator(req)
                : `cache:${req.originalUrl}`;

            // Try to get cached data
            const cachedData = await redis.get(cacheKey);

            if (cachedData) {
                // Cache HIT
                if (process.env.NODE_ENV === 'development') {
                    console.log(`✅ Cache HIT: ${cacheKey}`);
                }

                // Parse and return cached data
                const data = JSON.parse(cachedData);
                return res.json(data);
            }

            // Cache MISS
            if (process.env.NODE_ENV === 'development') {
                console.log(`❌ Cache MISS: ${cacheKey}`);
            }

            // Store original json method
            const originalJson = res.json.bind(res);

            // Override json method to cache response
            res.json = function (data) {
                // Cache the response asynchronously (don't wait)
                redis.setEx(cacheKey, duration, JSON.stringify(data))
                    .then(() => {
                        if (process.env.NODE_ENV === 'development') {
                            console.log(`💾 Cached: ${cacheKey} (TTL: ${duration}s)`);
                        }
                    })
                    .catch(err => {
                        console.error('❌ Cache set error:', err.message);
                    });

                // Send response immediately
                return originalJson(data);
            };

            next();
        } catch (error) {
            console.error('❌ Cache middleware error:', error.message);
            // Continue without caching on error
            next();
        }
    };
};

/**
 * Invalidate cache by pattern
 * @param {string} pattern - Redis key pattern (supports wildcards *)
 * @returns {Promise<number>} - Number of keys deleted
 */
const invalidateCache = async (pattern) => {
    if (!isRedisConnected()) {
        return 0;
    }

    try {
        const redis = getRedisClient();
        if (!redis) {
            return 0;
        }

        // Find keys matching pattern
        const keys = await redis.keys(pattern);

        if (keys.length > 0) {
            // Delete all matching keys
            await redis.del(keys);
            console.log(`🗑️  Invalidated ${keys.length} cache keys matching: ${pattern}`);
            return keys.length;
        }

        return 0;
    } catch (error) {
        console.error('❌ Cache invalidation error:', error.message);
        return 0;
    }
};

/**
 * Invalidate specific cache key
 * @param {string} key - Exact cache key to delete
 * @returns {Promise<boolean>} - True if deleted
 */
const invalidateCacheKey = async (key) => {
    if (!isRedisConnected()) {
        return false;
    }

    try {
        const redis = getRedisClient();
        if (!redis) {
            return false;
        }

        const result = await redis.del(key);
        if (result > 0) {
            console.log(`🗑️  Invalidated cache key: ${key}`);
            return true;
        }
        return false;
    } catch (error) {
        console.error('❌ Cache key invalidation error:', error.message);
        return false;
    }
};

/**
 * Clear all cache (use with caution!)
 * @returns {Promise<boolean>}
 */
const clearAllCache = async () => {
    if (!isRedisConnected()) {
        return false;
    }

    try {
        const redis = getRedisClient();
        if (!redis) {
            return false;
        }

        await redis.flushDb();
        console.log('🗑️  All cache cleared');
        return true;
    } catch (error) {
        console.error('❌ Clear all cache error:', error.message);
        return false;
    }
};

/**
 * Get cache statistics
 * @returns {Promise<object>} - Cache stats
 */
const getCacheStats = async () => {
    if (!isRedisConnected()) {
        return { connected: false };
    }

    try {
        const redis = getRedisClient();
        if (!redis) {
            return { connected: false };
        }

        const info = await redis.info('stats');
        const dbSize = await redis.dbSize();

        return {
            connected: true,
            dbSize,
            info
        };
    } catch (error) {
        console.error('❌ Get cache stats error:', error.message);
        return { connected: false, error: error.message };
    }
};

module.exports = {
    cacheMiddleware,
    invalidateCache,
    invalidateCacheKey,
    clearAllCache,
    getCacheStats
};
