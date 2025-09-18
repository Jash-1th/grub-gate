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
    console.log('🔄 React Suspense fallback component mounted');
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
    // Hide launch screen once React app is fully mounted and ready
    const timer = setTimeout(() => {
      console.log('⚙️ React app mounted, hiding launch screen');
      if (window.hideLaunchScreen) {
        window.hideLaunchScreen();
      }
    }, 300); // Reduced delay for faster transition
    
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
  
  console.log('⚡ Initializing React app');

  /**
   * Note about StrictMode:
   * - In development, React intentionally renders components twice to help detect side effects
   * - This behavior only happens in development and helps identify potential issues
   * - The double rendering does not occur in production builds
   * - If you see duplicate logs or double API calls in development, this is expected behavior
   */
  root.render(
    <StrictMode>
      <Suspense fallback={<LoadingFallback />}>
        <AppWithShellIntegration />
      </Suspense>
    </StrictMode>
  );
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
