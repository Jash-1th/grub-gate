// FILE: src/api/statisticsApi.js
import apiClient from './client';

/**
 * Statistics API client for partner portal
 * Handles all statistics-related API calls
 */
export const statisticsApi = {
  /**
   * Get platform statistics for welcome page
   * @returns {Promise} API response with platform statistics
   */
  getPlatformStatistics: async () => {
    try {
      console.log('🌐 statisticsApi: Fetching platform statistics...');
      
      const response = await apiClient.get('/partner/statistics/platform');
      
      console.log('🌐 statisticsApi: Platform statistics received:', response.data);
      
      return response;
    } catch (error) {
      console.error('❌ statisticsApi: Error fetching platform statistics:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      // Return fallback data in case of error
      return {
        data: {
          success: true,
          data: {
            activePartners: 1200,
            monthlyOrders: 25000,
            partnerRating: 4.9,
            revenueBoost: 40
          },
          meta: {
            fallback: true,
            error: 'Unable to fetch real-time statistics'
          }
        }
      };
    }
  },

  /**
   * Get success stories from top-performing restaurants
   * @returns {Promise} API response with success stories
   */
  getSuccessStories: async () => {
    try {
      console.log('🌐 statisticsApi: Fetching success stories...');
      
      const response = await apiClient.get('/partner/statistics/success-stories');
      
      console.log('🌐 statisticsApi: Success stories received:', response.data?.data?.length, 'stories');
      
      return response;
    } catch (error) {
      console.error('❌ statisticsApi: Error fetching success stories:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      // Return fallback success stories
      return {
        data: {
          success: true,
          data: [
            {
              id: 'fallback-1',
              name: 'Maple Leaf Bistro',
              cuisine: 'Canadian',
              rating: 5.0,
              city: 'Toronto',
              country: 'CA',
              testimonial: 'GrubGate helped us increase our delivery orders by 60% in just 3 months!',
              metric: { type: 'orders', value: 60, unit: '%' },
              avatar: 'M'
            },
            {
              id: 'fallback-2',
              name: 'Spice Garden',
              cuisine: 'Indian',
              rating: 4.8,
              city: 'Mumbai',
              country: 'IN',
              testimonial: 'The analytics dashboard helped us optimize our menu and boost profits by 45%.',
              metric: { type: 'revenue', value: 45, unit: '%' },
              avatar: 'S'
            },
            {
              id: 'fallback-3',
              name: 'Bella\'s Kitchen',
              cuisine: 'Italian',
              rating: 4.9,
              city: 'New York',
              country: 'US',
              testimonial: 'Customer reach expanded beyond our neighborhood. Now serving 5x more customers!',
              metric: { type: 'customers', value: 5, unit: 'x' },
              avatar: 'B'
            }
          ],
          meta: {
            fallback: true,
            error: 'Unable to fetch real-time success stories'
          }
        }
      };
    }
  }
};

export default statisticsApi;
