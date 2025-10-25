import apiClient from '../api/client';
import {
  isPushNotificationSupported,
  requestNotificationPermission,
  getFCMToken,
  onForegroundMessage,
  getDeviceInfo
} from '../config/firebase';

class PartnerPushNotificationService {
  constructor() {
    this.isInitialized = false;
    this.fcmToken = null;
    this.unsubscribeForeground = null;
    this.notificationQueue = [];
    this.isRegistering = false;
    this.orderNotificationSound = null;
  }

  /**
   * Initialize push notification service for Partner Portal
   */
  async initialize() {
    if (this.isInitialized) {
      console.log('✅ Partner push notification service already initialized');
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

      // Load notification sound
      this.loadNotificationSounds();

      this.isInitialized = true;
      console.log('✅ Partner push notification service initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize partner push notification service:', error);
      return false;
    }
  }

  /**
   * Load notification sounds for different types
   */
  loadNotificationSounds() {
    try {
      // Load order notification sound
      this.orderNotificationSound = new Audio('/sounds/partner-order-sound.mp3');
      this.orderNotificationSound.volume = 0.7;
    } catch (error) {
      console.warn('⚠️ Could not load notification sounds:', error);
    }
  }

  /**
   * Request permission and register FCM token for Partner Portal
   */
  async requestPermissionAndRegister() {
    if (this.isRegistering) {
      console.log('🔄 Partner token registration already in progress');
      return false;
    }

    this.isRegistering = true;

    try {
      // Request notification permission
      const permissionGranted = await requestNotificationPermission();
      
      if (!permissionGranted) {
        console.log('❌ Partner notification permission not granted');
        this.isRegistering = false;
        return false;
      }

      // Get FCM token
      const token = await getFCMToken();
      
      if (!token) {
        console.log('❌ Failed to get Partner FCM token');
        this.isRegistering = false;
        return false;
      }

      // Register token with backend
      const success = await this.registerTokenWithBackend(token);
      
      if (success) {
        this.fcmToken = token;
        console.log('✅ Partner FCM token registered successfully');
        
        // Process any queued notifications
        this.processNotificationQueue();
        
        this.isRegistering = false;
        return true;
      } else {
        console.log('❌ Failed to register partner token with backend');
        this.isRegistering = false;
        return false;
      }
    } catch (error) {
      console.error('❌ Error during partner permission request and registration:', error);
      this.isRegistering = false;
      return false;
    }
  }

  /**
   * Register FCM token with backend for Partner Portal
   */
  async registerTokenWithBackend(token) {
    try {
      const deviceInfo = getDeviceInfo();
      
      // Use the same endpoint as customer app: /push-notifications/subscribe
      const response = await apiClient.post('/push-notifications/subscribe', {
        token,
        deviceType: 'web',
        deviceInfo
      });

      if (response.data.status === 'success') {
        console.log('✅ Partner token registered with backend');
        return true;
      } else {
        console.error('❌ Backend partner token registration failed:', response.data);
        return false;
      }
    } catch (error) {
      console.error('❌ Error registering partner token with backend:', error);
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
      // Use the same endpoint as customer app: /push-notifications/unsubscribe
      await apiClient.post('/push-notifications/unsubscribe', {
        token: this.fcmToken
      });

      console.log('✅ Partner token removed from backend');
      this.fcmToken = null;
      return true;
    } catch (error) {
      console.error('❌ Error removing partner token from backend:', error);
      return false;
    }
  }

  /**
   * Set up foreground message listener for Partner Portal
   */
  setupForegroundMessageListener() {
    this.unsubscribeForeground = onForegroundMessage((notification) => {
      this.handleForegroundNotification(notification);
    });
  }

  /**
   * Handle foreground notifications for Partner Portal
   */
  handleForegroundNotification(notification) {
    console.log('📱 Handling partner foreground notification:', notification);

    // Play sound for important notifications
    this.playNotificationSound(notification.data?.type);

    // Show browser notification if permission is granted
    if (Notification.permission === 'granted') {
      this.showBrowserNotification(notification);
    }

    // Add to notification queue for in-app display
    this.addToNotificationQueue(notification);

    // Trigger custom event for components to listen
    this.dispatchNotificationEvent(notification);

    // Auto-refresh orders for new order notifications
    if (notification.data?.type === 'NEW_ORDER') {
      this.triggerOrderRefresh();
    }
  }

  /**
   * Play notification sound based on type
   */
  playNotificationSound(type) {
    try {
      if (type === 'NEW_ORDER' && this.orderNotificationSound) {
        this.orderNotificationSound.currentTime = 0;
        this.orderNotificationSound.play().catch(error => {
          console.warn('⚠️ Could not play notification sound:', error);
        });
      }
    } catch (error) {
      console.warn('⚠️ Error playing notification sound:', error);
    }
  }

