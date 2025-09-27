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

  // Group items by ID, day, and meal type to show quantities
  const groupedItems = restaurantItems.reduce((acc, item) => {
    const key = `${item.id}-${item.day}-${item.mealType}`;
    const existingGroup = acc.find(group => group.key === key);
    
    if (existingGroup) {
      existingGroup.quantity += 1;
      existingGroup.items.push(item);
      existingGroup.totalPrice += parseFloat(item.price);
    } else {
      acc.push({
        ...item,
        key,
        quantity: 1,
        items: [item],
        totalPrice: parseFloat(item.price)
      });
    }
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {groupedItems.map((groupedItem) => (
              <div 
                key={groupedItem.key}
                className="group bg-white rounded-xl shadow-lg border-2 border-purple-100 overflow-hidden hover:shadow-2xl hover:border-purple-300 hover:-translate-y-1 transition-all duration-300 transform hover:scale-[1.02] relative"
              >
                {/* Gradient Background Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-pink-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="p-4 relative z-10">
                  {/* Quantity Badge */}
                  {groupedItem.quantity > 1 && (
                    <div className="mb-2 flex justify-end">
                      <div className="bg-gradient-to-r from-blue-100 to-blue-200 border-2 border-blue-300 rounded-lg px-2 py-1 flex items-center space-x-1 shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-200">
                        <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h4a1 1 0 011 1v2h4a1 1 0 011 1v1a1 1 0 01-1 1v9a2 2 0 01-2 2H8a2 2 0 01-2-2V7a1 1 0 01-1-1V5a1 1 0 011-1h4z" />
                        </svg>
                        <span className="text-blue-700 font-semibold text-xs">
                          {groupedItem.quantity}x
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-sm mb-1 group-hover:text-purple-800 transition-colors duration-200">{groupedItem.name}</h3>
                      <div className="flex items-center space-x-2 text-xs text-gray-600 group-hover:text-gray-700 transition-colors duration-200">
                        <div className="flex items-center space-x-1 bg-gray-50 group-hover:bg-purple-50 px-2 py-1 rounded-full transition-colors duration-200">
                          <svg className="w-3 h-3 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="font-medium">{groupedItem.dayName}</span>
                        </div>
                        <div className="flex items-center space-x-1 bg-gray-50 group-hover:bg-purple-50 px-2 py-1 rounded-full transition-colors duration-200">
                          <svg className="w-3 h-3 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {groupedItem.mealType === 'lunch' ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                            )}
                          </svg>
                          <span className="capitalize font-medium">{groupedItem.mealType}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Remove buttons */}
                    <div className="flex items-center justify-end space-x-1">
                      {groupedItem.quantity > 1 ? (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveItem(groupedItem.items[0]);
                            }}
                            className="p-1.5 text-orange-400 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-colors duration-200"
                            title="Remove one"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              groupedItem.items.forEach(item => handleRemoveItem(item));
                            }}
                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors duration-200"
                            title="Remove all"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveItem(groupedItem.items[0]);
                          }}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors duration-200"
                          title="Remove from meal plan"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Preferences badges */}
                  {groupedItem.preferences && groupedItem.preferences.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {groupedItem.preferences.slice(0, 2).map(preference => (
                        <span 
                          key={preference}
                          className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium"
                        >
                          {preference}
                        </span>
                      ))}
                      {groupedItem.preferences.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                          +{groupedItem.preferences.length - 2}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Price */}
                  <div className="mb-3">
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 group-hover:from-purple-100 group-hover:to-pink-100 rounded-lg p-3 transition-all duration-200">
                      <div className="text-lg font-bold text-purple-600 group-hover:text-purple-700 transition-colors duration-200">
                        ${groupedItem.quantity > 1 ? groupedItem.totalPrice.toFixed(2) : groupedItem.price}
                        {groupedItem.quantity > 1 && (
                          <div className="text-xs text-gray-500 font-normal group-hover:text-gray-600 transition-colors duration-200">
                            ${groupedItem.price} each
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-1 mt-auto text-xs group-hover:gap-1.5 transition-all duration-200">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Navigate to restaurant - you can implement this navigation
                      }}
                      className="flex items-center justify-center px-1.5 py-1.5 bg-gradient-to-r from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300 hover:shadow-md hover:scale-105 text-blue-700 hover:text-blue-800 font-medium rounded-lg text-xs transition-all duration-200 flex-1 min-w-0 transform"
                    >
                      <svg className="w-2.5 h-2.5 mr-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="truncate">View</span>
                    </button>
                    
                    {groupedItem.quantity > 1 ? (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveItem(groupedItem.items[0]);
                          }}
                          className="flex items-center justify-center px-1.5 py-1.5 bg-gradient-to-r from-orange-100 to-orange-200 hover:from-orange-200 hover:to-orange-300 hover:shadow-md hover:scale-105 text-orange-700 hover:text-orange-800 font-medium rounded-lg text-xs transition-all duration-200 flex-1 min-w-0 transform"
                        >
                          <svg className="w-2.5 h-2.5 mr-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                          <span className="truncate">-1</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            groupedItem.items.forEach(item => handleRemoveItem(item));
                          }}
                          className="flex items-center justify-center px-1.5 py-1.5 bg-gradient-to-r from-red-100 to-red-200 hover:from-red-200 hover:to-red-300 hover:shadow-md hover:scale-105 text-red-700 hover:text-red-800 font-medium rounded-lg text-xs transition-all duration-200 flex-1 min-w-0 transform"
                        >
                          <svg className="w-2.5 h-2.5 mr-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span className="truncate">All</span>
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveItem(groupedItem.items[0]);
                        }}
                        className="flex items-center justify-center px-1.5 py-1.5 bg-gradient-to-r from-red-100 to-red-200 hover:from-red-200 hover:to-red-300 hover:shadow-md hover:scale-105 text-red-700 hover:text-red-800 font-medium rounded-lg text-xs transition-all duration-200 flex-1 min-w-0 transform"
                      >
                        <svg className="w-2.5 h-2.5 mr-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span className="truncate">Remove</span>
                      </button>
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
