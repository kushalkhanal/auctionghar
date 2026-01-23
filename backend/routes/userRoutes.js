
const express = require('express');
const router = express.Router();
const { getMyBidHistory, getMe, changePassword } = require('../controllers/userController.js');
const { protect } = require('../middlewares/authMiddleware.js');


router.get('/my-bids', protect, getMyBidHistory);
router.get('/me', protect, getMe);
router.put('/change-password', protect, changePassword);

module.exports = router;