import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import RestaurantCard from './RestaurantCard';
import { getFilteredRestaurants } from '../../data/restaurantData';

const RestaurantGrid = ({ postalCode, selectedPreferences }) => {
  const { t } = useTranslation();
  const [isClient, setIsClient] = useState(false);
  const [displayedRestaurants, setDisplayedRestaurants] = useState([]);

  // SSR Safety - only run on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Memoized restaurant filtering
  const filteredRestaurants = useMemo(() => {
    if (!isClient) return [];
    
    return getFilteredRestaurants(postalCode, selectedPreferences);
  }, [postalCode, selectedPreferences, isClient]);

  // Update displayed restaurants when filters change
  useEffect(() => {
    if (isClient) {
      setDisplayedRestaurants(filteredRestaurants);
    }
  }, [filteredRestaurants, isClient]);

  // Get section title based on current filters
  const getSectionTitle = () => {
    if (postalCode && postalCode.length >= 3) {
      if (selectedPreferences && selectedPreferences.length > 0) {
        return `Restaurants near ${postalCode.toUpperCase()} matching your preferences`;
      }
      return `Restaurants near ${postalCode.toUpperCase()}`;
    }
    
    if (selectedPreferences && selectedPreferences.length > 0) {
      return 'Popular restaurants matching your preferences';
    }
    
    return 'Popular restaurants in Montreal';
  };

  const getSectionSubtitle = () => {
    if (postalCode && postalCode.length >= 3) {
      return 'Discover amazing restaurants in your area';
    }
    return 'Top-rated restaurants loved by our customers';
  };

  // Show loading state during SSR
  if (!isClient) {
    return (
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="h-8 bg-gray-200 rounded-lg w-64 mx-auto mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-48 mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-red-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-orange-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
            {getSectionTitle()}
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {getSectionSubtitle()}
          </p>
          
          {/* Filter indicators */}
          {(postalCode || (selectedPreferences && selectedPreferences.length > 0)) && (
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {postalCode && postalCode.length >= 3 && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {postalCode.toUpperCase()}
                </span>
              )}
              {selectedPreferences && selectedPreferences.map((preference, index) => (
                <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 capitalize">
                  {preference.replace('-', ' ')}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Restaurant Grid */}
        {displayedRestaurants.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {displayedRestaurants.map((restaurant) => (
              <RestaurantCard 
                key={restaurant.id} 
                restaurant={restaurant} 
                selectedPreferences={selectedPreferences}
              />
            ))}
          </div>
        ) : (
          /* No restaurants found */
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No restaurants found</h3>
              <p className="text-gray-600 mb-6">
                We couldn't find any restaurants matching your criteria. Try adjusting your location or preferences.
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-300"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>
        )}

        {/* Show more button if there are many results */}
        {displayedRestaurants.length >= 8 && (
          <div className="text-center mt-12">
            <button className="inline-flex items-center px-8 py-4 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl">
              <span>View More Restaurants</span>
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default RestaurantGrid;
