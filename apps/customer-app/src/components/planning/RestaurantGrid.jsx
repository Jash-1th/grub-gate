import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMealPlan } from '../../contexts/MealPlanContext_SSR_FIXED';

const RestaurantGrid = ({ restaurants = [], postalCode = '' }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { getWeekTotalCost, getWeekTotalItems, setSelectedRestaurant } = useMealPlan();

  const handleRestaurantClick = (restaurant) => {
    // Store restaurant selection in context and database
    setSelectedRestaurant({
      id: restaurant.id,
      name: restaurant.name,
      image: restaurant.image,
      rating: restaurant.rating,
      cuisine: restaurant.cuisine,
      distance: restaurant.distance,
      deliveryTime: restaurant.deliveryTime,
      isApiRestaurant: true
    });
    
    // Navigate to weekly menu page with selected restaurant
    navigate('/weekly-menu');
  };

  // Calculate costs based on current meal plan
  const biweeklyCost = getWeekTotalCost(0) + getWeekTotalCost(1); // Both weeks
  const totalItems = getWeekTotalItems(0) + getWeekTotalItems(1);
  const monthlyCost = biweeklyCost * 2; // 2 biweeks = 1 month
  const threeMonthCost = monthlyCost * 3; // 3 months

  if (!restaurants || restaurants.length === 0) {
    return (
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-xl shadow-lg p-12">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No restaurants found
            </h3>
            <p className="text-gray-600">
              We couldn't find any restaurants in your area. Try expanding your search radius.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Restaurants Near You
          </h2>
          {postalCode && (
            <p className="text-xl text-gray-600">
              Showing restaurants near <span className="font-semibold text-grub-red">{postalCode}</span>
            </p>
          )}
        </div>

        {/* Cost Summary Section - Only show if user has items in meal plan */}
        {totalItems > 0 && (
          <div className="mb-12">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Your Meal Plan Cost Projection</h3>
                <p className="text-gray-600">Based on your current {totalItems} selected meal{totalItems !== 1 ? 's' : ''}</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* Biweekly Cost */}
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                  <div className="w-12 h-12 mx-auto mb-3 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-blue-900 mb-1">Biweekly</h4>
                  <p className="text-2xl font-bold text-blue-700">${biweeklyCost.toFixed(2)}</p>
                  <p className="text-sm text-blue-600 mt-1">Every 2 weeks</p>
                </div>

                {/* Monthly Cost */}
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                  <div className="w-12 h-12 mx-auto mb-3 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-green-900 mb-1">Monthly</h4>
                  <p className="text-2xl font-bold text-green-700">${monthlyCost.toFixed(2)}</p>
                  <p className="text-sm text-green-600 mt-1">Per month</p>
                </div>

                {/* 3-Month Cost */}
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                  <div className="w-12 h-12 mx-auto mb-3 bg-purple-500 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H9z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-purple-900 mb-1">3 Months</h4>
                  <p className="text-2xl font-bold text-purple-700">${threeMonthCost.toFixed(2)}</p>
                  <p className="text-sm text-purple-600 mt-1">Quarterly</p>
                </div>
              </div>

              {/* Additional Info */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Estimates based on current meal selection
                  </span>
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Avg per meal: ${totalItems > 0 ? (biweeklyCost / totalItems).toFixed(2) : '0.00'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
          {restaurants.map((restaurant) => (
            <div
              key={restaurant.id}
              onClick={() => handleRestaurantClick(restaurant)}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-200 cursor-pointer transform hover:scale-105"
            >
              {/* Restaurant Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={restaurant.image || '/images/grub-gate-default-img.jpg'}
                  alt={restaurant.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/images/grub-gate-default-img.jpg';
                  }}
                />
                <div className="absolute top-4 right-4 bg-white bg-opacity-90 rounded-full px-2 py-1 flex items-center space-x-1">
                  <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-900">{restaurant.rating}</span>
                </div>
              </div>

              {/* Restaurant Info */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                  {restaurant.name}
                </h3>
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {restaurant.description || restaurant.cuisine || 'Delicious food awaits you'}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span className="flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{restaurant.distance || 'Calculating...'}</span>
                  </span>
                </div>

                {/* Cuisine Tags */}
                {restaurant.cuisines && restaurant.cuisines.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {restaurant.cuisines.slice(0, 2).map((cuisine, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
                      >
                        {cuisine}
                      </span>
                    ))}
                    {restaurant.cuisines.length > 2 && (
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                        +{restaurant.cuisines.length - 2} more
                      </span>
                    )}
                  </div>
                )}

                {/* Action Button */}
                <button className="w-full bg-grub-red text-white py-2.5 px-4 rounded-lg font-medium hover:bg-red-600 transition-colors duration-200">
                  View Menu
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RestaurantGrid;
