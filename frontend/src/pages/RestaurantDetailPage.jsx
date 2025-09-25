import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { restaurantData } from '../data/restaurantData';
import { getFoodItemsByRestaurant, filterFoodItemsByPreferences, getFoodItemsByCategory } from '../data/foodItemsData';
import { 
  sortItemsByPreferences, 
  groupItemsByPreferenceCategories, 
  DAYS_OF_WEEK, 
  getCurrentDay,
  filterItemsByDay,
  isMealAvailable 
} from '../utils/filteringAlgorithms';
import PreferencesFilterModal from '../components/restaurant/PreferencesFilterModal';
import DaysFilterModal from '../components/restaurant/DaysFilterModal';
import MealPlanSummary from '../components/restaurant/MealPlanSummary';
import FoodItemCard from '../components/restaurant/FoodItemCard';
import { useMealPlan } from '../contexts/MealPlanContext';
import { useToast } from '../contexts/ToastContext';

// Food preference options for sidebar
const foodPreferences = [
  { id: 'vegetarian', name: 'Vegetarian', icon: '🥬' },
  { id: 'vegan', name: 'Vegan', icon: '🌱' },
  { id: 'gluten-free', name: 'Gluten Free', icon: '🌾' },
  { id: 'dairy-free', name: 'Dairy Free', icon: '🥛' },
  { id: 'keto', name: 'Keto', icon: '🥑' },
  { id: 'kosher', name: 'Kosher', icon: '✡️' },
  { id: 'low-carb', name: 'Low Carb', icon: '🥩' },
  { id: 'paleo', name: 'Paleo', icon: '🦴' },
  { id: 'spicy', name: 'Spicy', icon: '🌶️' },
  { id: 'organic', name: 'Organic', icon: '🌿' },
  { id: 'pescatarian', name: 'Pescatarian', icon: '🐟' }
];


const RestaurantDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isClient, setIsClient] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState('lunch');
  const [selectedPreferences, setSelectedPreferences] = useState([]);
  const [selectedDay, setSelectedDay] = useState(getCurrentDay());
  const [showPreferencesFilter, setShowPreferencesFilter] = useState(false);
  const [showDaysFilter, setShowDaysFilter] = useState(false);
  const scrollContainerRef = useRef(null);
  const preferenceRefs = useRef({});
  const itemsContainerRef = useRef(null);
  
  // Meal plan context
  const { addItemToPlan } = useMealPlan();
  
  // Toast context
  const { showMealPlanSuccess } = useToast();

  // Initialize preferences from URL parameters
  useEffect(() => {
    const preferencesParam = searchParams.get('preferences');
    if (preferencesParam) {
      const preferencesArray = preferencesParam.split(',').filter(Boolean);
      setSelectedPreferences(preferencesArray);
    }
  }, [searchParams]);

  // SSR Safety
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Get restaurant data
  const restaurant = useMemo(() => {
    if (!isClient) return null;
    return restaurantData.find(r => r.id === parseInt(id));
  }, [id, isClient]);

  // Get food items
  const foodItems = useMemo(() => {
    if (!isClient || !restaurant) return { lunch: [], dinner: [] };
    return getFoodItemsByRestaurant(restaurant.id);
  }, [restaurant, isClient]);

  // Filter items by selected day and get available meals
  const dayFilteredItems = useMemo(() => {
    if (!isClient) return { lunch: [], dinner: [], availableMeals: [], suggestedMeal: 'lunch' };
    return filterItemsByDay(foodItems, selectedDay);
  }, [foodItems, selectedDay, isClient]);

  // Filter and sort items based on selected preferences, meal type, and day
  const filteredItems = useMemo(() => {
    if (!isClient) return [];
    
    // Get items for selected day and meal type
    const mealItems = dayFilteredItems[selectedMealType] || [];
    
    // Don't apply preference filtering here - we need all items for proper sectioning
    // The sectioning will be done later in preferenceMatchedItems and otherMenuItems
    
    // Sort items using the efficient preference-based algorithm
    return sortItemsByPreferences(mealItems, selectedPreferences);
  }, [dayFilteredItems, selectedMealType, selectedPreferences, isClient]);

  // Group items by preference categories for better organization
  const itemsByPreferenceGroup = useMemo(() => {
    if (!isClient) return { matched: [], popular: [], other: [] };
    return groupItemsByPreferenceCategories(filteredItems, selectedPreferences);
  }, [filteredItems, selectedPreferences, isClient]);

  // Check if any filters are applied
  const hasFiltersApplied = useMemo(() => {
    const isNonCurrentDay = selectedDay !== getCurrentDay();
    const hasPreferences = selectedPreferences.length > 0;
    return isNonCurrentDay || hasPreferences;
  }, [selectedDay, selectedPreferences]);

  // Get filtered items based on current filters
  const displayItems = useMemo(() => {
    if (!isClient) return [];
    
    // Get items for selected day and meal type
    const allMealItems = dayFilteredItems[selectedMealType] || [];
    
    // If no filters applied, show all items
    if (!hasFiltersApplied) {
      return sortItemsByPreferences(allMealItems, selectedPreferences);
    }
    
    // If filters are applied, show only matching items
    let filteredItems = allMealItems;
    
    // Apply preference filtering if preferences are selected
    if (selectedPreferences.length > 0) {
      filteredItems = filteredItems.filter(item => 
        selectedPreferences.some(preference => 
          item.preferences.includes(preference)
        )
      );
    }
    
    // Sort the filtered items
    return sortItemsByPreferences(filteredItems, selectedPreferences);
  }, [dayFilteredItems, selectedMealType, selectedPreferences, isClient, hasFiltersApplied]);

  // Separate items for display sections
  const preferenceMatchedItems = useMemo(() => {
    if (!isClient || selectedPreferences.length === 0) return [];
    return itemsByPreferenceGroup.matched;
  }, [itemsByPreferenceGroup.matched, selectedPreferences, isClient]);

  const otherMenuItems = useMemo(() => {
    // Only show "other items" when no filters are applied
    if (!isClient || hasFiltersApplied) return [];
    
    // When no filters, show all items in "other" section
    return displayItems;
  }, [displayItems, hasFiltersApplied, isClient]);


  // Handle preference selection with smooth scroll
  const handlePreferenceClick = (preferenceId) => {
    setSelectedPreferences(prev => {
      const newPreferences = prev.includes(preferenceId)
        ? prev.filter(id => id !== preferenceId)
        : [...prev, preferenceId];
      
      // Auto-scroll to first item after filter change
      setTimeout(() => {
        if (itemsContainerRef.current) {
          itemsContainerRef.current.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        }
      }, 100);
      
      return newPreferences;
    });
  };

  // Handle day selection
  const handleDaySelection = (dayId) => {
    setSelectedDay(dayId);
    
    // Update meal type based on day availability and current time
    const dayData = filterItemsByDay(foodItems, dayId);
    if (dayData.suggestedMeal && dayData.availableMeals.includes(dayData.suggestedMeal)) {
      setSelectedMealType(dayData.suggestedMeal);
    } else if (dayData.availableMeals.length > 0) {
      setSelectedMealType(dayData.availableMeals[0]);
    }
    
    // Auto-scroll to first item after day change
    setTimeout(() => {
      if (itemsContainerRef.current) {
        itemsContainerRef.current.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  // Handle preferences filter apply
  const handlePreferencesFilterApply = (preferences) => {
    setSelectedPreferences(preferences);
    setShowPreferencesFilter(false);
    // Auto-scroll to first item after applying filters
    setTimeout(() => {
      if (itemsContainerRef.current) {
        itemsContainerRef.current.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    }, 300);
  };

  // Handle days filter apply
  const handleDaysFilterApply = () => {
    setShowDaysFilter(false);
    // Auto-scroll to first item after applying filters
    setTimeout(() => {
      if (itemsContainerRef.current) {
        itemsContainerRef.current.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    }, 300);
  };

  // Handle add to plan
  const handleAddToPlan = (item, restaurantName) => {
    addItemToPlan(item, selectedDay, selectedMealType, restaurantName);
    
    // Show beautiful toast notification
    showMealPlanSuccess(item.name, selectedDay, selectedMealType, restaurantName, item.price);
  };

  // Loading state for SSR
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200"></div>
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="h-96 bg-gray-200 rounded"></div>
              <div className="lg:col-span-3 h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Restaurant not found
  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Restaurant Not Found</h1>
          <button
            onClick={() => navigate('/plan')}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-300"
          >
            Back to Restaurants
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-64 sm:h-80 overflow-hidden">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = '/images/grub-gate-default-img.jpg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
        
        {/* Restaurant Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
          <div className="max-w-7xl mx-auto">
            <button
              onClick={() => navigate('/plan')}
              className="inline-flex items-center text-white/80 hover:text-white mb-4 transition-colors duration-300"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Restaurants
            </button>
            
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              {restaurant.name}
            </h1>
            <p className="text-white/90 text-lg mb-3">
              {restaurant.description}
            </p>
            
            <div className="flex items-center space-x-4 text-white/80">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="font-semibold">{restaurant.rating}</span>
                <span className="ml-1">({restaurant.reviewCount} reviews)</span>
              </div>
              <span>•</span>
              <span>{restaurant.cuisine}</span>
              <span>•</span>
              <span>{restaurant.deliveryTime}</span>
            </div>
          </div>
        </div>
      </section>


      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Desktop Layout */}
        <div className="hidden lg:block">
          {/* Desktop Filter Buttons */}
          <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Preferences Filter Button */}
              <button
                onClick={() => setShowPreferencesFilter(true)}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 px-4 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                <div className="flex items-center justify-center space-x-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-semibold">Food Preferences</span>
                  {/* Badge for active preferences */}
                  {selectedPreferences.length > 0 && (
                    <div className="bg-orange-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center border-2 border-white">
                      {selectedPreferences.length}
                    </div>
                  )}
                </div>
                
                {/* Preferences Summary */}
                {selectedPreferences.length > 0 && (
                  <div className="mt-2 text-sm opacity-90">
                    <span>{selectedPreferences.length} preference{selectedPreferences.length !== 1 ? 's' : ''} selected</span>
                  </div>
                )}
              </button>

              {/* Days Filter Button */}
              <button
                onClick={() => setShowDaysFilter(true)}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-4 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                <div className="flex items-center justify-center space-x-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="font-semibold">Select Day</span>
                  {/* Badge for non-current day */}
                  {selectedDay !== getCurrentDay() && (
                    <div className="bg-orange-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center border-2 border-white">
                      1
                    </div>
                  )}
                </div>
                
                {/* Day Summary */}
                <div className="mt-2 text-sm opacity-90">
                  <span>{DAYS_OF_WEEK.find(d => d.id === selectedDay)?.name}</span>
                  {selectedDay === getCurrentDay() && (
                    <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-600 text-xs rounded-full">
                      Today
                    </span>
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Desktop Content Area */}
          <div data-items-section>
            {/* Meal Type Toggle */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <div className="flex items-center justify-center">
                <div className="bg-gray-100 rounded-lg p-1 flex">
                  {dayFilteredItems.availableMeals.includes('lunch') && (
                    <button
                      onClick={() => setSelectedMealType('lunch')}
                      className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                        selectedMealType === 'lunch'
                          ? 'bg-red-500 text-white shadow-lg'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <span>Lunch</span>
                      </div>
                    </button>
                  )}
                  {dayFilteredItems.availableMeals.includes('dinner') && (
                    <button
                      onClick={() => setSelectedMealType('dinner')}
                      className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                        selectedMealType === 'dinner'
                          ? 'bg-red-500 text-white shadow-lg'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                        <span>Dinner</span>
                      </div>
                    </button>
                  )}
                </div>
              </div>
              
              {/* Meal availability info */}
              {dayFilteredItems.availableMeals.length === 0 && (
                <div className="text-center mt-4">
                  <p className="text-gray-500">No meals available on {DAYS_OF_WEEK.find(d => d.id === selectedDay)?.name}</p>
                </div>
              )}
            </div>

            {/* Desktop Filter Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {selectedMealType.charAt(0).toUpperCase() + selectedMealType.slice(1)} for {DAYS_OF_WEEK.find(d => d.id === selectedDay)?.name}
                      </h3>
                      <p className="text-gray-600 text-sm mt-1">
                        {displayItems.length} items available
                        {selectedPreferences.length > 0 && (
                          <span className="ml-2 text-green-600">• {selectedPreferences.length} preference{selectedPreferences.length !== 1 ? 's' : ''} applied</span>
                        )}
                      </p>
                    </div>
                  </div>
                  {selectedDay === getCurrentDay() && (
                    <span className="px-3 py-1 bg-orange-100 text-orange-600 text-sm rounded-full font-medium">
                      Today
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Meal Plan Summary */}
            <MealPlanSummary restaurantName={restaurant.name} />

            {/* Desktop Menu Items */}
            <div className="space-y-8">
              {/* Filtered Items Section - Show when filters are applied */}
              {hasFiltersApplied && displayItems.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {displayItems.map((item) => (
                        <FoodItemCard 
                          key={item.id} 
                          item={item} 
                          onAddToPlan={handleAddToPlan}
                          selectedDay={selectedDay}
                          selectedMealType={selectedMealType}
                          restaurantName={restaurant.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Other Menu Items Section */}
              {otherMenuItems.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg">
                  <div className="p-6 border-b border-gray-200 bg-gray-50 rounded-t-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                      </div>
                      <h2 className="text-2xl font-bold text-gray-800">
                        {selectedPreferences.length > 0 ? `Other Menu Items (${otherMenuItems.length} items)` : `All Menu Items (${otherMenuItems.length} items)`}
                      </h2>
                    </div>
                    <p className="text-gray-600 mt-2">
                      {selectedPreferences.length > 0 ? 'Additional items available at this restaurant' : 'All available items for this meal'}
                    </p>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {otherMenuItems.map((item) => (
                        <FoodItemCard 
                          key={item.id} 
                          item={item} 
                          onAddToPlan={handleAddToPlan}
                          selectedDay={selectedDay}
                          selectedMealType={selectedMealType}
                          restaurantName={restaurant.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* No Items Found */}
              {displayItems.length === 0 && otherMenuItems.length === 0 && (
                <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No items found</h3>
                  <p className="text-gray-600 mb-6">
                    No {selectedMealType} items available for {DAYS_OF_WEEK.find(d => d.id === selectedDay)?.name}. Try selecting a different day or meal type.
                  </p>
                  <button
                    onClick={() => setSelectedPreferences([])}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-300"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden">
          {/* Meal Type Toggle for Mobile */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-center">
              <div className="bg-gray-100 rounded-lg p-1 flex">
                {dayFilteredItems.availableMeals.includes('lunch') && (
                  <button
                    onClick={() => setSelectedMealType('lunch')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                      selectedMealType === 'lunch'
                        ? 'bg-red-500 text-white shadow-lg'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <span>Lunch</span>
                    </div>
                  </button>
                )}
                {dayFilteredItems.availableMeals.includes('dinner') && (
                  <button
                    onClick={() => setSelectedMealType('dinner')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                      selectedMealType === 'dinner'
                        ? 'bg-red-500 text-white shadow-lg'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                      <span>Dinner</span>
                    </div>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Filter Buttons */}
          <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
            <div className="space-y-3">
              {/* Preferences Filter Button */}
              <button
                onClick={() => setShowPreferencesFilter(true)}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 px-4 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                <div className="flex items-center justify-center space-x-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-semibold">Food Preferences</span>
                  {/* Badge for active preferences */}
                  {selectedPreferences.length > 0 && (
                    <div className="bg-orange-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center border-2 border-white">
                      {selectedPreferences.length}
                    </div>
                  )}
                </div>
                
                {/* Preferences Summary */}
                {selectedPreferences.length > 0 && (
                  <div className="mt-2 text-sm opacity-90">
                    <span>{selectedPreferences.length} preference{selectedPreferences.length !== 1 ? 's' : ''} selected</span>
                  </div>
                )}
              </button>

              {/* Days Filter Button */}
              <button
                onClick={() => setShowDaysFilter(true)}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-4 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                <div className="flex items-center justify-center space-x-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="font-semibold">Select Day</span>
                  {/* Badge for non-current day */}
                  {selectedDay !== getCurrentDay() && (
                    <div className="bg-orange-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center border-2 border-white">
                      1
                    </div>
                  )}
                </div>
                
                {/* Day Summary */}
                <div className="mt-2 text-sm opacity-90">
                  <span>{DAYS_OF_WEEK.find(d => d.id === selectedDay)?.name}</span>
                  {selectedDay === getCurrentDay() && (
                    <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-600 text-xs rounded-full">
                      Today
                    </span>
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Mobile Filter Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {selectedMealType.charAt(0).toUpperCase() + selectedMealType.slice(1)} • {DAYS_OF_WEEK.find(d => d.id === selectedDay)?.name}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {displayItems.length} items available
                      {selectedPreferences.length > 0 && (
                        <span className="ml-2 text-green-600">• {selectedPreferences.length} preference{selectedPreferences.length !== 1 ? 's' : ''} applied</span>
                      )}
                    </p>
                  </div>
                </div>
                {selectedDay === getCurrentDay() && (
                  <span className="px-2 py-1 bg-orange-100 text-orange-600 text-xs rounded-full font-medium">
                    Today
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Meal Plan Summary */}
          <MealPlanSummary restaurantName={restaurant.name} />

          {/* Mobile Menu Items */}
          <div className="space-y-6">
            {/* Filtered Items Section - Mobile */}
            {hasFiltersApplied && displayItems.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                <div className="p-4">
                  <div className="grid grid-cols-1 gap-4">
                    {displayItems.map((item) => (
                      <FoodItemCard 
                        key={item.id} 
                        item={item} 
                        onAddToPlan={handleAddToPlan}
                        selectedDay={selectedDay}
                        selectedMealType={selectedMealType}
                        restaurantName={restaurant.name}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Other Menu Items Section - Mobile */}
            {otherMenuItems.length > 0 ? (
              <div className="bg-white rounded-xl shadow-lg">
                <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                      </svg>
                    </div>
                    <h2 className="text-lg font-bold text-gray-800">
                      {selectedPreferences.length > 0 ? `Other Items (${otherMenuItems.length})` : `All Items (${otherMenuItems.length})`}
                    </h2>
                  </div>
                  <p className="text-gray-600 text-sm mt-1">
                    {selectedPreferences.length > 0 ? 'Additional items available' : 'All available items for this meal'}
                  </p>
                </div>
                
                <div className="p-4">
                  <div className="grid grid-cols-1 gap-4">
                    {otherMenuItems.map((item) => (
                      <FoodItemCard 
                        key={item.id} 
                        item={item} 
                        onAddToPlan={handleAddToPlan}
                        selectedDay={selectedDay}
                        selectedMealType={selectedMealType}
                        restaurantName={restaurant.name}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No items found</h3>
                <p className="text-gray-600 mb-4 text-sm">
                  No {selectedMealType} items available for {DAYS_OF_WEEK.find(d => d.id === selectedDay)?.name}. Try selecting a different day or meal type.
                </p>
                <button
                  onClick={() => setSelectedPreferences([])}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-300 text-sm"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preferences Filter Modal */}
      <PreferencesFilterModal
        isOpen={showPreferencesFilter}
        onClose={() => setShowPreferencesFilter(false)}
        selectedPreferences={selectedPreferences}
        onApply={handlePreferencesFilterApply}
      />

      {/* Days Filter Modal */}
      <DaysFilterModal
        isOpen={showDaysFilter}
        onClose={() => setShowDaysFilter(false)}
        selectedDay={selectedDay}
        setSelectedDay={setSelectedDay}
        selectedMealType={selectedMealType}
        onApply={handleDaysFilterApply}
      />

      {/* Sticky Go to Next Step Button */}
      <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-40">
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
          className="group bg-gradient-to-r from-grub-red to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 md:px-6 md:py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center space-x-2 md:space-x-3"
        >
          <span className="font-semibold text-sm">Next Step</span>
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

export default RestaurantDetailPage;
