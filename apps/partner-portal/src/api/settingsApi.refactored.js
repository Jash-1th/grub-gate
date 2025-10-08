// FILE: src/api/settingsApi.refactored.js
import { apiClient } from './client';

/**
 * Updated Settings API for Refactored User Model
 * Handles the new nested partnerInfo structure
 */

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
 * Get user notification preferences from partnerInfo.notificationPreferences
 */
export const getNotificationPreferences = async () => {
  try {
    const response = await apiClient.get('/partner/users/me');
    
    // Extract notification preferences from partnerInfo
    const partnerInfo = response.data.user?.partnerInfo;
    if (!partnerInfo) {
      throw new Error('Partner information not found');
    }
    
    return {
      success: true,
      data: {
        preferences: partnerInfo.notificationPreferences || {
          orderAlerts: true,
          systemUpdates: true,
          promotionalEmails: false,
          weeklyReports: true
        }
      }
    };
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    throw error;
  }
};

/**
 * Update user notification preferences in partnerInfo.notificationPreferences
 */
export const updateNotificationPreferences = async (preferences) => {
  try {
    const response = await apiClient.patch('/partner/users/me', {
      partnerInfo: {
        notificationPreferences: preferences
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    throw error;
  }
};

/**
 * Get user billing information from partnerInfo.billingInfo
 */
export const getBillingInfo = async () => {
  try {
    const response = await apiClient.get('/partner/users/me');
    
    // Extract billing info from partnerInfo
    const partnerInfo = response.data.user?.partnerInfo;
    if (!partnerInfo) {
      throw new Error('Partner information not found');
    }
    
    return {
      success: true,
      data: {
        billingInfo: partnerInfo.billingInfo || {
          paymentMethod: '',
          taxId: '',
          billingAddress: {
            street: '',
            city: '',
            state: '',
            postalCode: '',
            country: 'Canada'
          },
          bankAccount: {
            accountNumber: '',
            routingNumber: '',
            bankName: ''
          }
        }
      }
    };
  } catch (error) {
    console.error('Error fetching billing information:', error);
    throw error;
  }
};

/**
 * Update user billing information in partnerInfo.billingInfo
 */
export const updateBillingInfo = async (billingInfo) => {
  try {
    const response = await apiClient.patch('/partner/users/me', {
      partnerInfo: {
        billingInfo: billingInfo
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating billing information:', error);
    throw error;
  }
};

/**
 * Get complete partner info (includes all partner-specific data)
 */
export const getPartnerInfo = async () => {
  try {
    const response = await apiClient.get('/partner/users/me');
    
    const user = response.data.user;
    if (!user?.partnerInfo) {
      throw new Error('Partner information not found');
    }
    
    return {
      success: true,
      data: {
        partnerInfo: user.partnerInfo,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          roles: user.roles,
          status: user.status
        }
      }
    };
  } catch (error) {
    console.error('Error fetching partner info:', error);
    throw error;
  }
};

/**
 * Update complete partner info
 */
export const updatePartnerInfo = async (partnerInfo) => {
  try {
    const response = await apiClient.patch('/partner/users/me', {
      partnerInfo: partnerInfo
    });
    return response.data;
  } catch (error) {
    console.error('Error updating partner info:', error);
    throw error;
  }
};

/**
 * Get user preferences from preferences object
 */
export const getUserPreferences = async () => {
  try {
    const response = await apiClient.get('/partner/users/me');
    
    const user = response.data.user;
    return {
      success: true,
      data: {
        preferences: user.preferences || {
          dietary: [],
          notifications: {
            email: true,
            sms: false,
            push: true,
            orderUpdates: true,
            promotions: false,
            newsletter: false
          },
          language: 'en',
          currency: 'CAD',
          timezone: 'America/Toronto',
          theme: 'auto',
          deliveryPreferences: {
            defaultTip: 15,
            preferredDeliveryTime: 'asap',
            specialInstructions: ''
          }
        }
      }
    };
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    throw error;
  }
};

/**
 * Update user preferences
 */
export const updateUserPreferences = async (preferences) => {
  try {
    const response = await apiClient.patch('/partner/users/me', {
      preferences: preferences
    });
    return response.data;
  } catch (error) {
    console.error('Error updating user preferences:', error);
    throw error;
  }
};

/**
 * Get user addresses
 */
export const getUserAddresses = async () => {
  try {
    const response = await apiClient.get('/partner/users/me');
    
    const user = response.data.user;
    return {
      success: true,
      data: {
        addresses: user.addresses || []
      }
    };
  } catch (error) {
    console.error('Error fetching user addresses:', error);
    throw error;
  }
};

/**
 * Add new address
 */
export const addUserAddress = async (addressData) => {
  try {
    const response = await apiClient.post('/partner/users/me/addresses', addressData);
    return response.data;
  } catch (error) {
    console.error('Error adding user address:', error);
    throw error;
  }
};

/**
 * Update existing address
 */
export const updateUserAddress = async (addressId, addressData) => {
  try {
    const response = await apiClient.patch(`/partner/users/me/addresses/${addressId}`, addressData);
    return response.data;
  } catch (error) {
    console.error('Error updating user address:', error);
    throw error;
  }
};

/**
 * Remove address
 */
export const removeUserAddress = async (addressId) => {
  try {
    const response = await apiClient.delete(`/partner/users/me/addresses/${addressId}`);
    return response.data;
  } catch (error) {
    console.error('Error removing user address:', error);
    throw error;
  }
};

// Helper functions remain the same
export const formatAddress = (address) => {
  if (typeof address === 'string') {
    return address;
  }
  
  if (typeof address === 'object' && address) {
    const parts = [
      address.street,
      address.city,
      address.state || address.province,
      address.postalCode
    ].filter(Boolean);
    
    return parts.join(', ');
  }
  
  return '';
};

export const parseAddress = (addressString) => {
  if (!addressString || typeof addressString !== 'string') {
    return {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Canada'
    };
  }
  
  const parts = addressString.split(',').map(part => part.trim());
  
  return {
    street: parts[0] || '',
    city: parts[1] || '',
    state: parts[2] || '',
    postalCode: parts[3] || '',
    country: 'Canada'
  };
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone) => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
};

export const validateURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
