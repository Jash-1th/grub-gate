// FILE: src/services/analyticsService.js

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

class AnalyticsService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/analytics`;
  }

  /**
   * Get authentication headers
   */
  getAuthHeaders() {
    // Get token directly from localStorage (AuthContext stores it as a plain string)
    // We need to use direct localStorage access because AuthContext doesn't JSON stringify the token
    let token = null;
    
    if (typeof window !== 'undefined') {
      try {
        token = localStorage.getItem('accessToken');
      } catch (error) {
        console.error('🔍 Analytics Service - Error accessing localStorage:', error);
      }
    }
    
    if (!token) {
      console.error('🔍 Analytics Service - No access token found in localStorage');
      return {
        'Content-Type': 'application/json',
      };
    }
    
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  /**
   * Handle API response
   */
  async handleResponse(response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  /**
   * Get overview analytics for dashboard
   * @param {number} period - Number of days (default: 30)
   * @returns {Promise<Object>} Analytics data
   */
  async getOverviewAnalytics(period = 30) {
    try {
      const response = await fetch(`${this.baseURL}/overview?period=${period}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const result = await this.handleResponse(response);
      return result.data;
    } catch (error) {
      console.error('Analytics Service - Overview Error:', error);
      throw error;
    }
  }

  /**
   * Get revenue trend data for charts
   * @param {number} period - Number of days (default: 30)
   * @returns {Promise<Array>} Revenue trend data
   */
  async getRevenueTrend(period = 30) {
    try {
      const response = await fetch(`${this.baseURL}/revenue-trend?period=${period}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const result = await this.handleResponse(response);
      return result.data;
    } catch (error) {
      console.error('Analytics Service - Revenue Trend Error:', error);
      throw error;
    }
  }

  /**
   * Get top performing items
   * @param {number} limit - Number of items to return (default: 5)
   * @returns {Promise<Array>} Top items data
   */
  async getTopItems(limit = 5) {
    try {
      const response = await fetch(`${this.baseURL}/top-items?limit=${limit}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const result = await this.handleResponse(response);
      return result.data;
    } catch (error) {
      console.error('Analytics Service - Top Items Error:', error);
      throw error;
    }
  }

  /**
   * Get order status distribution
   * @param {number} period - Number of days (default: 30)
   * @returns {Promise<Array>} Order status data
   */
  async getOrderStatusDistribution(period = 30) {
    try {
      const response = await fetch(`${this.baseURL}/order-status?period=${period}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const result = await this.handleResponse(response);
      return result.data;
    } catch (error) {
      console.error('Analytics Service - Order Status Error:', error);
      throw error;
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
      const response = await fetch(`${this.baseURL}/customer-overview?period=${period}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const result = await this.handleResponse(response);
      return result.data;
    } catch (error) {
      console.error('Analytics Service - Customer Overview Error:', error);
      throw error;
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
      const response = await fetch(`${this.baseURL}/top-customers?limit=${limit}&period=${period}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const result = await this.handleResponse(response);
      return result.data;
    } catch (error) {
      console.error('Analytics Service - Top Customers Error:', error);
      throw error;
    }
  }

  /**
   * Get customer segments data
   * @param {number} period - Number of days (default: 30)
   * @returns {Promise<Object>} Customer segments data
   */
  async getCustomerSegments(period = 30) {
    try {
      const response = await fetch(`${this.baseURL}/customer-segments?period=${period}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const result = await this.handleResponse(response);
      return result.data;
    } catch (error) {
      console.error('Analytics Service - Customer Segments Error:', error);
      throw error;
    }
  }

  /**
   * Get performance overview analytics
   * @param {number} period - Number of days (default: 30)
   * @returns {Promise<Object>} Performance analytics data
   */
  async getPerformanceOverview(period = 30) {
    try {
      const response = await fetch(`${this.baseURL}/performance-overview?period=${period}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const result = await this.handleResponse(response);
      return result.data;
    } catch (error) {
      console.error('Analytics Service - Performance Overview Error:', error);
      throw error;
    }
  }

  /**
   * Get delivery performance trend data for charts
   * @param {number} period - Number of days (default: 30)
   * @returns {Promise<Array>} Delivery performance trend data
   */
  async getDeliveryPerformanceTrend(period = 30) {
    try {
      const response = await fetch(`${this.baseURL}/delivery-performance-trend?period=${period}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const result = await this.handleResponse(response);
      return result.data;
    } catch (error) {
      console.error('Analytics Service - Delivery Performance Trend Error:', error);
      throw error;
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
        overview,
        topItems,
        orderStatus,
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
      const response = await fetch(`${this.baseURL}/recent-orders?limit=${limit}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const result = await this.handleResponse(response);
      return result.data;
    } catch (error) {
      console.error('Analytics Service - Recent Orders Error:', error);
      throw error;
    }
  }

  /**
   * Get restaurant information for dashboard
   * @returns {Promise<Object>} Restaurant information
   */
  async getRestaurantInfo() {
    try {
      const response = await fetch(`${this.baseURL}/restaurant-info`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const result = await this.handleResponse(response);
      return result.data;
    } catch (error) {
      console.error('Analytics Service - Restaurant Info Error:', error);
      throw error;
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

      // Fetch all data in parallel
      const [overview, revenueTrend, topItems, orderStatus, customerOverview, topCustomers, customerSegments, performanceOverview, deliveryPerformanceTrend] = await Promise.all([
        this.getOverviewAnalytics(period),
        this.getRevenueTrend(period),
        this.getTopItems(5),
        this.getOrderStatusDistribution(period),
        this.getCustomerOverview(period),
        this.getTopCustomers(5, period),
        this.getCustomerSegments(period),
        this.getPerformanceOverview(period),
        this.getDeliveryPerformanceTrend(period)
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
