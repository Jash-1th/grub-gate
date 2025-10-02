import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Download, 
  Trash2, 
  Wifi, 
  WifiOff, 
  RefreshCw,
  Settings,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { 
  requestNotificationPermission,
  testPushNotification,
  getNotificationPermissionStatus,
  clearAllCaches,
  isOnline,
  getAppVersion,
  isAppInstalled,
  isInstallPromptAvailable
} from '../../pwa';

/**
 * PWA Development Tools Component
 * Only visible in development mode for testing PWA features
 */
const PWADevTools = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState({
    online: true,
    notificationPermission: 'default',
    version: 'unknown',
    installed: false,
    installAvailable: false
  });
  const [logs, setLogs] = useState([]);

  // Only show in development
  if (import.meta.env.PROD) {
    return null;
  }

  useEffect(() => {
    updateStatus();
    
    const handleOnline = () => {
      setStatus(prev => ({ ...prev, online: true }));
      addLog('App went online', 'success');
    };
    
    const handleOffline = () => {
      setStatus(prev => ({ ...prev, online: false }));
      addLog('App went offline', 'warning');
    };

    const handleInstallAvailable = () => {
      setStatus(prev => ({ ...prev, installAvailable: true }));
      addLog('PWA install prompt is now available', 'info');
    };

    const handleInstalled = () => {
      setStatus(prev => ({ ...prev, installed: true, installAvailable: false }));
      addLog('PWA was successfully installed', 'success');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('pwa-install-available', handleInstallAvailable);
    window.addEventListener('pwa-installed', handleInstalled);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('pwa-install-available', handleInstallAvailable);
      window.removeEventListener('pwa-installed', handleInstalled);
    };
  }, []);

  const updateStatus = async () => {
    const version = await getAppVersion();
    setStatus({
      online: isOnline(),
      notificationPermission: getNotificationPermissionStatus(),
      version,
      installed: isAppInstalled(),
      installAvailable: isInstallPromptAvailable()
    });
  };

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [
      { message, type, timestamp, id: Date.now() },
      ...prev.slice(0, 9) // Keep only last 10 logs
    ]);
  };

  const handleRequestNotifications = async () => {
    addLog('Requesting notification permission...', 'info');
    const result = await requestNotificationPermission();
    if (result.success) {
      addLog('Notification permission granted', 'success');
      setStatus(prev => ({ ...prev, notificationPermission: 'granted' }));
    } else {
      addLog(`Notification permission failed: ${result.error}`, 'error');
    }
  };

  const handleTestNotification = async () => {
    addLog('Sending test notification...', 'info');
    const result = await testPushNotification();
    if (result.success) {
      addLog('Test notification sent successfully', 'success');
    } else {
      addLog(`Test notification failed: ${result.error}`, 'error');
    }
  };

  const handleClearCaches = async () => {
    addLog('Clearing all caches...', 'info');
    const result = await clearAllCaches();
    if (result.success) {
      addLog('All caches cleared successfully', 'success');
    } else {
      addLog(`Cache clearing failed: ${result.error}`, 'error');
    }
  };

  const handleRefreshStatus = () => {
    addLog('Refreshing PWA status...', 'info');
    updateStatus();
  };

  const getStatusIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default: return <AlertCircle className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
        title="PWA Dev Tools"
      >
        <Settings className="w-5 h-5" />
      </button>

      {/* Dev Tools Panel */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 bg-white border border-gray-200 rounded-lg shadow-xl p-4 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">PWA Dev Tools</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          {/* Status Section */}
          <div className="mb-4">
            <h4 className="font-medium text-sm text-gray-700 mb-2">Status</h4>
            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span>Online:</span>
                <div className="flex items-center gap-1">
                  {status.online ? <Wifi className="w-3 h-3 text-green-500" /> : <WifiOff className="w-3 h-3 text-red-500" />}
                  <span className={status.online ? 'text-green-600' : 'text-red-600'}>
                    {status.online ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Notifications:</span>
                <span className={`capitalize ${
                  status.notificationPermission === 'granted' ? 'text-green-600' : 
                  status.notificationPermission === 'denied' ? 'text-red-600' : 'text-yellow-600'
                }`}>
                  {status.notificationPermission}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Version:</span>
                <span className="text-gray-600">{status.version}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Installed:</span>
                <span className={status.installed ? 'text-green-600' : 'text-gray-600'}>
                  {status.installed ? 'Yes' : 'No'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Install Available:</span>
                <span className={status.installAvailable ? 'text-green-600' : 'text-gray-600'}>
                  {status.installAvailable ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>

          {/* Actions Section */}
          <div className="mb-4">
            <h4 className="font-medium text-sm text-gray-700 mb-2">Actions</h4>
            <div className="space-y-2">
              <button
                onClick={handleRequestNotifications}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
                disabled={status.notificationPermission === 'granted'}
              >
                <Bell className="w-3 h-3" />
                Request Notifications
              </button>
              
              <button
                onClick={handleTestNotification}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors"
                disabled={status.notificationPermission !== 'granted'}
              >
                <Bell className="w-3 h-3" />
                Test Notification
              </button>
              
              <button
                onClick={handleClearCaches}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                Clear Caches
              </button>
              
              <button
                onClick={handleRefreshStatus}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs bg-gray-50 text-gray-700 rounded hover:bg-gray-100 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Refresh Status
              </button>
            </div>
          </div>

          {/* Logs Section */}
          <div>
            <h4 className="font-medium text-sm text-gray-700 mb-2">Logs</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-xs text-gray-500">No logs yet</p>
              ) : (
                logs.map(log => (
                  <div key={log.id} className="flex items-start gap-2 text-xs">
                    {getStatusIcon(log.type)}
                    <div className="flex-1">
                      <div className="text-gray-600">{log.message}</div>
                      <div className="text-gray-400">{log.timestamp}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PWADevTools;