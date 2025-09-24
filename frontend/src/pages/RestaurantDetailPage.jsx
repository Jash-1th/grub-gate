import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import MobileFilterModal from '../components/restaurant/MobileFilterModal';

// Food preference options for sidebar
const foodPreferences = [
  { id: 'vegetarian', name: 'Vegetarian', icon: '🥬' },
  { id: 'vegan', name: 'Vegan', icon: '🌱' },
  { id: 'gluten-free', name: 'Gluten Free', icon: '🌾' },
  { id: 'dairy-free', name: 'Dairy Free', icon: '🥛' },
  { id: 'keto', name: 'Keto', icon: '🥑' },
  { id: 'halal', name: 'Halal', icon: '☪️' },
  { id: 'kosher', name: 'Kosher', icon: '✡️' },
  { id: 'low-carb', name: 'Low Carb', icon: '🥩' },
  { id: 'paleo', name: 'Paleo', icon: '🦴' },
  { id: 'spicy', name: 'Spicy', icon: '🌶️' },
  { id: 'organic', name: 'Organic', icon: '🌿' },
  { id: 'pescatarian', name: 'Pescatarian', icon: '🐟' }
];

const FoodItemCard = ({ item }) => {
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    
    if (hasHalfStar) {
      stars.push(
        <svg key="half" className="w-4 h-4 text-yellow-400" viewBox="0 0 20 20">
          <defs>
            <linearGradient id={`half-fill-${item.id}`}>
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path fill={`url(#half-fill-${item.id})`} d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <svg key={`empty-${i}`} className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    
    return stars;
  };

  return (
    <div className="group relative bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-100">
      {/* Popular Badge */}
      {item.isPopular && (
        <div className="absolute top-3 left-3 z-10">
          <span className="px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded-full shadow-lg">
            Popular
          </span>
        </div>
      )}
      
      {/* Food Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            e.target.src = '/images/grub-gate-default-img.jpg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      
      {/* Food Info */}
      <div className="p-4">
        <div className="mb-3">
          <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-red-600 transition-colors duration-300">
            {item.name}
          </h3>
          <p className="text-sm text-gray-500 font-medium">{item.category}</p>
        </div>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed">
          {item.description}
        </p>
        
        {/* Rating and Price */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1">
            {renderStars(item.rating)}
            <span className="text-sm font-semibold text-gray-700 ml-1">
              {item.rating}
            </span>
          </div>
          <span className="text-lg font-bold text-red-600">
            ${item.price}
          </span>
        </div>
        
        {/* Preferences Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {item.preferences.slice(0, 2).map((preference, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full capitalize"
            >
              {preference.replace('-', ' ')}
            </span>
          ))}
          {item.preferences.length > 2 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              +{item.preferences.length - 2} more
            </span>
          )}
        </div>
        
        {/* Add to Cart Button */}
        <button className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 shadow-lg hover:shadow-xl">
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 11-4 0v-6m4 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
            </svg>
            <span>Add to Cart</span>
          </div>
        </button>
      </div>
      
      {/* Shimmer effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      </div>
    </div>
  );
};

const RestaurantDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isClient, setIsClient] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState('lunch');
  const [selectedPreferences, setSelectedPreferences] = useState([]);
  const [selectedDay, setSelectedDay] = useState(getCurrentDay());
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const scrollContainerRef = useRef(null);
  const preferenceRefs = useRef({});
  const itemsContainerRef = useRef(null);

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
    
    // Apply preference filtering if any preferences are selected
    let items = selectedPreferences.length > 0 
      ? filterFoodItemsByPreferences(mealItems, selectedPreferences)
      : mealItems;
    
    // Sort items using the efficient preference-based algorithm
    return sortItemsByPreferences(items, selectedPreferences);
  }, [dayFilteredItems, selectedMealType, selectedPreferences, isClient]);

  // Group items by preference categories for better organization
  const itemsByPreferenceGroup = useMemo(() => {
    if (!isClient) return { matched: [], popular: [], other: [] };
    return groupItemsByPreferenceCategories(filteredItems, selectedPreferences);
  }, [filteredItems, selectedPreferences, isClient]);

  // Group items by category within each preference group
  const itemsByCategory = useMemo(() => {
    const result = {};
    
    // Process matched items first (user preferences)
    if (itemsByPreferenceGroup.matched.length > 0) {
      const matchedByCategory = getFoodItemsByCategory(itemsByPreferenceGroup.matched);
      Object.entries(matchedByCategory).forEach(([category, items]) => {
        result[`🎯 ${category} (Your Preferences)`] = items;
      });
    }
    
    // Then popular items
    if (itemsByPreferenceGroup.popular.length > 0) {
      const popularByCategory = getFoodItemsByCategory(itemsByPreferenceGroup.popular);
      Object.entries(popularByCategory).forEach(([category, items]) => {
        result[`⭐ ${category} (Popular)`] = items;
      });
    }
    
    // Finally other items
    if (itemsByPreferenceGroup.other.length > 0) {
      const otherByCategory = getFoodItemsByCategory(itemsByPreferenceGroup.other);
      Object.entries(otherByCategory).forEach(([category, items]) => {
        result[category] = items;
      });
    }
    
    return result;
  }, [itemsByPreferenceGroup]);

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

  // Handle mobile filter apply
  const handleMobileFilterApply = () => {
    setShowMobileFilters(false);
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
          {/* Desktop Filter Button */}
          <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
            <button
              onClick={() => setShowMobileFilters(true)}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 px-4 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              <div className="flex items-center justify-center space-x-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
                </svg>
                <span className="font-semibold">Filter Options</span>
                {/* Badge for active filters */}
                {(selectedPreferences.length > 0 || selectedDay !== getCurrentDay()) && (
                  <div className="bg-orange-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center border-2 border-white">
                    {selectedPreferences.length + (selectedDay !== getCurrentDay() ? 1 : 0)}
                  </div>
                )}
              </div>
              
              {/* Filter Summary */}
              {(selectedPreferences.length > 0 || selectedDay !== getCurrentDay()) && (
                <div className="mt-2 text-sm opacity-90">
                  <div className="flex items-center justify-center space-x-4">
                    {selectedPreferences.length > 0 && (
                      <span>{selectedPreferences.length} preference{selectedPreferences.length !== 1 ? 's' : ''}</span>
                    )}
                    {selectedDay !== getCurrentDay() && (
                      <span>{DAYS_OF_WEEK.find(d => d.id === selectedDay)?.name}</span>
                    )}
                  </div>
                </div>
              )}
            </button>
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

            {/* Desktop Menu Items */}
            <div className="space-y-6">
              {Object.keys(itemsByCategory).length > 0 ? (
                Object.entries(itemsByCategory).map(([category, items]) => (
                  <div key={category} className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                      {category}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {items.map((item) => (
                        <FoodItemCard key={item.id} item={item} />
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No items found</h3>
                  <p className="text-gray-600 mb-6">
                    No {selectedMealType} items match your selected preferences for {DAYS_OF_WEEK.find(d => d.id === selectedDay)?.name}. Try adjusting your filters.
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

          {/* Mobile Filter Button */}
          <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
            <button
              onClick={() => setShowMobileFilters(true)}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 px-4 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              <div className="flex items-center justify-center space-x-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
                </svg>
                <span className="font-semibold">Filter Options</span>
                {/* Badge for active filters */}
                {(selectedPreferences.length > 0 || selectedDay !== getCurrentDay()) && (
                  <div className="bg-orange-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center border-2 border-white">
                    {selectedPreferences.length + (selectedDay !== getCurrentDay() ? 1 : 0)}
                  </div>
                )}
              </div>
              
              {/* Filter Summary */}
              {(selectedPreferences.length > 0 || selectedDay !== getCurrentDay()) && (
                <div className="mt-2 text-sm opacity-90">
                  <div className="flex items-center justify-center space-x-4">
                    {selectedPreferences.length > 0 && (
                      <span>{selectedPreferences.length} preference{selectedPreferences.length !== 1 ? 's' : ''}</span>
                    )}
                    {selectedDay !== getCurrentDay() && (
                      <span>{DAYS_OF_WEEK.find(d => d.id === selectedDay)?.name}</span>
                    )}
                  </div>
                </div>
              )}
            </button>
          </div>

          {/* Mobile Menu Items */}
          <div className="space-y-6">
            {Object.keys(itemsByCategory).length > 0 ? (
              Object.entries(itemsByCategory).map(([category, items]) => (
                <div key={category} className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                    {category}
                  </h3>
                  <div className="grid grid-cols-1 gap-6">
                    {items.map((item) => (
                      <FoodItemCard key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No items found</h3>
                <p className="text-gray-600 mb-6">
                  No {selectedMealType} items match your selected preferences for {DAYS_OF_WEEK.find(d => d.id === selectedDay)?.name}. Try adjusting your filters.
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

      {/* Mobile Filter Modal */}
      <MobileFilterModal
        isOpen={showMobileFilters}
        onClose={() => setShowMobileFilters(false)}
        selectedPreferences={selectedPreferences}
        setSelectedPreferences={setSelectedPreferences}
        selectedDay={selectedDay}
        setSelectedDay={setSelectedDay}
        selectedMealType={selectedMealType}
        dayFilteredItems={dayFilteredItems}
        onApply={handleMobileFilterApply}
      />
    </div>
  );
};

export default RestaurantDetailPage;
