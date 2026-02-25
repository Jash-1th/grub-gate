import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import RestaurantGrid from './RestaurantGrid';
import { getRestaurantsByPostalCode } from '../../services/restaurantService';

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
            setError(t('restaurantGrid.noRestaurantsInArea', { postalCode: postalCode.toUpperCase() }));
          }
        } else {
          setError(result.error);
          setRestaurants([]);
        }
      } catch (err) {
        console.error('Error in fetchRestaurants:', err);
        setError(t('restaurantGrid.failedToLoad'));
        setRestaurants([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, [postalCode, t]);

  if (loading) {
    return (
      <div className="py-16 bg-gray-50 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-red-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-orange-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-yellow-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            {/* Enhanced loading header with animation */}
            <div className="relative inline-block">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                {t('restaurantGrid.findingRestaurants')}
              </h2>
              {/* Animated dots */}
              <div className="flex justify-center space-x-1 mb-4">
                <div className="w-2 h-2 bg-grub-red rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-grub-red rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-grub-red rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
            
            {postalCode && (
              <div className="relative">
                <p className="text-xl text-gray-600 mb-4">
                  {t('restaurantGrid.searchingNear')} <span className="font-semibold text-grub-red">{postalCode.toUpperCase()}</span>
                </p>
                {/* Progress bar animation */}
                <div className="w-64 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-grub-red via-grub-red to-grub-red rounded-full animate-pulse"></div>
                </div>
              </div>
            )}

            {/* Loading status messages */}
            <div className="mt-6">
              <div className="flex items-center justify-center space-x-2 text-gray-500">
                <svg className="animate-spin h-5 w-5 text-grub-red" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-sm font-medium">{t('restaurantGrid.discoveringOptions')}</span>
              </div>
            </div>
          </div>

          {/* Enhanced loading skeleton with staggered animation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {[...Array(8)].map((_, index) => (
              <div 
                key={index} 
                className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse transform hover:scale-105 transition-transform duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Image skeleton with shimmer effect */}
                <div className="h-48 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer"></div>
                </div>
                
                <div className="p-6">
                  {/* Restaurant name skeleton */}
                  <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded mb-3 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer"></div>
                  </div>
                  
                  {/* Cuisine type skeleton */}
                  <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-3/4 mb-3 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer"></div>
                  </div>
                  
                  {/* Rating skeleton */}
                  <div className="flex items-center mb-4">
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, starIndex) => (
                        <div key={starIndex} className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                      ))}
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-12 ml-2 animate-pulse"></div>
                  </div>
                  
                  {/* Button skeleton */}
                  <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Loading tips */}
          <div className="mt-12 text-center">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/50">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">💡 {t('restaurantGrid.didYouKnow')}</h3>
              <p className="text-gray-600 text-sm">
                {t('restaurantGrid.didYouKnowText')}
              </p>
            </div>
          </div>
        </div>

        {/* Custom CSS for shimmer animation */}
        <style jsx>{`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          .animate-shimmer {
            animation: shimmer 2s infinite;
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-xl shadow-lg p-12">
            <div className="w-24 h-24 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t('restaurantGrid.unableToLoad')}
            </h3>
            <p className="text-gray-600 mb-6">
              {error}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-grub-red text-white px-6 py-2 rounded-lg font-medium hover:bg-grub-red transition-colors duration-200"
            >
              {t('restaurantGrid.tryAgain')}
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
              {t('restaurantGrid.showingRestaurants', { count: restaurants.length, total: pagination.totalItems, postalCode: postalCode.toUpperCase() })}
            </p>
            {pagination.totalPages > 1 && (
              <p className="text-sm text-gray-500 mt-2">
                {t('restaurantGrid.pageInfo', { current: pagination.page, total: pagination.totalPages })}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default RestaurantGridContainer;
