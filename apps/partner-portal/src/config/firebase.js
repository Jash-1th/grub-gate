// Firebase configuration for Partner Portal
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Firebase config from environment variables (same as Customer App)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAMLs_SO_LBTWvPcKLyr7fO2tuw7xn2DbM",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "messagegg-39a44.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "messagegg-39a44",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "messagegg-39a44.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "357081663277",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:357081663277:web:c787254ff6f8a76ad5b5a4",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-H8SSXVS813"
};

// VAPID key for web push
const vapidKey = import.meta.env.VITE_VAPID_KEY || "BCb-KaEfIQ6jRIfBNbTktSJ20PjMWLt9vWqGdeiC7RL8jnItCSTZWUtVQyz2EOa7o2U6IfXKe7GjiFEdwacQnsw";

// Validate configuration
const validateFirebaseConfig = () => {
  const requiredKeys = ['apiKey', 'projectId', 'messagingSenderId', 'appId'];
  const missing = requiredKeys.filter(key => !firebaseConfig[key]);
  
  if (missing.length > 0) {
    console.warn('⚠️ Missing Firebase config keys:', missing);
    return false;
  }
  
  if (!vapidKey) {
    console.warn('⚠️ Missing VAPID key for push notifications');
    return false;
  }
  
  return true;
};

// Initialize Firebase
let app = null;
let messaging = null;

try {
  if (validateFirebaseConfig()) {
    app = initializeApp(firebaseConfig);
    
    // Initialize messaging only in browser environment
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      messaging = getMessaging(app);
      console.log('✅ Firebase messaging initialized for Partner Portal');
    }
  }
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
}

// Check if push notifications are supported
export const isPushNotificationSupported = () => {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    messaging !== null
  );
};

// Request notification permission
export const requestNotificationPermission = async () => {
  if (!isPushNotificationSupported()) {
    throw new Error('Push notifications are not supported');
  }

  try {
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('✅ Partner notification permission granted');
      return true;
    } else if (permission === 'denied') {
      console.log('❌ Partner notification permission denied');
      return false;
    } else {
      console.log('⚠️ Partner notification permission dismissed');
      return false;
    }
  } catch (error) {
    console.error('❌ Error requesting partner notification permission:', error);
    throw error;
  }
};

// Get FCM token for Partner Portal
export const getFCMToken = async () => {
  if (!messaging) {
    throw new Error('Firebase messaging not initialized');
  }

  try {
    // Register service worker for Partner Portal
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw-partner.js');
    console.log('✅ Partner service worker registered:', registration);

    // Wait for service worker to become active
    if (registration.installing || registration.waiting) {
      console.log('🔄 Waiting for partner service worker to activate...');
      await new Promise((resolve) => {
        const checkState = () => {
          if (registration.active) {
            console.log('✅ Partner service worker is now active');
            resolve();
          } else {
            setTimeout(checkState, 100);
          }
        };
        checkState();
      });
    }

    // Ensure service worker is fully ready
    await navigator.serviceWorker.ready;
    console.log('✅ Partner service worker is ready');

    const token = await getToken(messaging, {
      vapidKey: vapidKey,
      serviceWorkerRegistration: registration
    });

    if (token) {
      console.log('✅ Partner FCM token generated:', token.substring(0, 20) + '...');
      return token;
    } else {
      console.log('❌ No Partner FCM token available');
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting Partner FCM token:', error);
    throw error;
  }
};

// Listen for foreground messages in Partner Portal
export const onForegroundMessage = (callback) => {
  if (!messaging) {
    console.warn('⚠️ Firebase messaging not initialized');
    return () => {};
  }

  try {
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('📱 Partner foreground message received:', payload);
      
      // Extract notification data
      const notification = {
        title: payload.notification?.title || 'New Partner Notification',
        body: payload.notification?.body || '',
        icon: payload.notification?.icon || '/icons/partner-notification-icon.png',
        data: payload.data || {}
      };

      callback(notification);
    });

    return unsubscribe;
  } catch (error) {
    console.error('❌ Error setting up partner foreground message listener:', error);
    return () => {};
  }
};

// Get device info for token registration
export const getDeviceInfo = () => {
  if (typeof window === 'undefined') {
    return {};
  }

  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    browser: getBrowserName(),
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    appType: 'partner-portal'
  };
};

// Helper function to detect browser
const getBrowserName = () => {
  const userAgent = navigator.userAgent;
  
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  if (userAgent.includes('Opera')) return 'Opera';
  
  return 'Unknown';
};

// Export Firebase instances
export { app, messaging };

// Export configuration validation
export { validateFirebaseConfig };
