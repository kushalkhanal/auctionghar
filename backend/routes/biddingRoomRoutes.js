

const express = require('express');
const router = express.Router();


// We need to import ALL the functions used in this file from the biddingController.
const {
    getAllPublicBiddingRooms,
    createBiddingRoom,
    getBiddingRoomById,
    placeBid,
    getCategoryStats,
    getPopularTags
} = require('../controllers/biddingController.js');


const { protect } = require('../middlewares/authMiddleware.js');
const { productImagesUpload } = require('../middlewares/uploadMiddleware.js');
const { hasPermission } = require('../middlewares/rbacMiddleware.js');
const { PERMISSIONS } = require('../config/permissions.js');
const {
    validateAuctionCreate,
    validateAuctionUpdate,
    validateBid,
    validateSearch,
    validateMongoId,
    checkValidation
} = require('../middlewares/validationMiddleware.js');
const { cacheMiddleware } = require('../middlewares/cacheMiddleware.js');
const { CACHE_TTL } = require('../config/cacheConfig.js');

// --- PUBLIC ROUTES (anyone can access) ---
// GET /api/bidding-rooms/ - with search, filter validation, and 30s cache
router.get('/', cacheMiddleware(CACHE_TTL.AUCTION_LISTINGS), validateSearch, checkValidation, getAllPublicBiddingRooms);

// GET /api/bidding-rooms/categories/stats - with 5min cache
router.get('/categories/stats', cacheMiddleware(CACHE_TTL.CATEGORY_STATS), getCategoryStats);

// GET /api/bidding-rooms/tags/popular - with 10min cache
router.get('/tags/popular', cacheMiddleware(CACHE_TTL.POPULAR_TAGS), getPopularTags);

// GET /api/bidding-rooms/:id - with ID validation and 1min cache
router.get('/:id', cacheMiddleware(CACHE_TTL.AUCTION_DETAIL), validateMongoId, checkValidation, getBiddingRoomById);




// POST /api/bidding-rooms/ - Creates a new listing for the logged-in user
// Requires BIDDING_CREATE permission with validation
router.post('/', protect, hasPermission(PERMISSIONS.BIDDING_CREATE), productImagesUpload, validateAuctionCreate, checkValidation, createBiddingRoom);

// POST /api/bidding-rooms/:id/bid - Places a bid on a specific auction with validation
router.post('/:id/bid', protect, validateBid, checkValidation, placeBid);

module.exports = router;