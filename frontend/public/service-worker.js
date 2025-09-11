const CACHE_NAME = 'grubgate-v1';

// Assets to be cached on installation
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/icons/Logo.png'
];

// Install event: opens a cache and adds the precache assets to it
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching Precache Assets');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event: cleans up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event: handles requests with a hybrid caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Network-First for navigations and API calls
  if (request.mode === 'navigate' || request.url.startsWith(self.location.origin + '/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // If the network request is successful, clone the response and cache it
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // If the network request fails, try to serve from the cache
          return caches.match(request);
        })
    );
    return;
  }

  // Cache-First for all other static assets
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      // Return the cached response if it exists
      if (cachedResponse) {
        return cachedResponse;
      }
      // Otherwise, fetch from the network, cache it, and return the response
      return fetch(request).then((networkResponse) => {
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });
        return networkResponse;
      });
    })
  );
});

// Push event: handles incoming push notifications
// self.addEventListener('push', (event) => {
//   const data = event.data ? event.data.json() : { title: 'GrubGate', body: 'New notification!' };
//   const { title, body } = data;

// const options = {
//     body: body,
//     icon: '/icons/Logo.png',
//     badge: '/icons/Logo.png'
//   };

//   event.waitUntil(
//     self.registration.showNotification(title, options)
//   );
// });
