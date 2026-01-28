const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const {
    submitKYC,
    getKYCStatus,
    getPendingKYCRequests,
    reviewKYCRequest,
    getKYCDocument
} = require('../controllers/kycController.js');
const { protect, isAdmin } = require('../middlewares/authMiddleware.js');
const { kycDocumentUpload } = require('../middlewares/uploadMiddleware.js');

// User Routes
router.post('/submit', protect, kycDocumentUpload, submitKYC);
router.get('/status', protect, getKYCStatus);
router.get('/document/:filename', protect, getKYCDocument); // Secure route

// Admin Routes
router.get('/admin/pending', protect, isAdmin, getPendingKYCRequests);
router.put('/admin/review/:id', protect, isAdmin, reviewKYCRequest);

module.exports = router;
