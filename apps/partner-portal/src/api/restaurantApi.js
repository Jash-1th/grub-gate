// FILE: src/api/restaurantApi.js
import { apiClient } from './client';

/**
 * Update restaurant Stripe Connect Account ID
 * @param {string} restaurantId - MongoDB restaurant id
 * @param {string} stripeAccountId - Stripe Connected Account ID (must start with acct_)
 * @returns {Promise<object>} Updated restaurant data
 */

export const updateRestaurantStripeAccount = async (restaurantId, stripeAccountId) => {
  try {
    if (!restaurantId || !stripeAccountId) {
      throw new Error('Restaurant ID and Stripe Account ID are required');
    }

    // Basic frontend guard (backend also validates)
    if (!stripeAccountId.trim().startsWith('acct_')) {
      throw new Error('Invalid Stripe Account ID. It must start with "acct_".');
    }

    const response = await apiClient.patch(
      `/partner/restaurants/${restaurantId}/stripe-account`,
      { stripeAccountId: stripeAccountId.trim() }
    );

    if (response.data?.status === 'success') {
      return response.data.data?.restaurant;
    } else {
      throw new Error(response.data?.message || 'Failed to update Stripe account');
    }
  } catch (error) {
    // Extract server error message if available
    const serverMessage =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred while updating the Stripe account';

    console.error('Update Stripe Account Error:', error);
    throw new Error(serverMessage);
  }
};

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
