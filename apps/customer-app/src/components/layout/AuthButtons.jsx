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
  const { openSignupModal, toggleLoginModal } = useModal();
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

  // If user is not authenticated, show login/signup buttons
  return (
    <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'items-center space-x-4'} ${className}`}>
      {navigation.auth.map((item) => {
        if (item.name === 'signup') {
          return (
            <button
              key={item.name}
              onClick={openSignupModal}
              className={`whitespace-nowrap px-4 py-2 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-grub-red/80 text-white bg-gradient-to-r from-grub-red to-red-600 hover:from-grub-red/90 hover:to-red-700 shadow hover:shadow-md ${
                isMobile ? 'w-full text-base py-3' : 'text-sm'
              }`}
            >
              {t('signup.button')}
            </button>
          );
        }

        if (item.name === 'login') {
          return (
            <button
              key={item.name}
              onClick={() => toggleLoginModal(true)}
              className={`whitespace-nowrap px-4 py-2 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 shadow-sm ${
                isMobile ? 'w-full text-base py-3' : 'text-sm'
              }`}
            >
              {t('login.button')}
            </button>
          );
        }

        return (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `w-full px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-grub-red ${
                isActive
                  ? 'bg-grub-red text-white border-2 border-transparent'
                  : 'text-grub-red bg-white border-2 border-grub-red hover:bg-red-700 hover:text-white'
              }`
            }
          >
            {t(item.name)}
          </NavLink>
        );
      })}
    </div>
  );
};

export default AuthButtons;
