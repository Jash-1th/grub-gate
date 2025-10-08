import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useModal } from '../../context/ModalContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { navigation } from '../../data';

/**
 * Reusable authentication buttons component that can be used in both desktop and mobile views
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes for the container
 * @param {boolean} [props.isMobile] - Whether the buttons are displayed in mobile view
 */
const AuthButtons = ({ className = '', isMobile = false }) => {
  const { t } = useTranslation();
  const { openLoginModal, openOTPAuthModal } = useModal();
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  const { showSuccess } = useToast();

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      // Show success message after logout
      showSuccess(
        'Logged Out Successfully! 👋',
        'Thanks for using GrubGate! We hope to see you again soon.',
        { duration: 4000 }
      );
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // If user is authenticated, show user menu
  if (isAuthenticated && user) {
    const displayName = user.firstName || user.name || user.email.split('@')[0];
    
    return (
      <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'items-center space-x-4'} ${className}`}>
        {/* Enhanced user greeting */}
        <div className={`flex items-center space-x-2 ${isMobile ? 'mb-3' : ''}`}>
          <div className="w-8 h-8 bg-gradient-to-r from-grub-red to-red-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-semibold">
              {displayName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex flex-col">
            <span className={`font-medium text-gray-900 ${isMobile ? 'text-base' : 'text-sm'}`}>
              Welcome back, {displayName}! 👋
            </span>
            <span className={`text-gray-500 ${isMobile ? 'text-sm' : 'text-xs'}`}>
              Ready to plan your meals?
            </span>
          </div>
        </div>
        
        {/* Logout button */}
        <button
          onClick={handleLogout}
          disabled={isLoading}
          className={`whitespace-nowrap px-4 py-2 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 ${
            isLoading 
              ? 'text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed' 
              : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 shadow-sm hover:shadow-md'
          } ${isMobile ? 'w-full text-base py-3' : 'text-sm'}`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Logging out...</span>
            </div>
          ) : (
            'Logout'
          )}
        </button>
      </div>
    );
  }

  // If user is not authenticated, show separate Login and Signup buttons
  return (
    <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'items-center space-x-3'} ${className}`}>
      {/* Login Button - Traditional Password Login */}
      <button
        onClick={openLoginModal}
        className={`whitespace-nowrap px-4 py-2 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 shadow-sm hover:shadow-md ${
          isMobile ? 'w-full text-base py-3' : 'text-sm'
        }`}
      >
        <span className="flex items-center justify-center space-x-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1" />
          </svg>
          <span>Login</span>
        </span>
      </button>
      
      {/* Signup Button - OTP Verification */}
      <button
        onClick={() => openOTPAuthModal('signup')}
        className={`whitespace-nowrap px-4 py-2 font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-grub-red/80 text-white bg-gradient-to-r from-grub-red to-red-600 hover:from-grub-red/90 hover:to-red-700 shadow hover:shadow-md transform hover:-translate-y-0.5 ${
          isMobile ? 'w-full text-base py-3' : 'text-sm'
        }`}
      >
        <span className="flex items-center justify-center space-x-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          <span>Sign Up</span>
        </span>
      </button>
    </div>
  );
};

export default AuthButtons;
