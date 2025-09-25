import React, { useState, useEffect } from 'react';

// Food preference options for filtering
const foodPreferences = [
  { id: 'vegetarian', name: 'Vegetarian', icon: '🥬' },
  { id: 'vegan', name: 'Vegan', icon: '🌱' },
  { id: 'gluten-free', name: 'Gluten Free', icon: '🌾' },
  { id: 'dairy-free', name: 'Dairy Free', icon: '🥛' },
  { id: 'keto', name: 'Keto', icon: '🥑' },
  { id: 'halal', name: 'Halal', icon: '☪️' },
  { id: 'kosher', name: 'Kosher', icon: '✡️' },
  { id: 'low-carb', name: 'Low Carb', icon: '🥩' },
  { id: 'paleo', name: 'Paleo', icon: '🦴' },
  { id: 'spicy', name: 'Spicy', icon: '🌶️' },
  { id: 'organic', name: 'Organic', icon: '🌿' },
  { id: 'pescatarian', name: 'Pescatarian', icon: '🐟' }
];

const PreferencesFilterModal = ({ 
  isOpen, 
  onClose, 
  selectedPreferences, 
  onApply 
}) => {
  const [localPreferences, setLocalPreferences] = useState(selectedPreferences);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      setLocalPreferences(selectedPreferences);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, selectedPreferences]);

  const handlePreferenceToggle = (preferenceId) => {
    setLocalPreferences(prev => 
      prev.includes(preferenceId)
        ? prev.filter(id => id !== preferenceId)
        : [...prev, preferenceId]
    );
  };

  const handleApply = () => {
    onApply(localPreferences);
  };

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleReset = () => {
    setLocalPreferences([]);
    onApply([]);
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
      <div className="flex min-h-full items-end justify-center pb-4">
        <div 
          className={`relative w-full max-w-lg transform transition-all duration-300 ${
            isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
          }`}
        >
          {/* Modal Content */}
          <div className="relative bg-white rounded-t-2xl shadow-2xl h-[70vh] flex flex-col">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Food Preferences</h2>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                >
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-gray-600 text-sm mt-2">Select your dietary preferences to filter menu items</p>
            </div>

            {/* Content */}
            <div className="flex-1 px-4 py-3 overflow-y-auto">
              {/* Preferences Grid */}
              <div className="grid grid-cols-2 gap-3">
                {foodPreferences.map((preference) => {
                  const isActive = localPreferences.includes(preference.id);
                  return (
                    <button
                      key={preference.id}
                      onClick={() => handlePreferenceToggle(preference.id)}
                      className={`flex items-center space-x-2 p-3 rounded-lg transition-all duration-300 ${
                        isActive
                          ? 'bg-green-50 border-2 border-green-500 text-green-700 shadow-md'
                          : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent text-gray-700'
                      }`}
                    >
                      <span className="text-lg">{preference.icon}</span>
                      <span className="font-medium text-sm">{preference.name}</span>
                      {isActive && (
                        <svg className="w-4 h-4 ml-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Filter Summary */}
              <div className="bg-green-50 rounded-lg p-4 mt-6 border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Selected Preferences
                </h4>
                <div className="text-sm text-green-700">
                  {localPreferences.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {localPreferences.map(prefId => {
                        const pref = foodPreferences.find(p => p.id === prefId);
                        return (
                          <span key={prefId} className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                            <span className="mr-1">{pref?.icon}</span>
                            {pref?.name}
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <span className="text-green-600">No preferences selected - showing all items</span>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 bg-white border-t border-gray-200 px-6 py-6 pb-16 sm:pb-10">
              <div className="flex space-x-3">
                <button
                  onClick={handleReset}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors duration-300"
                >
                  Clear All
                </button>
                <button
                  onClick={handleApply}
                  className="flex-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg transform hover:scale-105 active:scale-95"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Apply Preferences ({localPreferences.length})</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreferencesFilterModal;
