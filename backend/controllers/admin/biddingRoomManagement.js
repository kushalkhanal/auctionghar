const BiddingRoom = require('../../models/biddingRoomModel.js');

exports.getAllBiddingRooms = async (req, res) => {
    try {

        const rooms = await BiddingRoom.find({})
            .sort({ createdAt: -1 })
            .populate('seller', 'firstName lastName');


        res.status(200).json(rooms);
    } catch (error) {
        console.error("Error fetching admin bidding rooms:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

exports.createBiddingRoom = async (req, res) => {
    const { name, description, startingPrice, endTime } = req.body;

    // Validate required fields
    if (!name || !description || !startingPrice || !endTime) {
        return res.status(400).json({ message: "Please provide all required fields." });
    }

    // Validate images
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "At least one image is required." });
    }

    // Validate maximum 5 images
    if (req.files.length > 5) {
        return res.status(400).json({ message: "Maximum 5 images allowed." });
    }

    // Validate image types and sizes
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

    // Validate auction end time
    const endTimeDate = new Date(endTime);
    const currentDate = new Date();
    const oneMonthFromNow = new Date();
    oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

    // Check if end time is in the future
    if (endTimeDate <= currentDate) {
        return res.status(400).json({ message: "Auction end time must be in the future." });
    }

    // Check if end time is not more than one month from now
    if (endTimeDate > oneMonthFromNow) {
        return res.status(400).json({ message: "Auction end time cannot be more than one month from now." });
    }

    try {
        // Process image URLs
        const imageUrls = req.files.map(file => `/${file.path.replace(/\\/g, "/")}`);
        
        const newRoom = new BiddingRoom({
            name,
            description,
            startingPrice,
            imageUrls,
            endTime,
            seller: req.user.id
        });

        const createdRoom = await newRoom.save();
        
        // Populate seller information for response
        await createdRoom.populate('seller', 'firstName lastName');
        
        res.status(201).json({
            message: "Bidding room created successfully!",
            room: createdRoom
        });
    } catch (error) {
        console.error("Error creating bidding room:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};


exports.updateBiddingRoomById = async (req, res) => {
    try {
        const room = await BiddingRoom.findById(req.params.id);
        if (!room) {
            return res.status(404).json({ message: "Bidding room not found" });
        }

        room.name = req.body.name || room.name;
        room.description = req.body.description || room.description;
        
        // Validate endTime if it's being updated
        if (req.body.endTime) {
            const endTimeDate = new Date(req.body.endTime);
            const currentDate = new Date();
            const oneMonthFromNow = new Date();
            oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

            // Check if end time is in the future
            if (endTimeDate <= currentDate) {
                return res.status(400).json({ message: "Auction end time must be in the future." });
            }

            // Check if end time is not more than one month from now
            if (endTimeDate > oneMonthFromNow) {
                return res.status(400).json({ message: "Auction end time cannot be more than one month from now." });
            }

            room.endTime = req.body.endTime;
        }
        
        if (typeof req.body.startingPrice === 'number') {
            room.startingPrice = req.body.startingPrice;
        }
        if (typeof req.body.currentPrice === 'number') {
            room.currentPrice = req.body.currentPrice;
        }

        const updatedRoom = await room.save();
        res.status(200).json(updatedRoom);
    } catch (error) {
        console.error("Error updating bidding room:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

exports.deleteBiddingRoomById = async (req, res) => {
    try {
        const room = await BiddingRoom.findById(req.params.id);
        if (!room) {
            return res.status(404).json({ message: "Bidding room not found" });
        }
        await room.deleteOne();
        res.status(200).json({ message: "Bidding room deleted successfully" });
    } catch (error) {
        console.error("Error deleting bidding room:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};