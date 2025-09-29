import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMealPlan } from '../../contexts/MealPlanContext';
import { DAYS_OF_WEEK } from '../../utils/filteringAlgorithms';

const WeeklyPlanSummary = ({ restaurantId, restaurantName }) => {
  const navigate = useNavigate();
  const { weeklyPlan, removeItemFromPlan } = useMealPlan();

  // Get all items from this restaurant across all days and meals
  const restaurantPlanItems = [];
  DAYS_OF_WEEK.forEach(day => {
    const dayPlan = weeklyPlan[day.id];
    if (dayPlan) {
      // Add lunch items
      dayPlan.lunch.forEach(item => {
        if (item.restaurantName === restaurantName) {
          restaurantPlanItems.push({ ...item, day: day.id, mealType: 'lunch' });
        }
      });
      // Add dinner items
      dayPlan.dinner.forEach(item => {
        if (item.restaurantName === restaurantName) {
          restaurantPlanItems.push({ ...item, day: day.id, mealType: 'dinner' });
        }
      });
    }
  });

  // Group items by day and meal type
  const groupedItems = DAYS_OF_WEEK.reduce((acc, day) => {
    acc[day.id] = {
      lunch: restaurantPlanItems.filter(item => 
        item.day === day.id && item.mealType === 'lunch'
      ),
      dinner: restaurantPlanItems.filter(item => 
        item.day === day.id && item.mealType === 'dinner'
      )
    };
    return acc;
  }, {});

  // Calculate total cost
  const totalCost = restaurantPlanItems.reduce((sum, item) => sum + item.price, 0);
  // Count total items
  const totalItems = restaurantPlanItems.length;

  if (totalItems === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-purple-200">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-purple-100 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-xl font-bold text-purple-900">Weekly Plan</h2>
                <p className="text-purple-700 text-xs sm:text-sm truncate">From {restaurantName}</p>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-xl sm:text-2xl font-bold text-purple-900">0</div>
              <div className="text-purple-700 text-xs sm:text-sm">items</div>
            </div>
          </div>
        </div>

        {/* Empty State */}
        <div className="p-4 sm:p-6 text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-purple-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No items added yet</h3>
          <p className="text-xs sm:text-sm text-gray-600 mb-4">Start building your weekly meal plan by adding items from the menu below.</p>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <button
            onClick={() => navigate('/weekly-menu')}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-2 sm:py-3 px-4 rounded-lg transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl text-sm sm:text-base"
          >
            Continue to Weekly Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-purple-200">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-purple-100 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl font-bold text-purple-900">Weekly Plan</h2>
              <p className="text-purple-700 text-xs sm:text-sm truncate">From {restaurantName}</p>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-xl sm:text-2xl font-bold text-purple-900">{restaurantPlanItems.length}</div>
            <div className="text-purple-700 text-xs sm:text-sm">items</div>
          </div>
        </div>
        
        {totalCost > 0 && (
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-purple-200">
            <div className="flex items-center justify-between">
              <span className="text-purple-800 font-medium text-sm sm:text-base">Total Cost:</span>
              <span className="text-xl sm:text-2xl font-bold text-purple-900">${totalCost.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Weekly Plan Items */}
      <div className="p-4 sm:p-6 max-h-80 sm:max-h-96 overflow-y-auto">
        <div className="space-y-3 sm:space-y-4">
          {DAYS_OF_WEEK.map(day => {
            const dayItems = groupedItems[day.id];
            const hasDayItems = dayItems.lunch.length > 0 || dayItems.dinner.length > 0;
            
            if (!hasDayItems) return null;

            return (
              <div key={day.id} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                <h4 className="font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center text-sm sm:text-base">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                  {day.name}
                </h4>
                
                {/* Lunch Items */}
                {dayItems.lunch.length > 0 && (
                  <div className="mb-3">
                    <div className="text-xs sm:text-sm font-medium text-gray-700 mb-2">🌅 Lunch</div>
                    <div className="space-y-2">
                      {dayItems.lunch.map(item => (
                        <div key={item.planId} className="flex items-center justify-between bg-gray-50 rounded-lg p-2 sm:p-3">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 text-xs sm:text-sm truncate">{item.name}</div>
                            <div className="text-purple-600 font-semibold text-xs sm:text-sm">${item.price.toFixed(2)}</div>
                          </div>
                          <button
                            onClick={() => removeItemFromPlan(item.planId)}
                            className="ml-2 p-1 text-gray-400 hover:text-red-500 transition-colors duration-200 flex-shrink-0"
                          >
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dinner Items */}
                {dayItems.dinner.length > 0 && (
                  <div>
                    <div className="text-xs sm:text-sm font-medium text-gray-700 mb-2">🌙 Dinner</div>
                    <div className="space-y-2">
                      {dayItems.dinner.map(item => (
                        <div key={item.planId} className="flex items-center justify-between bg-gray-50 rounded-lg p-2 sm:p-3">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 text-xs sm:text-sm truncate">{item.name}</div>
                            <div className="text-purple-600 font-semibold text-xs sm:text-sm">${item.price.toFixed(2)}</div>
                          </div>
                          <button
                            onClick={() => removeItemFromPlan(item.planId)}
                            className="ml-2 p-1 text-gray-400 hover:text-red-500 transition-colors duration-200 flex-shrink-0"
                          >
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
        <button
          onClick={() => navigate('/weekly-menu')}
          className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-2 sm:py-3 px-4 rounded-lg transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl text-sm sm:text-base"
        >
          Continue to Weekly Menu
        </button>
      </div>
    </div>
  );
};

export default WeeklyPlanSummary;
