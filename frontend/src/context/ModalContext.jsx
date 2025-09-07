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

  const openSignupModal = () => {
    setIsSignupModalOpen(true);
    // Prevent body scrolling when modal is open
    document.body.style.overflow = 'hidden';
  };

  const closeSignupModal = () => {
    setIsSignupModalOpen(false);
    // Restore body scrolling when modal is closed
    document.body.style.overflow = 'unset';
  };

  const toggleSignupModal = (isOpen) => {
    if (typeof isOpen === 'boolean') {
      isOpen ? openSignupModal() : closeSignupModal();
    } else {
      isSignupModalOpen ? closeSignupModal() : openSignupModal();
    }
  };

  const value = {
    isSignupModalOpen,
    openSignupModal,
    closeSignupModal,
    toggleSignupModal,
  };

  return (
    <ModalContext.Provider value={value}>
      {children}
    </ModalContext.Provider>
  );
};
