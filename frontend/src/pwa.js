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
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
    });
    
    console.log('✓ New push subscription created:', subscription.toJSON());
    
    // Step 7: Send the subscription to your server
    try {
      await sendSubscriptionToServer(subscription);
      console.log('✓ Subscription sent to server successfully');
    } catch (serverError) {
      console.warn('Warning: Failed to send subscription to server:', serverError);
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

// Function to get VAPID public key (placeholder implementation)
const getVapidPublicKey = async () => {
  try {
    // In a real application, you would fetch this from your server
    // const response = await fetch('/api/vapid-public-key');
    // const data = await response.json();
    // return data.publicKey;
    
    // For now, return a placeholder VAPID public key
    // Replace this with your actual VAPID public key
    const placeholderKey = 'BEl62iUYgUivxIkv69yViEuiBIa40HI80NcL_8WNZZJlmKlpfxcE4zUOZMB6xFaI8HlHdQP48gwb25Pk6YdxVxI';
    
    // Simulate a server request delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return placeholderKey;
  } catch (error) {
    console.error('Failed to get VAPID public key:', error);
    throw new Error('Failed to retrieve VAPID public key from server');
  }
};

// Function to send subscription to server (placeholder implementation)
const sendSubscriptionToServer = async (subscription) => {
  try {
    // In a real application, you would send the subscription to your server
    // const response = await fetch('/api/push-subscription', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(subscription.toJSON())
    // });
    // 
    // if (!response.ok) {
    //   throw new Error(`Server responded with ${response.status}`);
    // }
    // 
    // return await response.json();
    
    // Placeholder implementation - just log the subscription
    console.log('📤 Would send to server:', subscription.toJSON());
    
    // Simulate a server request
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return { success: true, message: 'Subscription saved (placeholder)' };
  } catch (error) {
    console.error('Failed to send subscription to server:', error);
    throw error;
  }
};

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
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
