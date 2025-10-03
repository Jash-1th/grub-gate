import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMealPlan } from '../contexts/MealPlanContext';
import { useToast } from '../contexts/ToastContext';
import { usePlanning } from '../contexts/PlanningContext';
import { unifiedRestaurants } from '../data/unifiedRestaurants';
import RestaurantSwitchModal from '../components/modals/RestaurantSwitchModal';
import RestaurantSelectionModal from '../components/modals/RestaurantSelectionModal';

// Enhanced Meal Slot Component with more features
const EnhancedMealSlot = ({ day, mealType, actualMealItems, onRemoveItem, postalCode, selectedRestaurant, selectedWeek = 0, onShowRestaurantSelectionModal }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const hasItems = actualMealItems && actualMealItems.length > 0;
  const firstItem = hasItems ? actualMealItems[0] : null;
  const additionalCount = hasItems ? actualMealItems.length - 1 : 0;

  const handleSlotClick = () => {
    if (hasItems) {
      navigate(`/meal-plan/${day}?week=${selectedWeek}`);
    } else if (selectedRestaurant) {
      // Navigate to selected restaurant with day, slot, and week context
      navigate(`/restaurant/${selectedRestaurant.id}?day=${day}&slot=${mealType}&week=${selectedWeek}&userType=normal&source=weekly-menu`);
    } else {
      // Show restaurant selection modal instead of direct navigation
      onShowRestaurantSelectionModal(day, mealType);
    }
  };

  const handleRemoveItem = (e, planId) => {
    e.stopPropagation();
    onRemoveItem(planId, day, mealType);
  };

  return (
    <div 
      onClick={handleSlotClick}
      className={`
        group relative p-2 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all duration-300 cursor-pointer min-h-[80px] sm:min-h-[120px] flex flex-col justify-center transform hover:scale-[1.02] hover:-translate-y-1 touch-manipulation
        ${hasItems 
          ? 'border-grub-red bg-gradient-to-br from-red-50 to-orange-50 shadow-md sm:shadow-lg hover:shadow-lg sm:hover:shadow-2xl hover:border-red-400' 
          : 'border-gray-200 bg-gradient-to-br from-white to-gray-50 hover:border-grub-red/60 hover:shadow-md sm:hover:shadow-lg hover:from-red-50/30 hover:to-orange-50/30'
        }
      `}
    >
      {/* Gradient overlay for hover effect */}
      <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
        hasItems 
          ? 'bg-gradient-to-br from-red-100/50 to-orange-100/50' 
          : 'bg-gradient-to-br from-red-50/30 to-orange-50/30'
      }`}></div>
      
      <div className="relative z-10">
        {hasItems ? (
          <div className="space-y-1 sm:space-y-2">
            <div className="flex items-center justify-between mb-1 sm:mb-3">
              <div className="font-semibold text-grub-red truncate group-hover:text-red-700 transition-colors duration-200 text-xs sm:text-sm">
                {firstItem.restaurantName}
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2">
                {actualMealItems.length > 1 && (
                  <div className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-semibold shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-200">
                    {actualMealItems.length}x
                  </div>
                )}
                <button
                  onClick={(e) => handleRemoveItem(e, firstItem.planId)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-0.5 sm:p-1 rounded-full bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-700 touch-manipulation"
                >
                  <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="text-gray-700 truncate group-hover:text-gray-800 transition-colors duration-200 font-medium text-xs sm:text-sm">
              {firstItem.name}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="font-bold text-grub-red group-hover:text-red-700 transition-colors duration-200 text-sm sm:text-base">
                ${firstItem.price}
              </div>
              {firstItem.preferences && firstItem.preferences.length > 0 && (
                <div className="hidden sm:flex space-x-1">
                  {firstItem.preferences.slice(0, 2).map((pref, index) => (
                    <span key={index} className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      {pref}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            {additionalCount > 0 && (
              <div className="text-xs text-gray-500 mt-1 sm:mt-2 group-hover:text-gray-600 transition-colors duration-200">
                +{additionalCount} more
              </div>
            )}
            
            <div className="hidden sm:flex text-xs text-grub-red/70 mt-3 font-medium group-hover:text-red-600 transition-colors duration-200 items-center">
              <span>View details</span>
              <svg className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-1 sm:space-y-3">
            <div className="w-6 h-6 sm:w-10 sm:h-10 mx-auto bg-gray-100 group-hover:bg-red-100 rounded-full flex items-center justify-center transition-colors duration-200">
              <svg className="w-3 h-3 sm:w-5 sm:h-5 text-gray-400 group-hover:text-red-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div className="text-xs sm:text-sm text-gray-500 group-hover:text-gray-600 transition-colors duration-200">
              Add {mealType}
            </div>
            <div className="hidden sm:flex text-xs text-grub-red/70 font-medium group-hover:text-red-600 transition-colors duration-200 items-center justify-center">
              <span>{selectedRestaurant ? `From ${selectedRestaurant.name}` : 'Browse restaurants'}</span>
              <svg className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const WeeklyMenuPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { 
    mealPlan, 
    removeItemFromPlan, 
    getTotalItemsCount, 
    getWeeklyPlanSummary, 
    clearAllPlan, 
    getRestaurantsInPlan,
    // Week-specific functions
    getWeekPlan,
    getWeekMealItems,
    getWeekTotalItems,
    getWeekTotalCost,
    removeItemFromPlanWeek,
    getRestaurantsInWeekPlan,
    getRestaurantsInAllWeeks,
    clearWeek
  } = useMealPlan();
  const { showToast } = useToast();
  const { postalCode } = usePlanning();
  const [isClient, setIsClient] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(0); // 0 = current week, 1 = next week, etc.
  
  // Restaurant switch modal state
  const [showRestaurantSwitchModal, setShowRestaurantSwitchModal] = useState(false);
  const [switchModalData, setSwitchModalData] = useState(null);
  
  // Restaurant selection modal state
  const [showRestaurantSelectionModal, setShowRestaurantSelectionModal] = useState(false);
  const [selectionModalData, setSelectionModalData] = useState(null);
  
  // Get restaurant info from URL parameters or detect from week's meal plan
  const urlRestaurantId = searchParams.get('restaurantId');
  const urlRestaurantName = searchParams.get('restaurantName');
  
  // Get restaurants in the selected week's meal plan
  const weekRestaurants = getRestaurantsInWeekPlan(selectedWeek);
  
  // Get restaurants from ALL weeks (for normal users who can only select one restaurant)
  const allWeeksRestaurants = getRestaurantsInAllWeeks();
  
  // Determine selected restaurant: URL parameter takes priority, then detect from meal plan
  const selectedRestaurant = useMemo(() => {
    // If URL has restaurant info, use that
    if (urlRestaurantId) {
      return unifiedRestaurants.find(r => r.id === parseInt(urlRestaurantId));
    }
    
    // For normal users: if there's exactly one restaurant across ALL weeks, show that restaurant for both weeks
    // This ensures consistency - if user has items from Restaurant A in Week 1, Week 2 should also show Restaurant A
    if (allWeeksRestaurants.length === 1) {
      return unifiedRestaurants.find(r => r.name === allWeeksRestaurants[0]);
    }
    
    // Fallback: if there's exactly one restaurant in the current week's meal plan, use that
    if (weekRestaurants.length === 1) {
      return unifiedRestaurants.find(r => r.name === weekRestaurants[0]);
    }
    
    // No restaurant selected
    return null;
  }, [urlRestaurantId, allWeeksRestaurants, weekRestaurants, selectedWeek]);

  const selectedRestaurantId = selectedRestaurant?.id;
  const selectedRestaurantName = selectedRestaurant?.name;

  // Get current restaurants in meal plan
  const currentRestaurants = getRestaurantsInPlan();

  // Helper functions for date ranges (SSR-safe)
  const getWeekDateRange = (weekOffset = 0) => {
    if (!isClient) return ''; // Prevent SSR hydration mismatch
    
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + (weekOffset * 7)); // Sunday + week offset
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday
    
    return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  const getCurrentWeekDateRange = () => getWeekDateRange(0);
  const getNextWeekDateRange = () => getWeekDateRange(1);

  // Get specific day date for a week (SSR-safe)
  const getDayDateForWeek = (dayIndex, weekOffset = 0) => {
    if (!isClient) return ''; // Prevent SSR hydration mismatch
    
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + (weekOffset * 7)); // Sunday + week offset
    const targetDay = new Date(startOfWeek);
    targetDay.setDate(startOfWeek.getDate() + dayIndex); // Add day index (0=Sunday, 1=Monday, etc.)
    
    return targetDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleRemoveItem = (planId, day, mealType) => {
    removeItemFromPlanWeek(planId, day, mealType, selectedWeek);
    showToast('Item removed from meal plan', 'success');
  };

  const handleClearAll = () => {
    if (window.confirm(`Are you sure you want to clear your entire ${selectedWeek === 0 ? 'current week' : 'next week'} meal plan?`)) {
      clearAllPlan();
      showToast('Meal plan cleared', 'success');
    }
  };

  const handleSelectOtherRestaurant = () => {
    // Normal users can only select ONE restaurant for BOTH weeks
    // Check for restaurants across ALL weeks, not just current week
    const allWeeksRestaurants = getRestaurantsInAllWeeks();
    const totalItemsAllWeeks = getWeekTotalItems(0) + getWeekTotalItems(1); // Both weeks
    
    // If there are items from any restaurant in any week, show confirmation modal
    if (allWeeksRestaurants.length > 0 && totalItemsAllWeeks > 0) {
      setSwitchModalData({
        existingRestaurant: allWeeksRestaurants[0], // Show first restaurant
        newRestaurant: 'Browse Restaurants',
        itemCount: totalItemsAllWeeks // Total items across both weeks
      });
      setShowRestaurantSwitchModal(true);
    } else {
      // No items in any week, navigate directly to restaurant selection
      const postalParam = postalCode ? `&postal=${postalCode}` : '';
      navigate(`/plan/restaurants?source=plan${postalParam}`);
    }
  };

  const handleConfirmRestaurantSwitch = () => {
    // Clear BOTH weeks' meal plans (since normal users can only have one restaurant for both weeks)
    clearWeek(0); // Clear current week
    clearWeek(1); // Clear next week
    
    // Close modal
    setShowRestaurantSwitchModal(false);
    setSwitchModalData(null);
    
    // Navigate to restaurant selection
    const postalParam = postalCode ? `&postal=${postalCode}` : '';
    navigate(`/plan/restaurants?source=plan${postalParam}`);
    
    // Show success message
    showToast('Both weeks cleared. Select a new restaurant for bi-weekly planning!', 'success');
  };

  const handleCloseRestaurantSwitchModal = () => {
    setShowRestaurantSwitchModal(false);
    setSwitchModalData(null);
  };

  const handleShowRestaurantSelectionModal = (day, mealType) => {
    setSelectionModalData({ day, mealType, week: selectedWeek });
    setShowRestaurantSelectionModal(true);
  };

  const handleConfirmRestaurantSelection = () => {
    // Close modal
    setShowRestaurantSelectionModal(false);
    setSelectionModalData(null);
    
    // Navigate to general restaurant selection (like after entering pincode)
    // No day/slot context - user is starting fresh to select a restaurant
    const postalParam = postalCode ? `&postal=${postalCode}` : '';
    navigate(`/plan/restaurants?source=plan${postalParam}`);
  };

  const handleCloseRestaurantSelectionModal = () => {
    setShowRestaurantSelectionModal(false);
    setSelectionModalData(null);
  };

  // Get week-specific data
  const currentWeekPlan = getWeekPlan(selectedWeek);
  const totalItems = getWeekTotalItems(selectedWeek);
  const totalCost = getWeekTotalCost(selectedWeek);
  const weeklySummary = getWeeklyPlanSummary();

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-12"></div>
            <div className="grid grid-cols-8 gap-4">
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-grub-red to-red-600 text-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2">
                Your Weekly Menu
              </h1>
              <p className="text-red-100 text-sm sm:text-base">
                Plan your perfect week with delicious meals
              </p>
            </div>
            
            <div className="flex justify-center sm:justify-end items-center gap-4 sm:gap-6">
              <div className="text-center">
                <div className="text-xs sm:text-sm text-red-200">Total Items</div>
                <div className="text-lg sm:text-2xl font-bold">{totalItems}</div>
              </div>
              <div className="text-center">
                <div className="text-xs sm:text-sm text-red-200">Estimated Cost</div>
                <div className="text-lg sm:text-2xl font-bold text-yellow-200">${totalCost.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Week Selector */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-center">
            <div className="bg-gray-100 rounded-xl p-1 shadow-inner">
              <div className="flex">
                {/* Current Week Button */}
                <button
                  onClick={() => setSelectedWeek(0)}
                  className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    selectedWeek === 0
                      ? 'bg-white text-grub-red shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">📅</span>
                    <span>This Week</span>
                  </div>
                </button>

                {/* Next Week Button */}
                <button
                  onClick={() => setSelectedWeek(1)}
                  className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    selectedWeek === 1
                      ? 'bg-white text-grub-red shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">📆</span>
                    <span>Next Week</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
          
          {/* Week Date Range Display */}
          <div className="text-center mt-3">
            <p className="text-sm text-gray-600">
              {isClient && (
                selectedWeek === 0 ? (
                  <>
                    <span className="font-medium">Current Week:</span> {getCurrentWeekDateRange()}
                  </>
                ) : (
                  <>
                    <span className="font-medium">Next Week:</span> {getNextWeekDateRange()}
                  </>
                )
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Selected Restaurant Banner */}
      {selectedRestaurant && (
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-grub-red to-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">🍽️</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Planning meals from {selectedRestaurant.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Click any empty slot to add meals from this restaurant • {selectedRestaurant.cuisine} • ⭐ {selectedRestaurant.rating}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => navigate(`/restaurant/${selectedRestaurant.id}?source=menu-browse`)}
                  className="px-4 py-2 bg-grub-red text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  View Full Menu
                </button>
                <button
                  onClick={handleSelectOtherRestaurant}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  Select Other Restaurant
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Current Restaurants Info - Show when there are items in plan */}
      {currentRestaurants.length > 0 && (
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm">🏪</span>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    Current Restaurant{currentRestaurants.length > 1 ? 's' : ''}: {currentRestaurants.join(', ')}
                  </div>
                  <div className="text-xs text-gray-600">
                    {currentRestaurants.length === 1 
                      ? 'Normal users can only select from one restaurant' 
                      : 'Pro users can select from multiple restaurants'
                    }
                  </div>
                </div>
              </div>
              {currentRestaurants.length === 1 && (
                <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                  Normal User
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Quick Actions */}
        {totalItems > 0 && (
          <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={handleClearAll}
              className="flex items-center justify-center px-4 py-3 border border-red-300 text-red-700 font-semibold rounded-xl hover:bg-red-50 transition-colors duration-200 touch-manipulation"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span className="text-sm sm:text-base">Clear All</span>
            </button>
          </div>
        )}

        {/* Weekly Calendar */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-3 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-2">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900">
              {selectedWeek === 0 ? "This Week's Menu" : "Next Week's Menu"}
            </h2>
            <div className="flex items-center justify-center sm:justify-end space-x-2">
              <span className="text-xs sm:text-sm text-gray-500">Week of</span>
              <span className="text-xs sm:text-sm font-semibold text-gray-900">
                {isClient ? getWeekDateRange(selectedWeek) : ''}
              </span>
            </div>
          </div>

          {/* Mobile Layout - Day Cards */}
          <div className="block sm:hidden space-y-4">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, index) => {
              const dayKey = day.toLowerCase();
              const lunchItems = getWeekMealItems(dayKey, 'lunch', selectedWeek);
              const dinnerItems = getWeekMealItems(dayKey, 'dinner', selectedWeek);
              const totalDayItems = lunchItems.length + dinnerItems.length;
              
              return (
                <div key={day} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900">{day}</h3>
                      <p className="text-xs text-gray-600">
                        {isClient ? getDayDateForWeek(index + 1, selectedWeek) : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-grub-red font-semibold">
                        {totalDayItems} meal{totalDayItems !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {/* Lunch */}
                    <div>
                      <div className="flex items-center space-x-1 mb-2">
                        <span className="text-sm">🌅</span>
                        <span className="text-xs font-medium text-yellow-700">Lunch</span>
                      </div>
                      <EnhancedMealSlot 
                        day={dayKey}
                        mealType="lunch"
                        actualMealItems={lunchItems}
                        onRemoveItem={handleRemoveItem}
                        postalCode={postalCode}
                        selectedRestaurant={selectedRestaurant}
                        selectedWeek={selectedWeek}
                        onShowRestaurantSelectionModal={handleShowRestaurantSelectionModal}
                      />
                    </div>
                    
                    {/* Dinner */}
                    <div>
                      <div className="flex items-center space-x-1 mb-2">
                        <span className="text-sm">🌙</span>
                        <span className="text-xs font-medium text-purple-700">Dinner</span>
                      </div>
                      <EnhancedMealSlot 
                        day={dayKey}
                        mealType="dinner"
                        actualMealItems={dinnerItems}
                        onRemoveItem={handleRemoveItem}
                        postalCode={postalCode}
                        selectedRestaurant={selectedRestaurant}
                        selectedWeek={selectedWeek}
                        onShowRestaurantSelectionModal={handleShowRestaurantSelectionModal}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Layout - Grid */}
          <div className="hidden sm:block overflow-x-auto">
            <div className="min-w-[800px]">
              <div className="grid grid-cols-8 gap-3 mb-4">
                {/* Header row */}
                <div className="p-3"></div>
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, index) => {
                  const dayKey = day.toLowerCase();
                  const dayTotalItems = getWeekMealItems(dayKey, 'lunch', selectedWeek).length + getWeekMealItems(dayKey, 'dinner', selectedWeek).length;
                  
                  return (
                    <div key={day} className="p-3 text-center">
                      <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg px-4 py-3 shadow-sm">
                        <div className="text-sm font-bold text-gray-900">{day}</div>
                        <div className="text-xs text-gray-600 font-medium">
                          {isClient ? getDayDateForWeek(index + 1, selectedWeek) : ''}
                        </div>
                        <div className="text-xs text-grub-red font-semibold mt-1">
                          {dayTotalItems} items
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {/* Lunch row */}
                <div className="p-3 flex items-center">
                  <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg px-4 py-3 shadow-sm border border-yellow-200 w-full">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <div className="text-sm font-bold text-yellow-800">Lunch</div>
                    </div>
                  </div>
                </div>
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                  <EnhancedMealSlot 
                    key={`lunch-${day}`}
                    day={day}
                    mealType="lunch"
                    actualMealItems={getWeekMealItems(day, 'lunch', selectedWeek)}
                    onRemoveItem={handleRemoveItem}
                    postalCode={postalCode}
                    selectedRestaurant={selectedRestaurant}
                    selectedWeek={selectedWeek}
                    onShowRestaurantSelectionModal={handleShowRestaurantSelectionModal}
                  />
                ))}
                
                {/* Dinner row */}
                <div className="p-3 flex items-center">
                  <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg px-4 py-3 shadow-sm border border-purple-200 w-full">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                      <div className="text-sm font-bold text-purple-800">Dinner</div>
                    </div>
                  </div>
                </div>
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                  <EnhancedMealSlot 
                    key={`dinner-${day}`}
                    day={day}
                    mealType="dinner"
                    actualMealItems={getWeekMealItems(day, 'dinner', selectedWeek)}
                    onRemoveItem={handleRemoveItem}
                    postalCode={postalCode}
                    selectedRestaurant={selectedRestaurant}
                    selectedWeek={selectedWeek}
                    onShowRestaurantSelectionModal={handleShowRestaurantSelectionModal}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 mt-6 border border-gray-200">
            <div className="flex flex-wrap gap-4 md:gap-6 text-sm text-gray-700">
              <div className="flex items-center gap-3 bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-200">
                <div className="w-4 h-4 bg-gradient-to-br from-red-50 to-orange-50 border-2 border-grub-red rounded-lg shadow-sm"></div>
                <span className="font-medium">Planned Meals</span>
              </div>
              <div className="flex items-center gap-3 bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-200">
                <div className="w-4 h-4 bg-gradient-to-br from-white to-gray-50 border-2 border-gray-300 rounded-lg shadow-sm"></div>
                <span className="font-medium">Available Slots</span>
              </div>
              <div className="flex items-center gap-3 bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-200">
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="font-medium">Hover to remove items</span>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Weekly Summary</h3>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H9z" />
                </svg>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Meals</span>
                <span className="font-semibold text-gray-900">{totalItems}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Estimated Cost</span>
                <span className="font-semibold text-green-600">${totalCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg per Meal</span>
                <span className="font-semibold text-gray-900">
                  ${totalItems > 0 ? (totalCost / totalItems).toFixed(2) : '0.00'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/subscription')}
                className="w-full text-left p-3 rounded-lg bg-gradient-to-r from-grub-red to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border-2 border-red-500 relative overflow-hidden"
              >
                {/* Highlight badge */}
                <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold shadow-md">
                  NEXT STEP
                </div>
                
                {/* Animated background effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                
                <div className="relative z-10">
                  <div className="font-bold text-white flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    Subscribe to Plan
                  </div>
                  <div className="text-sm text-red-100 mt-1">Complete your meal planning journey</div>
                </div>
              </button>
            </div>
          </div>

        </div>
      </div>
      
      {/* Restaurant Switch Modal */}
      <RestaurantSwitchModal
        isOpen={showRestaurantSwitchModal}
        onClose={handleCloseRestaurantSwitchModal}
        onConfirm={handleConfirmRestaurantSwitch}
        existingRestaurant={switchModalData?.existingRestaurant}
        newRestaurant={switchModalData?.newRestaurant}
        itemCount={switchModalData?.itemCount}
      />
      
      {/* Restaurant Selection Modal */}
      <RestaurantSelectionModal
        isOpen={showRestaurantSelectionModal}
        onClose={handleCloseRestaurantSelectionModal}
        onConfirm={handleConfirmRestaurantSelection}
        day={selectionModalData?.day}
        mealType={selectionModalData?.mealType}
        week={selectionModalData?.week}
      />
    </div>
  );
};

export default WeeklyMenuPage;
