const express = require('express');
const router = express.Router();
const { getMyProfileData, updateMyProfile, getMyListedItems, getProfileStatistics } = require('../controllers/profileController.js');
const { protect } = require('../middlewares/authMiddleware.js');
const { profileImageUpload } = require('../middlewares/uploadMiddleware.js');
const { validateProfileUpdate, checkValidation } = require('../middlewares/validationMiddleware.js');
const { profileUpdateRateLimiter } = require('../middlewares/rateLimitMiddleware.js');


router.use(protect);

// GET /api/profile - Fetches all data for the profile page
router.get('/', getMyProfileData);

// GET /api/profile/statistics - Fetches user profile statistics
router.get('/statistics', getProfileStatistics);

// PUT /api/profile - Updates user settings, handles image upload
// Apply: rate limiting → file upload → validation → sanitization (in controller)
router.put('/', profileUpdateRateLimiter, profileImageUpload, validateProfileUpdate, checkValidation, updateMyProfile);

router.get('/listed-items', getMyListedItems);
module.exports = router;