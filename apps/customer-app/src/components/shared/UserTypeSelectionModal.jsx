import React, { useState } from 'react';

const UserTypeSelectionModal = ({ isOpen, onClose, onConfirm, restaurantName }) => {
  const [selectedType, setSelectedType] = useState('');

  const handleConfirm = () => {
    if (selectedType) {
      onConfirm(selectedType);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-grub-red via-grub-red to-grub-red rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Experience</h2>
          <p className="text-gray-600">
            How would you like to plan your meals at <span className="font-semibold text-grub-red">{restaurantName}</span>?
          </p>
        </div>

        {/* User Type Options */}
        <div className="space-y-4 mb-6">
          {/* Normal User */}
          <div
            onClick={() => setSelectedType('normal')}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
              selectedType === 'normal'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center ${
                selectedType === 'normal' ? 'border-green-500 bg-green-500' : 'border-gray-300'
              }`}>
                {selectedType === 'normal' && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Normal User</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Browse all menu items, select preferences, and add items to your weekly plan
                </p>
                <div className="flex flex-wrap gap-1">
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Simple</span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Flexible</span>
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">Customizable</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pro User */}
          <div
            onClick={() => setSelectedType('pro')}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
              selectedType === 'pro'
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center ${
                selectedType === 'pro' ? 'border-purple-500 bg-purple-500' : 'border-gray-300'
              }`}>
                {selectedType === 'pro' && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Pro User</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Advanced weekly planning with day/meal filters and smart recommendations
                </p>
                <div className="flex flex-wrap gap-1">
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">Advanced</span>
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">Weekly View</span>
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">AI Matching</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedType}
            className={`flex-1 px-4 py-2 font-medium rounded-lg transition-colors duration-200 ${
              selectedType
                ? 'bg-grub-red hover:bg-grub-red text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserTypeSelectionModal;
