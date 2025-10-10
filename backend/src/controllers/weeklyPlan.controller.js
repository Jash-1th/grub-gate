// FILE: src/controllers/weeklyPlan.controller.js
const SubscriptionMealPlan = require('../models/SubscriptionMealPlan');
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const { 
  successResponse, 
  errorResponse,
  createdResponse,
  notFoundResponse,
  paginatedResponse
} = require('../utils/apiResponse');
const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * @desc    Get weekly plans
 * @route   GET /api/v1/weekly-plans
 * @access  Private
 */
const getSubscriptionMealPlans = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    status,
    startDate,
    endDate,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  // Build query based on user role
  let query = {};
  
  if (req.user.role === 'customer') {
    query.customerId = req.user._id;
  } else if (req.user.role === 'partner') {
    // Get restaurants owned by this partner
    const restaurants = await Restaurant.find({ ownerId: req.user._id }).select('_id');
    const restaurantIds = restaurants.map(r => r._id);
    query.restaurantId = { $in: restaurantIds };
  }

  // Apply filters
  if (status) {
    query.status = status;
  }

  if (startDate || endDate) {
    query.planStartDate = {};
    if (startDate) query.planStartDate.$gte = new Date(startDate);
    if (endDate) query.planStartDate.$lte = new Date(endDate);
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Execute query with pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const weeklyPlans = await SubscriptionMealPlan.find(query)
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit))
    .populate('customerId', 'firstName lastName email phone')
    .populate('restaurantId', 'name cuisine phone address')
    .populate('subscriptionId', 'planName status');

  const total = await SubscriptionMealPlan.countDocuments(query);

  const pagination = {
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(total / parseInt(limit)),
    totalItems: total
  };

  paginatedResponse(res, weeklyPlans, pagination, 'Weekly plans retrieved successfully');
});

/**
 * @desc    Get single weekly plan
 * @route   GET /api/v1/weekly-plans/:id
 * @access  Private
 */
const getSubscriptionMealPlan = asyncHandler(async (req, res) => {
  let query = { _id: req.params.id };

  // Add ownership filter based on user role
  if (req.user.role === 'customer') {
    query.customerId = req.user._id;
  } else if (req.user.role === 'partner') {
    const restaurants = await Restaurant.find({ ownerId: req.user._id }).select('_id');
    const restaurantIds = restaurants.map(r => r._id);
    query.restaurantId = { $in: restaurantIds };
  }

  const weeklyPlan = await SubscriptionMealPlan.findOne(query)
    .populate('customerId', 'firstName lastName email phone')
    .populate('restaurantId', 'name cuisine phone address operatingHours')
    .populate('subscriptionId', 'planName status')
    .populate('generatedOrders', 'orderNumber status total deliveryTime');

  if (!weeklyPlan) {
    return notFoundResponse(res, 'Weekly plan not found');
  }

  successResponse(res, { weeklyPlan }, 'Weekly plan retrieved successfully');
});

/**
 * @desc    Create weekly plan
 * @route   POST /api/v1/weekly-plans
 * @access  Private (Customer)
 */
const createSubscriptionMealPlan = asyncHandler(async (req, res) => {
  const { 
    restaurantId, 
    planType, 
    startDate, 
    endDate, 
    deliveryAddress, 
    meals, 
    specialInstructions,
    subscriptionId 
  } = req.body;

  // Verify restaurant exists and is active
  const restaurant = await Restaurant.findOne({ _id: restaurantId, status: 'active' });
  if (!restaurant) {
    return notFoundResponse(res, 'Restaurant not found or inactive');
  }

  // Verify all menu items in meals exist and are available
  const allMenuItemIds = [];
  Object.values(meals).forEach(day => {
    if (day.lunch && day.lunch.menuItemId) allMenuItemIds.push(day.lunch.menuItemId);
    if (day.dinner && day.dinner.menuItemId) allMenuItemIds.push(day.dinner.menuItemId);
  });

  if (allMenuItemIds.length > 0) {
    const menuItems = await MenuItem.find({
      _id: { $in: allMenuItemIds },
      restaurantId,
      status: 'available'
    });

    if (menuItems.length !== allMenuItemIds.length) {
      return errorResponse(res, 'Some menu items are not available', 400);
    }
  }

  // Create weekly plan using the findOrCreateForUser method
  const weeklyPlan = await SubscriptionMealPlan.findOrCreateForUser(
    req.user._id,
    subscriptionId,
    restaurantId,
    planType
  );
  
  // Update with provided data
  if (deliveryAddress) {
    weeklyPlan.deliveryAddress = deliveryAddress;
  }
  if (specialInstructions) {
    weeklyPlan.specialInstructions = specialInstructions;
  }
  
  await weeklyPlan.save();

  // Populate for response
  await weeklyPlan.populate([
    { path: 'customerId', select: 'firstName lastName email phone' },
    { path: 'restaurantId', select: 'name cuisine phone' }
  ]);

  createdResponse(res, { weeklyPlan }, 'Weekly plan created successfully');
});