  /**
   * Show browser notification for Partner Portal
   */
  showBrowserNotification(notification) {
    try {
      const browserNotification = new Notification(notification.title, {
        body: notification.body,
        icon: notification.icon,
        badge: '/icons/partner-notification-badge.png',
        tag: notification.data.type || 'partner-general',
        requireInteraction: notification.data.type === 'NEW_ORDER',
        actions: this.getNotificationActions(notification.data.type),
        vibrate: notification.data.type === 'NEW_ORDER' ? [200, 100, 200] : [100]
      });

      // Handle notification click
      browserNotification.onclick = () => {
        this.handleNotificationClick(notification);
        browserNotification.close();
      };

      // Auto close after 10 seconds for non-critical notifications
      if (notification.data.type !== 'NEW_ORDER') {
        setTimeout(() => {
          browserNotification.close();
        }, 10000);
      }
    } catch (error) {
      console.error('❌ Error showing partner browser notification:', error);
    }
  }

  /**
   * Get notification actions for Partner Portal
   */
  getNotificationActions(type) {
    switch (type) {
      case 'NEW_ORDER':
        return [
          { action: 'view_order', title: '👀 View Order' },
          { action: 'accept_order', title: '✅ Accept' }
        ];
      case 'ORDER_DEADLINE':
        return [
          { action: 'prepare_order', title: '🍳 Prepare' },
          { action: 'view_order', title: '👀 View' }
        ];
      default:
        return [];
    }
  }

  /**
   * Handle notification click for Partner Portal
   */
  handleNotificationClick(notification) {
    console.log('🔔 Partner notification clicked:', notification);

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
   * Handle notification actions for Partner Portal
   */
  handleNotificationAction(data) {
    const { action, orderId, type } = data;

    switch (action) {
      case 'view_order':
        if (orderId) {
          window.location.href = `/orders/${orderId}`;
        } else {
          window.location.href = '/orders';
        }
        break;
      case 'accept_order':
        if (orderId) {
          window.location.href = `/orders/${orderId}?action=accept`;
        }
        break;
      case 'prepare_order':
        if (orderId) {
          window.location.href = `/orders/${orderId}?action=prepare`;
        }
        break;
      case 'view_dashboard':
        window.location.href = '/dashboard';
        break;
      case 'view_reviews':
        window.location.href = '/reviews';
        break;
      default:
        console.log('🔔 Unknown partner notification action:', action);
    }
  }

  /**
   * Trigger order refresh for real-time updates
   */
  triggerOrderRefresh() {
    // Dispatch custom event for order refresh
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('grubgate-partner-order-refresh');
      window.dispatchEvent(event);
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
    console.log(`📱 Processing ${this.notificationQueue.length} queued partner notifications`);
  }

  /**
   * Dispatch custom notification event
   */
  dispatchNotificationEvent(notification) {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('grubgate-partner-notification', {
        detail: notification
      });
      window.dispatchEvent(event);
    }
  }

  /**
   * Send test notification for Partner Portal
   */
  async sendTestNotification(title = '🔔 Partner Test Notification', body = 'This is a test notification for your restaurant!') {
    try {
      const response = await apiClient.post('/notifications/test', {
        title,
        body,
        data: {
          type: 'TEST',
          action: 'view_dashboard'
        }
      });

      if (response.data.status === 'success') {
        console.log('✅ Partner test notification sent');
        return true;
      } else {
        console.error('❌ Failed to send partner test notification:', response.data);
        return false;
      }
    } catch (error) {
      console.error('❌ Error sending partner test notification:', error);
      return false;
    }
  }

  /**
   * Update notification preferences for Partner Portal
   */
  async updateNotificationPreferences(preferences) {
    try {
      const response = await apiClient.put('/notifications/preferences', preferences);
      
      if (response.data.status === 'success') {
        console.log('✅ Partner notification preferences updated');
        return true;
      } else {
        console.error('❌ Failed to update partner notification preferences:', response.data);
        return false;
      }
    } catch (error) {
      console.error('❌ Error updating partner notification preferences:', error);
      return false;
    }
  }

  /**
   * Get notification preferences for Partner Portal
   */
  async getNotificationPreferences() {
    try {
      const response = await apiClient.get('/notifications/preferences');
      
      if (response.data.status === 'success') {
        return response.data.data;
      } else {
        console.error('❌ Failed to get partner notification preferences:', response.data);
        return null;
      }
    } catch (error) {
      console.error('❌ Error getting partner notification preferences:', error);
      return null;
    }
  }

  /**
   * Check if notifications are enabled for Partner Portal
   */
  isNotificationEnabled() {
    return (
      this.isInitialized &&
      this.fcmToken !== null &&
      Notification.permission === 'granted'
    );
  }

  /**
   * Get notification status for Partner Portal
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

// Create singleton instance for Partner Portal
const partnerPushNotificationService = new PartnerPushNotificationService();

export default partnerPushNotificationService;
