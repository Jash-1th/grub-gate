import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
// Static data removed - now uses dynamic API data
import { DAYS_OF_WEEK } from '../utils/filteringAlgorithms';
import { applyPreferenceFilter } from '../utils/filteringHelpers';
import { useMealPlan } from '../contexts/MealPlanContext_SSR_FIXED';
import { useToast } from '../contexts/ToastContext';
import { usePlanning } from '../contexts/PlanningContext';
import { useAuth } from '../contexts/AuthContext';
import { useModal } from '../context/ModalContext';
import { getRestaurant, getRestaurantMenu } from '../services/restaurantService';
import { navigateToWeeklyMenuWithRestaurant } from '../utils/navigation';

// Import new components
import RestaurantHero from '../components/restaurant/RestaurantHero';
import UserTypeToggle from '../components/restaurant/UserTypeToggle';
import FloatingNavbar from '../components/restaurant/FloatingNavbar';
import PreferencesSelector from '../components/restaurant/PreferencesSelector';
import MenuItemsGrid from '../components/restaurant/MenuItemsGrid';
import ItemDetailsModal from '../components/restaurant/ItemDetailsModal';
import ProUserFeatures from '../components/restaurant/ProUserFeatures';
import FloatingPreferencesButton from '../components/restaurant/FloatingPreferencesButton';
import NextStepButton from '../components/restaurant/NextStepButton';
import UserTypeSelectionModal from '../components/shared/UserTypeSelectionModal';
// RestaurantSwitchModal removed - now supports multi-restaurant selection

const RestaurantDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Check if coming from MenuSelectionStep with context
  const contextDay = searchParams.get('day');
  const contextSlot = searchParams.get('slot');
  const contextUserType = searchParams.get('userType');
  const contextSource = searchParams.get('source');
  const contextWeek = parseInt(searchParams.get('week')) || 0; // Default to current week (0)
  const contextPreferences = searchParams.get('preferences');
  const isFromMenuSelection = !!(contextDay && contextSlot);
  
  // Only allow meal planning when coming from weekly-menu or daily-meal-plan workflow with day/slot context
  // Disable meal planning for menu browsing (View Full Menu button) and general restaurant browsing
  // Enable meal planning for both weekly menu and daily meal plan pages when restaurant is selected
  const isMealPlanningEnabled = (contextSource === 'weekly-menu' || contextSource === 'daily-meal-plan') && isFromMenuSelection;
  
  // State for active day tab - initialize from context if available
  const [activeDay, setActiveDay] = useState(contextDay || 'monday');
  
  // State for user type toggle - initialize from context if available
  const [userType, setUserType] = useState(contextUserType || 'normal'); // 'normal' or 'pro'
  
  // State for meal type selection - initialize from context if available
  const [selectedMealType, setSelectedMealType] = useState(contextSlot || 'lunch'); // 'lunch' or 'dinner'
  
  // State for preferences selection - initialize from URL context if available
  const [selectedPreferences, setSelectedPreferences] = useState(
    contextPreferences ? contextPreferences.split(',') : []
  ); // array of preference IDs
  const [showPreferences, setShowPreferences] = useState(false); // toggle preferences visibility
  
  // State for floating selector
  const [showFloatingSelector, setShowFloatingSelector] = useState(false);
  
  // State for navbar indicator
  const [showNavbarIndicator, setShowNavbarIndicator] = useState(false);
  
  // State for day/meal selector (shown when normal user clicks "Add to Plan")
  const [showDayMealSelector, setShowDayMealSelector] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  // State for detailed item view
  const [selectedDetailItem, setSelectedDetailItem] = useState(null);
  const [showItemDetails, setShowItemDetails] = useState(false);

  // Meal plan context
  const { 
    mealPlan, 
    weeklyPlan, 
    totalItems, 
    addItemToPlan, 
    removeItemFromPlan, 
    clearAllPlan,
    // Week-specific functions
    addItemToPlanWeek,
    removeItemFromPlanWeek,
    getWeekMealItems,
    getRestaurantsInWeekPlan,
    getRestaurantsInAllWeeks,
    getRestaurantIdsInWeekPlan,
    getRestaurantIdsInAllWeeks,
    getTotalItemsCount,
    // Multi-restaurant selection (NEW)
    selectedRestaurants,
    maxRestaurants,
    addSelectedRestaurant,
    removeSelectedRestaurant,
    canAddRestaurant,
    isRestaurantSelected,
    getSelectedRestaurantCount,
    // Legacy restaurant selection (for backward compatibility)
    selectedRestaurantId,
    selectedRestaurantName,
    selectedRestaurantData,
    setSelectedRestaurant,
    clearSelectedRestaurant
  } = useMealPlan();
  
  // Toast context
  const { showMealPlanSuccess, showError } = useToast();
  
  // Planning context (get postal code, preferences, and restaurant selection)
  const { postalCode, selectedPreferences: planningPreferences, updateSelectedRestaurant } = usePlanning();

  // Auth context
  const { isAuthenticated, user } = useAuth();

  // Footer visibility detection for button styling
  const [isFooterVisible, setIsFooterVisible] = useState(false);
  
  // Debug: Log restaurant data when it changes
  useEffect(() => {
    console.log('🔍 RestaurantDetailPage - Restaurant data changed:');
    console.log('🔍 selectedRestaurantId:', selectedRestaurantId);
    console.log('🔍 selectedRestaurantName:', selectedRestaurantName);
    console.log('🔍 selectedRestaurantData:', selectedRestaurantData);
    console.log('🔍 selectedRestaurants:', selectedRestaurants);
    console.log('🔍 Type of restaurant ID:', typeof selectedRestaurantId);
    console.log('🔍 Type of restaurant name:', typeof selectedRestaurantName);
  }, [selectedRestaurantId, selectedRestaurantName, selectedRestaurantData, selectedRestaurants]);

  // Footer visibility detection using Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFooterVisible(entry.isIntersecting);
      },
      {
        threshold: 0.1, // Trigger when 10% of footer is visible
        rootMargin: '0px 0px -50px 0px' // Trigger slightly before footer is fully visible
      }
    );

    // Find the footer element (assuming it has an id or class)
    const footer = document.querySelector('footer') || document.querySelector('[data-footer]') || document.querySelector('.footer');
    
    if (footer) {
      observer.observe(footer);
    }

    return () => {
      if (footer) {
        observer.unobserve(footer);
      }
    };
  }, []);

  // Modal context
  const { openLoginModal } = useModal();

  // State for user type selection (show modal on first visit)
  const [showUserTypeModal, setShowUserTypeModal] = useState(false); // Disabled modal
  const [hasSelectedUserType, setHasSelectedUserType] = useState(true); // Default to true since modal is disabled

  // Multi-restaurant support - no more switching modal needed
  const [showRestaurantLimitModal, setShowRestaurantLimitModal] = useState(false);
  const [restaurantLimitMessage, setRestaurantLimitMessage] = useState('');

  // State for API data
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load restaurant and menu data from API
  useEffect(() => {
    const loadRestaurantData = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Try API first
        const menuParams = { userType };
        
        // If we have day and mealType from URL (for "add more items"), include them
        if (contextDay && contextSlot) {
          menuParams.day = contextDay;
          menuParams.mealType = contextSlot;
        }
        
        const [restaurantResult, menuResult] = await Promise.all([
          getRestaurant(id),
          getRestaurantMenu(id, menuParams)
        ]);
        
        if (restaurantResult.success && menuResult.success) {
          setRestaurant(restaurantResult.data);
          setMenuItems(menuResult.data.menuItems || []);
          
          // Update planning context with this restaurant (for UI state only)
          updateSelectedRestaurant(restaurantResult.data);
          
          // NOTE: We don't automatically save to database here
          // Restaurant selection is only saved when user clicks "Select This Restaurant"
        } else {
          // No static fallback - API must work for proper functionality
          setError('Restaurant not found. Please check your connection and try again.');
        }
      } catch (err) {
        // No static fallback - API must work for proper functionality
        console.error('RestaurantDetailPage: API error:', err);
        setError('Failed to load restaurant data. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    };
    
    loadRestaurantData();
  }, [id, userType]);

  // Sync local preferences with planning preferences when they change
  useEffect(() => {
    // Only sync if no URL preferences and we have planning preferences
    if (!contextPreferences && planningPreferences && planningPreferences.length > 0) {
      setSelectedPreferences(planningPreferences);
    }
  }, [planningPreferences, contextPreferences]);

  // Get all food items for this restaurant
  const allFoodItems = useMemo(() => {
    
    if (!menuItems || menuItems.length === 0) {
      return { lunch: [], dinner: [] };
    }
    
    // Apply preference filtering to all menu items first
    const preferenceFilteredItems = applyPreferenceFilter(menuItems, selectedPreferences);
    
    // Debug logging for preference filtering (can be removed in production)
    if (selectedPreferences.length > 0) {
      console.log('🔍 RestaurantDetailPage: Filtering', menuItems.length, 'items by preferences:', selectedPreferences);
      console.log('🔍 RestaurantDetailPage: Showing', preferenceFilteredItems.length, 'filtered items');
    }
    
    if (userType === 'normal') {
      // For normal users: Backend already filtered for always-available items
      // Show preference-filtered items for both lunch and dinner since they're available every day/meal
      return { 
        lunch: preferenceFilteredItems, 
        dinner: preferenceFilteredItems 
      };
    } else {
      // For pro users: Filter preference-filtered items based on availability for the active day
      const lunchItems = preferenceFilteredItems.filter(item => {
        return item.availability && item.availability[activeDay]?.lunch;
      });
      const dinnerItems = preferenceFilteredItems.filter(item => {
        return item.availability && item.availability[activeDay]?.dinner;
      });
      
      return { lunch: lunchItems, dinner: dinnerItems };
    }
  }, [menuItems, activeDay, userType, selectedPreferences]);

  // Organize items by day and meal type based on user type
  const weeklyMenuData = useMemo(() => {
    if (!menuItems || menuItems.length === 0) return {};
    
    const weekData = {};
    
    DAYS_OF_WEEK.forEach(day => {
      weekData[day.id] = {
        lunch: [],
        dinner: []
      };
    });

    if (userType === 'normal') {
      // For normal users: Backend already filtered for always-available items
      // Show all items for every day since they're available every day/meal
      const filteredItems = applyPreferenceFilter(menuItems, selectedPreferences);
      
      DAYS_OF_WEEK.forEach(day => {
        weekData[day.id] = {
          lunch: filteredItems,  // All always-available items for lunch
          dinner: filteredItems  // All always-available items for dinner
        };
      });
    } else {
      // For pro users: Same logic but with more detailed availability checking
      const filteredItems = applyPreferenceFilter(menuItems, selectedPreferences);
      
      DAYS_OF_WEEK.forEach(day => {
        const lunchItems = filteredItems.filter(item => 
          item.availability && item.availability[day.id]?.lunch
        );
        const dinnerItems = filteredItems.filter(item => 
          item.availability && item.availability[day.id]?.dinner
        );
        
        weekData[day.id] = {
          lunch: lunchItems,
          dinner: dinnerItems
        };
      });
    }

    return weekData;
  }, [menuItems, userType, selectedPreferences]);

  // Handle add to plan for weekly builder (UPDATED FOR MULTI-RESTAURANT)
  const handleAddToPlan = async (item, day, mealType) => {
    // Check authentication first
    if (!isAuthenticated) {
      // Store current page URL for redirect after login
      if (typeof window !== 'undefined') {
        const currentUrl = window.location.pathname + window.location.search;
        localStorage.setItem('redirectAfterLogin', currentUrl);
      }
      
      // Show login modal
      openLoginModal();
      showError('Please log in to add items to your meal plan');
      return;
    }

    // MULTI-RESTAURANT LOGIC: Check if restaurant needs to be added
    if (!isRestaurantSelected(restaurant.id)) {
      if (!canAddRestaurant()) {
        // Show restaurant limit message
        setRestaurantLimitMessage(`Maximum ${maxRestaurants} restaurants allowed. You currently have ${getSelectedRestaurantCount()} restaurants selected.`);
        setShowRestaurantLimitModal(true);
        return;
      }
      
      // Add restaurant to selection
      const success = addSelectedRestaurant(restaurant.id, restaurant.name, restaurant);
      if (!success) {
        showError('Failed to add restaurant to selection');
        return;
      }
      
      // showMealPlanSuccess(`Added ${restaurant.name} to your restaurant selection!`, '', '', restaurant.name, 0); // Temporarily commented out
    }

    // Add item to meal plan (restaurant is now guaranteed to be selected)
    const result = await addItemToPlanWeek(item, day, mealType, restaurant.name, contextWeek, userType, false, restaurant.id);
    if (result.success) {
      // showMealPlanSuccess(item.name, day, mealType, restaurant.name, item.price); // Temporarily commented out
    } else if (result.error === 'AUTHENTICATION_REQUIRED') {
      openLoginModal();
      showError(result.message);
    } else {
      showError(result.message || 'Failed to add item to meal plan');
    }
  };

  // Handle final add to plan from day/meal selector (UPDATED FOR MULTI-RESTAURANT)
  const handleConfirmAddToPlan = async () => {
    if (selectedItem) {
      // MULTI-RESTAURANT LOGIC: Check if restaurant needs to be added
      if (!isRestaurantSelected(restaurant.id)) {
        if (!canAddRestaurant()) {
          // Show restaurant limit message
          setRestaurantLimitMessage(`Maximum ${maxRestaurants} restaurants allowed. You currently have ${getSelectedRestaurantCount()} restaurants selected.`);
          setShowRestaurantLimitModal(true);
          setShowDayMealSelector(false);
          return;
        }
        
        // Add restaurant to selection
        const success = addSelectedRestaurant(restaurant.id, restaurant.name, restaurant);
        if (!success) {
          showError('Failed to add restaurant to selection');
          return;
        }
        
        // showMealPlanSuccess(`Added ${restaurant.name} to your restaurant selection!`, '', '', restaurant.name, 0); // Temporarily commented out
      }

      // Add item to meal plan
      const result = await addItemToPlanWeek(selectedItem, activeDay, selectedMealType, restaurant.name, contextWeek, userType, false, restaurant.id);
      if (result.success) {
        // showMealPlanSuccess(selectedItem.name, activeDay, selectedMealType, restaurant.name, selectedItem.price); // Temporarily commented out
        setShowDayMealSelector(false);
        setSelectedItem(null);
      } else if (result.error === 'AUTHENTICATION_REQUIRED') {
        openLoginModal();
        showError(result.message);
      } else {
        showError(result.message || 'Failed to add item to meal plan');
      }
    }
  };

  // Handle cancel add to plan
  const handleCancelAddToPlan = () => {
    setShowDayMealSelector(false);
    setSelectedItem(null);
  };

  // Handle item click to show details
  const handleItemClick = (item) => {
    setSelectedDetailItem(item);
    setShowItemDetails(true);
  };

  // Handle remove from plan (week-aware)
  const handleRemoveFromPlan = (item) => {
    // Find the meal plan item with matching item id
    const mealItems = getWeekMealItems(activeDay, selectedMealType, contextWeek);
    const mealPlanItem = mealItems.find(mealItem => mealItem.id === item.id);
    
    if (mealPlanItem && mealPlanItem.planId) {
      // Use week-specific remove function
      removeItemFromPlanWeek(mealPlanItem.planId, activeDay, selectedMealType, contextWeek);
    } else {
      console.warn('Could not find meal plan item to remove:', item.id);
    }
  };

  // Handle close item details
  const handleCloseItemDetails = () => {
    setShowItemDetails(false);
    setSelectedDetailItem(null);
  };

  // Handle add to plan from item details (UPDATED FOR MULTI-RESTAURANT)
  const handleAddToPlanFromDetails = async (item) => {
    // MULTI-RESTAURANT LOGIC: Check if restaurant needs to be added
    if (!isRestaurantSelected(restaurant.id)) {
      if (!canAddRestaurant()) {
        // Show restaurant limit message
        setRestaurantLimitMessage(`Maximum ${maxRestaurants} restaurants allowed. You currently have ${getSelectedRestaurantCount()} restaurants selected.`);
        setShowRestaurantLimitModal(true);
        setShowItemDetails(false);
        return;
      }
      
      // Add restaurant to selection
      const success = addSelectedRestaurant(restaurant.id, restaurant.name, restaurant);
      if (!success) {
        showError('Failed to add restaurant to selection');
        return;
      }
      
      // showMealPlanSuccess(`Added ${restaurant.name} to your restaurant selection!`, '', '', restaurant.name, 0); // Temporarily commented out
    }

    // Add item directly to plan with selected day and meal (week-aware)
    const result = await addItemToPlanWeek(item, activeDay, selectedMealType, restaurant.name, contextWeek, userType, false, restaurant.id);
    
    if (result.success) {
      // showMealPlanSuccess(item.name, activeDay, selectedMealType, restaurant.name, item.price); // Temporarily commented out
      
      // Close the item details modal
      setShowItemDetails(false);
      setSelectedDetailItem(null);
    } else if (result.error === 'AUTHENTICATION_REQUIRED') {
      // Store current page URL for redirect after login
      if (typeof window !== 'undefined') {
        const currentUrl = window.location.pathname + window.location.search;
        localStorage.setItem('redirectAfterLogin', currentUrl);
      }
      
      // Show login modal
      openLoginModal();
      showError(result.message);
    } else {
      showError(result.message || 'Failed to add item to meal plan');
    }
  };

  // getTotalItemsCount is now available from useMealPlan context

  // Handle restaurant limit modal close
  const handleCloseRestaurantLimitModal = () => {
    setShowRestaurantLimitModal(false);
    setRestaurantLimitMessage('');
  };

  // Get dynamic button classes based on footer visibility and selection status
  const getButtonClasses = (isSelected, isMenuBrowse = false) => {
    const baseClasses = "font-bold py-4 px-8 rounded-xl shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 flex items-center space-x-3 whitespace-nowrap";
    
    if (isMenuBrowse) {
      // Back to Weekly Menu button - always red
      return `${baseClasses} bg-gradient-to-r from-grub-red to-red-600 hover:from-red-600 hover:to-red-700 text-white`;
    }
    
    if (isSelected) {
      // Selected restaurant - always green
      return `${baseClasses} bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white`;
    }
    
    // Non-selected restaurant - changes based on footer visibility
    if (isFooterVisible) {
      // When footer is visible, use blue to contrast with red footer
      return `${baseClasses} bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white`;
    } else {
      // When footer is not visible, use red
      return `${baseClasses} bg-gradient-to-r from-grub-red to-red-600 hover:from-red-600 hover:to-red-700 text-white`;
    }
  };

  // Handle "Select This Restaurant" button click (UPDATED FOR MULTI-RESTAURANT)
  const handleSelectRestaurant = () => {
    console.log('🔄 handleSelectRestaurant called - Multi-Restaurant Mode');
    
    const restaurantId = restaurant?.id || id;
    const restaurantName = restaurant?.name || 'Unknown Restaurant';
    
    // Check if restaurant is already selected
    if (isRestaurantSelected(restaurantId)) {
      console.log('✅ Restaurant already selected, navigating directly');
      
      // Navigate back to the appropriate page based on source
      if (contextSource === 'daily-meal-plan') {
        navigate(`/meal-plan/${contextDay}?week=${contextWeek}`);
      } else {
        navigateToWeeklyMenuWithRestaurant(navigate, setSelectedRestaurant, restaurantId, restaurantName, restaurant, contextWeek);
      }
      return;
    }
    
    // Check if we can add more restaurants
    if (!canAddRestaurant()) {
      console.log('⚠️ Cannot add more restaurants - limit reached');
      setRestaurantLimitMessage(`You've reached the maximum of ${maxRestaurants} restaurants. You currently have: ${selectedRestaurants.map(r => r.restaurantName).join(', ')}`);
      setShowRestaurantLimitModal(true);
      return;
    }
    
    // Add restaurant to selection
    console.log('✅ Adding restaurant to selection:', restaurantName);
    const success = addSelectedRestaurant(restaurantId, restaurantName, restaurant);
    if (!success) {
      showError('Failed to add restaurant to selection');
      return;
    }
    
    // Show success message and navigate
    // showMealPlanSuccess(`Added ${restaurantName} to your restaurant selection!`, '', '', restaurantName, 0); // Temporarily commented out
    
    // Navigate back to the appropriate page based on source
    if (contextSource === 'daily-meal-plan') {
      // Save restaurant to database first
      const restaurantObject = restaurant || {
        id: restaurantId,
        name: restaurantName,
        isApiRestaurant: true
      };
      setSelectedRestaurant(restaurantObject);
      
      // Navigate back to daily meal plan page with context
      setTimeout(() => {
        navigate(`/meal-plan/${contextDay}?week=${contextWeek}`);
      }, 100);
    } else {
      // Default behavior for weekly menu
      navigateToWeeklyMenuWithRestaurant(navigate, setSelectedRestaurant, restaurantId, restaurantName, restaurant, contextWeek);
    }
  };

  // Handle user type selection
  const handleUserTypeSelection = (selectedUserType) => {
    setUserType(selectedUserType);
    setShowUserTypeModal(false);
    setHasSelectedUserType(true);
  };

  // Handle preference selection after user type is chosen
  const handlePreferenceSelection = (preferences) => {
    setSelectedPreferences(preferences);
    setShowPreferences(false);
  };

  // Check if an item is already in the meal plan (week-aware)
  const isItemInPlan = (itemId) => {
    const mealItems = getWeekMealItems(activeDay, selectedMealType, contextWeek);
    return mealItems.some(planItem => planItem.id === itemId);
  };

  // Get meal plan entries for a specific item (week-aware)
  const getItemPlanEntries = (itemId) => {
    const mealItems = getWeekMealItems(activeDay, selectedMealType, contextWeek);
    return mealItems.filter(planItem => planItem.id === itemId);
  };

  // Helper functions
  const getPageTitle = () => {
    if (isFromMenuSelection) {
      const dayName = DAYS_OF_WEEK.find(d => d.id === contextDay)?.name || contextDay;
      const slotName = contextSlot.charAt(0).toUpperCase() + contextSlot.slice(1);
      
      if (contextUserType === 'normal') {
        return `Build Your ${dayName} ${slotName} Plan`;
      } else {
        return `Build Your ${dayName} Plan`;
      }
    }
    return restaurant.name;
  };

  const getPageDescription = () => {
    if (isFromMenuSelection) {
      return `Choose from ${restaurant.name}'s delicious menu items for your meal plan`;
    }
    return restaurant.description;
  };

  // Scroll detection for navbar indicator
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (userType !== 'pro') {
            setShowNavbarIndicator(false);
            ticking = false;
            return;
          }

          const menuItemsSection = document.querySelector(`[data-menu-items-section="${userType}"]`);
          
          if (menuItemsSection) {
            const rect = menuItemsSection.getBoundingClientRect();
            const shouldShowNavbar = rect.top <= 150;
            setShowNavbarIndicator(shouldShowNavbar);
          } else {
            const scrollY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
            const shouldShowNavbar = scrollY > 600;
            setShowNavbarIndicator(shouldShowNavbar);
          }
          
          ticking = false;
        });
        ticking = true;
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [userType]);

  // Scroll helper functions
  const scrollToPreferences = () => {
    const element = document.querySelector('[data-preferences-section]');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const scrollToMenuItems = () => {
    const element = document.querySelector(`[data-menu-items-section="${userType}"]`);
    if (element) {
      const elementRect = element.getBoundingClientRect();
      const absoluteElementTop = elementRect.top + window.pageYOffset;
      const middle = absoluteElementTop - (window.innerHeight / 2);
      window.scrollTo({ top: middle, behavior: 'smooth' });
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-grub-red mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Restaurant</h2>
          <p className="text-gray-600">Please wait while we fetch the menu...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Restaurant</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/plan')}
            className="bg-grub-red text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors duration-200"
          >
            Back to Planning
          </button>
        </div>
      </div>
    );
  }

  return (
        <div className="min-h-screen bg-gray-50">
      <RestaurantHero 
        restaurant={restaurant}
        pageTitle={getPageTitle()}
        pageDescription={getPageDescription()}
        isSelected={isRestaurantSelected(restaurant.id)}
      />


      {/* Floating Preferences Filter Button */}
      <FloatingPreferencesButton 
        selectedPreferences={selectedPreferences}
        onPreferencesClick={setShowPreferences}
        scrollToPreferences={scrollToPreferences}
      />

      {/* User Type Toggle - Pro option disabled */}
      <UserTypeToggle 
        userType={userType}
        onUserTypeChange={setUserType}
        disableProOption={true}
      />

      {/* Floating Navbar */}
      <FloatingNavbar 
        showNavbarIndicator={showNavbarIndicator}
        userType={userType}
        selectedMealType={selectedMealType}
        activeDay={activeDay}
        selectedPreferences={selectedPreferences}
        isFromMenuSelection={isFromMenuSelection}
        onMealTypeChange={setSelectedMealType}
        onDayChange={setActiveDay}
        onPreferencesClick={() => {
          setShowPreferences(true);
          scrollToPreferences();
        }}
        scrollToMenuItems={scrollToMenuItems}
      />

      {/* Content Based on User Type */}
      {userType === 'normal' ? (
        // Normal User Experience
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="max-w-7xl mx-auto">
            {/* Weekly Menu Builder - Main Content */}
            <div>
              {/* Preferences Selector */}
              {hasSelectedUserType && (
                <div className="mb-6" data-preferences-section>
                  <PreferencesSelector 
                    selectedPreferences={selectedPreferences}
                    onPreferencesChange={setSelectedPreferences}
                    showPreferences={showPreferences}
                    onTogglePreferences={setShowPreferences}
                    userType={userType}
                  />
                </div>
              )}

              {/* Menu Items Grid */}
              {hasSelectedUserType && (() => {
                console.log('🍽️ Normal User MenuItemsGrid - selectedMealType:', selectedMealType);
                console.log('🍽️ Normal User MenuItemsGrid - allFoodItems:', allFoodItems);
                console.log('🍽️ Normal User MenuItemsGrid - items being passed:', allFoodItems[selectedMealType]);
                return (
                  <MenuItemsGrid 
                    items={allFoodItems[selectedMealType] || []}
                  userType={userType}
                  selectedDay={activeDay}
                  selectedMealType={selectedMealType}
                  restaurantName={restaurant.name}
                  onItemClick={handleItemClick}
                  onAddToPlan={(item) => handleAddToPlan(item, activeDay, selectedMealType)}
                  onRemoveFromPlan={handleRemoveFromPlan}
                  isItemInPlan={isItemInPlan}
                  getItemPlanEntries={getItemPlanEntries}
                  title="Menu Items"
                  subtitle={isMealPlanningEnabled ? "Click any item to add to your plan" : "Browse our delicious menu items"}
                    emptyStateMessage="No menu items available"
                    isFromMenuSelection={isFromMenuSelection}
                    isMealPlanningEnabled={isMealPlanningEnabled}
                    week={contextWeek}
                  />
                );
              })()}
          </div>
        </div>
        </div>
      ) : (
        // Pro User Experience
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div>
            {/* Enhanced Menu Builder - Main Content */}
            <div>
              {/* Pro Header */}

              {/* Preferences Selector for Pro Users */}
              <div className="mb-6" data-preferences-section>
                <PreferencesSelector 
                  selectedPreferences={selectedPreferences}
                  onPreferencesChange={setSelectedPreferences}
                  showPreferences={showPreferences}
                  onTogglePreferences={setShowPreferences}
                  userType={userType}
                />
              </div>

              {/* Pro User Features */}
              <ProUserFeatures 
                activeDay={activeDay}
                selectedMealType={selectedMealType}
                isFromMenuSelection={isFromMenuSelection}
                onDayChange={setActiveDay}
                onMealTypeChange={setSelectedMealType}
              />

              {/* Pro Menu Items Grid */}
              <MenuItemsGrid 
                items={weeklyMenuData[activeDay]?.[selectedMealType] || []}
                userType={userType}
                selectedDay={activeDay}
                selectedMealType={selectedMealType}
                restaurantName={restaurant.name}
                onItemClick={handleItemClick}
                onAddToPlan={(item) => handleAddToPlan(item, activeDay, selectedMealType)}
                onRemoveFromPlan={handleRemoveFromPlan}
                isItemInPlan={isItemInPlan}
                getItemPlanEntries={getItemPlanEntries}
                title={`${selectedMealType === 'lunch' ? 'Lunch' : 'Dinner'} Planning`}
                subtitle={isMealPlanningEnabled ? `Planning for ${DAYS_OF_WEEK.find(d => d.id === activeDay)?.name}` : "Browse our delicious menu items"}
                emptyStateMessage={`No ${selectedMealType} items available for ${DAYS_OF_WEEK.find(d => d.id === activeDay)?.name}`}
                showProBadges={true}
                isMealPlanningEnabled={isMealPlanningEnabled}
                isFromMenuSelection={isFromMenuSelection}
                week={contextWeek}
              />
            </div>
          </div>
        </div>
      )}


      {/* Action Button - Only show when NOT in meal planning mode */}
      {!isMealPlanningEnabled && (
        <div className="fixed bottom-20 sm:bottom-6 left-1/2 transform -translate-x-1/2 z-50">
          <button
            onClick={contextSource === 'menu-browse' ? () => navigate(`/weekly-menu`) : 
                     contextSource === 'daily-meal-plan' ? handleSelectRestaurant :
                     handleSelectRestaurant}
            className={getButtonClasses(
              isRestaurantSelected(restaurant.id), 
              contextSource === 'menu-browse'
            )}
          >
            {contextSource === 'menu-browse' ? (
              <>
                <span>Back to Weekly Menu</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </>
            ) : isRestaurantSelected(restaurant.id) ? (
              <>
                <span>Selected Restaurant</span>
              </>
            ) : (
              <>
                <span>Select This Restaurant</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        </div>
      )}

      {/* Back Button - Only show when IN meal planning mode */}
      {isMealPlanningEnabled && (
        <>
          {/* Quick Day/Slot Indicator - Top right corner */}
          <div className="fixed top-20 right-4 z-[60]">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 px-4 py-2 text-center">
              <div className="text-xs text-gray-600">Currently planning</div>
              <div className="text-sm font-semibold text-grub-red">
                {DAYS_OF_WEEK.find(d => d.id === activeDay)?.name} {selectedMealType.charAt(0).toUpperCase() + selectedMealType.slice(1)}
              </div>
            </div>
          </div>
          
          {/* Back Button - Same position as Select Restaurant button */}
          <div className="fixed bottom-20 sm:bottom-6 left-1/2 transform -translate-x-1/2 z-50">
            <button
              onClick={() => {
                if (contextSource === 'daily-meal-plan') {
                  navigate(`/meal-plan/${contextDay}?week=${contextWeek}`);
                } else {
                  navigate('/weekly-menu');
                }
              }}
              className={getButtonClasses(false, false)}
            >
              <span>
                {contextSource === 'daily-meal-plan' ? 'Back to Daily Meal Plan' : 'Back to Weekly Planning'}
              </span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
          </div>
        </>
      )}

      {/* Item Details Modal */}
      <ItemDetailsModal 
        isOpen={showItemDetails}
        item={selectedDetailItem}
        userType={userType}
        activeDay={activeDay}
        selectedMealType={selectedMealType}
        isFromMenuSelection={isFromMenuSelection}
        onClose={handleCloseItemDetails}
        onAddToPlan={handleAddToPlanFromDetails}
        onDayChange={setActiveDay}
        onMealTypeChange={setSelectedMealType}
        isMealPlanningEnabled={isMealPlanningEnabled}
      />


      {/* Restaurant Limit Notification Modal */}
      {showRestaurantLimitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-t-lg">
              <div className="flex items-center">
                <div className="text-white mr-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold">Restaurant Limit Reached</h3>
              </div>
              <p className="text-blue-100 text-sm mt-2">
                Multi-restaurant meal planning
              </p>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start">
                  <div className="text-blue-600 mr-3 mt-0.5">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-blue-800 font-medium">Multi-Restaurant Feature</p>
                    <p className="text-xs text-blue-700 mt-1">
                      {restaurantLimitMessage}
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-600">
                <p className="mb-2">To add this restaurant:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Go to your Weekly Menu and remove a restaurant</li>
                  <li>Or complete your current meal plan first</li>
                </ul>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 pb-6 flex space-x-3">
              <button
                onClick={handleCloseRestaurantLimitModal}
                className="flex-1 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition-colors duration-200"
              >
                Got It
              </button>
              <button
                onClick={() => {
                  handleCloseRestaurantLimitModal();
                  navigate('/weekly-menu');
                }}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200"
              >
                Go to Weekly Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Type Selection Modal - Temporarily commented out */}
      {/* <UserTypeSelectionModal
        isOpen={showUserTypeModal}
        onClose={() => setShowUserTypeModal(false)}
        onConfirm={handleUserTypeSelection}
        restaurantName={restaurant?.name || 'this restaurant'}
      /> */}
      </div>
  );
};

export default RestaurantDetailPage;
