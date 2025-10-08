// FILE: src/controllers/orderGeneration.controller.js
const { 
  generateDailyOrders,
  generateOrdersForDay,
  getOrderGenerationStats
} = require('../services/orderGenerationService');
const { 
  successResponse, 
  errorResponse 
} = require('../utils/apiResponse');
const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * @desc    Generate daily orders from meal plans and subscriptions
 * @route   POST /api/v1/orders/generate/daily
 * @access  Private (Admin only)
 */
const generateTodaysOrders = asyncHandler(async (req, res) => {
  try {
    console.log(`🚀 Manual trigger: Generating today's orders by ${req.user.email}`);
    
    const result = await generateDailyOrders();
    
    if (result.success) {
      successResponse(res, {
        ordersGenerated: result.totalOrdersCreated,
        subscriptionOrders: result.subscriptionOrders,
        mealPlanOrders: result.mealPlanOrders,
        errors: result.errors,
        timestamp: result.timestamp
      }, `Successfully generated ${result.totalOrdersCreated} orders for today`);
    } else {
      errorResponse(res, result.error || 'Failed to generate daily orders', 500);
    }
  } catch (error) {
    console.error('Controller error in generateTodaysOrders:', error);
    errorResponse(res, 'Internal server error during order generation', 500);
  }
});

/**
 * @desc    Generate orders for a specific day (testing)
 * @route   POST /api/v1/orders/generate/day/:dayName
 * @access  Private (Admin only)
 */
const generateOrdersForSpecificDay = asyncHandler(async (req, res) => {
  try {
    const { dayName } = req.params;
    
    if (!dayName) {
      return errorResponse(res, 'Day name is required', 400);
    }
    
    const validDays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    if (!validDays.includes(dayName.toLowerCase())) {
      return errorResponse(res, `Invalid day name. Must be one of: ${validDays.join(', ')}`, 400);
    }
    
    console.log(`🧪 Test trigger: Generating orders for ${dayName} by ${req.user.email}`);
    
    const result = await generateOrdersForDay(dayName);
    
    if (result.success) {
      successResponse(res, {
        testDay: result.testDay,
        testDate: result.testDate,
        ordersGenerated: result.totalOrdersCreated,
        subscriptionOrders: result.subscriptionOrders,
        mealPlanOrders: result.mealPlanOrders,
        errors: result.errors,
        timestamp: result.timestamp
      }, `Successfully generated ${result.totalOrdersCreated} orders for ${dayName}`);
    } else {
      errorResponse(res, result.error || `Failed to generate orders for ${dayName}`, 500);
    }
  } catch (error) {
    console.error('Controller error in generateOrdersForSpecificDay:', error);
    errorResponse(res, 'Internal server error during order generation', 500);
  }
});

/**
 * @desc    Get order generation statistics
 * @route   GET /api/v1/orders/generate/stats
 * @access  Private (Admin/Partner)
 */
const getGenerationStats = asyncHandler(async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Validate date format if provided
    if (startDate && isNaN(Date.parse(startDate))) {
      return errorResponse(res, 'Invalid startDate format. Use YYYY-MM-DD', 400);
    }
    
    if (endDate && isNaN(Date.parse(endDate))) {
      return errorResponse(res, 'Invalid endDate format. Use YYYY-MM-DD', 400);
    }
    
    const result = await getOrderGenerationStats(startDate, endDate);
    
    if (result.success) {
      successResponse(res, result.stats, 'Order generation statistics retrieved successfully');
    } else {
      errorResponse(res, result.error || 'Failed to get order generation statistics', 500);
    }
  } catch (error) {
    console.error('Controller error in getGenerationStats:', error);
    errorResponse(res, 'Internal server error while fetching statistics', 500);
  }
});

/**
 * @desc    Get today's generated orders for a restaurant (Partner view)
 * @route   GET /api/v1/orders/generate/today
 * @access  Private (Partner)
 */
