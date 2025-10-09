import React from 'react';
import { useMealPlan } from '../../contexts/MealPlanContext_SSR_FIXED';
import { useToast } from '../../contexts/ToastContext';
import { DAYS_OF_WEEK } from '../../utils/filteringAlgorithms';

const MealPlanSummary = ({ restaurantName }) => {
  const { mealPlan, removeItemFromPlan } = useMealPlan();
  const { showMealPlanSuccess } = useToast();

  // Get all items from this restaurant across all days and meals
  const restaurantItems = React.useMemo(() => {
    const items = [];
    
    DAYS_OF_WEEK.forEach(day => {
      const dayPlan = mealPlan[day.id];
      if (dayPlan) {
        ['lunch', 'dinner'].forEach(mealType => {
          const mealItems = dayPlan[mealType] || [];
          mealItems.forEach(item => {
            if (item.restaurantName === restaurantName) {
              items.push({
                ...item,
                day: day.name,
                dayId: day.id,
                mealType: mealType
              });
            }
          });
        });
      }
    });
    
    return items;
  }, [mealPlan, restaurantName]);

  const totalCost = restaurantItems.reduce((sum, item) => sum + parseFloat(item.price), 0);

  const handleRemoveItem = (item) => {
    removeItemFromPlan(item.planId);
    showMealPlanSuccess(
      `${item.name} removed from ${item.mealType}`,
      item.dayId,
      item.mealType,
      item.restaurantName,
      item.price
    );
  };

  if (restaurantItems.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-purple-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">Your Meal Plan</h3>
            <p className="text-purple-100">
              Items added from {restaurantName}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">${totalCost.toFixed(2)}</div>
            <div className="text-purple-200 text-sm">{restaurantItems.length} items</div>
          </div>
        </div>
      </div>

      {/* Items Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {restaurantItems.map((item) => (
            <div
              key={item.planId}
              className="bg-purple-50 border border-purple-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                    {item.name}
                  </h4>
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <span className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{item.day}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <span>{item.mealType === 'lunch' ? '🌅' : '🌙'}</span>
                      <span className="capitalize">{item.mealType}</span>
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-purple-600">
                    ${item.price}
                  </div>
                </div>
              </div>

              {/* Preferences */}
              {item.dietaryPreferences && item.dietaryPreferences.length > 0 && (
                <div className="mb-3">
                  <div className="flex flex-wrap gap-1">
                    {item.dietaryPreferences.slice(0, 3).map((preference, index) => (
                      <span
                        key={index}
                        className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs"
                      >
                        {preference}
                      </span>
                    ))}
                    {item.dietaryPreferences.length > 3 && (
                      <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">
                        +{item.dietaryPreferences.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Remove Button */}
              <button
                onClick={() => handleRemoveItem(item)}
                className="w-full bg-red-500 text-white py-2 px-3 rounded-lg font-medium hover:bg-red-600 transition-colors duration-200 flex items-center justify-center space-x-2 text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Remove</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MealPlanSummary;
