import React, { createContext, useContext, useState } from 'react';

// Create the Modal Context
const ModalContext = createContext();

// Custom hook to use the Modal Context
export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

// Modal Provider Component
export const ModalProvider = ({ children }) => {
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const openSignupModal = () => {
    console.log('📝 Opening signup modal');
    setIsSignupModalOpen(true);
    // Prevent body scrolling when modal is open
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  };

  const closeSignupModal = () => {
    console.log('❌ Closing signup modal');
    setIsSignupModalOpen(false);
    // Restore body scrolling when modal is closed
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'unset';
    }
  };

  const toggleSignupModal = (isOpen) => {
    if (typeof isOpen === 'boolean') {
      isOpen ? openSignupModal() : closeSignupModal();
    } else {
      isSignupModalOpen ? closeSignupModal() : openSignupModal();
    }
  };

  const openLoginModal = () => {
    console.log('🔑 Opening login modal');
    setIsLoginModalOpen(true);
    // Prevent body scrolling when modal is open
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  };

  const closeLoginModal = () => {
    console.log('❌ Closing login modal');
    setIsLoginModalOpen(false);
    // Restore body scrolling when modal is closed
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'unset';
    }
  };

  const toggleLoginModal = (isOpen) => {
    if (typeof isOpen === 'boolean') {
      isOpen ? openLoginModal() : closeLoginModal();
    } else {
      isLoginModalOpen ? closeLoginModal() : openLoginModal();
    }
  };

  // Function to switch from signup modal to login modal
  const switchToLogin = () => {
    console.log('🔄 Switching from signup to login modal');
    closeSignupModal();
    setTimeout(() => {
      openLoginModal();
    }, 100); // Small delay to ensure cleanup
  };

  // Function to switch from login modal to signup modal
  const switchToSignup = () => {
    console.log('🔄 Switching from login to signup modal');
    closeLoginModal();
    setTimeout(() => {
      openSignupModal();
    }, 100); // Small delay to ensure cleanup
  };

  const value = {
    isSignupModalOpen,
    openSignupModal,
    closeSignupModal,
    toggleSignupModal,
    isLoginModalOpen,
    openLoginModal,
    closeLoginModal,
    toggleLoginModal,
    switchToLogin,
    switchToSignup,
  };

  return (
    <ModalContext.Provider value={value}>
      {children}
    </ModalContext.Provider>
  );
};
