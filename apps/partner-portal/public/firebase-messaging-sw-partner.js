// Firebase Messaging Service Worker for Partner Portal
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

// Handle background messages for Partner Portal
messaging.onBackgroundMessage((payload) => {
  console.log('📱 Partner background message received:', payload);

  // Extract notification data
  const notificationTitle = payload.notification?.title || 'Grub Gate Partner';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new partner notification',
    icon: payload.notification?.icon || '/icons/partner-notification-icon.png',
    badge: '/icons/partner-notification-badge.png',
    tag: payload.data?.type || 'partner-general',
    data: payload.data || {},
    requireInteraction: payload.data?.requireInteraction === 'true' || payload.data?.type === 'NEW_ORDER',
    actions: getPartnerNotificationActions(payload.data?.type),
    image: payload.notification?.image,
    timestamp: Date.now(),
    silent: false,
    vibrate: payload.data?.type === 'NEW_ORDER' ? [200, 100, 200] : [100]
  };

  // Show notification
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click for Partner Portal
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Partner notification clicked:', event);

  const notification = event.notification;
  const data = notification.data || {};
  
  notification.close();

  // Handle action buttons
  if (event.action) {
    handlePartnerNotificationAction(event.action, data);
  } else {
    // Handle main notification click
    handlePartnerNotificationClick(data);
  }
});

// Handle notification close for Partner Portal
self.addEventListener('notificationclose', (event) => {
  console.log('🔕 Partner notification closed:', event.notification.data);
  
  // Track notification dismissal for partners
  // trackPartnerNotificationEvent('dismissed', event.notification.data);
});

/**
 * Get notification actions based on partner notification type
 */
function getPartnerNotificationActions(type) {
  switch (type) {
    case 'NEW_ORDER':
      return [
        {
          action: 'view_order',
          title: '👀 View Order',
          icon: '/icons/view-icon.png'
        },
        {
          action: 'accept_order',
          title: '✅ Accept Order',
          icon: '/icons/accept-icon.png'
        }
      ];
    
    case 'ORDER_DEADLINE':
      return [
        {
          action: 'prepare_order',
          title: '🍳 Start Preparing',
          icon: '/icons/cooking-icon.png'
        },
        {
          action: 'view_order',
          title: '👀 View Details',
          icon: '/icons/view-icon.png'
        }
      ];
    
    case 'NEW_REVIEW':
      return [
        {
          action: 'view_reviews',
          title: '⭐ View Reviews',
          icon: '/icons/star-icon.png'
        },
        {
          action: 'respond_review',
          title: '💬 Respond',
          icon: '/icons/reply-icon.png'
        }
      ];
    
    case 'DAILY_SUMMARY':
      return [
        {
          action: 'view_dashboard',
          title: '📊 View Dashboard',
          icon: '/icons/dashboard-icon.png'
        },
        {
          action: 'view_analytics',
          title: '📈 View Analytics',
          icon: '/icons/analytics-icon.png'
        }
      ];
    
    default:
      return [
        {
          action: 'open_dashboard',
          title: '📱 Open Dashboard',
          icon: '/icons/app-icon.png'
        }
      ];
  }
}

/**
 * Handle partner notification action button clicks
 */
function handlePartnerNotificationAction(action, data) {
  const { orderId, reviewId, type } = data;
  let url = '/dashboard';

  switch (action) {
    case 'view_order':
      url = orderId ? `/orders/${orderId}` : '/orders';
      break;
    case 'accept_order':
      url = orderId ? `/orders/${orderId}?action=accept` : '/orders';
      break;
    case 'prepare_order':
      url = orderId ? `/orders/${orderId}?action=prepare` : '/orders';
      break;
    case 'view_reviews':
      url = '/reviews';
      break;
    case 'respond_review':
      url = reviewId ? `/reviews/${reviewId}` : '/reviews';
      break;
    case 'view_dashboard':
      url = '/dashboard';
      break;
    case 'view_analytics':
      url = '/analytics';
      break;
    case 'open_dashboard':
    default:
      url = '/dashboard';
      break;
  }

  openPartnerAppWindow(url);
}

/**
 * Handle main partner notification click
 */
function handlePartnerNotificationClick(data) {
  const { action, orderId, reviewId, type } = data;
  let url = '/dashboard';

  // Determine URL based on notification data
  if (action) {
    switch (action) {
      case 'view_order':
      case 'accept_order':
      case 'prepare_order':
        url = orderId ? `/orders/${orderId}` : '/orders';
        break;
      case 'view_reviews':
        url = '/reviews';
        break;
      case 'view_dashboard':
        url = '/dashboard';
        break;
      default:
        url = '/dashboard';
    }
  } else if (type) {
    // Fallback based on notification type
    switch (type) {
      case 'NEW_ORDER':
      case 'ORDER_DEADLINE':
        url = orderId ? `/orders/${orderId}` : '/orders';
        break;
      case 'NEW_REVIEW':
        url = '/reviews';
        break;
      case 'DAILY_SUMMARY':
        url = '/dashboard';
        break;
      default:
        url = '/dashboard';
    }
  }

  openPartnerAppWindow(url);
}

/**
 * Open partner app window or focus existing one
 */
function openPartnerAppWindow(url) {
  const fullUrl = new URL(url, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if partner app is already open
      for (const client of clientList) {
        if (client.url.startsWith(self.location.origin) && 'focus' in client) {
          // Focus existing window and navigate
          client.focus();
          client.postMessage({
            type: 'PARTNER_NOTIFICATION_CLICK',
            url: url
          });
          return;
        }
      }
      
      // Open new window if partner app is not open
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
  console.log('🔧 Partner service worker installing...');
  
  // Skip waiting to activate immediately
  self.skipWaiting();
});

/**
 * Handle service worker activation
 */
self.addEventListener('activate', (event) => {
  console.log('✅ Partner service worker activated');
  
  // Claim all clients immediately
  event.waitUntil(self.clients.claim());
});

/**
 * Handle messages from partner app
 */
self.addEventListener('message', (event) => {
  console.log('📨 Partner service worker received message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

/**
 * Handle push events (fallback for Partner Portal)
 */
self.addEventListener('push', (event) => {
  console.log('📱 Partner push event received:', event);
  
  if (event.data) {
    try {
      const payload = event.data.json();
      
      const notificationTitle = payload.notification?.title || 'Grub Gate Partner';
      const notificationOptions = {
        body: payload.notification?.body || 'You have a new partner notification',
        icon: payload.notification?.icon || '/icons/partner-notification-icon.png',
        badge: '/icons/partner-notification-badge.png',
        data: payload.data || {},
        requireInteraction: payload.data?.type === 'NEW_ORDER'
      };
      
      event.waitUntil(
        self.registration.showNotification(notificationTitle, notificationOptions)
      );
    } catch (error) {
      console.error('❌ Error parsing partner push data:', error);
    }
  }
});

console.log('🔥 Firebase Messaging Service Worker for Partner Portal loaded');
