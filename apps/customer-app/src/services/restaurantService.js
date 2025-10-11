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
      data: { 
        totalRestaurants: 500,
        totalMenuItems: 0,
        averageRating: 4.5,
        cuisineDistribution: [],
        businessTypeDistribution: [],
        lastUpdated: new Date().toISOString()
      } // Enhanced fallback data
    };
  }
};

/**
 * Get platform statistics (customers, restaurants, orders)
 * @returns {Promise} API response with platform statistics
 */
export const getPlatformStats = async () => {
  try {
    const response = await apiClient.get('/stats/platform');
    
    return {
      success: true,
      data: response.data.data,
      message: response.data.message
    };
  } catch (error) {
    console.error('Error fetching platform stats:', error);
    
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch platform stats',
      data: { 
        totalRestaurants: 500,
        totalCustomers: 10000,
        totalOrders: 50000,
        totalMenuItems: 2500,
        averageRating: 4.5,
        cuisineDistribution: [],
        growth: {
          newCustomers: 150,
          newOrders: 1200,
          newRestaurants: 5
        },
        lastUpdated: new Date().toISOString(),
        dataSource: 'fallback'
      } // Enhanced fallback data
    };
  }
};

/**
 * Get popular dishes (most ordered menu items)
 * @param {number} limit - Number of dishes to fetch
 * @returns {Promise} API response with popular dishes
 */
export const getPopularDishes = async (limit = 6) => {
  try {
    const response = await apiClient.get('/stats/popular-dishes', {
      params: { limit }
    });
    
    return {
      success: true,
      data: response.data.data,
      message: response.data.message
    };
  } catch (error) {
    console.error('Error fetching popular dishes:', error);
    
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch popular dishes',
      data: { 
        dishes: [
          {
            _id: 'fallback1',
            name: 'Gourmet Burger',
            description: 'Juicy beef patty with fresh vegetables and special sauce',
            price: 12.99,
            image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80',
            category: 'Main Course',
            totalOrders: 50,
            restaurant: { name: 'Sample Restaurant', cuisine: ['American'] }
          },
          {
            _id: 'fallback2',
            name: 'Margherita Pizza',
            description: 'Classic Italian pizza with fresh basil and mozzarella',
            price: 14.99,
            image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=500&q=80',
            category: 'Main Course',
            totalOrders: 45,
            restaurant: { name: 'Sample Pizzeria', cuisine: ['Italian'] }
          },
          {
            _id: 'fallback3',
            name: 'Sushi Platter',
            description: 'Assorted fresh sushi with wasabi and soy sauce',
            price: 18.99,
            image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=500&q=80',
            category: 'Main Course',
            totalOrders: 40,
            restaurant: { name: 'Sample Sushi Bar', cuisine: ['Japanese'] }
          }
        ],
        total: 3,
        dataSource: 'fallback'
      }
    };
  }
};
