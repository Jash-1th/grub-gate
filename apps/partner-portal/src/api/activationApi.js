// FILE: src/api/activationApi.js
import apiClient from './client';

/**
 * Complete restaurant setup and activate user/restaurant
 */
export const completeSetupActivation = async () => {
  try {
    console.log('🚀 Calling activation API...');
    const response = await apiClient.post('/activation/complete-setup');
    console.log('✅ Activation API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Activation API error:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
};

/**
 * Get current activation status
 */
export const getActivationStatus = async () => {
  try {
    console.log('📊 Getting activation status...');
    const response = await apiClient.get('/activation/status');
    console.log('✅ Activation status response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Get activation status error:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
};
