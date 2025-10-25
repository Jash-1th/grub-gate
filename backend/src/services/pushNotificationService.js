const admin = require('firebase-admin');
const webpush = require('web-push');

class PushNotificationService {
  constructor() {
    this.isInitialized = false;
    this.initializeFirebase();
    this.initializeWebPush();
  }

  initializeWebPush() {
    try {
      // Set VAPID details for web push
      const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
      const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
      const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:support@grubgate.com';

      if (!vapidPublicKey || !vapidPrivateKey) {
        console.warn('⚠️ VAPID keys not configured. Web push notifications will not work.');
        return;
      }

      webpush.setVapidDetails(
        vapidSubject,
        vapidPublicKey,
        vapidPrivateKey
      );

      console.log('✅ Web Push initialized with VAPID keys');
    } catch (error) {
      console.error('❌ Failed to initialize Web Push:', error.message);
    }
  }

  initializeFirebase() {
    try {
      // Check if Firebase is already initialized
      if (admin.apps.length === 0) {
        const serviceAccount = {
          type: "service_account",
          project_id: process.env.FIREBASE_PROJECT_ID,
          private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          client_email: process.env.FIREBASE_CLIENT_EMAIL,
        };

        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          databaseURL: process.env.FIREBASE_DATABASE_URL
        });

        console.log('✅ Firebase Admin SDK initialized successfully');
        this.isInitialized = true;
      } else {
        this.isInitialized = true;
        console.log('✅ Firebase Admin SDK already initialized');
      }
    } catch (error) {
      console.error('❌ Failed to initialize Firebase Admin SDK:', error.message);
      this.isInitialized = false;
    }
  }

  /**
   * Send notification to a single device token
   */
  async sendToToken(token, notification, data = {}) {
    if (!this.isInitialized) {
      throw new Error('Firebase Admin SDK not initialized');
    }

    try {
      const message = {
        token,
        notification: {
          title: notification.title,
          body: notification.body,
          icon: notification.icon || '/icons/notification-icon.png',
          badge: notification.badge || '/icons/notification-badge.png',
        },
        data: {
          ...data,
          timestamp: new Date().toISOString(),
          click_action: data.click_action || 'FLUTTER_NOTIFICATION_CLICK'
        },
        webpush: {
          headers: {
            Urgency: notification.priority || 'normal',
          },
          notification: {
            icon: notification.icon || '/icons/notification-icon.png',
            badge: notification.badge || '/icons/notification-badge.png',
            requireInteraction: notification.requireInteraction || false,
            actions: notification.actions || []
          }
        }
      };

      const response = await admin.messaging().send(message);
      console.log('✅ Notification sent successfully:', response);
      return { success: true, messageId: response };
    } catch (error) {
      console.error('❌ Failed to send notification:', error);
      
      // Handle invalid token
      if (error.code === 'messaging/invalid-registration-token' || 
          error.code === 'messaging/registration-token-not-registered') {
        return { success: false, error: 'INVALID_TOKEN', shouldRemoveToken: true };
      }
      
      return { success: false, error: error.message };
    }
  }

  /**
   * Send web push notification to a subscription
   */
  async sendWebPush(subscription, notification, data = {}) {
    try {
      const payload = JSON.stringify({
        notification: {
          title: notification.title,
          body: notification.body,
          icon: notification.icon || '/icons/notification-icon.png',
          badge: notification.badge || '/icons/notification-badge.png',
          data: data
        }
      });

      await webpush.sendNotification(subscription, payload);
      console.log('✅ Web push notification sent successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to send web push notification:', error);
      
      // Handle expired or invalid subscriptions
      if (error.statusCode === 410 || error.statusCode === 404) {
        return { success: false, error: 'INVALID_SUBSCRIPTION', shouldRemove: true };
      }
      
      return { success: false, error: error.message };
    }
  }

  /**
   * Detect if token is a web push subscription or FCM token
   */
  isWebPushSubscription(tokenData) {
    // Web push subscriptions are stored as objects with endpoint, keys, etc.
    return tokenData && typeof tokenData === 'object' && tokenData.endpoint;
  }

  /**
   * Send notification to multiple device tokens
   */
  async sendToMultipleTokens(tokens, notification, data = {}) {
    if (!this.isInitialized) {
      throw new Error('Firebase Admin SDK not initialized');
    }

    if (!tokens || tokens.length === 0) {
      return { success: false, error: 'No tokens provided' };
    }

    try {
      const response = await admin.messaging().sendEach(tokens.map(token => ({
        token,
        notification: {
          title: notification.title,
          body: notification.body,
          icon: notification.icon || '/icons/notification-icon.png',
        },
        data: {
          ...data,
          timestamp: new Date().toISOString(),
        },
        webpush: {
          notification: {
            icon: notification.icon || '/icons/notification-icon.png',
            badge: notification.badge || '/icons/notification-badge.png',
            requireInteraction: notification.requireInteraction || false,
          }
        }
      })));
      
      console.log(`✅ Sent ${response.successCount}/${tokens.length} notifications successfully`);
      
      // Handle failed tokens
      const failedTokens = [];
      if (response.failureCount > 0) {
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push({
              token: tokens[idx],
              error: resp.error?.code || 'unknown_error'
            });
          }
        });
      }

      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
        failedTokens
      };
    } catch (error) {
      console.error('❌ Failed to send bulk notifications:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send notification to a user (all their devices)
   */
  async sendToUser(userId, notification, data = {}) {
    try {
      const User = require('../models/User');
      const user = await User.findById(userId);
      
      if (!user || !user.fcmTokens || user.fcmTokens.length === 0) {
        return { success: false, error: 'No FCM tokens found for user' };
      }

      // Separate web push subscriptions from FCM tokens
      const webPushSubscriptions = [];
      const fcmTokens = [];
      
      user.fcmTokens.forEach(tokenData => {
        if (!tokenData || !tokenData.isActive) return;
        
        console.log('🔍 Token data:', {
          token: tokenData.token?.substring(0, 50) + '...',
          hasSubscription: !!tokenData.subscription,
          subscriptionKeys: tokenData.subscription ? Object.keys(tokenData.subscription) : []
        });
        
        // Check if it's a web push subscription (has endpoint URL)
        if (typeof tokenData.token === 'string' && tokenData.token.startsWith('https://fcm.googleapis.com')) {
          // This is a web push subscription endpoint
          // We need the full subscription object stored in the database
          if (tokenData.subscription) {
            webPushSubscriptions.push({
              tokenData,
              subscription: tokenData.subscription
            });
          } else {
            console.warn('⚠️ Web push endpoint found but no subscription object');
          }
        } else if (typeof tokenData.token === 'string') {
          // This is a regular FCM token
          fcmTokens.push(tokenData.token);
        }
      });

      console.log(`📱 Sending to ${webPushSubscriptions.length} web push subscriptions and ${fcmTokens.length} FCM tokens`);

      let webPushResults = { successCount: 0, failureCount: 0, failedTokens: [] };
      let fcmResults = { successCount: 0, failureCount: 0, failedTokens: [] };

      // Send to web push subscriptions
      if (webPushSubscriptions.length > 0) {
        for (const { tokenData, subscription } of webPushSubscriptions) {
          const result = await this.sendWebPush(subscription, notification, data);
          
          if (result.success) {
            webPushResults.successCount++;
            // Update last used timestamp
            await User.findOneAndUpdate(
              { _id: userId, 'fcmTokens._id': tokenData._id },
              { $set: { 'fcmTokens.$.lastUsed': new Date() } }
            );
          } else {
            webPushResults.failureCount++;
            webPushResults.failedTokens.push({
              token: tokenData.token,
              error: result.error
            });
            
            // Remove invalid subscriptions
            if (result.shouldRemove) {
              await User.findByIdAndUpdate(userId, {
                $pull: { fcmTokens: { _id: tokenData._id } }
              });
            }
          }
        }
      }

      // Send to FCM tokens
      if (fcmTokens.length > 0) {
        fcmResults = await this.sendToMultipleTokens(fcmTokens, notification, {
          ...data,
          userId: userId.toString()
        });

        // Remove invalid FCM tokens
        if (fcmResults.failedTokens && fcmResults.failedTokens.length > 0) {
          const invalidTokens = fcmResults.failedTokens
            .filter(failed => failed.error === 'messaging/invalid-registration-token')
            .map(failed => failed.token);
          
          if (invalidTokens.length > 0) {
            await this.removeInvalidTokensFromUser(userId, invalidTokens);
          }
        }
      }

      const totalSuccess = webPushResults.successCount + (fcmResults.successCount || 0);
      const totalFailure = webPushResults.failureCount + (fcmResults.failureCount || 0);

      return {
        success: totalSuccess > 0,
        successCount: totalSuccess,
        failureCount: totalFailure,
        failedTokens: [...webPushResults.failedTokens, ...(fcmResults.failedTokens || [])]
      };
    } catch (error) {
      console.error('❌ Failed to send notification to user:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send notification to all partners
   */
  async sendToAllPartners(notification, data = {}) {
    try {
      const User = require('../models/User');
      const partners = await User.find({ 
        roles: 'partner',
        fcmTokens: { $exists: true, $ne: [] }
      });

      const allTokens = [];
      partners.forEach(partner => {
        if (partner.fcmTokens) {
          const validTokens = partner.fcmTokens
            .filter(tokenData => tokenData.token && tokenData.isActive !== false)
            .map(tokenData => tokenData.token);
          allTokens.push(...validTokens);
        }
      });

      if (allTokens.length === 0) {
        return { success: false, error: 'No partner tokens found' };
      }

      return await this.sendToMultipleTokens(allTokens, notification, {
        ...data,
        audience: 'partners'
      });
    } catch (error) {
      console.error('❌ Failed to send notification to all partners:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send notification to all customers
   */
  async sendToAllCustomers(notification, data = {}) {
    try {
      const User = require('../models/User');
      const customers = await User.find({ 
        roles: 'customer',
        fcmTokens: { $exists: true, $ne: [] }
      });

      const allTokens = [];
      customers.forEach(customer => {
        if (customer.fcmTokens) {
          const validTokens = customer.fcmTokens
            .filter(tokenData => tokenData.token && tokenData.isActive !== false)
            .map(tokenData => tokenData.token);
          allTokens.push(...validTokens);
        }
      });

      if (allTokens.length === 0) {
        return { success: false, error: 'No customer tokens found' };
      }

      return await this.sendToMultipleTokens(allTokens, notification, {
        ...data,
        audience: 'customers'
      });
    } catch (error) {
      console.error('❌ Failed to send notification to all customers:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Remove invalid tokens from user record
   */
  async removeInvalidTokensFromUser(userId, invalidTokens) {
    try {
      const User = require('../models/User');
      await User.findByIdAndUpdate(userId, {
        $pull: {
          fcmTokens: { token: { $in: invalidTokens } }
        }
      });
      console.log(`🧹 Removed ${invalidTokens.length} invalid tokens from user ${userId}`);
    } catch (error) {
      console.error('❌ Failed to remove invalid tokens:', error);
    }
  }

  /**
   * Create notification templates for different events
   */
  getNotificationTemplate(type, data = {}) {
    const templates = {
      // Customer notifications
      ORDER_CONFIRMED: {
        title: '✅ Order Confirmed!',
        body: `Your order #${data.orderNumber} has been confirmed and will be prepared soon.`,
        icon: '/icons/order-confirmed.png',
        data: { type: 'ORDER_UPDATE', orderId: data.orderId, action: 'view_order' }
      },
      ORDER_PREPARING: {
        title: '🍳 Order Being Prepared',
        body: `Your delicious meal is being prepared by ${data.restaurantName}.`,
        icon: '/icons/cooking.png',
        data: { type: 'ORDER_UPDATE', orderId: data.orderId, action: 'track_order' }
      },
      ORDER_READY: {
        title: '📦 Order Ready!',
        body: `Your order is ready for ${data.deliveryType}. Estimated time: ${data.estimatedTime}`,
        icon: '/icons/order-ready.png',
        data: { type: 'ORDER_UPDATE', orderId: data.orderId, action: 'view_order' }
      },
      ORDER_DELIVERED: {
        title: '🎉 Order Delivered!',
        body: 'Your order has been delivered. Enjoy your meal!',
        icon: '/icons/delivered.png',
        data: { type: 'ORDER_UPDATE', orderId: data.orderId, action: 'rate_order' }
      },
      SUBSCRIPTION_REMINDER: {
        title: '📅 Plan Your Meals',
        body: 'Time to plan your meals for next week! Don\'t miss out on your favorites.',
        icon: '/icons/calendar.png',
        data: { type: 'SUBSCRIPTION', action: 'plan_meals' }
      },

      // Partner notifications
      NEW_ORDER: {
        title: '🔔 New Order Received!',
        body: `New order from ${data.customerName} - ${data.itemCount} items (₹${data.total})`,
        icon: '/icons/new-order.png',
        data: { type: 'NEW_ORDER', orderId: data.orderId, action: 'view_order' },
        requireInteraction: true
      },
      ORDER_DEADLINE: {
        title: '⏰ Order Deadline Approaching',
        body: `Order #${data.orderNumber} needs to be prepared within ${data.timeRemaining} minutes.`,
        icon: '/icons/deadline.png',
        data: { type: 'ORDER_DEADLINE', orderId: data.orderId, action: 'prepare_order' },
        priority: 'high'
      },
      DAILY_SUMMARY: {
        title: '📊 Daily Summary',
        body: `Great day! You received ${data.orderCount} orders and earned ₹${data.revenue}.`,
        icon: '/icons/summary.png',
        data: { type: 'SUMMARY', action: 'view_dashboard' }
      },
      NEW_REVIEW: {
        title: '⭐ New Review Received',
        body: `${data.customerName} gave you ${data.rating} stars: "${data.comment}"`,
        icon: '/icons/review.png',
        data: { type: 'REVIEW', reviewId: data.reviewId, action: 'view_reviews' }
      }
    };

    return templates[type] || null;
  }
}

// Create singleton instance
const pushNotificationService = new PushNotificationService();

module.exports = pushNotificationService;
