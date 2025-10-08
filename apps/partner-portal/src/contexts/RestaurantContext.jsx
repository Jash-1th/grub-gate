import React, { createContext, useContext, useState, useEffect } from 'react';
import analyticsService from '../services/analyticsService';

const RestaurantContext = createContext();

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
};

export const RestaurantProvider = ({ children }) => {
  const [restaurantInfo, setRestaurantInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  // SSR safety
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch restaurant info when component mounts
  useEffect(() => {
    const fetchRestaurantInfo = async () => {
      if (!isClient) return;
      
      try {
        setLoading(true);
        const restaurant = await analyticsService.getRestaurantInfo();
        setRestaurantInfo(restaurant);
      } catch (error) {
        console.error('Restaurant info fetch error:', error);
        // Fallback to default restaurant info
        setRestaurantInfo({
          name: 'Bistro Montreal',
          description: 'Authentic French cuisine in the heart of Montreal',
          cuisine: 'French',
          address: '123 Rue Saint-Catherine, Montreal, QC H2X 1Y4'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantInfo();
  }, [isClient]);

  const value = {
    restaurantInfo,
    loading,
    isClient,
    // Helper methods
    getRestaurantName: () => restaurantInfo?.name || 'Your Restaurant',
    getRestaurantInitial: () => restaurantInfo?.name?.charAt(0) || 'R',
    refreshRestaurantInfo: async () => {
      if (!isClient) return;
      try {
        const restaurant = await analyticsService.getRestaurantInfo();
        setRestaurantInfo(restaurant);
      } catch (error) {
        console.error('Restaurant refresh error:', error);
      }
    }
  };

  return (
    <RestaurantContext.Provider value={value}>
      {children}
    </RestaurantContext.Provider>
  );
};

export default RestaurantContext;
