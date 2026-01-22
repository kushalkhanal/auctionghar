const BiddingRoom = require('../models/biddingRoomModel.js');
const { createAndEmitNewBidNotification } = require('../services/notificationService.js');
const Notification = require('../models/notificationModel.js');

// --- PUBLIC: GET ALL BIDDING ROOMS (with Search and Pagination) ---
exports.getAllPublicBiddingRooms = async (req, res) => {
    try {
        // 1. Get page, limit, and search term from query parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 8;
        const skip = (page - 1) * limit;

        // 2. Build the filter object based on the search query
        const searchQuery = req.query.search
            ? {
                name: {
                    $regex: req.query.search, // Use regex for "contains" matching
                    $options: 'i'             // 'i' for case-insensitive
                }
            }
            : {};

        // Calculate the cutoff time (12 hours ago from now)
        // This ensures ended auctions are only visible for 12 hours after ending
        const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
        
        // Combine the search filter with the requirement that rooms must be 'active'
        // AND either not ended OR ended less than 12 hours ago
        const filter = { 
            ...searchQuery, 
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
    
    // try {
    //     const { name, description, startingPrice, endTime } = req.body;
        
    //     // Validate required fields
    //     if (!name || !description || !startingPrice || !endTime) {
    //         return res.status(400).json({ message: "Please provide all required fields." });
    //     }

    //     // Validate images
    //     if (!req.files || req.files.length === 0) {
    //         return res.status(400).json({ message: "At least one image is required." });
    //     }

    //     // Validate maximum 5 images
    //     if (req.files.length > 5) {
    //         return res.status(400).json({ message: "Maximum 5 images allowed." });
    //     }

    //     // Validate image types and sizes
    //     const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    //     const maxSize = 5 * 1024 * 1024; // 5MB

    //     for (let i = 0; i < req.files.length; i++) {
    //         const file = req.files[i];
            
    //         if (!allowedTypes.includes(file.mimetype)) {
    //             return res.status(400).json({ 
    //                 message: "Only JPEG, PNG, GIF, and WebP images are allowed." 
    //             });
    //         }
            
    //         if (file.size > maxSize) {
    //             return res.status(400).json({ 
    //                 message: "Each image must be less than 5MB." 
    //             });
    //         }
    //     }

    //     // Validate auction end time
    //     const endTimeDate = new Date(endTime);
    //     const currentDate = new Date();
    //     const oneMonthFromNow = new Date();
    //     oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

    //     // Check if end time is in the future
    //     if (endTimeDate <= currentDate) {
    //         return res.status(400).json({ message: "Auction end time must be in the future." });
    //     }

    //     // Check if end time is not more than one month from now
    //     if (endTimeDate > oneMonthFromNow) {
    //         return res.status(400).json({ message: "Auction end time cannot be more than one month from now." });
    //     }

    //     // Process image URLs
    //     const imageUrls = req.files.map(file => `/${file.path.replace(/\\/g, "/")}`);
        
    //     const newRoom = new BiddingRoom({
    //         name, 
    //         description, 
    //         startingPrice, 
    //         endTime, 
    //         imageUrls,
    //         seller: req.user.id
    //     });
        
    //     const createdRoom = await newRoom.save();
        
    //     // Populate seller information for response
    //     await createdRoom.populate('seller', 'firstName lastName');
        
    //     res.status(201).json({
    //         message: "Bidding room created successfully!",
    //         room: createdRoom
    //     });
    // } catch (error) {
    //     console.error("CREATE ROOM ERROR:", error);
    //     res.status(500).json({ message: "Server Error", error: error.message });
    // }



    try {
        const { name, description, startingPrice, endTime } = req.body;
        
        // --- STEP 1: VALIDATE ONLY THE TEXT FIELDS ---
        if (!name || !description || !startingPrice || !endTime) {
            return res.status(400).json({ message: "Please provide all required fields." });
        }

        // --- STEP 2: REMOVE ALL IMAGE VALIDATION LOGIC ---
        // We are commenting out all checks related to req.files, mimetype, and size.
        /*
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "At least one image is required." });
        }
        if (req.files.length > 5) {
            return res.status(400).json({ message: "Maximum 5 images allowed." });
        }
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        const maxSize = 5 * 1024 * 1024; // 5MB
        for (let i = 0; i < req.files.length; i++) {
            const file = req.files[i];
            if (!allowedTypes.includes(file.mimetype)) {
                return res.status(400).json({ 
                    message: "Only JPEG, PNG, GIF, and WebP images are allowed." 
                });
            }
            if (file.size > maxSize) {
                return res.status(400).json({ 
                    message: "Each image must be less than 5MB." 
                });
            }
        }
        */

        // --- STEP 3: VALIDATE AUCTION END TIME (No change here) ---
        const endTimeDate = new Date(endTime);
        const currentDate = new Date();
        const oneMonthFromNow = new Date();
        oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

        if (endTimeDate <= currentDate) {
            return res.status(400).json({ message: "Auction end time must be in the future." });
        }

        if (endTimeDate > oneMonthFromNow) {
            return res.status(400).json({ message: "Auction end time cannot be more than one month from now." });
        }

        // --- STEP 4: HARDCODE THE IMAGE URLS ---
        // Instead of processing req.files, we assign a default array.
        // Make sure this path points to an actual image you have in your uploads folder.
        const imageUrls = ['/uploads/products/productImages-1754067384965.jpg'];
        
        // --- STEP 5: CREATE AND SAVE THE NEW ROOM (No change here) ---
        const newRoom = new BiddingRoom({
            name, 
            description, 
            startingPrice, 
            endTime, 
            imageUrls, // This now uses our hardcoded array
            seller: req.user.id
        });
        
        const createdRoom = await newRoom.save();
        
        await createdRoom.populate('seller', 'firstName lastName');
        
        res.status(201).json({
            message: "Bidding room created successfully!",
            room: createdRoom
        });
    } catch (error) {
        console.error("CREATE ROOM ERROR:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
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

    } catch (error) {
        console.error("PLACE BID ERROR:", error);
        res.status(500).json({ message: "Server Error" });
    }
};