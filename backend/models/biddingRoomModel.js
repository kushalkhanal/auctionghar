const mongoose = require('mongoose');

const biddingRoomSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    startingPrice: { type: Number, required: true, default: 0 },
    currentPrice: { type: Number, required: true, default: 0 },
    imageUrls: { type: [String], required: true },
    endTime: { type: Date, required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['active', 'sold', 'expired'], default: 'active' },
    category: {
        type: String,
        required: true,
        enum: [
            'Electronics',
            'Fashion',
            'Home & Garden',
            'Sports & Outdoors',
            'Collectibles',
            'Art',
            'Jewelry',
            'Vehicles',
            'Books & Media',
            'Toys & Games',
            'Other'
        ],
        default: 'Other',
        index: true
    },
    tags: {
        type: [String],
        default: [],
        validate: {
            validator: function (tags) {
                return tags.length <= 10;
            },
            message: 'Maximum 10 tags allowed'
        }
    },
    bids: [{
        bidder: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        amount: { type: Number, required: true },
        timestamp: { type: Date, default: Date.now }
    }]
}, { timestamps: true });


// Indexes for efficient querying
biddingRoomSchema.index({ category: 1, status: 1 });
biddingRoomSchema.index({ tags: 1 });
biddingRoomSchema.index({ status: 1, createdAt: -1 });

// A pre-save hook to ensure the starting price is set as the initial current price
biddingRoomSchema.pre('save', function (next) {
    if (this.isNew) {
        this.currentPrice = this.startingPrice;
    }
    next();
});

module.exports = mongoose.model('BiddingRoom', biddingRoomSchema);