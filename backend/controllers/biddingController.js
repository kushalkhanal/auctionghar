const BiddingRoom = require('../models/biddingRoomModel.js');
const { createAndEmitNewBidNotification } = require('../services/notificationService.js');
const Notification = require('../models/notificationModel.js');
const { logActivity } = require('../utils/activityLogger');
const { sanitizeObject, sanitizeSearchQuery } = require('../utils/sanitizer');
const { invalidateCache } = require('../middlewares/cacheMiddleware.js');
const { CACHE_PREFIX } = require('../config/cacheConfig.js');

// --- PUBLIC: GET ALL BIDDING ROOMS (with Search and Pagination) ---
exports.getAllPublicBiddingRooms = async (req, res) => {
    try {
        // 1. Get page, limit, and search term from query parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 8;
        const skip = (page - 1) * limit;

        // 2. Build the filter object based on query parameters
        let searchQuery = {};
        // Sanitize search query to prevent XSS and injection
        if (req.query.search) {
            const sanitizedSearch = sanitizeSearchQuery(req.query.search);
            searchQuery.$or = [
                { name: { $regex: sanitizedSearch, $options: 'i' } },
                { description: { $regex: sanitizedSearch, $options: 'i' } },
                { tags: { $regex: sanitizedSearch, $options: 'i' } }
            ];
        }

        // Category filter
        const categoryFilter = req.query.category && req.query.category !== 'all'
            ? { category: req.query.category }
            : {};

        // Tags filter (match any of the provided tags)
        const tagsFilter = req.query.tags
            ? { tags: { $in: req.query.tags.split(',').map(t => t.trim()) } }
            : {};

        // Calculate the cutoff time (12 hours ago from now)
        // This ensures ended auctions are only visible for 12 hours after ending
        const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);

        // Combine all filters
        const filter = {
            ...searchQuery,
            ...categoryFilter,
            ...tagsFilter,
            status: 'active',
            $or: [
                { endTime: { $gt: new Date() } }, // Not ended yet (still active)
                {
                    $and: [
                        { endTime: { $lte: new Date() } }, // Has ended
                        { endTime: { $gte: twelveHoursAgo } } // But ended less than 12 hours ago
                    ]
                }
            ]
        };

        // 3. Get the total count of documents that match the filter for pagination
        const totalProducts = await BiddingRoom.countDocuments(filter);

        // 4. Fetch only the specific page of products that match the filter
        const rooms = await BiddingRoom.find(filter)
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skip)
            .populate('seller', 'firstName lastName');

        // 5. Send the response with products and pagination data
        res.status(200).json({
            products: rooms,
            page: page,
            totalPages: Math.ceil(totalProducts / limit),
        });

    } catch (error) {
        console.error("Error fetching public products:", error);
        res.status(500).json({ message: "Server Error" });
    }
};


// --- PUBLIC: GET A SINGLE BIDDING ROOM ---
exports.getBiddingRoomById = async (req, res) => {
    try {
        const room = await BiddingRoom.findById(req.params.id)
            .populate('seller', 'firstName lastName')
            .populate('bids.bidder', 'firstName lastName');
        if (!room) return res.status(404).json({ message: "Bidding room not found" });
        res.status(200).json(room);
    } catch (error) { res.status(500).json({ message: "Server Error" }) }
};


// --- USER-LEVEL: CREATE A NEW BIDDING ROOM ---
exports.createBiddingRoom = async (req, res) => {
    try {
        // Sanitize all user inputs to prevent XSS attacks
        const sanitizedData = sanitizeObject(req.body, {
            name: { type: 'string', maxLength: 100 },
            description: { type: 'string', maxLength: 2000 },
            startingPrice: { type: 'number' },
            category: { type: 'string', maxLength: 50 },
            tags: { type: 'array', maxItems: 10, itemMaxLength: 20 },
            endTime: { type: 'date' }
        });

        // Create new bidding room with sanitized data
        const newRoom = new BiddingRoom({
            name: sanitizedData.name,
            description: sanitizedData.description,
            startingPrice: sanitizedData.startingPrice,
            currentPrice: sanitizedData.startingPrice,
            endTime: sanitizedData.endTime,
            category: sanitizedData.category || 'Other',
            tags: sanitizedData.tags || [],
            seller: req.user.id,
            imageUrls: req.files ? req.files.map(file => `/${file.path.replace(/\\/g, "/")}`) : []
        });

        const createdRoom = await newRoom.save();
        await createdRoom.populate('seller', 'firstName lastName');

        // Log activity
        await logActivity({
            userId: req.user.id,
            action: 'auction_created',
            category: 'auction',
            metadata: { auctionName: sanitizedData.name, startingPrice: sanitizedData.startingPrice, endTime: sanitizedData.endTime },
            ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
            userAgent: req.headers['user-agent'],
            status: 'success',
            resourceId: createdRoom._id.toString(),
            resourceType: 'auction'
        });

        // Invalidate related caches (new auction affects listings, categories, tags)
        await invalidateCache(`${CACHE_PREFIX.AUCTION_LIST}*`);
        await invalidateCache(`${CACHE_PREFIX.CATEGORY}*`);
        await invalidateCache(`${CACHE_PREFIX.TAG}*`);
        await invalidateCache(`cache:/api/bidding-rooms*`);

        res.status(201).json({
            success: true,
            message: "Bidding room created successfully!",
            room: createdRoom
        });
    } catch (error) {
        console.error("CREATE ROOM ERROR:", error);
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message
        });
    }
};

