// Cache names with versioning for better cache management
const CACHE_VERSION = '2.1.5'; // Added error logging for notification display
const CACHE_NAME = `grubgate-v${CACHE_VERSION}`;
const STATIC_CACHE = `grubgate-static-v${CACHE_VERSION}`;
const DYNAMIC_CACHE = `grubgate-dynamic-v${CACHE_VERSION}`;
const IMAGE_CACHE = `grubgate-images-v${CACHE_VERSION}`;

// App Shell - Critical resources for instant loading
const APP_SHELL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/critical.css',
  '/images/launch-background.jpg',
  '/icons/logo192.png',
  '/icons/logo512.png',
  '/icons/Logo.png' // Keep existing logo for backward compatibility
];

// Static assets that change infrequently
const STATIC_ASSETS = [
  '/vite.svg',
  // Add your built CSS and JS files here after build
  // These will be dynamically added during runtime
];

// Install event: Pre-cache App Shell and critical static assets
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Installing version', CACHE_VERSION);
  
  event.waitUntil(
    Promise.all([
      // Cache App Shell assets
      caches.open(CACHE_NAME)
        .then((cache) => {
          console.log('📦 Service Worker: Caching App Shell assets');
          return cache.addAll(APP_SHELL_ASSETS.map(url => {
            // Add cache-busting parameter to ensure fresh content
            return new Request(url, { cache: 'reload' });
          }));
        }),
      
      // Cache static assets
      caches.open(STATIC_CACHE)
        .then((cache) => {
          console.log('🗂️ Service Worker: Caching static assets');
          return cache.addAll(STATIC_ASSETS.map(url => {
            return new Request(url, { cache: 'reload' });
          }));
        })
    ])
    .then(() => {
      console.log('✅ Service Worker: Installation complete');
      // Force the waiting service worker to become the active service worker
      return self.skipWaiting();
    })
    .catch((error) => {
      console.error('❌ Service Worker: Installation failed', error);
      throw error;
    })
  );
});
// Activate event: Clean up old caches and claim clients
self.addEventListener('activate', (event) => {
  console.log('🔄 Service Worker: Activating version', CACHE_VERSION);
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        const currentCaches = [CACHE_NAME, STATIC_CACHE, DYNAMIC_CACHE, IMAGE_CACHE];
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!currentCaches.includes(cacheName)) {
              console.log('🗑️ Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Take control of all clients immediately
      self.clients.claim().then(() => {
        console.log('✅ Service Worker: Now controlling all clients');
      })
    ])
    .then(() => {
      console.log('✨ Service Worker: Activation complete');
    })
    .catch((error) => {
      console.error('❌ Service Worker: Activation failed', error);
    })
  );
});

// Utility function to determine caching strategy based on request
const getCachingStrategy = (request) => {
  const url = new URL(request.url);
  
  // App Shell files (index.html, manifest, etc.) - Stale While Revalidate
  if (APP_SHELL_ASSETS.some(asset => url.pathname === asset || url.pathname.endsWith(asset))) {
    return 'stale-while-revalidate';
  }
  
  // API calls - Network First with cache fallback
  if (url.pathname.startsWith('/api/') || request.mode === 'navigate') {
    return 'network-first';
  }
  
  // Images - Cache First with network fallback
  if (request.destination === 'image' || url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/)) {
    return 'cache-first-images';
  }
  
  // Static assets (CSS, JS, fonts) - Cache First
  if (request.destination === 'script' || request.destination === 'style' || 
      url.pathname.match(/\.(js|css|woff|woff2|ttf|eot)$/)) {
    return 'cache-first';
  }
  
  // Default - Network First
  return 'network-first';
};

