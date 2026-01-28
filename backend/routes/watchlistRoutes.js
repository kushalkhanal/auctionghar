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
const {
    validateWatchlistAdd,
    validateMongoId,
    checkValidation
} = require('../middlewares/validationMiddleware');

// All watchlist routes require authentication
router.use(protect);

// Get user's watchlist
router.get('/', getWatchlist);

// Add auction to watchlist with validation
router.post('/', validateWatchlistAdd, checkValidation, addToWatchlist);

// Check if auction is in watchlist with ID validation
router.get('/check/:auctionId', validateMongoId, checkValidation, isInWatchlist);

// Clear all ended auctions from watchlist
router.delete('/clear/ended', clearEndedAuctions);

// Remove auction from watchlist with ID validation
router.delete('/:auctionId', validateMongoId, checkValidation, removeFromWatchlist);

// Update notification settings for a watched auction with ID validation
router.patch('/:auctionId/notifications', validateMongoId, checkValidation, updateNotificationSettings);

module.exports = router;
