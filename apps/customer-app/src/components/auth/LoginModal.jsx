import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useModal } from '../../context/ModalContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import WelcomeBackModal from './WelcomeBackModal';
import './modal-responsive.css';

const LoginModal = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isLoginModalOpen, closeLoginModal, switchToSignup, openOTPAuthModal } = useModal();
  const { login, isLoading, error, clearError } = useAuth();
  const { showSuccess } = useToast();
  
  // Form state management
  const [formData, setFormData] = useState({
    identifier: '', // Can be email or phone
    password: ''
  });
  
  // Local error state for form validation
  const [formErrors, setFormErrors] = useState({});
  
  // Local loading state to prevent multiple clicks
  const [isLocalLoading, setIsLocalLoading] = useState(false);
  
  // Welcome back modal state
  const [showWelcomeBackModal, setShowWelcomeBackModal] = useState(false);
  const [welcomeBackUserName, setWelcomeBackUserName] = useState('');

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field-specific errors when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear auth errors when user starts typing
    if (error) {
      clearError();
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.identifier) {
      errors.identifier = t('login.errors.identifierRequired');
    } else {
      // Check if it's a valid email or phone
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.identifier);
      const isPhone = /^[+]?[1-9]\d{1,14}$/.test(formData.identifier.replace(/[\s()-]/g, ''));
      
      if (!isEmail && !isPhone) {
        errors.identifier = t('login.errors.invalidIdentifier');
      }
    }
    
    if (!formData.password) {
      errors.password = t('login.errors.passwordRequired');
    } else if (formData.password.length < 6) {
      errors.password = t('login.errors.passwordTooShort');
    }
    
    return errors;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent multiple submissions
    if (isLocalLoading || isLoading) {
      return false;
    }
    
    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return false;
    }
    
    // Clear any existing errors
    setFormErrors({});
    clearError();
    
    // Set local loading state immediately
    setIsLocalLoading(true);
    
    // Call login function
    performLogin();
    return false;
  };

  // Separate async login function
  const performLogin = async () => {
    try {
      const result = await login(formData.identifier, formData.password);
      
      if (result && result.success) {
        // Success - immediately close modal to prevent any timing issues
        console.log('✅ LoginModal: Login successful, closing modal immediately');
        closeLoginModal();
        
        const firstName = result.user.firstName || result.user.name || 'User';
        setWelcomeBackUserName(firstName);
        
        // Only show welcome modal if there's no pending redirect
        const pendingRedirect = typeof window !== 'undefined' ? localStorage.getItem('pendingRedirect') : null;
        if (!pendingRedirect) {
          setShowWelcomeBackModal(true);
          setTimeout(() => {
            showSuccess(
              t('login.welcomeBack'),
              t('login.welcomeMessage', { name: firstName }),
              { duration: 5000 }
            );
          }, 800);
        } else {
          console.log('✅ LoginModal: Pending redirect detected, skipping welcome modal');
        }
      } else {
        // Login failed - show error in modal
        if (result && result.fieldErrors && Object.keys(result.fieldErrors).length > 0) {
          setFormErrors(result.fieldErrors);
        } else {
          const errorMsg = result?.error || t('login.errors.invalidCredentials');
          setFormErrors({ general: errorMsg });
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setFormErrors({ general: t('login.errors.loginFailed') });
    } finally {
      // Always clear local loading state
      setIsLocalLoading(false);
    }
  };

  // Handle Google login (placeholder for now)
  const handleGoogleLogin = () => {
    console.log('Google login initiated');
  };

  // Handle forgot password (placeholder for now)
  const handleForgotPassword = () => {
    console.log('Forgot password initiated');
  };

  // Handle close with form reset
  const handleClose = () => {
    setFormData({
      email: '',
      password: ''
    });
    setFormErrors({});
    setIsLocalLoading(false); // Reset local loading state
    clearError();
    closeLoginModal();
  };

  // Handle welcome back modal close
  const handleWelcomeBackModalClose = () => {
    setShowWelcomeBackModal(false);
    setWelcomeBackUserName('');
  };

  // Handle sign up link click
  const handleSignUpClick = () => {
    openOTPAuthModal('signup');
  };

  // Handle ESC key to close modal with form reset
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    if (isLoginModalOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isLoginModalOpen]);


  if (!isLoginModalOpen) {
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
            aria-label="Close login modal"
          >
            <svg className="modal-close-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          {/* Header */}
          <div className="p-6 pb-0 text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2" style={{color: '#800020'}}>
              {t('login.title')}
            </h1>
            <p className="text-base text-gray-600 mb-4">
              {t('login.subtitle')}
            </p>
          </div>

          {/* Login Form */}
          <div className="px-6 pb-2">
            {/* Global Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            
            {/* General Form Error */}
            {formErrors.general && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{formErrors.general}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-3">
              
              {/* Email or Phone Field */}
              <div>
                <label htmlFor="login-identifier" className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('login.emailOrPhoneLabel')}
                </label>
                <input
                  type="text"
                  id="login-identifier"
                  name="identifier"
                  value={formData.identifier}
                  onChange={handleInputChange}
                  placeholder={t('login.emailOrPhonePlaceholder')}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-grub-red focus:border-grub-red transition-colors duration-200 text-gray-900 placeholder-gray-500 ${
                    formErrors.identifier ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  required
                  disabled={isLoading || isLocalLoading}
                />
                {formErrors.identifier && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.identifier}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="login-password" className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('login.passwordLabel')}
                </label>
                <input
                  type="password"
                  id="login-password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder={t('login.passwordPlaceholder')}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-grub-red focus:border-grub-red transition-colors duration-200 text-gray-900 placeholder-gray-500 ${
                    formErrors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  required
                  disabled={isLoading || isLocalLoading}
                />
                {formErrors.password && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
                )}
              </div>

              {/* Forgot Password Link */}
              <div className="text-right">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-grub-red hover:text-red-700 font-medium transition-colors duration-200"
                >
                  {t('login.forgotPassword')}
                </button>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading || isLocalLoading}
                className={`w-full py-2 px-4 rounded-lg font-semibold text-base transition-colors duration-200 shadow-lg ${
                  (isLoading || isLocalLoading)
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-grub-red text-white hover:bg-red-700 hover:shadow-xl transform hover:-translate-y-0.5 transition-transform'
                }`}
              >
                {(isLoading || isLocalLoading) ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('login.signingIn')}
                  </div>
                ) : (
                  t('login.button')
                )}
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
                  {t('login.divider')}
                </span>
              </div>
            </div>
          </div>

          {/* Google Login Button */}
          <div className="px-6 pb-4">
            <button
              onClick={handleGoogleLogin}
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
              {t('login.googleButton')}
            </button>
          </div>

          {/* Sign Up Link */}
          <div className="px-6 pb-6 text-center">
            <p className="text-sm text-gray-600">
              {t('login.signupPrompt')}{' '}
              <button 
                type="button"
                onClick={handleSignUpClick}
                className="text-grub-red font-semibold hover:text-red-700 transition-colors duration-200"
              >
                {t('login.signupLink')}
              </button>
            </p>
          </div>
        </div>
      </div>
      
      {/* Welcome Back Modal */}
      <WelcomeBackModal
        isOpen={showWelcomeBackModal}
        onClose={handleWelcomeBackModalClose}
        userName={welcomeBackUserName}
      />
    </div>
  );
};

export default LoginModal;
