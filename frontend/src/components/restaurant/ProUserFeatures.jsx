import React from 'react';
import { DAYS_OF_WEEK } from '../../utils/filteringAlgorithms';

const ProUserFeatures = ({
  activeDay,
  selectedMealType,
  isFromMenuSelection,
  onDayChange,
  onMealTypeChange
}) => {
  return (
    <div className="space-y-6">
      {/* Enhanced Day Tabs - Hidden when coming from MenuSelectionStep */}
      {!isFromMenuSelection && (
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {DAYS_OF_WEEK.map((day) => (
                <button
                  key={day.id}
                  onClick={() => onDayChange(day.id)}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeDay === day.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <div>{day.name}</div>
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Pro Meal Type Selector - Hidden when coming from MenuSelectionStep */}
      {!isFromMenuSelection && (
        <div className="mb-6 sm:mb-8">
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-3 sm:p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-purple-900 text-sm sm:text-base">Select Meal Type</h3>
                <p className="text-xs sm:text-sm text-purple-700 mt-1 leading-relaxed">
                  Choose meal for <span className="font-medium">{DAYS_OF_WEEK.find(d => d.id === activeDay)?.name}</span>
                </p>
              </div>
              <div className="flex bg-white border border-purple-300 rounded-xl overflow-hidden shadow-sm w-full sm:w-auto">
                <button
                  onClick={() => onMealTypeChange('lunch')}
                  className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-medium transition-all duration-200 touch-manipulation ${
                    selectedMealType === 'lunch'
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-md'
                      : 'text-purple-900 hover:bg-purple-50 active:bg-purple-100'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-1.5 sm:space-x-2">
                    <span className="text-sm sm:text-base">🌅</span>
                    <span className="whitespace-nowrap">Lunch</span>
                  </div>
                </button>
                <button
                  onClick={() => onMealTypeChange('dinner')}
                  className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-medium transition-all duration-200 touch-manipulation ${
                    selectedMealType === 'dinner'
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md'
                      : 'text-purple-900 hover:bg-purple-50 active:bg-purple-100'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-1.5 sm:space-x-2">
                    <span className="text-sm sm:text-base">🌙</span>
                    <span className="whitespace-nowrap">Dinner</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProUserFeatures;
