// API functions for OTP authentication
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://gg0b1.netlify.app/api/v1';

/**
 * Request OTP for authentication
 * @param {string} identifier - Email or phone number
 * @param {string} channel - 'email' or 'sms'
 * @returns {Promise<Object>} API response
 */
export const requestOTP = async (identifier, channel) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/otp/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier,
        channel
      }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to send OTP');
    }

    return {
      success: true,
      data: result.data,
      message: result.message
    };
  } catch (error) {
    console.error('Request OTP API Error:', error);
    return {
      success: false,
      error: error.message,
      message: error.message || 'Failed to send verification code'
    };
  }
};

/**
 * Verify OTP and authenticate user
 * @param {string} identifier - Email or phone number
 * @param {string} otp - 6-digit verification code
 * @param {string} userType - 'customer' or 'partner'
 * @param {string} firstName - First name (for new users)
 * @param {string} lastName - Last name (for new users)
 * @returns {Promise<Object>} API response
 */
export const verifyOTP = async (identifier, otp, userType = 'customer', firstName = '', lastName = '') => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/otp/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier,
        otp,
        userType,
        firstName: firstName.trim(),
        lastName: lastName.trim()
      }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to verify OTP');
    }

    return {
      success: true,
      data: result.data,
      message: result.message,
      isNewUser: result.message.includes('created')
    };
  } catch (error) {
    console.error('Verify OTP API Error:', error);
    return {
      success: false,
      error: error.message,
      message: error.message || 'Failed to verify code'
    };
  }
};

/**
 * Check if identifier is valid email
 * @param {string} identifier 
 * @returns {boolean}
 */
export const isValidEmail = (identifier) => {
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(identifier);
};

/**
 * Check if identifier is valid phone number (E.164 format)
 * @param {string} identifier 
 * @returns {boolean}
 */
export const isValidPhone = (identifier) => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(identifier);
};

/**
 * Format phone number to E.164 format
 * @param {string} phoneNumber 
 * @param {string} defaultCountryCode 
 * @returns {string}
 */
export const formatPhoneNumber = (phoneNumber, defaultCountryCode = '+1') => {
  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, '');
  
  // If it starts with country code, add +
  if (digits.length > 10) {
    return `+${digits}`;
  }
  
  // If it's a 10-digit number, add default country code
  if (digits.length === 10) {
    return `${defaultCountryCode}${digits}`;
  }
  
  // Return as is if we can't determine format
  return phoneNumber;
};
