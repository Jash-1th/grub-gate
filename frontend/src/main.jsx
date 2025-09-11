import { StrictMode, Suspense, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import './i18n'
import App from './App.jsx'
import ScrollToTop from './components/common/ScrollToTop'
import { registerPWA } from './pwa.js'

// Enhanced Loading fallback component that integrates with App Shell
const LoadingFallback = () => {
  useEffect(() => {
    // Hide app shell loader when React component mounts
    const timer = setTimeout(() => {
      if (window.hideAppShellLoader) {
        window.hideAppShellLoader();
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-grub-red mx-auto mb-6"></div>
        <h2 className="text-xl font-semibold text-grub-red mb-2">Loading GrubGate</h2>
        <p className="text-gray-600 text-sm">Preparing your dining experience...</p>
      </div>
    </div>
  );
};

// Main App Component with App Shell integration
const AppWithShellIntegration = () => {
  useEffect(() => {
    // Hide app shell loader once React app is fully mounted
    const timer = setTimeout(() => {
      if (window.hideAppShellLoader) {
        window.hideAppShellLoader();
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <BrowserRouter>
      <ScrollToTop />
      <App />
    </BrowserRouter>
  );
};

// Initialize React App
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  
  // Small delay to ensure smooth transition from App Shell
  setTimeout(() => {
    root.render(
      <StrictMode>
        <Suspense fallback={<LoadingFallback />}>
          <AppWithShellIntegration />
        </Suspense>
      </StrictMode>
    );
  }, 100);
}

// Register the Progressive Web App
registerPWA();

// Performance monitoring
if ('performance' in window) {
  window.addEventListener('load', () => {
    const perfData = performance.getEntriesByType('navigation')[0];
    if (perfData) {
      console.log('🚀 PWA Performance Metrics:', {
        'App Shell Load': Math.round(perfData.domContentLoadedEventEnd - perfData.fetchStart) + 'ms',
        'Full Load Time': Math.round(perfData.loadEventEnd - perfData.fetchStart) + 'ms',
        'Time to Interactive': Math.round(perfData.domInteractive - perfData.fetchStart) + 'ms'
      });
    }
  });
}
