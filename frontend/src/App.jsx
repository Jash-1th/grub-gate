import React from 'react';
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

// Main App Component with ModalProvider
function App() {
  return (
    <ModalProvider>
      <AppContent />
    </ModalProvider>
  );
}

export default App;
