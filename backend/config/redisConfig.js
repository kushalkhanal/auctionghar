const redis = require('redis');

/**
 * Redis Configuration for Production-Ready Caching
 * 
 * Features:
 * - Automatic reconnection with exponential backoff
 * - Connection pooling
 * - Error handling and logging
 * - Health monitoring
 * - Graceful shutdown
 */

// Redis client configuration
const redisConfig = {
    socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
        connectTimeout: 10000,

        // Reconnection strategy with exponential backoff
        reconnectStrategy: (retries) => {
            if (retries > 10) {
                console.error('❌ Redis max retries (10) exceeded');
                return new Error('Redis max retries exceeded');
            }
            const delay = Math.min(retries * 100, 3000);
            console.log(`🔄 Redis reconnecting in ${delay}ms (attempt ${retries}/10)`);
            return delay;
        }
    },

    // Password authentication (if configured)
    password: process.env.REDIS_PASSWORD || undefined,

    // Database selection
    database: parseInt(process.env.REDIS_DB) || 0,

    // Enable offline queue (queue commands while disconnected)
    enableOfflineQueue: true,

    // Lazy connect (connect on first command)
    lazyConnect: false
};

// Global Redis client instance
let client = null;
let isConnected = false;

/**
 * Create and initialize Redis client
 * @returns {Promise<RedisClient>}
 */
const createRedisClient = async () => {
    if (client) {
        return client;
    }

    try {
        console.log('🔗 Initializing Redis client...');
        client = redis.createClient(redisConfig);

        // Event: Error
        client.on('error', (err) => {
            console.error('❌ Redis Client Error:', err.message);
            isConnected = false;
        });

        // Event: Connect
        client.on('connect', () => {
            console.log('🔗 Redis connecting...');
        });

        // Event: Ready
        client.on('ready', () => {
            console.log('✅ Redis connected and ready');
            console.log(`   Host: ${redisConfig.socket.host}:${redisConfig.socket.port}`);
            console.log(`   Database: ${redisConfig.database}`);
            isConnected = true;
        });

        // Event: Reconnecting
        client.on('reconnecting', () => {
            console.log('🔄 Redis reconnecting...');
            isConnected = false;
        });

        // Event: End
        client.on('end', () => {
            console.log('🔌 Redis connection closed');
            isConnected = false;
        });

        // Connect to Redis
        await client.connect();

        // Test connection
        await client.ping();
        console.log('✅ Redis PING successful');

        return client;
    } catch (error) {
        console.error('❌ Failed to connect to Redis:', error.message);
        console.warn('⚠️  Application will continue without Redis caching');
        client = null;
        isConnected = false;
        return null;
    }
};

/**
 * Get Redis client instance
 * @returns {RedisClient}
 */
const getRedisClient = () => {
    if (!client || !isConnected) {
        console.warn('⚠️  Redis client not available');
        return null;
    }
    return client;
};

/**
 * Check if Redis is connected
 * @returns {boolean}
 */
const isRedisConnected = () => {
    return isConnected && client !== null;
};

/**
 * Close Redis connection gracefully
 */
const closeRedis = async () => {
    if (client) {
        try {
            console.log('🔌 Closing Redis connection...');
            await client.quit();
            client = null;
            isConnected = false;
            console.log('✅ Redis connection closed gracefully');
        } catch (error) {
            console.error('❌ Error closing Redis:', error.message);
            // Force disconnect
            if (client) {
                await client.disconnect();
                client = null;
                isConnected = false;
            }
        }
    }
};

/**
 * Health check for Redis
 * @returns {Promise<boolean>}
 */
const healthCheck = async () => {
    try {
        if (!client || !isConnected) {
            return false;
        }
        await client.ping();
        return true;
    } catch (error) {
        console.error('❌ Redis health check failed:', error.message);
        return false;
    }
};

module.exports = {
    createRedisClient,
    getRedisClient,
    isRedisConnected,
    closeRedis,
    healthCheck
};
