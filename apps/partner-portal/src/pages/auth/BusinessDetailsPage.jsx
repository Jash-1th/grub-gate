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
      
      // Set user as authenticated
      const authResult = setAuthenticatedUser(userData);
      
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
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Logo className="h-8 w-auto" />
              <span className="ml-3 text-xl font-semibold text-gray-900">
                Partner Registration
              </span>
            </div>
            
            <div className="text-sm text-gray-500">
              Step 2 of 2: Business Details
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Progress Indicator */}
          <div className="px-8 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 bg-green-500 rounded-full">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="ml-3 text-sm font-medium text-gray-900">Phone Verified</span>
              </div>
              
              <div className="flex-1 mx-4 h-0.5 bg-blue-600"></div>
              
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full">
                  <span className="text-white text-sm font-medium">2</span>
                </div>
                <span className="ml-3 text-sm font-medium text-gray-900">Business Details</span>
              </div>
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
