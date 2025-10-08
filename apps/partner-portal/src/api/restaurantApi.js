// FILE: src/api/restaurantApi.js
import { apiClient } from './client';

/**
 * Get current user's restaurant (partner's restaurant)
 */
export const getMyRestaurant = async () => {
  try {
    // This endpoint should return the restaurant owned by the authenticated user
    const response = await apiClient.get('/partner/restaurants/me');
    return response.data;
  } catch (error) {
    console.error('Error fetching user restaurant:', error);
    throw error;
  }
};

/**
 * Get restaurant by ID (with ownership check)
 */
export const getRestaurant = async (restaurantId) => {
  try {
    const response = await apiClient.get(`/partner/restaurants/${restaurantId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    throw error;
  }
};

/**
 * Update restaurant basic info
 */
export const updateRestaurant = async (restaurantId, restaurantData) => {
  try {
    const response = await apiClient.patch(`/partner/restaurants/${restaurantId}`, restaurantData);
    return response.data;
  } catch (error) {
    console.error('Error updating restaurant:', error);
    throw error;
  }
};
