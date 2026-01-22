const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Use the existing bidding_website database
    const mongoURI = process.env.DB_URI || 'mongodb://localhost:27017/bidding_website';
    
    if (process.env.NODE_ENV !== 'test') {
        console.log("MONGO_URI =", mongoURI);
    }
    const conn = await mongoose.connect(mongoURI);
 
    if (process.env.NODE_ENV !== 'test') {
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    }
  } catch (err) {
    console.error("Connection error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;