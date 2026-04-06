// FILE: src/controllers/order.controller.js
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const User = require('../models/User');
const mongoose = require('mongoose');
const { 
  successResponse, 
  errorResponse,
  createdResponse,
  notFoundResponse,
  paginatedResponse
} = require('../utils/apiResponse');
const { asyncHandler } = require('../middlewares/errorHandler');
const pushNotificationService = require('../services/pushNotificationService');
const { calculateOrderTotals, DEFAULT_DELIVERY_FEE, DEFAULT_TAX_RATE } = require('../utils/pricingCalculator');

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
    .populate('restaurantId', 'name cuisine phone address rating reviewCount')
    .populate('weeklyPlanId', 'planType startDate endDate')
    .populate('items.menuItemId', 'name description image rating reviewCount');
  
  // Log specific item data to debug
  if (orders.length > 0 && orders[0].items) {
    console.log('DEBUG: First order items after population:', orders[0].items.map(item => ({
      name: item.name,
      menuItemIdExists: !!item.menuItemId,
      menuItemIdType: typeof item.menuItemId,
      menuItemIdRating: item.menuItemId?.rating,
      menuItemIdReviewCount: item.menuItemId?.reviewCount
    })));
  }

  const total = await Order.countDocuments(query);

  // Debug log to see what data is being sent
  if (orders.length > 0) {
    console.log('DEBUG: First order items structure:', orders[0].items.map(item => ({
      name: item.name,
      menuItemIdRating: item.menuItemId?.rating,
      menuItemIdReviewCount: item.menuItemId?.reviewCount
    })));
  }

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
    .populate('restaurantId', 'name cuisine phone address operatingHours rating reviewCount')
    .populate('weeklyPlanId', 'planType startDate endDate')
    .populate('items.menuItemId', 'name description image rating reviewCount');
  
  // Log specific item data to debug
  if (order && order.items) {
    console.log('DEBUG: Order items after population:', order.items.map(item => ({
      name: item.name,
      menuItemIdExists: !!item.menuItemId,
      menuItemIdType: typeof item.menuItemId,
      menuItemIdRating: item.menuItemId?.rating,
      menuItemIdReviewCount: item.menuItemId?.reviewCount
    })));
  }

  if (!order) {
    return notFoundResponse(res, 'Order not found');
  }

  // Debug log to see what data is being sent
  console.log('DEBUG: Order data being sent to frontend - Order ID:', order._id);
  
  // Log just the items to see the structure
  console.log('DEBUG: Order items structure:', order.items.map(item => ({
    name: item.name,
    menuItemIdRating: item.menuItemId?.rating,
    menuItemIdReviewCount: item.menuItemId?.reviewCount
  })));

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

  // Use unified pricing calculator
  const pricing = calculateOrderTotals({
    items: orderItems.map(item => ({ price: item.price, quantity: item.quantity })),
    restaurantDeliveryFee: restaurant.deliverySettings?.fee,
    planType: 'single'
  });

  // Use provided totals or calculated ones
  const finalSubtotal = subtotal || pricing.subtotal;
  const finalDeliveryFee = deliveryFee || pricing.deliveryFee;
  const finalServiceFee = pricing.serviceFee; // Always calculate service fee
  const finalTax = tax || pricing.tax;
  const finalTotal = total || pricing.total;

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
    { path: 'items.menuItemId', select: 'name description image category rating reviewCount' }
  ]);
  
  // Log specific item data to debug
  if (order && order.items) {
    console.log('DEBUG: New order items after population:', order.items.map(item => ({
      name: item.name,
      menuItemIdExists: !!item.menuItemId,
      menuItemIdType: typeof item.menuItemId,
      menuItemIdRating: item.menuItemId?.rating,
      menuItemIdReviewCount: item.menuItemId?.reviewCount
    })));
  }

  // Debug log to see what data is being sent
  console.log('DEBUG: New order data being sent to frontend - Order ID:', order._id);
  console.log('DEBUG: New order items structure:', order.items.map(item => ({
    name: item.name,
    menuItemIdRating: item.menuItemId?.rating,
    menuItemIdReviewCount: item.menuItemId?.reviewCount
  })));

  // Send push notifications for new order
  await sendNewOrderNotifications(order);

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
        
        // Find the meal calendar document for this customer and subscription
        const mealCalendar = await UserMealCalendar.findOne({
          userId: order.customerId,
          subscriptionId: order.weeklyPlanId
        });
        
        if (mealCalendar && mealCalendar.calendarEntries) {
          // Update matching calendar entries within the array
          let updatedCount = 0;
          const orderDate = new Date(order.scheduledDate);
          
          mealCalendar.calendarEntries.forEach(entry => {
            const entryDate = new Date(entry.date);
            
            // Match by date, meal type, AND order ID (order-specific sync)
            if (entryDate.toDateString() === orderDate.toDateString() && 
                entry.mealType === order.mealType &&
                entry.orderId && entry.orderId.toString() === order._id.toString()) {
              console.log(`🎯 Syncing meal: ${entry.mealName} from order ${order.orderNumber} to status "${status}"`);
              entry.status = status;
              updatedCount++;
            }
          });
          
          if (updatedCount > 0) {
            await mealCalendar.save();
            console.log(`🔄 Synced status "${status}" to ${updatedCount} meals in customer calendar for order ${order.orderNumber}`);
          } else {
            console.log(`⚠️ No matching meals found in calendar for order ${order.orderNumber} (Date: ${orderDate.toDateString()}, Type: ${order.mealType})`);
          }
        } else {
          console.log(`⚠️ No meal calendar found for customer ${order.customerId} and subscription ${order.weeklyPlanId}`);
        }
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

    // Send push notifications for status changes
    await sendOrderStatusNotifications(order, status);

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
    
    // Populate order for notifications
    await order.populate([
      { path: 'customerId', select: 'firstName lastName email phone' },
      { path: 'restaurantId', select: 'name cuisine phone ownerId' }
    ]);

    // Send cancellation notifications
    await sendOrderCancellationNotifications(order, req.user.role, reason);
    
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

