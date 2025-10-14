// PWA utility functions for GrubGate Partner Portal
import { isDevelopment } from './config/env.js';

// Helper: Unregister all SWs and clear caches (used in development)
export const unregisterAllServiceWorkers = async () => {
  try {
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
    }
    if ('caches' in window) {
      const names = await caches.keys();
      await Promise.all(names.map((n) => caches.delete(n)));
    }
    console.log('PWA (dev): Unregistered all service workers and cleared caches');
    return { success: true };
  } catch (err) {
    console.warn('PWA (dev): Failed to fully unregister/clear caches', err);
    return { success: false, error: err?.message };
  }
};

// Function to register the service worker (disabled in development)
export const registerPWA = () => {
  if (isDevelopment) {
    // Never register SW in Vite dev; it breaks @vite/client and CSS HMR
    return;
  }
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('Service Worker registered with scope:', registration.scope);

          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content is available, show update notification
                showUpdateNotification();
              }
            });
          });
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    });
  }
};

// Function to request permission for push notifications
export const requestNotificationPermission = async () => {
  try {
    // Check if notifications are supported
    if (!('Notification' in window)) {
      throw new Error('This browser does not support notifications');
    }

    // Check current permission status
    let permission = Notification.permission;
    
    if (permission === 'default') {
      // Request permission from user
      permission = await Notification.requestPermission();
    }

    if (permission === 'granted') {
      console.log('Notification permission granted');
      
      // For development, we'll skip push subscription setup
      // In production, you would set up proper VAPID keys and backend
      console.log('Notification permission granted - push subscription skipped for development');
      
      // Optional: Subscribe to push notifications if VAPID key is configured
      if ('serviceWorker' in navigator && 'PushManager' in window && import.meta.env.VITE_VAPID_PUBLIC_KEY) {
        try {
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY
          });
          
          console.log('Push subscription successful:', subscription);
          return { success: true, subscription };
        } catch (pushError) {
          console.warn('Push subscription failed (this is expected in development):', pushError.message);
          return { success: true }; // Still return success since notification permission was granted
        }
      }
      
      return { success: true };
    } else if (permission === 'denied') {
      throw new Error('Notification permission denied by user');
    } else {
      throw new Error('Notification permission not granted');
    }
  } catch (error) {
    console.error('Notification permission request failed:', error);
    return { success: false, error: error.message };
  }
};

// Function to test push notifications (for development)
export const testPushNotification = async () => {
  try {
    const permission = await requestNotificationPermission();
    
    if (permission.success) {
      // Show a test notification
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        registration.showNotification('GrubGate Partner', {
          body: 'Test notification from GrubGate Partner Portal',
          icon: '/icons/logo192.png',
          badge: '/icons/Logo.png',
          tag: 'test-notification',
          requireInteraction: true,
          actions: [
            {
              action: 'view',
              title: 'View Dashboard',
              icon: '/icons/Logo.png'
            },
            {
              action: 'dismiss',
              title: 'Dismiss'
            }
          ]
        });
      }
      
      return { success: true };
    } else {
      throw new Error(permission.error);
    }
  } catch (error) {
    console.error('Test notification failed:', error);
    return { success: false, error: error.message };
  }
};

// Function to get notification permission status
export const getNotificationPermissionStatus = () => {
  if (!('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
};

// Function to unsubscribe from push notifications
export const unsubscribeFromPushNotifications = async () => {
  try {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        console.log('Successfully unsubscribed from push notifications');
        return { success: true };
      } else {
        return { success: true, message: 'No active subscription found' };
      }
    } else {
      throw new Error('Push notifications not supported');
    }
  } catch (error) {
    console.error('Unsubscribe failed:', error);
    return { success: false, error: error.message };
  }
};

// Function to show update notification
const showUpdateNotification = () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification('App Update Available', {
        body: 'A new version of GrubGate Partner Portal is available. Click to update.',
        icon: '/icons/logo192.png',
        badge: '/icons/Logo.png',
        tag: 'app-update',
        requireInteraction: true,
        actions: [
          {
            action: 'update',
            title: 'Update Now'
          },
          {
            action: 'dismiss',
            title: 'Later'
          }
        ]
      });
    });
  }
};

// Function to check if app is installed
export const isAppInstalled = () => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone === true ||
         document.referrer.includes('android-app://');
};

// Global variable to store the install prompt event
let deferredPrompt = null;

// Function to set up install prompt handling
export const setupInstallPrompt = () => {
  // Listen for the beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', (e) => {
    console.log('PWA: beforeinstallprompt event fired');
    
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    
    // Store the event so it can be triggered later
    deferredPrompt = e;
    
    // Optionally show your custom install button here
    console.log('PWA: Install prompt ready - can be triggered by user action');
    
    // Dispatch custom event to notify app that install is available
    window.dispatchEvent(new CustomEvent('pwa-install-available'));
  });
  
  // Listen for when the app is successfully installed
  window.addEventListener('appinstalled', () => {
    console.log('PWA: App was installed successfully');
    deferredPrompt = null;
    
    // Dispatch custom event to notify app of successful installation
    window.dispatchEvent(new CustomEvent('pwa-installed'));
  });
};

// Function to trigger the install prompt (must be called from user gesture)
export const promptInstallApp = async () => {
  try {
    if (!deferredPrompt) {
      console.log('PWA: No install prompt available');
      return { success: false, error: 'Install prompt not available' };
    }
    
    // Show the install prompt
    const result = await deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const choiceResult = await deferredPrompt.userChoice;
    
    if (choiceResult.outcome === 'accepted') {
      console.log('PWA: User accepted the install prompt');
      deferredPrompt = null;
      return { success: true, outcome: 'accepted' };
    } else {
      console.log('PWA: User dismissed the install prompt');
      return { success: true, outcome: 'dismissed' };
    }
  } catch (error) {
    console.error('PWA: Error showing install prompt:', error);
    return { success: false, error: error.message };
  }
};

// Function to check if install prompt is available
export const isInstallPromptAvailable = () => {
  return deferredPrompt !== null;
};

// Function to get app version from service worker
export const getAppVersion = () => {
  return new Promise((resolve) => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        if (registration.active) {
          const messageChannel = new MessageChannel();
          messageChannel.port1.onmessage = (event) => {
            resolve(event.data.version || 'unknown');
          };
          registration.active.postMessage({ type: 'GET_VERSION' }, [messageChannel.port2]);
        } else {
          resolve('unknown');
        }
      });
    } else {
      resolve('unknown');
    }
  });
};

// Function to clear all caches (for development)
export const clearAllCaches = async () => {
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
    console.log('All caches cleared');
    return { success: true };
  }
  return { success: false, error: 'Caches not supported' };
};

// Function to check if app is online
export const isOnline = () => {
  return navigator.onLine;
};

// Function to handle online/offline events
export const setupOnlineOfflineHandlers = (onOnline, onOffline) => {
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
};

// Initialize PWA features
export const initializePWA = () => {
  // In development, ensure no SW is active to avoid intercepting Vite dev assets
  if (isDevelopment) {
    unregisterAllServiceWorkers();
    console.log('PWA (dev): Skipping SW registration in development');
    return;
  }

  // Register service worker
  registerPWA();

  // Setup install prompt handling
  setupInstallPrompt();

  // Setup online/offline handlers
  setupOnlineOfflineHandlers(
    () => console.log('App is online'),
    () => console.log('App is offline')
  );

  console.log('PWA initialized for GrubGate Partner Portal');
};






