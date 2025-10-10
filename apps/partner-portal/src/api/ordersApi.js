// FILE: src/api/ordersApi.js
import apiClient from './client';

/**
 * Orders API client for partner portal
 * Handles all order-related API calls with proper error handling
 */
export const ordersApi = {
  /**
   * Get orders for partner's restaurants
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.limit - Items per page (default: 20)
   * @param {string} params.status - Filter by status
   * @param {string} params.type - Filter by order type (single|weekly-plan)
   * @param {string} params.startDate - Start date filter (YYYY-MM-DD)
   * @param {string} params.endDate - End date filter (YYYY-MM-DD)
   * @param {string} params.sortBy - Sort field (default: createdAt)
   * @param {string} params.sortOrder - Sort direction (asc|desc, default: desc)
   * @returns {Promise} API response with orders data
   */
  getOrders: async (params = {}) => {
    try {
      // Transform single 'date' parameter to startDate/endDate range for backend compatibility
      const transformedParams = { ...params };
      
      if (params.date && !params.startDate && !params.endDate) {
        // Convert single date to date range (same day)
        transformedParams.startDate = params.date;
        transformedParams.endDate = params.date;
        delete transformedParams.date;
      }
      
      console.log('🌐 ordersApi: Making request to /orders with params:', transformedParams);
      
      const response = await apiClient.get('/orders', { params: transformedParams });
      
      console.log('🌐 ordersApi: Response received:', response.data?.data?.length, 'orders');
      console.log('🌐 ordersApi: Full response data:', response.data);
      
      return response;
    } catch (error) {
      console.error('❌ ordersApi: Error fetching orders:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url
      });
      throw new Error(error.response?.data?.message || 'Failed to fetch orders');
    }
  },

  /**
   * Get single order details
   * @param {string} orderId - Order ID
   * @returns {Promise} API response with order data
   */
  getOrder: async (orderId) => {
    try {
      if (!orderId) {
        throw new Error('Order ID is required');
      }
      const response = await apiClient.get(`/orders/${orderId}`);
      return response;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch order details');
    }
  },

  /**
   * Update order status
   * @param {string} orderId - Order ID
   * @param {string} status - New status (pending|confirmed|preparing|ready|out-for-delivery|delivered|cancelled)
   * @param {string} notes - Optional notes for status update
   * @returns {Promise} API response
   */
  updateOrderStatus: async (orderId, status, notes = '') => {
    try {
      if (!orderId || !status) {
        throw new Error('Order ID and status are required');
      }

      const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'out-for-delivery', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      }

      const response = await apiClient.patch(`/orders/${orderId}/status`, { 
        status, 
        notes: notes.trim() 
      });
      return response;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw new Error(error.response?.data?.message || 'Failed to update order status');
    }
  },

  /**
   * Cancel an order
   * @param {string} orderId - Order ID
   * @param {string} reason - Cancellation reason
   * @returns {Promise} API response
   */
  cancelOrder: async (orderId, reason = 'Cancelled by restaurant') => {
    try {
      if (!orderId) {
        throw new Error('Order ID is required');
      }

      const response = await apiClient.post(`/orders/${orderId}/cancel`, { 
        reason: reason.trim() || 'Cancelled by restaurant'
      });
      return response;
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw new Error(error.response?.data?.message || 'Failed to cancel order');
    }
  },

  /**
   * Get order statistics and analytics
   * @param {Object} params - Query parameters
   * @param {string} params.startDate - Start date for stats (YYYY-MM-DD)
   * @param {string} params.endDate - End date for stats (YYYY-MM-DD)
   * @param {string} params.restaurantId - Specific restaurant ID (optional)
   * @returns {Promise} API response with statistics
   */
  getOrderStats: async (params = {}) => {
    try {
      const response = await apiClient.get('/orders/stats', { params });
      return response;
    } catch (error) {
      console.error('Error fetching order stats:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch order statistics');
    }
  },

  /**
   * Get today's orders (client-side filtering for immediate use)
   * @param {Array} orders - Array of orders to filter
   * @returns {Array} Today's orders
   */
  getTodaysOrders: (orders) => {
    if (!Array.isArray(orders)) return [];
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    return orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= today && orderDate < tomorrow;
    });
  },

  /**
   * Get current day's meals from weekly plans (for subscription orders)
   * @param {Array} orders - Array of orders
   * @returns {Array} Current day's meal orders
   */
  getCurrentDayMeals: (orders) => {
    if (!Array.isArray(orders)) return [];

    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = new Date();
    const currentDay = days[today.getDay()];

    return orders.filter(order => {
      // Filter weekly plan orders for current day
      if (order.type === 'weekly-plan') {
        const orderDate = new Date(order.createdAt);
        const orderDay = days[orderDate.getDay()];
        return orderDay === currentDay;
      }
      // Include all single orders from today
      return ordersApi.getTodaysOrders([order]).length > 0;
    });
  }
};

export default ordersApi;
