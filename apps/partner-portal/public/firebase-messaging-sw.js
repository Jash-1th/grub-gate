// Firebase Cloud Messaging Service Worker for Partner Portal
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAMLs_SO_LBTWvPcKLyr7fO2tuw7xn2DbM",
  authDomain: "messagegg-39a44.firebaseapp.com",
  projectId: "messagegg-39a44",
  storageBucket: "messagegg-39a44.firebasestorage.app",
  messagingSenderId: "357081663277",
  appId: "1:357081663277:web:c787254ff6f8a76ad5b5a4",
  measurementId: "G-H8SSXVS813"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[Partner SW] Received background message:', payload);

  const notificationTitle = payload.notification?.title || 'New Partner Notification';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: payload.notification?.icon || '/icons/partner-notification-icon.png',
    badge: '/icons/partner-notification-badge.png',
    data: payload.data || {},
    tag: payload.data?.type || 'partner-notification',
    requireInteraction: payload.data?.type === 'NEW_ORDER' || payload.data?.type === 'NEW_SUBSCRIPTION',
    vibrate: payload.data?.type === 'NEW_ORDER' ? [200, 100, 200] : [100],
    actions: getNotificationActions(payload.data?.type)
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Get notification actions based on type
function getNotificationActions(type) {
  switch (type) {
    case 'NEW_ORDER':
      return [
        { action: 'view_order', title: '👀 View Order' },
        { action: 'accept_order', title: '✅ Accept' }
      ];
    case 'NEW_SUBSCRIPTION':
      return [
        { action: 'view_subscriptions', title: '📋 View Subscriptions' },
        { action: 'view_dashboard', title: '📊 Dashboard' }
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

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[Partner SW] Notification click received:', event);

  event.notification.close();

  const action = event.action;
  const data = event.notification.data;

  let url = '/dashboard';

  // Determine URL based on action
  switch (action) {
    case 'view_order':
      url = data.orderId ? `/orders/${data.orderId}` : '/orders';
      break;
    case 'accept_order':
      url = data.orderId ? `/orders/${data.orderId}?action=accept` : '/orders';
      break;
    case 'prepare_order':
      url = data.orderId ? `/orders/${data.orderId}?action=prepare` : '/orders';
      break;
    case 'view_subscriptions':
      url = '/subscriptions';
      break;
    case 'view_dashboard':
      url = '/dashboard';
      break;
    case 'view_reviews':
      url = '/reviews';
      break;
    default:
      // Use action from data if available
      if (data.action) {
        switch (data.action) {
          case 'view_order':
            url = data.orderId ? `/orders/${data.orderId}` : '/orders';
            break;
          case 'view_subscriptions':
            url = '/subscriptions';
            break;
          case 'view_dashboard':
            url = '/dashboard';
            break;
          default:
            url = '/dashboard';
        }
      }
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          client.postMessage({
            type: 'NOTIFICATION_CLICK',
            action: action || data.action,
            data: data,
            url: url
          });
          return;
        }
      }
      
      // No window open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

console.log('[Partner SW] Firebase messaging service worker loaded');
