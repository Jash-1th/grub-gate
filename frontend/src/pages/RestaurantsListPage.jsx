import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { restaurantData } from '../data/restaurantData';
import { getFoodItemsByRestaurant } from '../data/foodItemsData';
import { 
  DAYS_OF_WEEK, 
  getCurrentDay,
  filterItemsByDay,
  isMealAvailable 
} from '../utils/filteringAlgorithms';
import { useMealPlan } from '../contexts/MealPlanContext';
import { useToast } from '../contexts/ToastContext';
import FoodItemCard from '../components/restaurant/FoodItemCard';
import PreferencesFilterModal from '../components/restaurant/PreferencesFilterModal';

// Food preference options
const foodPreferences = [
  { id: 'vegetarian', name: 'Vegetarian', icon: '🥬' },
  { id: 'vegan', name: 'Vegan', icon: '🌱' },
  { id: 'gluten-free', name: 'Gluten Free', icon: '🌾' },
  { id: 'dairy-free', name: 'Dairy Free', icon: '🥛' },
  { id: 'keto', name: 'Keto', icon: '🥑' },
  { id: 'halal', name: 'Halal', icon: '☪️' },
  { id: 'kosher', name: 'Kosher', icon: '✡️' },
];

const RestaurantsListPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addItemToPlan } = useMealPlan();
  const { showMealPlanSuccess } = useToast();

  // Get URL parameters
  const selectedDay = searchParams.get('day') || getCurrentDay();
  const selectedMealFromUrl = searchParams.get('meal') || 'lunch';

  // State
  const [selectedMealType, setSelectedMealType] = useState(selectedMealFromUrl);
  const [selectedPreferences, setSelectedPreferences] = useState([]);
  const [showPreferencesFilter, setShowPreferencesFilter] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Get day name
  const dayName = DAYS_OF_WEEK.find(d => d.id === selectedDay)?.name || selectedDay;

  // Get all restaurants with their food items for the selected day
  const restaurantsWithItems = useMemo(() => {
    if (!isClient) return [];

    return restaurantData.map(restaurant => {
      const foodItems = getFoodItemsByRestaurant(restaurant.id);
      const dayFilteredItems = filterItemsByDay(foodItems, selectedDay);
      const mealItems = dayFilteredItems[selectedMealType] || [];

      // Apply preference filtering if any preferences are selected
      let filteredItems = mealItems;
      if (selectedPreferences.length > 0) {
        filteredItems = mealItems.filter(item => 
          selectedPreferences.some(preference => 
            item.preferences.includes(preference)
          )
        );
      }

      return {
        ...restaurant,
        availableItems: filteredItems,
        totalItems: mealItems.length
      };
    }).filter(restaurant => restaurant.availableItems.length > 0); // Only show restaurants with available items
  }, [selectedDay, selectedMealType, selectedPreferences, isClient]);

  // Handle adding item to meal plan
  const handleAddToPlan = (item, restaurantName) => {
    addItemToPlan(item, selectedDay, selectedMealType, restaurantName);
    showMealPlanSuccess(item.name, selectedDay, selectedMealType, restaurantName, item.price);
  };

  // Handle preference selection
  const handlePreferenceClick = (preferenceId) => {
    setSelectedPreferences(prev => {
      return prev.includes(preferenceId)
        ? prev.filter(id => id !== preferenceId)
        : [...prev, preferenceId];
    });
  };

  const handleApplyPreferences = (preferences) => {
    setSelectedPreferences(preferences);
    setShowPreferencesFilter(false);
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-8">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
            
            {/* Desktop Filters */}
            <div className="hidden md:block">
              <div className="grid grid-cols-2 gap-4">
                {/* Meal Type Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Meal Type</label>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedMealType('lunch')}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors duration-200 ${
                        selectedMealType === 'lunch'
                          ? 'bg-orange-100 text-orange-800 border-2 border-orange-300'
                          : 'bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      Lunch
                    </button>
                    <button
                      onClick={() => setSelectedMealType('dinner')}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors duration-200 ${
                        selectedMealType === 'dinner'
                          ? 'bg-indigo-100 text-indigo-800 border-2 border-indigo-300'
                          : 'bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      Dinner
                    </button>
                  </div>
                </div>

                {/* Preferences Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Food Preferences</label>
                  <button
                    onClick={() => setShowPreferencesFilter(true)}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2 px-4 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Food Preferences</span>
                    {selectedPreferences.length > 0 && (
                      <div className="bg-orange-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center border-2 border-white">
                        {selectedPreferences.length}
                      </div>
                    )}
                  </button>
                  {selectedPreferences.length > 0 && (
                    <div className="mt-2 text-sm text-green-700">
                      {selectedPreferences.length} preference{selectedPreferences.length !== 1 ? 's' : ''} selected
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Filters */}
            <div className="md:hidden space-y-4">
              {/* Meal Type Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meal Type</label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedMealType('lunch')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors duration-200 ${
                      selectedMealType === 'lunch'
                        ? 'bg-orange-100 text-orange-800 border-2 border-orange-300'
                        : 'bg-gray-100 text-gray-700 border-2 border-gray-200'
                    }`}
                  >
                    Lunch
                  </button>
                  <button
                    onClick={() => setSelectedMealType('dinner')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors duration-200 ${
                      selectedMealType === 'dinner'
                        ? 'bg-indigo-100 text-indigo-800 border-2 border-indigo-300'
                        : 'bg-gray-100 text-gray-700 border-2 border-gray-200'
                    }`}
                  >
                    Dinner
                  </button>
                </div>
              </div>

              {/* Preferences Filter */}
              <button
                onClick={() => setShowPreferencesFilter(true)}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-4 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Food Preferences</span>
                {selectedPreferences.length > 0 && (
                  <div className="bg-orange-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center border-2 border-white">
                    {selectedPreferences.length}
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Restaurants List */}
        {restaurantsWithItems.length > 0 ? (
          <div className="space-y-8">
            {restaurantsWithItems.map((restaurant) => (
              <div key={restaurant.id} className="bg-white rounded-xl shadow-lg border border-gray-200">
                {/* Restaurant Header */}
                <div className="p-6 border-b border-gray-200 bg-gray-50 rounded-t-xl">
                  <div className="flex items-center justify-between">
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
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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

      {/* Preferences Filter Modal */}
      <PreferencesFilterModal
        isOpen={showPreferencesFilter}
        onClose={() => setShowPreferencesFilter(false)}
        preferences={foodPreferences}
        selectedPreferences={selectedPreferences}
        onPreferenceClick={handlePreferenceClick}
        onApply={handleApplyPreferences}
      />
    </div>
  );
};

export default RestaurantsListPage;