/**
 * @desc    Update weekly plan
 * @route   PATCH /api/v1/weekly-plans/:id
 * @access  Private (Customer)
 */
const updateSubscriptionMealPlan = asyncHandler(async (req, res) => {
  const weeklyPlan = await SubscriptionMealPlan.findOne({
    _id: req.params.id,
    customerId: req.user._id
  });

  if (!weeklyPlan) {
    return notFoundResponse(res, 'Weekly plan not found');
  }

  // Don't allow updates if orders have been generated
  if (weeklyPlan.isOrdersGenerated) {
    return errorResponse(res, 'Cannot update weekly plan after orders have been generated', 400);
  }

  // Update allowed fields
  const allowedFields = ['deliveryAddress', 'meals', 'specialInstructions'];
  const updates = {};
  
  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) {
      updates[key] = req.body[key];
    }
  });

  Object.assign(weeklyPlan, updates);
  await weeklyPlan.save();

  successResponse(res, { weeklyPlan }, 'Weekly plan updated successfully');
});

/**
 * @desc    Delete weekly plan
 * @route   DELETE /api/v1/weekly-plans/:id
 * @access  Private (Customer)
 */
const deleteSubscriptionMealPlan = asyncHandler(async (req, res) => {
  const weeklyPlan = await SubscriptionMealPlan.findOne({
    _id: req.params.id,
    customerId: req.user._id
  });

  if (!weeklyPlan) {
    return notFoundResponse(res, 'Weekly plan not found');
  }

  // Cancel the weekly plan instead of deleting
  await weeklyPlan.cancel('Deleted by customer');

  successResponse(res, null, 'Weekly plan cancelled successfully');
});

/**
 * @desc    Pause weekly plan
 * @route   POST /api/v1/weekly-plans/:id/pause
 * @access  Private (Customer)
 */
