import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useModal } from '../../context/ModalContext';
import './modal-responsive.css';

const SignupModal = () => {
  const { t } = useTranslation();
  const { isSignupModalOpen, closeSignupModal, switchToLogin } = useModal();
  
  // Form state management
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission (frontend only for now)
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Sign-up form data:', formData);
  };

  // Handle Google sign-up (placeholder for now)
  const handleGoogleSignup = () => {
    console.log('Google sign-up initiated');
  };

  // Handle close with form reset
  const handleClose = () => {
    // 1. Reset the form state
    setFormData({
      username: '',
      email: '',
      password: ''
    });
    // 2. Close the modal
    closeSignupModal();
  };

  // Handle ESC key to close modal with form reset
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    if (isSignupModalOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isSignupModalOpen]);

  if (!isSignupModalOpen) {
    return null;
  }

  return (
    <div className="modal-container">
      {/* Modal Overlay - Semi-transparent backdrop */}
      <div className="modal-overlay">
        
        {/* Modal Card */}
        <div 
          className="modal-card"
          onClick={(e) => e.stopPropagation()}
        >
          
          {/* Close Button */}
          <button 
            onClick={handleClose}
            className="modal-close-button"
            aria-label="Close signup modal"
          >
            <svg className="modal-close-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          {/* Header */}
          <div className="p-6 pb-0 text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2" style={{color: '#800020'}}>
              {t('signup.title')}
            </h1>
            <p className="text-base text-gray-600 mb-4">
              {t('signup.subtitle')}
            </p>
          </div>

          {/* Sign-Up Form */}
          <div className="px-6 pb-2">
            <form onSubmit={handleSubmit} className="space-y-3">
              
              {/* Username Field */}
              <div>
                <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('signup.usernameLabel')}
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder={t('signup.usernamePlaceholder')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-grub-red focus:border-grub-red transition-colors duration-200 text-gray-900 placeholder-gray-500"
                  required
                />
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('signup.emailLabel')}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder={t('signup.emailPlaceholder')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-grub-red focus:border-grub-red transition-colors duration-200 text-gray-900 placeholder-gray-500"
                  required
                />
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('signup.passwordLabel')}
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder={t('signup.passwordPlaceholder')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-grub-red focus:border-grub-red transition-colors duration-200 text-gray-900 placeholder-gray-500"
                  required
                />
              </div>

              {/* Sign Up Button */}
              <button
                type="submit"
                className="w-full bg-grub-red text-white py-2 px-4 rounded-lg font-semibold text-base hover:bg-red-700 transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-transform"
              >
                {t('signup.button')}
              </button>
            </form>
          </div>

          {/* Divider */}
          <div className="px-6 py-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">
                  {t('signup.divider')}
                </span>
              </div>
            </div>
          </div>

          {/* Google Sign-Up Button */}
          <div className="px-6 pb-4">
            <button
              onClick={handleGoogleSignup}
              className="w-full flex items-center justify-center px-4 py-2 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-transform"
            >
              {/* Google Logo SVG */}
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {t('signup.googleButton')}
            </button>
          </div>

          {/* Login Link */}
          <div className="px-6 pb-6 text-center">
            <p className="text-sm text-gray-600">
              {t('signup.loginPrompt')}{' '}
              <button 
                type="button"
                onClick={switchToLogin}
                className="text-grub-red font-semibold hover:text-red-700 transition-colors duration-200"
              >
                {t('signup.loginLink')}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupModal;
