import React from 'react';
import { DAYS_OF_WEEK, getCurrentDay } from '../../utils/filteringAlgorithms';

/**
 * Sticky Filter Bar Component
 * Appears when scrolling down, provides quick access to filters
 * SSR-safe implementation
 */
const StickyFilterBar = ({
  isVisible,
  selectedMealType,
  selectedDay,
  selectedPreferences,
  dayFilteredItems,
  displayItems,
  showStickyMealDropdown,
  onToggleMealDropdown,
  onMealTypeChange,
  onShowPreferencesFilter,
  onShowDaysFilter
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-lg animate-in slide-in-from-top-2 duration-300">
      {/* Desktop Sticky Filter */}
      <div className="hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            {/* Left Side - Current Selection Info */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  {selectedMealType === 'lunch' ? (
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 0 1 8.646 3.646 9.003 9.003 0 0 0 12 21a9.003 9.003 0 0 0 8.354-5.646z" />
                    </svg>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    {selectedMealType.charAt(0).toUpperCase() + selectedMealType.slice(1)} • {DAYS_OF_WEEK.find(d => d.id === selectedDay)?.name}
                  </h3>
                  <p className="text-xs text-gray-600">
                    {displayItems?.length || 0} items
                    {selectedPreferences.length > 0 && (
                      <span className="ml-1 text-green-600">• {selectedPreferences.length} filter{selectedPreferences.length !== 1 ? 's' : ''}</span>
                    )}
                  </p>
                </div>
              </div>
              {selectedDay === getCurrentDay() && (
                <span className="px-2 py-1 bg-orange-100 text-orange-600 text-xs rounded-full font-medium">
                  Today
                </span>
              )}
            </div>

            {/* Right Side - Quick Actions */}
            <div className="flex items-center space-x-2">
              <button
                onClick={onShowPreferencesFilter}
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-200 flex items-center space-x-1"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Prefs</span>
                {selectedPreferences.length > 0 && (
                  <div className="bg-orange-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center border border-white">
                    {selectedPreferences.length}
                  </div>
                )}
              </button>
              <button
                onClick={onShowDaysFilter}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-200 flex items-center space-x-1"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
                </svg>
                <span>Day</span>
              </button>
              <div className="relative">
                <button
                  onClick={onToggleMealDropdown}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-200 flex items-center space-x-1"
                >
                  <span className="capitalize">{selectedMealType}</span>
                  <svg className={`w-3 h-3 transition-transform duration-200 ${showStickyMealDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showStickyMealDropdown && (
                  <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-20">
                    {dayFilteredItems?.availableMeals?.includes('lunch') && (
                      <button
                        onClick={() => onMealTypeChange('lunch')}
                        className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 transition-colors duration-200 ${
                          selectedMealType === 'lunch' ? 'bg-yellow-50 text-yellow-700' : 'text-gray-700'
                        }`}
                      >
                        Lunch
                      </button>
                    )}
                    {dayFilteredItems?.availableMeals?.includes('dinner') && (
                      <button
                        onClick={() => onMealTypeChange('dinner')}
                        className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 transition-colors duration-200 ${
                          selectedMealType === 'dinner' ? 'bg-purple-50 text-purple-700' : 'text-gray-700'
                        }`}
                      >
                        Dinner
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Filter */}
      <div className="lg:hidden">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between space-x-3">
            {/* Left Side - Current Info */}
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                {selectedMealType === 'lunch' ? (
                  <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 0 1 8.646 3.646 9.003 9.003 0 0 0 12 21a9.003 9.003 0 0 0 8.354-5.646z" />
                  </svg>
                )}
              </div>
              <div>
                <h3 className="text-xs font-semibold text-gray-900 capitalize">
                  {selectedMealType} • {DAYS_OF_WEEK.find(d => d.id === selectedDay)?.name}
                </h3>
                <p className="text-xs text-gray-600">
                  {displayItems?.length || 0} items
                </p>
              </div>
            </div>

            {/* Right Side - Quick Filters */}
            <div className="flex items-center space-x-1">
              <button
                onClick={onShowPreferencesFilter}
                className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs font-medium transition-colors duration-200 flex items-center space-x-1"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>pref</span>
                {selectedPreferences.length > 0 && (
                  <div className="bg-orange-500 text-white text-xs font-bold rounded-full h-3 w-3 flex items-center justify-center">
                    {selectedPreferences.length}
                  </div>
                )}
              </button>
              <div className="relative">
                <button
                  onClick={onToggleMealDropdown}
                  className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs font-medium transition-colors duration-200 flex items-center space-x-1"
                >
                  <span className="capitalize">{selectedMealType}</span>
                  <svg className={`w-2 h-2 transition-transform duration-200 ${showStickyMealDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showStickyMealDropdown && (
                  <div className="absolute right-0 top-full mt-1 w-24 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-20">
                    {dayFilteredItems?.availableMeals?.includes('lunch') && (
                      <button
                        onClick={() => onMealTypeChange('lunch')}
                        className={`w-full text-left px-2 py-1 text-xs hover:bg-gray-50 transition-colors duration-200 ${
                          selectedMealType === 'lunch' ? 'bg-yellow-50 text-yellow-700' : 'text-gray-700'
                        }`}
                      >
                        Lunch
                      </button>
                    )}
                    {dayFilteredItems?.availableMeals?.includes('dinner') && (
                      <button
                        onClick={() => onMealTypeChange('dinner')}
                        className={`w-full text-left px-2 py-1 text-xs hover:bg-gray-50 transition-colors duration-200 ${
                          selectedMealType === 'dinner' ? 'bg-purple-50 text-purple-700' : 'text-gray-700'
                        }`}
                      >
                        Dinner
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StickyFilterBar;
