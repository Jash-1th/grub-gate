// Cache names with versioning for better cache management
const CACHE_VERSION = '1.1.0'; // Updated for push notification fix
const CACHE_NAME = `grubgate-partner-v${CACHE_VERSION}`;
const STATIC_CACHE = `grubgate-partner-static-v${CACHE_VERSION}`;
const DYNAMIC_CACHE = `grubgate-partner-dynamic-v${CACHE_VERSION}`;
const IMAGE_CACHE = `grubgate-partner-images-v${CACHE_VERSION}`;

// Import Firebase scripts for messaging
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

  // Note: 'event' is not available in this context, using clients.matchAll directly
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
  });
}

// App Shell - Critical resources for instant loading
const APP_SHELL_ASSETS = [
  '/',
  '/index.html'
];

// Optional assets that may not exist
const OPTIONAL_ASSETS = [
  '/manifest.json',
  '/icons/logo192.png',
  '/icons/logo512.png',
  '/icons/Logo.png'
];

// Static assets that change infrequently
const STATIC_ASSETS = [
  '/vite.svg'
];

// Install event: Pre-cache App Shell and critical static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache critical app shell assets
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('Service Worker: Caching App Shell');
        return cache.addAll(APP_SHELL_ASSETS);
      }),
      
      // Cache static assets
      caches.open(IMAGE_CACHE).then((cache) => {
        console.log('Service Worker: Caching Static Assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      
      // Try to cache optional assets (don't fail if they don't exist)
      caches.open(IMAGE_CACHE).then(async (cache) => {
        console.log('Service Worker: Attempting to cache optional assets');
        const promises = OPTIONAL_ASSETS.map(async (asset) => {
          try {
            const response = await fetch(asset);
            if (response.ok) {
              await cache.put(asset, response);
              console.log(`Service Worker: Cached optional asset: ${asset}`);
            }
          } catch (error) {
            console.warn(`Service Worker: Failed to cache optional asset: ${asset}`, error);
            // Continue with other assets even if one fails
          }
        });
        
        // Wait for all promises to complete (some may reject, that's okay)
        await Promise.allSettled(promises);
      })
    ]).then(() => {
      console.log('Service Worker: Installation complete');
      return self.skipWaiting();
    })
  );
});

// Activate event: Clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName.startsWith('grubgate-partner-') && 
              cacheName !== CACHE_NAME && 
              cacheName !== STATIC_CACHE && 
              cacheName !== DYNAMIC_CACHE && 
              cacheName !== IMAGE_CACHE) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activation complete');
      return self.clients.claim();
    })
  );
});

// Fetch event: Serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      // Return cached version if available
      if (cachedResponse) {
        console.log('Service Worker: Serving from cache:', request.url);
        return cachedResponse;
      }
      
      // Otherwise, fetch from network
      return fetch(request).then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        
        // Clone the response for caching
        const responseToCache = response.clone();
        
        // Determine which cache to use based on request type
        let targetCache = DYNAMIC_CACHE;
        if (request.url.includes('/assets/') || request.url.includes('.js') || request.url.includes('.css')) {
          targetCache = STATIC_CACHE;
        } else if (request.url.includes('/images/') || request.url.includes('.png') || request.url.includes('.jpg') || request.url.includes('.jpeg') || request.url.includes('.webp')) {
          targetCache = IMAGE_CACHE;
        }
        
        // Cache the response
        caches.open(targetCache).then((cache) => {
          cache.put(request, responseToCache);
        });
        
        return response;
      }).catch((error) => {
        console.log('Service Worker: Fetch failed:', error);
        
        // Return offline page for navigation requests
        if (request.destination === 'document') {
          return caches.match('/index.html');
        }
        
        throw error;
      });
    })
  );
});

// Push event: Handle push notifications
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received');
  
  let notificationData = {};
  
  if (event.data) {
    try {
      const payload = event.data.json();
      console.log('Push payload:', payload);
      
      // Firebase sends notification in payload.notification
      if (payload.notification) {
        notificationData = payload.notification;
      } else {
        notificationData = payload;
      }
      
      // Merge with data if present
      if (payload.data) {
        notificationData.data = payload.data;
      }
    } catch (e) {
      notificationData = {
        title: 'GrubGate Partner',
        body: event.data.text() || 'You have a new notification',
        icon: '/icons/logo192.png',
        badge: '/icons/Logo.png'
      };
    }
  }
  
  const options = {
    body: notificationData.body || 'You have a new notification',
    icon: notificationData.icon || '/icons/logo192.png',
    badge: notificationData.badge || '/icons/Logo.png',
    data: notificationData.data || {},
    actions: notificationData.actions || [],
    requireInteraction: notificationData.requireInteraction || false,
    silent: notificationData.silent || false,
    tag: notificationData.tag || 'grubgate-partner-notification',
    renotify: notificationData.renotify || false,
    vibrate: notificationData.vibrate || [200, 100, 200],
    timestamp: notificationData.timestamp || Date.now()
  };
  
  const title = notificationData.title || 'GrubGate Partner';
  
  console.log('Showing notification:', title, options);
  
  event.waitUntil(
    self.registration.showNotification(title, options)
      .then(() => {
        console.log('✅ Notification displayed successfully');
      })
      .catch((error) => {
        console.error('❌ Failed to show notification:', error);
      })
  );
});

// Notification click event: Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');
  
  // Handle Firebase partner notifications
  if (event.notification.data && event.notification.data.type) {
    const notification = event.notification;
    const data = notification.data || {};
    
    notification.close();
    
    // Handle action buttons for partner notifications
    if (event.action) {
      handlePartnerNotificationAction(event.action, data);
    } else {
      // Handle main notification click
      handlePartnerNotificationClick(data);
    }
    return;
  }
  
  // Handle regular notifications
  event.notification.close();
  
  const data = event.notification.data || {};
  const url = data.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window/tab open with the target URL
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // If no existing window, open a new one
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Notification close event: Handle notification dismissal
self.addEventListener('notificationclose', (event) => {
  console.log('Service Worker: Notification closed');
  
  // You can track notification dismissal here for analytics
  const data = event.notification.data || {};
  if (data.trackDismissal) {
    // Send analytics event
    console.log('Notification dismissed:', data);
  }
});

// Background sync event: Handle background sync
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered');
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Perform background sync operations here
      Promise.resolve()
    );
  }
});

// Message event: Handle messages from the main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_VERSION });
  }
});

console.log('🔥 Firebase Messaging Service Worker integrated with PWA Service Worker');
