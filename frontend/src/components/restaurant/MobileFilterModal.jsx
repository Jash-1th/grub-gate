import React, { useState, useEffect } from 'react';
import { DAYS_OF_WEEK, isMealAvailable } from '../../utils/filteringAlgorithms';

// Food preference options for filtering
const foodPreferences = [
  { id: 'vegetarian', name: 'Vegetarian' },
  { id: 'vegan', name: 'Vegan' },
  { id: 'gluten-free', name: 'Gluten Free' },
  { id: 'dairy-free', name: 'Dairy Free' },
  { id: 'keto', name: 'Keto' },
  { id: 'halal', name: 'Halal' },
  { id: 'kosher', name: 'Kosher' },
  { id: 'low-carb', name: 'Low Carb' },
  { id: 'paleo', name: 'Paleo' },
  { id: 'spicy', name: 'Spicy' },
  { id: 'organic', name: 'Organic' },
  { id: 'pescatarian', name: 'Pescatarian' }
];

const MobileFilterModal = ({ 
  isOpen, 
  onClose, 
  selectedPreferences, 
  setSelectedPreferences,
  selectedDay,
  setSelectedDay,
  selectedMealType,
  dayFilteredItems,
  onApply 
}) => {
  const [localPreferences, setLocalPreferences] = useState(selectedPreferences);
  const [localDay, setLocalDay] = useState(selectedDay);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      setLocalPreferences(selectedPreferences);
      setLocalDay(selectedDay);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, selectedPreferences, selectedDay]);

  const handlePreferenceToggle = (preferenceId) => {
    setLocalPreferences(prev => 
      prev.includes(preferenceId)
        ? prev.filter(id => id !== preferenceId)
        : [...prev, preferenceId]
    );
  };

  const handleDaySelection = (dayId) => {
    setLocalDay(dayId);
  };

  const handleApply = () => {
    setSelectedPreferences(localPreferences);
    setSelectedDay(localDay);
    onApply();
  };

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleReset = () => {
    setLocalPreferences([]);
    setLocalDay(DAYS_OF_WEEK[0].id);
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
                <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                <button
                  onClick={handleClose}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                >
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 px-4 py-3 overflow-y-auto">
              {/* Preferences Section */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Food Preferences
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {foodPreferences.map((preference) => {
                    const isActive = localPreferences.includes(preference.id);
                    return (
                      <button
                        key={preference.id}
                        onClick={() => handlePreferenceToggle(preference.id)}
                        className={`flex items-center justify-center p-3 rounded-lg transition-all duration-300 ${
                          isActive
                            ? 'bg-red-50 border-2 border-red-500 text-red-700'
                            : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent text-gray-700'
                        }`}
                      >
                        <span className="font-medium text-sm">{preference.name}</span>
                        {isActive && (
                          <svg className="w-4 h-4 ml-auto text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Day Selection */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Select Day
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {DAYS_OF_WEEK.map((day) => {
                    const isAvailable = isMealAvailable(day.id, selectedMealType);
                    const isSelected = localDay === day.id;
                    return (
                      <button
                        key={day.id}
                        onClick={() => handleDaySelection(day.id)}
                        disabled={!isAvailable}
                        className={`flex items-center justify-between p-3 rounded-lg transition-all duration-300 ${
                          isSelected
                            ? 'bg-blue-50 border-2 border-blue-500 text-blue-700'
                            : isAvailable
                            ? 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent text-gray-700'
                            : 'bg-gray-100 border-2 border-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <span className="font-medium">{day.name}</span>
                        <span className="text-sm opacity-75">{day.short}</span>
                        {isSelected && (
                          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Filter Summary */}
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Filter Summary</h4>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Preferences:</span>
                    <span className="font-medium text-gray-900">
                      {localPreferences.length > 0 ? `${localPreferences.length} selected` : 'None'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Day:</span>
                    <span className="font-medium text-gray-900">
                      {DAYS_OF_WEEK.find(d => d.id === localDay)?.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Available meals:</span>
                    <span className="font-medium text-gray-900">
                      {dayFilteredItems.availableMeals.length > 0 
                        ? dayFilteredItems.availableMeals.map(meal => meal.charAt(0).toUpperCase() + meal.slice(1)).join(', ')
                        : 'None'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 bg-white border-t border-gray-200 px-8 py-8">
              <div className="flex space-x-3">
                <button
                  onClick={handleReset}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors duration-300"
                >
                  Reset
                </button>
                <button
                  onClick={handleApply}
                  className="flex-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg transform hover:scale-105 active:scale-95"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Apply Filters</span>
                  </div>
                </button>
              </div>
              {/* Extra space for mobile visibility */}
              <div className="h-8"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileFilterModal;
