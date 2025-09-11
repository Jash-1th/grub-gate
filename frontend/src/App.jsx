import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import About from './pages/About';
import HowItWorks from './pages/HowItWorks';
import Contact from './pages/Contact';
import Faq from './pages/Faq';
import { ModalProvider, useModal } from './context/ModalContext';
import SignupModal from './components/auth/SignupModal';
import LoginModal from './components/auth/LoginModal';
import LaunchScreen from './components/common/LaunchScreen';
import { requestNotificationPermission } from './pwa'; // Ensure path is correct


// App Content Component
function AppContent() {
  const { isSignupModalOpen, isLoginModalOpen } = useModal();
  const isModalOpen = isSignupModalOpen || isLoginModalOpen;

  return (
    <>
      {/* Conditionally render modals */}
      {isSignupModalOpen && <SignupModal />}
      {isLoginModalOpen && <LoginModal />}
      
      {/* Main app content with conditional blur effect */}
      <div className={`min-h-screen flex flex-col transition-all duration-300 ${
        isModalOpen ? 'blur-sm pointer-events-none' : ''
      }`}>
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<About />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<Faq />} />
          </Routes>
        </main>
        
        <Footer />
      </div>
    </>
  );
}

// Main App Component with LaunchScreen and ModalProvider
function App() {
  // State to control LaunchScreen visibility (only on first visit per session)
  const [showLaunchScreen, setShowLaunchScreen] = useState(false);
  const [isLaunchScreenVisible, setIsLaunchScreenVisible] = useState(true);

  useEffect(() => {
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
  }, []);

  // Handler called when LaunchScreen fade-out completes
  const handleLaunchScreenFinish = () => {
    console.log('✨ GrubGate: Launch screen finished - showing main app');
    setIsLaunchScreenVisible(false);
  };

  return (
    <ModalProvider>
      {/* Main app content - always render so it loads in background during launch screen */}
      <AppContent />
      
      {/* LaunchScreen overlay - only show on first visit per session */}
      {showLaunchScreen && isLaunchScreenVisible && (
        <LaunchScreen
          durationMs={2300}        // Show for 2.3 seconds before fade begins
          fadeDurationMs={600}     // Fade out over 600ms
          onFinish={handleLaunchScreenFinish}
        />
      )}
    </ModalProvider>
  );
}

export default App;
