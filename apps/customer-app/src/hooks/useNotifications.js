import { useState, useEffect, useCallback } from 'react';
import pushNotificationService from '../services/pushNotificationService';

/**
 * Custom hook for managing push notifications
 */
export const useNotifications = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [preferences, setPreferences] = useState({});
  const [status, setStatus] = useState({});

  // Initialize notifications on mount
  useEffect(() => {
    initializeNotifications();
  }, []);

  // Listen for notification events
  useEffect(() => {
    const handleNotification = (event) => {
      const notification = event.detail;
      setNotifications(prev => [
        { ...notification, id: Date.now(), timestamp: new Date(), read: false },
        ...prev.slice(0, 49) // Keep only last 50 notifications
      ]);
    };

    window.addEventListener('grubgate-notification', handleNotification);

    return () => {
      window.removeEventListener('grubgate-notification', handleNotification);
    };
  }, []);

  /**
   * Initialize notification service
   */
  const initializeNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const initialized = await pushNotificationService.initialize();
      setIsInitialized(initialized);

      if (initialized) {
        updateStatus();
        await loadPreferences();
      }
    } catch (err) {
      setError(err.message);
      console.error('Error initializing notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Request notification permission and register token
   */
  const enableNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const success = await pushNotificationService.requestPermissionAndRegister();
      setIsEnabled(success);
      updateStatus();

      return success;
    } catch (err) {
      setError(err.message);
      console.error('Error enabling notifications:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Disable notifications
   */
  const disableNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      await pushNotificationService.removeTokenFromBackend();
      setIsEnabled(false);
      updateStatus();

      return true;
    } catch (err) {
      setError(err.message);
      console.error('Error disabling notifications:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Send test notification
   */
  const sendTestNotification = useCallback(async (title, body) => {
    try {
      setIsLoading(true);
      setError(null);

      const success = await pushNotificationService.sendTestNotification(title, body);
      return success;
    } catch (err) {
      setError(err.message);
      console.error('Error sending test notification:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update notification preferences
   */
  const updatePreferences = useCallback(async (newPreferences) => {
    try {
      setIsLoading(true);
      setError(null);

      const success = await pushNotificationService.updateNotificationPreferences(newPreferences);
      
      if (success) {
        setPreferences(newPreferences);
      }

      return success;
    } catch (err) {
      setError(err.message);
      console.error('Error updating preferences:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Load notification preferences
   */
  const loadPreferences = useCallback(async () => {
    try {
      const data = await pushNotificationService.getNotificationPreferences();
      
      if (data && data.preferences) {
        setPreferences(data.preferences);
      }

      return data;
    } catch (err) {
      console.error('Error loading preferences:', err);
      return null;
    }
  }, []);

  /**
   * Update notification status
   */
  const updateStatus = useCallback(() => {
    const currentStatus = pushNotificationService.getNotificationStatus();
    setStatus(currentStatus);
    setIsEnabled(currentStatus.enabled);
  }, []);

  /**
   * Mark notification as read
   */
  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    pushNotificationService.markNotificationAsRead(notificationId);
  }, []);

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
  }, []);

  /**
   * Clear all notifications
   */
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    pushNotificationService.clearAllNotifications();
  }, []);

  /**
   * Remove specific notification
   */
  const removeNotification = useCallback((notificationId) => {
    setNotifications(prev =>
      prev.filter(n => n.id !== notificationId)
    );
  }, []);

  // Computed values
  const unreadCount = notifications.filter(n => !n.read).length;
  const hasUnread = unreadCount > 0;

  return {
    // State
    isInitialized,
    isEnabled,
    isLoading,
    error,
    notifications,
    preferences,
    status,
    
    // Computed
    unreadCount,
    hasUnread,
    
    // Actions
    initializeNotifications,
    enableNotifications,
    disableNotifications,
    sendTestNotification,
    updatePreferences,
    loadPreferences,
    updateStatus,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
    removeNotification,
    
    // Utilities
    isSupported: status.supported,
    permission: status.permission,
    canEnable: status.supported && status.permission !== 'denied'
  };
};

export default useNotifications;