const pauseSubscriptionMealPlan = asyncHandler(async (req, res) => {
  const weeklyPlan = await SubscriptionMealPlan.findOne({
    _id: req.params.id,
    customerId: req.user._id
  });

  if (!weeklyPlan) {
    return notFoundResponse(res, 'Weekly plan not found');
  }

  try {
    await weeklyPlan.pause();
    successResponse(res, { weeklyPlan }, 'Weekly plan paused successfully');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
});

/**
 * @desc    Resume weekly plan
 * @route   POST /api/v1/weekly-plans/:id/resume
 * @access  Private (Customer)
 */
const resumeSubscriptionMealPlan = asyncHandler(async (req, res) => {
  const weeklyPlan = await SubscriptionMealPlan.findOne({
    _id: req.params.id,
    customerId: req.user._id
  });

  if (!weeklyPlan) {
    return notFoundResponse(res, 'Weekly plan not found');
  }

  try {
    await weeklyPlan.resume();
    successResponse(res, { weeklyPlan }, 'Weekly plan resumed successfully');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
});

/**
 * @desc    Generate orders for weekly plan
 * @route   POST /api/v1/weekly-plans/:id/generate-orders
 * @access  Private (Customer/Admin)
 */
const generateOrders = asyncHandler(async (req, res) => {
  let query = { _id: req.params.id };

  // Add ownership filter for customers
  if (req.user.role === 'customer') {
    query.customerId = req.user._id;
  }

  const weeklyPlan = await SubscriptionMealPlan.findOne(query);

  if (!weeklyPlan) {
    return notFoundResponse(res, 'Weekly plan not found');
  }

  try {
    await weeklyPlan.generateOrders();
    
    // Populate generated orders for response
    await weeklyPlan.populate('generatedOrders', 'orderNumber status total deliveryTime');
    
    successResponse(res, { 
      weeklyPlan,
      generatedOrders: weeklyPlan.generatedOrders 
    }, 'Orders generated successfully');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
});

/**
 * @desc    Add meal to weekly plan
 * @route   POST /api/v1/weekly-plans/:id/meals
 * @access  Private (Customer)
 */
const addMeal = asyncHandler(async (req, res) => {
  const { day, mealType, menuItemId, deliveryTime } = req.body;

  const weeklyPlan = await SubscriptionMealPlan.findOne({
    _id: req.params.id,
    customerId: req.user._id
  });

  if (!weeklyPlan) {
    return notFoundResponse(res, 'Weekly plan not found');
  }

  // Don't allow updates if orders have been generated
  if (weeklyPlan.isOrdersGenerated) {
    return errorResponse(res, 'Cannot modify weekly plan after orders have been generated', 400);
  }

  // Verify menu item exists and belongs to the same restaurant
  const menuItem = await MenuItem.findOne({
    _id: menuItemId,
    restaurantId: weeklyPlan.restaurantId,
    status: 'available'
  });

  if (!menuItem) {
    return notFoundResponse(res, 'Menu item not found or not available');
  }

  try {
    await weeklyPlan.addMeal(day, mealType, menuItem, deliveryTime);
    successResponse(res, { weeklyPlan }, 'Meal added to weekly plan successfully');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
});

/**
 * @desc    Remove meal from weekly plan
 * @route   DELETE /api/v1/weekly-plans/:id/meals/:day/:mealType
 * @access  Private (Customer)
 */
const removeMeal = asyncHandler(async (req, res) => {
  const { day, mealType } = req.params;

  const weeklyPlan = await SubscriptionMealPlan.findOne({
    _id: req.params.id,
    customerId: req.user._id
  });

  if (!weeklyPlan) {
    return notFoundResponse(res, 'Weekly plan not found');
  }

  // Don't allow updates if orders have been generated
  if (weeklyPlan.isOrdersGenerated) {
    return errorResponse(res, 'Cannot modify weekly plan after orders have been generated', 400);
  }

  try {
    await weeklyPlan.removeMeal(day, mealType);
    successResponse(res, { weeklyPlan }, 'Meal removed from weekly plan successfully');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
});

/**
 * @desc    Get weekly plans for restaurant (Partner view)
 * @route   GET /api/v1/restaurants/:restaurantId/weekly-plans
 * @access  Private (Partner)
 */
const getRestaurantSubscriptionMealPlans = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;
  const { status, startDate, endDate } = req.query;

  // Verify restaurant ownership
  const restaurant = await Restaurant.findOne({
    _id: restaurantId,
    ownerId: req.user._id
  });

  if (!restaurant) {
    return notFoundResponse(res, 'Restaurant not found');
  }

  const weeklyPlans = await SubscriptionMealPlan.getForRestaurant(restaurantId, status);

  successResponse(res, { weeklyPlans }, 'Restaurant weekly plans retrieved successfully');
});

/**
 * @desc    Get active weekly plans for customer
 * @route   GET /api/v1/weekly-plans/active
 * @access  Private (Customer)
 */
const getActiveSubscriptionMealPlans = asyncHandler(async (req, res) => {
  const weeklyPlans = await SubscriptionMealPlan.getActiveForCustomer(req.user._id);

  successResponse(res, { weeklyPlans }, 'Active weekly plans retrieved successfully');
});

module.exports = {
  getWeeklyPlans: getSubscriptionMealPlans,
  getWeeklyPlan: getSubscriptionMealPlan,
  createWeeklyPlan: createSubscriptionMealPlan,
  updateWeeklyPlan: updateSubscriptionMealPlan,
  deleteWeeklyPlan: deleteSubscriptionMealPlan,
  pauseWeeklyPlan: pauseSubscriptionMealPlan,
  resumeWeeklyPlan: resumeSubscriptionMealPlan,
  generateOrders,
  addMeal,
  removeMeal,
  getRestaurantWeeklyPlans: getRestaurantSubscriptionMealPlans,
  getActiveWeeklyPlans: getActiveSubscriptionMealPlans
};
