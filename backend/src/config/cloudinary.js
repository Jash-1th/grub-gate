// FILE: src/config/cloudinary.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage configuration for restaurant logos
const logoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'grubgate/restaurants/logos',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 400, height: 400, crop: 'fill', quality: 'auto' }
    ],
    public_id: (req, file) => {
      const timestamp = Date.now();
      const restaurantName = req.body.restaurantName ? 
        req.body.restaurantName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase() : 
        'restaurant';
      return `logo_${restaurantName}_${timestamp}`;
    }
  },
});

// Storage configuration for restaurant images
const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'grubgate/restaurants/images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 800, height: 600, crop: 'fill', quality: 'auto' }
    ],
    public_id: (req, file) => {
      const timestamp = Date.now();
      const restaurantName = req.body.restaurantName ? 
        req.body.restaurantName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase() : 
        'restaurant';
      const random = Math.random().toString(36).substring(7);
      return `image_${restaurantName}_${timestamp}_${random}`;
    }
  },
});

// Storage configuration for business license documents
const documentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'grubgate/restaurants/documents',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
    resource_type: 'auto',
    public_id: (req, file) => {
      const timestamp = Date.now();
      const restaurantName = req.body.restaurantName ? 
        req.body.restaurantName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase() : 
        'restaurant';
      return `license_${restaurantName}_${timestamp}`;
    }
  },
});

// Storage configuration for menu item images
const menuItemImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'grubgate/menu-items',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 600, height: 400, crop: 'fill', quality: 'auto' },
      { fetch_format: 'auto' }
    ],
    public_id: (req, file) => {
      const timestamp = Date.now();
      const itemName = req.body.name ? 
        req.body.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase() : 
        'menu_item';
      const random = Math.random().toString(36).substring(7);
      return `${itemName}_${timestamp}_${random}`;
    }
  },
});

// Create multer instances
const logoUpload = multer({ 
  storage: logoStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for logo'), false);
    }
  }
});

const imageUpload = multer({ 
  storage: imageStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per image
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

const documentUpload = multer({ 
  storage: documentStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for documents
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and PDF files are allowed for documents'), false);
    }
  }
});

// Menu item image upload
const menuItemImageUpload = multer({ 
  storage: menuItemImageStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per image
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for menu items'), false);
    }
  }
});

// Combined upload middleware for partner registration
const partnerUpload = multer({
  storage: multer.memoryStorage(), // We'll handle storage per field
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10 // Maximum 10 files total
  }
}).fields([
  { name: 'logo', maxCount: 1 },
  { name: 'images', maxCount: 5 },
  { name: 'businessLicenseFile', maxCount: 1 }
]);

// Helper function to upload file to Cloudinary
const uploadToCloudinary = (buffer, options) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    ).end(buffer);
  });
};

// Helper function to delete file from Cloudinary
const deleteFromCloudinary = (publicId) => {
  return cloudinary.uploader.destroy(publicId);
};

module.exports = {
  cloudinary,
  logoUpload,
  imageUpload,
  documentUpload,
  menuItemImageUpload,
  partnerUpload,
  uploadToCloudinary,
  deleteFromCloudinary
};
