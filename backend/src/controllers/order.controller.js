// FILE: src/controllers/order.controller.js
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const User = require('../models/User');
const { 
  successResponse, 
  errorResponse,
  createdResponse,
  notFoundResponse,
  paginatedResponse
} = require('../utils/apiResponse');
const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * @desc    Get orders (customer orders or restaurant orders)
 * @route   GET /api/v1/orders
 * @access  Private
 */
const getOrders = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    status,
    type,
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
  // Admin can see all orders (no additional query filters)

  // Apply filters
  if (status) {
    query.status = status;
  }

  if (type) {
    query.type = type;
  }

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Execute query with pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const orders = await Order.find(query)
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit))
    .populate('customerId', 'firstName lastName email phone')
    .populate('restaurantId', 'name cuisine phone address')
    .populate('weeklyPlanId', 'planType startDate endDate');

  const total = await Order.countDocuments(query);

  const pagination = {
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(total / parseInt(limit)),
    totalItems: total
  };

  paginatedResponse(res, orders, pagination, 'Orders retrieved successfully');
});

/**
 * @desc    Get single order
 * @route   GET /api/v1/orders/:id
 * @access  Private
 */
const getOrder = asyncHandler(async (req, res) => {
  let query = { _id: req.params.id };

  // Add ownership filter based on user role
  if (req.user.role === 'customer') {
    query.customerId = req.user._id;
  } else if (req.user.role === 'partner') {
    const restaurants = await Restaurant.find({ ownerId: req.user._id }).select('_id');
    const restaurantIds = restaurants.map(r => r._id);
    query.restaurantId = { $in: restaurantIds };
  }

  const order = await Order.findOne(query)
    .populate('customerId', 'firstName lastName email phone')
    .populate('restaurantId', 'name cuisine phone address operatingHours')
    .populate('weeklyPlanId', 'planType startDate endDate')
    .populate('items.menuItemId', 'name description image');

  if (!order) {
    return notFoundResponse(res, 'Order not found');
  }

  successResponse(res, { order }, 'Order retrieved successfully');
});

/**
 * @desc    Create order
 * @route   POST /api/v1/orders
 * @access  Private (Customer)
 */
const createOrder = asyncHandler(async (req, res) => {
  const { restaurantId, items, deliveryAddress, specialInstructions, mealType, weeklyPlanId } = req.body;

  // Verify restaurant exists and is active
  const restaurant = await Restaurant.findOne({ _id: restaurantId, status: 'active' });
  if (!restaurant) {
    return notFoundResponse(res, 'Restaurant not found or inactive');
  }

  // Verify all menu items exist and are available
  const menuItemIds = items.map(item => item.menuItemId);
  const menuItems = await MenuItem.find({
    _id: { $in: menuItemIds },
    restaurantId,
    status: 'available'
  });

  if (menuItems.length !== items.length) {
    return errorResponse(res, 'Some menu items are not available', 400);
  }

  // Calculate order totals
  let subtotal = 0;
  const orderItems = items.map(item => {
    const menuItem = menuItems.find(mi => mi._id.toString() === item.menuItemId);
    const itemTotal = menuItem.price * item.quantity;
    subtotal += itemTotal;

    return {
      menuItemId: item.menuItemId,
      name: menuItem.name,
      price: menuItem.price,
      quantity: item.quantity,
      specialInstructions: item.specialInstructions || ''
    };
  });

  // Create order
  const order = new Order({
    customerId: req.user._id,
    restaurantId,
    type: weeklyPlanId ? 'weekly-plan' : 'single',
    items: orderItems,
    deliveryAddress,
    specialInstructions,
    mealType,
    weeklyPlanId
  });

  // Calculate totals
  order.calculateTotals(restaurant.deliverySettings.fee);

  await order.save();

  // Update menu item order counts
  for (const item of items) {
    const menuItem = await MenuItem.findById(item.menuItemId);
    if (menuItem) {
      await menuItem.incrementOrderCount(item.quantity);
    }
  }

  // Update restaurant total orders
  restaurant.totalOrders += 1;
  await restaurant.save();

  // Populate order for response
  await order.populate([
    { path: 'customerId', select: 'firstName lastName email phone' },
    { path: 'restaurantId', select: 'name cuisine phone' },
    { path: 'items.menuItemId', select: 'name description image' }
  ]);

  createdResponse(res, { order }, 'Order created successfully');
});

