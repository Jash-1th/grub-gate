import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BrowserRouter as BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ModalProvider } from './context/ModalContext';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import './App.css';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import About from './pages/About';
import HowItWorks from './pages/HowItWorks';
import Contact from './pages/Contact';
import Faq from './pages/Faq';
import LaunchScreen from './components/common/LaunchScreen';

// Add data-hydrated attribute when hydration is complete
const useHydrationComplete = () => {
  useEffect(() => {
    document.documentElement.setAttribute('data-hydrated', 'true');
    return () => document.documentElement.removeAttribute('data-hydrated');
  }, []);
};

/**
 * Main App component that handles the application structure and routing
 * Wraps everything with necessary providers and handles the launch screen
 */
function App() {
  // Use the hydration complete hook
  useHydrationComplete();

  // Get initial state from server or use defaults
  const [showLaunchScreen, setShowLaunchScreen] = useState(() => {
    if (typeof window !== 'undefined' && window.__INITIAL_STATE__) {
      return window.__INITIAL_STATE__.showLaunchScreen || false;
    }
    return false;
  });
  
  const [isLaunchScreenVisible, setIsLaunchScreenVisible] = useState(showLaunchScreen);
  const [isClient, setIsClient] = useState(false);
  
  // Handle client-side initialization
  useEffect(() => {
    // This effect only runs on the client
    setIsClient(true);
    
    // Only run launch screen logic on client side
    const checkFirstVisit = () => {
      try {
        const SESSION_KEY = 'grubgate_launch_screen_shown';
        const hasSeenLaunchScreen = sessionStorage.getItem(SESSION_KEY);
        
        if (!hasSeenLaunchScreen) {
          console.log('🚀 GrubGate: First visit detected - showing launch screen');
          sessionStorage.setItem(SESSION_KEY, 'true');
          setShowLaunchScreen(true);
          setIsLaunchScreenVisible(true);
        } else if (showLaunchScreen) {
          // If we're showing the launch screen but user has seen it before
          setShowLaunchScreen(false);
          setIsLaunchScreenVisible(false);
        }
      } catch (error) {
        console.warn('⚠️ GrubGate: SessionStorage unavailable, skipping launch screen');
        setShowLaunchScreen(false);
        setIsLaunchScreenVisible(false);
      }
    };
    
    // Small delay to ensure hydration is complete
    const timer = setTimeout(checkFirstVisit, 100);
    return () => clearTimeout(timer);
  }, [showLaunchScreen]);

  // Handle launch screen animation end
  const handleLaunchScreenEnd = () => {
    if (!showLaunchScreen) return;
    
    // Start fade out animation
    setIsLaunchScreenVisible(false);
    
    // Remove from DOM after animation completes
    const timer = setTimeout(() => {
      setShowLaunchScreen(false);
    }, 500); // Match this with your CSS transition time
    
    return () => clearTimeout(timer);
  };

  // Render the main app content
  const renderAppContent = () => (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<About />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<Faq />} />
      </Routes>
    </Layout>
  );

  return (
    <ModalProvider>
      {/* Launch Screen - Only show on first visit */}
      {showLaunchScreen && (
        <LaunchScreen 
          onAnimationEnd={handleLaunchScreenEnd}
          isVisible={isLaunchScreenVisible}
        />
      )}
      
      {/* Main App Content */}
      <div className={showLaunchScreen ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100 transition-opacity duration-500'}>
        {renderAppContent()}
      </div>
    </ModalProvider>
  );
}

export default App;
