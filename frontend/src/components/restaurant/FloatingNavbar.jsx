import React from 'react';
import { DAYS_OF_WEEK } from '../../utils/filteringAlgorithms';

const FloatingNavbar = ({
  showNavbarIndicator,
  userType,
  selectedMealType,
  activeDay,
  selectedPreferences,
  isFromMenuSelection,
  onMealTypeChange,
  onDayChange,
  onPreferencesClick,
  scrollToMenuItems
}) => {
  if (!showNavbarIndicator || userType !== 'pro') {
    return null;
  }

  return (
    <div className="fixed top-16 sm:top-20 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-lg">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2">
        {/* Single Line Layout for Both Mobile and Desktop */}
        <div className="flex items-center justify-between space-x-2">
          {/* Left Side - Status Indicators */}
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <span className="text-xs sm:text-sm font-medium text-gray-600 sm:text-gray-700 flex-shrink-0">Viewing:</span>
            
            {/* Meal Type Indicator */}
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs sm:text-sm font-medium flex-shrink-0 ${
              selectedMealType === 'lunch' 
                ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
                : 'bg-purple-100 text-purple-800 border border-purple-200'
            }`}>
              <span>{selectedMealType === 'lunch' ? '🌅' : '🌙'}</span>
              <span className="capitalize hidden sm:inline">{selectedMealType}</span>
            </div>

            {/* Day Indicator (Pro Users) */}
            {userType === 'pro' && (
              <div className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs sm:text-sm font-medium bg-purple-100 text-purple-800 border border-purple-200 flex-shrink-0">
                <span>📅</span>
                <span className="hidden sm:inline">{DAYS_OF_WEEK.find(d => d.id === activeDay)?.name}</span>
                <span className="sm:hidden">{DAYS_OF_WEEK.find(d => d.id === activeDay)?.name.slice(0, 3)}</span>
              </div>
            )}

            {/* Preferences Indicator */}
            {selectedPreferences.length > 0 && (
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs sm:text-sm font-medium border flex-shrink-0 ${
                userType === 'pro' 
                  ? 'bg-purple-50 text-purple-700 border-purple-200' 
                  : 'bg-green-50 text-green-700 border-green-200'
              }`}>
                <span>🍽️</span>
                <span>{selectedPreferences.length}</span>
              </div>
            )}
          </div>

          {/* Right Side - Interactive Controls */}
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            {/* Meal Type Toggle - Hidden when coming from MenuSelectionStep */}
            {!isFromMenuSelection && (
              <div className="flex bg-gray-100 rounded-lg overflow-hidden">
                <button
                  onClick={() => {
                    onMealTypeChange('lunch');
                    setTimeout(() => scrollToMenuItems(), 100);
                  }}
                  className={`px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-1 ${
                    selectedMealType === 'lunch'
                      ? 'bg-yellow-500 text-white'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span>🌅</span>
                  <span className="hidden sm:inline">Lunch</span>
                </button>
                <button
                  onClick={() => {
                    onMealTypeChange('dinner');
                    setTimeout(() => scrollToMenuItems(), 100);
                  }}
                  className={`px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-1 ${
                    selectedMealType === 'dinner'
                      ? 'bg-purple-500 text-white'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span>🌙</span>
                  <span className="hidden sm:inline">Dinner</span>
                </button>
              </div>
            )}

            {/* Day Selector (Pro Users Only) - Hidden when coming from MenuSelectionStep */}
            {userType === 'pro' && !isFromMenuSelection && (
              <select 
                value={activeDay} 
                onChange={(e) => {
                  onDayChange(e.target.value);
                  setTimeout(() => scrollToMenuItems(), 100);
                }}
                className="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm bg-white border border-purple-300 rounded-lg text-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {DAYS_OF_WEEK.map((day) => (
                  <option key={day.id} value={day.id}>{day.name.slice(0, 3)}</option>
                ))}
              </select>
            )}

            {/* Preferences Button */}
            <button
              onClick={onPreferencesClick}
              className={`px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm rounded-lg transition-colors font-medium flex items-center space-x-1 ${
                selectedPreferences.length > 0
                  ? userType === 'pro'
                    ? 'bg-purple-500 text-white'
                    : 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <span>🍽️</span>
              <span className="hidden sm:inline">Filters</span>
              {selectedPreferences.length > 0 && (
                <span className="bg-white text-current rounded-full w-4 h-4 text-xs flex items-center justify-center font-bold">
                  {selectedPreferences.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloatingNavbar;
