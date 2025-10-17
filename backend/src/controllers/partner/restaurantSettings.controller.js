// FILE: src/controllers/partner/restaurantSettings.controller.js
const Restaurant = require('../../models/Restaurant');
const User = require('../../models/User');
const { 
  successResponse, 
  errorResponse,
  notFoundResponse
} = require('../../utils/apiResponse');
const { asyncHandler } = require('../../middlewares/errorHandler');

// Helper function to find restaurant by flexible ID (mock ID or ObjectId)
const findRestaurantById = async (id, ownerId) => {
  // If it's a mock ID like 'rest_001', use name-based mapping
  if (/^[a-zA-Z0-9_]+$/.test(id) && !/^[0-9a-fA-F]{24}$/.test(id)) {
    const restaurantMappings = {
      'rest_001': 'Bistro Montreal',
      'rest_002': 'Chez Laurent Premium',
      'rest_003': 'Bella Vista Italian',
      'rest_004': 'Ocean\'s Bounty Seafood',
      'rest_005': 'The Burger Joint',
      'abc_001': 'ABC Restaurant'
    };
    
    const restaurantName = restaurantMappings[id];
    if (restaurantName) {
      return await Restaurant.findOne({ name: restaurantName, ownerId: ownerId });
    }
    return null;
  }
  
  // If it's a MongoDB ObjectId, use findById with ownership check
  try {
    return await Restaurant.findOne({ _id: id, ownerId: ownerId });
  } catch (error) {
    return null;
  }
};

/**
 * @desc    Get current user's restaurant
 * @route   GET /api/v1/partner/restaurants/me
 * @access  Private (Partner)
 */
const getMyRestaurant = asyncHandler(async (req, res) => {
  // Find restaurant owned by the authenticated user
  const restaurant = await Restaurant.findOne({ ownerId: req.user._id });
  
  if (!restaurant) {
    return notFoundResponse(res, 'No restaurant found for this user');
  }

  successResponse(res, { restaurant }, 'Restaurant retrieved successfully');
});

/**
 * @desc    Get restaurant settings
 * @route   GET /api/v1/partner/restaurants/:restaurantId/settings
 * @access  Private (Partner)
 */
const getRestaurantSettings = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;

  // Verify restaurant ownership
  const restaurant = await findRestaurantById(restaurantId, req.user._id);
  
  if (!restaurant) {
    return notFoundResponse(res, 'Restaurant not found or access denied');
  }

  // Return restaurant settings
  const settings = {
    id: restaurant._id,
    name: restaurant.name,
    description: restaurant.description,
    cuisine: restaurant.cuisine,
    address: restaurant.address,
    phone: restaurant.phone,
    email: restaurant.email,
    website: restaurant.website,
    deliverySettings: restaurant.deliverySettings,
    operatingHours: restaurant.operatingHours,
    status: restaurant.status
  };

  successResponse(res, { settings }, 'Restaurant settings retrieved successfully');
});

/**
 * @desc    Update restaurant settings
 * @route   PATCH /api/v1/partner/restaurants/:restaurantId/settings
 * @access  Private (Partner)
 */
const updateRestaurantSettings = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;

  // Verify restaurant ownership
  const restaurant = await findRestaurantById(restaurantId, req.user._id);
  
  if (!restaurant) {
    return notFoundResponse(res, 'Restaurant not found or access denied');
  }

  // Validate and structure the update data
  const updateData = {};

  // Profile fields
  if (req.body.name) updateData.name = req.body.name.trim();
  if (req.body.description) updateData.description = req.body.description.trim();
  if (req.body.cuisine) {
    updateData.cuisine = Array.isArray(req.body.cuisine) ? req.body.cuisine : [req.body.cuisine];
  }
  if (req.body.phone) updateData.phone = req.body.phone.trim();
  if (req.body.email) updateData.email = req.body.email.trim().toLowerCase();
  if (req.body.website) updateData.website = req.body.website.trim();

  // Address fields
  if (req.body.address) {
    if (typeof req.body.address === 'string') {
      // If address is sent as a string, parse it or keep existing structure
      updateData.address = {
        ...restaurant.address,
        street: req.body.address
      };
    } else if (typeof req.body.address === 'object') {
      updateData.address = {
        ...restaurant.address,
        ...req.body.address
      };
    }
  }

  // Delivery settings
  if (req.body.deliverySettings) {
    updateData.deliverySettings = {
      ...restaurant.deliverySettings,
      ...req.body.deliverySettings
    };
  } else {
    // Handle individual delivery fields for backward compatibility
    if (req.body.deliveryRadius !== undefined || 
        req.body.deliveryFee !== undefined || 
        req.body.minOrderAmount !== undefined || 
        req.body.avgDeliveryTime !== undefined) {
      updateData.deliverySettings = {
        ...restaurant.deliverySettings,
        ...(req.body.deliveryRadius !== undefined && { radius: parseFloat(req.body.deliveryRadius) }),
        ...(req.body.deliveryFee !== undefined && { fee: parseFloat(req.body.deliveryFee) }),
        ...(req.body.minOrderAmount !== undefined && { minOrderAmount: parseFloat(req.body.minOrderAmount) }),
        ...(req.body.avgDeliveryTime !== undefined && { avgDeliveryTime: parseInt(req.body.avgDeliveryTime) })
      };
    }
  }

  // Operating hours
  if (req.body.operatingHours) {
    updateData.operatingHours = {
      ...restaurant.operatingHours,
      ...req.body.operatingHours
    };
  }

  // Update the restaurant
  const updatedRestaurant = await Restaurant.findOneAndUpdate(
    { _id: restaurant._id },
    updateData,
    { new: true, runValidators: true }
  );

  const settings = {
    id: updatedRestaurant._id,
    name: updatedRestaurant.name,
    description: updatedRestaurant.description,
    cuisine: updatedRestaurant.cuisine,
    address: updatedRestaurant.address,
    phone: updatedRestaurant.phone,
    email: updatedRestaurant.email,
    website: updatedRestaurant.website,
    deliverySettings: updatedRestaurant.deliverySettings,
    operatingHours: updatedRestaurant.operatingHours,
    status: updatedRestaurant.status
  };

  successResponse(res, { settings }, 'Restaurant settings updated successfully');
});

