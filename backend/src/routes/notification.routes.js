const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/notification.controller');

const { authMiddleware, roleMiddleware } = require('../middlewares/auth');

// All routes require authentication
router.use(authMiddleware);

// FCM Token Management
router.post('/fcm/register', registerFCMToken);
router.post('/fcm/remove', removeFCMToken);

// User Notification Preferences
router.get('/preferences', getNotificationPreferences);
router.put('/preferences', updateNotificationPreferences);

// Test Notifications (for development/testing)
router.post('/test', sendTestNotification);

// Notification Templates (for frontend reference)
router.get('/templates', getNotificationTemplates);

// Order-related notifications (called by order webhooks)
router.post('/order', sendOrderNotification);

// Admin-only routes for bulk notifications
router.post('/send-to-user', roleMiddleware(['admin']), sendNotificationToUser);
router.post('/bulk/customers', roleMiddleware(['admin']), sendBulkNotificationToCustomers);
router.post('/bulk/partners', roleMiddleware(['admin']), sendBulkNotificationToPartners);

module.exports = router;
