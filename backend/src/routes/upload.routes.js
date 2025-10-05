// FILE: src/routes/upload.routes.js
const express = require('express');
const multer = require('multer');
const { authMiddleware, roleMiddleware } = require('../middlewares/auth');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { asyncHandler } = require('../middlewares/errorHandler');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = process.env.ALLOWED_FILE_TYPES 
      ? process.env.ALLOWED_FILE_TYPES.split(',')
      : ['image/jpeg', 'image/png', 'image/webp'];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'));
    }
  }
});

// Apply auth middleware to all routes
router.use(authMiddleware);

/**
 * @desc    Upload single image
 * @route   POST /api/v1/upload/image
 * @access  Private
 */
const uploadSingleImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return errorResponse(res, 'No file uploaded', 400);
  }

  // TODO: Implement actual file upload to cloud storage (Cloudinary, AWS S3, etc.)
  // For now, return a mock URL
  const mockUrl = `https://example.com/uploads/${Date.now()}-${req.file.originalname}`;

  successResponse(res, {
    url: mockUrl,
    filename: req.file.originalname,
    size: req.file.size,
    mimetype: req.file.mimetype
  }, 'Image uploaded successfully');
});

/**
 * @desc    Upload multiple images
 * @route   POST /api/v1/upload/images
 * @access  Private
 */
const uploadMultipleImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return errorResponse(res, 'No files uploaded', 400);
  }

  // TODO: Implement actual file upload to cloud storage
  const uploadedFiles = req.files.map(file => ({
    url: `https://example.com/uploads/${Date.now()}-${file.originalname}`,
    filename: file.originalname,
    size: file.size,
    mimetype: file.mimetype
  }));

  successResponse(res, {
    files: uploadedFiles,
    count: uploadedFiles.length
  }, 'Images uploaded successfully');
});

/**
 * @desc    Delete uploaded file
 * @route   DELETE /api/v1/upload/:filename
 * @access  Private
 */
const deleteFile = asyncHandler(async (req, res) => {
  const { filename } = req.params;

  // TODO: Implement actual file deletion from cloud storage
  // For now, just return success
  
  successResponse(res, null, 'File deleted successfully');
});

// Routes
router.post('/image', 
  roleMiddleware('partner', 'customer'), 
  upload.single('image'), 
  uploadSingleImage
);

router.post('/images', 
  roleMiddleware('partner', 'customer'), 
  upload.array('images', 10), // Max 10 files
  uploadMultipleImages
);

router.delete('/:filename', 
  roleMiddleware('partner', 'customer'), 
  deleteFile
);

module.exports = router;
