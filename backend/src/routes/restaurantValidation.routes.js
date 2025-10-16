const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { authMiddleware } = require('../middlewares/auth');
const { 
  validateDeliveryArea, 
  validateOperatingHours, 
  validateDietaryPreferences 
} = require('../middlewares/restaurantValidation');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const Restaurant = require('../models/Restaurant');
const User = require('../models/User');

const router = express.Router();

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 'Validation failed', 400, {
      errors: errors.array()
    });
  }
  next();
};

/**
 * @desc    Validate restaurant delivery area
 * @route   POST /api/v1/restaurant-validation/delivery-area
 * @access  Private (Customer)
 */
router.post('/delivery-area', [
  authMiddleware,
  body('restaurantId').isMongoId().withMessage('Valid restaurant ID is required'),
  body('postalCode').optional().isString().withMessage('Postal code must be a string'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { restaurantId, postalCode } = req.body;
    const userId = req.user.id;

    // Use provided postal code or get from user profile
    let userPostalCode = postalCode;
    if (!userPostalCode) {
      const user = await User.findById(userId);
      userPostalCode = user?.address?.postalCode;
    }

    if (!userPostalCode) {
      return errorResponse(res, 'Postal code is required', 400);
    }

    const validation = await validateDeliveryArea(restaurantId, userPostalCode);
    
    successResponse(res, {
      restaurantId,
      postalCode: userPostalCode,
      validation
    }, 'Delivery area validation completed');
  } catch (error) {
    console.error('Error validating delivery area:', error);
    errorResponse(res, 'Error validating delivery area', 500);
  }
});

/**
 * @desc    Validate restaurant operating hours
 * @route   POST /api/v1/restaurant-validation/operating-hours
 * @access  Private (Customer)
 */
router.post('/operating-hours', [
  authMiddleware,
  body('restaurantId').isMongoId().withMessage('Valid restaurant ID is required'),
  body('mealType').isIn(['lunch', 'dinner']).withMessage('Meal type must be lunch or dinner'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { restaurantId, mealType } = req.body;

    const validation = await validateOperatingHours(restaurantId, mealType);
    
    successResponse(res, {
      restaurantId,
      mealType,
      validation
    }, 'Operating hours validation completed');
  } catch (error) {
    console.error('Error validating operating hours:', error);
    errorResponse(res, 'Error validating operating hours', 500);
  }
});

/**
 * @desc    Validate dietary preferences
 * @route   POST /api/v1/restaurant-validation/dietary-preferences
 * @access  Private (Customer)
 */
router.post('/dietary-preferences', [
  authMiddleware,
  body('restaurantIds').isArray().withMessage('Restaurant IDs must be an array'),
  body('restaurantIds.*').isMongoId().withMessage('Each restaurant ID must be valid'),
  body('dietaryPreferences').optional().isArray().withMessage('Dietary preferences must be an array'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { restaurantIds, dietaryPreferences } = req.body;
    const userId = req.user.id;

    // Use provided dietary preferences or get from user profile
    let userDietaryPreferences = dietaryPreferences;
    if (!userDietaryPreferences) {
      const user = await User.findById(userId);
      userDietaryPreferences = user?.dietaryPreferences || [];
    }

    const validation = await validateDietaryPreferences(restaurantIds, userDietaryPreferences);
    
    successResponse(res, {
      restaurantIds,
      dietaryPreferences: userDietaryPreferences,
      validation
    }, 'Dietary preferences validation completed');
  } catch (error) {
    console.error('Error validating dietary preferences:', error);
    errorResponse(res, 'Error validating dietary preferences', 500);
  }
});

/**
 * @desc    Comprehensive multi-restaurant validation
 * @route   POST /api/v1/restaurant-validation/multi-restaurant
 * @access  Private (Customer)
 */
