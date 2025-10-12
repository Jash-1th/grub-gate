// Partner Statistics Service
import { apiClient } from '../api/client';

/**
 * Fetch partner statistics for welcome page
 * SSR-safe with fallback data
 */
export const getPartnerStats = async () => {
  try {
    console.log('📊 Fetching partner statistics...');
    
    const response = await apiClient.get('/analytics/partner-stats');
    const stats = response.data.data;
    
    console.log('✅ Partner stats fetched:', stats);
    
    return {
      activeRestaurants: stats.activeRestaurants || 0,
      monthlyOrders: stats.monthlyOrders || 0,
      averageRating: stats.averageRating || 0,
      totalRevenue: stats.totalRevenue || 0,
      success: true
    };
  } catch (error) {
    console.error('❌ Failed to fetch partner stats:', error);
    
    // Return fallback data for better UX
    return {
      activeRestaurants: 500,
      monthlyOrders: 10000,
      averageRating: 4.8,
      totalRevenue: 250000,
      success: false,
      fallback: true
    };
  }
};

/**
 * Format numbers for display
 */
export const formatStatNumber = (number) => {
  if (number >= 1000000) {
    return `${(number / 1000000).toFixed(1)}M`;
  } else if (number >= 1000) {
    return `${(number / 1000).toFixed(0)}K`;
  }
  return number.toString();
};

/**
 * Format rating for display
 */
export const formatRating = (rating) => {
  return `${rating.toFixed(1)}★`;
};
