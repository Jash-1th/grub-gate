import React, { createContext, useContext, useState } from 'react';

const ModalContext = createContext();

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

export const ModalProvider = ({ children }) => {
  // OTP Auth Modal state
  const [isOTPAuthModalOpen, setIsOTPAuthModalOpen] = useState(false);

  const openOTPAuthModal = () => {
    console.log('🔑 Opening partner OTP auth modal');
    setIsOTPAuthModalOpen(true);
    // Prevent body scrolling when modal is open
    document.body.style.overflow = 'hidden';
  };

  const closeOTPAuthModal = () => {
    console.log('🔑 Closing partner OTP auth modal');
    setIsOTPAuthModalOpen(false);
    // Restore body scrolling
    document.body.style.overflow = 'unset';
  };

  const toggleOTPAuthModal = (isOpen) => {
    if (typeof isOpen === 'boolean') {
      isOpen ? openOTPAuthModal() : closeOTPAuthModal();
    } else {
      isOTPAuthModalOpen ? closeOTPAuthModal() : openOTPAuthModal();
    }
  };

  const value = {
    // OTP Auth Modal
    isOTPAuthModalOpen,
    openOTPAuthModal,
    closeOTPAuthModal,
    toggleOTPAuthModal,
  };

  return (
    <ModalContext.Provider value={value}>
      {children}
    </ModalContext.Provider>
  );
};

export default ModalContext;
