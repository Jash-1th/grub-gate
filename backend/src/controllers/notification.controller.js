const pushNotificationService = require('../services/pushNotificationService');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * Register FCM token for user
 */
const registerFCMToken = async (req, res) => {
  try {
    const { token, deviceType, deviceInfo } = req.body;
    const userId = req.user.id;

    if (!token) {
      return errorResponse(res, 'FCM token is required', 400);
    }

    // Find user and add FCM token
    const user = await User.findById(userId);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    await user.addFCMToken({
      token,
      deviceType: deviceType || 'web',
      deviceInfo: deviceInfo || {}
    });

    console.log(`✅ FCM token registered for user ${userId}`);
    
    return successResponse(res, {
      message: 'FCM token registered successfully'
    });
  } catch (error) {
    console.error('❌ Error registering FCM token:', error);
    return errorResponse(res, 'Failed to register FCM token', 500);
  }
};

/**
 * Remove FCM token for user
 */
const removeFCMToken = async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.user.id;

    if (!token) {
      return errorResponse(res, 'FCM token is required', 400);
    }

    const user = await User.findById(userId);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    await user.removeFCMToken(token);

    console.log(`🗑️ FCM token removed for user ${userId}`);
    
    return successResponse(res, {
      message: 'FCM token removed successfully'
    });
  } catch (error) {
    console.error('❌ Error removing FCM token:', error);
    return errorResponse(res, 'Failed to remove FCM token', 500);
  }
};

/**
 * Send test notification to user
 */
const sendTestNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, body, data } = req.body;

    const notification = {
      title: title || '🔔 Test Notification',
      body: body || 'This is a test notification from Grub Gate!',
      icon: '/icons/notification-icon.png'
    };

    const result = await pushNotificationService.sendToUser(userId, notification, {
      type: 'TEST',
      ...data
    });

    if (result.success) {
      return successResponse(res, {
        message: 'Test notification sent successfully',
        result
      });
    } else {
      return errorResponse(res, result.error || 'Failed to send notification', 400);
    }
  } catch (error) {
    console.error('❌ Error sending test notification:', error);
    return errorResponse(res, 'Failed to send test notification', 500);
  }
};

/**
 * Send notification to specific user (Admin only)
 */
const sendNotificationToUser = async (req, res) => {
  try {
    const { userId, notification, data } = req.body;

    if (!userId || !notification) {
      return errorResponse(res, 'User ID and notification are required', 400);
    }

    const result = await pushNotificationService.sendToUser(userId, notification, data);

    if (result.success) {
      return successResponse(res, {
        message: 'Notification sent successfully',
        result
      });
    } else {
      return errorResponse(res, result.error || 'Failed to send notification', 400);
    }
  } catch (error) {
    console.error('❌ Error sending notification to user:', error);
    return errorResponse(res, 'Failed to send notification', 500);
  }
};

/**
 * Send bulk notification to all customers (Admin only)
 */
const sendBulkNotificationToCustomers = async (req, res) => {
  try {
    const { notification, data } = req.body;

    if (!notification) {
      return errorResponse(res, 'Notification is required', 400);
    }

    const result = await pushNotificationService.sendToAllCustomers(notification, data);

    if (result.success) {
      return successResponse(res, {
        message: 'Bulk notification sent to customers successfully',
        result
      });
    } else {
      return errorResponse(res, result.error || 'Failed to send bulk notification', 400);
    }
  } catch (error) {
    console.error('❌ Error sending bulk notification to customers:', error);
    return errorResponse(res, 'Failed to send bulk notification', 500);
  }
};

/**
 * Send bulk notification to all partners (Admin only)
 */
const sendBulkNotificationToPartners = async (req, res) => {
  try {
    const { notification, data } = req.body;

    if (!notification) {
      return errorResponse(res, 'Notification is required', 400);
    }

    const result = await pushNotificationService.sendToAllPartners(notification, data);

    if (result.success) {
      return successResponse(res, {
        message: 'Bulk notification sent to partners successfully',
        result
      });
    } else {
      return errorResponse(res, result.error || 'Failed to send bulk notification', 400);
    }
  } catch (error) {
    console.error('❌ Error sending bulk notification to partners:', error);
    return errorResponse(res, 'Failed to send bulk notification', 500);
  }
};

/**
 * Update user notification preferences
 */
const updateNotificationPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const preferences = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { 
        $set: { 
          'notificationPreferences': {
            ...preferences
          }
        }
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    return successResponse(res, {
      message: 'Notification preferences updated successfully',
      preferences: user.notificationPreferences
    });
  } catch (error) {
    console.error('❌ Error updating notification preferences:', error);
    return errorResponse(res, 'Failed to update notification preferences', 500);
  }
};

/**
 * Get user notification preferences
 */
const getNotificationPreferences = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select('notificationPreferences fcmTokens');
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    return successResponse(res, {
      preferences: user.notificationPreferences,
      activeTokens: user.getActiveFCMTokens().length,
      totalTokens: user.fcmTokens.length
    });
  } catch (error) {
    console.error('❌ Error getting notification preferences:', error);
    return errorResponse(res, 'Failed to get notification preferences', 500);
  }
};

/**
 * Get notification templates (for frontend)
 */
const getNotificationTemplates = async (req, res) => {
  try {
    const templates = {
      customer: [
        {
          type: 'ORDER_CONFIRMED',
          title: '✅ Order Confirmed!',
          description: 'Sent when customer order is confirmed'
        },
        {
          type: 'ORDER_PREPARING',
          title: '🍳 Order Being Prepared',
          description: 'Sent when restaurant starts preparing order'
        },
        {
          type: 'ORDER_READY',
          title: '📦 Order Ready!',
          description: 'Sent when order is ready for pickup/delivery'
        },
        {
          type: 'ORDER_DELIVERED',
          title: '🎉 Order Delivered!',
          description: 'Sent when order is delivered'
        },
        {
          type: 'SUBSCRIPTION_REMINDER',
          title: '📅 Plan Your Meals',
          description: 'Reminder to plan meals for next week'
        }
      ],
      partner: [
        {
          type: 'NEW_ORDER',
          title: '🔔 New Order Received!',
          description: 'Sent when new order is received'
        },
        {
          type: 'ORDER_DEADLINE',
          title: '⏰ Order Deadline Approaching',
          description: 'Sent when order preparation deadline is near'
        },
        {
          type: 'DAILY_SUMMARY',
          title: '📊 Daily Summary',
          description: 'Daily performance summary'
        },
        {
          type: 'NEW_REVIEW',
          title: '⭐ New Review Received',
          description: 'Sent when customer leaves a review'
        }
      ]
    };

    return successResponse(res, { templates });
  } catch (error) {
    console.error('❌ Error getting notification templates:', error);
    return errorResponse(res, 'Failed to get notification templates', 500);
  }
};

/**
 * Send order-related notification
 */
const sendOrderNotification = async (req, res) => {
  try {
    const { orderId, type, recipientType } = req.body;

    // This will be called by order status update webhooks
    const Order = require('../models/Order');
    const order = await Order.findById(orderId).populate('customerId restaurantId');

    if (!order) {
      return errorResponse(res, 'Order not found', 404);
    }

    let notification, targetUserId;

    if (recipientType === 'customer') {
      targetUserId = order.customerId._id;
      notification = pushNotificationService.getNotificationTemplate(type, {
        orderNumber: order.orderNumber,
        restaurantName: order.restaurantId.name,
        total: order.totalCost,
        estimatedTime: order.deliveryTime?.estimated || '30 minutes'
      });
    } else if (recipientType === 'partner') {
      targetUserId = order.restaurantId.ownerId;
      notification = pushNotificationService.getNotificationTemplate(type, {
        customerName: order.customerId.fullName,
        orderNumber: order.orderNumber,
        itemCount: order.items.length,
        total: order.totalCost,
        timeRemaining: '30'
      });
    }

    if (!notification) {
      return errorResponse(res, 'Invalid notification type', 400);
    }

    const result = await pushNotificationService.sendToUser(targetUserId, notification, {
      orderId: orderId.toString(),
      type: type
    });

    if (result.success) {
      return successResponse(res, {
        message: 'Order notification sent successfully',
        result
      });
    } else {
      return errorResponse(res, result.error || 'Failed to send notification', 400);
    }
  } catch (error) {
    console.error('❌ Error sending order notification:', error);
    return errorResponse(res, 'Failed to send order notification', 500);
  }
};

module.exports = {
  registerFCMToken,
  removeFCMToken,
  sendTestNotification,
  sendNotificationToUser,
  sendBulkNotificationToCustomers,
  sendBulkNotificationToPartners,
  updateNotificationPreferences,
  getNotificationPreferences,
  getNotificationTemplates,
  sendOrderNotification
};
