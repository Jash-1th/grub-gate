import React from 'react';

const RestaurantSwitchModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  existingRestaurant, 
  newRestaurant,
  itemCount 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
            <div>
              <h3 className="text-xl font-bold">Switch Restaurant?</h3>
              <p className="text-orange-100 text-sm">This will clear your current meal plan</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-4">
            {/* Current Restaurant */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-sm">🏪</span>
                </div>
                <div>
                  <div className="font-medium text-red-900">Current Restaurant</div>
                  <div className="text-red-700 text-sm">{existingRestaurant}</div>
                  <div className="text-red-600 text-xs">{itemCount} item{itemCount !== 1 ? 's' : ''} will be removed</div>
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex justify-center">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            </div>

            {/* New Restaurant */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-sm">🏪</span>
                </div>
                <div>
                  <div className="font-medium text-green-900">New Restaurant</div>
                  <div className="text-green-700 text-sm">{newRestaurant}</div>
                  <div className="text-green-600 text-xs">Start fresh with new items</div>
                </div>
              </div>
            </div>

            {/* Warning Message */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-yellow-600 text-xs">⚠️</span>
                </div>
                <div className="text-sm">
                  <div className="font-medium text-yellow-900 mb-1">Normal User Restriction</div>
                  <div className="text-yellow-800">
                    Normal users can only select items from one restaurant at a time. 
                    Switching will clear your current meal plan.
                  </div>
                  <div className="text-yellow-700 text-xs mt-2">
                    💡 Upgrade to Pro to select from multiple restaurants without restrictions!
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-grub-red to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-colors font-medium shadow-lg"
          >
            Clear & Switch Restaurant
          </button>
        </div>
      </div>
    </div>
  );
};

export default RestaurantSwitchModal;
