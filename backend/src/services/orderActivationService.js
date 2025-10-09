// FILE: src/services/orderActivationService.js
const Order = require('../models/Order');
const cron = require('node-cron');
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
    
    // Find orders scheduled for today that are still in 'scheduled' status
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

module.exports = {
  activateTodaysOrders,
  manualActivateOrdersForDate,
  getOrderStatusSummary,
  startOrderActivationCron,
  stopOrderActivationCron
};
