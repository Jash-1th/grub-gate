import apiClient from './apiClient';

/**
 * Meal Calendar API Service
 * Handles all meal calendar related API calls
 */
const mealCalendarApi = {
  /**
   * Get user's active meal calendar
   * @param {Object} params - Query parameters
   * @param {string} params.startDate - Start date (YYYY-MM-DD)
   * @param {string} params.endDate - End date (YYYY-MM-DD)
   * @param {string} params.status - Filter by meal status
   * @returns {Promise} API response with calendar data
   */
  getMealCalendar: async (params = {}) => {
    try {
      console.log('🍽️ mealCalendarApi: Fetching meal calendar with params:', params);
      
      const response = await apiClient.get('/meal-calendar', { params });
      
      console.log('✅ mealCalendarApi: Calendar data received:', response.data);
      return response.data;
    } catch (error) {
      // Only log error if it's not a 404 (which is expected for non-subscribers)
      if (error.response?.status === 404) {
        console.log('📅 mealCalendarApi: No active subscription found (404) - this is expected for non-subscribers');
      } else {
        console.error('❌ mealCalendarApi: Error fetching calendar:', error.response?.data || error.message);
      }
      throw error;
    }
  },

  /**
   * Check subscription status and overlap
   * @param {Object} params - Query parameters
   * @param {string} params.startDate - Start date to check overlap
   * @param {string} params.endDate - End date to check overlap
   * @returns {Promise} API response with subscription status
   */
  getSubscriptionStatus: async (params = {}) => {
    try {
      console.log('🔍 mealCalendarApi: Checking subscription status with params:', params);
      
      const response = await apiClient.get('/meal-calendar/subscription-status', { params });
      
      console.log('✅ mealCalendarApi: Subscription status received:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ mealCalendarApi: Error checking subscription status:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Get meal calendar for specific date range
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @returns {Promise} API response with meals in range
   */
  getMealCalendarRange: async (startDate, endDate) => {
    try {
      console.log('📅 mealCalendarApi: Fetching calendar range:', { startDate, endDate });
      
      const response = await apiClient.get('/meal-calendar/range', {
        params: { startDate, endDate }
      });
      
      console.log('✅ mealCalendarApi: Range data received:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ mealCalendarApi: Error fetching calendar range:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Update meal status
   * @param {string} mealId - Meal ID to update
   * @param {string} status - New status (scheduled, preparing, ready, delivered, cancelled)
   * @returns {Promise} API response with updated meal
   */
  updateMealStatus: async (mealId, status) => {
    try {
      console.log('🔄 mealCalendarApi: Updating meal status:', { mealId, status });
      
      const response = await apiClient.patch(`/meal-calendar/meals/${mealId}/status`, {
        status
      });
      
      console.log('✅ mealCalendarApi: Meal status updated:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ mealCalendarApi: Error updating meal status:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Get meal calendar statistics
   * @param {number} period - Period in days (default: 30)
   * @returns {Promise} API response with statistics
   */
  getMealCalendarStats: async (period = 30) => {
    try {
      console.log('📊 mealCalendarApi: Fetching calendar stats for period:', period);
      
      const response = await apiClient.get('/meal-calendar/stats', {
        params: { period }
      });
      
      console.log('✅ mealCalendarApi: Stats received:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ mealCalendarApi: Error fetching stats:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default mealCalendarApi;