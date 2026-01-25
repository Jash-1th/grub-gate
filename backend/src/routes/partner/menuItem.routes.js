// FILE: src/routes/partner/menuItem.routes.js
const express = require('express');
const {
  getPartnerMenuItems,
  createPartnerMenuItem,
  updatePartnerMenuItem,
  deletePartnerMenuItem,
  togglePartnerMenuItemStatus,
  updatePartnerMenuItemAvailability,
  getPartnerMenuCategories,
  getPartnerMenuItem
} = require('../../controllers/partner/menuItem.controller');
const { authMiddleware, roleMiddleware } = require('../../middlewares/auth');
const { menuItemImageUpload } = require('../../config/cloudinary');
const { body, param, query } = require('express-validator');
const { validationResult } = require('express-validator');

const router = express.Router();

// Apply authentication and partner role middleware to all routes
router.use(authMiddleware);
router.use(roleMiddleware('partner'));

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Validation schemas
const menuItemValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  body('category')
    .isIn(['appetizer', 'main', 'dessert', 'beverage', 'salad', 'soup', 'pasta', 'pizza', 'burger', 'sandwich', 'seafood', 'vegetarian', 'always-available', 'special'])
    .withMessage('Invalid category'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('prepTime')
    .isInt({ min: 5, max: 180 })
    .withMessage('Prep time must be between 5 and 180 minutes'),
  body('servings')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Servings must be at least 1'),
  body('cuisine')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Cuisine must be between 2 and 50 characters'),
  body('dietaryPreferences')
    .optional()
    .isArray()
    .withMessage('Dietary preferences must be an array'),
  body('dietaryPreferences.*')
    .optional()
    .isIn(['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'spicy', 'keto', 'low-carb', 'halal', 'kosher', 'non-veg'])
    .withMessage('Invalid dietary preference'),
  body('ingredients')
    .optional()
    .isArray()
    .withMessage('Ingredients must be an array'),
  body('allergens')
    .optional()
    .isArray()
    .withMessage('Allergens must be an array'),
  body('spiceLevel')
    .optional()
    .isInt({ min: 0, max: 5 })
    .withMessage('Spice level must be between 0 and 5'),
  body('status')
    .optional()
    .isIn(['available', 'unavailable', 'out-of-stock'])
    .withMessage('Invalid status')
];

const updateMenuItemValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  body('category')
    .optional()
    .isIn(['appetizer', 'main', 'dessert', 'beverage', 'salad', 'soup', 'pasta', 'pizza', 'burger', 'sandwich', 'seafood', 'vegetarian', 'always-available', 'special'])
    .withMessage('Invalid category'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('prepTime')
    .optional()
    .isInt({ min: 5, max: 180 })
    .withMessage('Prep time must be between 5 and 180 minutes'),
  body('servings')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Servings must be at least 1'),
  body('cuisine')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Cuisine must be between 2 and 50 characters'),
  body('dietaryPreferences')
    .optional()
    .isArray()
    .withMessage('Dietary preferences must be an array'),
  body('dietaryPreferences.*')
    .optional()
    .isIn(['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'spicy', 'keto', 'low-carb', 'halal', 'kosher', 'non-veg'])
    .withMessage('Invalid dietary preference'),
  body('spiceLevel')
    .optional()
    .isInt({ min: 0, max: 5 })
    .withMessage('Spice level must be between 0 and 5'),
  body('status')
    .optional()
    .isIn(['available', 'unavailable', 'out-of-stock'])
    .withMessage('Invalid status')
];

const flexibleIdValidation = [
  param('restaurantId')
    .custom((value) => {
      // Allow numeric IDs (for frontend compatibility) or valid MongoDB ObjectIds
      if (/^\d+$/.test(value) || /^[a-zA-Z0-9_]+$/.test(value)) {
        return true; // Numeric ID or alphanumeric ID is valid
      }
      if (/^[0-9a-fA-F]{24}$/.test(value)) {
        return true; // Valid MongoDB ObjectId
      }
      throw new Error('ID must be either a number, alphanumeric string, or a valid MongoDB ObjectId');
    })
    .withMessage('Invalid restaurant ID format'),
  param('id')
    .optional()
    .custom((value) => {
      if (/^\d+$/.test(value) || /^[a-zA-Z0-9_]+$/.test(value)) {
        return true; // Numeric ID or alphanumeric ID is valid
      }
      if (/^[0-9a-fA-F]{24}$/.test(value)) {
        return true; // Valid MongoDB ObjectId
      }
      throw new Error('ID must be either a number, alphanumeric string, or a valid MongoDB ObjectId');
    })
    .withMessage('Invalid menu item ID format')
];

const statusValidation = [
  body('status')
    .isIn(['available', 'unavailable', 'out-of-stock'])
    .withMessage('Invalid status')
];

const availabilityValidation = [
  body('availability')
    .custom((value) => {
      // Handle both object and JSON string formats
      let availability = value;
      
      if (typeof value === 'string') {
        try {
          availability = JSON.parse(value);
        } catch (error) {
          throw new Error('Availability must be a valid JSON string or object');
        }
      }
      
      if (typeof availability !== 'object' || availability === null) {
        throw new Error('Availability must be an object');
      }
      
      const requiredDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      
      for (const day of requiredDays) {
        if (!availability[day]) {
          throw new Error(`Missing availability for ${day}`);
        }
        
        if (typeof availability[day] !== 'object') {
          throw new Error(`Availability for ${day} must be an object`);
        }
        
        if (typeof availability[day].lunch !== 'boolean') {
          throw new Error(`Lunch availability for ${day} must be a boolean`);
        }
        
        if (typeof availability[day].dinner !== 'boolean') {
          throw new Error(`Dinner availability for ${day} must be a boolean`);
        }
      }
      
      return true;
    })
    .withMessage('Invalid availability structure')
];

// Routes

/**
 * @route   GET /api/v1/partner/restaurants/:restaurantId/menu-items
 * @desc    Get all menu items for partner's restaurant
 * @access  Private (Partner)
 */
router.get('/restaurants/:restaurantId/menu-items', 
  flexibleIdValidation,
  handleValidationErrors,
  getPartnerMenuItems
);

/**
 * @route   GET /api/v1/partner/restaurants/:restaurantId/menu-items/categories
 * @desc    Get menu categories for partner's restaurant
 * @access  Private (Partner)
 */
router.get('/restaurants/:restaurantId/menu-items/categories',
  flexibleIdValidation,
  handleValidationErrors,
  getPartnerMenuCategories
);

/**
 * @route   GET /api/v1/partner/restaurants/:restaurantId/menu-items/:id
 * @desc    Get single menu item for partner
 * @access  Private (Partner)
 */
router.get('/restaurants/:restaurantId/menu-items/:id',
  flexibleIdValidation,
  handleValidationErrors,
  getPartnerMenuItem
);

/**
 * @route   POST /api/v1/partner/restaurants/:restaurantId/menu-items
 * @desc    Create new menu item with image upload
 * @access  Private (Partner)
 */
router.post('/restaurants/:restaurantId/menu-items',
  menuItemImageUpload.single('image'),
  flexibleIdValidation,
  menuItemValidation,
  handleValidationErrors,
  createPartnerMenuItem
);

/**
 * @route   PATCH /api/v1/partner/restaurants/:restaurantId/menu-items/:id
 * @desc    Update menu item with optional image upload
 * @access  Private (Partner)
 */
router.patch('/restaurants/:restaurantId/menu-items/:id',
  menuItemImageUpload.single('image'),
  flexibleIdValidation,
  updateMenuItemValidation,
  handleValidationErrors,
  updatePartnerMenuItem
);

/**
 * @route   DELETE /api/v1/partner/restaurants/:restaurantId/menu-items/:id
 * @desc    Delete menu item
 * @access  Private (Partner)
 */
router.delete('/restaurants/:restaurantId/menu-items/:id',
  flexibleIdValidation,
  handleValidationErrors,
  deletePartnerMenuItem
);

/**
 * @route   PATCH /api/v1/partner/restaurants/:restaurantId/menu-items/:id/status
 * @desc    Toggle menu item status
 * @access  Private (Partner)
 */
router.patch('/restaurants/:restaurantId/menu-items/:id/status',
  flexibleIdValidation,
  statusValidation,
  handleValidationErrors,
  togglePartnerMenuItemStatus
);

/**
 * @route   PATCH /api/v1/partner/restaurants/:restaurantId/menu-items/:id/availability
 * @desc    Update menu item availability
 * @access  Private (Partner)
 */
router.patch('/restaurants/:restaurantId/menu-items/:id/availability',
  flexibleIdValidation,
  availabilityValidation,
  handleValidationErrors,
  updatePartnerMenuItemAvailability
);

module.exports = router;
