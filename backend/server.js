// Load environment variables from .env
require('dotenv').config();

const http = require('http');
const { Server } = require("socket.io");

// Import Express app and configs
const app = require('./index'); // Your Express app
const connectDB = require('./config/db.js');
const { createRedisClient, closeRedis } = require('./config/redisConfig.js');

// Create the HTTP server
const server = http.createServer(app);

// Attach Socket.IO to the HTTP server
const io = new Server(server, {
    cors: {
        origin: [
            "http://localhost:5173",
            "http://localhost:3000",
            process.env.FRONTEND_URL,
            process.env.PRODUCTION_URL
        ].filter(Boolean),
        methods: ["GET", "POST"],
        credentials: true
    },
    transports: ['websocket', 'polling']
});

// Make Socket.IO instance available in routes/controllers
app.set('socketio', io);

// Setup real-time communication
io.on('connection', (socket) => {
    console.log('🔌 Socket.IO client connected:', socket.id);

    socket.on('join_user_room', (userId) => {
        socket.join(userId);
        console.log(`👤 User ${userId} joined their room`);
    });

    socket.on('join_product_room', (productId) => {
        socket.join(productId);
        console.log(`📦 Joined product room: ${productId}`);
    });

    socket.on('leave_product_room', (productId) => {
        socket.leave(productId);
        console.log(`📦 Left product room: ${productId}`);
    });

    socket.on('disconnect', () => {
        console.log('🔌 Socket.IO client disconnected:', socket.id);
    });
});

// Start Server
const PORT = process.env.PORT || 5050;

// Initialize database and Redis, then start server
const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectDB();

        // Connect to Redis (non-blocking - app continues if Redis fails)
        try {
            await createRedisClient();
        } catch (redisError) {
            console.warn('⚠️  Redis connection failed, continuing without cache');
            console.warn('   Error:', redisError.message);
        }

        // Start HTTP server with Socket.IO
        server.listen(PORT, () => {
            console.log(`\n🚀 Server with Socket.IO running on port ${PORT}`);
            console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`   URL: http://localhost:${PORT}\n`);
        });

        // Graceful shutdown handling
        const gracefulShutdown = async (signal) => {
            console.log(`\n${signal} received. Starting graceful shutdown...`);

            // Close Socket.IO connections
            io.close(() => {
                console.log('✅ Socket.IO closed');
            });

            // Close HTTP server
            server.close(async () => {
                console.log('✅ HTTP server closed');

                // Close Redis connection
                try {
                    await closeRedis();
                } catch (error) {
                    console.error('❌ Error closing Redis:', error.message);
                }

                // Exit process
                console.log('✅ Graceful shutdown complete');
                process.exit(0);
            });

            // Force shutdown after 10 seconds
            setTimeout(() => {
                console.error('⚠️  Forced shutdown after timeout');
                process.exit(1);
            }, 10000);
        };

        // Listen for termination signals
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

// Start the server
startServer();
