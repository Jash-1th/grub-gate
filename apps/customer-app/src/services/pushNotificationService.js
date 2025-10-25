import apiClient from '../api/apiClient';
import {
  isPushNotificationSupported,
  requestNotificationPermission,
  getFCMToken,
  onForegroundMessage,
  getDeviceInfo
} from '../config/firebase';

class PushNotificationService {
  constructor() {
    this.isInitialized = false;
    this.fcmToken = null;
    this.unsubscribeForeground = null;
    this.notificationQueue = [];
    this.isRegistering = false;
  }

  /**
   * Initialize push notification service
   */
  async initialize() {
    if (this.isInitialized) {
      console.log('✅ Push notification service already initialized');
      return true;
    }

    try {
      // Check if push notifications are supported
      if (!isPushNotificationSupported()) {
        console.log('⚠️ Push notifications not supported on this device');
        return false;
      }

      // Set up foreground message listener
      this.setupForegroundMessageListener();

      this.isInitialized = true;
      console.log('✅ Push notification service initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize push notification service:', error);
      return false;
    }
  }

  /**
   * Request permission and register FCM token
   */
  async requestPermissionAndRegister() {
    if (this.isRegistering) {
      console.log('🔄 Token registration already in progress');
      return false;
    }

    this.isRegistering = true;

    try {
      // Request notification permission
      const permissionGranted = await requestNotificationPermission();
      
      if (!permissionGranted) {
        console.log('❌ Notification permission not granted');
        this.isRegistering = false;
        return false;
      }

      // Get FCM token
      const token = await getFCMToken();
      
      if (!token) {
        console.log('❌ Failed to get FCM token');
        this.isRegistering = false;
        return false;
      }

      // Register token with backend
      const success = await this.registerTokenWithBackend(token);
      
      if (success) {
        this.fcmToken = token;
        console.log('✅ FCM token registered successfully');
        
        // Process any queued notifications
        this.processNotificationQueue();
        
        this.isRegistering = false;
        return true;
      } else {
        console.log('❌ Failed to register token with backend');
        this.isRegistering = false;
        return false;
      }
    } catch (error) {
      console.error('❌ Error during permission request and registration:', error);
      this.isRegistering = false;
      return false;
    }
  }

  /**
   * Register FCM token with backend
   */
  async registerTokenWithBackend(token) {
    try {
      const deviceInfo = getDeviceInfo();
      
      const response = await apiClient.post('/notifications/fcm/register', {
        token,
        deviceType: 'web',
        deviceInfo
      });

      if (response.data.status === 'success') {
        console.log('✅ Token registered with backend');
        return true;
      } else {
        console.error('❌ Backend token registration failed:', response.data);
        return false;
      }
    } catch (error) {
      console.error('❌ Error registering token with backend:', error);
      return false;
    }
  }

  /**
   * Remove FCM token from backend
   */
  async removeTokenFromBackend() {
    if (!this.fcmToken) {
      return true;
    }

    try {
      await apiClient.post('/notifications/fcm/remove', {
        token: this.fcmToken
      });

      console.log('✅ Token removed from backend');
      this.fcmToken = null;
      return true;
    } catch (error) {
      console.error('❌ Error removing token from backend:', error);
      return false;
    }
  }

  /**
   * Set up foreground message listener
   */
  setupForegroundMessageListener() {
    this.unsubscribeForeground = onForegroundMessage((notification) => {
      this.handleForegroundNotification(notification);
    });
  }

  /**
   * Handle foreground notifications
   */
  handleForegroundNotification(notification) {
    console.log('📱 Handling foreground notification:', notification);

    // Show browser notification if permission is granted
    if (Notification.permission === 'granted') {
      this.showBrowserNotification(notification);
    }

    // Add to notification queue for in-app display
    this.addToNotificationQueue(notification);

    // Trigger custom event for components to listen
    this.dispatchNotificationEvent(notification);
  }

  /**
   * Show browser notification
   */
  showBrowserNotification(notification) {
    try {
      const browserNotification = new Notification(notification.title, {
        body: notification.body,
        icon: notification.icon,
        badge: '/icons/notification-badge.png',
        tag: notification.data.type || 'general',
        requireInteraction: notification.data.requireInteraction === 'true',
        actions: notification.actions || []
      });

      // Handle notification click
      browserNotification.onclick = () => {
        this.handleNotificationClick(notification);
        browserNotification.close();
      };

      // Auto close after 5 seconds unless requireInteraction is true
      if (notification.data.requireInteraction !== 'true') {
        setTimeout(() => {
          browserNotification.close();
        }, 5000);
      }
    } catch (error) {
      console.error('❌ Error showing browser notification:', error);
    }
  }