const getTodaysGeneratedOrders = asyncHandler(async (req, res) => {
  try {
    const Order = require('../models/Order');
    const Restaurant = require('../models/Restaurant');
    
    // Get partner's restaurants
    const restaurants = await Restaurant.find({ ownerId: req.user._id }).select('_id name');
    const restaurantIds = restaurants.map(r => r._id);
    
    if (restaurantIds.length === 0) {
      return successResponse(res, [], 'No restaurants found for this partner');
    }
    
    // Get today's generated orders
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const todaysOrders = await Order.find({
      restaurantId: { $in: restaurantIds },
      type: 'weekly-plan',
      createdAt: { $gte: today, $lt: tomorrow }
    })
    .populate('customerId', 'firstName lastName email phone')
    .populate('restaurantId', 'name')
    .sort({ createdAt: -1 });
    
    // Group by meal type and restaurant
    const groupedOrders = {
      total: todaysOrders.length,
      lunch: todaysOrders.filter(o => o.mealType === 'lunch').length,
      dinner: todaysOrders.filter(o => o.mealType === 'dinner').length,
      byRestaurant: {},
      orders: todaysOrders
    };
    
    // Group by restaurant
    restaurants.forEach(restaurant => {
      const restaurantOrders = todaysOrders.filter(o => 
        o.restaurantId._id.toString() === restaurant._id.toString()
      );
      
      groupedOrders.byRestaurant[restaurant.name] = {
        total: restaurantOrders.length,
        lunch: restaurantOrders.filter(o => o.mealType === 'lunch').length,
        dinner: restaurantOrders.filter(o => o.mealType === 'dinner').length,
        orders: restaurantOrders
      };
    });
    
    successResponse(res, groupedOrders, `Found ${todaysOrders.length} generated orders for today`);
    
  } catch (error) {
    console.error('Controller error in getTodaysGeneratedOrders:', error);
    errorResponse(res, 'Internal server error while fetching today\'s orders', 500);
  }
});

/**
 * @desc    Check if orders have been generated for today
 * @route   GET /api/v1/orders/generate/status
 * @access  Private (Admin/Partner)
 */
const getGenerationStatus = asyncHandler(async (req, res) => {
  try {
    const Order = require('../models/Order');
    const SubscriptionMealPlan = require('../models/SubscriptionMealPlan');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    // Check if any orders were generated today
    const todaysGeneratedOrders = await Order.countDocuments({
      type: 'weekly-plan',
      createdAt: { $gte: today, $lt: tomorrow }
    });
    
    // Check subscription plans that generated orders today
    const subscriptionPlansGenerated = await SubscriptionMealPlan.countDocuments({
      lastOrderGenerationDate: { $gte: today, $lt: tomorrow }
    });
    
    // Get active subscription plans that should generate orders
    const activeSubscriptionPlans = await SubscriptionMealPlan.countDocuments({
      status: 'active',
      planStartDate: { $lte: today },
      planEndDate: { $gte: today }
    });
    
    const status = {
      date: today.toDateString(),
      ordersGenerated: todaysGeneratedOrders,
      subscriptionPlansProcessed: subscriptionPlansGenerated,
      activeSubscriptionPlans: activeSubscriptionPlans,
      generationComplete: subscriptionPlansGenerated >= activeSubscriptionPlans,
      lastGeneration: null
    };
    
    // Get last generation time
    const lastGeneration = await SubscriptionMealPlan.findOne({
      lastOrderGenerationDate: { $exists: true }
    }).sort({ lastOrderGenerationDate: -1 });
    
    if (lastGeneration) {
      status.lastGeneration = lastGeneration.lastOrderGenerationDate;
    }
    
    successResponse(res, status, 'Order generation status retrieved successfully');
    
  } catch (error) {
    console.error('Controller error in getGenerationStatus:', error);
    errorResponse(res, 'Internal server error while checking generation status', 500);
  }
});

module.exports = {
  generateTodaysOrders,
  generateOrdersForSpecificDay,
  getGenerationStats,
  getTodaysGeneratedOrders,
  getGenerationStatus
};
