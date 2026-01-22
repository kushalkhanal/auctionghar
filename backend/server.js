// Load environment variables from .env
require('dotenv').config();

const http = require('http');
const { Server } = require("socket.io");
const path = require('path');

// Import Express app and DB config
const app = require('./index'); // Your Express app
const connectDB = require('./config/db.js');

// Connect to MongoDB
connectDB();

// Create the HTTP server
const server = http.createServer(app);

// Attach Socket.IO to the HTTP server
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "http://localhost:3000"],
        methods: ["GET", "POST"],
        credentials: true
    },
    transports: ['websocket', 'polling']
});

// Make Socket.IO instance available in routes/controllers if needed
app.set('socketio', io);

// Setup real-time communication
io.on('connection', (socket) => {
    socket.on('join_user_room', (userId) => {
        socket.join(userId);
    });

    socket.on('join_product_room', (productId) => {
        socket.join(productId);
    });

    socket.on('leave_product_room', (productId) => {
        socket.leave(productId);
    });

    socket.on('disconnect', () => {
        // Optional cleanup
    });
});

// Start server
const PORT = process.env.PORT || 5050;
server.listen(PORT, () => console.log(`Server with Socket.IO running on port ${PORT}`));