  /**
   * Handle notification click
   */
  handleNotificationClick(notification) {
    console.log('🔔 Notification clicked:', notification);

    // Focus the window
    if (window) {
      window.focus();
    }

    // Navigate based on notification data
    if (notification.data.action) {
      this.handleNotificationAction(notification.data);
    }
  }

  /**
   * Handle notification actions
   */
  handleNotificationAction(data) {
    const { action, orderId, type } = data;

    switch (action) {
      case 'view_order':
        if (orderId) {
          window.location.href = `/orders/${orderId}`;
        }
        break;
      case 'track_order':
        if (orderId) {
          window.location.href = `/orders/${orderId}/track`;
        }
        break;
      case 'rate_order':
        if (orderId) {
          window.location.href = `/orders/${orderId}/review`;
        }
        break;
      case 'plan_meals':
        window.location.href = '/weekly-menu';
        break;
      case 'view_calendar':
        window.location.href = '/meal-calendar';
        break;
      default:
        console.log('🔔 Unknown notification action:', action);
    }
  }

  /**
   * Add notification to queue for in-app display
   */
  addToNotificationQueue(notification) {
    this.notificationQueue.unshift({
      ...notification,
      id: Date.now(),
      timestamp: new Date(),
      read: false
    });

    // Keep only last 50 notifications
    if (this.notificationQueue.length > 50) {
      this.notificationQueue = this.notificationQueue.slice(0, 50);
    }
  }

  /**
   * Get notification queue
   */
  getNotificationQueue() {
    return this.notificationQueue;
  }

  /**
   * Mark notification as read
   */
  markNotificationAsRead(notificationId) {
    const notification = this.notificationQueue.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
  }

  /**
   * Clear all notifications
   */
  clearAllNotifications() {
    this.notificationQueue = [];
  }

  /**
   * Process queued notifications
   */
  processNotificationQueue() {
    // This can be used to sync with backend or perform other actions
    console.log(`📱 Processing ${this.notificationQueue.length} queued notifications`);
  }

  /**
   * Dispatch custom notification event
   */
  dispatchNotificationEvent(notification) {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('grubgate-notification', {
        detail: notification
      });
      window.dispatchEvent(event);
    }
  }

  /**
   * Send test notification
   */
  async sendTestNotification(title = '🔔 Test Notification', body = 'This is a test notification from Grub Gate!') {
    try {
      const response = await apiClient.post('/notifications/test', {
        title,
        body,
        data: {
          type: 'TEST',
          action: 'view_calendar'
        }
      });

      if (response.data.status === 'success') {
        console.log('✅ Test notification sent');
        return true;
      } else {
        console.error('❌ Failed to send test notification:', response.data);
        return false;
      }
    } catch (error) {
      console.error('❌ Error sending test notification:', error);
      return false;
    }
  }

  /**
   * Update notification preferences
   */
  async updateNotificationPreferences(preferences) {
    try {
      const response = await apiClient.put('/notifications/preferences', preferences);
      
      if (response.data.status === 'success') {
        console.log('✅ Notification preferences updated');
        return true;
      } else {
        console.error('❌ Failed to update notification preferences:', response.data);
        return false;
      }
    } catch (error) {
      console.error('❌ Error updating notification preferences:', error);
      return false;
    }
  }

  /**
   * Get notification preferences
   */
  async getNotificationPreferences() {
    try {
      const response = await apiClient.get('/notifications/preferences');
      
      if (response.data.status === 'success') {
        return response.data.data;
      } else {
        console.error('❌ Failed to get notification preferences:', response.data);
        return null;
      }
    } catch (error) {
      console.error('❌ Error getting notification preferences:', error);
      return null;
    }
  }

  /**
   * Check if notifications are enabled
   */
  isNotificationEnabled() {
    return (
      this.isInitialized &&
      this.fcmToken !== null &&
      Notification.permission === 'granted'
    );
  }

  /**
   * Get notification status
   */
  getNotificationStatus() {
    return {
      supported: isPushNotificationSupported(),
      permission: typeof Notification !== 'undefined' ? Notification.permission : 'default',
      initialized: this.isInitialized,
      tokenRegistered: this.fcmToken !== null,
      enabled: this.isNotificationEnabled()
    };
  }

  /**
   * Cleanup service
   */
  cleanup() {
    if (this.unsubscribeForeground) {
      this.unsubscribeForeground();
      this.unsubscribeForeground = null;
    }
    
    this.isInitialized = false;
    this.fcmToken = null;
    this.notificationQueue = [];
  }
}

// Create singleton instance
const pushNotificationService = new PushNotificationService();

export default pushNotificationService;
