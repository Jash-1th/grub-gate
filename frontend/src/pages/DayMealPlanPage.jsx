import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMealPlan } from '../contexts/MealPlanContext';
import { useToast } from '../contexts/ToastContext';
import { DAYS_OF_WEEK } from '../utils/filteringAlgorithms';
import { restaurantData } from '../data/restaurantData';

const DayMealPlanPage = () => {
  const { day } = useParams();
  const navigate = useNavigate();
  const { mealPlan, removeItemFromPlan } = useMealPlan();
  const { showMealPlanSuccess } = useToast();
  const [selectedMealType, setSelectedMealType] = useState('lunch');

  const dayName = DAYS_OF_WEEK.find(d => d.id === day)?.name || day;
  const dayItems = mealPlan[day] || { lunch: [], dinner: [] };
  const currentMealItems = dayItems[selectedMealType] || [];

  const handleRemoveItem = (item) => {
    removeItemFromPlan(item.planId, day, selectedMealType);
    // Show success toast
    showMealPlanSuccess(
      `${item.name} removed from ${selectedMealType}`,
      day,
      selectedMealType,
      item.restaurantName,
      item.price
    );
  };

  const handleAddMoreItems = () => {
    // Navigate to restaurants page with day filter applied
    navigate(`/restaurants?day=${day}&meal=${selectedMealType}`);
  };

  const handleGoToRestaurant = (restaurantName) => {
    // Find restaurant by name and navigate to its detail page
    const restaurant = restaurantData.find(r => r.name === restaurantName);
    if (restaurant) {
      navigate(`/restaurant/${restaurant.id}?day=${day}&meal=${selectedMealType}`);
    }
  };

  const getTotalCost = () => {
    return currentMealItems.reduce((sum, item) => sum + parseFloat(item.price), 0).toFixed(2);
  };

  const getTotalItems = () => {
    return dayItems.lunch.length + dayItems.dinner.length;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {dayName} Meal Plan
                </h1>
                <p className="text-gray-600 mt-1">
                  {getTotalItems()} total items planned for this day
                </p>
              </div>
            </div>
            
            <button
              onClick={handleAddMoreItems}
              className="bg-grub-red text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors duration-200 flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Add More Items</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Meal Type Selector */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-8">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Meal Type</h2>
            <div className="flex space-x-4">
              <button
                onClick={() => setSelectedMealType('lunch')}
                className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors duration-200 ${
                  selectedMealType === 'lunch'
                    ? 'bg-orange-100 text-orange-800 border-2 border-orange-300'
                    : 'bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span>Lunch ({dayItems.lunch.length} items)</span>
                </div>
              </button>
              <button
                onClick={() => setSelectedMealType('dinner')}
                className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors duration-200 ${
                  selectedMealType === 'dinner'
                    ? 'bg-indigo-100 text-indigo-800 border-2 border-indigo-300'
                    : 'bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                  <span>Dinner ({dayItems.dinner.length} items)</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Meal Items */}
        {currentMealItems.length > 0 ? (
          <div className="space-y-6">
            {/* Summary Card */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl shadow-lg border-2 border-green-200">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-green-800">
                      {selectedMealType.charAt(0).toUpperCase() + selectedMealType.slice(1)} Summary
                    </h3>
                    <p className="text-green-700 mt-1">
                      {currentMealItems.length} items planned • Total: ${getTotalCost()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-800">${getTotalCost()}</div>
                    <div className="text-sm text-green-600">{currentMealItems.length} items</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Items List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {currentMealItems.map((item) => (
                <div 
                  key={item.planId}
                  className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-200 flex flex-col h-full"
                >
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.name}</h3>
                        <button
                          onClick={() => handleGoToRestaurant(item.restaurantName)}
                          className="text-grub-red hover:text-red-600 font-medium text-sm transition-colors duration-200"
                        >
                          {item.restaurantName} →
                        </button>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-grub-red">${item.price}</div>
                      </div>
                    </div>

                    {/* Preferences - Fixed height container */}
                    <div className="mb-4 min-h-[2.5rem] flex items-start">
                      {item.preferences && item.preferences.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {item.preferences.map(preference => (
                            <span 
                              key={preference}
                              className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium"
                            >
                              {preference}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400 italic">No dietary preferences specified</div>
                      )}
                    </div>

                    {/* Actions - Push to bottom */}
                    <div className="flex space-x-3 mt-auto">
                      <button
                        onClick={() => handleGoToRestaurant(item.restaurantName)}
                        className="flex-1 bg-blue-100 text-blue-700 py-2 px-4 rounded-lg font-medium hover:bg-blue-200 transition-colors duration-200 flex items-center justify-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>View Restaurant</span>
                      </button>
                      <button
                        onClick={() => handleRemoveItem(item)}
                        className="bg-red-100 text-red-700 py-2 px-4 rounded-lg font-medium hover:bg-red-200 transition-colors duration-200 flex items-center justify-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No {selectedMealType} planned yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start building your {selectedMealType} plan by adding some delicious items.
            </p>
            <button
              onClick={handleAddMoreItems}
              className="bg-grub-red text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors duration-200 inline-flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Add {selectedMealType.charAt(0).toUpperCase() + selectedMealType.slice(1)} Items</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DayMealPlanPage;
