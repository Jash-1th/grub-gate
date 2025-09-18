import React from 'react';
import PropTypes from 'prop-types';
import Header from './Header';
import Footer from './Footer';
import MobileBottomNav from './MobileBottomNav';
import SignupModal from '../auth/SignupModal';
import LoginModal from '../auth/LoginModal';
import { useModal } from '../../context/ModalContext';
import { useResponsiveNavigation } from '../../hooks/useResponsiveNavigation';

/**
 * Layout component that provides the main structure for all pages
 * Handles responsive layout, modals, and common UI elements
 */
const Layout = ({ children }) => {
  const { isSignupModalOpen, isLoginModalOpen } = useModal();
  const { isMobile } = useResponsiveNavigation();
  const isModalOpen = isSignupModalOpen || isLoginModalOpen;

  return (
    <>
      {/* Modals */}
      {isSignupModalOpen && <SignupModal />}
      {isLoginModalOpen && <LoginModal />}
      
      {/* Main content with conditional blur effect when modals are open */}
      <div className={`min-h-screen flex flex-col transition-all duration-300 ${
        isModalOpen ? 'blur-sm pointer-events-none' : ''
      }`}>
        <Header />
        
        {/* Main content */}
        <main className="flex-grow">
          {children}
        </main>
        
        <Footer />
        
        {/* Mobile bottom navigation */}
        {isMobile && (
          <>
            <MobileBottomNav />
            {/* Spacer for mobile bottom nav */}
            <div aria-hidden className="h-20"></div>
          </>
        )}
      </div>
    </>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
