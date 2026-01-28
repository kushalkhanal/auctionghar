const User = require('../models/userModel.js');

// @desc    Submit KYC document for verification
// @route   POST /api/kyc/submit
// @access  Private
exports.submitKYC = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload a valid identification document.' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Check if already verified or pending
        if (user.kycStatus === 'verified') {
            return res.status(400).json({ success: false, message: 'You are already verified.' });
        }

        if (user.kycStatus === 'pending') {
            return res.status(400).json({ success: false, message: 'Your verification is already under review.' });
        }

        // Update user status
        user.kycDocument = '/' + req.file.path.replace(/\\/g, "/");
        user.kycStatus = 'pending';
        user.kycRejectionReason = undefined; // Clear previous rejection reason if any

        await user.save();

        res.status(200).json({
            success: true,
            message: 'KYC document submitted successfully. Please wait for admin approval.',
            kycStatus: user.kycStatus
        });

    } catch (error) {
        console.error("KYC Submission Error:", error);
        res.status(500).json({ success: false, message: 'Server error during KYC submission' });
    }
};

// @desc    Get current KYC status
// @route   GET /api/kyc/status
// @access  Private
exports.getKYCStatus = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('kycStatus kycRejectionReason kycDocument');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            kycStatus: user.kycStatus,
            rejectionReason: user.kycRejectionReason,
            document: user.kycDocument
        });
    } catch (error) {
        console.error("KYC Status Error:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get all pending KYC requests (Admin)
// @route   GET /api/kyc/admin/pending
// @access  Private/Admin
exports.getPendingKYCRequests = async (req, res) => {
    try {
        const pendingUsers = await User.find({ kycStatus: 'pending' })
            .select('firstName lastName email number kycDocument kycStatus createdAt')
            .sort({ createdAt: 1 }); // Oldest first

        res.status(200).json({
            success: true,
            count: pendingUsers.length,
            requests: pendingUsers
        });
    } catch (error) {
        console.error("Admin KYC Fetch Error:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Approve or Reject KYC (Admin)
// @route   PUT /api/kyc/admin/review/:id
// @access  Private/Admin
exports.reviewKYCRequest = async (req, res) => {
    try {
        const { action, rejectionReason } = req.body; // action: 'approve' or 'reject'
        const userId = req.params.id;

        if (!['approve', 'reject'].includes(action)) {
            return res.status(400).json({ success: false, message: 'Invalid action. Use "approve" or "reject".' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.kycStatus !== 'pending') {
            return res.status(400).json({ success: false, message: `User is currently ${user.kycStatus}, not pending.` });
        }

        if (action === 'approve') {
            user.kycStatus = 'verified';
            user.kycRejectionReason = undefined;
        } else {
            user.kycStatus = 'rejected';
            user.kycRejectionReason = rejectionReason || 'Document did not meet requirements.';
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: `KYC request ${action}ed successfully.`,
            kycStatus: user.kycStatus
        });

    } catch (error) {
        console.error("KYC Review Error:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Securely view KYC document
// @route   GET /api/kyc/document/:filename
// @access  Private (Owner or Admin only)
exports.getKYCDocument = async (req, res) => {
    try {
        const filename = req.params.filename;
        const user = await User.findById(req.user.id);

        // Allow if user is admin
        if (user.role === 'admin') {
            const filePath = path.join(__dirname, '../uploads/kyc-documents', filename);
            if (fs.existsSync(filePath)) {
                return res.sendFile(filePath);
            } else {
                return res.status(404).json({ success: false, message: 'Document not found' });
            }
        }

        // Allow if user is owner of the document
        // We need to check if this filename matches the user's stored kycDocument
        // kycDocument is stored as "/uploads/kyc-documents/filename.jpg"
        if (user.kycDocument && user.kycDocument.includes(filename)) {
            const filePath = path.join(__dirname, '../uploads/kyc-documents', filename);
            if (fs.existsSync(filePath)) {
                return res.sendFile(filePath);
            } else {
                return res.status(404).json({ success: false, message: 'Document not found' });
            }
        }

        return res.status(403).json({ success: false, message: 'Not authorized to view this document' });

    } catch (error) {
        console.error("KYC Document Fetch Error:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
