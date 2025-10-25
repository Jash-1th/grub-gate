// FILE: src/routes/pushNotification.routes.js
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  getUserSubscriptions,
  sendTestNotification,
  updateNotificationPreferences
} = require('../controllers/pushNotification.controller');

const { authMiddleware } = require('../middlewares/auth');

// Apply authentication to all routes
router.use(authMiddleware);

/**
 * @route   POST /api/v1/push-notifications/subscribe
 * @desc    Subscribe to push notifications
 * @access  Private
 */
router.post('/subscribe',
  [
    body('token')
      .notEmpty()
      .withMessage('FCM token is required')
      .isString()
      .withMessage('Token must be a string'),
    body('deviceType')
      .optional()
      .isIn(['web', 'android', 'ios'])
      .withMessage('Device type must be web, android, or ios'),
    body('deviceInfo')
      .optional()
      .isObject()
      .withMessage('Device info must be an object')
  ],
  subscribeToPushNotifications
);

/**
 * @route   POST /api/v1/push-notifications/unsubscribe
 * @desc    Unsubscribe from push notifications
 * @access  Private
 */
router.post('/unsubscribe',
  [
    body('token')
      .optional()
      .isString()
      .withMessage('Token must be a string')
  ],
  unsubscribeFromPushNotifications
);

/**
 * @route   GET /api/v1/push-notifications/subscriptions
 * @desc    Get user's push notification subscriptions
 * @access  Private
 */
router.get('/subscriptions', getUserSubscriptions);

/**
 * @route   POST /api/v1/push-notifications/test
 * @desc    Send test notification
 * @access  Private
 */
router.post('/test',
  [
    body('message')
      .optional()
      .isString()
      .withMessage('Message must be a string')
      .isLength({ max: 500 })
      .withMessage('Message cannot exceed 500 characters')
  ],
  sendTestNotification
);

/**
 * @route   PATCH /api/v1/push-notifications/preferences
 * @desc    Update notification preferences
 * @access  Private
 */
router.patch('/preferences',
  [
    body('email')
      .optional()
      .isBoolean()
      .withMessage('Email preference must be a boolean'),
    body('sms')
      .optional()
      .isBoolean()
      .withMessage('SMS preference must be a boolean'),
    body('push')
      .optional()
      .isBoolean()
      .withMessage('Push preference must be a boolean')
  ],
  updateNotificationPreferences
);

module.exports = router;
