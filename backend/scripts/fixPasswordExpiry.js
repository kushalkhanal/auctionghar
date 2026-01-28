const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/userModel');

const fixUsers = async () => {
    try {
        await mongoose.connect(process.env.DB_URI);
        console.log('🔗 Connected to MongoDB');

        const users = await User.find({});
        console.log(`📊 Found ${users.length} users in database`);

        for (const user of users) {
            console.log(`\n👤 Checking user: ${user.email}`);
            console.log(`   Current ExpiresAt: ${user.passwordExpiresAt}`);
            console.log(`   Current ChangedAt: ${user.passwordChangedAt}`);

            // Fix expiry
            const newExpiry = new Date();
            newExpiry.setFullYear(newExpiry.getFullYear() + 1); // +1 year

            user.passwordExpiresAt = newExpiry;
            // Also ensure changedAt is valid
            if (!user.passwordChangedAt) {
                user.passwordChangedAt = new Date();
            }

            // Save without triggering pre-save validation hooks if possible, 
            // but Mongoose save() triggers them. 
            // Since we fixed the pre-save hook in the recent edit, 
            // a normal save should also calculate correctly now.
            // But let's manually set it to be sure.

            // To avoid the pre-save hook overwriting our manual set with logic that *might* still be buggy? 
            // No, we rely on the fix. But let's just use updateOne to bypass hooks.
            await User.updateOne(
                { _id: user._id },
                {
                    $set: {
                        passwordExpiresAt: newExpiry,
                        passwordChangedAt: user.passwordChangedAt
                    }
                }
            );
            console.log(`   ✅ Fixed expiry to: ${newExpiry}`);
        }

        console.log('\n✨ All users processed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

fixUsers();
