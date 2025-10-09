// FILE: src/services/analyticsService.js
import { apiClient } from '../api/client.js';

class AnalyticsService {
  constructor() {
    this.baseURL = '/analytics'; // Relative to apiClient baseURL
  }

  /**
   * Handle API response - now using axios response format
   */
  handleResponse(response) {
    return response.data;
  }

  /**
   * Handle API errors - improved error handling
   */
  handleError(error, context = '') {
    console.error(`Analytics Service - ${context} Error:`, error);
    
    // If it's a 401 error, the apiClient interceptor will handle logout
    if (error.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    }
    
    // For other errors, throw with a user-friendly message
    throw new Error(error.message || 'Failed to fetch analytics data');
  }

  /**
   * Get overview analytics for dashboard
   * @param {number} period - Number of days (default: 30)
   * @returns {Promise<Object>} Analytics data
   */
  async getOverviewAnalytics(period = 30) {
    try {
      const response = await apiClient.get(`${this.baseURL}/overview?period=${period}`);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error, 'Overview');
    }
  }

  /**
   * Get revenue trend data for charts
   * @param {number} period - Number of days (default: 30)
   * @returns {Promise<Array>} Revenue trend data
   */
  async getRevenueTrend(period = 30) {
    try {
      const response = await apiClient.get(`${this.baseURL}/revenue-trend?period=${period}`);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error, 'Revenue Trend');
    }
  }

  /**
   * Get top performing items
   * @param {number} limit - Number of items to return (default: 5)
   * @returns {Promise<Array>} Top items data
   */
  async getTopItems(limit = 5) {
    try {
      const response = await apiClient.get(`${this.baseURL}/top-items?limit=${limit}`);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error, 'Top Items');
    }
  }

  /**
   * Get order status distribution
   * @param {number} period - Number of days (default: 30)
   * @returns {Promise<Array>} Order status data
   */
  async getOrderStatusDistribution(period = 30) {
    try {
      const response = await apiClient.get(`${this.baseURL}/order-status?period=${period}`);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error, 'Order Status');
    }
  }

  /**
   * Get analytics data for specific time range
   * @param {string} startDate - Start date (ISO string)
   * @param {string} endDate - End date (ISO string)
   * @returns {Promise<Object>} Analytics data for date range
   */
  async getAnalyticsByDateRange(startDate, endDate) {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Use the calculated period for consistent data
      return await this.getOverviewAnalytics(diffDays);
    } catch (error) {
      console.error('Analytics Service - Date Range Error:', error);
      throw error;
    }
  }

  /**
   * Get customer overview analytics
   * @param {number} period - Number of days (default: 30)
   * @returns {Promise<Object>} Customer analytics data
   */
  async getCustomerOverview(period = 30) {
    try {
      const response = await apiClient.get(`${this.baseURL}/customer-overview?period=${period}`);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error, 'Customer Overview');
    }
  }

  /**
   * Get top customers by spending
   * @param {number} limit - Number of customers to return (default: 5)
   * @param {number} period - Number of days (default: 30)
   * @returns {Promise<Array>} Top customers data
   */
  async getTopCustomers(limit = 5, period = 30) {
    try {
      const response = await apiClient.get(`${this.baseURL}/top-customers?limit=${limit}&period=${period}`);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error, 'Top Customers');
    }
  }

  /**
   * Get customer segments data
   * @param {number} period - Number of days (default: 30)
   * @returns {Promise<Object>} Customer segments data
   */
  async getCustomerSegments(period = 30) {
    try {
      const response = await apiClient.get(`${this.baseURL}/customer-segments?period=${period}`);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error, 'Customer Segments');
    }
  }

  /**
   * Get performance overview analytics
   * @param {number} period - Number of days (default: 30)
   * @returns {Promise<Object>} Performance analytics data
   */
  async getPerformanceOverview(period = 30) {
    try {
      const response = await apiClient.get(`${this.baseURL}/performance-overview?period=${period}`);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error, 'Performance Overview');
    }
  }

  /**
   * Get delivery performance trend data for charts
   * @param {number} period - Number of days (default: 30)
   * @returns {Promise<Array>} Delivery performance trend data
   */
  async getDeliveryPerformanceTrend(period = 30) {
    try {
      const response = await apiClient.get(`${this.baseURL}/delivery-performance-trend?period=${period}`);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error, 'Delivery Performance Trend');
    }
  }

  /**
   * Get dashboard overview data (simplified for dashboard home)
   * @param {number} period - Number of days (default: 7 for dashboard)
   * @returns {Promise<Object>} Dashboard analytics data
   */
  async getDashboardOverview(period = 7) {
    try {
      // Fetch key dashboard data in parallel
      const [overview, topItems, orderStatus] = await Promise.all([
        this.getOverviewAnalytics(period),
        this.getTopItems(3), // Only top 3 for dashboard
        this.getOrderStatusDistribution(period)
      ]);

      return {
        overview: overview.data || overview,
        topItems: topItems.data || topItems,
        orderStatus: orderStatus.data || orderStatus,
        period: `${period}d`
      };
    } catch (error) {
      console.error('Analytics Service - Dashboard Overview Error:', error);
      throw error;
    }
  }

  /**
   * Get recent orders for dashboard
   * @param {number} limit - Number of recent orders (default: 5)
   * @returns {Promise<Array>} Recent orders data
   */
  async getRecentOrders(limit = 5) {
    try {
      const response = await apiClient.get(`${this.baseURL}/recent-orders?limit=${limit}`);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error, 'Recent Orders');
    }
  }

  /**
   * Get restaurant information for dashboard
   * @returns {Promise<Object>} Restaurant information
   */
  async getRestaurantInfo() {
    try {
      console.log('🔍 Analytics Service - Fetching restaurant info...');
      console.log('🔍 Analytics Service - API URL:', `${this.baseURL}/restaurant-info`);
      
      const response = await apiClient.get(`${this.baseURL}/restaurant-info`);
      console.log('✅ Analytics Service - Restaurant info response:', response);
      console.log('✅ Analytics Service - Restaurant info data:', response.data);
      
      // Extract the actual restaurant data from the wrapped response
      const result = this.handleResponse(response);
      console.log('✅ Analytics Service - Processed restaurant data:', result.data);
      
      return result.data; // Return the actual restaurant object, not the wrapped response
    } catch (error) {
      console.error('❌ Analytics Service - Restaurant Info Error Details:', error);
      this.handleError(error, 'Restaurant Info');
    }
  }

  /**
   * Get subscription analytics overview
   * @param {number} period - Number of days (default: 30)
   * @returns {Promise<Object>} Subscription analytics data
   */
  async getSubscriptionOverview(period = 30) {
    try {
      const response = await apiClient.get(`${this.baseURL}/subscription-overview?period=${period}`);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error, 'Subscription Overview');
    }
  }

  /**
   * Get revenue breakdown (subscription vs one-time)
   * @param {number} period - Number of days (default: 30)
   * @returns {Promise<Object>} Revenue breakdown data
   */
  async getRevenueBreakdown(period = 30) {
    try {
      const response = await apiClient.get(`${this.baseURL}/revenue-breakdown?period=${period}`);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error, 'Revenue Breakdown');
    }
  }

  /**
   * Get all analytics data needed for the overview tab
   * @param {string} timeRange - Time range ('7d', '30d', '90d')
   * @returns {Promise<Object>} Complete analytics data
   */
  async getAllOverviewData(timeRange = '30d') {
    try {
      // Convert time range to days
      const periodMap = {
        '7d': 7,
        '30d': 30,
        '90d': 90
      };
      const period = periodMap[timeRange] || 30;

      // Fetch all data in parallel including new subscription analytics
      const [overview, revenueTrend, topItems, orderStatus, customerOverview, topCustomers, customerSegments, performanceOverview, deliveryPerformanceTrend, subscriptionOverview, revenueBreakdown] = await Promise.all([
        this.getOverviewAnalytics(period),
        this.getRevenueTrend(period),
        this.getTopItems(5),
        this.getOrderStatusDistribution(period),
        this.getCustomerOverview(period),
        this.getTopCustomers(5, period),
        this.getCustomerSegments(period),
        this.getPerformanceOverview(period),
        this.getDeliveryPerformanceTrend(period),
        this.getSubscriptionOverview(period),
        this.getRevenueBreakdown(period)
      ]);

      return {
        overview,
        revenueTrend,
        topItems,
        orderStatus,
        customerOverview,
        topCustomers,
        customerSegments,
        performanceOverview,
        deliveryPerformanceTrend,
        subscriptionOverview,
        revenueBreakdown,
        period: timeRange
      };
    } catch (error) {
      console.error('Analytics Service - All Overview Data Error:', error);
      throw error;
    }
  }
}

// Create and export singleton instance
const analyticsService = new AnalyticsService();
export default analyticsService;
