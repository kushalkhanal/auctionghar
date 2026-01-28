const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = 'uploads/profile-images';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage with dynamic destination
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let uploadPath = uploadDir; // Default to profile images

        if (file.fieldname === 'kycDocument') {
            uploadPath = 'uploads/kyc-documents';
        } else if (file.fieldname === 'productImages') {
            uploadPath = 'uploads/product-images';
        }

        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Sanitize filename: remove special characters, limit length
        const sanitizedName = file.originalname
            .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars with underscore
            .substring(0, 100); // Limit to 100 characters

        // Create unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(sanitizedName);
        const nameWithoutExt = path.basename(sanitizedName, ext);

        cb(null, nameWithoutExt + '-' + uniqueSuffix + ext);
    }
});

// Enhanced file filter with strict validation
const fileFilter = (req, file, cb) => {
    // Check MIME type (first line of defense)
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];

    if (!allowedMimeTypes.includes(file.mimetype)) {
        return cb(new Error('Invalid file type. Only JPEG, PNG, and GIF images are allowed.'), false);
    }

    // Check file extension (second line of defense)
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (!allowedExtensions.includes(ext)) {
        return cb(new Error('Invalid file extension. Only .jpg, .jpeg, .png, and .gif are allowed.'), false);
    }

    // Prevent double extensions like .jpg.exe
    const fileName = path.basename(file.originalname, ext);
    if (fileName.includes('.')) {
        return cb(new Error('Invalid filename. Files with multiple extensions are not allowed.'), false);
    }

    cb(null, true);
};

// Configure multer upload with strict limits
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024, // 2MB strict limit
        files: 1 // Only one file at a time
    }
});

// Profile image upload middleware
const profileImageUpload = upload.single('profileImage');

// KYC document upload middleware
const kycDocumentUpload = upload.single('kycDocument');

// Wrapper to handle multer errors gracefully
const handleUploadWithValidation = (uploadFn) => {
    return async (req, res, next) => {
        uploadFn(req, res, async function (err) {
            if (err instanceof multer.MulterError) {
                // Multer-specific errors
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({
                        success: false,
                        message: 'File too large. Maximum size is 2MB.'
                    });
                }
                if (err.code === 'LIMIT_UNEXPECTED_FILE') {
                    return res.status(400).json({
                        success: false,
                        message: 'Too many files. Only one file allowed.'
                    });
                }
                return res.status(400).json({
                    success: false,
                    message: err.message
                });
            } else if (err) {
                // Custom errors from fileFilter
                return res.status(400).json({
                    success: false,
                    message: err.message
                });
            }

            // File uploaded successfully, now validate magic numbers
            if (req.file) {
                try {
                    // Dynamic import for ESM module
                    const { fileTypeFromFile } = await import('file-type');
                    const fileType = await fileTypeFromFile(req.file.path);

                    // Verify actual file type matches claimed MIME type
                    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];

                    if (!fileType || !allowedTypes.includes(fileType.mime)) {
                        // Delete the uploaded file (it's a fake/spoofed image)
                        fs.unlinkSync(req.file.path);

                        return res.status(400).json({
                            success: false,
                            message: 'Invalid file content. The file is not a valid image (failed magic number check).'
                        });
                    }

                    // File is valid, continue
                    next();
                } catch (validationError) {
                    console.error('File validation error:', validationError);

                    // Delete the file if validation fails
                    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
                        fs.unlinkSync(req.file.path);
                    }

                    return res.status(500).json({
                        success: false,
                        message: 'File validation failed. Please try again.'
                    });
                }
            } else {
                // No file uploaded (optional upload), continue
                next();
            }
        });
    };
};

// Config for product images (multiple files)
const productImagesConfig = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB for product images
        files: 5 // Up to 5 images
    }
}).array('productImages', 5);

// Product images wrapper
const productImagesUpload = (req, res, next) => {
    productImagesConfig(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    success: false,
                    message: 'One or more images are too large. Maximum size is 5MB per file.'
                });
            }
            if (err.code === 'LIMIT_UNEXPECTED_FILE') {
                return res.status(400).json({
                    success: false,
                    message: 'Too many files. Maximum 5 images allowed.'
                });
            }
            return res.status(400).json({
                success: false,
                message: err.message
            });
        } else if (err) {
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }
        next();
    });
};

module.exports = {
    profileImageUpload: handleUploadWithValidation(profileImageUpload),
    kycDocumentUpload: handleUploadWithValidation(kycDocumentUpload),
    productImagesUpload
};