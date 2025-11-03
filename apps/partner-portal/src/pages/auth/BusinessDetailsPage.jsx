import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import BusinessDetailsStep from '../../components/auth/steps/BusinessDetailsStep.jsx';
import { Logo } from '@grub-gate/ui';

/**
 * BusinessDetailsPage Component
 * Full-page business details form after OTP verification
 * Replaces the modal-based business details step
 */
const BusinessDetailsPage = () => {
  const navigate = useNavigate();
  const { setAuthenticatedUser } = useAuth();
  const { showSuccess, showError } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [otpData, setOtpData] = useState(null);

  // Check for OTP verification data on mount
  useEffect(() => {
    const storedData = sessionStorage.getItem('otpVerificationData');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        // Check if data is not too old (30 minutes)
        const isExpired = Date.now() - parsedData.timestamp > 30 * 60 * 1000;
        
        if (isExpired) {
          sessionStorage.removeItem('otpVerificationData');
          showError('Verification expired. Please start registration again.');
          navigate('/register');
          return;
        }
        
        setOtpData(parsedData);
      } catch (error) {
        console.error('Error parsing OTP data:', error);
        navigate('/register');
      }
    } else {
      // No OTP data found, redirect to registration
      showError('Please complete phone verification first.');
      navigate('/register');
    }
  }, [navigate, showError]);

  // Handle business details completion
  const handleComplete = async (realBackendData) => {
    try {
      setIsLoading(true);
      
      console.log('✅ Registration successful! Backend data:', realBackendData);
      
      // Use the REAL backend response data instead of mock data
      const userData = {
        user: {
          ...realBackendData.user,
          registrationComplete: true,
          registrationStage: 3
        },
        accessToken: realBackendData.accessToken,
        refreshToken: realBackendData.refreshToken
      };
      
      // Debug: Log the userData being set
      console.log('🔐 Setting user as authenticated:', userData);
      
      // Set user as authenticated (with isSignup = true)
      const authResult = setAuthenticatedUser(userData, true);
      
      console.log('🔐 Auth result:', authResult);
      
      if (authResult.success) {
        // Clear OTP data from session storage
        sessionStorage.removeItem('otpVerificationData');
        
        showSuccess('Registration successful! Welcome to GrubGate Partner Portal.');
        
        console.log('🚀 Navigating to /onboarding/welcome...');
        // Redirect to onboarding welcome page
        navigate('/onboarding/welcome');
      } else {
        console.error('❌ Authentication failed:', authResult.error);
        throw new Error(authResult.error);
      }
      
    } catch (error) {
      console.error('Registration error:', error);
      showError('Registration failed. Please try again.');
      setErrors({ general: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    // Clear stored data and go back to registration
    sessionStorage.removeItem('otpVerificationData');
    navigate('/register');
  };

  // Show loading while checking OTP data
  if (!otpData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying registration data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Enhanced Progress Indicator */}
          <div className="relative px-4 sm:px-8 py-6 sm:py-8 bg-gradient-to-r from-green-50 via-blue-50 to-indigo-50 border-b-2 border-blue-200 overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/20 rounded-full blur-3xl -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-green-200/20 rounded-full blur-2xl translate-y-12 -translate-x-12"></div>
            
            <div className="relative flex items-center justify-between max-w-2xl mx-auto">
              {/* Step 1 - Phone Verified */}
              <div className="flex items-center group">
                <div className="relative">
                  <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full shadow-lg transform transition-transform group-hover:scale-110">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  {/* Pulse ring */}
                  <div className="absolute inset-0 rounded-full bg-green-400 opacity-0 group-hover:opacity-30 group-hover:animate-ping"></div>
                </div>
                <div className="ml-3 hidden sm:block">
                  <p className="text-xs font-medium text-green-700 uppercase tracking-wide">Step 1</p>
                  <p className="text-sm font-bold text-gray-900">Phone Verified</p>
                </div>
                <span className="ml-2 sm:hidden text-xs font-semibold text-green-700">Step 1</span>
              </div>
              
              {/* Animated Connector Line */}
              <div className="flex-1 mx-3 sm:mx-6 relative h-1 bg-gray-200 rounded-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-blue-500 to-blue-600 rounded-full animate-pulse"></div>
                {/* Moving shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
              </div>
              
              {/* Step 2 - Business Details (Active) */}
              <div className="flex items-center group">
                <div className="relative">
                  <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full shadow-lg animate-pulse">
                    <span className="text-white text-base sm:text-lg font-bold">2</span>
                  </div>
                  {/* Rotating ring */}
                  <div className="absolute inset-0 rounded-full border-2 border-blue-400 border-t-transparent animate-spin opacity-50"></div>
                </div>
                <div className="ml-3 hidden sm:block">
                  <p className="text-xs font-medium text-blue-700 uppercase tracking-wide">Step 2</p>
                  <p className="text-sm font-bold text-gray-900">Business Details</p>
                </div>
                <span className="ml-2 sm:hidden text-xs font-semibold text-blue-700">Step 2</span>
              </div>
            </div>
            
            {/* Progress percentage */}
            <div className="mt-4 text-center">
              <p className="text-xs sm:text-sm text-gray-600 font-medium">
                <span className="text-blue-600 font-bold">50%</span> Complete - Almost there! 🎉
              </p>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Complete Your Restaurant Information
              </h1>
              <p className="text-gray-600">
                Tell us about your restaurant to complete your partner registration.
              </p>
            </div>

            {/* Global Error Message */}
            {errors.general && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.general}</p>
              </div>
            )}

            {/* Business Details Form */}
            <BusinessDetailsStep
              data={otpData}
              onComplete={handleComplete}
              onBack={handleBack}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              errors={errors}
              setErrors={setErrors}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>Need help? Contact our support team at support@grubgate.com</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BusinessDetailsPage;
