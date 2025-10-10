import React from 'react';
import { useTranslation } from 'react-i18next';
import { useMealPlan } from '../../contexts/MealPlanContext_SSR_FIXED';
import { DAYS_OF_WEEK } from '../../utils/filteringAlgorithms';

const ScheduleDemo = () => {
  const { t } = useTranslation();
  const { mealPlan } = useMealPlan();

  const timeSlots = [
    { id: 'lunch', name: 'Lunch', time: '12:00 PM', icon: '🌅', color: 'yellow' },
    { id: 'dinner', name: 'Dinner', time: '7:00 PM', icon: '🌙', color: 'purple' }
  ];

  const getColorClasses = (color) => {
    const colors = {
      yellow: {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        text: 'text-yellow-800',
        accent: 'bg-yellow-500'
      },
      purple: {
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        text: 'text-purple-800',
        accent: 'bg-purple-500'
      }
    };
    return colors[color] || colors.yellow;
  };

  const getMealPlanForSlot = (dayId, slotId) => {
    const dayPlan = mealPlan[dayId];
    if (!dayPlan || !dayPlan[slotId] || dayPlan[slotId].length === 0) {
      return null;
    }

    const items = dayPlan[slotId];
    if (items.length === 1) {
      return {
        name: items[0].name,
        restaurant: items[0].restaurantName,
        price: items[0].price,
        count: 1
      };
    } else {
      return {
        name: items[0].name,
        restaurant: items[0].restaurantName,
        price: items[0].price,
        count: items.length,
        hasMore: true
      };
    }
  };

  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Your Weekly Meal Schedule
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Visualize your entire week at a glance. Plan ahead and never wonder "what's for dinner?" again.
          </p>
        </div>

        {/* Desktop Schedule */}
        <div className="hidden lg:block bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-8 bg-gray-50 border-b border-gray-200">
            <div className="p-4 font-semibold text-gray-900">Time</div>
            {DAYS_OF_WEEK.map((day) => (
              <div key={day.id} className="p-4 text-center font-semibold text-gray-900">
                {day.name}
              </div>
            ))}
          </div>

          {timeSlots.map((slot) => {
            const colors = getColorClasses(slot.color);
            
            return (
              <div key={slot.id} className="grid grid-cols-8 border-b border-gray-200 last:border-b-0">
                <div className={`p-4 ${colors.bg} ${colors.border} border-r flex items-center space-x-3`}>
                  <span className="text-2xl">{slot.icon}</span>
                  <div>
                    <div className="font-semibold text-gray-900">{slot.name}</div>
                    <div className="text-sm text-gray-600">{slot.time}</div>
                  </div>
                </div>

                {DAYS_OF_WEEK.map((day) => {
                  const mealData = getMealPlanForSlot(day.id, slot.id);
                  
                  return (
                    <div key={`${day.id}-${slot.id}`} className="p-4 border-r border-gray-200 last:border-r-0 min-h-[100px]">
                      {mealData ? (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 h-full">
                          <div className="text-sm font-semibold text-green-800 mb-1 line-clamp-1">
                            {mealData.name}
                          </div>
                          <div className="text-xs text-green-600 mb-2 line-clamp-1">
                            {mealData.restaurant}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-green-700">
                              ${mealData.price}
                            </span>
                            {mealData.hasMore && (
                              <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">
                                +{mealData.count - 1} more
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-3 h-full flex items-center justify-center">
                          <span className="text-gray-400 text-sm">No meal planned</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Mobile Schedule */}
        <div className="lg:hidden space-y-6">
          {DAYS_OF_WEEK.map((day) => (
            <div key={day.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-grub-red text-white p-4">
                <h3 className="text-lg font-semibold">{day.name}</h3>
              </div>
              
              <div className="p-4 space-y-4">
                {timeSlots.map((slot) => {
                  const colors = getColorClasses(slot.color);
                  const mealData = getMealPlanForSlot(day.id, slot.id);
                  
                  return (
                    <div key={slot.id} className={`${colors.bg} ${colors.border} border rounded-lg p-4`}>
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="text-xl">{slot.icon}</span>
                        <div>
                          <div className="font-semibold text-gray-900">{slot.name}</div>
                          <div className="text-sm text-gray-600">{slot.time}</div>
                        </div>
                      </div>
                      
                      {mealData ? (
                        <div className="bg-white border border-gray-200 rounded-lg p-3">
                          <div className="text-sm font-semibold text-gray-800 mb-1">
                            {mealData.name}
                          </div>
                          <div className="text-xs text-gray-600 mb-2">
                            {mealData.restaurant}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-700">
                              ${mealData.price}
                            </span>
                            {mealData.hasMore && (
                              <span className="text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded-full">
                                +{mealData.count - 1} more items
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-3 text-center">
                          <span className="text-gray-400 text-sm">No meal planned</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Legend</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-green-200 border border-green-300 rounded"></div>
              <span className="text-sm text-gray-700">Planned Meal</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-gray-100 border-2 border-dashed border-gray-300 rounded"></div>
              <span className="text-sm text-gray-700">Available Slot</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-blue-200 border border-blue-300 rounded"></div>
              <span className="text-sm text-gray-700">Multiple Items</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleDemo;
