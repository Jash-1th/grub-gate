import React, { useState, useEffect } from 'react';
import Download from 'lucide-react/icons/download';
import Check from 'lucide-react/icons/check';
import X from 'lucide-react/icons/x';
import { promptInstallApp, isInstallPromptAvailable, isAppInstalled } from '../../pwa';

/**
 * PWA Install Button Component
 * Shows install button when PWA can be installed and handles the install flow
 */
const PWAInstallButton = ({ className = '', variant = 'primary' }) => {
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (isAppInstalled()) {
      setIsInstalled(true);
      return;
    }

    // Check if install prompt is available
    setCanInstall(isInstallPromptAvailable());

    // Listen for install availability
    const handleInstallAvailable = () => {
      setCanInstall(true);
      setShowPrompt(true);
      
      // Auto-hide the prompt after 10 seconds
      setTimeout(() => {
        setShowPrompt(false);
      }, 10000);
    };

    const handleInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
      setShowPrompt(false);
    };

    // Add event listeners
    window.addEventListener('pwa-install-available', handleInstallAvailable);
    window.addEventListener('pwa-installed', handleInstalled);

    // Cleanup
    return () => {
      window.removeEventListener('pwa-install-available', handleInstallAvailable);
      window.removeEventListener('pwa-installed', handleInstalled);
    };
  }, []);

  const handleInstall = async () => {
    try {
      setIsInstalling(true);
      const result = await promptInstallApp();
      
      if (result.success) {
        if (result.outcome === 'accepted') {
          console.log('PWA install accepted');
          // The 'appinstalled' event will handle the UI updates
        } else {
          console.log('PWA install dismissed');
          setShowPrompt(false);
        }
      } else {
        console.error('PWA install failed:', result.error);
      }
    } catch (error) {
      console.error('Error installing PWA:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  // Don't render if app is installed or can't be installed
  if (isInstalled || !canInstall) {
    return null;
  }

  const baseClasses = "inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variants = {
    primary: "bg-grub-red hover:bg-red-700 text-white focus:ring-grub-red",
    secondary: "bg-white hover:bg-gray-50 text-grub-red border border-grub-red focus:ring-grub-red",
    minimal: "text-grub-red hover:text-red-700 hover:bg-red-50 focus:ring-grub-red"
  };

  const buttonClasses = `${baseClasses} ${variants[variant]} ${className}`;

  // Show as a prominent banner if showPrompt is true
  if (showPrompt) {
    return (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 transition-all duration-300 ease-in-out">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-grub-red rounded-lg flex items-center justify-center">
              <Download className="w-5 h-5 text-white" />
            </div>
          </div>
          
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-1">
              Install GrubGate Partner
            </h4>
            <p className="text-sm text-gray-600 mb-3">
              Add to your home screen for faster access and better experience
            </p>
            
            <div className="flex gap-2">
              <button
                onClick={handleInstall}
                disabled={isInstalling}
                className="px-3 py-1.5 bg-grub-red hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50"
              >
                {isInstalling ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                    Installing...
                  </>
                ) : (
                  'Install'
                )}
              </button>
              
              <button
                onClick={handleDismiss}
                className="px-3 py-1.5 text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors"
              >
                Not now
              </button>
            </div>
          </div>
          
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Regular install button
  return (
    <button
      onClick={handleInstall}
      disabled={isInstalling}
      className={buttonClasses}
      aria-label="Install GrubGate Partner app"
    >
      {isInstalling ? (
        <>
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Installing...
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          Install App
        </>
      )}
    </button>
  );
};

export default PWAInstallButton;