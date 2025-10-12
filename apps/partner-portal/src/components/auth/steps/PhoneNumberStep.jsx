import React from 'react';

/**
 * PhoneNumberStep Component
 * Handles identifier (email/phone) input and OTP request
 * SSR-safe and works with new User model structure
 */
const PhoneNumberStep = ({ 
  data, 
  onDataChange, 
  onNext, 
  isLoading, 
  setIsLoading, 
  errors, 
  setErrors 
}) => {
  
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    onDataChange(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field-specific errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle OTP request
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    
    if (isLoading) return;
    
    // Validate input
    const validationErrors = {};
    if (!data.identifier) {
      validationErrors.identifier = 'Email or phone number is required';
    } else {
      // Check if it's a valid email or phone
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.identifier);
      const isPhone = /^[+]?[1-9]\d{1,14}$/.test(data.identifier.replace(/[\s()-]/g, ''));
      
      if (!isEmail && !isPhone) {
        validationErrors.identifier = 'Please enter a valid email address or phone number';
      } else {
        // Set channel based on identifier type
        onDataChange(prev => ({
          ...prev,
          channel: isEmail ? 'email' : 'sms'
        }));
      }
    }
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setIsLoading(true);
    setErrors({});
    
    try {
      // Use environment variable for API base URL with fallback
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
      
      // Debug: Log what we're sending
      console.log('🔍 OTP Request Debug:', {
        apiBaseUrl,
        identifier: data.identifier,
        channel: data.channel,
        fullUrl: `${apiBaseUrl}/auth/partner/otp/request`
      });
      
      const response = await fetch(`${apiBaseUrl}/auth/partner/otp/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          identifier: data.identifier,
          channel: data.channel
        })
      });
      
      const result = await response.json();
      
      // Debug: Log the response
      console.log('🔍 OTP Response Debug:', {
        status: response.status,
        ok: response.ok,
        result: result
      });
      
      if (response.ok && result.status === 'success') {
        // Check if user exists to determine if this is a new signup
        onDataChange(prev => ({
          ...prev,
          isNewUser: result.data?.isNewUser || false
        }));
        
        onNext(); // Move to OTP verification step
      } else {
        setErrors({ 
          identifier: result.message || 'Failed to send OTP. Please try again.' 
        });
      }
    } catch (error) {
      console.error('OTP request error:', error);
      setErrors({ 
        identifier: 'Network error. Please check your connection and try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleRequestOTP} className="space-y-4">
      <div>
        <label htmlFor="identifier" className="block text-sm font-semibold text-gray-700 mb-2">
          Email or Phone Number
        </label>
        <input
          type="text"
          id="identifier"
          name="identifier"
          value={data.identifier}
          onChange={handleInputChange}
          placeholder="Enter your email or phone number"
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-800 focus:border-red-800 transition-colors duration-200 text-gray-900 placeholder-gray-500 ${
            errors.identifier ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}
          required
          disabled={isLoading}
          autoComplete="email tel"
        />
        {errors.identifier && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {errors.identifier}
          </p>
        )}
      </div>

      <div className="flex space-x-3">
        <button
          type="submit"
          disabled={isLoading || !data.identifier.trim()}
          className={`flex-1 py-2 px-4 rounded-lg font-semibold text-base transition-all duration-200 shadow-lg ${
            isLoading || !data.identifier.trim()
              ? 'bg-gray-400 cursor-not-allowed'
              : 'text-white hover:shadow-xl transform hover:-translate-y-0.5 transition-transform'
          }`}
          style={{ 
            backgroundColor: (isLoading || !data.identifier.trim()) ? undefined : '#800020' 
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
              Sending Code...
            </div>
          ) : (
            'Send Verification Code'
          )}
        </button>
      </div>

      {/* Help Text */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          We'll send you a verification code to confirm your identity
        </p>
      </div>
    </form>
  );
};

export default PhoneNumberStep;
