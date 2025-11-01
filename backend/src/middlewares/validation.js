// FILE: src/middlewares/validation.js
const { body, param, query, validationResult } = require('express-validator');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value
    }));

    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: formattedErrors
    });
  }
  
  next();
};

// Common validation rules
const commonValidations = {
  email: body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
    
  password: body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    
  name: body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
    
  phone: body('phone')
    .optional()
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage('Please provide a valid phone number'),
    
  mongoId: param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
    
  mongoMenuItemId: param('menuItemId')
    .isMongoId()
    .withMessage('Invalid menu item ID format'),
    
  mongoRestaurantId: param('restaurantId')
    .isMongoId()
    .withMessage('Invalid restaurant ID format'),

  flexibleId: param('id')
    .custom((value) => {
      // Allow numeric IDs (for frontend compatibility) or valid MongoDB ObjectIds
      if (/^\d+$/.test(value)) {
        return true; // Numeric ID is valid
      }
      if (/^[0-9a-fA-F]{24}$/.test(value)) {
        return true; // Valid MongoDB ObjectId
      }
      throw new Error('ID must be either a number or a valid MongoDB ObjectId');
    })
    .withMessage('Invalid ID format'),
    
  rating: body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
    
  price: body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
    
  coordinates: [
    body('coordinates.lat')
      .isFloat({ min: -90, max: 90 })
      .withMessage('Latitude must be between -90 and 90'),
    body('coordinates.lng')
      .isFloat({ min: -180, max: 180 })
      .withMessage('Longitude must be between -180 and 180')
  ]
};

