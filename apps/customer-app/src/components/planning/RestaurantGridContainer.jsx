import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import RestaurantGrid from './RestaurantGrid';
import { getRestaurantsByPostalCode, getStaticRestaurantsByPostalCode } from '../../services/restaurantService';

const RestaurantGridContainer = ({ postalCode }) => {
  const { t } = useTranslation();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      if (!postalCode) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Only fetch from API - no static fallback
        let result = await getRestaurantsByPostalCode(postalCode, { limit: 20 });

        if (result.success) {
          setRestaurants(result.data);
          setPagination(result.pagination);
          
          if (result.data.length === 0) {
            setError(`No restaurants found in ${postalCode.toUpperCase()}. Try a different postal code.`);
          }
        } else {
          setError(result.error);
          setRestaurants([]);
        }
      } catch (err) {
        console.error('Error in fetchRestaurants:', err);
        setError('Failed to load restaurants. Please try again.');
        setRestaurants([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, [postalCode]);

  if (loading) {
    return (
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Finding Restaurants Near You
            </h2>
            {postalCode && (
              <p className="text-xl text-gray-600">
                Searching near <span className="font-semibold text-grub-red">{postalCode}</span>
              </p>
            )}
          </div>

          {/* Loading skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-6">
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-xl shadow-lg p-12">
            <div className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Unable to Load Restaurants
            </h3>
            <p className="text-gray-600 mb-6">
              {error}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-grub-red text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <RestaurantGrid 
        restaurants={restaurants} 
        postalCode={postalCode}
      />
      
      {/* Pagination info */}
      {pagination && pagination.totalItems > 0 && (
        <div className="py-8 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-gray-600">
              Showing {restaurants.length} of {pagination.totalItems} restaurants near {postalCode.toUpperCase()}
            </p>
            {pagination.totalPages > 1 && (
              <p className="text-sm text-gray-500 mt-2">
                Page {pagination.page} of {pagination.totalPages}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default RestaurantGridContainer;
