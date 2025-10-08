// FILE: src/api/settingsApi.js
import { apiClient } from './client';

/**
 * Get restaurant settings
 */
export const getRestaurantSettings = async (restaurantId) => {
  try {
    const response = await apiClient.get(`/partner/restaurants/${restaurantId}/settings`);
    return response.data;
  } catch (error) {
    console.error('Error fetching restaurant settings:', error);
    throw error;
  }
};

/**
 * Update restaurant settings
 */
export const updateRestaurantSettings = async (restaurantId, settings) => {
  try {
    const response = await apiClient.patch(`/partner/restaurants/${restaurantId}/settings`, settings);
    return response.data;
  } catch (error) {
    console.error('Error updating restaurant settings:', error);
    throw error;
  }
};

/**
 * Get user notification preferences
 */
export const getNotificationPreferences = async () => {
  try {
    const response = await apiClient.get('/partner/users/me/notification-preferences');
    return response.data;
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    throw error;
  }
};

/**
 * Update user notification preferences
 */
export const updateNotificationPreferences = async (preferences) => {
  try {
    const response = await apiClient.patch('/partner/users/me/notification-preferences', {
      preferences
    });
    return response.data;
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    throw error;
  }
};

/**
 * Get user billing information
 */
export const getBillingInfo = async () => {
  try {
    const response = await apiClient.get('/partner/users/me/billing');
    return response.data;
  } catch (error) {
    console.error('Error fetching billing information:', error);
    throw error;
  }
};

/**
 * Update user billing information
 */
export const updateBillingInfo = async (billingInfo) => {
  try {
    const response = await apiClient.patch('/partner/users/me/billing', {
      billingInfo
    });
    return response.data;
  } catch (error) {
    console.error('Error updating billing information:', error);
    throw error;
  }
};

/**
 * Helper function to format address for display
 */
export const formatAddress = (address) => {
  if (typeof address === 'string') {
    return address;
  }
  
  if (typeof address === 'object' && address) {
    const parts = [
      address.street,
      address.city,
      address.province,
      address.postalCode
    ].filter(Boolean);
    
    return parts.join(', ');
  }
  
  return '';
};

/**
 * Helper function to parse address string into components
 */
export const parseAddress = (addressString) => {
  if (!addressString || typeof addressString !== 'string') {
    return {
      street: '',
      city: '',
      province: '',
      postalCode: ''
    };
  }
  
  // Simple parsing - can be enhanced based on requirements
  const parts = addressString.split(',').map(part => part.trim());
  
  return {
    street: parts[0] || '',
    city: parts[1] || '',
    province: parts[2] || '',
    postalCode: parts[3] || ''
  };
};

/**
 * Helper function to validate email format
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Helper function to validate phone format
 */
export const validatePhone = (phone) => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
};

/**
 * Helper function to validate URL format
 */
export const validateURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
