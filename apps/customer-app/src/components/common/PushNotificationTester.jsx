import React, { useState, useEffect } from 'react';
import { 
  requestNotificationPermission, 
  testPushNotification,
  getNotificationPermissionStatus,
  unsubscribeFromPushNotifications
} from '../../pwa';

const PushNotificationTester = () => {
  const [permissionStatus, setPermissionStatus] = useState('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Check initial permission status
    const status = getNotificationPermissionStatus();
    setPermissionStatus(status);
    
    // Check if user is already subscribed
    checkSubscriptionStatus();
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      }
    } catch (error) {
      console.error('Error checking subscription status:', error);
    }
  };

  const handleRequestPermission = async () => {
    setIsLoading(true);
    setMessage('');
    
    try {
      const subscription = await requestNotificationPermission();
      setPermissionStatus('granted');
      setIsSubscribed(!!subscription);
      setMessage('✅ Push notifications enabled successfully!');
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
      const status = getNotificationPermissionStatus();
      setPermissionStatus(status);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotification = async () => {
    setIsLoading(true);
    setMessage('');
    
    try {
      await testPushNotification();
      setMessage('🔔 Test notification sent! Check your system notifications.');
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setIsLoading(true);
    setMessage('');
    
    try {
      await unsubscribeFromPushNotifications();
      setIsSubscribed(false);
      setMessage('✅ Successfully unsubscribed from push notifications.');
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'granted':
        return 'text-green-600';
      case 'denied':
        return 'text-red-600';
      case 'not-supported':
        return 'text-gray-600';
      default:
        return 'text-yellow-600';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'granted':
        return 'Granted ✅';
      case 'denied':
        return 'Denied ❌';
      case 'not-supported':
        return 'Not Supported ⚠️';
      default:
        return 'Not Requested ⏳';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 max-w-md mx-auto">
      <h3 className="text-xl font-bold text-grub-red mb-4">
        🔔 Push Notification Tester
      </h3>
      
      {/* Permission Status */}
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-700 mb-2">Permission Status:</p>
        <p className={`text-sm font-semibold ${getStatusColor(permissionStatus)}`}>
          {getStatusText(permissionStatus)}
        </p>
      </div>

      {/* Subscription Status */}
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-700 mb-2">Subscription Status:</p>
        <p className={`text-sm font-semibold ${isSubscribed ? 'text-green-600' : 'text-gray-600'}`}>
          {isSubscribed ? 'Subscribed ✅' : 'Not Subscribed ❌'}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 mb-4">
        {permissionStatus !== 'granted' && (
          <button
            onClick={handleRequestPermission}
            disabled={isLoading || permissionStatus === 'denied'}
            className="w-full px-4 py-2 bg-grub-red text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Requesting...' : 'Request Permission'}
          </button>
        )}

        {permissionStatus === 'granted' && isSubscribed && (
          <>
            <button
              onClick={handleTestNotification}
              disabled={isLoading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Sending...' : 'Test Notification'}
            </button>

            <button
              onClick={handleUnsubscribe}
              disabled={isLoading}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Unsubscribing...' : 'Unsubscribe'}
            </button>
          </>
        )}
      </div>

      {/* Message Display */}
      {message && (
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-800">{message}</p>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-semibold text-blue-800 mb-2">Instructions:</h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>1. Click "Request Permission" to enable notifications</li>
          <li>2. Click "Test Notification" to see a sample notification</li>
          <li>3. Check your system's notification area</li>
          <li>4. Click on notifications to test the click handling</li>
        </ul>
      </div>

      {/* Developer Notes */}
      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="text-sm font-semibold text-yellow-800 mb-2">Notes:</h4>
        <ul className="text-xs text-yellow-700 space-y-1">
          <li>• This uses placeholder VAPID keys</li>
          <li>• Subscription data is logged to console</li>
          <li>• Works in development and production</li>
          <li>• Requires HTTPS in production</li>
        </ul>
      </div>
    </div>
  );
};

export default PushNotificationTester;
