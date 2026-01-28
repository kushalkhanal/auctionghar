

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

// --- PUBLIC ROUTES (anyone can access) ---
// GET /api/bidding-rooms/ - with search and filter validation
router.get('/', validateSearch, checkValidation, getAllPublicBiddingRooms);

// GET /api/bidding-rooms/categories/stats
router.get('/categories/stats', getCategoryStats);

// GET /api/bidding-rooms/tags/popular
router.get('/tags/popular', getPopularTags);

// GET /api/bidding-rooms/:id - with ID validation
router.get('/:id', validateMongoId, checkValidation, getBiddingRoomById);




// POST /api/bidding-rooms/ - Creates a new listing for the logged-in user
// Requires BIDDING_CREATE permission with validation
router.post('/', protect, hasPermission(PERMISSIONS.BIDDING_CREATE), validateAuctionCreate, checkValidation, productImagesUpload, createBiddingRoom);

// POST /api/bidding-rooms/:id/bid - Places a bid on a specific auction with validation
router.post('/:id/bid', protect, validateBid, checkValidation, placeBid);

module.exports = router;