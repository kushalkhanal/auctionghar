// Script to drop the database and start fresh
require('dotenv').config();
const mongoose = require('mongoose');

const resetDatabase = async () => {
    try {
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(process.env.DB_URI);
        console.log('✅ Connected to MongoDB');

        // Drop the database
        console.log('🗑️  Dropping database...');
        await mongoose.connection.dropDatabase();
        console.log('✅ Database dropped successfully!');

        console.log('\n📊 Database reset complete!');
        console.log('   Database name: bidding_website');
        console.log('   Status: Empty and ready for fresh data\n');

        // Close connection
        await mongoose.connection.close();
        console.log('✅ Connection closed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error resetting database:', error.message);
        process.exit(1);
    }
};

resetDatabase();
