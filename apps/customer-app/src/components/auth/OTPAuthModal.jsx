import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useModal } from '../../context/ModalContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import WelcomeBackModal from './WelcomeBackModal';
import './modal-responsive.css';

const OTPAuthModal = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isOTPAuthModalOpen, closeOTPAuthModal } = useModal();
  const { otpLogin, isLoading, error, clearError } = useAuth();
  const { showSuccess, showError } = useToast();
  
  // Step management: 'identifier' -> 'verification' -> 'userInfo' (for new users) -> 'signupDetails' (for signup)
  const [currentStep, setCurrentStep] = useState('identifier');
  
  // Form state management
  const [formData, setFormData] = useState({
    identifier: '',
    channel: 'email', // 'email' or 'sms'
    otp: '',
    userType: 'customer', // 'customer' or 'partner'
    firstName: '',
    lastName: '',
    username: '',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  // Local error state for form validation
  const [formErrors, setFormErrors] = useState({});
  
  // Local loading state to prevent multiple clicks
  const [isLocalLoading, setIsLocalLoading] = useState(false);
  
  // OTP timer state
  const [otpTimer, setOtpTimer] = useState(0);
  const [canResend, setCanResend] = useState(true);
  const timerRef = useRef(null);
  
  // Welcome back modal state
  const [showWelcomeBackModal, setShowWelcomeBackModal] = useState(false);
  const [welcomeBackUserName, setWelcomeBackUserName] = useState('');
  
  // New user flag
  const [isNewUser, setIsNewUser] = useState(false);
  
  // Auth mode (login or signup)
  const [authMode, setAuthMode] = useState('signup');

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

  // Auto-detect channel based on identifier
  useEffect(() => {
    if (formData.identifier) {
      const isEmail = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.identifier);
      const isPhone = /^\+?[1-9]\d{1,14}$/.test(formData.identifier);
      
      if (isEmail) {
        setFormData(prev => ({ ...prev, channel: 'email' }));
      } else if (isPhone) {
        setFormData(prev => ({ ...prev, channel: 'sms' }));
      }
    }
  }, [formData.identifier]);

  // Timer effect for OTP resend
  useEffect(() => {
    if (otpTimer > 0) {
      timerRef.current = setTimeout(() => {
        setOtpTimer(otpTimer - 1);
      }, 1000);
    } else if (otpTimer === 0 && !canResend) {
      setCanResend(true);
    }
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [otpTimer, canResend]);

  // Validate identifier step
  const validateIdentifierStep = () => {
    const errors = {};
    
    if (!formData.identifier) {
      errors.identifier = 'Email or phone number is required';
    } else {
      const isEmail = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.identifier);
      const isPhone = /^\+?[1-9]\d{1,14}$/.test(formData.identifier);
      
      if (!isEmail && !isPhone) {
        errors.identifier = 'Please enter a valid email address or phone number';
      }
    }
    
    return errors;
  };

  // Validate OTP step
  const validateOTPStep = () => {
    const errors = {};
    
    if (!formData.otp) {
      errors.otp = 'Verification code is required';
    } else if (!/^\d{6}$/.test(formData.otp)) {
      errors.otp = 'Verification code must be 6 digits';
    }
    
    return errors;
  };

  // Validate user info step (for new users)
  const validateUserInfoStep = () => {
    const errors = {};
    
    if (!formData.firstName) {
      errors.firstName = 'First name is required';
    } else if (formData.firstName.length < 2) {
      errors.firstName = 'First name must be at least 2 characters';
    }
    
    if (!formData.lastName) {
      errors.lastName = 'Last name is required';
    } else if (formData.lastName.length < 2) {
      errors.lastName = 'Last name must be at least 2 characters';
    }
    
    return errors;
  };

  // Validate signup details step (for signup mode)
  const validateSignupDetailsStep = () => {
    const errors = {};
    
    if (!formData.username) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      errors.username = 'Username can only contain letters, numbers, and underscores';
    }
    
    if (!formData.phoneNumber) {
      errors.phoneNumber = 'Phone number is required';
    } else if (!/^\+?[1-9]\d{1,14}$/.test(formData.phoneNumber)) {
      errors.phoneNumber = 'Please enter a valid phone number';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    return errors;
  };

  // Request OTP
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    
    if (isLocalLoading || isLoading) return;
    
    const errors = validateIdentifierStep();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setFormErrors({});
    clearError();
    setIsLocalLoading(true);
    
    try {
      const response = await fetch('/api/v1/auth/otp/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: formData.identifier,
          channel: formData.channel
        }),
      });
      
      const result = await response.json();
      
      if (response.ok && result.status === 'success') {
        // User doesn't exist - proceed with signup flow
        setCurrentStep('verification');
        setOtpTimer(300); // 5 minutes
        setCanResend(false);
        showSuccess(
          'Verification Code Sent!',
          `We've sent a 6-digit code to your ${formData.channel === 'email' ? 'email' : 'phone number'}.`
        );
      } else if (response.status === 409) {
        // User already exists - show helpful message with login guidance
        const errorMessage = result.message || 'Account already exists';
        setFormErrors({ 
          general: `${errorMessage} Please close this modal and use the "Login" option in the top menu to sign in with your existing password.`
        });
      } else {
        // Other errors
        const errorMessage = result.message || 'Failed to send verification code';
        setFormErrors({ general: errorMessage });
      }
    } catch (error) {
      console.error('Request OTP Error:', error);
      setFormErrors({ general: 'Failed to send verification code. Please try again.' });
    } finally {
      setIsLocalLoading(false);
    }
  };

  // Handle OTP verification
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    if (isLocalLoading || isLoading) return;
    
    // Validate OTP
    const errors = {};
    if (!formData.otp || formData.otp.length !== 6) {
      errors.otp = 'Please enter a valid 6-digit code';
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    // For new users, show signup form after OTP verification
    // We'll verify the OTP and collect user details in the next step
    setIsNewUser(true);
    setCurrentStep('userInfo');
    setFormErrors({});
    clearError();
  };
  
  // Handle complete signup (OTP + user details)
  const handleCompleteSignup = async (e) => {
    e.preventDefault();
    
    if (isLocalLoading || isLoading) return;
    
    // Validate signup form
    const errors = {};
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    
    // Determine if identifier is email or phone
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.identifier);
    
    // If identifier is phone, require email
    if (!isEmail && !formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!isEmail && formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // If identifier is email, require phone
    if (isEmail && !formData.phoneNumber.trim()) {
      errors.phoneNumber = 'Phone number is required';
    } else if (isEmail && formData.phoneNumber.trim() && !/^[+]?[1-9]\d{1,14}$/.test(formData.phoneNumber.replace(/[\s()-]/g, ''))) {
      errors.phoneNumber = 'Please enter a valid phone number';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setIsLocalLoading(true);
    setFormErrors({});
    clearError();
    
    // Log the data being sent for debugging
    console.log('📤 Sending signup data:', {
      identifier: formData.identifier,
      otp: formData.otp,
      firstName: formData.firstName,
      lastName: formData.lastName,
      username: formData.username,
      phoneNumber: formData.phoneNumber,
      email: formData.email,
      password: '***hidden***'
    });
    
    try {
      // Prepare payload, filtering out empty optional fields
      const payload = {
        identifier: formData.identifier,
        otp: formData.otp,
        firstName: formData.firstName,
        lastName: formData.lastName,
        password: formData.password
      };
      
      // Only add optional fields if they have values
      if (formData.username && formData.username.trim()) {
        payload.username = formData.username.trim();
      }
      if (formData.email && formData.email.trim()) {
        payload.email = formData.email.trim();
      }
      if (formData.phoneNumber && formData.phoneNumber.trim()) {
        payload.phoneNumber = formData.phoneNumber.trim();
      }
      
      console.log('📤 Final payload being sent:', payload);
      
      const response = await fetch('/api/v1/auth/otp/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ API Success Response:', result);
      
      if (result.status === 'success') {
        // Store auth data
        localStorage.setItem('accessToken', result.data.accessToken);
        if (result.data.refreshToken) {
          localStorage.setItem('refreshToken', result.data.refreshToken);
        }
        localStorage.setItem('user', JSON.stringify(result.data.user));
        
        // Close modal
        closeOTPAuthModal();
        
        // Show appropriate success message
        const isRoleAddition = result.data.message && result.data.message.includes('role added');
        if (isRoleAddition) {
          showSuccess(
            'Role Added Successfully!',
            result.data.message
          );
        } else {
          showSuccess(
            'Welcome to GrubGate!',
            'Your account has been created successfully. Start planning your meals!'
          );
        }
        // Show welcome modal or success message
        const pendingRedirect = localStorage.getItem('pendingRedirect');
        if (!pendingRedirect) {
          setShowWelcomeBackModal(true);
          setTimeout(() => {
            showSuccess(
              'Welcome to GrubGate! 🎉',
              `Great to see you, ${firstName}! Ready to start your meal planning journey?`,
              { duration: 5000 }
            );
          }, 800);
        }
      } else {
        setFormErrors({ general: result.message || 'Signup failed. Please try again.' });
      }
    } catch (error) {
      console.error('Complete Signup Error:', error);
      setFormErrors({ general: 'Failed to complete signup. Please try again.' });
    } finally {
      setIsLocalLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (!canResend || isLocalLoading || isLoading) return;
    
    setIsLocalLoading(true);
    
    try {
      const response = await fetch('/api/v1/auth/otp/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: formData.identifier,
          channel: formData.channel
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setOtpTimer(300); // 5 minutes
        setCanResend(false);
        setFormData(prev => ({ ...prev, otp: '' })); // Clear OTP field
        showSuccess('Code Resent!', 'A new verification code has been sent.');
      } else {
        showError('Resend Failed', result.message || 'Failed to resend verification code');
      }
    } catch (error) {
      console.error('Resend OTP Error:', error);
      showError('Resend Failed', 'Failed to resend verification code. Please try again.');
    } finally {
      setIsLocalLoading(false);
    }
  };

  // Handle back button
  const handleBack = () => {
    if (currentStep === 'verification') {
      setCurrentStep('identifier');
      setFormData(prev => ({ ...prev, otp: '' }));
      setOtpTimer(0);
      setCanResend(true);
    } else if (currentStep === 'userInfo') {
      setCurrentStep('verification');
      setIsNewUser(false);
    } else if (currentStep === 'signupDetails') {
      setCurrentStep('verification');
      setIsNewUser(false);
    }
    setFormErrors({});
    clearError();
  };

  // Handle close with form reset
  const handleClose = () => {
    setCurrentStep('identifier');
    setFormData({
      identifier: '',
      channel: 'email',
      otp: '',
      userType: 'customer',
      firstName: '',
      lastName: '',
      username: '',
      phoneNumber: '',
      password: '',
      confirmPassword: ''
    });
    setFormErrors({});
    setIsLocalLoading(false);
    setOtpTimer(0);
    setCanResend(true);
    setIsNewUser(false);
    setAuthMode('signup');
    clearError();
    closeOTPAuthModal();
  };

  // Handle welcome back modal close
  const handleWelcomeBackModalClose = () => {
    setShowWelcomeBackModal(false);
    setWelcomeBackUserName('');
  };

  // Handle ESC key to close modal and detect auth mode
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    if (isOTPAuthModalOpen) {
      // Get auth mode from sessionStorage
      const mode = sessionStorage.getItem('otpAuthMode') || 'signup';
      setAuthMode(mode);
      
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOTPAuthModalOpen]);

  // Format timer display
  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOTPAuthModalOpen) {
    return null;
  }

  return (
    <div className="modal-container">
      {/* Modal Overlay */}
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
            aria-label="Close authentication modal"
          >
            <svg className="modal-close-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          {/* Header */}
          <div className="p-6 pb-0 text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2" style={{color: '#800020'}}>
              {currentStep === 'identifier' && 'Join GrubGate'}
              {currentStep === 'verification' && 'Enter Verification Code'}
              {currentStep === 'userInfo' && 'Complete Your Profile'}
              {currentStep === 'signupDetails' && 'Create Your Account'}
            </h1>
            <p className="text-base text-gray-600 mb-4">
              {currentStep === 'identifier' && 'Create your account to get started with meal planning'}
              {currentStep === 'verification' && `We sent a code to your ${formData.channel === 'email' ? 'email' : 'phone number'}`}
              {currentStep === 'userInfo' && 'Tell us a bit about yourself to create your account'}
              {currentStep === 'signupDetails' && 'Set up your username, phone, and password'}
            </p>
          </div>

          {/* Form Content */}
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

            {/* Step 1: Identifier Input */}
            {currentStep === 'identifier' && (
              <form onSubmit={handleRequestOTP} className="space-y-4">
                <div>
                  <label htmlFor="identifier" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email or Phone Number
                  </label>
                  <input
                    type="text"
                    id="identifier"
                    name="identifier"
                    value={formData.identifier}
                    onChange={handleInputChange}
                    placeholder="Enter your email or phone number"
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

                {/* Customer Website - Fixed User Type */}
                <div className={`${authMode === 'login' ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'} border rounded-lg p-3`}>
                  <div className="flex items-center space-x-2">
                    <svg className={`w-5 h-5 ${authMode === 'login' ? 'text-green-600' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className={`text-sm font-medium ${authMode === 'login' ? 'text-green-800' : 'text-blue-800'}`}>
                      {authMode === 'login' ? 'Customer Login' : 'Creating Customer Account'}
                    </span>
                  </div>
                  <p className={`text-xs ${authMode === 'login' ? 'text-green-600' : 'text-blue-600'} mt-1`}>
                    {authMode === 'login' 
                      ? 'Sign in to access your meal plans and orders.' 
                      : 'You\'re signing up for GrubGate as a customer to plan and order meals.'
                    }
                  </p>
                </div>
                
                {/* Hidden input for customer type */}
                <input type="hidden" name="userType" value="customer" />

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
                      Sending Code...
                    </div>
                  ) : (
                    authMode === 'login' ? 'Send Login Code' : 'Send Verification Code'
                  )}
                </button>
              </form>
            )}

            {/* Step 2: OTP Verification */}
            {currentStep === 'verification' && (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div>
                  <label htmlFor="otp" className="block text-sm font-semibold text-gray-700 mb-2">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    id="otp"
                    name="otp"
                    value={formData.otp}
                    onChange={handleInputChange}
                    placeholder="Enter 6-digit code"
                    maxLength="6"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-grub-red focus:border-grub-red transition-colors duration-200 text-gray-900 placeholder-gray-500 text-center text-lg tracking-widest ${
                      formErrors.otp ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    required
                    disabled={isLoading || isLocalLoading}
                  />
                  {formErrors.otp && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.otp}</p>
                  )}
                </div>

                {/* Timer and Resend */}
                <div className="text-center">
                  {otpTimer > 0 ? (
                    <p className="text-sm text-gray-600">
                      Code expires in {formatTimer(otpTimer)}
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={!canResend || isLoading || isLocalLoading}
                      className="text-sm text-grub-red hover:text-red-700 font-medium transition-colors duration-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      Resend Code
                    </button>
                  )}
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 py-2 px-4 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || isLocalLoading}
                    className={`flex-1 py-2 px-4 rounded-lg font-semibold text-base transition-colors duration-200 shadow-lg ${
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
                        Verifying...
                      </div>
                    ) : (
                      'Verify & Continue'
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Signup Details (for signup mode) */}
            {currentStep === 'signupDetails' && (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="First name"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-grub-red focus:border-grub-red transition-colors duration-200 text-gray-900 placeholder-gray-500 ${
                        formErrors.firstName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      required
                      disabled={isLoading || isLocalLoading}
                    />
                    {formErrors.firstName && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Last name"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-grub-red focus:border-grub-red transition-colors duration-200 text-gray-900 placeholder-gray-500 ${
                        formErrors.lastName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      required
                      disabled={isLoading || isLocalLoading}
                    />
                    {formErrors.lastName && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.lastName}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Choose a username"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-grub-red focus:border-grub-red transition-colors duration-200 text-gray-900 placeholder-gray-500 ${
                      formErrors.username ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    required
                    disabled={isLoading || isLocalLoading}
                  />
                  {formErrors.username && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.username}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="+1234567890"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-grub-red focus:border-grub-red transition-colors duration-200 text-gray-900 placeholder-gray-500 ${
                      formErrors.phoneNumber ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    required
                    disabled={isLoading || isLocalLoading}
                  />
                  {formErrors.phoneNumber && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.phoneNumber}</p>
                  )}
                </div>

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
                    placeholder="Create a strong password"
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

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 py-2 px-4 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || isLocalLoading}
                    className={`flex-1 py-2 px-4 rounded-lg font-semibold text-base transition-colors duration-200 shadow-lg ${
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
                        Creating Account...
                      </div>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Step 4: User Info (for new users in login mode) */}
            {currentStep === 'userInfo' && (
              <form onSubmit={handleCompleteSignup} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="First name"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-grub-red focus:border-grub-red transition-colors duration-200 text-gray-900 placeholder-gray-500 ${
                        formErrors.firstName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      required
                      disabled={isLoading || isLocalLoading}
                    />
                    {formErrors.firstName && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Last name"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-grub-red focus:border-grub-red transition-colors duration-200 text-gray-900 placeholder-gray-500 ${
                        formErrors.lastName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      required
                      disabled={isLoading || isLocalLoading}
                    />
                    {formErrors.lastName && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.lastName}</p>
                    )}
                  </div>
                </div>

                {/* Email and Phone Fields - Show based on what was verified */}
                {(() => {
                  const isEmailVerified = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.identifier);
                  
                  return (
                    <div className="grid grid-cols-2 gap-3">
                      {/* Verified Email (read-only) or Email Input */}
                      <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                          Email {isEmailVerified && <span className="text-green-600 text-xs">(Verified)</span>}
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={isEmailVerified ? formData.identifier : formData.email}
                          onChange={isEmailVerified ? undefined : handleInputChange}
                          placeholder={isEmailVerified ? "" : "Enter your email"}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-grub-red focus:border-grub-red transition-colors duration-200 text-gray-900 placeholder-gray-500 ${
                            isEmailVerified 
                              ? 'bg-green-50 border-green-300 cursor-not-allowed' 
                              : (formErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-300')
                          }`}
                          required={!isEmailVerified}
                          disabled={isEmailVerified || isLoading || isLocalLoading}
                          readOnly={isEmailVerified}
                        />
                        {formErrors.email && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                        )}
                      </div>
                      
                      {/* Verified Phone (read-only) or Phone Input */}
                      <div>
                        <label htmlFor="phoneNumber" className="block text-sm font-semibold text-gray-700 mb-2">
                          Phone Number {!isEmailVerified && <span className="text-green-600 text-xs">(Verified)</span>}
                        </label>
                        <input
                          type="tel"
                          id="phoneNumber"
                          name="phoneNumber"
                          value={!isEmailVerified ? formData.identifier : formData.phoneNumber}
                          onChange={!isEmailVerified ? undefined : handleInputChange}
                          placeholder={!isEmailVerified ? "" : "Enter your phone number"}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-grub-red focus:border-grub-red transition-colors duration-200 text-gray-900 placeholder-gray-500 ${
                            !isEmailVerified 
                              ? 'bg-green-50 border-green-300 cursor-not-allowed' 
                              : (formErrors.phoneNumber ? 'border-red-300 bg-red-50' : 'border-gray-300')
                          }`}
                          required={isEmailVerified}
                          disabled={!isEmailVerified || isLoading || isLocalLoading}
                          readOnly={!isEmailVerified}
                        />
                        {formErrors.phoneNumber && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.phoneNumber}</p>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Password Fields */}
                <div className="grid grid-cols-2 gap-3">
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
                      placeholder="Enter password"
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
                      placeholder="Confirm password"
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
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 py-2 px-4 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || isLocalLoading}
                    className={`flex-1 py-2 px-4 rounded-lg font-semibold text-base transition-colors duration-200 shadow-lg ${
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
                        Creating Account...
                      </div>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 text-center">
            <p className="text-xs text-gray-500">
              By continuing, you agree to our Terms of Service and Privacy Policy
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

export default OTPAuthModal;
