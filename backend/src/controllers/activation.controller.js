// FILE: src/controllers/activation.controller.js
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * Activate restaurant and user after completing setup
 * POST /api/v1/activation/complete-setup
 */
const completeSetupActivation = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  
  try {
    console.log(`🚀 Activating setup for user: ${userId}`);
    
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if user is a partner
    if (!user.roles.includes('partner')) {
      return res.status(403).json({
        success: false,
        message: 'Only partner users can complete restaurant setup'
      });
    }
    
    // Find the restaurant associated with this user
    const restaurant = await Restaurant.findOne({ ownerId: userId });
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found for this user'
      });
    }
    
    // Check if setup is already complete
    if (user.status === 'active' && restaurant.status === 'active') {
      return res.status(200).json({
        success: true,
        message: 'Setup already completed',
        data: {
          user: {
            id: user._id,
            status: user.status,
            fullName: user.fullName
          },
          restaurant: {
            id: restaurant._id,
            name: restaurant.name,
            status: restaurant.status
          }
        }
      });
    }
    
    // Update user status to active
    user.status = 'active';
    await user.save();
    
    // Update restaurant status to active and mark registration as complete
    restaurant.status = 'active';
    restaurant.registrationComplete = true;
    restaurant.registrationStage = 3; // Completed all stages
    await restaurant.save();
    
    // Update the user's restaurantId reference if not already set
    if (!user.restaurantId) {
      user.restaurantId = restaurant._id;
      await user.save();
    }
    
    console.log(`✅ Successfully activated user ${userId} and restaurant ${restaurant._id}`);
    
    res.status(200).json({
      success: true,
      message: 'Restaurant setup completed successfully! Your restaurant is now active and ready to receive orders.',
      data: {
        user: {
          id: user._id,
          status: user.status,
          fullName: user.fullName,
          restaurantId: user.restaurantId
        },
        restaurant: {
          id: restaurant._id,
          name: restaurant.name,
          status: restaurant.status,
          registrationComplete: restaurant.registrationComplete,
          registrationStage: restaurant.registrationStage
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error in completeSetupActivation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete setup activation',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * Get activation status
 * GET /api/v1/activation/status
 */
const getActivationStatus = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  
  try {
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Find the restaurant if user is a partner
    let restaurant = null;
    if (user.roles.includes('partner')) {
      restaurant = await Restaurant.findOne({ ownerId: userId });
    }
    
    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          status: user.status,
          roles: user.roles,
          fullName: user.fullName,
          restaurantId: user.restaurantId
        },
        restaurant: restaurant ? {
          id: restaurant._id,
          name: restaurant.name,
          status: restaurant.status,
          registrationComplete: restaurant.registrationComplete,
          registrationStage: restaurant.registrationStage
        } : null,
        isActive: user.status === 'active' && (restaurant ? restaurant.status === 'active' : true)
      }
    });
    
  } catch (error) {
    console.error('❌ Error in getActivationStatus:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get activation status',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = {
  completeSetupActivation,
  getActivationStatus
};
