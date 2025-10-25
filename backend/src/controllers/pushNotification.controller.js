// FILE: src/controllers/pushNotification.controller.js
const User = require('../models/User');
const { validationResult } = require('express-validator');
const pushNotificationService = require('../services/pushNotificationService');

/**
 * @desc    Subscribe user to push notifications
 * @route   POST /api/v1/push-notifications/subscribe
 * @access  Private
 */
const subscribeToPushNotifications = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user._id;
    const { token, deviceType, deviceInfo, subscription } = req.body;

    console.log('🔍 DEBUG subscribe request:', {
      hasToken: !!token,
      hasSubscription: !!subscription,
      subscriptionKeys: subscription ? Object.keys(subscription) : []
    });

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Check if token already exists
    const existingTokenIndex = user.fcmTokens.findIndex(
      t => t.token === token
    );

    if (existingTokenIndex !== -1) {
      // Update existing token
      user.fcmTokens[existingTokenIndex].lastUsed = new Date();
      user.fcmTokens[existingTokenIndex].isActive = true;
      if (deviceType) user.fcmTokens[existingTokenIndex].deviceType = deviceType;
      if (deviceInfo) user.fcmTokens[existingTokenIndex].deviceInfo = deviceInfo;
      if (subscription) user.fcmTokens[existingTokenIndex].subscription = subscription;
    } else {
      // Add new token
      user.fcmTokens.push({
        token,
        deviceType: deviceType || 'web',
        deviceInfo: deviceInfo || {},
        subscription: subscription || null, // Store full push subscription for web push
        isActive: true,
        lastUsed: new Date(),
        createdAt: new Date()
      });
    }

    await user.save();

    console.log(`✅ Push subscription saved for user: ${user.email || user.phoneNumber}`);

    res.status(200).json({
      status: 'success',
      message: 'Successfully subscribed to push notifications',
      data: {
        subscription: {
          userId: user._id,
          tokenCount: user.fcmTokens.filter(t => t.isActive).length,
          deviceType: deviceType || 'web'
        }
      }
    });
  } catch (error) {
    console.error('❌ Error subscribing to push notifications:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to subscribe to push notifications',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Unsubscribe user from push notifications
 * @route   POST /api/v1/push-notifications/unsubscribe
 * @access  Private
 */
const unsubscribeFromPushNotifications = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user._id;
    const { token } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    if (token) {
      // Remove specific token
      user.fcmTokens = user.fcmTokens.filter(t => t.token !== token);
    } else {
      // Remove all tokens
      user.fcmTokens = [];
    }

    await user.save();

    console.log(`🗑️ Push subscription removed for user: ${user.email || user.phoneNumber}`);

    res.status(200).json({
      status: 'success',
      message: 'Successfully unsubscribed from push notifications',
      data: {
        remainingTokens: user.fcmTokens.length
      }
    });
  } catch (error) {
    console.error('❌ Error unsubscribing from push notifications:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to unsubscribe from push notifications',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get user's push notification subscriptions
 * @route   GET /api/v1/push-notifications/subscriptions
 * @access  Private
 */
const getUserSubscriptions = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select('fcmTokens preferences.notifications');
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    const activeTokens = user.fcmTokens.filter(t => t.isActive);

    res.status(200).json({
      status: 'success',
      data: {
        subscriptions: activeTokens.map(t => ({
          deviceType: t.deviceType,
          lastUsed: t.lastUsed,
          createdAt: t.createdAt
        })),
        notificationPreferences: user.preferences?.notifications || {
          email: true,
          sms: false,
          push: true
        },
        totalDevices: activeTokens.length
      }
    });
  } catch (error) {
    console.error('❌ Error fetching subscriptions:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch subscriptions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Send test notification to user
 * @route   POST /api/v1/push-notifications/test
 * @access  Private
 */
const sendTestNotification = async (req, res) => {
  try {
    const userId = req.user._id;
    const { message } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    const notification = {
      title: '🔔 Test Notification',
      body: message || 'This is a test notification from GrubGate!',
      icon: '/icons/logo192.png',
      badge: '/icons/logo192.png',
      data: {
        type: 'TEST',
        timestamp: new Date().toISOString()
      }
    };

    const result = await pushNotificationService.sendToUser(userId, notification, {
      test: true
    });

    if (result.success) {
      res.status(200).json({
        status: 'success',
        message: 'Test notification sent successfully',
        data: {
          successCount: result.successCount,
          failureCount: result.failureCount
        }
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'Failed to send test notification',
        error: result.error
      });
    }
  } catch (error) {
    console.error('❌ Error sending test notification:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to send test notification',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Update notification preferences
 * @route   PATCH /api/v1/push-notifications/preferences
 * @access  Private
 */
const updateNotificationPreferences = async (req, res) => {
  try {
    const userId = req.user._id;
    const { email, sms, push } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Update preferences
    if (!user.preferences) {
      user.preferences = {};
    }
    if (!user.preferences.notifications) {
      user.preferences.notifications = {};
    }

    if (typeof email === 'boolean') user.preferences.notifications.email = email;
    if (typeof sms === 'boolean') user.preferences.notifications.sms = sms;
    if (typeof push === 'boolean') user.preferences.notifications.push = push;

    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Notification preferences updated successfully',
      data: {
        preferences: user.preferences.notifications
      }
    });
  } catch (error) {
    console.error('❌ Error updating notification preferences:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update notification preferences',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  getUserSubscriptions,
  sendTestNotification,
  updateNotificationPreferences
};