// Fetch event: Sophisticated hybrid caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Skip non-http requests
  if (!request.url.startsWith('http')) {
    return;
  }
  
  // Skip non-GET requests (POST, PUT, DELETE, etc.) as they cannot be cached
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip external API calls that shouldn't be cached
  const url = new URL(request.url);
  const isExternalAPI = (
    url.hostname.includes('firebaseio.com') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('emailjs.com') ||
    url.hostname.includes('firebase.com') ||
    (url.hostname !== self.location.hostname && !url.hostname.includes('localhost')) ||
    (url.hostname.includes('localhost') && url.port !== self.location.port && url.pathname.startsWith('/api/'))
  );
  
  if (isExternalAPI) {
    return;
  }
  
  const strategy = getCachingStrategy(request);
  
  switch (strategy) {
    case 'stale-while-revalidate':
      event.respondWith(staleWhileRevalidate(request, CACHE_NAME));
      break;
      
    case 'network-first':
      event.respondWith(networkFirst(request, DYNAMIC_CACHE));
      break;
      
    case 'cache-first':
      event.respondWith(cacheFirst(request, STATIC_CACHE));
      break;
      
    case 'cache-first-images':
      event.respondWith(cacheFirst(request, IMAGE_CACHE));
      break;
      
    default:
      event.respondWith(networkFirst(request, DYNAMIC_CACHE));
  }
});

// Stale While Revalidate Strategy
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  // Fetch fresh content in background
  const fetchPromise = fetch(request)
    .then(response => {
      if (response.ok && request.method === 'GET') {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(error => {
      console.warn('⚠️ Network fetch failed for:', request.url, error);
      return cachedResponse;
    });
  
  // Return cached response immediately if available, otherwise wait for network
  return cachedResponse || fetchPromise;
}

// Network First Strategy with cache fallback
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    
    // Only cache GET requests with successful responses
    if (response.ok && request.method === 'GET') {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.warn('⚠️ Network failed for:', request.url, 'trying cache');
    
    // Try cache fallback
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If it's a navigation request and no cache, return app shell
    if (request.mode === 'navigate') {
      const appShellCache = await caches.open(CACHE_NAME);
      return appShellCache.match('/index.html');
    }
    
    throw error;
  }
}

// Cache First Strategy with network fallback
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const response = await fetch(request);
    
    if (response.ok && request.method === 'GET') {
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.warn('⚠️ Failed to fetch and cache:', request.url, error);
    throw error;
  }
}

// Push event: handles incoming push notifications
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);
  
  // Extract notification data from the push event
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
    } catch (error) {
      console.error('Error parsing push data:', error);
      notificationData = {
        title: 'GrubGate',
        body: 'You have a new notification!'
      };
    }
  }
  
  // Set default values if no data is provided
  const {
    title = 'GrubGate',
    body = 'You have a new notification from GrubGate!',
    icon = '/icons/logo192.png',
    badge = '/icons/logo192.png',
    tag = 'grubgate-notification',
    data: customData = {},
    actions = [],
    requireInteraction = false
  } = notificationData;
  
  const options = {
    body: body,
    icon: icon,
    badge: badge,
    tag: tag,
    data: {
      ...customData,
      timestamp: Date.now(),
      url: customData.url || '/'
    },
    actions: actions,
    requireInteraction: requireInteraction,
    vibrate: [200, 100, 200],
    renotify: true
  };
  
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

// Notification click event: handles what happens when user clicks the notification
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  // Close the notification
  event.notification.close();
  
  // Get the URL to open (default to home page)
  const urlToOpen = event.notification.data?.url || '/';
  const fullUrl = new URL(urlToOpen, self.location.origin).href;
  
  // Handle action button clicks if any
  if (event.action) {
    console.log('Action clicked:', event.action);
    // Handle different actions here
    switch (event.action) {
      case 'view-order':
        // Handle view order action
        break;
      case 'dismiss':
        // Just close the notification (already done above)
        return;
      default:
        break;
    }
  }
  
  // This handles the click on the notification itself (not action buttons)
  event.waitUntil(
    self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    })
    .then((clientList) => {
      // Check if there's already a window/tab open with the target URL
      for (const client of clientList) {
        if (client.url === fullUrl && 'focus' in client) {
          return client.focus();
        }
      }
      
      // If no existing window is found, check for any GrubGate window
      for (const client of clientList) {
        if (client.url.startsWith(self.location.origin) && 'navigate' in client) {
          client.navigate(fullUrl);
          return client.focus();
        }
      }
      
      // If no window is open, open a new one
      if (self.clients.openWindow) {
        return self.clients.openWindow(fullUrl);
      }
    })
    .catch((error) => {
      console.error('Error handling notification click:', error);
    })
  );
});

// Notification close event: handles when user dismisses the notification
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event.notification.tag);
  
  // Optional: Send analytics or tracking data
  // You can track notification dismissals here
});
