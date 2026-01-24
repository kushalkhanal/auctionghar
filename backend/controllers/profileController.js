// File: backend/controllers/profileController.js

const User = require('../models/userModel.js');
const BiddingRoom = require('../models/biddingRoomModel.js');
const jwt = require('jsonwebtoken');

// @desc    Get all data for the user's profile page (profile, listings, bid history)
// @route   GET /api/profile
// @access  Private
exports.getMyProfileData = async (req, res) => {
    try {
        const userId = req.user.id;
        const [userProfile, listedItems, roomsBiddedOn] = await Promise.all([
            User.findById(userId).select('-password').lean(),
            BiddingRoom.find({ seller: userId }).sort({ createdAt: -1 }).lean(),
            BiddingRoom.find({ 'bids.bidder': userId }).populate('seller', 'firstName lastName').sort({ updatedAt: -1 }).lean()
        ]);
        if (!userProfile) {
            return res.status(404).json({ message: 'User profile not found.' });
        }

        const now = new Date();
        const winningBids = [];
        const activeOrOutbid = [];
        for (const room of roomsBiddedOn) {
            if (room.bids && room.bids.length > 0) {
                const userBidsOnThisRoom = room.bids.filter(bid => bid.bidder && bid.bidder.toString() === userId);
                if (userBidsOnThisRoom.length > 0) {
                    const userHighestBid = userBidsOnThisRoom.reduce((max, bid) => (bid.amount > max.amount ? bid : max));
                    const isAuctionOver = now > new Date(room.endTime);
                    const isUserTheWinner = room.currentPrice === userHighestBid.amount;
                    if (isAuctionOver && isUserTheWinner) {
                        winningBids.push(room);
                    } else {
                        activeOrOutbid.push(room);
                    }
                }
            }
        }

        res.status(200).json({
            profile: userProfile,
            listedItems,
            bidHistory: { winning: winningBids, activeOrOutbid },
        });
    } catch (error) {
        console.error("Error fetching profile data:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Update the logged-in user's profile information
// @route   PUT /api/profile
// @access  Private
exports.updateMyProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (req.body.number && req.body.number !== user.number) {
            const existingUser = await User.findOne({ number: req.body.number });
            if (existingUser && existingUser._id.toString() !== user._id.toString()) {
                return res.status(400).json({ message: 'This phone number is already in use by another account.' });
            }
        }

        // Update text fields from the form data
        user.firstName = req.body.firstName || user.firstName;
        user.lastName = req.body.lastName || user.lastName;
        user.number = req.body.number || user.number;
        user.location = req.body.location || user.location;

        // Handle the file upload (req.file is added by the upload middleware)
        if (req.file) {
            console.log('File uploaded:', req.file);
            user.profileImage = '/' + req.file.path.replace(/\\/g, "/");
            console.log('Profile image path set to:', user.profileImage);
        }

        const updatedUser = await user.save();

        // Generate a new token with potentially updated information
        const token = jwt.sign(
            { userId: updatedUser._id, firstName: updatedUser.firstName, role: updatedUser.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Create a clean payload to send back to the frontend
        const userPayload = {
            id: updatedUser._id,
            email: updatedUser.email,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            number: updatedUser.number,
            role: updatedUser.role,
            wallet: updatedUser.wallet,
            profileImage: updatedUser.profileImage,
            location: updatedUser.location,
        };

        res.json({ user: userPayload, token });

    } catch (error) {
        console.error("Profile update server error:", error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server Error during profile update.' });
    }
};


// @desc    Get all items the user is currently selling
// @route   GET /api/profile/listed-items
// @access  Private
exports.getMyListedItems = async (req, res) => {
    try {
        const listedItems = await BiddingRoom.find({ seller: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(listedItems);
    } catch (error) {
        console.error("Error fetching listed items:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// You did not have this function, but it's good to add for completeness
// based on your routes and hooks.
// @desc    Get all items the user has successfully won
// @route   GET /api/profile/sold-items (or a similar route)
// @access  Private
exports.getMySoldItems = async (req, res) => {
    try {
        const soldItems = await BiddingRoom.find({
            status: 'sold',
            'bids.0.bidder': req.user.id
        }).sort({ endTime: -1 });
        res.status(200).json(soldItems);
    } catch (error) {
        console.error("Error fetching sold items:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Get user profile statistics
// @route   GET /api/profile/statistics
// @access  Private
exports.getProfileStatistics = async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch user and bidding data
        const [user, roomsWithUserBids, itemsUserIsSelling] = await Promise.all([
            User.findById(userId).select('createdAt'),
            BiddingRoom.find({ 'bids.bidder': userId }),
            BiddingRoom.find({ seller: userId })
        ]);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const now = new Date();
        let totalBids = 0;
        let itemsWon = 0;

        // Count total bids and items won
        for (const room of roomsWithUserBids) {
            if (room.bids && room.bids.length > 0) {
                const userBidsInRoom = room.bids.filter(
                    bid => bid.bidder && bid.bidder.toString() === userId
                );
                totalBids += userBidsInRoom.length;

                // Check if user won this auction
                const isAuctionOver = now > new Date(room.endTime);
                if (isAuctionOver && room.bids[0].bidder.toString() === userId) {
                    itemsWon++;
                }
            }
        }

        // Count items sold (where auction ended and there were bids)
        const itemsSold = itemsUserIsSelling.filter(room => {
            const isAuctionOver = now > new Date(room.endTime);
            return isAuctionOver && room.bids && room.bids.length > 0;
        }).length;

        // Calculate success rate (items won / total unique auctions participated in)
        const uniqueAuctionsParticipated = roomsWithUserBids.length;
        const successRate = uniqueAuctionsParticipated > 0
            ? ((itemsWon / uniqueAuctionsParticipated) * 100).toFixed(1)
            : 0;

        res.status(200).json({
            totalBids,
            itemsWon,
            itemsSold,
            successRate: parseFloat(successRate),
            memberSince: user.createdAt,
            activeListings: itemsUserIsSelling.filter(room => now < new Date(room.endTime)).length
        });

    } catch (error) {
        console.error("Error fetching profile statistics:", error);
        res.status(500).json({ message: "Server Error" });
    }
};