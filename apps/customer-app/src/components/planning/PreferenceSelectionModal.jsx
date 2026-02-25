import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

// Get icon for preference type
const getPreferenceIcon = (preferenceId) => {
  const icons = {
    'vegetarian': '🥗',
    'vegan': '🌱',
    'gluten-free': '🌾',
    'dairy-free': '🥛',
    'keto': '🥑',
    'halal': '🕌',
    'kosher': '✡️',
    'low-carb': '🥬',
    'paleo': '🦴',
    'spicy': '🌶️',
    'organic': '🌿',
    'pescatarian': '🐟'
  };
  return icons[preferenceId] || '🍽️';
};

// Food preference options data
const foodPreferences = [
  { id: 'vegetarian', key: 'vegetarian' },
  { id: 'vegan', key: 'vegan' },
  { id: 'gluten-free', key: 'glutenFree' },
  { id: 'dairy-free', key: 'dairyFree' },
  { id: 'keto', key: 'keto' },
  { id: 'halal', key: 'halal' },
  { id: 'kosher', key: 'kosher' },
  { id: 'low-carb', key: 'lowCarb' },
  { id: 'paleo', key: 'paleo' },
  { id: 'spicy', key: 'spicy' },
  { id: 'organic', key: 'organic' },
  { id: 'pescatarian', key: 'pescatarian' }
];

const PreferenceSelectionModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  postalCode,
  initialPreferences = [] 
}) => {
  const { t } = useTranslation();
  const [selectedPreferences, setSelectedPreferences] = useState(initialPreferences);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handlePreferenceToggle = (preferenceId) => {
    setSelectedPreferences(prev => 
      prev.includes(preferenceId)
        ? prev.filter(id => id !== preferenceId)
        : [...prev, preferenceId]
    );
  };

  const handleConfirm = () => {
    setIsProcessing(true);
    
    // Show processing state briefly before closing
    setTimeout(() => {
      onConfirm(selectedPreferences);
      handleClose();
    }, 800);
  };

  const handleClose = () => {
    setIsAnimating(false);
    setIsProcessing(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleSkip = () => {
    setIsProcessing(true);
    
    // Show processing state briefly before closing
    setTimeout(() => {
      onConfirm([]);
      handleClose();
    }, 500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black transition-opacity duration-300 ${
          isAnimating ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={handleClose}
      />
      
      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className={`relative w-full max-w-2xl transform transition-all duration-300 ${
            isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
        >
          {/* Modal Content */}
          <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Decorative Background */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-grub-red via-grub-red to-yellow-500 opacity-10"></div>
            <div className="absolute top-4 right-4 w-20 h-20 bg-grub-red/15 rounded-full opacity-30 animate-pulse"></div>
            <div className="absolute bottom-4 left-4 w-16 h-16 bg-orange-200 rounded-full opacity-30 animate-pulse delay-1000"></div>
            
            {/* Header */}
            <div className="relative px-6 sm:px-8 pt-8 pb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-grub-red via-grub-red to-grub-red rounded-xl flex items-center justify-center shadow-md shadow-grub-red/10">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Find Perfect Restaurants
                    </h2>
                    <p className="text-sm text-gray-600">
                      Near {postalCode?.toUpperCase()}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={handleClose}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors duration-200"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <p className="text-gray-600 leading-relaxed">
                Select your dietary preferences to get personalized restaurant recommendations. 
                We'll show you the best-rated restaurants that match your needs.
              </p>
            </div>

            {/* Preferences Grid */}
            <div className="relative px-6 sm:px-8 pb-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {foodPreferences.map((preference) => (
                  <button
                    key={preference.id}
                    onClick={() => handlePreferenceToggle(preference.id)}
                    className={`
                      relative p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105
                      ${selectedPreferences.includes(preference.id)
                        ? 'border-grub-red bg-red-50 shadow-lg shadow-grub-red/15'
                        : 'border-gray-200 bg-white hover:border-grub-red/60 hover:bg-red-50/50'
                      }
                    `}
                  >
                    {/* Selection indicator */}
                    {selectedPreferences.includes(preference.id) && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-grub-red rounded-full flex items-center justify-center shadow-md shadow-grub-red/15">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                    
                    <div className="text-center">
                      <div className="text-2xl mb-2">{getPreferenceIcon(preference.id)}</div>
                      <div className="text-sm font-medium text-gray-900 capitalize">
                        {preference.id.replace('-', ' ')}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Count */}
            {selectedPreferences.length > 0 && (
              <div className="px-6 sm:px-8 pb-4">
                <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-3 border border-grub-red/20">
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5 text-grub-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm font-medium text-grub-red">
                      {selectedPreferences.length} preference{selectedPreferences.length !== 1 ? 's' : ''} selected
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="relative px-6 sm:px-8 pb-8">
              {isProcessing && (
                <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-4 border-4 border-red-200 border-t-grub-red rounded-full animate-spin"></div>
                    <p className="text-gray-700 font-medium">Finding restaurants...</p>
                    <p className="text-sm text-gray-500 mt-1">Preparing your results</p>
                  </div>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleSkip}
                  disabled={isProcessing}
                  className={`flex-1 px-6 py-3 font-semibold rounded-xl transition-all duration-300 ${
                    isProcessing 
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:shadow-lg'
                  }`}
                >
                  Skip & Show All
                </button>
                
                <button
                  onClick={handleConfirm}
                  disabled={isProcessing}
                  className={`flex-1 px-6 py-3 font-semibold rounded-xl transition-all duration-300 shadow-lg ${
                    isProcessing
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-grub-red via-grub-red to-grub-red text-white transform hover:scale-105 hover:shadow-xl hover:shadow-grub-red/20'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span>Find Restaurants</span>
                    {!isProcessing && (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    )}
                  </div>
                </button>
              </div>
              
              <p className="text-xs text-gray-500 text-center mt-3">
                You can always change your preferences later
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreferenceSelectionModal;
