// FILE: src/api/activationApi.js
import apiClient from './client';

/**
 * Complete restaurant setup and activate user/restaurant
 * TEMPORARY WORKAROUND: Using existing endpoints until backend is redeployed
 */
export const completeSetupActivation = async () => {
  try {
    console.log('🚀 Starting restaurant activation (using workaround)...');
    
    // First, get the current restaurant info
    console.log('📋 Step 1: Getting restaurant info...');
    const restaurantResponse = await apiClient.get('/partner/restaurants/me');
    
    if (!restaurantResponse.data?.success || !restaurantResponse.data?.data) {
      throw new Error('Failed to get restaurant information');
    }
    
    const restaurant = restaurantResponse.data.data;
    console.log('✅ Restaurant info retrieved:', restaurant.name);
    
    // Update restaurant status to active and mark registration as complete
    console.log('🔄 Step 2: Activating restaurant...');
    const updateData = {
      status: 'active',
      registrationComplete: true,
      registrationStage: 3
    };
    
    const updateResponse = await apiClient.patch(`/partner/restaurants/${restaurant._id}`, updateData);
    
    if (!updateResponse.data?.success) {
      throw new Error('Failed to activate restaurant');
    }
    
    console.log('✅ Restaurant activated successfully!');
    
    // Return success response in the expected format
    return {
      success: true,
      message: 'Restaurant setup completed successfully! Your restaurant is now active and ready to receive orders.',
      data: {
        user: {
          id: restaurant.ownerId,
          status: 'active'
        },
        restaurant: {
          id: restaurant._id,
          name: restaurant.name,
          status: 'active',
          registrationComplete: true,
          registrationStage: 3
        }
      }
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
