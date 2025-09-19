import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import { AnimatePresence } from 'framer-motion';
import i18n from './i18n';
import { ModalProvider } from './context/ModalContext';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import About from './pages/About';
import HowItWorks from './pages/HowItWorks';
import Contact from './pages/Contact';
import Faq from './pages/Faq';
import LaunchScreen from './components/common/LaunchScreen';
import ScrollToTop from './components/common/ScrollToTop';
import './App.css';

// Custom hook to handle first visit detection and session management
const useFirstVisit = () => {
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Mark as client-side
    setIsClient(true);
    
    try {
      const SESSION_KEY = 'grubgate_launch_screen_shown';
      const hasSeenLaunchScreen = sessionStorage.getItem(SESSION_KEY);
      
      if (!hasSeenLaunchScreen) {
        console.log('🚀 First visit detected - showing launch screen');
        sessionStorage.setItem(SESSION_KEY, 'true');
        setIsFirstVisit(true);
      }
    } catch (error) {
      console.warn('⚠️ SessionStorage unavailable, skipping launch screen');
    }
    
    // Cleanup function
    return () => {
      // Any cleanup if needed
    };
  }, []);

  return { isFirstVisit, isClient };
};

// Main App component
function App({ initialized = true }) {
  const { isFirstVisit } = useFirstVisit();
  const location = useLocation();
  const [isLaunching, setIsLaunching] = useState(isFirstVisit);
  const [isReady, setIsReady] = useState(false);
  
  // Handle app readiness and transitions
  useEffect(() => {
    // If it's not the first visit, mark as ready immediately
    if (!isFirstVisit) {
      setIsReady(true);
      return;
    }
    
    // For first visit, wait for the launch screen to complete
    if (isFirstVisit && !isLaunching) {
      const timer = setTimeout(() => {
        setIsReady(true);
      }, 300); // Small delay for smooth transition
      
      return () => clearTimeout(timer);
    }
  }, [isFirstVisit, isLaunching]);
  
  // Handle route changes
  useEffect(() => {
    if (isReady) {
      // Scroll to top on route change
      window.scrollTo(0, 0);
      
      // Track page view for analytics
      if (window.gtag) {
        window.gtag('event', 'page_view', {
          page_path: location.pathname + location.search,
        });
      }
    }
  }, [location, isReady]);
  
  // Handle launch screen completion
  const handleLaunchComplete = useCallback(() => {
    setIsLaunching(false);
  }, []);
  
  // Show loading state while app is initializing
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-grub-red"></div>
      </div>
    );
  }

  return (
    <I18nextProvider i18n={i18n}>
      <ModalProvider>
        <div className="app-container">
          {/* Launch Screen - Only shown on first visit */}
          {isFirstVisit && isLaunching && (
            <LaunchScreen onComplete={handleLaunchComplete} />
          )}
          
          {/* Main App Content */}
          <div className={`app-content ${!isReady ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'}`}>
            <ScrollToTop />
            <Layout>
              <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/how-it-works" element={<HowItWorks />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/faq" element={<Faq />} />
                  {/* Add more routes as needed */}
                </Routes>
              </AnimatePresence>
            </Layout>
          </div>
        </div>
      </ModalProvider>
    </I18nextProvider>
  );
}

export default App;
