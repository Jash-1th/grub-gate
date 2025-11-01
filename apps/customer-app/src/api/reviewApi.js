import apiClient from './apiClient';

const reviewApi = {
  /**
   * Create a new review
   * @param {Object} reviewData - Review data including orderId, restaurantId, etc.
   * @returns {Promise} API response
   */
  createReview: async (reviewData) => {
    try {
      console.log('📤 reviewApi: Creating review with data:', reviewData);
      
      // Validate required fields
      if (!reviewData.orderId || !reviewData.restaurantId || !reviewData.menuItemId) {
        throw new Error('Missing required fields: orderId, restaurantId, or menuItemId');
      }
      
      // Validate ObjectId format for required fields (except menuItemId which might be flexible)
      const objectIdRegex = /^[0-9a-fA-F]{24}$/;
      if (!objectIdRegex.test(reviewData.orderId)) {
        throw new Error(`Invalid order ID format: ${reviewData.orderId}`);
      }
      if (!objectIdRegex.test(reviewData.restaurantId)) {
        throw new Error(`Invalid restaurant ID format: ${reviewData.restaurantId}`);
      }
      
      // Validate rating
      const rating = parseInt(Number(reviewData.rating));
      if (isNaN(rating) || rating < 1 || rating > 5) {
        throw new Error(`Rating must be an integer between 1 and 5, got: ${rating}`);
      }
      
      // Ensure rating is an integer in the reviewData
      reviewData.rating = rating;
      
      // Log validation results
      console.log('✅ reviewApi: Validation passed');
      console.log('   Order ID valid:', objectIdRegex.test(reviewData.orderId));
      console.log('   Restaurant ID valid:', objectIdRegex.test(reviewData.restaurantId));
      console.log('   Rating valid:', !isNaN(rating) && rating >= 1 && rating <= 5);
      console.log('   Rating value:', rating, 'Type:', typeof rating);
      
      // Send data as JSON instead of FormData
      const response = await apiClient.post('/reviews', reviewData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('✅ reviewApi: Review created successfully', response.data);
      return response.data;
    } catch (error) {
      console.error('💥 reviewApi: Error creating review:', error.response?.data || error.message);
      // Re-throw the error so it can be handled by the calling function
      throw error;
    }
  },

  /**
   * Get reviews for a restaurant
   * @param {string} restaurantId - Restaurant ID
   * @param {Object} options - Query options
   * @returns {Promise} API response
   */
  getRestaurantReviews: async (restaurantId, options = {}) => {
    try {
      const queryParams = new URLSearchParams(options).toString();
      const url = `/restaurants/${restaurantId}/reviews${queryParams ? `?${queryParams}` : ''}`;
      
      console.log('📥 reviewApi: Fetching restaurant reviews', { restaurantId, options });
      
      const response = await apiClient.get(url);
      
      console.log('✅ reviewApi: Restaurant reviews fetched successfully', response.data);
      return response.data;
    } catch (error) {
      console.error('💥 reviewApi: Error fetching restaurant reviews:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Get reviews for a menu item
   * @param {string} menuItemId - Menu item ID
   * @param {Object} options - Query options
   * @returns {Promise} API response
   */
  getMenuItemReviews: async (menuItemId, options = {}) => {
    try {
      const queryParams = new URLSearchParams(options).toString();
      const url = `/reviews/menu-items/${menuItemId}/reviews${queryParams ? `?${queryParams}` : ''}`;
      
      console.log('📥 reviewApi: Fetching menu item reviews', { menuItemId, options });
      
      const response = await apiClient.get(url);
      
      console.log('✅ reviewApi: Menu item reviews fetched successfully', response.data);
      return response.data;
    } catch (error) {
      console.error('💥 reviewApi: Error fetching menu item reviews:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Check if an order has been reviewed
   * @param {string} orderId - The order ID to check
   * @returns {Promise<Object>} The response data
   */
  checkOrderReview: async (orderId) => {
    try {
      console.log('🔍 reviewApi: Checking review status for order:', orderId);
      
      const response = await apiClient.get(`/reviews/check/${orderId}`);
      console.log('✅ reviewApi: Review check response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('💥 reviewApi: Error checking order review:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default reviewApi;
