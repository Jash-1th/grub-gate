import React, { useState, useEffect, useCallback } from 'react';
import { Bell, X, Settings, Check, AlertCircle } from 'lucide-react';
import pushNotificationService from '../../services/pushNotificationService';

const NotificationManager = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationStatus, setNotificationStatus] = useState({});
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Initialize notification service
  useEffect(() => {
    const initializeNotifications = async () => {
      await pushNotificationService.initialize();
      updateNotificationStatus();
      loadNotificationPreferences();
    };

    initializeNotifications();

    // Listen for custom notification events
    const handleNotification = (event) => {
      const notification = event.detail;
      setNotifications(prev => [notification, ...prev.slice(0, 49)]);
    };

    window.addEventListener('grubgate-notification', handleNotification);

    return () => {
      window.removeEventListener('grubgate-notification', handleNotification);
    };
  }, []);

  // Update notification status
  const updateNotificationStatus = useCallback(() => {
    const status = pushNotificationService.getNotificationStatus();
    setNotificationStatus(status);
  }, []);

  // Load notification preferences
  const loadNotificationPreferences = useCallback(async () => {
    try {
      const prefs = await pushNotificationService.getNotificationPreferences();
      if (prefs) {
        setPreferences(prefs.preferences || {});
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    }
  }, []);

  // Request notification permission
  const handleEnableNotifications = async () => {
    setIsLoading(true);
    try {
      const success = await pushNotificationService.requestPermissionAndRegister();
      if (success) {
        updateNotificationStatus();
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Send test notification
  const handleTestNotification = async () => {
    setIsLoading(true);
    try {
      await pushNotificationService.sendTestNotification();
    } catch (error) {
      console.error('Error sending test notification:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update notification preferences
  const handlePreferenceChange = async (key, value) => {
    const updatedPreferences = { ...preferences, [key]: value };
    setPreferences(updatedPreferences);

    try {
      await pushNotificationService.updateNotificationPreferences(updatedPreferences);
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };

  // Mark notification as read
  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    pushNotificationService.markNotificationAsRead(notificationId);
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
    pushNotificationService.clearAllNotifications();
  };

  // Get unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Notification status indicator
  const getStatusIndicator = () => {
    if (!notificationStatus.supported) {
      return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
    
    if (notificationStatus.enabled) {
      return <div className="w-2 h-2 bg-green-500 rounded-full"></div>;
    }
    
    if (notificationStatus.permission === 'denied') {
      return <div className="w-2 h-2 bg-red-500 rounded-full"></div>;
    }
    
    return <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>;
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6" />
        
        {/* Status Indicator */}
        <div className="absolute -top-1 -right-1">
          {getStatusIndicator()}
        </div>
        
        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
                aria-label="Notification settings"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
                aria-label="Close notifications"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Notification Settings</h4>
              
              {/* Enable/Disable Notifications */}
              {!notificationStatus.enabled ? (
                <button
                  onClick={handleEnableNotifications}
                  disabled={isLoading}
                  className="w-full mb-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Enabling...' : 'Enable Notifications'}
                </button>
              ) : (
                <div className="mb-3 p-2 bg-green-100 text-green-800 rounded-lg text-sm">
                  ✅ Notifications enabled
                </div>
              )}

              {/* Test Notification */}
              {notificationStatus.enabled && (
                <button
                  onClick={handleTestNotification}
                  disabled={isLoading}
                  className="w-full mb-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Sending...' : 'Send Test Notification'}
                </button>
              )}

              {/* Notification Preferences */}
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.orderAlerts !== false}
                    onChange={(e) => handlePreferenceChange('orderAlerts', e.target.checked)}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Order updates</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.subscriptionReminders !== false}
                    onChange={(e) => handlePreferenceChange('subscriptionReminders', e.target.checked)}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Meal planning reminders</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.promotionalOffers !== false}
                    onChange={(e) => handlePreferenceChange('promotionalOffers', e.target.checked)}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Promotional offers</span>
                </label>
              </div>
            </div>
          )}

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <>
                {/* Clear All Button */}
                {notifications.length > 0 && (
                  <div className="p-2 border-b border-gray-200">
                    <button
                      onClick={clearAllNotifications}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Clear all
                    </button>
                  </div>
                )}

                {/* Notification Items */}
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.body}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {notification.timestamp?.toLocaleTimeString()}
                        </p>
                      </div>
                      
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1"></div>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Status Footer */}
          <div className="p-3 bg-gray-50 text-xs text-gray-500 border-t border-gray-200">
            Status: {notificationStatus.enabled ? 'Enabled' : 'Disabled'} • 
            Permission: {notificationStatus.permission || 'Unknown'}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationManager;