exports.placeBid = async (req, res) => {
    try {
        const { amount } = req.body;
        const bidder = req.user;
        const bidAmount = parseFloat(amount);

        // --- Step 1: Find and Validate Room ---
        let room = await BiddingRoom.findById(req.params.id);
        if (!room) return res.status(404).json({ message: "Bidding room not found." });

        // Prevent seller from bidding on their own item
        if (room.seller.toString() === bidder.id) {
            return res.status(403).json({ message: "You cannot bid on your own item." });
        }

        // Check if auction has ended
        if (new Date() > new Date(room.endTime)) {
            return res.status(400).json({ message: "This auction has ended." });
        }

        // Validate bid amount
        if (bidAmount <= room.currentPrice) {
            return res.status(400).json({ message: `Bid must be higher than current price: $${room.currentPrice}` });
        }

        // --- Step 2: Update and Save Bid ---
        const newBid = { bidder: bidder.id, amount: bidAmount, timestamp: new Date() };
        room.bids.unshift(newBid);
        room.currentPrice = newBid.amount;
        await room.save();

        // --- Step 3: Re-fetch the FULLY POPULATED room for updates ---
        const fullyUpdatedRoom = await BiddingRoom.findById(room._id)
            .populate('seller', 'firstName lastName')
            .populate('bids.bidder', 'firstName lastName');

        // --- Step 4: Emit Events and Notify ---
        const io = req.app.get('socketio');

        // Only emit events if socketio is available (not in test environment)
        if (io) {
            // A. Emit the 'bid_update' event with the full room data for real-time updates
            io.to(room._id.toString()).emit('bid_update', fullyUpdatedRoom);

            // B. Call the private notification service.
            // This will emit the 'new_notification' event for private user alerts.
            createAndEmitNewBidNotification(io, fullyUpdatedRoom, bidder);
        }

        // C. Send the successful response back to the original bidder
        res.status(201).json({ message: "Bid placed successfully!", room: fullyUpdatedRoom });

        // Log bid placement
        await logActivity({
            userId: bidder.id,
            action: 'bid_placed',
            category: 'auction',
            metadata: {
                auctionId: room._id.toString(),
                auctionName: room.name,
                bidAmount,
                previousPrice: room.currentPrice - bidAmount
            },
            ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
            userAgent: req.headers['user-agent'],
            status: 'success',
            resourceId: room._id.toString(),
            resourceType: 'auction'
        });

        // Invalidate auction-specific cache (bid affects this auction's data)
        await invalidateCache(`${CACHE_PREFIX.AUCTION}${room._id.toString()}*`);
        await invalidateCache(`cache:/api/bidding-rooms/${room._id.toString()}*`);
        await invalidateCache(`cache:/api/bidding-rooms?*`); // Invalidate listings too

    } catch (error) {
        console.error("PLACE BID ERROR:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// --- GET CATEGORY STATISTICS ---
exports.getCategoryStats = async (req, res) => {
    try {
        const stats = await BiddingRoom.aggregate([
            { $match: { status: 'active' } },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        res.status(200).json(stats);
    } catch (error) {
        console.error('Error fetching category stats:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// --- GET POPULAR TAGS ---
exports.getPopularTags = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;

        const tags = await BiddingRoom.aggregate([
            { $match: { status: 'active' } },
            { $unwind: '$tags' },
            {
                $group: {
                    _id: '$tags',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: limit }
        ]);

        res.status(200).json(tags);
    } catch (error) {
        console.error('Error fetching popular tags:', error);
        res.status(500).json({ message: 'Server error' });
    }
};