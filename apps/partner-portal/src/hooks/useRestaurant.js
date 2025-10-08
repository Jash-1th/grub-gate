// FILE: src/hooks/useRestaurant.js
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getMyRestaurant } from '../api/restaurantApi';

/**
 * Hook to get current partner's restaurant information
 * Fetches restaurant data from API based on authenticated user
 */
export const useRestaurant = () => {
  const { user, isAuthenticated } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!isAuthenticated || !user) {
          console.log('🔍 User not authenticated, using fallback data');
          // Use ABC Restaurant as fallback for testing
          const fallbackRestaurant = {
            id: 'abc_001', // This maps to ABC Restaurant in the backend
            name: 'ABC Restaurant',
            description: 'ABC Restaurant - A modern dining experience with diverse cuisine options',
            cuisine: ['American', 'International', 'Fusion'],
            address: '123 ABC Street, Montreal, QC H3A 1B2',
            phone: '+15145551234',
            email: 'info@abcrestaurant.com',
            website: 'https://abcrestaurant.com',
            logo: '/images/restaurant-logo.jpg',
            hours: {
              monday: '11:00 AM - 10:00 PM',
              tuesday: '11:00 AM - 10:00 PM',
              wednesday: '11:00 AM - 10:00 PM',
              thursday: '11:00 AM - 10:00 PM',
              friday: '11:00 AM - 11:00 PM',
              saturday: '10:00 AM - 11:00 PM',
              sunday: '10:00 AM - 9:00 PM'
            },
            deliveryRadius: 12,
            deliveryFee: 4.99,
            minOrderAmount: 25.00,
            avgDeliveryTime: 35,
            commissionRate: 15
          };
          
          setRestaurant(fallbackRestaurant);
          setError(null);
          return;
        }

        // Fetch restaurant from API based on authenticated user
        console.log('📡 Fetching restaurant for authenticated user:', user.email);
        const response = await getMyRestaurant();
        console.log('🏪 Restaurant API response:', response);
        
        if (response.data && response.data.restaurant) {
          const apiRestaurant = response.data.restaurant;
          
          // Transform API data to match expected format
          const restaurant = {
            id: apiRestaurant._id,
            name: apiRestaurant.name,
            description: apiRestaurant.description,
            cuisine: apiRestaurant.cuisine,
            address: apiRestaurant.address ? 
              `${apiRestaurant.address.street}, ${apiRestaurant.address.city}, ${apiRestaurant.address.province} ${apiRestaurant.address.postalCode}` :
              '',
            phone: apiRestaurant.phone,
            email: apiRestaurant.email,
            website: apiRestaurant.website,
            logo: apiRestaurant.logo || '/images/restaurant-logo.jpg',
            hours: apiRestaurant.operatingHours || {},
            deliveryRadius: apiRestaurant.deliverySettings?.radius || 0,
            deliveryFee: apiRestaurant.deliverySettings?.fee || 0,
            minOrderAmount: apiRestaurant.deliverySettings?.minOrderAmount || 0,
            avgDeliveryTime: apiRestaurant.deliverySettings?.avgDeliveryTime || 0,
            commissionRate: 15, // Default commission rate
            billingInfo: apiRestaurant.billingInfo || {} // Include billing information
          };
          
          console.log('✅ Restaurant data loaded successfully:', restaurant.name);
          setRestaurant(restaurant);
          setError(null);
        } else {
          throw new Error('No restaurant data received from API');
        }
        
      } catch (err) {
        console.error('❌ Error fetching restaurant:', err);
        setError(err.message || 'Failed to fetch restaurant data');
        
        // Use fallback data if API fails
        console.log('🔄 Using fallback restaurant data due to API error');
        const fallbackRestaurant = {
          id: 'abc_001',
          name: 'ABC Restaurant (Demo)',
          description: 'ABC Restaurant - A modern dining experience with diverse cuisine options',
          cuisine: ['American', 'International', 'Fusion'],
          address: '123 ABC Street, Montreal, QC H3A 1B2',
          phone: '+15145551234',
          email: 'info@abcrestaurant.com',
          website: 'https://abcrestaurant.com',
          logo: '/images/restaurant-logo.jpg',
          hours: {
            monday: '11:00 AM - 10:00 PM',
            tuesday: '11:00 AM - 10:00 PM',
            wednesday: '11:00 AM - 10:00 PM',
            thursday: '11:00 AM - 10:00 PM',
            friday: '11:00 AM - 11:00 PM',
            saturday: '10:00 AM - 11:00 PM',
            sunday: '10:00 AM - 9:00 PM'
          },
          deliveryRadius: 12,
          deliveryFee: 4.99,
          minOrderAmount: 25.00,
          avgDeliveryTime: 35,
          commissionRate: 15
        };
        
        setRestaurant(fallbackRestaurant);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchRestaurant();
    } else {
      setLoading(false);
    }
  }, [user, isAuthenticated]);

  return {
    restaurant,
    loading,
    error,
    refetch: () => {
      if (user) {
        fetchRestaurant();
      }
    }
  };
};
