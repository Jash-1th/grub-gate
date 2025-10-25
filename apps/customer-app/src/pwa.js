// Function to register the service worker
export const registerPWA = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then((registration) => {
          console.log('Service Worker registered with scope:', registration.scope);
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
    // Step 1: Check if the browser supports service workers and the Push API
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service workers are not supported in this browser.');
    }
    
    if (!('PushManager' in window)) {
      throw new Error('Push messaging is not supported in this browser.');
    }
    
    if (!('Notification' in window)) {
      throw new Error('Notifications are not supported in this browser.');
    }
    
    console.log('✓ Browser supports service workers, push messaging, and notifications');
    
    // Step 2: Request permission from the user to show notifications
    console.log('Requesting notification permission...');
    const permission = await Notification.requestPermission();
    
    if (permission !== 'granted') {
      throw new Error(`Notification permission ${permission}. Please enable notifications to receive updates.`);
    }
    
    console.log('✓ Notification permission granted');
    
    // Step 3: Wait for service worker to be ready
    console.log('Waiting for service worker to be ready...');
    const registration = await navigator.serviceWorker.ready;
    console.log('✓ Service worker is ready');
    
    // Step 4: Check for existing subscription
    let subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      console.log('✓ Found existing push subscription:', subscription.toJSON());
      // Optional: You might want to send the existing subscription to your server here
      return subscription;
    }
    
    // Step 5: Get the VAPID public key from the server (placeholder for now)
    console.log('Getting VAPID public key...');
    const vapidPublicKey = await getVapidPublicKey();
    console.log('✓ VAPID public key retrieved');
    
    // Step 6: Subscribe the user using pushManager.subscribe()
    console.log('Creating new push subscription...');
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true, // Required for Chrome
      applicationServerKey: vapidPublicKey // Already converted to Uint8Array by getVapidPublicKey()
    });
    
    console.log('✓ New push subscription created:', subscription.toJSON());
    
    // Step 7: Send the subscription to your server
    console.log('📤 Attempting to save subscription to server...');
    try {
      const result = await sendSubscriptionToServer(subscription);
      console.log('✅ Subscription sent to server successfully:', result);
    } catch (serverError) {
      console.error('❌ Failed to send subscription to server:', serverError);
      console.error('Server error details:', serverError.message);
      // Don't throw here as the subscription is still valid locally
    }
    
    return subscription;
    
  } catch (error) {
    console.error('❌ Error requesting notification permission:', error);
    
    // Provide user-friendly error messages
    if (error.name === 'NotSupportedError') {
      console.error('Push messaging is not supported on this device/browser');
    } else if (error.name === 'NotAllowedError') {
      console.error('Permission to display notifications was blocked');
    } else if (error.name === 'AbortError') {
      console.error('Push subscription was aborted');
    }
    
    throw error; // Re-throw so calling code can handle it
  }
};

// Function to get VAPID public key
const getVapidPublicKey = async () => {
  try {
    // Get VAPID public key from environment - already in raw format (65 bytes base64url)
    const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY || 
      'BEznDlQ8AJxIzEh4fJf0ATiQIjPmKwn3rNMF6NxvaV7WVph-OCI0saDL6LeJYmEljA0QIQJtKdcaR8zgtlvSz9o';
    
    console.log('🔑 Using VAPID key from:', import.meta.env.VITE_VAPID_PUBLIC_KEY ? 'environment' : 'hardcoded (NEW)');
    
    // Convert base64url to Uint8Array (key is already in raw format)
    const rawPublicKey = urlBase64ToUint8Array(vapidPublicKey);
    
    console.log('✅ VAPID key converted:', rawPublicKey.length, 'bytes');
    
    return rawPublicKey;
  } catch (error) {
    console.error('Failed to get VAPID public key:', error);
    throw new Error('Failed to retrieve VAPID public key from server');
  }
};

// Function to send subscription to server (placeholder implementation)
const sendSubscriptionToServer = async (subscription) => {
  try {
    // Get the backend API URL from environment or default
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
    
    // Get FCM token from subscription
    const token = subscription.endpoint; // For web push, we use endpoint as token
    
    // Get auth token from localStorage - ssrSafeStorage stores it as JSON string
    let authToken = localStorage.getItem('authToken');
    
    // Parse JSON-stringified token (ssrSafeStorage wraps with JSON.stringify)
    if (authToken) {
      try {
        authToken = JSON.parse(authToken);
        console.log('🔍 DEBUG: Parsed auth token, length:', authToken?.length);
      } catch (e) {
        console.warn('⚠️ Failed to parse auth token:', e);
      }
    }
    
    if (!authToken) {
      console.warn('⚠️ No auth token found, cannot save subscription to server');
      return { success: false, error: 'Not authenticated' };
    }
    
    // Send subscription to backend
    const response = await fetch(`${API_URL}/push-notifications/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        token: token,
        deviceType: 'web',
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          browser: getBrowserName()
        },
        subscription: subscription.toJSON() // Store full subscription details
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Server responded with ${response.status}`);
    }
    
    const result = await response.json();
    console.log('✅ Subscription saved to server:', result);
    
    return { success: true, data: result };
  } catch (error) {
    console.error('❌ Failed to send subscription to server:', error);
    throw error;
  }
};

// Helper function to get browser name
function getBrowserName() {
  const userAgent = navigator.userAgent;
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  if (userAgent.includes('Opera') || userAgent.includes('OPR')) return 'Opera';
  return 'Unknown';
}

// Function to test push notifications (for development)
export const testPushNotification = async () => {
  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Create a test notification
    const options = {
      body: 'This is a test notification from GrubGate!',
      icon: '/icons/logo192.png',
      badge: '/icons/logo192.png',
      tag: 'test-notification',
      data: {
        url: '/test-page',
        timestamp: Date.now()
      },
      actions: [
        {
          action: 'view-order',
          title: 'View Order'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ],
      requireInteraction: true
    };
    
    await registration.showNotification('GrubGate Test', options);
    console.log('✓ Test notification displayed');
  } catch (error) {
    console.error('❌ Failed to show test notification:', error);
    throw error;
  }
};

// Function to check notification permission status
export const getNotificationPermissionStatus = () => {
  if (!('Notification' in window)) {
    return 'not-supported';
  }
  
  return Notification.permission;
};

// Function to unsubscribe from push notifications
export const unsubscribeFromPushNotifications = async () => {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      const successful = await subscription.unsubscribe();
      
      if (successful) {
        console.log('✓ Successfully unsubscribed from push notifications');
        
        // In a real app, you would also notify your server
        // await removeSubscriptionFromServer(subscription);
      } else {
        throw new Error('Failed to unsubscribe');
      }
    } else {
      console.log('No active push subscription found');
    }
  } catch (error) {
    console.error('❌ Error unsubscribing from push notifications:', error);
    throw error;
  }
};

// Utility function to convert VAPID key
function urlBase64ToUint8Array(base64String) {
  try {
    // Remove any whitespace
    const cleanBase64 = base64String.replace(/\s/g, '');
    
    // Calculate proper padding
    const padding = '='.repeat((4 - cleanBase64.length % 4) % 4);
    
    // Convert base64url to standard base64
    const base64 = (cleanBase64 + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    // Decode base64 string
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    
    console.log('✅ Converted', cleanBase64.length, 'chars to', outputArray.length, 'bytes');
    return outputArray;
  } catch (error) {
    console.error('❌ Error in urlBase64ToUint8Array:', error);
    console.error('Input string:', base64String);
    throw new Error('Failed to decode VAPID key: ' + error.message);
  }
}