router.post('/multi-restaurant', [
  authMiddleware,
  body('restaurantIds').isArray().withMessage('Restaurant IDs must be an array'),
  body('restaurantIds.*').isMongoId().withMessage('Each restaurant ID must be valid'),
  body('restaurantIds').custom((value) => {
    if (value.length > 2) {
      throw new Error('Maximum 2 restaurants allowed');
    }
    return true;
  }),
  body('mealType').optional().isIn(['lunch', 'dinner']).withMessage('Meal type must be lunch or dinner'),
  body('postalCode').optional().isString().withMessage('Postal code must be a string'),
  body('dietaryPreferences').optional().isArray().withMessage('Dietary preferences must be an array'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { restaurantIds, mealType, postalCode, dietaryPreferences } = req.body;
    const userId = req.user.id;

    // Get user information
    const user = await User.findById(userId);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    const userPostalCode = postalCode || user.address?.postalCode;
    const userDietaryPreferences = dietaryPreferences || user.dietaryPreferences || [];

    // Comprehensive validation results
    const validationResults = {
      deliveryArea: [],
      operatingHours: [],
      dietaryPreferences: null,
      overall: { isValid: true, errors: [], warnings: [] }
    };

    // Validate delivery areas
    for (const restaurantId of restaurantIds) {
      if (userPostalCode) {
        const deliveryValidation = await validateDeliveryArea(restaurantId, userPostalCode);
        validationResults.deliveryArea.push({
          restaurantId,
          ...deliveryValidation
        });

        if (!deliveryValidation.isValid) {
          validationResults.overall.isValid = false;
          validationResults.overall.errors.push(deliveryValidation.message);
        }
      } else {
        validationResults.overall.warnings.push('No postal code available for delivery area validation');
      }
    }

    // Validate operating hours (if mealType is provided)
    if (mealType) {
      for (const restaurantId of restaurantIds) {
        const hoursValidation = await validateOperatingHours(restaurantId, mealType);
        validationResults.operatingHours.push({
          restaurantId,
          ...hoursValidation
        });

        if (!hoursValidation.isValid) {
          validationResults.overall.isValid = false;
          validationResults.overall.errors.push(hoursValidation.message);
        }
      }
    }

    // Validate dietary preferences
    if (userDietaryPreferences.length > 0) {
      const dietaryValidation = await validateDietaryPreferences(restaurantIds, userDietaryPreferences);
      validationResults.dietaryPreferences = dietaryValidation;

      if (!dietaryValidation.isValid) {
        validationResults.overall.isValid = false;
        validationResults.overall.errors.push(dietaryValidation.message);
      }
    }

    // Get restaurant details for response
    const restaurants = await Restaurant.find({ _id: { $in: restaurantIds } }).select('name address operatingHours dietaryOptions');

    successResponse(res, {
      restaurants,
      userInfo: {
        postalCode: userPostalCode,
        dietaryPreferences: userDietaryPreferences
      },
      validation: validationResults
    }, 'Multi-restaurant validation completed');
  } catch (error) {
    console.error('Error in multi-restaurant validation:', error);
    errorResponse(res, 'Error validating restaurants', 500);
  }
});

/**
 * @desc    Get restaurant validation requirements
 * @route   GET /api/v1/restaurant-validation/requirements/:restaurantId
 * @access  Private (Customer)
 */
router.get('/requirements/:restaurantId', [
  authMiddleware,
  handleValidationErrors
], async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return errorResponse(res, 'Restaurant not found', 404);
    }

    const requirements = {
      restaurantId,
      restaurantName: restaurant.name,
      deliveryArea: {
        available: !!restaurant.deliverySettings?.deliveryRadius,
        postalCode: restaurant.address?.postalCode,
        radius: restaurant.deliverySettings?.deliveryRadius
      },
      operatingHours: {
        available: !!restaurant.operatingHours,
        schedule: restaurant.operatingHours
      },
      dietaryOptions: {
        available: !!(restaurant.dietaryOptions && restaurant.dietaryOptions.length > 0),
        options: restaurant.dietaryOptions || []
      },
      minimumOrder: restaurant.deliverySettings?.minimumOrderValue || 0,
      deliveryFee: restaurant.deliverySettings?.deliveryFee || 0
    };

    successResponse(res, requirements, 'Restaurant validation requirements retrieved');
  } catch (error) {
    console.error('Error getting restaurant requirements:', error);
    errorResponse(res, 'Error getting restaurant requirements', 500);
  }
});

module.exports = router;
