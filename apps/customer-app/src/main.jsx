import React from 'react';
import { Suspense, useEffect } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
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
    // Mark the app as hydrated
    document.documentElement.setAttribute('data-hydrated', 'true');
    
    // Disable scroll restoration to prevent browser interference
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    
    // Force scroll to top on initial load
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
    
    // Hide launch screen once React app is fully mounted and ready
    const hideLaunchScreen = () => {
      console.log('⚙️ React app mounted, hiding launch screen');
      if (window.hideLaunchScreen) {
        window.hideLaunchScreen();
      } else {
        // Fallback in case window.hideLaunchScreen is not available
        const launchScreen = document.getElementById('launch-screen');
        if (launchScreen) {
          launchScreen.classList.add('hidden');
        }
        document.documentElement.classList.add('app-loaded');
      }
    };
    
    // Hide launch screen immediately if app is ready
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      hideLaunchScreen();
    } else {
      document.addEventListener('DOMContentLoaded', hideLaunchScreen);
    }
    
    // Cleanup
    return () => {
      document.documentElement.removeAttribute('data-hydrated');
      // Restore default scroll restoration
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'auto';
      }
    };
  }, []);
  
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
};

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);

    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
          <p className="text-gray-600 mb-6">We're working on fixing this issue. Please try refreshing the page.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-grub-red text-white rounded hover:bg-grub-red transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>;
    }

    return this.props.children;
  }
}

// Initialize React App
const container = document.getElementById('root');
if (container) {
  console.log('⚡ Initializing React app');

  // Function to render the app with error boundary
  const renderApp = () => (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <AppWithShellIntegration />
      </Suspense>
    </ErrorBoundary>
  );

  // Check if we have server-rendered content to hydrate
  const hasServerRenderedContent = container.innerHTML.trim() !== '' && 
    !container.innerHTML.includes('<!--ssr-outlet-->') &&
    !container.innerHTML.includes('launch-screen'); // Don't hydrate if only launch screen

  if (hasServerRenderedContent) {
    // SSR content exists, use hydration with suppressHydrationWarning
    console.log('🔄 Hydrating server-rendered content');
    try {
      hydrateRoot(container, renderApp(), {
        onRecoverableError: (error, errorInfo) => {
          // Suppress hydration warnings in production
          if (process.env.NODE_ENV !== 'production') {
            console.warn('Hydration recoverable error:', error, errorInfo);
          }
        }
      });
    } catch (error) {
      console.warn('Hydration failed, falling back to client-side rendering:', error);
      // Fallback to client-side rendering
      const root = createRoot(container);
      root.render(renderApp());
    }
  } else {
    // No SSR content, use client-side rendering
    console.log('🎨 Client-side rendering (no SSR content)');
    const root = createRoot(container, {
      onRecoverableError: (error, errorInfo) => {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Recoverable error during render:', error, errorInfo);
        }
      }
    });
    root.render(renderApp());
  }
  
  // Add a small delay before removing the server-rendered styles
  // This helps prevent the flash of unstyled content
  if (document.body) {
    setTimeout(() => {
      document.body.classList.remove('hydrating');
      document.body.classList.add('hydrated');
    }, 100);
  }
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
