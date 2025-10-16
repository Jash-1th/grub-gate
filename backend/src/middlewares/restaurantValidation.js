const Restaurant = require('../models/Restaurant');
const User = require('../models/User');
const { errorResponse } = require('../utils/apiResponse');

/**
 * Validate restaurant delivery area
 * Checks if restaurant delivers to user's postal code
 */
const validateDeliveryArea = async (restaurantId, userPostalCode) => {
  try {
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return { isValid: false, message: 'Restaurant not found' };
    }

    // Check if restaurant has delivery settings
    if (!restaurant.deliverySettings || !restaurant.deliverySettings.deliveryRadius) {
      return { isValid: false, message: 'Restaurant delivery settings not configured' };
    }

    // For now, we'll use a simple postal code prefix match
    // In production, you'd use proper geocoding and distance calculation
    const restaurantPostalCode = restaurant.address?.postalCode;
    if (!restaurantPostalCode) {
      return { isValid: false, message: 'Restaurant postal code not available' };
    }

    // Simple validation: same first 3 characters of postal code (for Canadian postal codes)
    // You can enhance this with proper distance calculation
    const userPrefix = userPostalCode.replace(/\s/g, '').substring(0, 3).toUpperCase();
    const restaurantPrefix = restaurantPostalCode.replace(/\s/g, '').substring(0, 3).toUpperCase();
    
    const isInDeliveryArea = userPrefix === restaurantPrefix;
    
    return {
      isValid: isInDeliveryArea,
      message: isInDeliveryArea 
        ? 'Restaurant delivers to your area' 
        : `Restaurant does not deliver to ${userPostalCode}. Delivery area: ${restaurantPostalCode} region.`
    };
  } catch (error) {
    console.error('Error validating delivery area:', error);
    return { isValid: false, message: 'Error validating delivery area' };
  }
};

/**
 * Validate restaurant operating hours
 * Checks if restaurant is open during meal delivery times
 */
const validateOperatingHours = async (restaurantId, mealType) => {
  try {
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return { isValid: false, message: 'Restaurant not found' };
    }

    // Check if restaurant has operating hours
    if (!restaurant.operatingHours) {
      return { isValid: false, message: 'Restaurant operating hours not configured' };
    }

    const today = new Date().toLocaleDateString('en-US', { weekday: 'lowercase' });
    const todayHours = restaurant.operatingHours[today];
    
    if (!todayHours || todayHours.closed) {
      return { isValid: false, message: `Restaurant is closed on ${today}s` };
    }

    // Check if restaurant serves the requested meal type
    let mealServiceAvailable = false;
    let serviceMessage = '';

    if (mealType === 'lunch' && todayHours.lunch?.available) {
      mealServiceAvailable = true;
      serviceMessage = `Lunch service: ${todayHours.lunch.open} - ${todayHours.lunch.close}`;
    } else if (mealType === 'dinner' && todayHours.dinner?.available) {
      mealServiceAvailable = true;
      serviceMessage = `Dinner service: ${todayHours.dinner.open} - ${todayHours.dinner.close}`;
    } else {
      serviceMessage = `${mealType} service not available on ${today}s`;
    }

    return {
      isValid: mealServiceAvailable,
      message: serviceMessage
    };
  } catch (error) {
    console.error('Error validating operating hours:', error);
    return { isValid: false, message: 'Error validating operating hours' };
  }
};

/**
 * Validate dietary preferences consistency
 * Checks if all selected restaurants can accommodate user's dietary preferences
 */
