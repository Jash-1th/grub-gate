import React, { useEffect, useState, useRef } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ModalProvider } from './context/ModalContext';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import About from './pages/About';
import HowItWorks from './pages/HowItWorks';
import Contact from './pages/Contact';
import Faq from './pages/Faq';
import LaunchScreen from './components/common/LaunchScreen';

/**
 * Main App component that handles the application structure and routing
 * Wraps everything with necessary providers and handles the launch screen
 */
function App() {
  const [showLaunchScreen, setShowLaunchScreen] = useState(false);
  const [isLaunchScreenVisible, setIsLaunchScreenVisible] = useState(true);
  const initialRender = useRef(true);

  useEffect(() => {
    // Skip effect on server-side rendering
    if (typeof window === 'undefined') return;
    
    // Only run this effect once on mount
    if (initialRender.current) {
      initialRender.current = false;
      
      try {
        // Use sessionStorage to check if this is the first visit in the current session/tab
        const SESSION_KEY = 'grubgate_launch_screen_shown';
        const hasSeenLaunchScreen = sessionStorage.getItem(SESSION_KEY);

        if (!hasSeenLaunchScreen) {
          // First visit in this session - show launch screen
          console.log('🚀 GrubGate: First visit detected - showing launch screen');
          sessionStorage.setItem(SESSION_KEY, 'true');
          setShowLaunchScreen(true);
          setIsLaunchScreenVisible(true);
        } else {
          // Subsequent visits in this session - skip launch screen
          console.log('🔄 GrubGate: Returning user - skipping launch screen');
          setShowLaunchScreen(false);
          setIsLaunchScreenVisible(false);
        }
      } catch (error) {
        // If sessionStorage fails (rare), default to not showing launch screen
        console.warn('⚠️ GrubGate: SessionStorage unavailable, skipping launch screen');
        setShowLaunchScreen(false);
        setIsLaunchScreenVisible(false);
      }
    }
  }, []);

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
