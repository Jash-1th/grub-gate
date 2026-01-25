import apiClient from './apiClient';

// Subscription API endpoints
const subscriptionApi = {
  // Get available subscription plans
  getPlans: async () => {
    try {
      const response = await apiClient.get('/subscriptions/plans');
      return response.data;
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      throw error;
    }
  },

  // Create a new subscription
  createSubscription: async (subscriptionData) => {
    try {
      const response = await apiClient.post('/subscriptions', subscriptionData);
      return response.data;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  },

  // Get user's subscriptions
  getUserSubscriptions: async (params = {}) => {
    try {
      const response = await apiClient.get('/subscriptions', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching user subscriptions:', error);
      throw error;
    }
  },

  // Get single subscription
  getSubscription: async (subscriptionId) => {
    try {
      const response = await apiClient.get(`/subscriptions/${subscriptionId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching subscription:', error);
      throw error;
    }
  },

  // Update subscription
  updateSubscription: async (subscriptionId, updateData) => {
    try {
      const response = await apiClient.patch(`/subscriptions/${subscriptionId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  },

  // Cancel subscription
  cancelSubscription: async (subscriptionId, reason = '') => {
    try {
      const response = await apiClient.post(`/subscriptions/${subscriptionId}/cancel`, { reason });
      return response.data;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }
  },

  // Pause subscription
  pauseSubscription: async (subscriptionId) => {
    try {
      const response = await apiClient.post(`/subscriptions/${subscriptionId}/pause`);
      return response.data;
    } catch (error) {
      console.error('Error pausing subscription:', error);
      throw error;
    }
  },

  // Resume subscription
  resumeSubscription: async (subscriptionId) => {
    try {
      const response = await apiClient.post(`/subscriptions/${subscriptionId}/resume`);
      return response.data;
    } catch (error) {
      console.error('Error resuming subscription:', error);
      throw error;
    }
  },

  // Upgrade subscription plan
  upgradeSubscription: async (subscriptionId, upgradeData) => {
    try {
      const response = await apiClient.post(`/subscriptions/${subscriptionId}/upgrade`, upgradeData);
      return response.data;
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      throw error;
    }
  },

  // Create Stripe payment intent for subscription
  createPaymentIntent: async (subscriptionData) => {
    try {
      const response = await apiClient.post('/subscriptions/payment-intent', subscriptionData);
      return response.data;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  },

  // Confirm payment and create subscription
  confirmPaymentAndSubscribe: async (paymentIntentId, subscriptionData) => {
    try {
      const response = await apiClient.post('/subscriptions/confirm-payment', {
        paymentIntentId,
        ...subscriptionData
      });
      return response.data;
    } catch (error) {
      console.error('Error confirming payment and creating subscription:', error);
      throw error;
    }
  },

  // Create subscription from meal plan (after payment)
  createSubscriptionFromMealPlan: async (subscriptionData) => {
    try {
      const response = await apiClient.post('/subscription-meal-plans/create-from-meal-plan', subscriptionData);
      return response.data;
    } catch (error) {
      console.error('Error creating subscription from meal plan:', error);
      throw error;
    }
  },

  // Get user's active meal plans (for subscription detection)
  getUserMealPlans: async () => {
    try {
      const response = await apiClient.get('/subscription-meal-plans/me/all', {
        params: {
          _ts: Date.now()
        },
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user meal plans:', error);
      throw error;
    }
  }
};

export default subscriptionApi;
