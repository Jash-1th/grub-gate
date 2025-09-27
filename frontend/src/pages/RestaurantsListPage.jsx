import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { restaurantData } from '../data/restaurantData';
import { getFoodItemsByRestaurant } from '../data/foodItemsData';
import { DAYS_OF_WEEK } from '../utils/filteringAlgorithms';
import { useMealPlan } from '../contexts/MealPlanContext';
import { useToast } from '../contexts/ToastContext';
import { useFilterState } from '../hooks/useFilterState';
import { foodPreferences, filterRestaurantsData } from '../utils/filteringHelpers';
import FoodItemCard from '../components/restaurant/FoodItemCard';
import PreferencesFilterModal from '../components/restaurant/PreferencesFilterModal';
import DaysFilterModal from '../components/restaurant/DaysFilterModal';
import FilterSection from '../components/shared/FilterSection';
import StickyFilterBar from '../components/shared/StickyFilterBar';

const RestaurantsListPage = () => {
  const navigate = useNavigate();
  const { addItemToPlan } = useMealPlan();
  const { showMealPlanSuccess } = useToast();

  // Use shared filter state hook
  const {
    isClient,
    selectedDay,
    selectedMealType,
    selectedPreferences,
    showPreferencesFilter,
    showDaysFilter,
    showMealDropdown,
    showStickyMealDropdown,
    showStickyFilter,
    itemsContainerRef,
    filterSectionRef,
    setSelectedDay,
    setShowPreferencesFilter,
    setShowDaysFilter,
    setShowStickyMealDropdown,
    handleMealTypeChange,
    handleStickyMealTypeChange,
    handleCompactMealTypeChange,
    handlePreferencesFilterApply,
    handleDaysFilterApply,
    handlePreferenceClick
  } = useFilterState();

  // Get day name
  const dayName = DAYS_OF_WEEK.find(d => d.id === selectedDay)?.name || selectedDay;

  // Get all restaurants with their food items for the selected day
  const restaurantsWithItems = useMemo(() => {
    if (!isClient) return [];
    return filterRestaurantsData(
      restaurantData,
      getFoodItemsByRestaurant,
      selectedDay,
      selectedMealType,
      selectedPreferences
    );
  }, [selectedDay, selectedMealType, selectedPreferences, isClient]);

  // Get day filtered items for the first restaurant (for meal availability)
  const dayFilteredItems = useMemo(() => {
    if (!isClient || restaurantsWithItems.length === 0) return { availableMeals: [] };
    return restaurantsWithItems[0].dayFilteredItems;
  }, [restaurantsWithItems, isClient]);

  // Get all available items for scroll target
  const allAvailableItems = useMemo(() => {
    return restaurantsWithItems.reduce((acc, restaurant) => {
      return acc.concat(restaurant.availableItems);
    }, []);
  }, [restaurantsWithItems]);

  // Handle adding item to meal plan
  const handleAddToPlan = (item, restaurantName) => {
    addItemToPlan(item, selectedDay, selectedMealType, restaurantName);
    showMealPlanSuccess(item.name, selectedDay, selectedMealType, restaurantName, item.price);
  };

  const getTotalAvailableItems = () => {
    return restaurantsWithItems.reduce((sum, restaurant) => sum + restaurant.availableItems.length, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                  Restaurants for {dayName}
                </h1>
                <p className="text-gray-600 mt-1">
                  {getTotalAvailableItems()} {selectedMealType} items available from {restaurantsWithItems.length} restaurants
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Filter Bar */}
      <StickyFilterBar
        isVisible={showStickyFilter}
        selectedMealType={selectedMealType}
        selectedDay={selectedDay}
        selectedPreferences={selectedPreferences}
        dayFilteredItems={dayFilteredItems}
        displayItems={allAvailableItems}
        showStickyMealDropdown={showStickyMealDropdown}
        onToggleMealDropdown={() => setShowStickyMealDropdown(!showStickyMealDropdown)}
        onMealTypeChange={handleStickyMealTypeChange}
        onShowPreferencesFilter={() => setShowPreferencesFilter(true)}
        onShowDaysFilter={() => setShowDaysFilter(true)}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters Section */}
        <div ref={filterSectionRef}>
          <FilterSection
            selectedMealType={selectedMealType}
            selectedPreferences={selectedPreferences}
            showMealDropdown={showMealDropdown}
            dayFilteredItems={dayFilteredItems}
            onMealTypeChange={handleCompactMealTypeChange}
            onToggleMealDropdown={() => setShowMealDropdown(!showMealDropdown)}
            onShowPreferencesFilter={() => setShowPreferencesFilter(true)}
            onShowDaysFilter={() => setShowDaysFilter(true)}
            showDaysFilter={true}
            className="mb-8"
          />
        </div>

        {/* Restaurants List */}
        <div>
          <div ref={itemsContainerRef}></div>
          {restaurantsWithItems.length > 0 ? (
            <div className="space-y-8">
              {restaurantsWithItems.map((restaurant) => (
              <div key={restaurant.id} className="bg-white rounded-xl shadow-lg border border-gray-200">
                {/* Restaurant Header */}
                <div className="p-4 md:p-6 border-b border-gray-200 bg-gray-50 rounded-t-xl">
                  {/* Mobile Layout */}
                  <div className="md:hidden">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-grub-red rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-lg">
                            {restaurant.name.charAt(0)}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h2 className="text-lg font-bold text-gray-900 truncate">{restaurant.name}</h2>
                          <p className="text-gray-600 text-sm">
                            {restaurant.availableItems.length} items for {selectedMealType}
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/restaurant/${restaurant.id}?day=${selectedDay}&meal=${selectedMealType}`)}
                      className="w-full bg-grub-red text-white px-4 py-2.5 rounded-lg font-medium hover:bg-red-600 transition-colors duration-200 text-sm"
                    >
                      View Details
                    </button>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden md:flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-grub-red rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xl">
                          {restaurant.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">{restaurant.name}</h2>
                        <p className="text-gray-600 mt-1">
                          {restaurant.availableItems.length} items available for {selectedMealType}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/restaurant/${restaurant.id}?day=${selectedDay}&meal=${selectedMealType}`)}
                      className="bg-grub-red text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors duration-200"
                    >
                      View Details
                    </button>
                  </div>
                </div>

                {/* Restaurant Items */}
                <div className="p-4 md:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {restaurant.availableItems.map((item) => (
                      <FoodItemCard 
                        key={item.id} 
                        item={item} 
                        onAddToPlan={(item) => handleAddToPlan(item, restaurant.name)}
                        selectedDay={selectedDay}
                        selectedMealType={selectedMealType}
                        restaurantName={restaurant.name}
                      />
                    ))}
                  </div>
                </div>
              </div>
              ))}
            </div>
          ) : (
          /* No Results */
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-600 mb-6">
              No {selectedMealType} items available for {dayName} with your current filters.
            </p>
            <button
              onClick={() => setSelectedPreferences([])}
              className="bg-grub-red text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors duration-200"
            >
              Clear Filters
            </button>
          </div>
        )}
        </div>
      </div>

      {/* Preferences Filter Modal */}
      <PreferencesFilterModal
        isOpen={showPreferencesFilter}
        onClose={() => setShowPreferencesFilter(false)}
        preferences={foodPreferences}
        selectedPreferences={selectedPreferences}
        onPreferenceClick={handlePreferenceClick}
        onApply={handlePreferencesFilterApply}
      />

      {/* Days Filter Modal */}
      <DaysFilterModal
        isOpen={showDaysFilter}
        onClose={() => setShowDaysFilter(false)}
        selectedDay={selectedDay}
        setSelectedDay={setSelectedDay}
        selectedMealType={selectedMealType}
        dayFilteredItems={dayFilteredItems}
        onApply={handleDaysFilterApply}
      />


      <div className="fixed bottom-20 right-4 z-[60] md:hidden">
        <button
          onClick={() => {
            navigate('/plan');
            // Scroll to the weekly menu section after navigation
            setTimeout(() => {
              const element = document.getElementById('weekly-menu-section');
              if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }, 300);
          }}
          className="group bg-gradient-to-r from-grub-red to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center space-x-2"
        >
          <span className="font-semibold text-sm whitespace-nowrap">Next Step</span>
          <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center group-hover:bg-opacity-30 transition-all duration-300">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>
      </div>

      {/* Desktop Next Step Button */}
      <div className="hidden md:block fixed bottom-6 right-6 z-50">
        <button
          onClick={() => {
            navigate('/plan');
            // Scroll to the weekly menu section after navigation
            setTimeout(() => {
              const element = document.getElementById('weekly-menu-section');
              if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }, 300);
          }}
          className="group bg-gradient-to-r from-grub-red to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center space-x-3"
        >
          <span className="font-semibold text-sm whitespace-nowrap">Next Step</span>
          <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center group-hover:bg-opacity-30 transition-all duration-300">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>
      </div>
    </div>
  );
};

export default RestaurantsListPage;
