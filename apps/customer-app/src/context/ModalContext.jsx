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
    setIsSignupModalOpen(true);
    // Prevent body scrolling when modal is open
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  };

  const closeSignupModal = () => {
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
    setIsLoginModalOpen(true);
    // Prevent body scrolling when modal is open
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  };

  const closeLoginModal = () => {
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
    closeSignupModal();
    openLoginModal();
  };

  // Function to switch from login modal to signup modal
  const switchToSignup = () => {
    closeLoginModal();
    openSignupModal();
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
