import apiClient from './apiClient';

/**
 * Restaurant Selection API Service
 * Handles restaurant selection for meal planning
 * NOTE: Now uses MealPlan endpoints instead of User endpoints
 */
const restaurantSelectionApi = {
  /**
   * Get user's selected restaurants from meal plan
   */
  getSelectedRestaurants: async () => {
    try {
      console.log('🔍 restaurantSelectionApi: Fetching selected restaurants...');
      console.log('🔍 restaurantSelectionApi: API URL:', apiClient.defaults.baseURL + '/meal-plans/selected-restaurants');
      const response = await apiClient.get('/meal-plans/selected-restaurants');
      console.log('✅ restaurantSelectionApi: Success response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching selected restaurants:', error);
      console.error('❌ Error response data:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error headers:', error.response?.headers);
      throw error;
    }
  },

  /**
   * Add a restaurant to user's selected restaurants in meal plan
   * @param {Object} restaurant - Restaurant data
   */
  addSelectedRestaurant: async (restaurant) => {
    try {
      console.log('💾 restaurantSelectionApi: Adding restaurant to meal plan:', restaurant);
      console.log('💾 restaurantSelectionApi: Request payload:', { restaurant });
      console.log('💾 restaurantSelectionApi: API URL:', apiClient.defaults.baseURL + '/meal-plans/selected-restaurants');
      console.log('💾 restaurantSelectionApi: Full baseURL:', apiClient.defaults.baseURL);
      
      const response = await apiClient.post('/meal-plans/selected-restaurants', {
        restaurant
      });
      
      console.log('✅ restaurantSelectionApi: Success response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ restaurantSelectionApi: Error adding restaurant:', error);
      console.error('❌ restaurantSelectionApi: Error response:', error.response?.data);
      console.error('❌ restaurantSelectionApi: Error status:', error.response?.status);
      throw error;
    }
  },

  /**
   * Update user's selected restaurants list in meal plan
   * NOTE: This function is deprecated - use addSelectedRestaurant/removeSelectedRestaurant instead
   * @param {Array} selectedRestaurants - Array of selected restaurants
   */
  updateSelectedRestaurants: async (selectedRestaurants) => {
    try {
      // For now, we'll clear all and re-add (not ideal, but maintains compatibility)
      console.warn('updateSelectedRestaurants is deprecated - consider using individual add/remove methods');
      
      // This would require implementing a batch update endpoint in the future
      // For now, throw an error to encourage using the new methods
      throw new Error('updateSelectedRestaurants is no longer supported. Use addSelectedRestaurant/removeSelectedRestaurant instead.');
    } catch (error) {
      console.error('❌ Error updating selected restaurants:', error);
      throw error;
    }
  },

  /**
   * Remove a restaurant from user's selected restaurants in meal plan
   * @param {string} restaurantId - Restaurant ID to remove
   */
  removeSelectedRestaurant: async (restaurantId) => {
    try {
      const response = await apiClient.delete(`/meal-plans/selected-restaurants/${restaurantId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error removing selected restaurant:', error);
      throw error;
    }
  },
};

export default restaurantSelectionApi;
