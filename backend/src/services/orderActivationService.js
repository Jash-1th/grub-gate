// FILE: src/services/orderActivationService.js
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const cron = require('node-cron');
const pushNotificationService = require('./pushNotificationService');
/**
 * Daily service to activate scheduled orders
 * Runs every day at 12:01 AM to activate orders for the current day
 */
const activateTodaysOrders = async () => {
  try {
    // Use UTC dates for consistent comparison
    const today = new Date();
    const todayUTC = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    todayUTC.setUTCHours(0, 0, 0, 0);
    const tomorrowUTC = new Date(todayUTC);
    tomorrowUTC.setUTCDate(todayUTC.getUTCDate() + 1);
    
    console.log(`🔄 [${new Date().toISOString()}] Activating scheduled orders for ${today.toDateString()}...`);
    
    // First, find the orders that will be activated (to send notifications)
    const ordersToActivate = await Order.find({
      status: 'scheduled',
      scheduledDate: {
        $gte: todayUTC,
        $lt: tomorrowUTC
      }
    }).populate('customerId', 'firstName lastName fullName');
    
    console.log(`📋 Found ${ordersToActivate.length} orders to activate for today`);
    
    // Update orders to pending status
    const result = await Order.updateMany(
      {
        status: 'scheduled',
        scheduledDate: {
          $gte: todayUTC,
          $lt: tomorrowUTC
        }
      },
      {
        status: 'pending',
        updatedAt: new Date()
      }
    );
    
    console.log(`✅ [${new Date().toISOString()}] Activated ${result.modifiedCount} scheduled orders for today`);
    
    // Send push notifications to restaurant partners
    if (ordersToActivate.length > 0) {
      console.log(`📱 Sending order activation notifications to partners...`);
      await sendOrderActivationNotifications(ordersToActivate);
    }
    
    // Also mark yesterday's pending orders as completed (if not already updated)
    const yesterdayUTC = new Date(todayUTC);
    yesterdayUTC.setUTCDate(todayUTC.getUTCDate() - 1);
    const yesterdayEndUTC = new Date(yesterdayUTC);
    yesterdayEndUTC.setUTCDate(yesterdayUTC.getUTCDate() + 1);
    
    const completedResult = await Order.updateMany(
      {
        status: 'pending',
        scheduledDate: {
          $gte: yesterdayUTC,
          $lt: yesterdayEndUTC
        }
      },
      {
        status: 'completed',
        updatedAt: new Date()
      }
    );
    
    console.log(`📋 [${new Date().toISOString()}] Marked ${completedResult.modifiedCount} yesterday's orders as completed`);
    
    return {
      activated: result.modifiedCount,
      completed: completedResult.modifiedCount
    };
    
  } catch (error) {
    console.error('💥 [Order Activation Service] Error activating scheduled orders:', error);
    throw error;
  }
};

/**
 * Manual activation function for testing
 */
const manualActivateOrdersForDate = async (targetDate) => {
  try {
    // Use UTC dates for consistent comparison
    const inputDate = new Date(targetDate);
    const dateUTC = new Date(inputDate.getFullYear(), inputDate.getMonth(), inputDate.getDate());
    dateUTC.setUTCHours(0, 0, 0, 0);
    const nextDayUTC = new Date(dateUTC);
    nextDayUTC.setUTCDate(dateUTC.getUTCDate() + 1);
    
    console.log(`🔧 [Manual] Activating orders for ${dateUTC.toDateString()}...`);
    
    const result = await Order.updateMany(
      {
        status: 'scheduled',
        scheduledDate: {
          $gte: dateUTC,
          $lt: nextDayUTC
        }
      },
      {
        status: 'pending',
        updatedAt: new Date()
      }
    );
    
    console.log(`✅ [Manual] Activated ${result.modifiedCount} orders for ${dateUTC.toDateString()}`);
    return result.modifiedCount;
    
  } catch (error) {
    console.error('💥 [Manual Activation] Error:', error);
    throw error;
  }
};

/**
 * Get order status summary for monitoring
 */
const getOrderStatusSummary = async () => {
  try {
    // Use UTC dates for consistent comparison
    const today = new Date();
    const todayUTC = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    todayUTC.setUTCHours(0, 0, 0, 0);
    const tomorrowUTC = new Date(todayUTC);
    tomorrowUTC.setUTCDate(todayUTC.getUTCDate() + 1);
    
    const summary = await Order.aggregate([
      {
        $facet: {
          todayOrders: [
            {
              $match: {
                scheduledDate: { $gte: todayUTC, $lt: tomorrowUTC }
              }
            },
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 }
              }
            }
          ],
          upcomingOrders: [
            {
              $match: {
                scheduledDate: { $gte: tomorrowUTC },
                status: 'scheduled'
              }
            },
            {
              $group: {
                _id: null,
                count: { $sum: 1 }
              }
            }
          ],
          totalOrders: [
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 }
              }
            }
          ]
        }
      }
    ]);
    
    return {
      date: today.toDateString(),
      summary: summary[0]
    };
    
  } catch (error) {
    console.error('💥 [Order Status Summary] Error:', error);
    throw error;
  }
};

