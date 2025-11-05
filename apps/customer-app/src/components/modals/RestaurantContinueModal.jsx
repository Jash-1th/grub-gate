import React from 'react';
import { useTranslation } from 'react-i18next';

const RestaurantContinueModal = ({ 
  isOpen, 
  onClose, 
  onContinueExisting, 
  onAddNew, 
  existingRestaurant,
  day, 
  mealType, 
  week 
}) => {
  const { t } = useTranslation();
  
  if (!isOpen) return null;

  const weekText = week === 0 ? t('continueModal.thisWeek') : t('continueModal.nextWeek');
  const dayText = day ? day.charAt(0).toUpperCase() + day.slice(1) : '';
  const mealText = mealType === 'lunch' ? t('weeklyMenu.lunch') : mealType === 'dinner' ? t('weeklyMenu.dinner') : '';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 text-center">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-2">{t('continueModal.continueWithCurrent')}</h3>
          <p className="text-green-100 text-sm">
            {t('continueModal.alreadyHaveRestaurant')}
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-center space-x-2 text-gray-700">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
                </svg>
                <span className="font-medium">
                  {weekText} • {dayText} {mealText}
                </span>
              </div>
            </div>
            
            {/* Current Restaurant Display */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-center space-x-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-green-800">{existingRestaurant?.name}</h4>
                  <p className="text-sm text-green-600">
                    {existingRestaurant?.cuisine} • {existingRestaurant?.distance}
                  </p>
                </div>
              </div>
            </div>
            
            <p className="text-gray-600 text-sm leading-relaxed">
              {t('continueModal.canContinueAdding', { name: existingRestaurant?.name })}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Continue with existing restaurant */}
            <button
              onClick={onContinueExisting}
              className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {t('continueModal.continueWith', { name: existingRestaurant?.name })}
            </button>
            
            {/* Add second restaurant */}
            <button
              onClick={onAddNew}
              className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {t('continueModal.addSecondRestaurant')}
            </button>
            
            {/* Cancel */}
            <button
              onClick={onClose}
              className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
            >
              {t('continueModal.cancel')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantContinueModal;