/**
 * @desc    Update order status
 * @route   PATCH /api/v1/orders/:id/status
 * @access  Private (Partner/Admin)
 */
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, notes } = req.body;
  const orderId = req.params.id;

  // Find order and verify ownership for partners
  let query = { _id: orderId };
  if (req.user.role === 'partner') {
    const restaurants = await Restaurant.find({ ownerId: req.user._id }).select('_id');
    const restaurantIds = restaurants.map(r => r._id);
    query.restaurantId = { $in: restaurantIds };
  }

  const order = await Order.findOne(query);
  if (!order) {
    return notFoundResponse(res, 'Order not found');
  }

  try {
    await order.updateStatus(status, notes);
    
    // Populate order for response
    await order.populate([
      { path: 'customerId', select: 'firstName lastName email phone' },
      { path: 'restaurantId', select: 'name cuisine phone' }
    ]);

    successResponse(res, { order }, 'Order status updated successfully');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
});

/**
 * @desc    Cancel order
 * @route   POST /api/v1/orders/:id/cancel
 * @access  Private
 */
const cancelOrder = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const orderId = req.params.id;

  // Build query based on user role
  let query = { _id: orderId };
  if (req.user.role === 'customer') {
    query.customerId = req.user._id;
  } else if (req.user.role === 'partner') {
    const restaurants = await Restaurant.find({ ownerId: req.user._id }).select('_id');
    const restaurantIds = restaurants.map(r => r._id);
    query.restaurantId = { $in: restaurantIds };
  }

  const order = await Order.findOne(query);
  if (!order) {
    return notFoundResponse(res, 'Order not found');
  }

  try {
    await order.cancel(reason);
    successResponse(res, { order }, 'Order cancelled successfully');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
});

/**
 * @desc    Get order tracking info
 * @route   GET /api/v1/orders/:id/tracking
 * @access  Private (Customer)
 */
const getOrderTracking = asyncHandler(async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.id,
    customerId: req.user._id
  }).populate('restaurantId', 'name phone address');

  if (!order) {
    return notFoundResponse(res, 'Order not found');
  }

  const trackingInfo = {
    orderId: order._id,
    orderNumber: order.orderNumber,
    status: order.status,
    deliveryStatus: order.deliveryStatus,
    estimatedDeliveryTime: order.estimatedDeliveryTime,
    deliveryTime: order.deliveryTime,
    restaurant: order.restaurantId,
    items: order.items.length,
    total: order.total
  };

  successResponse(res, { tracking: trackingInfo }, 'Order tracking retrieved successfully');
});

/**
 * @desc    Get order statistics
 * @route   GET /api/v1/orders/stats
 * @access  Private (Partner/Admin)
 */
const getOrderStats = asyncHandler(async (req, res) => {
  const { startDate, endDate, restaurantId } = req.query;

  // Default to last 30 days if no dates provided
  const end = endDate ? new Date(endDate) : new Date();
  const start = startDate ? new Date(startDate) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

  let matchQuery = {
    createdAt: { $gte: start, $lte: end }
  };

  // Add restaurant filter for partners
  if (req.user.role === 'partner') {
    const restaurants = await Restaurant.find({ ownerId: req.user._id }).select('_id');
    const restaurantIds = restaurants.map(r => r._id);
    matchQuery.restaurantId = { $in: restaurantIds };
  } else if (restaurantId) {
    matchQuery.restaurantId = mongoose.Types.ObjectId(restaurantId);
  }

  const stats = await Order.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$total' },
        averageOrderValue: { $avg: '$total' },
        cancelledOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
        },
        deliveredOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
        }
      }
    }
  ]);

  // Get daily order trends
  const dailyTrends = await Order.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        orders: { $sum: 1 },
        revenue: { $sum: '$total' }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);

  successResponse(res, {
    stats: stats[0] || {},
    dailyTrends
  }, 'Order statistics retrieved successfully');
});

module.exports = {
  getOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  cancelOrder,
  getOrderTracking,
  getOrderStats
};
