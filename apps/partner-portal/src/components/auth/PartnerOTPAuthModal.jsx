import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import PhoneNumberStep from './steps/PhoneNumberStep.jsx';
import OTPStep from './steps/OTPStep.jsx';
import BusinessDetailsStep from './steps/BusinessDetailsStep.jsx';
import BillingDetailsStep from './steps/BillingDetailsStep.jsx';

/**
 * Refactored PartnerOTPAuthModal - Parent Container Component
 * Manages overall state and step navigation
 * SSR-safe and works with new nested User model structure
 */
const PartnerOTPAuthModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setAuthenticatedUser } = useAuth();
  const { showSuccess, showError } = useToast();
  
  // Step management: 'identifier' -> 'verification' -> 'business-details' -> 'billing-details'
  const [currentStep, setCurrentStep] = useState('identifier');
  
  // Shared state across all steps
  const [sharedData, setSharedData] = useState({
    identifier: '',
    channel: 'email', // 'email' or 'sms'
    otp: '',
    isNewUser: false
  });
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // SSR-safe check
  const isClient = typeof window !== 'undefined';
  
  // Handle step navigation
  const goToStep = (step) => {
    setCurrentStep(step);
    setErrors({}); // Clear errors when changing steps
  };

  const goBack = () => {
    if (currentStep === 'verification') {
      setCurrentStep('identifier');
    } else if (currentStep === 'business-details') {
      setCurrentStep('verification');
    } else if (currentStep === 'billing-details') {
      setCurrentStep('business-details');
    }
  };

  // Handle successful OTP verification
  const handleOTPVerified = (data) => {
    setSharedData(prev => ({
      ...data
    }));
    setCurrentStep('business-details');
  };

  // Handle OTP verification completion - redirect to full page registration
  const handleOTPComplete = (verificationData) => {
    try {
      // Store verification data in sessionStorage for the full-page form
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('otpVerificationData', JSON.stringify({
          ...sharedData,
          ...verificationData,
          timestamp: Date.now()
        }));
      }
      
      // Close modal and redirect to full-page business details
      handleClose();
      navigate('/register/business-details');
      
    } catch (error) {
      console.error('OTP completion error:', error);
      showError('Verification failed. Please try again.');
    }
  };

  // Handle business details completion (legacy - for modal flow)
  const handleBusinessDetailsComplete = (businessData) => {
    setSharedData(prev => ({ ...prev, ...businessData }));
    setCurrentStep('billing-details');
  };

  // Handle signup completion (legacy - for modal flow)
  const handleSignupComplete = async (finalData) => {
    try {
      setIsLoading(true);
      
      const completeData = { ...sharedData, ...finalData };
      console.log('Final registration data:', completeData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const userData = {
        user: completeData.user,
        accessToken: completeData.accessToken || 'temp_token',
        refreshToken: completeData.refreshToken || 'temp_refresh'
      };
      
      const authResult = setAuthenticatedUser(userData);
      
      if (authResult.success) {
        showSuccess('Registration successful! Welcome to GrubGate Partner Portal.');
        handleClose();
        navigate('/onboarding/welcome');
      } else {
        throw new Error(authResult.error);
      }
      
    } catch (error) {
      console.error('Registration completion error:', error);
      showError('Registration failed. Please try again.');
      setErrors({ general: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle close
  const handleClose = () => {
    setCurrentStep('identifier');
    setSharedData({
      identifier: '',
      channel: 'email',
      otp: '',
      isNewUser: false
    });
    setErrors({});
    setIsLoading(false);
    onClose();
  };
  
  // Don't render on server or when closed
  if (!isClient || !isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 pb-0 text-center relative">
          <button
            onClick={handleClose}
            className="absolute top-0 right-0 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2" style={{color: '#800020'}}>
            {currentStep === 'identifier' && t('auth.register.title')}
            {currentStep === 'verification' && t('auth.register.otpTitle')}
            {currentStep === 'business-details' && t('auth.register.businessTitle')}
            {currentStep === 'billing-details' && t('auth.register.billingTitle')}
          </h1>
          
          <p className="text-base text-gray-600 mb-4">
            {currentStep === 'identifier' && t('auth.register.subtitle')}
            {currentStep === 'verification' && `${t('auth.register.otpSubtitle')} ${sharedData.channel === 'email' ? 'email' : t('auth.register.phone').toLowerCase()}`}
            {currentStep === 'business-details' && t('auth.register.businessSubtitle')}
            {currentStep === 'billing-details' && t('auth.register.billingSubtitle')}
          </p>

          {/* Progress Indicator */}
          <div className="flex justify-center mb-4">
            <div className="flex space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                currentStep === 'identifier' ? 'bg-red-800' : 'bg-green-500'
              }`} />
              <div className={`w-3 h-3 rounded-full ${
                currentStep === 'verification' ? 'bg-red-800' : 
                (currentStep === 'business-details' || currentStep === 'billing-details') ? 'bg-green-500' : 'bg-gray-300'
              }`} />
              <div className={`w-3 h-3 rounded-full ${
                currentStep === 'business-details' ? 'bg-red-800' : 
                currentStep === 'billing-details' ? 'bg-green-500' : 'bg-gray-300'
              }`} />
              <div className={`w-3 h-3 rounded-full ${
                currentStep === 'billing-details' ? 'bg-red-800' : 'bg-gray-300'
              }`} />
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="px-6 pb-6">
          {/* Global Error Message */}
          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}
          
          {/* Step Components */}
          {currentStep === 'identifier' && (
            <PhoneNumberStep
              data={sharedData}
              onDataChange={setSharedData}
              onNext={() => goToStep('verification')}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              errors={errors}
              setErrors={setErrors}
            />
          )}

          {currentStep === 'verification' && (
            <OTPStep
              data={sharedData}
              onDataChange={setSharedData}
              onNext={handleOTPComplete}
              onBack={goBack}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              errors={errors}
              setErrors={setErrors}
            />
          )}

          {currentStep === 'business-details' && (
            <BusinessDetailsStep
              data={sharedData}
              onComplete={handleBusinessDetailsComplete}
              onBack={goBack}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              errors={errors}
              setErrors={setErrors}
            />
          )}

          {currentStep === 'billing-details' && (
            <BillingDetailsStep
              data={sharedData}
              onComplete={handleSignupComplete}
              onBack={goBack}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              errors={errors}
              setErrors={setErrors}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PartnerOTPAuthModal;