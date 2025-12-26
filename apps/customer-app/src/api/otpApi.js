// API functions for OTP authentication
import apiClient from './apiClient';

/**
 * Request OTP for authentication
 * @param {string} identifier - Email or phone number
 * @param {string} channel - 'email' or 'sms'
 * @returns {Promise<Object>} API response
 */
export const requestOTP = async (identifier, channel) => {
  try {
    const response = await apiClient.post('/auth/otp/request', {
      identifier,
      channel
    });

    const result = response.data;

    return {
      success: true,
      data: result.data,
      message: result.message
    };
  } catch (error) {
    console.error('Request OTP API Error:', error);

    const message = error?.response?.data?.message || error.message || 'Failed to send verification code';
    return {
      success: false,
      error: message,
      message
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
    const response = await apiClient.post('/auth/otp/verify', {
      identifier,
      otp,
      userType,
      firstName: firstName.trim(),
      lastName: lastName.trim()
    });

    const result = response.data;

    return {
      success: true,
      data: result.data,
      message: result.message,
      isNewUser: result.message.includes('created')
    };
  } catch (error) {
    console.error('Verify OTP API Error:', error);

    const message = error?.response?.data?.message || error.message || 'Failed to verify code';
    return {
      success: false,
      error: message,
      message
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