// User validation rules
const userValidations = {
  register: [
    body('firstName')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('First name must be between 2 and 50 characters'),
    body('lastName')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Last name must be between 2 and 50 characters'),
    commonValidations.email,
    commonValidations.password,
    commonValidations.phone,
    body('role')
      .optional()
      .isIn(['customer', 'partner'])
      .withMessage('Role must be either customer or partner'),
    handleValidationErrors
  ],
  
  login: [
    commonValidations.email,
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
    handleValidationErrors
  ],
  
  updateProfile: [
    body('firstName')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('First name must be between 2 and 50 characters'),
    body('lastName')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Last name must be between 2 and 50 characters'),
    commonValidations.phone,
    body('preferences.dietary')
      .optional()
      .isArray()
      .withMessage('Dietary preferences must be an array'),
    body('preferences.dietary.*')
      .optional()
      .isIn(['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'spicy'])
      .withMessage('Invalid dietary preference'),
    handleValidationErrors
  ]
};

// Restaurant validation rules
const restaurantValidations = {
  create: [
    body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Restaurant name must be between 2 and 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters'),
    body('cuisine')
      .trim()
      .notEmpty()
      .withMessage('Cuisine type is required'),
    commonValidations.email,
    commonValidations.phone,
    body('address.street')
      .trim()
      .notEmpty()
      .withMessage('Street address is required'),
    body('address.city')
      .trim()
      .notEmpty()
      .withMessage('City is required'),
    body('address.province')
      .trim()
      .notEmpty()
      .withMessage('Province is required'),
    body('address.postalCode')
      .trim()
      .notEmpty()
      .withMessage('Postal code is required'),
    body('deliverySettings.radius')
      .isFloat({ min: 1, max: 50 })
      .withMessage('Delivery radius must be between 1 and 50 km'),
    body('deliverySettings.fee')
      .isFloat({ min: 0 })
      .withMessage('Delivery fee must be a positive number'),
    body('deliverySettings.minOrderAmount')
      .isFloat({ min: 0 })
      .withMessage('Minimum order amount must be a positive number'),
    body('deliverySettings.avgDeliveryTime')
      .isInt({ min: 10, max: 120 })
      .withMessage('Average delivery time must be between 10 and 120 minutes'),
    handleValidationErrors
  ],
  
  update: [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Restaurant name must be between 2 and 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters'),
    body('cuisine')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Cuisine type cannot be empty'),
    body('phone')
      .optional()
      .matches(/^\+?[\d\s\-\(\)]+$/)
      .withMessage('Please provide a valid phone number'),
    handleValidationErrors
  ]
};

// Menu item validation rules
const menuItemValidations = {
  create: [
    body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Menu item name must be between 2 and 100 characters'),
    body('description')
      .trim()
      .isLength({ min: 10, max: 500 })
      .withMessage('Description must be between 10 and 500 characters'),
    body('category')
      .isIn(['appetizer', 'main', 'dessert', 'beverage', 'salad', 'soup', 'pasta', 'pizza', 'burger', 'sandwich', 'seafood', 'vegetarian', 'always-available', 'special'])
      .withMessage('Invalid category'),
    commonValidations.price,
    body('prepTime')
      .isInt({ min: 5, max: 180 })
      .withMessage('Preparation time must be between 5 and 180 minutes'),
    body('servings')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Servings must be at least 1'),
    body('dietaryPreferences')
      .optional()
      .isArray()
      .withMessage('Dietary preferences must be an array'),
    body('dietaryPreferences.*')
      .optional()
      .isIn(['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'spicy', 'keto', 'low-carb'])
      .withMessage('Invalid dietary preference'),
    body('spiceLevel')
      .optional()
      .isInt({ min: 0, max: 5 })
      .withMessage('Spice level must be between 0 and 5'),
    handleValidationErrors
  ],
  
  update: [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Menu item name must be between 2 and 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ min: 10, max: 500 })
      .withMessage('Description must be between 10 and 500 characters'),
    body('price')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Price must be a positive number'),
    body('status')
      .optional()
      .isIn(['available', 'unavailable', 'out-of-stock'])
      .withMessage('Invalid status'),
    handleValidationErrors
  ]
};

// Order validation rules
const orderValidations = {
  create: [
    body('restaurantId')
      .isMongoId()
      .withMessage('Invalid restaurant ID'),
    body('items')
      .isArray({ min: 1 })
      .withMessage('Order must contain at least one item'),
    body('items.*.menuItemId')
      .isMongoId()
      .withMessage('Invalid menu item ID'),
    body('items.*.quantity')
      .isInt({ min: 1 })
      .withMessage('Quantity must be at least 1'),
    body('deliveryAddress.street')
      .trim()
      .notEmpty()
      .withMessage('Street address is required'),
    body('deliveryAddress.city')
      .trim()
      .notEmpty()
      .withMessage('City is required'),
    body('deliveryAddress.province')
      .trim()
      .notEmpty()
      .withMessage('Province is required'),
    body('deliveryAddress.postalCode')
      .trim()
      .notEmpty()
      .withMessage('Postal code is required'),
    handleValidationErrors
  ],
  
  updateStatus: [
    body('status')
      .isIn(['pending', 'confirmed', 'preparing', 'ready', 'out-for-delivery', 'delivered', 'cancelled'])
      .withMessage('Invalid order status'),
    body('notes')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Notes cannot exceed 500 characters'),
    handleValidationErrors
  ]
};

// Review validation rules
const reviewValidations = {
  create: [
    body('orderId')
      .isMongoId()
      .withMessage('Invalid order ID'),
    body('restaurantId')
      .isMongoId()
      .withMessage('Invalid restaurant ID'),
    body('menuItemId')
      .optional()
      .isMongoId()
      .withMessage('Invalid menu item ID'),
    commonValidations.rating,
    body('title')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Title cannot exceed 100 characters'),
    body('comment')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Comment cannot exceed 1000 characters'),
    handleValidationErrors
  ]
};

// Contact message validation rules
const contactValidations = {
  create: [
    body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters'),
    commonValidations.email,
    commonValidations.phone,
    body('reason')
      .isIn(['general-inquiry', 'technical-support', 'billing-question', 'partnership', 'feedback', 'complaint', 'other'])
      .withMessage('Invalid reason'),
    body('message')
      .trim()
      .isLength({ min: 10, max: 2000 })
      .withMessage('Message must be between 10 and 2000 characters'),
    handleValidationErrors
  ]
};

// Weekly plan validation rules
const weeklyPlanValidations = {
  create: [
    body('restaurantId')
      .isMongoId()
      .withMessage('Invalid restaurant ID'),
    body('planType')
      .isIn(['weekly', 'bi-weekly'])
      .withMessage('Plan type must be weekly or bi-weekly'),
    body('startDate')
      .isISO8601()
      .withMessage('Invalid start date format'),
    body('endDate')
      .isISO8601()
      .withMessage('Invalid end date format'),
    body('deliveryAddress.street')
      .trim()
      .notEmpty()
      .withMessage('Street address is required'),
    body('deliveryAddress.city')
      .trim()
      .notEmpty()
      .withMessage('City is required'),
    body('deliveryAddress.province')
      .trim()
      .notEmpty()
      .withMessage('Province is required'),
    body('deliveryAddress.postalCode')
      .trim()
      .notEmpty()
      .withMessage('Postal code is required'),
    handleValidationErrors
  ]
};

// Query parameter validations
const queryValidations = {
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    handleValidationErrors
  ],
  
  search: [
    query('q')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Search query must be between 1 and 100 characters'),
    handleValidationErrors
  ]
};

module.exports = {
  handleValidationErrors,
  commonValidations,
  userValidations,
  restaurantValidations,
  menuItemValidations,
  orderValidations,
  reviewValidations,
  contactValidations,
  weeklyPlanValidations,
  queryValidations
};
