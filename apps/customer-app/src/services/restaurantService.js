import apiClient from '../api/apiClient';

/**
 * Restaurant Service
 * Handles all restaurant-related API calls
 */

/**
 * Get restaurants by postal code sorted by rating
 * @param {string} postalCode - The postal code to search in
 * @param {Object} options - Additional options (page, limit)
 * @returns {Promise} API response with restaurants data
 */
export const getRestaurantsByPostalCode = async (postalCode, options = {}) => {
  try {
    const { page = 1, limit = 20 } = options;
    
    const response = await apiClient.get('/restaurants/by-postal-code', {
      params: {
        postalCode: postalCode.toUpperCase(),
        page,
        limit
      }
    });
    
    return {
      success: true,
      data: response.data.data,
      pagination: response.data.pagination,
      message: response.data.message
    };
  } catch (error) {
    console.error('Error fetching restaurants by postal code:', error);
    
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch restaurants',
      data: [],
      pagination: null
    };
  }
};

/**
 * Get all restaurants with filtering options
 * @param {Object} filters - Filter options (cuisine, rating, etc.)
 * @returns {Promise} API response with restaurants data
 */
export const getRestaurants = async (filters = {}) => {
  try {
    const response = await apiClient.get('/restaurants', {
      params: filters
    });
    
    return {
      success: true,
      data: response.data.data,
      pagination: response.data.pagination,
      message: response.data.message
    };
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch restaurants',
      data: [],
      pagination: null
    };
  }
};

/**
 * Get a single restaurant by ID
 * @param {string} restaurantId - The restaurant ID
 * @returns {Promise} API response with restaurant data
 */
export const getRestaurant = async (restaurantId) => {
  try {
    const response = await apiClient.get(`/restaurants/${restaurantId}`);
    
    return {
      success: true,
      data: response.data.data.restaurant,
      message: response.data.message
    };
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch restaurant',
      data: null
    };
  }
};

/**
 * Get restaurant menu by restaurant ID
 * @param {string} restaurantId - The restaurant ID
 * @param {Object} filters - Filter options (category, dietary, userType, etc.)
 * @returns {Promise} API response with menu data
 */
export const getRestaurantMenu = async (restaurantId, filters = {}) => {
  try {
    const response = await apiClient.get(`/restaurants/${restaurantId}/menu`, {
      params: filters
    });
    
    return {
      success: true,
      data: response.data.data,
      message: response.data.message
    };
  } catch (error) {
    console.error('Error fetching restaurant menu:', error);
    
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch restaurant menu',
      data: null
    };
  }
};

/**
 * Get popular restaurants
 * @param {number} limit - Number of restaurants to fetch
 * @returns {Promise} API response with popular restaurants
 */
export const getPopularRestaurants = async (limit = 10) => {
  try {
    const response = await apiClient.get('/restaurants/popular', {
      params: { limit }
    });
    
    return {
      success: true,
      data: response.data.data.restaurants,
      message: response.data.message
    };
  } catch (error) {
    console.error('Error fetching popular restaurants:', error);
    
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch popular restaurants',
      data: []
    };
  }
};

/**
 * Get top-rated restaurants
 * @param {number} limit - Number of restaurants to fetch
 * @returns {Promise} API response with top-rated restaurants
 */
export const getTopRatedRestaurants = async (limit = 10) => {
  try {
    const response = await apiClient.get('/restaurants/top-rated', {
      params: { limit }
    });
    
    return {
      success: true,
      data: response.data.data.restaurants,
      message: response.data.message
    };
  } catch (error) {
    console.error('Error fetching top-rated restaurants:', error);
    
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch top-rated restaurants',
      data: []
    };
  }
};

/**
 * Get restaurant statistics (total count, etc.)
 * @returns {Promise} API response with restaurant statistics
 */
export const getRestaurantStats = async () => {
  try {
    const response = await apiClient.get('/restaurants/stats');
    
    return {
      success: true,
      data: response.data.data,
      message: response.data.message
    };
  } catch (error) {
    console.error('Error fetching restaurant stats:', error);
    
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch restaurant stats',
      data: { totalRestaurants: 500 } // Fallback data
    };
  }
};
