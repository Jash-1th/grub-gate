import React, { useState, useEffect } from 'react';
import { DAYS_OF_WEEK, getCurrentDay } from '../../utils/filteringAlgorithms';

const CompactFilterRow = ({
  selectedPreferences,
  selectedDay,
  selectedMealType,
  dayFilteredItems,
  onShowPreferencesFilter,
  onShowDaysFilter,
  onMealTypeChange
}) => {
  const [showMealDropdown, setShowMealDropdown] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMealDropdown && !event.target.closest('.meal-dropdown')) {
        setShowMealDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMealDropdown]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        {/* Left Side - Filter Buttons */}
        <div className="flex items-center space-x-3">
          {/* Preferences Filter Button */}
          <button
            onClick={onShowPreferencesFilter}
            className="group relative bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-2.5 px-4 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95"
          >
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-semibold text-sm">Food Preferences</span>
              {selectedPreferences.length > 0 && (
                <div className="bg-orange-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white animate-pulse">
                  {selectedPreferences.length}
                </div>
              )}
            </div>
            
            {/* Hover tooltip */}
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-10">
              {selectedPreferences.length > 0 ? `${selectedPreferences.length} selected` : 'Filter by preferences'}
            </div>
          </button>

          {/* Days Filter Button */}
          <button
            onClick={onShowDaysFilter}
            className="group relative bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2.5 px-4 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95"
          >
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-semibold text-sm">Select Day</span>
              {selectedDay !== getCurrentDay() && (
                <div className="bg-orange-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white animate-pulse">
                  1
                </div>
              )}
            </div>
            
            {/* Hover tooltip */}
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-10">
              {DAYS_OF_WEEK.find(d => d.id === selectedDay)?.name}
              {selectedDay === getCurrentDay() && ' (Today)'}
            </div>
          </button>
        </div>

        {/* Right Side - Meal Type Dropdown */}
        <div className="relative meal-dropdown">
          <div className="group">
            <button
              onClick={() => setShowMealDropdown(!showMealDropdown)}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-2.5 px-6 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95 flex items-center space-x-3"
            >
              <div className="flex items-center space-x-2">
                {selectedMealType === 'lunch' ? (
                  <svg className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 0 1 8.646 3.646 9.003 9.003 0 0 0 12 21a9.003 9.003 0 0 0 8.354-5.646z" />
                  </svg>
                )}
                <span className="font-semibold capitalize">{selectedMealType}</span>
              </div>
              <svg className={`w-4 h-4 transition-transform duration-300 ${showMealDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showMealDropdown && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-20 animate-in slide-in-from-top-2 duration-200">
                {dayFilteredItems.availableMeals.includes('lunch') && (
                  <button
                    onClick={() => onMealTypeChange('lunch')}
                    className={`w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 transition-all duration-200 flex items-center space-x-3 ${
                      selectedMealType === 'lunch' ? 'bg-gradient-to-r from-yellow-50 to-orange-50 text-yellow-700' : 'text-gray-700 hover:text-yellow-700'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <div>
                      <div className="font-semibold">Lunch</div>
                      <div className="text-xs opacity-75">Midday meals</div>
                    </div>
                    {selectedMealType === 'lunch' && (
                      <svg className="w-4 h-4 ml-auto text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                )}
                
                {dayFilteredItems.availableMeals.includes('dinner') && (
                  <button
                    onClick={() => onMealTypeChange('dinner')}
                    className={`w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 transition-all duration-200 flex items-center space-x-3 ${
                      selectedMealType === 'dinner' ? 'bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-700' : 'text-gray-700 hover:text-purple-700'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 0 1 8.646 3.646 9.003 9.003 0 0 0 12 21a9.003 9.003 0 0 0 8.354-5.646z" />
                    </svg>
                    <div>
                      <div className="font-semibold">Dinner</div>
                      <div className="text-xs opacity-75">Evening meals</div>
                    </div>
                    {selectedMealType === 'dinner' && (
                      <svg className="w-4 h-4 ml-auto text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Compact Row - Same Layout as Desktop */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between space-x-3 mt-4 pt-4 border-t border-gray-200">
          {/* Left Side - Compact Filter Buttons */}
          <div className="flex items-center space-x-2 flex-1">
            {/* Preferences Filter Button - Mobile */}
            <button
              onClick={onShowPreferencesFilter}
              className="group relative bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 active:from-green-700 active:to-green-800 text-white py-2.5 px-3 rounded-lg shadow-md transition-all duration-200 transform active:scale-95 touch-manipulation"
            >
              <div className="flex items-center space-x-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-semibold text-xs">Prefs</span>
                {selectedPreferences.length > 0 && (
                  <div className="bg-orange-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center border border-white">
                    {selectedPreferences.length}
                  </div>
                )}
              </div>
            </button>

            {/* Days Filter Button - Mobile */}
            <button
              onClick={onShowDaysFilter}
              className="group relative bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 active:from-blue-700 active:to-blue-800 text-white py-2.5 px-3 rounded-lg shadow-md transition-all duration-200 transform active:scale-95 touch-manipulation"
            >
              <div className="flex items-center space-x-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="font-semibold text-xs">Day</span>
                {selectedDay !== getCurrentDay() && (
                  <div className="bg-orange-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center border border-white">
                    1
                  </div>
                )}
              </div>
            </button>
          </div>

          {/* Right Side - Mobile Meal Type Dropdown */}
          <div className="relative meal-dropdown">
            <button
              onClick={() => setShowMealDropdown(!showMealDropdown)}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 active:from-red-700 active:to-red-800 text-white py-2.5 px-4 rounded-lg shadow-md transition-all duration-200 transform active:scale-95 flex items-center space-x-2 touch-manipulation min-w-[100px]"
            >
              <div className="flex items-center space-x-1.5">
                {selectedMealType === 'lunch' ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 0 1 8.646 3.646 9.003 9.003 0 0 0 12 21a9.003 9.003 0 0 0 8.354-5.646z" />
                  </svg>
                )}
                <span className="font-semibold text-xs capitalize">{selectedMealType}</span>
              </div>
              <svg className={`w-3 h-3 transition-transform duration-200 ${showMealDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Mobile Dropdown Menu */}
            {showMealDropdown && (
              <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-20 animate-in slide-in-from-top-2 duration-200">
                {dayFilteredItems.availableMeals.includes('lunch') && (
                  <button
                    onClick={() => onMealTypeChange('lunch')}
                    className={`w-full text-left px-3 py-2.5 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 transition-all duration-200 flex items-center space-x-2 touch-manipulation ${
                      selectedMealType === 'lunch' ? 'bg-gradient-to-r from-yellow-50 to-orange-50 text-yellow-700' : 'text-gray-700 hover:text-yellow-700'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <div>
                      <div className="font-semibold text-sm">Lunch</div>
                      <div className="text-xs opacity-75">Midday</div>
                    </div>
                    {selectedMealType === 'lunch' && (
                      <svg className="w-3 h-3 ml-auto text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                )}
                
                {dayFilteredItems.availableMeals.includes('dinner') && (
                  <button
                    onClick={() => onMealTypeChange('dinner')}
                    className={`w-full text-left px-3 py-2.5 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 transition-all duration-200 flex items-center space-x-2 touch-manipulation ${
                      selectedMealType === 'dinner' ? 'bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-700' : 'text-gray-700 hover:text-purple-700'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 0 1 8.646 3.646 9.003 9.003 0 0 0 12 21a9.003 9.003 0 0 0 8.354-5.646z" />
                    </svg>
                    <div>
                      <div className="font-semibold text-sm">Dinner</div>
                      <div className="text-xs opacity-75">Evening</div>
                    </div>
                    {selectedMealType === 'dinner' && (
                      <svg className="w-3 h-3 ml-auto text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompactFilterRow;
