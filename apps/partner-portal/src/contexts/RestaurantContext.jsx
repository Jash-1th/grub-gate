import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import analyticsService from '../services/analyticsService';
import { useAuth } from './AuthContext';

const RestaurantContext = createContext();

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
};

export const RestaurantProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [restaurantInfo, setRestaurantInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isClient, setIsClient] = useState(false);

  // SSR safety
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch restaurant info when authenticated
  const fetchRestaurantInfo = useCallback(async () => {
    if (!isClient || !isAuthenticated) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 RestaurantContext - Fetching restaurant info...');
      console.log('🔍 RestaurantContext - isAuthenticated:', isAuthenticated);
      console.log('🔍 RestaurantContext - isClient:', isClient);
      
      const restaurant = await analyticsService.getRestaurantInfo();
      console.log('✅ RestaurantContext - Restaurant info received:', restaurant);
      setRestaurantInfo(restaurant);
    } catch (error) {
      console.error('❌ Restaurant info fetch error:', error);
      console.error('❌ Error details:', error.message, error.status, error.originalError);
      setError(error.message || 'Failed to load restaurant information');
      setRestaurantInfo(null);
    } finally {
      setLoading(false);
    }
  }, [isClient, isAuthenticated]);

  // Fetch restaurant info when authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchRestaurantInfo();
    } else {
      // Clear restaurant info when logging out
      setRestaurantInfo(null);
      setError(null);
      setLoading(false);
    }
  }, [isAuthenticated, fetchRestaurantInfo]);

  // Helper methods
  const getRestaurantName = useCallback(() => {
    if (loading) return 'Loading...';
    return restaurantInfo?.name || 'Your Restaurant';
  }, [loading, restaurantInfo]);

  const getRestaurantInitial = useCallback(() => {
    if (loading) return 'L';
    return restaurantInfo?.name?.charAt(0) || 'R';
  }, [loading, restaurantInfo]);

  const refreshRestaurantInfo = useCallback(async () => {
    if (!isClient) return;
    try {
      console.log('🔄 RestaurantContext - Refreshing restaurant info...');
      setLoading(true);
      setError(null);
      const restaurant = await analyticsService.getRestaurantInfo();
      console.log('✅ RestaurantContext - Restaurant info refreshed:', restaurant);
      setRestaurantInfo(restaurant);
      return restaurant;
    } catch (error) {
      console.error('❌ Restaurant refresh error:', error);
      setError(error.message || 'Failed to refresh restaurant information');
      setRestaurantInfo(null);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [isClient]);

  const value = {
    restaurantInfo,
    loading,
    error,
    isClient,
    getRestaurantName,
    getRestaurantInitial,
    refreshRestaurantInfo,
  };

  return (
    <RestaurantContext.Provider value={value}>
      {children}
    </RestaurantContext.Provider>
  );
};

export default RestaurantContext;
