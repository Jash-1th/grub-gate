// Firebase Messaging Service Worker for Customer App
// This file must be in the public folder and served from the root domain

// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase configuration (same as main app)
const firebaseConfig = {
  apiKey: "AIzaSyAMLs_SO_LBTWvPcKLyr7fO2tuw7xn2DbM",
  authDomain: "messagegg-39a44.firebaseapp.com",
  projectId: "messagegg-39a44",
  storageBucket: "messagegg-39a44.firebasestorage.app",
  messagingSenderId: "357081663277",
  appId: "1:357081663277:web:c787254ff6f8a76ad5b5a4"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('📱 Background message received:', payload);

  // Extract notification data
  const notificationTitle = payload.notification?.title || 'Grub Gate';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: payload.notification?.icon || '/icons/notification-icon.png',
    badge: '/icons/notification-badge.png',
    tag: payload.data?.type || 'general',
    data: payload.data || {},
    requireInteraction: payload.data?.requireInteraction === 'true',
    actions: getNotificationActions(payload.data?.type),
    image: payload.notification?.image,
    timestamp: Date.now()
  };

  // Show notification
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event);

  const notification = event.notification;
  const data = notification.data || {};
  
  notification.close();

  // Handle action buttons
  if (event.action) {
    handleNotificationAction(event.action, data);
  } else {
    // Handle main notification click
    handleNotificationClick(data);
  }
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('🔕 Notification closed:', event.notification.data);
  
  // Optional: Track notification dismissal
  // trackNotificationEvent('dismissed', event.notification.data);
});

/**
 * Get notification actions based on type
 */
function getNotificationActions(type) {
  switch (type) {
    case 'ORDER_CONFIRMED':
    case 'ORDER_PREPARING':
    case 'ORDER_READY':
      return [
        {
          action: 'view_order',
          title: '👀 View Order',
          icon: '/icons/view-icon.png'
        },
        {
          action: 'track_order',
          title: '📍 Track Order',
          icon: '/icons/track-icon.png'
        }
      ];
    
    case 'ORDER_DELIVERED':
      return [
        {
          action: 'rate_order',
          title: '⭐ Rate Order',
          icon: '/icons/star-icon.png'
        },
        {
          action: 'view_order',
          title: '👀 View Order',
          icon: '/icons/view-icon.png'
        }
      ];
    
    case 'SUBSCRIPTION_REMINDER':
      return [
        {
          action: 'plan_meals',
          title: '🍽️ Plan Meals',
          icon: '/icons/meal-icon.png'
        },
        {
          action: 'view_calendar',
          title: '📅 View Calendar',
          icon: '/icons/calendar-icon.png'
        }
      ];
    
    default:
      return [
        {
          action: 'open_app',
          title: '📱 Open App',
          icon: '/icons/app-icon.png'
        }
      ];
  }
}

/**
 * Handle notification action button clicks
 */
function handleNotificationAction(action, data) {
  const { orderId, type } = data;
  let url = '/';

  switch (action) {
    case 'view_order':
      url = orderId ? `/orders/${orderId}` : '/orders';
      break;
    case 'track_order':
      url = orderId ? `/orders/${orderId}/track` : '/orders';
      break;
    case 'rate_order':
      url = orderId ? `/orders/${orderId}/review` : '/orders';
      break;
    case 'plan_meals':
      url = '/weekly-menu';
      break;
    case 'view_calendar':
      url = '/meal-calendar';
      break;
    case 'open_app':
    default:
      url = '/';
      break;
  }

  openAppWindow(url);
}

/**
 * Handle main notification click
 */
function handleNotificationClick(data) {
  const { action, orderId, type } = data;
  let url = '/';

  // Determine URL based on notification data
  if (action) {
    switch (action) {
      case 'view_order':
      case 'track_order':
        url = orderId ? `/orders/${orderId}` : '/orders';
        break;
      case 'rate_order':
        url = orderId ? `/orders/${orderId}/review` : '/orders';
        break;
      case 'plan_meals':
        url = '/weekly-menu';
        break;
      case 'view_calendar':
        url = '/meal-calendar';
        break;
      default:
        url = '/';
    }
  } else if (type) {
    // Fallback based on notification type
    switch (type) {
      case 'ORDER_CONFIRMED':
      case 'ORDER_PREPARING':
      case 'ORDER_READY':
      case 'ORDER_DELIVERED':
        url = orderId ? `/orders/${orderId}` : '/orders';
        break;
      case 'SUBSCRIPTION_REMINDER':
        url = '/weekly-menu';
        break;
      default:
        url = '/';
    }
  }

  openAppWindow(url);
}

/**
 * Open app window or focus existing one
 */
function openAppWindow(url) {
  const fullUrl = new URL(url, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if app is already open
      for (const client of clientList) {
        if (client.url.startsWith(self.location.origin) && 'focus' in client) {
          // Focus existing window and navigate
          client.focus();
          client.postMessage({
            type: 'NOTIFICATION_CLICK',
            url: url
          });
          return;
        }
      }
      
      // Open new window if app is not open
      if (clients.openWindow) {
        return clients.openWindow(fullUrl);
      }
    })
  );
}

/**
 * Handle service worker installation
 */
self.addEventListener('install', (event) => {
  console.log('🔧 Service worker installing...');
  
  // Skip waiting to activate immediately
  self.skipWaiting();
});

/**
 * Handle service worker activation
 */
self.addEventListener('activate', (event) => {
  console.log('✅ Service worker activated');
  
  // Claim all clients immediately
  event.waitUntil(self.clients.claim());
});

/**
 * Handle messages from main app
 */
self.addEventListener('message', (event) => {
  console.log('📨 Service worker received message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

/**
 * Handle push events (fallback)
 */
self.addEventListener('push', (event) => {
  console.log('📱 Push event received:', event);
  
  if (event.data) {
    try {
      const payload = event.data.json();
      
      const notificationTitle = payload.notification?.title || 'Grub Gate';
      const notificationOptions = {
        body: payload.notification?.body || 'You have a new notification',
        icon: payload.notification?.icon || '/icons/notification-icon.png',
        badge: '/icons/notification-badge.png',
        data: payload.data || {}
      };
      
      event.waitUntil(
        self.registration.showNotification(notificationTitle, notificationOptions)
      );
    } catch (error) {
      console.error('❌ Error parsing push data:', error);
    }
  }
});

console.log('🔥 Firebase Messaging Service Worker loaded');
