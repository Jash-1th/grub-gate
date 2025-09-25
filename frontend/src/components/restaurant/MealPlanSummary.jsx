import React, { useState } from 'react';
import { useMealPlan } from '../../contexts/MealPlanContext';
import { DAYS_OF_WEEK } from '../../utils/filteringAlgorithms';

const MealPlanSummary = ({ restaurantName }) => {
  const { mealPlan, removeItemFromPlan } = useMealPlan();
  const [isExpanded, setIsExpanded] = useState(false);

  // Get items from this restaurant in the meal plan
  const restaurantItems = Object.entries(mealPlan).reduce((acc, [day, dayPlan]) => {
    Object.entries(dayPlan).forEach(([mealType, items]) => {
      items.forEach(item => {
        if (item.restaurantName === restaurantName) {
          acc.push({
            ...item,
            day,
            mealType,
            dayName: DAYS_OF_WEEK.find(d => d.id === day)?.name || day
          });
        }
      });
    });
    return acc;
  }, []);

  if (restaurantItems.length === 0) {
    return null;
  }

  const handleRemoveItem = (item) => {
    removeItemFromPlan(item.planId, item.day, item.mealType);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl shadow-lg border-2 border-purple-200 mb-6">
      {/* Header - Always visible, clickable to toggle */}
      <button 
        onClick={toggleExpanded}
        className="w-full p-6 bg-gradient-to-r from-purple-100 to-pink-100 rounded-t-xl hover:from-purple-150 hover:to-pink-150 transition-colors duration-200 text-left"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-purple-800">
                Your Meal Plan ({restaurantItems.length} items)
              </h2>
              <p className="text-purple-700 mt-1">Items you've added from {restaurantName}</p>
            </div>
          </div>
          
          {/* Expand/Collapse Icon */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-purple-600 font-medium">
              {isExpanded ? 'Hide' : 'Show'} Details
            </span>
            <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </button>
      
      {/* Expandable Content */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
        isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="p-6 border-t border-purple-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {restaurantItems.map((item) => (
              <div 
                key={item.planId}
                className="bg-white rounded-lg shadow-md border border-purple-200 overflow-hidden hover:shadow-lg transition-shadow duration-200"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-sm mb-1">{item.name}</h3>
                      <div className="flex items-center space-x-2 text-xs text-gray-600">
                        <div className="flex items-center space-x-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="font-medium">{item.dayName}</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center space-x-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {item.mealType === 'lunch' ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                            )}
                          </svg>
                          <span className="capitalize font-medium">{item.mealType}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveItem(item);
                      }}
                      className="ml-2 p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors duration-200"
                      title="Remove from meal plan"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-bold text-purple-600">
                      ${item.price}
                    </div>
                    
                    {/* Preferences badges */}
                    {item.preferences && item.preferences.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {item.preferences.slice(0, 2).map(preference => (
                          <span 
                            key={preference}
                            className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium"
                          >
                            {preference}
                          </span>
                        ))}
                        {item.preferences.length > 2 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                            +{item.preferences.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Summary */}
          <div className="mt-6 pt-4 border-t border-purple-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-purple-700 font-medium">
                Total from {restaurantName}:
              </span>
              <span className="text-purple-800 font-bold text-lg">
                ${restaurantItems.reduce((sum, item) => sum + parseFloat(item.price), 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealPlanSummary;
