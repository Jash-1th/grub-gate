import React from 'react';

const RestaurantSwitchModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  existingRestaurant, 
  newRestaurant, 
  itemCount = 0 
}) => {
  console.log('🔍 RestaurantSwitchModal render - isOpen:', isOpen);
  console.log('🔍 RestaurantSwitchModal render - existingRestaurant:', existingRestaurant);
  console.log('🔍 RestaurantSwitchModal render - itemCount:', itemCount);
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-6 rounded-t-lg">
          <div className="flex items-center">
            <div className="text-white mr-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold">Switch Restaurant?</h3>
          </div>
          <p className="text-orange-100 text-sm mt-2">
            This will clear your current meal plan
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Current Restaurant */}
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-red-800">Current Restaurant</h4>
                <p className="text-red-600 font-semibold">{existingRestaurant}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-red-600">{itemCount} item{itemCount !== 1 ? 's' : ''}</p>
                <p className="text-xs text-red-500">Will be removed</p>
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className="text-center mb-4">
            <div className="text-gray-400">
              <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>

          {/* New Restaurant */}
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-green-800">New Restaurant</h4>
                <p className="text-green-600 font-semibold">{newRestaurant}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-green-600">Fresh start</p>
                <p className="text-xs text-green-500">New selection</p>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <div className="text-yellow-600 mr-3 mt-0.5">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-yellow-800 font-medium">Normal User Restriction</p>
                <p className="text-xs text-yellow-700 mt-1">
                  Normal users can only select items from one restaurant. 
                  <span className="font-medium"> Upgrade to Pro</span> to mix restaurants freely.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-medium hover:from-orange-600 hover:to-red-700 transition-all duration-200"
          >
            Clear & Switch Restaurant
          </button>
        </div>
      </div>
    </div>
  );
};

export default RestaurantSwitchModal;