/**
 * @desc    Get user notification preferences
 * @route   GET /api/v1/partner/users/me/notification-preferences
 * @access  Private (Partner)
 */
const getNotificationPreferences = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  if (!user) {
    return notFoundResponse(res, 'User not found');
  }

  const preferences = user.notificationPreferences || {
    emailNotifications: true,
    smsNotifications: true,
    orderAlerts: true,
    customerMessages: true,
    systemUpdates: true
  };

  successResponse(res, { preferences }, 'Notification preferences retrieved successfully');
});

/**
 * @desc    Update user notification preferences
 * @route   PATCH /api/v1/partner/users/me/notification-preferences
 * @access  Private (Partner)
 */
const updateNotificationPreferences = asyncHandler(async (req, res) => {
  const { preferences } = req.body;

  if (!preferences || typeof preferences !== 'object') {
    return errorResponse(res, 'Invalid preferences data', 400);
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { 
      notificationPreferences: {
        emailNotifications: preferences.emailNotifications !== undefined ? preferences.emailNotifications : true,
        smsNotifications: preferences.smsNotifications !== undefined ? preferences.smsNotifications : true,
        orderAlerts: preferences.orderAlerts !== undefined ? preferences.orderAlerts : true,
        customerMessages: preferences.customerMessages !== undefined ? preferences.customerMessages : true,
        systemUpdates: preferences.systemUpdates !== undefined ? preferences.systemUpdates : true
      }
    },
    { new: true, runValidators: true }
  );

  if (!user) {
    return notFoundResponse(res, 'User not found');
  }

  successResponse(res, { preferences: user.notificationPreferences }, 'Notification preferences updated successfully');
});

/**
 * @desc    Get billing information (from restaurant)
 * @route   GET /api/v1/partner/users/me/billing
 * @access  Private (Partner)
 */
const getBillingInfo = asyncHandler(async (req, res) => {
  // Get billing info from restaurant instead of user
  const restaurant = await Restaurant.findOne({ ownerId: req.user._id }).select('billingInfo');
  
  if (!restaurant) {
    return notFoundResponse(res, 'Restaurant not found for this user');
  }

  successResponse(res, { billingInfo: restaurant.billingInfo || {} }, 'Billing information retrieved successfully');
});

/**
 * @desc    Update restaurant billing information
 * @route   PATCH /api/v1/partner/users/me/billing
 * @access  Private (Partner)
 */
const updateBillingInfo = asyncHandler(async (req, res) => {
  const { billingInfo } = req.body;

  // Clean up empty strings to null for enum fields
  const cleanBillingInfo = {
    ...billingInfo,
    bankAccountInfo: billingInfo.bankAccountInfo ? {
      ...billingInfo.bankAccountInfo,
      accountType: billingInfo.bankAccountInfo.accountType === '' ? null : billingInfo.bankAccountInfo.accountType
    } : null
  };

  // Update billing info in restaurant instead of user
  const restaurant = await Restaurant.findOneAndUpdate(
    { ownerId: req.user._id },
    { 
      $set: { 
        'billingInfo': cleanBillingInfo
      }
    },
    { new: true, runValidators: true }
  );

  if (!restaurant) {
    return notFoundResponse(res, 'Restaurant not found for this user');
  }

  successResponse(res, { billingInfo: restaurant.billingInfo }, 'Billing information updated successfully');
});

/**
 * @desc    Activate restaurant and user status
 * @route   PATCH /api/v1/partner/restaurants/:restaurantId/activate
 * @access  Private (Partner)
 */
const activateRestaurant = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;

  // Verify restaurant ownership
  const restaurant = await findRestaurantById(restaurantId, req.user._id);
  
  if (!restaurant) {
    return notFoundResponse(res, 'Restaurant not found or access denied');
  }

  // Update restaurant status to active and mark registration as complete
  const updatedRestaurant = await Restaurant.findOneAndUpdate(
    { _id: restaurant._id },
    { 
      status: 'active',
      registrationComplete: true,
      registrationStage: 3
    },
    { new: true, runValidators: true }
  );

  // Update user status to active as well
  const updatedUser = await User.findOneAndUpdate(
    { _id: req.user._id },
    { 
      status: 'active',
      registrationComplete: true,
      registrationStage: 3
    },
    { new: true, runValidators: true }
  );

  successResponse(res, {
    user: {
      id: updatedUser._id,
      status: updatedUser.status,
      registrationComplete: updatedUser.registrationComplete,
      registrationStage: updatedUser.registrationStage
    },
    restaurant: {
      id: updatedRestaurant._id,
      name: updatedRestaurant.name,
      status: updatedRestaurant.status,
      registrationComplete: updatedRestaurant.registrationComplete,
      registrationStage: updatedRestaurant.registrationStage
    }
  }, 'Restaurant and user activated successfully');
});

module.exports = {
  getMyRestaurant,
  getRestaurantSettings,
  updateRestaurantSettings,
  getNotificationPreferences,
  updateNotificationPreferences,
  getBillingInfo,
  updateBillingInfo,
  activateRestaurant
};
