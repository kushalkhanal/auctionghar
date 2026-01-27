

const express = require('express');
const router = express.Router();


// We need to import ALL the functions used in this file from the biddingController.
const {
    getAllPublicBiddingRooms,
    getBiddingRoomById,
    placeBid,
    createBiddingRoom // <-- This was missing from the import
} = require('../controllers/biddingController.js');


const { protect } = require('../middlewares/authMiddleware.js');
const { productImagesUpload } = require('../middlewares/uploadMiddleware.js');
const { hasPermission } = require('../middlewares/rbacMiddleware.js');
const { PERMISSIONS } = require('../config/permissions.js');

// --- PUBLIC ROUTES (anyone can access) ---
// GET /api/bidding-rooms/
router.get('/', getAllPublicBiddingRooms);

// GET /api/bidding-rooms/:id
router.get('/:id', getBiddingRoomById);




// POST /api/bidding-rooms/ - Creates a new listing for the logged-in user
// Requires BIDDING_CREATE permission
router.post('/', protect, hasPermission(PERMISSIONS.BIDDING_CREATE), createBiddingRoom);

// POST /api/bidding-rooms/:id/bids - Places a new bid
// Requires BIDS_CREATE permission
router.post('/:id/bids', protect, hasPermission(PERMISSIONS.BIDS_CREATE), placeBid);

module.exports = router;