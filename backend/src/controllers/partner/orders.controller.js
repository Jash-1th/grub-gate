// FILE: src/controllers/partner/orders.controller.js
const Order = require('../../models/Order');
const Restaurant = require('../../models/Restaurant');
const User = require('../../models/User');
const { validationResult } = require('express-validator');
const { createDateRange, getCurrentDateUTC } = require('../../utils/smartDateCalculator');
const pushNotificationService = require('../../services/pushNotificationService');

/**
 * Get today's orders for a partner restaurant
 */
const getTodaysOrders = async (req, res) => {
  try {
    console.log('🔍 ===== PARTNER ORDERS REQUEST =====');
    console.log('🔍 Partner ID:', req.user.id);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const partnerId = req.user.id;
    
    // Get partner's restaurant (check both partnerId and ownerId)
    const restaurant = await Restaurant.findOne({ 
      $or: [
        { partnerId: partnerId },
        { ownerId: partnerId }
      ]
    });
    if (!restaurant) {
      return res.status(404).json({
        status: 'error',
        message: 'Restaurant not found for this partner'
      });
    }

    // Get today's date range with proper timezone handling
    const today = new Date();
    const todayUTC = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    todayUTC.setUTCHours(0, 0, 0, 0);
    const tomorrowUTC = new Date(todayUTC);
    tomorrowUTC.setUTCDate(todayUTC.getUTCDate() + 1);

    // Find orders for today with status 'pending'
    const todaysOrders = await Order.find({
      restaurantId: restaurant._id,
      scheduledDate: {
        $gte: todayUTC,
        $lt: tomorrowUTC
      },
      status: 'pending'
    })
    .populate('customerId', 'firstName lastName email phone')
    .sort({ 'deliveryTime.estimated': 1 });

    // Group orders by meal type
    const ordersByMealType = {
      lunch: todaysOrders.filter(order => order.mealType === 'lunch'),
      dinner: todaysOrders.filter(order => order.mealType === 'dinner')
    };

    res.json({
      status: 'success',
      data: {
        restaurant: {
          id: restaurant._id,
          name: restaurant.name
        },
        date: today.toDateString(),
        totalOrders: todaysOrders.length,
        orders: todaysOrders,
        ordersByMealType: ordersByMealType
      }
    });

  } catch (error) {
    console.error('Error fetching today\'s orders:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch today\'s orders',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get orders for a specific date range
 */
const getOrdersByDateRange = async (req, res) => {
  try {
    console.log('🎯 getOrdersByDateRange: Called with query:', req.query);
    console.log('🎯 getOrdersByDateRange: User ID:', req.user.id);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const partnerId = req.user.id;
    const { startDate, endDate, status } = req.query;
    
    console.log('🎯 getOrdersByDateRange: Extracted params:', { startDate, endDate, status });
    
    // Get partner's restaurant (check both partnerId and ownerId)
    const restaurant = await Restaurant.findOne({ 
      $or: [
        { partnerId: partnerId },
        { ownerId: partnerId }
      ]
    });
    
    console.log('🎯 getOrdersByDateRange: Found restaurant:', restaurant ? restaurant._id : 'null');
    
    if (!restaurant) {
      return res.status(404).json({
        status: 'error',
        message: 'Restaurant not found for this partner'
      });
    }

    // Use smart date calculator for precise date range
    const { startOfDay, endOfDay } = createDateRange(startDate);
    const query = {
      restaurantId: restaurant._id,
      scheduledDate: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    };

    if (status) {
      query.status = status;
    }

    console.log('🎯 getOrdersByDateRange: MongoDB query:', JSON.stringify(query, null, 2));
    console.log('🎯 getOrdersByDateRange: Date range:', {
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString()
    });

    const orders = await Order.find(query)
      .populate('customerId', 'firstName lastName email phone')
      .sort({ scheduledDate: -1, 'deliveryTime.estimated': 1 });

    console.log('🎯 getOrdersByDateRange: Found', orders.length, 'orders');
    orders.forEach((order, index) => {
      console.log(`🎯 Order ${index + 1}: ${order._id} - ${order.scheduledDate ? order.scheduledDate.toDateString() : 'NO DATE'} - ${order.status} - ${order.items[0]?.name}`);
    });

    res.json({
      status: 'success',
      data: {
        restaurant: {
          id: restaurant._id,
          name: restaurant.name
        },
        dateRange: { startDate, endDate },
        totalOrders: orders.length,
        orders: orders
      }
    });

  } catch (error) {
    console.error('Error fetching orders by date range:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch orders',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update order status
 */
const updateOrderStatus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const partnerId = req.user.id;
    const { orderId } = req.params;
    const { status, notes } = req.body;
    
    // Get partner's restaurant (check both partnerId and ownerId)
    const restaurant = await Restaurant.findOne({ 
      $or: [
        { partnerId: partnerId },
        { ownerId: partnerId }
      ]
    });
    if (!restaurant) {
      return res.status(404).json({
        status: 'error',
        message: 'Restaurant not found for this partner'
      });
    }

    // Find and update order
    const order = await Order.findOne({
      _id: orderId,
      restaurantId: restaurant._id
    });

    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }

    // Store previous status for notification logic
    const previousStatus = order.status;

    // Update order status
    order.status = status;
    if (notes) {
      order.notes = notes;
    }
    order.updatedAt = new Date();

    // Add status history
    if (!order.statusHistory) {
      order.statusHistory = [];
    }
    order.statusHistory.push({
      status: status,
      timestamp: new Date(),
      notes: notes
    });

    await order.save();

    // 🔔 Send push notification to customer about status change
    try {
      await sendOrderStatusNotification(order, restaurant, previousStatus);
    } catch (notificationError) {
      console.error('❌ Failed to send notification, but order was updated:', notificationError);
      // Don't fail the request if notification fails
    }

    res.json({
      status: 'success',
      message: 'Order status updated successfully',
      data: {
        order: order
      }
    });

  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update order status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get order analytics for partner dashboard
 */
const getOrderAnalytics = async (req, res) => {
  try {
    const partnerId = req.user.id;
    
    // Get partner's restaurant (check both partnerId and ownerId)
    const restaurant = await Restaurant.findOne({ 
      $or: [
        { partnerId: partnerId },
        { ownerId: partnerId }
      ]
    });
    if (!restaurant) {
      return res.status(404).json({
        status: 'error',
        message: 'Restaurant not found for this partner'
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get various date ranges
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    // Aggregate order statistics
    const [todayStats, weekStats, monthStats] = await Promise.all([
      // Today's orders
      Order.aggregate([
        {
          $match: {
            restaurantId: restaurant._id,
            scheduledDate: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$total' }
          }
        }
      ]),
      
      // This week's orders
      Order.aggregate([
        {
          $match: {
            restaurantId: restaurant._id,
            scheduledDate: { $gte: weekStart, $lt: today }
          }
        },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: '$total' }
          }
        }
      ]),
      
      // This month's orders
      Order.aggregate([
        {
          $match: {
            restaurantId: restaurant._id,
            scheduledDate: { $gte: monthStart, $lt: today }
          }
        },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: '$total' }
          }
        }
      ])
    ]);

    res.json({
      status: 'success',
      data: {
        restaurant: {
          id: restaurant._id,
          name: restaurant.name
        },
        analytics: {
          today: todayStats,
          thisWeek: weekStats[0] || { totalOrders: 0, totalRevenue: 0 },
          thisMonth: monthStats[0] || { totalOrders: 0, totalRevenue: 0 }
        }
      }
    });

  } catch (error) {
    console.error('Error fetching order analytics:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch order analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Send push notification to customer when order status changes
 */
async function sendOrderStatusNotification(order, restaurant, previousStatus) {
  try {
    // Populate customer data if not already populated
    if (!order.customerId.firstName) {
      await order.populate('customerId', 'firstName lastName email fcmTokens');
    }

    const customer = order.customerId;
    const orderNumber = order.orderNumber || order._id.toString().slice(-6);
    const newStatus = order.status;

    // Only send notification if status actually changed
    if (previousStatus === newStatus) {
      console.log('ℹ️ Status unchanged, skipping notification');
      return;
    }

    console.log(`📤 Sending notification for order ${orderNumber}: ${previousStatus} → ${newStatus}`);

    // Determine notification template based on new status
    let notificationType = null;
    let customData = {
      orderNumber,
      orderId: order._id.toString(),
      restaurantName: restaurant.name,
      previousStatus,
      newStatus
    };

    // Map order status to notification templates
    switch (newStatus) {
      case 'confirmed':
        notificationType = 'ORDER_CONFIRMED';
        break;
      case 'preparing':
      case 'in_progress':
        notificationType = 'ORDER_PREPARING';
        break;
      case 'ready':
        notificationType = 'ORDER_READY';
        customData.deliveryType = order.deliveryType || 'pickup';
        customData.estimatedTime = order.estimatedDeliveryTime || '15-20 mins';
        break;
      case 'delivered':
      case 'completed':
        notificationType = 'ORDER_DELIVERED';
        break;
      case 'out-for-delivery':
        // Custom notification for out for delivery
        const deliveryNotification = {
          title: '🚗 Order On The Way!',
          body: `Your order from ${restaurant.name} is on its way to you.`,
          icon: '/icons/delivery.png',
          data: {
            type: 'ORDER_UPDATE',
            orderId: order._id.toString(),
            action: 'track_order'
          }
        };
        return await pushNotificationService.sendToUser(
          customer._id,
          deliveryNotification,
          customData
        );
      case 'cancelled':
        // Custom notification for cancellation
        const cancellationNotification = {
          title: '❌ Order Cancelled',
          body: `Your order #${orderNumber} from ${restaurant.name} has been cancelled.`,
          icon: '/icons/cancelled.png',
          data: {
            type: 'ORDER_CANCELLED',
            orderId: order._id.toString(),
            action: 'view_order'
          }
        };
        return await pushNotificationService.sendToUser(
          customer._id,
          cancellationNotification,
          customData
        );
      default:
        console.log(`ℹ️ No notification template for status: ${newStatus}`);
        return;
    }

    // Get notification template and send
    if (notificationType) {
      const notification = pushNotificationService.getNotificationTemplate(
        notificationType,
        customData
      );

      if (notification) {
        const result = await pushNotificationService.sendToUser(
          customer._id,
          notification,
          customData
        );

        if (result.success) {
          console.log(`✅ Notification sent successfully to customer ${customer.firstName} ${customer.lastName}`);
          console.log(`📊 Success: ${result.successCount || 1}, Failed: ${result.failureCount || 0}`);
        } else {
          console.error(`❌ Failed to send notification: ${result.error}`);
        }

        return result;
      }
    }
  } catch (error) {
    console.error('❌ Error in sendOrderStatusNotification:', error);
    throw error;
  }
}

module.exports = {
  getTodaysOrders,
  getOrdersByDateRange,
  updateOrderStatus,
  getOrderAnalytics
};
