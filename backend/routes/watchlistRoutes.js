const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
    addToWatchlist,
    removeFromWatchlist,
    getWatchlist,
    isInWatchlist,
    updateNotificationSettings,
    clearEndedAuctions
} = require('../controllers/watchlistController');

// All routes require authentication
router.use(protect);

// GET /api/watchlist - Get user's watchlist
router.get('/', getWatchlist);

// POST /api/watchlist - Add auction to watchlist
router.post('/', addToWatchlist);

// GET /api/watchlist/check/:auctionId - Check if auction is in watchlist
router.get('/check/:auctionId', isInWatchlist);

// DELETE /api/watchlist/clear/ended - Clear all ended auctions
router.delete('/clear/ended', clearEndedAuctions);

// DELETE /api/watchlist/:auctionId - Remove auction from watchlist
router.delete('/:auctionId', removeFromWatchlist);

// PATCH /api/watchlist/:auctionId/notifications - Update notification settings
router.patch('/:auctionId/notifications', updateNotificationSettings);

module.exports = router;
