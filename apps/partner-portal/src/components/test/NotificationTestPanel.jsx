import React, { useState, useEffect } from 'react';
import partnerPushNotificationService from '../../services/pushNotificationService';
import { apiClient } from '../../api/client';

const NotificationTestPanel = () => {
  const [status, setStatus] = useState({
    supported: false,
    permission: 'default',
    initialized: false,
    tokenRegistered: false,
    enabled: false
  });
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Add log entry
  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { message, type, timestamp }]);
  };

  // Update status
  const updateStatus = () => {
    const currentStatus = partnerPushNotificationService.getNotificationStatus();
    setStatus(currentStatus);
    addLog(`Status updated: ${JSON.stringify(currentStatus)}`, 'info');
  };

  // Initialize notifications
  const handleInitialize = async () => {
    setIsLoading(true);
    addLog('🔔 Starting notification initialization...', 'info');
    
    try {
      const initialized = await partnerPushNotificationService.initialize();
      addLog(`Initialization result: ${initialized}`, initialized ? 'success' : 'error');
      
      if (initialized) {
        const registered = await partnerPushNotificationService.requestPermissionAndRegister();
        addLog(`Registration result: ${registered}`, registered ? 'success' : 'error');
      }
      
      updateStatus();
    } catch (error) {
      addLog(`❌ Error: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Request permission
  const handleRequestPermission = async () => {
    setIsLoading(true);
    addLog('🔐 Requesting notification permission...', 'info');
    
    try {
      const registered = await partnerPushNotificationService.requestPermissionAndRegister();
      addLog(`Permission result: ${registered}`, registered ? 'success' : 'error');
      updateStatus();
    } catch (error) {
      addLog(`❌ Permission error: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Send test notification via API
  const handleSendTestNotification = async () => {
    setIsLoading(true);
    addLog('📱 Sending test notification via API...', 'info');
    
    try {
      const response = await apiClient.post('/notifications/test', {
        title: '🧪 Partner Portal Test',
        body: 'This is a test notification from the Partner Portal!',
        data: {
          type: 'TEST',
          action: 'view_dashboard'
        }
      });
      
      if (response.data.status === 'success') {
        addLog('✅ Test notification sent successfully!', 'success');
      } else {
        addLog(`❌ API Error: ${response.data.message}`, 'error');
      }
    } catch (error) {
      addLog(`❌ API Error: ${error.response?.data?.message || error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Send browser notification (local test)
  const handleSendBrowserNotification = () => {
    addLog('🌐 Sending browser notification...', 'info');
    
    if (Notification.permission === 'granted') {
      const notification = new Notification('🧪 Browser Test', {
        body: 'This is a local browser notification test!',
        icon: '/icons/partner-notification-icon.png',
        badge: '/icons/partner-notification-badge.png',
        tag: 'test-notification'
      });
      
      notification.onclick = () => {
        addLog('🔔 Browser notification clicked!', 'success');
        notification.close();
      };
      
      addLog('✅ Browser notification sent!', 'success');
    } else {
      addLog('❌ Browser notifications not permitted', 'error');
    }
  };

  // Clear logs
  const handleClearLogs = () => {
    setLogs([]);
  };

  // Get notification queue
  const handleGetQueue = () => {
    const queue = partnerPushNotificationService.getNotificationQueue();
    addLog(`📋 Notification queue: ${queue.length} items`, 'info');
    queue.forEach((notification, index) => {
      addLog(`  ${index + 1}. ${notification.title} - ${notification.read ? 'Read' : 'Unread'}`, 'info');
    });
  };

  // Check initial status
  useEffect(() => {
    updateStatus();
    addLog('🚀 Notification Test Panel loaded', 'info');
  }, []);

  const getStatusColor = (value) => {
    if (typeof value === 'boolean') {
      return value ? 'text-green-600' : 'text-red-600';
    }
    if (value === 'granted') return 'text-green-600';
    if (value === 'denied') return 'text-red-600';
    return 'text-yellow-600';
  };

  const getLogColor = (type) => {
    switch (type) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'info': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          🧪 Push Notification Test Panel
        </h2>
        <p className="text-gray-600">
          Test and debug push notifications for the Partner Portal
        </p>
      </div>

      {/* Status Section */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">📊 Current Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium">Supported:</span>
            <span className={`ml-2 ${getStatusColor(status.supported)}`}>
              {status.supported ? '✅ Yes' : '❌ No'}
            </span>
          </div>
          <div>
            <span className="font-medium">Permission:</span>
            <span className={`ml-2 ${getStatusColor(status.permission)}`}>
              {status.permission}
            </span>
          </div>
          <div>
            <span className="font-medium">Initialized:</span>
            <span className={`ml-2 ${getStatusColor(status.initialized)}`}>
              {status.initialized ? '✅ Yes' : '❌ No'}
            </span>
          </div>
          <div>
            <span className="font-medium">Token Registered:</span>
            <span className={`ml-2 ${getStatusColor(status.tokenRegistered)}`}>
              {status.tokenRegistered ? '✅ Yes' : '❌ No'}
            </span>
          </div>
          <div>
            <span className="font-medium">Enabled:</span>
            <span className={`ml-2 ${getStatusColor(status.enabled)}`}>
              {status.enabled ? '✅ Yes' : '❌ No'}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">🎛️ Test Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={handleInitialize}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '⏳' : '🔧'} Initialize
          </button>
          
          <button
            onClick={handleRequestPermission}
            disabled={isLoading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '⏳' : '🔐'} Request Permission
          </button>
          
          <button
            onClick={handleSendTestNotification}
            disabled={isLoading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '⏳' : '📱'} API Test
          </button>
          
          <button
            onClick={handleSendBrowserNotification}
            disabled={isLoading}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🌐 Browser Test
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
          <button
            onClick={updateStatus}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            🔄 Refresh Status
          </button>
          
          <button
            onClick={handleGetQueue}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            📋 Check Queue
          </button>
          
          <button
            onClick={handleClearLogs}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            🗑️ Clear Logs
          </button>
        </div>
      </div>

      {/* Logs Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">📝 Test Logs</h3>
        <div className="bg-black text-green-400 p-4 rounded-lg h-64 overflow-y-auto font-mono text-sm">
          {logs.length === 0 ? (
            <div className="text-gray-500">No logs yet... Click a test button to start!</div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="mb-1">
                <span className="text-gray-400">[{log.timestamp}]</span>
                <span className={`ml-2 ${getLogColor(log.type)}`}>
                  {log.message}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-blue-800">📖 Instructions</h3>
        <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1">
          <li><strong>Initialize:</strong> Set up the notification service</li>
          <li><strong>Request Permission:</strong> Ask user for notification permission</li>
          <li><strong>API Test:</strong> Send notification via backend API</li>
          <li><strong>Browser Test:</strong> Send local browser notification</li>
          <li><strong>Check Status:</strong> View current notification system status</li>
          <li><strong>Check Queue:</strong> View notification history</li>
        </ol>
      </div>
    </div>
  );
};

export default NotificationTestPanel;
