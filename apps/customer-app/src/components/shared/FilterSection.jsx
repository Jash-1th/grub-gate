import React from 'react';

/**
 * Reusable Filter Section Component
 * Provides desktop and mobile filter layouts with meal type and preferences
 * SSR-safe implementation
 */
const FilterSection = ({
  selectedMealType,
  selectedPreferences,
  showMealDropdown,
  dayFilteredItems,
  onMealTypeChange,
  onToggleMealDropdown,
  onShowPreferencesFilter,
  onShowDaysFilter,
  showDaysFilter = false, // Optional - some pages don't have day filters
  className = ""
}) => {
  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-200 ${className}`}>
      <div className="p-6">
        {/* Desktop Filters */}
        <div className="hidden md:block">
          <div className={`grid ${showDaysFilter ? 'grid-cols-3' : 'grid-cols-2'} gap-4`}>
            {/* Meal Type Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Meal Type</label>
              <div className="flex space-x-2">
                {dayFilteredItems?.availableMeals?.includes('lunch') && (
                  <button
                    onClick={() => onMealTypeChange('lunch')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors duration-200 ${
                      selectedMealType === 'lunch'
                        ? 'bg-orange-100 text-orange-800 border-2 border-orange-300'
                        : 'bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    Lunch
                  </button>
                )}
                {dayFilteredItems?.availableMeals?.includes('dinner') && (
                  <button
                    onClick={() => onMealTypeChange('dinner')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors duration-200 ${
                      selectedMealType === 'dinner'
                        ? 'bg-indigo-100 text-indigo-800 border-2 border-indigo-300'
                        : 'bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    Dinner
                  </button>
                )}
              </div>
            </div>

            {/* Preferences Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Food Preferences</label>
              <button
                onClick={onShowPreferencesFilter}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2 px-4 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Food Preferences</span>
                {selectedPreferences.length > 0 && (
                  <div className="bg-orange-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center border-2 border-white">
                    {selectedPreferences.length}
                  </div>
                )}
              </button>
              {selectedPreferences.length > 0 && (
                <div className="mt-2 text-sm text-green-700">
                  {selectedPreferences.length} preference{selectedPreferences.length !== 1 ? 's' : ''} selected
                </div>
              )}
            </div>

            {/* Days Filter (optional) */}
            {showDaysFilter && onShowDaysFilter && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Day</label>
                <button
                  onClick={onShowDaysFilter}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
                  </svg>
                  <span>Select Day</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Compact Filter Row */}
        <div className="md:hidden">
          <div className="flex items-center justify-between space-x-3 bg-white rounded-xl shadow-lg p-4">
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

              {/* Days Filter Button - Mobile (optional) */}
              {showDaysFilter && onShowDaysFilter && (
                <button
                  onClick={onShowDaysFilter}
                  className="group relative bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 active:from-blue-700 active:to-blue-800 text-white py-2.5 px-3 rounded-lg shadow-md transition-all duration-200 transform active:scale-95 touch-manipulation"
                >
                  <div className="flex items-center space-x-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
                    </svg>
                    <span className="font-semibold text-xs">Day</span>
                  </div>
                </button>
              )}
            </div>

            {/* Right Side - Mobile Meal Type Dropdown */}
            <div className="relative meal-dropdown">
              <button
                onClick={onToggleMealDropdown}
                className="bg-gradient-to-r from-grub-red via-grub-red to-grub-red text-white py-2.5 px-4 rounded-lg shadow-md hover:shadow-lg hover:shadow-grub-red/20 transition-all duration-200 transform active:scale-95 flex items-center space-x-2 touch-manipulation min-w-[100px]"
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
                  {dayFilteredItems?.availableMeals?.includes('lunch') && (
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
                  
                  {dayFilteredItems?.availableMeals?.includes('dinner') && (
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
    </div>
  );
};

export default FilterSection;