/**
 * Send push notifications for new orders
 */
const sendNewOrderNotifications = async (order) => {
  try {
    console.log(`📱 Sending new order notifications for order ${order.orderNumber}`);

    // Send notification to customer (order confirmation)
    if (order.customerId) {
      const customerNotification = {
        title: '✅ Order Confirmed!',
        body: `Your order #${order.orderNumber} has been placed successfully and will be prepared soon.`,
        icon: '/icons/order-confirmed.png'
      };

      await pushNotificationService.sendToUser(
        order.customerId._id,
        customerNotification,
        {
          orderId: order._id.toString(),
          orderNumber: order.orderNumber,
          type: 'ORDER_CONFIRMED',
          action: 'view_order'
        }
      );
      console.log(`✅ Customer confirmation sent for order ${order.orderNumber}`);
    }

    // Send notification to partner (new order alert)
    if (order.restaurantId && order.restaurantId.ownerId) {
      const itemCount = order.items.reduce((sum, item) => sum + (item.quantity || 1), 0);
      const customerName = order.customerId ? 
        `${order.customerId.firstName || ''} ${order.customerId.lastName || ''}`.trim() : 
        'Customer';

      const partnerNotification = {
        title: '🔔 New Order Received!',
        body: `New order from ${customerName} - ${itemCount} items (₹${order.total.toFixed(2)})`,
        icon: '/icons/new-order.png',
        requireInteraction: true
      };

      await pushNotificationService.sendToUser(
        order.restaurantId.ownerId,
        partnerNotification,
        {
          orderId: order._id.toString(),
          orderNumber: order.orderNumber,
          customerName: customerName,
          itemCount: itemCount,
          total: order.total,
          type: 'NEW_ORDER',
          action: 'view_order',
          requireInteraction: 'true'
        }
      );
      console.log(`✅ Partner new order notification sent for order ${order.orderNumber}`);
    }
  } catch (error) {
    console.error('❌ Error sending new order notifications:', error);
    // Don't throw error to avoid breaking order creation
  }
};

/**
 * Send push notifications for order cancellation
 */
