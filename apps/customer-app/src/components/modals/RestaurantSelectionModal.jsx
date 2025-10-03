import React from 'react';

const RestaurantSelectionModal = ({ isOpen, onClose, onConfirm, day, mealType, week }) => {
  if (!isOpen) return null;

  const weekText = week === 0 ? 'This Week' : 'Next Week';
  const dayText = day ? day.charAt(0).toUpperCase() + day.slice(1) : '';
  const mealText = mealType ? mealType.charAt(0).toUpperCase() + mealType.slice(1) : '';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 text-center">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-2">Select a Restaurant First</h3>
          <p className="text-blue-100 text-sm">
            Choose from nearby restaurants to start planning your meals
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-center space-x-2 text-gray-700">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
                </svg>
                <span className="font-medium">
                  {weekText} • {dayText} {mealText}
                </span>
              </div>
            </div>
            
            <p className="text-gray-600 text-sm leading-relaxed">
              To add meals to your <strong>{weekText}</strong> plan, you need to first select a restaurant. 
              We'll show you highly-rated restaurants in your area.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Browse Restaurants
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantSelectionModal;
