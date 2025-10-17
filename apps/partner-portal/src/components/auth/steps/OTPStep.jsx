import React, { useState, useEffect, useRef } from 'react';

/**
 * OTPStep Component
 * Handles OTP verification with timer and resend functionality
 * SSR-safe and works with new User model structure
 */
const OTPStep = ({ 
  data, 
  onDataChange, 
  onNext, 
  onBack, 
  isLoading, 
  setIsLoading, 
  errors, 
  setErrors 
}) => {
  
  // OTP timer state
  const [otpTimer, setOtpTimer] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);
  const timerRef = useRef(null);

  // SSR-safe check
  const isClient = typeof window !== 'undefined';

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Only allow numbers and limit to 6 digits
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    
    onDataChange(prev => ({
      ...prev,
      [name]: numericValue
    }));
    
    // Clear field-specific errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Start OTP timer
  const startOTPTimer = () => {
    setOtpTimer(300); // 5 minutes
    setCanResend(false);
  };

  // Handle OTP verification
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    if (isLoading) return;
    
    // Validate OTP
    if (!data.otp || data.otp.length !== 6) {
      setErrors({ otp: 'Please enter the 6-digit verification code' });
      return;
    }
    
    setIsLoading(true);
    setErrors({});
    
    try {
      // Use environment variable for API base URL with fallback to deployed backend
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://gg0b1.netlify.app/api/v1';
      
      // Verify OTP with backend (verification only, not full signup)
      const response = await fetch(`${apiBaseUrl}/auth/partner/otp/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: data.identifier,
          otp: data.otp,
          verifyOnly: true // Flag to indicate we only want to verify OTP
        })
      });
      
      const result = await response.json();
      
      if (response.ok && result.status === 'success') {
        // OTP is valid, pass verification token and move to business details
        onNext({
          otpVerified: true,
          otpVerificationToken: result.data?.verificationToken || `verified_${Date.now()}`, // Temporary token for this session
          ...result.data
        });
      } else {
        // OTP is invalid
        setErrors({ 
          otp: result.message || 'Invalid or expired verification code. Please try again.' 
        });
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      console.error('Error Response Data:', error.response?.data);
      
      // Handle axios error responses with detailed validation errors
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        console.log('🔍 Backend validation errors:', error.response.data.errors);
        // Format backend validation errors for display
        const formattedErrors = {};
        error.response.data.errors.forEach(err => {
          formattedErrors[err.field] = err.message;
        });
        setErrors(formattedErrors);
        // Scroll to top to show validation errors
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (error.response?.data?.message) {
        // Show specific backend error message
        console.log('📝 Backend error message:', error.response.data.message);
        setErrors({ otp: error.response.data.message });
        // Scroll to top to show error message
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // Fallback to generic message
        setErrors({ 
          otp: 'Network error. Please check your connection and try again.' 
        });
        // Scroll to top to show error message
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resend OTP
  const handleResendOTP = async () => {
    if (!canResend || isLoading) return;
    
    setIsLoading(true);
    setErrors({});
    
    try {
      // Use environment variable for API base URL with fallback to deployed backend
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://gg0b1.netlify.app/api/v1';
      
      const response = await fetch(`${apiBaseUrl}/auth/partner/otp/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: data.identifier,
          channel: data.channel
        }),
      });
      
      const result = await response.json();
      
      if (response.ok && result.status === 'success') {
        startOTPTimer();
        // Clear the OTP input
        onDataChange(prev => ({
          ...prev,
          otp: ''
        }));
      } else {
        setErrors({ 
          general: result.message || 'Failed to resend code. Please try again.' 
        });
      }
    } catch (error) {
      console.error('Resend OTP Error:', error);
      console.error('Error Response Data:', error.response?.data);
      
      // Handle axios error responses with detailed validation errors
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        console.log('🔍 Backend validation errors:', error.response.data.errors);
        // Format backend validation errors for display
        const formattedErrors = {};
        error.response.data.errors.forEach(err => {
          formattedErrors[err.field] = err.message;
        });
        setErrors(formattedErrors);
        // Scroll to top to show validation errors
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (error.response?.data?.message) {
        // Show specific backend error message
        console.log('📝 Backend error message:', error.response.data.message);
        setErrors({ general: error.response.data.message });
        // Scroll to top to show error message
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // Fallback to generic message
        setErrors({ 
          general: 'Network error. Please check your connection and try again.' 
        });
        // Scroll to top to show error message
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Timer effect
  useEffect(() => {
    if (!isClient) return;

    if (otpTimer > 0) {
      timerRef.current = setTimeout(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [otpTimer, isClient]);

  // Start timer on mount
  useEffect(() => {
    if (isClient) {
      startOTPTimer();
    }
    
    // Cleanup on unmount
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isClient]);

  // Format timer display
  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <form onSubmit={handleVerifyOTP} className="space-y-4">
      <div>
        <label htmlFor="otp" className="block text-sm font-semibold text-gray-700 mb-2">
          Verification Code
        </label>
        <input
          type="text"
          id="otp"
          name="otp"
          value={data.otp}
          onChange={handleInputChange}
          placeholder="Enter 6-digit code"
          maxLength={6}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-800 focus:border-red-800 transition-colors duration-200 text-gray-900 placeholder-gray-500 text-center text-lg tracking-widest ${
            errors.otp ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}
          required
          disabled={isLoading}
          autoComplete="one-time-code"
          inputMode="numeric"
          pattern="[0-9]{6}"
        />
        {errors.otp && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {errors.otp}
          </p>
        )}
      </div>

      {/* Timer and Resend */}
      <div className="text-center">
        {otpTimer > 0 ? (
          <p className="text-sm text-gray-600">
            Code expires in <span className="font-medium">{formatTimer(otpTimer)}</span>
          </p>
        ) : (
          <button
            type="button"
            onClick={handleResendOTP}
            disabled={!canResend || isLoading}
            className={`text-sm font-medium hover:underline disabled:cursor-not-allowed transition-colors ${
              canResend && !isLoading 
                ? 'text-red-800 hover:text-red-900' 
                : 'text-gray-400'
            }`}
          >
            {isLoading ? 'Sending...' : 'Resend Code'}
          </button>
        )}
      </div>

      {/* Channel Info */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          Code sent to your {data.channel === 'email' ? 'email address' : 'phone number'}
        </p>
      </div>

      <div className="flex space-x-3">
        <button
          type="button"
          onClick={onBack}
          disabled={isLoading}
          className="flex-1 py-2 px-4 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={isLoading || !data.otp || data.otp.length !== 6}
          className={`flex-1 py-2 px-4 rounded-lg font-semibold text-base transition-all duration-200 shadow-lg ${
            isLoading || !data.otp || data.otp.length !== 6
              ? 'bg-gray-400 cursor-not-allowed'
              : 'text-white hover:shadow-xl transform hover:-translate-y-0.5 transition-transform'
          }`}
          style={{ 
            backgroundColor: (isLoading || !data.otp || data.otp.length !== 6) ? undefined : '#800020' 
          }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <svg 
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle 
                  className="opacity-25" 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="currentColor" 
                  strokeWidth="4"
                />
                <path 
                  className="opacity-75" 
                  fill="currentColor" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Verifying...
            </div>
          ) : (
            'Verify Code'
          )}
        </button>
      </div>
    </form>
  );
};

export default OTPStep;
