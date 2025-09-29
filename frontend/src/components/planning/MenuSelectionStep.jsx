import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { usePlanning } from '../../contexts/PlanningContext';
import { useMealPlan } from '../../contexts/MealPlanContext';
import { getAllFoodItemsForDayAndSlot, getAllFoodItemsForDay, capitalizeFirst, groupItemsByCategory } from '../../utils/combinedMenuHelpers';
import { unifiedRestaurants, getRestaurantsByPostalCode } from '../../data/unifiedRestaurants';
import FoodItemCard from '../restaurant/FoodItemCard';
import RestaurantCard from './RestaurantCard';

const MenuSelectionStep = ({ onNext, onBack }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { postalCode, selectedPreferences, isClient } = usePlanning();
  const { addItemToPlan } = useMealPlan();
  
  // Get URL parameters
  const day = searchParams.get('day') || 'monday';
  const slot = searchParams.get('slot') || 'lunch';
  const urlPostalCode = searchParams.get('postal');
  const source = searchParams.get('source'); // 'plan' or 'weekly-menu'
  
  // Use postal code from URL if available, otherwise use context postal code
  const effectivePostalCode = urlPostalCode || postalCode;
  
  // Determine what to show based on source
  const isFromPlan = source === 'plan' || (!source && urlPostalCode && !searchParams.get('day'));
  const isFromWeeklyMenu = source === 'weekly-menu' || (!source && searchParams.get('day'));
  
  // User type toggle state
  const [userType, setUserType] = useState('normal');
  
  // Modal detection state
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Effect to detect when modals are open
  useEffect(() => {
    const checkForModals = () => {
      // Check for common modal indicators
      const hasModal = document.querySelector('.fixed.inset-0') !== null ||
                      document.querySelector('[role="dialog"]') !== null ||
                      document.querySelector('.modal') !== null ||
                      document.querySelector('[data-modal]') !== null ||
                      document.body.classList.contains('modal-open') ||
                      document.body.style.overflow === 'hidden';
      setIsModalOpen(hasModal);
    };
    
    // Check initially
    checkForModals();
    
    // Set up mutation observer to watch for modal changes
    const observer = new MutationObserver(checkForModals);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style']
    });
    
    // Also listen for specific modal events if they exist
    const handleModalOpen = () => setIsModalOpen(true);
    const handleModalClose = () => setIsModalOpen(false);
    
    document.addEventListener('modal:open', handleModalOpen);
    document.addEventListener('modal:close', handleModalClose);
    
    return () => {
      observer.disconnect();
      document.removeEventListener('modal:open', handleModalOpen);
      document.removeEventListener('modal:close', handleModalClose);
    };
  }, []);
  

  // Get nearby restaurants
  const nearbyRestaurants = useMemo(() => {
    if (!isClient) return [];
    
    // Get restaurants by postal code or all restaurants if no postal code
    let restaurants;
    if (effectivePostalCode && effectivePostalCode.length >= 3) {
      restaurants = getRestaurantsByPostalCode(effectivePostalCode);
    } else {
      restaurants = [...unifiedRestaurants].sort((a, b) => b.rating - a.rating);
    }
    
    return restaurants.slice(0, 8);
  }, [effectivePostalCode, isClient]);

  // Fetch data based on user type
  const menuData = useMemo(() => {
    if (!isClient) return { lunch: [], dinner: [] };
    
    if (userType === 'normal') {
      const items = getAllFoodItemsForDayAndSlot(day, slot, selectedPreferences);
      return { [slot]: items };
    } else {
      // Pro user gets both lunch and dinner
      return getAllFoodItemsForDay(day, selectedPreferences);
    }
  }, [day, slot, selectedPreferences, userType, isClient]);

  // Group items by category for better organization
  const groupedMenuData = useMemo(() => {
    const result = {};
    Object.keys(menuData).forEach(mealType => {
      result[mealType] = groupItemsByCategory(menuData[mealType]);
    });
    return result;
  }, [menuData]);

  // Handle item click - add to plan
  const handleItemClick = (item) => {
    addItemToPlan(item, day, slot);
  };

  // Handle restaurant card click - navigate to restaurant detail with context
  const handleRestaurantClick = (restaurant) => {
    const searchParams = new URLSearchParams();
    
    // Add day and slot parameters
    searchParams.set('day', day);
    searchParams.set('slot', slot);
    searchParams.set('userType', userType);
    
    // Add preferences if they exist
    if (selectedPreferences && selectedPreferences.length > 0) {
      searchParams.set('preferences', selectedPreferences.join(','));
    }
    
    const url = `/restaurant/${restaurant.id}?${searchParams.toString()}`;
    navigate(url);
  };

  // Get section title based on user type
  const getSectionTitle = (mealType) => {
    if (userType === 'normal') {
      return `Build Your ${capitalizeFirst(day)} ${capitalizeFirst(mealType)} Plan`;
    } else {
      return `${capitalizeFirst(mealType)} Menu`;
    }
  };

  // Get main page title
  const getPageTitle = () => {
    if (userType === 'normal') {
      return `Top-rated meals for ${capitalizeFirst(day)}'s ${capitalizeFirst(slot)}${effectivePostalCode ? ` near ${effectivePostalCode}` : ''}`;
    } else {
      return `Build Your Full Day Plan for ${capitalizeFirst(day)}`;
    }
  };

  // Render nearby restaurants section
  const renderNearbyRestaurants = () => {
    if (nearbyRestaurants.length === 0) return null;

    return (
      <div className="mb-12">
        {/* Postal Code Header */}
        {effectivePostalCode && (
          <div className="mb-6 text-center">
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
              <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-blue-800 font-medium">Restaurants near {effectivePostalCode}</span>
            </div>
          </div>
        )}
        
        {/* Restaurant Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
          {nearbyRestaurants.map((restaurant) => (
            <RestaurantCard 
              key={restaurant.id}
              restaurant={restaurant}
              selectedPreferences={selectedPreferences}
              onExplore={handleRestaurantClick}
            />
          ))}
        </div>
      </div>
    );
  };

  // Render user type toggle
 
  // Render items grid for a specific meal type
  const renderItemsGrid = (mealType, categories) => {
    const totalItems = Object.values(categories).flat().length;
    
    if (totalItems === 0) {
      return (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No items available</h3>
          <p className="text-gray-500">
            No restaurants have {mealType} items available for {capitalizeFirst(day)}.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {Object.entries(categories).map(([category, items]) => (
          <div key={category}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
              {category} ({items.length} items)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {items.map((item) => (
                <FoodItemCard
                  key={`${item.restaurantId}-${item.id}`}
                  item={item}
                  onAddToPlan={() => handleItemClick(item)}
                  selectedDay={day}
                  selectedMealType={mealType}
                  restaurantName={item.restaurantName}
                  hideAddButton={false}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render meal section
  const renderMealSection = (mealType) => {
    const categories = groupedMenuData[mealType] || {};
    const totalItems = Object.values(categories).flat().length;

    return (
      <div key={mealType} className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {getSectionTitle(mealType)}
          </h2>
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {totalItems} items
          </span>
        </div>
        {renderItemsGrid(mealType, categories)}
      </div>
    );
  };

  // Show loading state during SSR
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="h-8 bg-gray-200 rounded-lg w-64 mx-auto mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-48 mx-auto mb-12 animate-pulse"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-grub-red to-red-600 text-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
          <div className="text-center">
            <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-4 leading-tight px-2 sm:px-0">
              {isFromPlan 
                ? (
                    <>
                      <span className="block sm:inline">Restaurants near</span>
                      <span className="block sm:inline font-black text-red-200"> {effectivePostalCode?.toUpperCase() || 'you'}</span>
                    </>
                  )
                : userType === 'normal' 
                  ? (
                      <>
                        <span className="block text-base sm:text-2xl">Top meals for</span>
                        <span className="block text-lg sm:text-3xl font-black">{capitalizeFirst(day)}'s {capitalizeFirst(slot)}</span>
                      </>
                    )
                  : (
                      <>
                        <span className="block text-base sm:text-2xl">Full Day Plan</span>
                        <span className="block text-lg sm:text-3xl font-black">{capitalizeFirst(day)}</span>
                      </>
                    )
              }
            </h1>
            <p className="text-red-100 text-xs sm:text-base lg:text-lg mb-4 sm:mb-8 px-4 sm:px-0 max-w-lg mx-auto">
              {isFromPlan 
                ? `Highly-rated restaurants in your area`
                : userType === 'normal' 
                  ? `Best ${slot} options available`
                  : `Full day meal planning`
              }
            </p>
            
            {/* Location and Context Badges */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              {effectivePostalCode && (
                <div className="inline-flex items-center bg-white bg-opacity-20 backdrop-blur-sm rounded-full px-4 py-2 text-white">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="font-medium">{effectivePostalCode.toUpperCase()}</span>
                </div>
              )}
              
              {isFromWeeklyMenu && (
                <div className="inline-flex items-center bg-white bg-opacity-20 backdrop-blur-sm rounded-full px-4 py-2 text-white">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="font-medium">{capitalizeFirst(day)} {capitalizeFirst(slot)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-center space-x-8">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="ml-2 text-sm font-medium text-gray-900">Location</span>
            </div>
            
            <div className="w-8 h-0.5 bg-gray-300"></div>
            
            <div className="flex items-center">
              <div className="w-8 h-8 bg-grub-red rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">2</span>
              </div>
              <span className="ml-2 text-sm font-medium text-gray-900">
                {isFromPlan ? 'Restaurants' : 'Menu Selection'}
              </span>
            </div>
            
            <div className="w-8 h-0.5 bg-gray-300"></div>
            
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-600 text-sm font-bold">3</span>
              </div>
              <span className="ml-2 text-sm font-medium text-gray-500">Subscribe</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Show Restaurant Grid for both cases, but with different titles and context */}
        <div>
            <div className="text-center mb-6 sm:mb-8 lg:mb-12">
              <div className="inline-flex items-center bg-grub-red text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full mb-4 sm:mb-6 text-sm sm:text-base">
                <svg className="w-4 h-4 sm:w-6 sm:h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span className="font-semibold">Top Rated Restaurants</span>
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 px-2 sm:px-0">
                {isFromPlan 
                  ? 'Discover Amazing Restaurants'
                  : `Restaurants for ${capitalizeFirst(day)}'s ${capitalizeFirst(slot)}`
                }
              </h2>
              <p className="text-sm sm:text-base lg:text-xl text-gray-600 max-w-2xl mx-auto px-4 sm:px-0">
                {isFromPlan 
                  ? 'Choose from these highly-rated restaurants in your area, sorted by customer reviews and popularity'
                  : `Find the perfect restaurant for your ${slot} on ${capitalizeFirst(day)}. All restaurants below offer ${slot} options.`
                }
              </p>
            </div>

            {/* Stats Bar - Hidden on mobile, compact on larger screens */}
            <div className="hidden sm:block bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
              <div className="grid grid-cols-3 gap-4 sm:gap-6 text-center">
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="text-2xl font-bold text-gray-900">{nearbyRestaurants.length}</div>
                    <div className="text-sm text-gray-600">Restaurants Found</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="text-2xl font-bold text-gray-900">4.5+</div>
                    <div className="text-sm text-gray-600">Average Rating</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="text-2xl font-bold text-gray-900">Weekly</div>
                    <div className="text-sm text-gray-600">Meal Plans</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Mobile Summary */}
            <div className="sm:hidden mb-4 text-center">
              <div className="inline-flex items-center bg-white rounded-full px-4 py-2 shadow-md">
                <span className="text-sm font-medium text-gray-700">
                  {nearbyRestaurants.length} restaurant{nearbyRestaurants.length !== 1 ? 's' : ''} found
                </span>
              </div>
            </div>

            {/* Restaurant Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {nearbyRestaurants.map((restaurant) => (
                <div
                  key={restaurant.id}
                  onClick={() => {
                    // Include day and slot parameters when coming from weekly menu
                    const params = new URLSearchParams();
                    if (isFromWeeklyMenu) {
                      params.set('day', day);
                      params.set('slot', slot);
                      params.set('source', 'weekly-menu');
                    }
                    const queryString = params.toString();
                    const url = queryString ? `/restaurant/${restaurant.id}?${queryString}` : `/restaurant/${restaurant.id}`;
                    navigate(url);
                  }}
                  className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105 border border-gray-100 touch-manipulation active:scale-95"
                >
                  <div className="relative h-32 sm:h-48 overflow-hidden">
                    <img
                      src={restaurant.image || '/images/grub-gate-default-img.jpg'}
                      alt={restaurant.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = '/images/grub-gate-default-img.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    
                    {/* Rating Badge */}
                    <div className="absolute top-4 right-4 bg-white bg-opacity-95 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center space-x-1 shadow-lg">
                      <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-sm font-bold text-gray-900">{restaurant.rating}</span>
                    </div>

                    {/* Popular Badge */}
                    {restaurant.isPopular && (
                      <div className="absolute top-4 left-4 bg-grub-red text-white px-3 py-1 rounded-full text-xs font-semibold">
                        Popular
                      </div>
                    )}
                  </div>
                  
                  <div className="p-3 sm:p-6">
                    <div className="flex items-start justify-between mb-2 sm:mb-3">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-grub-red transition-colors duration-200 line-clamp-1">
                        {restaurant.name}
                      </h3>
                      {restaurant.isTopRated && (
                        <div className="flex-shrink-0 ml-2">
                          <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-4 line-clamp-1 sm:line-clamp-2 leading-relaxed">
                      {restaurant.description || restaurant.cuisine || 'Delicious food awaits you'}
                    </p>

                    {/* Tags - Hidden on mobile */}
                    {restaurant.tags && restaurant.tags.length > 0 && (
                      <div className="hidden sm:flex flex-wrap gap-1 mb-4">
                        {restaurant.tags.slice(0, 2).map((tag, index) => (
                          <span
                            key={index}
                            className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                        {restaurant.tags.length > 2 && (
                          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                            +{restaurant.tags.length - 2}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-center text-xs sm:text-sm text-gray-500 mb-3 sm:mb-6">
                      <span className="flex items-center space-x-1">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="font-medium">{restaurant.distance || '0.5 km'} away</span>
                      </span>
                    </div>

                    <button className="w-full bg-gradient-to-r from-grub-red to-red-600 hover:from-red-600 hover:to-red-700 text-white py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-semibold transition-all duration-200 transform group-hover:scale-105 shadow-lg hover:shadow-xl text-sm sm:text-base">
                      <span className="sm:hidden">View Menu</span>
                      <span className="hidden sm:inline">View Menu & Order</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Call to Action Section */}
            {/* <div className="mt-16 bg-gradient-to-r from-grub-red to-red-600 rounded-2xl p-8 text-white text-center">
              <div className="max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold mb-4">
                  Ready to Start Your Meal Planning Journey?
                </h3>
                <p className="text-red-100 mb-6">
                  Choose from these amazing restaurants and create your perfect weekly meal plan. 
                  Get started with our subscription plans and never worry about "what's for dinner" again!
                </p>
                <button
                  onClick={onNext}
                  className="inline-flex items-center bg-white text-grub-red px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 shadow-lg"
                >
                  Continue to Subscription Plans
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar - Hidden when modals are open */}
      {!isModalOpen && (
        <div className="bg-white border-t shadow-lg fixed bottom-0 left-0 right-0 z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              {/* Current Filters Display */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">Current selection:</span>
                {postalCode && (
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Postal code badge clicked!'); // Debug log
                      // Navigate back to location selection
                      navigate('/plan');
                    }}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 hover:text-blue-900 transition-all duration-200 cursor-pointer border border-blue-300 hover:border-blue-400 shadow-sm hover:shadow-md"
                    title="Click to change location"
                  >
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    {postalCode.toUpperCase()}
                    <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                )}
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Day/Slot badge clicked!'); // Debug log
                    // Navigate back to weekly menu for the selected day
                    navigate(`/weekly-menu?day=${day}&highlight=${slot}`);
                  }}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 hover:bg-purple-200 hover:text-purple-900 transition-all duration-200 cursor-pointer border border-purple-300 hover:border-purple-400 shadow-sm hover:shadow-md"
                  title="Click to go back to weekly menu"
                >
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {capitalizeFirst(day)} {capitalizeFirst(slot)}
                  <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </button>
                {userType === 'pro' && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    Pro User
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Change Location clicked!'); // Debug log
                  // Navigate back to location selection
                  navigate('/plan');
                }}
                className="px-4 sm:px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Change Location</span>
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Continue to Subscription Plans clicked!'); // Debug log
                  // Navigate to weekly menu to see the meal planning calendar
                  navigate('/weekly-menu');
                }}
                className="px-6 sm:px-8 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-lg transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 text-sm sm:text-base"
              >
                <span className="hidden sm:inline">Continue to Subscription Plans</span>
                <span className="sm:hidden">Continue</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m0-7H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
    </div>
    </div>
  );
};

export default MenuSelectionStep;
