const express = require('express');
const router = express.Router();
const { productImagesUpload } = require('../../middlewares/uploadMiddleware.js');
const { hasPermission } = require('../../middlewares/rbacMiddleware.js');
const { PERMISSIONS } = require('../../config/permissions.js');

const {
    getAllBiddingRooms,
    createBiddingRoom,
    updateBiddingRoomById,
    deleteBiddingRoomById
} = require('../../controllers/admin/biddingRoomManagement.js');

// All routes require authentication (applied in index.js)
router.get('/', hasPermission(PERMISSIONS.BIDDING_READ), getAllBiddingRooms);
router.put('/:id', hasPermission(PERMISSIONS.BIDDING_UPDATE_ANY), updateBiddingRoomById);
router.delete('/:id', hasPermission(PERMISSIONS.BIDDING_DELETE_ANY), deleteBiddingRoomById);
router.post('/', hasPermission(PERMISSIONS.BIDDING_CREATE), productImagesUpload, createBiddingRoom);

module.exports = router;