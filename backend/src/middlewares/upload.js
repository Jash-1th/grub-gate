// FILE: src/middlewares/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist (only in local environment)
const uploadsDir = path.join(__dirname, '../../uploads');
if (process.env.NODE_ENV !== 'production' && !fs.existsSync(uploadsDir)) {
  try {
    fs.mkdirSync(uploadsDir, { recursive: true });
  } catch (error) {
    console.log('⚠️ Could not create uploads directory (serverless environment):', error.message);
  }
}

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create subdirectories based on file type
    let uploadPath = uploadsDir;
    
    if (file.fieldname === 'logo') {
      uploadPath = path.join(uploadsDir, 'logos');
    } else if (file.fieldname === 'images') {
      uploadPath = path.join(uploadsDir, 'restaurant-images');
    } else if (file.fieldname === 'documents') {
      uploadPath = path.join(uploadsDir, 'documents');
    }
    
    // Create directory if it doesn't exist (only in local environment)
    if (process.env.NODE_ENV !== 'production' && !fs.existsSync(uploadPath)) {
      try {
        fs.mkdirSync(uploadPath, { recursive: true });
      } catch (error) {
        console.log('⚠️ Could not create upload subdirectory (serverless environment):', error.message);
      }
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, extension);
    
    cb(null, `${baseName}-${uniqueSuffix}${extension}`);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Check file type based on fieldname
  if (file.fieldname === 'logo' || file.fieldname === 'images') {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for logo and images'), false);
    }
  } else if (file.fieldname === 'documents' || file.fieldname === 'businessLicenseFile') {
    // Accept documents (PDF, DOC, DOCX) and business license files (PDF, images)
    const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/webp'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, DOCX, and image files are allowed for documents'), false);
    }
  } else {
    cb(new Error('Invalid field name'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10 // Maximum 10 files
  }
});

// Middleware for partner registration uploads
const partnerUploads = upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'images', maxCount: 5 },
  { name: 'businessLicenseFile', maxCount: 1 }
]);

// Error handling middleware for multer
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        status: 'error',
        message: 'File size too large. Maximum size is 5MB per file.'
      });
    } else if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        status: 'error',
        message: 'Too many files. Maximum allowed files exceeded.'
      });
    } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        status: 'error',
        message: 'Unexpected file field. Please check your form fields.'
      });
    }
  } else if (error) {
    return res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
  next();
};

// Helper function to get file URLs
const getFileUrls = (files, baseUrl) => {
  const urls = {};
  
  if (files.logo && files.logo[0]) {
    urls.logo = `${baseUrl}/uploads/logos/${files.logo[0].filename}`;
  }
  
  if (files.images && files.images.length > 0) {
    urls.images = files.images.map(file => 
      `${baseUrl}/uploads/restaurant-images/${file.filename}`
    );
  }
  
  if (files.businessLicense && files.businessLicense[0]) {
    urls.businessLicense = `${baseUrl}/uploads/documents/${files.businessLicense[0].filename}`;
  }
  
  return urls;
};

module.exports = {
  upload,
  partnerUploads,
  handleUploadError,
  getFileUrls
};
