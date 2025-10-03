import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useMealPlan } from '../contexts/MealPlanContext';
import { useToast } from '../contexts/ToastContext';
import { usePlanning } from '../contexts/PlanningContext';
import { DAYS_OF_WEEK } from '../utils/filteringAlgorithms';
import { unifiedRestaurants } from '../data/unifiedRestaurants';
import ItemDetailsModal from '../components/restaurant/ItemDetailsModal';

const DayMealPlanPage = () => {
  const { day } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const week = parseInt(searchParams.get('week')) || 0; // Default to current week
  const { getWeekMealItems, removeItemFromPlanWeek } = useMealPlan();
  const { showMealPlanSuccess } = useToast();
  const { postalCode } = usePlanning();
  const [selectedMealType, setSelectedMealType] = useState('lunch');
  
  // State for item details modal
  const [selectedDetailItem, setSelectedDetailItem] = useState(null);
  const [showItemDetails, setShowItemDetails] = useState(false);

  const dayName = DAYS_OF_WEEK.find(d => d.id === day)?.name || day;
  const lunchItems = getWeekMealItems(day, 'lunch', week);
  const dinnerItems = getWeekMealItems(day, 'dinner', week);
  const currentMealItems = selectedMealType === 'lunch' ? lunchItems : dinnerItems;

  // Group items by ID to show quantities
  const groupedItems = currentMealItems.reduce((acc, item) => {
    const existingGroup = acc.find(group => group.id === item.id);
    if (existingGroup) {
      existingGroup.quantity += 1;
      existingGroup.items.push(item);
      existingGroup.totalPrice += parseFloat(item.price);
    } else {
      acc.push({
        ...item,
        quantity: 1,
        items: [item],
        totalPrice: parseFloat(item.price)
      });
    }
    return acc;
  }, []);

  const handleRemoveItem = (item) => {
    removeItemFromPlanWeek(item.planId, day, selectedMealType, week);
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
    // Get restaurant info from current meal items to navigate directly to that restaurant
    const allDayItems = [...lunchItems, ...dinnerItems];
    
    if (allDayItems.length > 0) {
      // Get the first restaurant from the meal items
      const restaurantName = allDayItems[0].restaurantName;
      
      // Find the restaurant ID from the unified restaurants data
      const restaurant = unifiedRestaurants.find(r => r.name === restaurantName);
      
      if (restaurant) {
        // Navigate directly to the restaurant page with meal planning context
        navigate(`/restaurant/${restaurant.id}?day=${day}&slot=${selectedMealType}&week=${week}&userType=normal&source=weekly-menu`);
        return;
      }
    }
    
    // Fallback: Navigate to restaurant selection if no restaurant found
    const postalParam = postalCode ? `&postal=${postalCode}` : '';
    navigate(`/plan/restaurants?source=weekly-menu&day=${day}&slot=${selectedMealType}&week=${week}${postalParam}`);
  };

  const handleItemClick = (item) => {
    // Show item details modal instead of navigating
    setSelectedDetailItem(item);
    setShowItemDetails(true);
  };


  const getTotalCost = () => {
    return currentMealItems.reduce((sum, item) => sum + parseFloat(item.price), 0).toFixed(2);
  };

  const getTotalItems = () => {
    return lunchItems.length + dinnerItems.length;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mobile Header */}
          <div className="md:hidden py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg font-bold text-gray-900 truncate">
                    {week === 0 ? 'This Week' : 'Next Week'} • {dayName} Meal Plan
                  </h1>
                  <p className="text-gray-600 text-sm">
                    {getTotalItems()} total items planned
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden md:flex items-center justify-between py-6">
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
                  {week === 0 ? 'This Week' : 'Next Week'} • {dayName} Meal Plan
                </h1>
                <p className="text-gray-600 mt-1">
                  {getTotalItems()} total items planned for this day
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Meal Type Selector */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-8">
          <div className="p-4 md:p-6">
            <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Select Meal Type</h2>
            <div className="flex space-x-3 md:space-x-4">
              <button
                onClick={() => setSelectedMealType('lunch')}
                className={`flex-1 py-2.5 md:py-3 px-3 md:px-6 rounded-lg font-medium transition-colors duration-200 ${
                  selectedMealType === 'lunch'
                    ? 'bg-orange-100 text-orange-800 border-2 border-orange-300'
                    : 'bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center justify-center space-x-1.5 md:space-x-2">
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span className="text-sm md:text-base">Lunch ({lunchItems.length})</span>
                </div>
              </button>
              <button
                onClick={() => setSelectedMealType('dinner')}
                className={`flex-1 py-2.5 md:py-3 px-3 md:px-6 rounded-lg font-medium transition-colors duration-200 ${
                  selectedMealType === 'dinner'
                    ? 'bg-indigo-100 text-indigo-800 border-2 border-indigo-300'
                    : 'bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center justify-center space-x-1.5 md:space-x-2">
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-1.85.63-3.55 1.69-4.9L16.9 18.31C15.55 19.37 13.85 20 12 20z"/>
                  </svg>
                  <span className="text-sm md:text-base">Dinner ({dinnerItems.length})</span>
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
                      {groupedItems.length} unique item{groupedItems.length !== 1 ? 's' : ''} • {currentMealItems.length} total items • ${getTotalCost()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-800">${getTotalCost()}</div>
                    <div className="text-sm text-green-600">{currentMealItems.length} items</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Add More Items Button */}
            <div className="mb-6">
              <button
                onClick={handleAddMoreItems}
                className="w-full bg-grub-red text-white px-4 py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add More {selectedMealType.charAt(0).toUpperCase() + selectedMealType.slice(1)} Items</span>
              </button>
            </div>

            {/* Items List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {groupedItems.map((groupedItem) => (
                <div 
                  key={`${groupedItem.id}-${selectedMealType}`}
                  onClick={() => handleItemClick(groupedItem)}
                  className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-200 flex flex-col h-full cursor-pointer hover:border-grub-red hover:scale-[1.02]"
                >
                  <div className="p-6 flex flex-col flex-1">
                    {/* Quantity Badge */}
                    {groupedItem.quantity > 1 && (
                      <div className="mb-3 flex justify-end">
                        <div className="bg-blue-100 border-2 border-blue-300 rounded-lg px-3 py-1 flex items-center space-x-1">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h4a1 1 0 011 1v2h4a1 1 0 011 1v1a1 1 0 01-1 1v9a2 2 0 01-2 2H8a2 2 0 01-2-2V7a1 1 0 01-1-1V5a1 1 0 011-1h4z" />
                          </svg>
                          <span className="text-blue-700 font-semibold text-sm">
                            Qty: {groupedItem.quantity}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{groupedItem.name}</h3>
                        <button
                          onClick={() => handleItemClick(groupedItem)}
                          className="text-grub-red hover:text-red-600 font-medium text-sm transition-colors duration-200"
                        >
                          {groupedItem.restaurantName} →
                        </button>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-grub-red">
                          ${groupedItem.quantity > 1 ? groupedItem.totalPrice.toFixed(2) : groupedItem.price}
                        </div>
                        {groupedItem.quantity > 1 && (
                          <div className="text-sm text-gray-500">
                            ${groupedItem.price} each
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Preferences - Fixed height container */}
                    <div className="mb-4 min-h-[2.5rem] flex items-start">
                      {groupedItem.preferences && groupedItem.preferences.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {groupedItem.preferences.map(preference => (
                            <span 
                              key={preference}
                              className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium flex items-center space-x-1"
                            >
                              <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="whitespace-nowrap">pref</span>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400 italic">No dietary preferences specified</div>
                      )}
                    </div>

                    {/* Actions - Push to bottom */}
                    <div className="mt-auto space-y-3">
                      {/* View Item Details Button - Full Width */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleItemClick(groupedItem);
                        }}
                        className="w-full bg-blue-500 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>View Item Details</span>
                      </button>

                      {/* Remove Actions */}
                      {groupedItem.quantity > 1 ? (
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveItem(groupedItem.items[0]);
                            }}
                            className="bg-orange-500 text-white py-2.5 px-3 rounded-lg font-medium hover:bg-orange-600 transition-colors duration-200 flex items-center justify-center space-x-1.5 text-sm"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                            <span>Remove 1</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Remove all items of this type
                              groupedItem.items.forEach(item => handleRemoveItem(item));
                            }}
                            className="bg-red-500 text-white py-2.5 px-3 rounded-lg font-medium hover:bg-red-600 transition-colors duration-200 flex items-center justify-center space-x-1.5 text-sm"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span>Remove All</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveItem(groupedItem.items[0]);
                          }}
                          className="w-full bg-red-500 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-red-600 transition-colors duration-200 flex items-center justify-center space-x-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span>Remove</span>
                        </button>
                      )}
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
              No {selectedMealType.charAt(0).toUpperCase() + selectedMealType.slice(1)} Items Yet
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
      
      {/* Item Details Modal */}
      <ItemDetailsModal 
        isOpen={showItemDetails}
        item={selectedDetailItem}
        userType="normal"
        isFromMenuSelection={false}
        hideAddButton={true}
        isMealPlanningEnabled={false}
        onClose={() => {
          setShowItemDetails(false);
          setSelectedDetailItem(null);
        }}
        onAddToPlan={(item) => {
          // Handle adding item to plan from modal if needed
          setShowItemDetails(false);
          setSelectedDetailItem(null);
        }}
      />
    </div>
  )
};

export default DayMealPlanPage;