const sendOrderCancellationNotifications = async (order, cancelledBy, reason) => {
  try {
    console.log(`📱 Sending cancellation notifications for order ${order.orderNumber} (cancelled by ${cancelledBy})`);

    if (cancelledBy === 'customer') {
      // Customer cancelled - notify partner
      if (order.restaurantId && order.restaurantId.ownerId) {
        const customerName = order.customerId ? 
          `${order.customerId.firstName || ''} ${order.customerId.lastName || ''}`.trim() : 
          'Customer';

        const partnerNotification = {
          title: '❌ Order Cancelled',
          body: `${customerName} cancelled order #${order.orderNumber}${reason ? ` - Reason: ${reason}` : ''}`,
          icon: '/icons/order-cancelled.png'
        };

        await pushNotificationService.sendToUser(
          order.restaurantId.ownerId,
          partnerNotification,
          {
            orderId: order._id.toString(),
            orderNumber: order.orderNumber,
            customerName: customerName,
            reason: reason || 'No reason provided',
            type: 'ORDER_CANCELLED',
            action: 'view_order'
          }
        );
        console.log(`✅ Partner cancellation notification sent for order ${order.orderNumber}`);
      }
    } else if (cancelledBy === 'partner') {
      // Partner cancelled - notify customer
      if (order.customerId) {
        const restaurantName = order.restaurantId?.name || 'Restaurant';

        const customerNotification = {
          title: '❌ Order Cancelled',
          body: `Your order #${order.orderNumber} has been cancelled by ${restaurantName}${reason ? ` - Reason: ${reason}` : ''}`,
          icon: '/icons/order-cancelled.png'
        };

        await pushNotificationService.sendToUser(
          order.customerId._id,
          customerNotification,
          {
            orderId: order._id.toString(),
            orderNumber: order.orderNumber,
            restaurantName: restaurantName,
            reason: reason || 'No reason provided',
            type: 'ORDER_CANCELLED',
            action: 'view_order'
          }
        );
        console.log(`✅ Customer cancellation notification sent for order ${order.orderNumber}`);
      }
    }
  } catch (error) {
    console.error('❌ Error sending order cancellation notifications:', error);
    // Don't throw error to avoid breaking order cancellation
  }
};

/**
 * Send push notifications for order status changes
 */
const sendOrderStatusNotifications = async (order, newStatus) => {
  try {
    console.log(`📱 Sending notifications for order ${order.orderNumber} status change to ${newStatus}`);

    // Send notification to customer
    if (order.customerId) {
      const customerNotification = getCustomerNotificationForStatus(newStatus, order);
      if (customerNotification) {
        await pushNotificationService.sendToUser(
          order.customerId._id,
          customerNotification,
          {
            orderId: order._id.toString(),
            orderNumber: order.orderNumber,
            type: customerNotification.type
          }
        );
        console.log(`✅ Customer notification sent for order ${order.orderNumber}`);
      }
    }

    // Send notification to partner for certain statuses
    if (order.restaurantId && order.restaurantId.ownerId) {
      const partnerNotification = getPartnerNotificationForStatus(newStatus, order);
      if (partnerNotification) {
        await pushNotificationService.sendToUser(
          order.restaurantId.ownerId,
          partnerNotification,
          {
            orderId: order._id.toString(),
            orderNumber: order.orderNumber,
            type: partnerNotification.type
          }
        );
        console.log(`✅ Partner notification sent for order ${order.orderNumber}`);
      }
    }
  } catch (error) {
    console.error('❌ Error sending order status notifications:', error);
    // Don't throw error to avoid breaking order update
  }
};

/**
 * Get customer notification template for order status
 */
const getCustomerNotificationForStatus = (status, order) => {
  const templates = {
    confirmed: {
      type: 'ORDER_CONFIRMED',
      title: '✅ Order Confirmed!',
      body: `Your order #${order.orderNumber} has been confirmed and will be prepared soon.`,
      icon: '/icons/order-confirmed.png'
    },
    preparing: {
      type: 'ORDER_PREPARING',
      title: '🍳 Order Being Prepared',
      body: `Your delicious meal is being prepared by ${order.restaurantId?.name || 'the restaurant'}.`,
      icon: '/icons/cooking.png'
    },
    ready: {
      type: 'ORDER_READY',
      title: '📦 Order Ready!',
      body: `Your order #${order.orderNumber} is ready for pickup/delivery.`,
      icon: '/icons/order-ready.png'
    },
    delivered: {
      type: 'ORDER_DELIVERED',
      title: '🎉 Order Delivered!',
      body: 'Your order has been delivered. Enjoy your meal!',
      icon: '/icons/delivered.png'
    },
    cancelled: {
      type: 'ORDER_CANCELLED',
      title: '❌ Order Cancelled',
      body: `Your order #${order.orderNumber} has been cancelled.`,
      icon: '/icons/order-cancelled.png'
    }
  };

  return templates[status] || null;
};

/**
 * Get partner notification template for order status
 */
const getPartnerNotificationForStatus = (status, order) => {
  // Only send partner notifications for specific statuses
  if (status === 'delivered') {
    return {
      type: 'ORDER_COMPLETED',
      title: '✅ Order Completed',
      body: `Order #${order.orderNumber} has been successfully delivered to ${order.customerId?.firstName || 'customer'}.`,
      icon: '/icons/order-completed.png'
    };
  }

  return null;
};

module.exports = {
  getOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  cancelOrder,
  getOrderTracking,
  getOrderStats
};
