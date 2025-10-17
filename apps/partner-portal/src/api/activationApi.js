// FILE: src/api/activationApi.js
import apiClient from './client';

/**
 * Complete restaurant setup and activate user/restaurant
 */
export const completeSetupActivation = async () => {
  try {
    console.log('🚀 Starting restaurant activation...');
    
    // Use the dedicated activation endpoint
    console.log('🔄 Activating restaurant and user...');
    const activationResponse = await apiClient.post('/activation/complete-setup');
    
    if (!activationResponse.data?.success) {
      throw new Error('Failed to activate restaurant and user');
    }
    
    console.log('✅ Restaurant and user activated successfully!');
    
    // Return success response in the expected format
    return {
      success: true,
      message: activationResponse.data.message || 'Restaurant setup completed successfully! Your restaurant is now active and ready to receive orders.',
      data: activationResponse.data.data
    };
    
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
 * TEMPORARY WORKAROUND: Using existing endpoints until backend is redeployed
 */
export const getActivationStatus = async () => {
  try {
    console.log('📊 Getting activation status (using workaround)...');
    
    // Get restaurant info to check activation status
    const restaurantResponse = await apiClient.get('/partner/restaurants/me');
    
    if (!restaurantResponse.data?.success || !restaurantResponse.data?.data) {
      throw new Error('Failed to get restaurant information');
    }
    
    const restaurant = restaurantResponse.data.data;
    
    // Return status in expected format
    return {
      success: true,
      data: {
        user: {
          id: restaurant.ownerId,
          status: restaurant.status === 'active' ? 'active' : 'pending',
          roles: ['partner'],
          restaurantId: restaurant._id
        },
        restaurant: {
          id: restaurant._id,
          name: restaurant.name,
          status: restaurant.status,
          registrationComplete: restaurant.registrationComplete || false,
          registrationStage: restaurant.registrationStage || 2
        },
        isActive: restaurant.status === 'active' && restaurant.registrationComplete
      }
    };
    
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