/**
 * Start the cron job for daily order activation
 * Runs every day at 12:01 AM
 */
const startOrderActivationCron = () => {
  console.log('🚀 [Order Activation Service] Starting daily cron job...');
  
  // Schedule the task to run every day at 12:01 AM
  const task = cron.schedule('1 0 * * *', async () => {
    try {
      await activateTodaysOrders();
    } catch (error) {
      console.error('💥 [Cron Job] Order activation failed:', error);
    }
  }, {
    scheduled: false,
    timezone: 'America/Toronto' // Adjust timezone as needed
  });
  
  // Start the task
  task.start();
  console.log('✅ [Order Activation Service] Cron job started - will run daily at 12:01 AM');
  
  return task;
};

/**
 * Stop the cron job (for testing or shutdown)
 */
const stopOrderActivationCron = (task) => {
  if (task) {
    task.stop();
    console.log('🛑 [Order Activation Service] Cron job stopped');
  }
};

/**
 * Send push notifications to restaurant partners about activated orders
 */
const sendOrderActivationNotifications = async (orders) => {
  try {
    console.log(`📱 Processing ${orders.length} orders for partner notifications...`);
    
    // Group orders by restaurant
    const restaurantOrders = new Map();
    
    for (const order of orders) {
      const restaurantId = order.restaurantId.toString();
      
      if (!restaurantOrders.has(restaurantId)) {
        restaurantOrders.set(restaurantId, {
          orders: [],
          totalAmount: 0,
          itemCount: 0
        });
      }
      
      const data = restaurantOrders.get(restaurantId);
      data.orders.push(order);
      data.totalAmount += order.total || 0;
      data.itemCount += order.items?.length || 0;
    }
    
    console.log(`📊 Found ${restaurantOrders.size} restaurant(s) with orders today`);
    
    // Send notification to each restaurant owner
    for (const [restaurantId, data] of restaurantOrders) {
      try {
        console.log(`\n🏪 Processing restaurant: ${restaurantId}`);
        console.log(`   📦 Orders: ${data.orders.length}`);
        console.log(`   💰 Total: ₹${data.totalAmount.toFixed(2)}`);
        
        // Fetch restaurant with owner details
        const restaurant = await Restaurant.findById(restaurantId)
          .populate('ownerId', 'email fcmTokens firstName lastName');
        
        if (!restaurant) {
          console.log(`   ❌ Restaurant not found: ${restaurantId}`);
          continue;
        }
        
        if (!restaurant.ownerId) {
          console.log(`   ❌ Restaurant has no owner: ${restaurant.name}`);
          continue;
        }
        
        console.log(`   ✅ Restaurant: ${restaurant.name}`);
        console.log(`   👤 Owner: ${restaurant.ownerId.email}`);
        console.log(`   📱 FCM tokens: ${restaurant.ownerId.fcmTokens?.length || 0}`);
        
        // Get first order details for notification
        const firstOrder = data.orders[0];
        const customerName = firstOrder.customerId?.fullName || 
                           `${firstOrder.customerId?.firstName || ''} ${firstOrder.customerId?.lastName || ''}`.trim() ||
                           'Customer';
        
        // Create notification message
        const notification = {
          title: '🍽️ Orders Ready for Today!',
          body: data.orders.length === 1 
            ? `Today you have 1 order (₹${data.totalAmount.toFixed(2)})`
            : `Today you have ${data.orders.length} orders (₹${data.totalAmount.toFixed(2)})`
        };
        
        const notificationData = {
          type: 'ORDER_ACTIVATION',
          restaurantId: restaurantId,
          restaurantName: restaurant.name,
          orderCount: String(data.orders.length),
          totalAmount: String(data.totalAmount.toFixed(2)),
          itemCount: String(data.itemCount),
          date: new Date().toISOString().split('T')[0],
          action: 'view_orders'
        };
        
        console.log(`   📝 Notification:`, notification);
        console.log(`   📝 Data:`, notificationData);
        
        // Send notification
        const result = await pushNotificationService.sendToUser(
          restaurant.ownerId._id,
          notification,
          notificationData
        );
        
        if (result.success) {
          console.log(`   ✅ Notification sent successfully`);
        } else {
          console.log(`   ⚠️ Failed to send notification:`, result.error);
        }
        
      } catch (error) {
        console.error(`   ❌ Error sending notification for restaurant ${restaurantId}:`, error.message);
      }
    }
    
    console.log(`\n✅ Completed sending ${restaurantOrders.size} partner notifications`);
    
  } catch (error) {
    console.error('❌ Error in sendOrderActivationNotifications:', error);
    // Don't throw - we don't want to stop order activation if notifications fail
  }
};

module.exports = {
  activateTodaysOrders,
  manualActivateOrdersForDate,
  getOrderStatusSummary,
  startOrderActivationCron,
  stopOrderActivationCron
};
