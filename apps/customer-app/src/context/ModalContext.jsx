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
  const [isOTPAuthModalOpen, setIsOTPAuthModalOpen] = useState(false);
  const [isUserProfileModalOpen, setIsUserProfileModalOpen] = useState(false);

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

  // OTP Auth Modal functions
  const openOTPAuthModal = (mode = 'signup') => {
    console.log(`📱 Opening OTP auth modal in ${mode} mode`);
    setIsOTPAuthModalOpen(true);
    // Store the auth mode for the modal to use
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('otpAuthMode', mode);
    }
    // Close other modals
    setIsLoginModalOpen(false);
    setIsSignupModalOpen(false);
    // Prevent body scrolling when modal is open
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  };

  const closeOTPAuthModal = () => {
    console.log('❌ Closing OTP auth modal');
    setIsOTPAuthModalOpen(false);
    // Clear the auth mode
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('otpAuthMode');
    }
    // Restore body scrolling when modal is closed
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'unset';
    }
  };

  const toggleOTPAuthModal = (isOpen) => {
    if (typeof isOpen === 'boolean') {
      isOpen ? openOTPAuthModal() : closeOTPAuthModal();
    } else {
      isOTPAuthModalOpen ? closeOTPAuthModal() : openOTPAuthModal();
    }
  };

  const openUserProfileModal = () => {
    setIsUserProfileModalOpen(true);
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  };

  const closeUserProfileModal = () => {
    setIsUserProfileModalOpen(false);
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'unset';
    }
  };

  const toggleUserProfileModal = (isOpen) => {
    if (typeof isOpen === 'boolean') {
      isOpen ? openUserProfileModal() : closeUserProfileModal();
    } else {
      isUserProfileModalOpen ? closeUserProfileModal() : openUserProfileModal();
    }
  };

  // Function to switch to OTP auth from other modals
  const switchToOTPAuth = () => {
    console.log('🔄 Switching to OTP auth modal');
    closeLoginModal();
    closeSignupModal();
    setTimeout(() => {
      openOTPAuthModal();
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
    isOTPAuthModalOpen,
    openOTPAuthModal,
    closeOTPAuthModal,
    toggleOTPAuthModal,
    switchToOTPAuth,
    isUserProfileModalOpen,
    openUserProfileModal,
    closeUserProfileModal,
    toggleUserProfileModal,
  };

  return (
    <ModalContext.Provider value={value}>
      {children}
    </ModalContext.Provider>
  );
};