const validateDietaryPreferences = async (restaurantIds, userDietaryPreferences) => {
  try {
    if (!userDietaryPreferences || userDietaryPreferences.length === 0) {
      return { isValid: true, message: 'No dietary preferences to validate' };
    }

    const restaurants = await Restaurant.find({ _id: { $in: restaurantIds } });
    const validationResults = [];

    for (const restaurant of restaurants) {
      const restaurantPreferences = restaurant.dietaryOptions || [];
      const unsupportedPreferences = userDietaryPreferences.filter(
        pref => !restaurantPreferences.includes(pref)
      );

      if (unsupportedPreferences.length > 0) {
        validationResults.push({
          restaurantId: restaurant._id,
          restaurantName: restaurant.name,
          isValid: false,
          unsupportedPreferences,
          message: `${restaurant.name} does not support: ${unsupportedPreferences.join(', ')}`
        });
      } else {
        validationResults.push({
          restaurantId: restaurant._id,
          restaurantName: restaurant.name,
          isValid: true,
          message: `${restaurant.name} supports all your dietary preferences`
        });
      }
    }

    const allValid = validationResults.every(result => result.isValid);
    
    return {
      isValid: allValid,
      message: allValid 
        ? 'All restaurants support your dietary preferences' 
        : 'Some restaurants do not support your dietary preferences',
      details: validationResults
    };
  } catch (error) {
    console.error('Error validating dietary preferences:', error);
    return { isValid: false, message: 'Error validating dietary preferences' };
  }
};

/**
 * Validate multi-restaurant selection
 * Comprehensive validation for multiple restaurant selection
 */
const validateMultiRestaurantSelection = async (req, res, next) => {
  try {
    const { restaurantIds, mealType } = req.body;
    const userId = req.user.id;

    // Get user information
    const user = await User.findById(userId);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    // Validate maximum restaurants limit (2 restaurants)
    if (restaurantIds && restaurantIds.length > 2) {
      return errorResponse(res, 'Maximum 2 restaurants allowed per meal plan', 400);
    }

    // Validate each restaurant
    const validationResults = {
      deliveryArea: [],
      operatingHours: [],
      dietaryPreferences: null,
      overall: { isValid: true, errors: [] }
    };

    // Validate delivery areas
    for (const restaurantId of restaurantIds || []) {
      const deliveryValidation = await validateDeliveryArea(restaurantId, user.address?.postalCode);
      validationResults.deliveryArea.push({
        restaurantId,
        ...deliveryValidation
      });

      if (!deliveryValidation.isValid) {
        validationResults.overall.isValid = false;
        validationResults.overall.errors.push(deliveryValidation.message);
      }
    }

    // Validate operating hours (if mealType is provided)
    if (mealType) {
      for (const restaurantId of restaurantIds || []) {
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
    if (user.dietaryPreferences && user.dietaryPreferences.length > 0) {
      const dietaryValidation = await validateDietaryPreferences(restaurantIds || [], user.dietaryPreferences);
      validationResults.dietaryPreferences = dietaryValidation;

      if (!dietaryValidation.isValid) {
        validationResults.overall.isValid = false;
        validationResults.overall.errors.push(dietaryValidation.message);
      }
    }

    // Attach validation results to request for use in controllers
    req.restaurantValidation = validationResults;

    // If validation fails, return error response
    if (!validationResults.overall.isValid) {
      return errorResponse(res, 'Restaurant validation failed', 400, {
        validation: validationResults
      });
    }

    next();
  } catch (error) {
    console.error('Error in multi-restaurant validation middleware:', error);
    return errorResponse(res, 'Validation error', 500);
  }
};

/**
 * Validate single restaurant selection (for backward compatibility)
 */
const validateSingleRestaurantSelection = async (req, res, next) => {
  try {
    const { restaurantId, mealType } = req.body;
    const userId = req.user.id;

    if (!restaurantId) {
      return next(); // Skip validation if no restaurant ID provided
    }

    // Convert single restaurant to array for validation
    req.body.restaurantIds = [restaurantId];
    
    // Use multi-restaurant validation
    return validateMultiRestaurantSelection(req, res, next);
  } catch (error) {
    console.error('Error in single restaurant validation middleware:', error);
    return errorResponse(res, 'Validation error', 500);
  }
};

module.exports = {
  validateDeliveryArea,
  validateOperatingHours,
  validateDietaryPreferences,
  validateMultiRestaurantSelection,
  validateSingleRestaurantSelection
};
