import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useModal } from '../../context/ModalContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import WelcomeModal from './WelcomeModal';
import './modal-responsive.css';

const SignupModal = () => {
  const { t } = useTranslation();
  const { isSignupModalOpen, closeSignupModal, switchToLogin } = useModal();
  const { register, isLoading, error, clearError } = useAuth();
  const { showSuccess } = useToast();
  
  // Form state management
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  // Local error state for form validation
  const [formErrors, setFormErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  
  // Local loading state to prevent multiple clicks
  const [isLocalLoading, setIsLocalLoading] = useState(false);
  
  // Welcome modal state
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [welcomeUserName, setWelcomeUserName] = useState('');

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
    
    // Clear success message when user starts typing
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    return errors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
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
      return;
    }
    
    // Clear any existing errors
    setFormErrors({});
    clearError();
    setSuccessMessage('');
    
    // Set local loading state immediately
    setIsLocalLoading(true);
    
    // Prepare registration data
    const nameParts = formData.name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || nameParts[0] || 'User';
    
    const registrationData = {
      firstName: firstName,
      lastName: lastName,
      email: formData.email,
      password: formData.password,
      role: 'customer' // Default role for customer app
    };
    
    try {
      // Attempt registration
      const result = await register(registrationData);
      
      if (result.success) {
        // Reset form
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: ''
        });

        if (result.autoLogin) {
          // Close signup modal first
          handleClose();
          
          // Show welcome modal with user's name
          const firstName = formData.name.trim().split(' ')[0] || 'User';
          setWelcomeUserName(firstName);
          setShowWelcomeModal(true);
          
          // Show toast after a short delay (after welcome modal appears)
          setTimeout(() => {
            showSuccess(
              'Account Created Successfully! 🎉',
              `Welcome to GrubGate, ${firstName}! Start exploring delicious meals and planning your weekly menu.`,
              { duration: 6000 }
            );
          }, 1000); // Show toast 1 second after welcome modal appears
        } else {
          // Fallback: show success message and switch to login modal
          setSuccessMessage(result.message || 'Registration successful!');
          setTimeout(() => {
            switchToLogin();
          }, 2000);
        }
      } else {
        // Handle field-specific errors from backend
        if (result.fieldErrors) {
          const backendFieldErrors = {};
          
          // Map backend field names to frontend field names
          Object.keys(result.fieldErrors).forEach(backendField => {
            let frontendField = backendField;
            
            // Map backend fields to frontend fields
            if (backendField === 'firstName' || backendField === 'lastName') {
              frontendField = 'name'; // Both firstName and lastName errors show on name field
            }
            
            backendFieldErrors[frontendField] = result.fieldErrors[backendField];
          });
          
          setFormErrors(backendFieldErrors);
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      setFormErrors({ general: 'Registration failed. Please try again.' });
    } finally {
      // Always clear local loading state
      setIsLocalLoading(false);
    }
  };

  // Handle Google sign-up (placeholder for now)
  const handleGoogleSignup = () => {
    console.log('Google sign-up initiated');
  };

  // Handle close with form reset
  const handleClose = () => {
    // 1. Reset the form state
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    // 2. Clear form errors
    setFormErrors({});
    // 3. Clear auth errors
    clearError();
    // 4. Clear success message
    setSuccessMessage('');
    // 5. Reset local loading state
    setIsLocalLoading(false);
    // 6. Close the modal
    closeSignupModal();
  };

  // Handle welcome modal close
  const handleWelcomeModalClose = () => {
    setShowWelcomeModal(false);
    setWelcomeUserName('');
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
    <div className="signup-modal-container">
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
            {/* Success Message */}
            {successMessage && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-600">{successMessage}</p>
              </div>
            )}
            
            {/* Global Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-3">
              
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-grub-red focus:border-grub-red transition-colors duration-200 text-gray-900 placeholder-gray-500 ${
                    formErrors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  required
                  disabled={isLoading || isLocalLoading}
                />
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email address"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-grub-red focus:border-grub-red transition-colors duration-200 text-gray-900 placeholder-gray-500 ${
                    formErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  required
                  disabled={isLoading || isLocalLoading}
                />
                {formErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Create a password (min. 6 characters)"
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

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-grub-red focus:border-grub-red transition-colors duration-200 text-gray-900 placeholder-gray-500 ${
                    formErrors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  required
                  disabled={isLoading || isLocalLoading}
                />
                {formErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.confirmPassword}</p>
                )}
              </div>

              {/* Sign Up Button */}
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
                    Creating account...
                  </div>
                ) : (
                  'Create Account'
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
      
      {/* Welcome Modal */}
      <WelcomeModal
        isOpen={showWelcomeModal}
        onClose={handleWelcomeModalClose}
        userName={welcomeUserName}
      />
    </div>
  );
};

export default SignupModal;
