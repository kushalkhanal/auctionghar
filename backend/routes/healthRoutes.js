const express = require('express');
const router = express.Router();
const { healthCheck } = require('../config/redisConfig');
const { getCacheStats } = require('../middlewares/cacheMiddleware');

/**
 * Health check endpoint for Redis
 * GET /api/health/redis
 */
router.get('/redis', async (req, res) => {
    try {
        const isHealthy = await healthCheck();

        if (isHealthy) {
            res.json({
                status: 'healthy',
                redis: 'connected',
                timestamp: new Date().toISOString()
            });
        } else {
            res.status(503).json({
                status: 'unhealthy',
                redis: 'disconnected',
                timestamp: new Date().toISOString()
            });
        }
    } catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            redis: 'error',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * Cache statistics endpoint (admin only)
 * GET /api/health/cache-stats
 */
router.get('/cache-stats', async (req, res) => {
    try {
        const stats = await getCacheStats();
        res.json({
            success: true,
            stats,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router;
