const User = require('../models/userModel');
const BiddingRoom = require('../models/biddingRoomModel');
const { logActivity } = require('../utils/activityLogger');

// @desc    Add auction to user's watchlist
// @route   POST /api/watchlist
// @access  Private
exports.addToWatchlist = async (req, res) => {
    try {
        const { auctionId } = req.body;
        const userId = req.user.id;

        // Validate auction exists
        const auction = await BiddingRoom.findById(auctionId);
        if (!auction) {
            return res.status(404).json({ message: 'Auction not found' });
        }

        // Check if auction is still active
        if (auction.status !== 'active') {
            return res.status(400).json({ message: 'Cannot watch inactive auctions' });
        }

        // Get user and check if already in watchlist
        const user = await User.findById(userId);
        const alreadyWatched = user.watchlist.some(
            item => item.auction.toString() === auctionId
        );

        if (alreadyWatched) {
            return res.status(400).json({ message: 'Auction already in watchlist' });
        }

        // Add to watchlist
        user.watchlist.push({
            auction: auctionId,
            addedAt: new Date(),
            notifyOnOutbid: true,
            notifyOnEnding: true
        });

        await user.save();

        // Log activity
        await logActivity({
            userId: user._id,
            action: 'watchlist_add',
            category: 'auction',
            metadata: {
                auctionId: auction._id.toString(),
                auctionName: auction.name
            },
            ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
            userAgent: req.headers['user-agent'],
            status: 'success'
        });

        res.status(200).json({
            message: 'Added to watchlist',
            watchlistCount: user.watchlist.length
        });
    } catch (error) {
        console.error('Error adding to watchlist:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Remove auction from user's watchlist
// @route   DELETE /api/watchlist/:auctionId
// @access  Private
exports.removeFromWatchlist = async (req, res) => {
    try {
        const { id: auctionId } = req.params;
        const userId = req.user.id;

        const user = await User.findById(userId);

        // Check if auction is in watchlist
        const watchlistItem = user.watchlist.find(
            item => item.auction.toString() === auctionId
        );

        if (!watchlistItem) {
            return res.status(404).json({ message: 'Auction not in watchlist' });
        }

        // Remove from watchlist
        user.watchlist = user.watchlist.filter(
            item => item.auction.toString() !== auctionId
        );

        await user.save();

        // Log activity
        await logActivity({
            userId: user._id,
            action: 'watchlist_remove',
            category: 'auction',
            metadata: {
                auctionId: auctionId
            },
            ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
            userAgent: req.headers['user-agent'],
            status: 'success'
        });

        res.status(200).json({
            message: 'Removed from watchlist',
            watchlistCount: user.watchlist.length
        });
    } catch (error) {
        console.error('Error removing from watchlist:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get user's watchlist
// @route   GET /api/watchlist
// @access  Private
exports.getWatchlist = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId)
            .populate({
                path: 'watchlist.auction',
                populate: {
                    path: 'seller',
                    select: 'firstName lastName profileImage'
                }
            });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Filter out null auctions (deleted auctions)
        const activeWatchlist = user.watchlist.filter(item => item.auction !== null);

        // Sort by most recently added
        activeWatchlist.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));

        res.status(200).json({
            watchlist: activeWatchlist,
            count: activeWatchlist.length
        });
    } catch (error) {
        console.error('Error fetching watchlist:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Check if auction is in user's watchlist
// @route   GET /api/watchlist/check/:auctionId
// @access  Private
exports.isInWatchlist = async (req, res) => {
    try {
        const { id: auctionId } = req.params;
        const userId = req.user.id;

        const user = await User.findById(userId);

        const isWatched = user.watchlist.some(
            item => item.auction.toString() === auctionId
        );

        res.status(200).json({ isWatched });
    } catch (error) {
        console.error('Error checking watchlist:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update watchlist notification settings
// @route   PATCH /api/watchlist/:auctionId/notifications
// @access  Private
exports.updateNotificationSettings = async (req, res) => {
    try {
        const { id: auctionId } = req.params;
        const { notifyOnOutbid, notifyOnEnding } = req.body;
        const userId = req.user.id;

        const user = await User.findById(userId);

        const watchlistItem = user.watchlist.find(
            item => item.auction.toString() === auctionId
        );

        if (!watchlistItem) {
            return res.status(404).json({ message: 'Auction not in watchlist' });
        }

        // Update notification settings
        if (typeof notifyOnOutbid === 'boolean') {
            watchlistItem.notifyOnOutbid = notifyOnOutbid;
        }
        if (typeof notifyOnEnding === 'boolean') {
            watchlistItem.notifyOnEnding = notifyOnEnding;
        }

        await user.save();

        res.status(200).json({
            message: 'Notification settings updated',
            settings: {
                notifyOnOutbid: watchlistItem.notifyOnOutbid,
                notifyOnEnding: watchlistItem.notifyOnEnding
            }
        });
    } catch (error) {
        console.error('Error updating notification settings:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Clear all ended auctions from watchlist
// @route   DELETE /api/watchlist/clear/ended
// @access  Private
exports.clearEndedAuctions = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId)
            .populate('watchlist.auction');

        // Filter out ended auctions
        const activeAuctions = user.watchlist.filter(item => {
            if (!item.auction) return false; // Remove null auctions
            return new Date(item.auction.endTime) > new Date();
        });

        const removedCount = user.watchlist.length - activeAuctions.length;
        user.watchlist = activeAuctions;

        await user.save();

        res.status(200).json({
            message: `Removed ${removedCount} ended auction(s)`,
            watchlistCount: user.watchlist.length
        });
    } catch (error) {
        console.error('Error clearing ended auctions:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
