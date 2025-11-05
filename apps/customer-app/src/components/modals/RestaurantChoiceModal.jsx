import React from 'react';
import { useTranslation } from 'react-i18next';

const RestaurantChoiceModal = ({ 
  isOpen, 
  onClose, 
  onSelectRestaurant, 
  restaurants = [],
  day, 
  mealType, 
  week 
}) => {
  const { t } = useTranslation();
  
  if (!isOpen || restaurants.length === 0) return null;

  const weekText = week === 0 ? t('continueModal.thisWeek') : t('continueModal.nextWeek');
  const dayText = day ? day.charAt(0).toUpperCase() + day.slice(1) : '';
  const mealText = mealType === 'lunch' ? t('weeklyMenu.lunch') : mealType === 'dinner' ? t('weeklyMenu.dinner') : '';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 text-center">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-2">{t('choiceModal.chooseRestaurant')}</h3>
          <p className="text-purple-100 text-sm">
            {t('choiceModal.selectWhichRestaurant')}
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-center space-x-2 text-gray-700">
                <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
                </svg>
                <span className="font-medium">
                  {weekText} • {dayText} {mealText}
                </span>
              </div>
            </div>
            
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              {t('choiceModal.multipleRestaurantsSelected')}
            </p>
          </div>

          {/* Restaurant Options */}
          <div className="space-y-3 mb-6">
            {restaurants.map((restaurant, index) => (
              <button
                key={restaurant.restaurantId || restaurant.id}
                onClick={() => onSelectRestaurant(restaurant)}
                className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 text-left group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200">
                    <span className="text-purple-600 font-bold text-lg">
                      {String.fromCharCode(65 + index)} {/* A, B, C, etc. */}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 group-hover:text-purple-700">
                      {restaurant.restaurantName || restaurant.name}
                    </h4>
                    {restaurant.cuisine && (
                      <p className="text-sm text-gray-500">
                        {Array.isArray(restaurant.cuisine) ? restaurant.cuisine.join(', ') : restaurant.cuisine}
                      </p>
                    )}
                  </div>
                  <div className="text-purple-500 group-hover:text-purple-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Cancel Button */}
          <button
            onClick={onClose}
            className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
          >
            {t('choiceModal.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RestaurantChoiceModal;
