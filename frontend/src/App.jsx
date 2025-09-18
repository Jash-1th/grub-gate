import React, { useEffect, useState, useCallback } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import MobileBottomNav from './components/layout/MobileBottomNav';
import HomePage from './pages/HomePage';
import About from './pages/About';
import HowItWorks from './pages/HowItWorks';
import Contact from './pages/Contact';
import Faq from './pages/Faq';
import { ModalProvider, useModal } from './context/ModalContext';
import SignupModal from './components/auth/SignupModal';
import LoginModal from './components/auth/LoginModal';
import LaunchScreen from './components/common/LaunchScreen';
import { useResponsiveNavigation } from './hooks/useResponsiveNavigation';
import { requestNotificationPermission } from './pwa';


// App Content Component
function AppContent() {
  const { isSignupModalOpen, isLoginModalOpen } = useModal();
  const { isMobile, isClient } = useResponsiveNavigation();
  const [mounted, setMounted] = useState(false);
  const isModalOpen = isSignupModalOpen || isLoginModalOpen;
  
  // Set mounted state after initial render
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

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
        <main className={`flex-grow`}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<About />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<Faq />} />
          </Routes>
        </main>
        
        <Footer />
        
        {/* Mobile Bottom Navigation - Only render on mobile after mount */}
        {mounted && isMobile && <MobileBottomNav />}

        {/* Spacer to ensure footer content is fully visible above fixed bottom nav on mobile */}
        {isClient && isMobile && (
          <div aria-hidden className="h-20"></div>
        )}
      </div>
    </>
  );
}

// Main App Component with LaunchScreen and ModalProvider
function App() {
  const [showLaunchScreen, setShowLaunchScreen] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;
    
    setIsClient(true);
    
    // Hide launch screen after initial load
    const timer = setTimeout(() => {
      setShowLaunchScreen(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  // Don't render anything until mounted on client
  if (!isClient) {
    return null;
  }

  return (
    <ModalProvider>
      {/* Main app content with conditional launch screen */}
      <div style={{ opacity: showLaunchScreen ? 0 : 1, transition: 'opacity 300ms ease-in-out' }}>
        <AppContent />
      </div>
      
      {/* LaunchScreen overlay */}
      {showLaunchScreen && <LaunchScreen />}
    </ModalProvider>
  );
}

export default App;
