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
    date,
    startDate,
    endDate,
    includeScheduled = 'true',
    sortBy = 'scheduledDate',
    sortOrder = 'desc'
  } = req.query;

  // Build query based on user role
  let query = {};
  
  if (req.user?.roles?.includes('partner') || req.user?.role === 'partner') {
    // Get the specific restaurant for this partner (not all restaurants)
    let restaurantId = req.user.restaurantId;
    let restaurant = null;
    
    // If restaurantId exists in user, validate it exists in database
    if (restaurantId) {
      restaurant = await Restaurant.findById(restaurantId).select('_id name ownerId');
      
      // If restaurant doesn't exist or partner doesn't own it, clear invalid restaurantId
      if (!restaurant || restaurant.ownerId.toString() !== req.user._id.toString()) {
        console.log('⚠️ Invalid restaurantId in user record:', restaurantId);
        restaurantId = null;
        restaurant = null;
        
        // Clear invalid restaurantId from user record
        const User = require('../models/User');
        await User.findByIdAndUpdate(req.user._id, { $unset: { restaurantId: 1 } });
      }
    }
    
    // If no valid restaurantId, find the restaurant by ownerId
    if (!restaurantId) {
      restaurant = await Restaurant.findOne({ ownerId: req.user._id }).select('_id name');
      if (restaurant) {
        restaurantId = restaurant._id;
        // Update user's restaurantId for future requests
        const User = require('../models/User');
        await User.findByIdAndUpdate(req.user._id, { restaurantId: restaurant._id });
      }
    }
    
    if (!restaurantId || !restaurant) {
      return res.status(404).json({
        status: 'error',
        message: 'No restaurant found for this partner'
      });
    }
    
    // Filter by specific restaurant only
    query.restaurantId = restaurantId;
    
    // Debug logging
    console.log('🏪 Partner orders query - Partner ID:', req.user._id);
    console.log('🏪 Partner restaurant:', restaurant.name);
    console.log('🏪 Specific restaurant ID:', restaurantId);
    console.log('🏪 Final query restaurantId filter:', query.restaurantId);
  } else if (req.user?.roles?.includes('customer') || req.user?.role === 'customer') {
    query.customerId = req.user._id;
  }
  // Admin can see all orders (no additional query filters)

  // Apply filters
  if (status) {
    query.status = status;
  } else if (includeScheduled === 'true') {
    // Include all statuses by default (scheduled, pending, completed, etc.)
    query.status = { $in: ['scheduled', 'pending', 'confirmed', 'preparing', 'ready', 'out-for-delivery', 'delivered', 'completed', 'cancelled'] };
  }

  if (type) {
    query.type = type;
  }

  // Date filtering - use scheduledDate for better future/past order support
  if (date) {
    // Parse date as UTC to avoid timezone issues
    const targetDate = new Date(date + 'T00:00:00.000Z');
    const startOfDay = new Date(targetDate);
    const endOfDay = new Date(targetDate);
    endOfDay.setUTCHours(23, 59, 59, 999);
    
    // Use scheduledDate for filtering (supports future orders)
    query.scheduledDate = {
      $gte: startOfDay,
      $lte: endOfDay
    };
  } else if (startDate || endDate) {
    // Date range filtering - use scheduledDate for consistency
    query.scheduledDate = {};
    if (startDate) {
      const startOfDay = new Date(startDate + 'T00:00:00.000Z');
      query.scheduledDate.$gte = startOfDay;
    }
    if (endDate) {
      const endOfDay = new Date(endDate + 'T00:00:00.000Z');
      endOfDay.setUTCHours(23, 59, 59, 999);
      query.scheduledDate.$lte = endOfDay;
    }
  }

  // Debug logging BEFORE query execution for partner orders
  console.log('🚨 ALWAYS VISIBLE - User role:', req.user?.role);
  console.log('🚨 ALWAYS VISIBLE - User roles array:', req.user?.roles);
  console.log('🚨 ALWAYS VISIBLE - Request URL:', req.originalUrl);
  
  const isPartner = req.user?.roles?.includes('partner') || req.user?.role === 'partner';
  console.log('🚨 ALWAYS VISIBLE - Is Partner:', isPartner);
  
  if (isPartner) {
    console.log('🔍🔍🔍 PARTNER DEBUG START 🔍🔍🔍');
    console.log('🔍 PRE-QUERY DEBUG - TIMESTAMP:', new Date().toISOString());
    console.log('🔍 Partner ID:', req.user._id);
    console.log('🔍 Expected Restaurant ID:', query.restaurantId);
    console.log('🔍 Query that will be executed:', JSON.stringify(query, null, 2));
    console.log('🔍 Date filter:', req.query.date);
    console.log('🔍 Request URL:', req.originalUrl);
    console.log('🔍🔍🔍 PARTNER DEBUG END 🔍🔍🔍');
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Execute query with pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const orders = await Order.find(query)
    .skip(skip)
    .limit(parseInt(limit))
    .sort(sort)
    .populate('customerId', 'firstName lastName email phone')
    .populate('restaurantId', 'name cuisine phone address')
    .populate('weeklyPlanId', 'planType startDate endDate');

  const total = await Order.countDocuments(query);

  // Debug logging for partner orders
  if (req.user?.roles?.includes('partner') || req.user?.role === 'partner') {
    console.log('🔍 PARTNER ORDERS DEBUG - TIMESTAMP:', new Date().toISOString());
    console.log('  Partner ID:', req.user._id);
    console.log('  Expected Restaurant ID:', query.restaurantId);
    console.log('  Query filters:', JSON.stringify(query, null, 2));
    console.log('  Orders found:', orders.length);
    console.log('  Date filter:', req.query.date);
    
    orders.forEach((order, i) => {
      console.log('  Order ' + (i + 1) + ':');
      console.log('    ID:', order._id);
      console.log('    Restaurant ID:', order.restaurantId);
      console.log('    Expected Restaurant ID:', query.restaurantId);
      console.log('    Restaurant Match:', order.restaurantId?._id?.toString() === query.restaurantId?.toString());
      console.log('    Scheduled Date:', order.scheduledDate?.toISOString());
      console.log('    Status:', order.status);
      console.log('    Type:', order.type);
      console.log('    🚨 SECURITY CHECK: This order should NOT appear if Restaurant Match is false!');
    });
    
    // Additional security check
    const invalidOrders = orders.filter(order => 
      order.restaurantId?._id?.toString() !== query.restaurantId?.toString()
    );
    
    if (invalidOrders.length > 0) {
      console.log('🚨🚨🚨 SECURITY BREACH DETECTED! 🚨🚨🚨');
      console.log('  Invalid orders found:', invalidOrders.length);
      console.log('  These orders belong to different restaurants!');
      invalidOrders.forEach((order, i) => {
        console.log('    Invalid Order ' + (i + 1) + ':', order._id, 'belongs to', order.restaurantId);
      });
    }
  }

  const pagination = {
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(total / parseInt(limit)),
    totalItems: total
  };

  // Add cache-busting headers and timestamp for debugging
  if (req.user?.roles?.includes('partner') || req.user?.role === 'partner') {
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'X-Debug-Timestamp': new Date().toISOString()
    });
  }
  
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
  const { 
    restaurantId, 
    items, 
    deliveryAddress, 
    specialInstructions, 
    mealType, 
    weeklyPlanId,
    paymentMethod = 'card',
    paymentStatus = 'paid',
    orderType = 'single',
    subtotal,
    deliveryFee,
    tax,
    total
  } = req.body;

  // Validate required fields
  if (!restaurantId || !items || !Array.isArray(items) || items.length === 0) {
    return errorResponse(res, 'Restaurant ID and items are required', 400);
  }

  if (!deliveryAddress || !deliveryAddress.street || !deliveryAddress.city || !deliveryAddress.postalCode) {
    return errorResponse(res, 'Complete delivery address is required', 400);
  }

  // Verify restaurant exists and is active
  const restaurant = await Restaurant.findOne({ _id: restaurantId, status: 'active' });
  if (!restaurant) {
    return notFoundResponse(res, 'Restaurant not found or inactive');
  }

  // Verify delivery address is within restaurant's delivery zone
  if (deliveryAddress.coordinates) {
    const canDeliver = restaurant.deliversTo(deliveryAddress.coordinates);
    if (!canDeliver) {
      return errorResponse(res, 'Restaurant does not deliver to this address', 400);
    }
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

  // Calculate order totals if not provided
  let calculatedSubtotal = 0;
  const orderItems = items.map(item => {
    const menuItem = menuItems.find(mi => mi._id.toString() === item.menuItemId);
    if (!menuItem) {
      throw new Error(`Menu item ${item.menuItemId} not found`);
    }
    
    const quantity = item.quantity || 1;
    const itemTotal = menuItem.price * quantity;
    calculatedSubtotal += itemTotal;

    return {
      menuItemId: item.menuItemId,
      name: item.name || menuItem.name,
      price: item.price || menuItem.price,
      quantity: quantity,
      specialInstructions: item.specialInstructions || ''
    };
  });

  // Use provided totals or calculate them
  const finalSubtotal = subtotal || calculatedSubtotal;
  const finalDeliveryFee = deliveryFee || restaurant.deliverySettings?.fee || 2.99;
  const finalTax = tax || (finalSubtotal * 0.13); // 13% tax (adjust based on location)
  const finalTotal = total || (finalSubtotal + finalDeliveryFee + finalTax);

  // Generate unique order number
  const orderNumber = `GG${Date.now()}${Math.floor(Math.random() * 1000)}`;

  // Create order
  const order = new Order({
    orderNumber,
    customerId: req.user._id,
    restaurantId,
    type: orderType,
    isSubscriptionOrder: orderType === 'subscription',
    items: orderItems,
    subtotal: finalSubtotal,
    deliveryFee: finalDeliveryFee,
    tax: finalTax,
    total: finalTotal,
    status: paymentStatus === 'paid' ? 'pending' : 'scheduled',
    paymentStatus,
    paymentMethod,
    deliveryAddress: {
      street: deliveryAddress.street,
      city: deliveryAddress.city,
      province: deliveryAddress.province,
      postalCode: deliveryAddress.postalCode,
      instructions: deliveryAddress.instructions || ''
    },
    specialInstructions: specialInstructions || '',
    mealType,
    weeklyPlanId,
    scheduledDate: new Date(),
    activationDate: new Date(),
    estimatedDeliveryTime: restaurant.deliverySettings?.avgDeliveryTime || 30
  });

  await order.save();

  // Update menu item order counts
  for (const item of items) {
    const menuItem = await MenuItem.findById(item.menuItemId);
    if (menuItem) {
      if (typeof menuItem.incrementOrderCount === 'function') {
        await menuItem.incrementOrderCount(item.quantity || 1);
      } else {
        // Fallback if method doesn't exist
        menuItem.orderCount = (menuItem.orderCount || 0) + (item.quantity || 1);
        await menuItem.save();
      }
    }
  }

  // Update restaurant total orders
  restaurant.totalOrders = (restaurant.totalOrders || 0) + 1;
  await restaurant.save();

  // Populate order for response
  await order.populate([
    { path: 'customerId', select: 'firstName lastName email phone phoneNumber' },
    { path: 'restaurantId', select: 'name cuisine phone address' },
    { path: 'items.menuItemId', select: 'name description image category' }
  ]);

  // TODO: Send notification emails/SMS
  // TODO: Notify restaurant of new order
  // TODO: Process payment if not already processed

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
  if (req.user?.roles?.includes('partner') || req.user?.role === 'partner') {
    const restaurants = await Restaurant.find({ ownerId: req.user._id }).select('_id');
    const restaurantIds = restaurants.map(r => r._id);
    query.restaurantId = { $in: restaurantIds };
    
    console.log(`🔐 Partner ${req.user._id} updating order ${orderId} - Restaurant validation applied`);
  }

  const order = await Order.findOne(query);
  if (!order) {
    return notFoundResponse(res, 'Order not found');
  }

  try {
    await order.updateStatus(status, notes);
    
    // Sync status to customer meal calendar for subscription orders
    if (order.isScheduledOrder && order.weeklyPlanId) {
      try {
        const UserMealCalendar = require('../models/UserMealCalendar');
        
        // Update corresponding meals in customer's meal calendar
        const updateResult = await UserMealCalendar.updateMany(
          {
            customerId: order.customerId,
            weeklyPlanId: order.weeklyPlanId,
            scheduledDate: order.scheduledDate,
            mealType: order.mealType
          },
          {
            $set: { status: status }
          }
        );
        
        console.log(`🔄 Synced status "${status}" to ${updateResult.modifiedCount} meals in customer calendar for order ${order.orderNumber}`);
      } catch (syncError) {
        console.error('⚠️ Failed to sync status to meal calendar:', syncError);
        // Don't fail the order update if calendar sync fails
      }
    }
    
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
