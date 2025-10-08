import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { unifiedRestaurants } from '../data/unifiedRestaurants';
import { DAYS_OF_WEEK } from '../utils/filteringAlgorithms';
import { applyPreferenceFilter } from '../utils/filteringHelpers';
import { useMealPlan } from '../contexts/MealPlanContext';
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
import RestaurantSwitchModal from '../components/modals/RestaurantSwitchModal';

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
  
  // Only allow meal planning when coming from weekly-menu workflow with day/slot context
  // Disable meal planning for menu browsing (View Full Menu button) and general restaurant browsing
  const isMealPlanningEnabled = contextSource === 'weekly-menu' && isFromMenuSelection;
  
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
    addItemToPlan, 
    removeItemFromPlan, 
    clearAllPlan,
    // Week-specific functions
    addItemToPlanWeek,
    removeItemFromPlanWeek,
    getWeekMealItems,
    getRestaurantsInWeekPlan,
    getWeekTotalItems,
    getRestaurantsInAllWeeks,
    clearWeek,
    // Restaurant selection functions
    setSelectedRestaurant,
    clearSelectedRestaurant,
    clearAllMealPlanData,
    // Restaurant selection state
    selectedRestaurantId: mealPlanSelectedRestaurantId,
    selectedRestaurantName: mealPlanSelectedRestaurantName,
    selectedRestaurantData: mealPlanSelectedRestaurantData
  } = useMealPlan();
  
  // Toast context
  const { showMealPlanSuccess, showError } = useToast();
  
  // Planning context (get postal code, preferences, and restaurant selection)
  const { postalCode, selectedPreferences: planningPreferences, updateSelectedRestaurant } = usePlanning();

  // Auth context
  const { isAuthenticated, user } = useAuth();
  
  // Debug: Log restaurant data when it changes
  useEffect(() => {
    console.log('🔍 RestaurantDetailPage - Restaurant data changed:');
    console.log('🔍 selectedRestaurantId:', mealPlanSelectedRestaurantId);
    console.log('🔍 selectedRestaurantName:', mealPlanSelectedRestaurantName);
    console.log('🔍 selectedRestaurantData:', mealPlanSelectedRestaurantData);
    console.log('🔍 Type of restaurant ID:', typeof mealPlanSelectedRestaurantId);
    console.log('🔍 Type of restaurant name:', typeof mealPlanSelectedRestaurantName);
  }, [mealPlanSelectedRestaurantId, mealPlanSelectedRestaurantName, mealPlanSelectedRestaurantData]);

  // Modal context
  const { openLoginModal } = useModal();

  // State for user type selection (show modal on first visit)
  const [showUserTypeModal, setShowUserTypeModal] = useState(false); // Disabled modal
  const [hasSelectedUserType, setHasSelectedUserType] = useState(true); // Default to true since modal is disabled

  // State for restaurant switch confirmation
  const [showRestaurantSwitchModal, setShowRestaurantSwitchModal] = useState(false);
  const [pendingItem, setPendingItem] = useState(null);
  const [switchModalData, setSwitchModalData] = useState(null);

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

  // Handle add to plan for weekly builder
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

    // For pro users, add directly using current day/meal selection (week-aware)
    if (userType === 'pro') {
      const result = await addItemToPlanWeek(item, day, mealType, restaurant.name, contextWeek, userType, false, restaurant.id);
      if (result.success) {
        showMealPlanSuccess(item.name, day, mealType, restaurant.name, item.price);
      } else if (result.error === 'AUTHENTICATION_REQUIRED') {
        openLoginModal();
        showError(result.message);
      }
    }
    // For normal users, this function won't be called directly from cards
    // They will use handleAddToPlanFromDetails instead
  };

  // Handle final add to plan from day/meal selector
  const handleConfirmAddToPlan = async () => {
    if (selectedItem) {
      const result = await addItemToPlanWeek(selectedItem, activeDay, selectedMealType, restaurant.name, contextWeek, userType, false, restaurant.id);
      if (result.success) {
        showMealPlanSuccess(selectedItem.name, activeDay, selectedMealType, restaurant.name, selectedItem.price);
        setShowDayMealSelector(false);
        setSelectedItem(null);
        // Removed automatic scrolling to prevent unwanted scroll behavior
      } else if (result.error === 'RESTAURANT_SWITCH_CONFIRMATION') {
        // Show confirmation modal for restaurant switch
        setPendingItem({ item: selectedItem, day: activeDay, mealType: selectedMealType });
        setSwitchModalData({
          existingRestaurant: result.existingRestaurant,
          newRestaurant: result.newRestaurant,
          itemCount: getTotalItemsCount()
        });
        setShowRestaurantSwitchModal(true);
        setShowDayMealSelector(false); // Close the day/meal selector
      } else if (result.error === 'AUTHENTICATION_REQUIRED') {
        openLoginModal();
        showError(result.message);
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

  // Handle add to plan from item details
  const handleAddToPlanFromDetails = async (item) => {
    // Add item directly to plan with selected day and meal (week-aware)
    const result = await addItemToPlanWeek(item, activeDay, selectedMealType, restaurant.name, contextWeek, userType, false, restaurant.id);
    
    if (result.success) {
      showMealPlanSuccess(item.name, activeDay, selectedMealType, restaurant.name, item.price);
      
      // Close the item details modal
      setShowItemDetails(false);
      setSelectedDetailItem(null);
    } else {
      // Handle restaurant restriction errors
      if (result.error === 'RESTAURANT_SWITCH_CONFIRMATION') {
        // Show confirmation modal for restaurant switch
        setPendingItem({ item, day: activeDay, mealType: selectedMealType });
        setSwitchModalData({
          existingRestaurant: result.existingRestaurant,
          newRestaurant: result.newRestaurant,
          itemCount: getTotalItemsCount()
        });
        setShowRestaurantSwitchModal(true);
      } else if (result.error === 'AUTHENTICATION_REQUIRED') {
        // Store current page URL for redirect after login
        if (typeof window !== 'undefined') {
          const currentUrl = window.location.pathname + window.location.search;
          localStorage.setItem('redirectAfterLogin', currentUrl);
        }
        
        // Show login modal
        openLoginModal();
        showError(result.message);
      }
    }
  };

  // Helper function to get total items count across all weeks
  const getTotalItemsCount = () => {
    return getWeekTotalItems(0) + getWeekTotalItems(1);
  };

  // Handle restaurant switch confirmation
  const handleConfirmRestaurantSwitch = async () => {
    if (pendingItem) {
      if (pendingItem.action === 'SELECT_RESTAURANT') {
        // Handle restaurant selection - clear all meal plan data and navigate
        console.log('🔄 Confirming restaurant switch to:', pendingItem.restaurantName);
        
        // Clear all meal plan data and restaurant selection (with immediate database save)
        clearAllMealPlanData();
        
        // Save new restaurant selection to database
        setSelectedRestaurant(pendingItem.restaurantId, pendingItem.restaurantName, restaurant);
        
        // Close modal
        setShowRestaurantSwitchModal(false);
        setSwitchModalData(null);
        setPendingItem(null);
        
        // Navigate to weekly menu (database will show selected restaurant)
        const navigationUrl = `/weekly-menu?week=${pendingItem.week}`;
        console.log('🔄 Navigating to:', navigationUrl);
        navigate(navigationUrl);
        
        // Show success message
        showMealPlanSuccess('Restaurant switched successfully!', '', '', pendingItem.restaurantName, 0);
        
      } else {
        // Handle item addition with force replace flag (week-aware)
        const result = await addItemToPlanWeek(
          pendingItem.item, 
          pendingItem.day, 
          pendingItem.mealType, 
          restaurant.name, 
          contextWeek,
          userType, 
          true, // forceReplace = true
          restaurant.id // restaurantId
        );
        
        if (result.success) {
          showMealPlanSuccess(pendingItem.item.name, pendingItem.day, pendingItem.mealType, restaurant.name, pendingItem.item.price);
          
          // Close modals
          setShowRestaurantSwitchModal(false);
          setShowItemDetails(false);
          setSelectedDetailItem(null);
          
          // Clear pending data
          setPendingItem(null);
          setSwitchModalData(null);
        }
      }
    }
  };

  const handleCancelRestaurantSwitch = () => {
    setShowRestaurantSwitchModal(false);
    setPendingItem(null);
    setSwitchModalData(null);
  };

  // Handle "Select This Restaurant" button click
  const handleSelectRestaurant = () => {
    console.log('🔄 handleSelectRestaurant called');
    console.log('🔄 Restaurant data:', restaurant);
    console.log('🔄 Restaurant ID from URL params:', id);
    console.log('🔄 Restaurant ID from restaurant object:', restaurant?.id);
    console.log('🔄 User type:', userType);
    console.log('🔄 Context week:', contextWeek);
    
    // Use the ID from URL params if restaurant.id is not available
    const restaurantId = restaurant?.id || id;
    const restaurantName = restaurant?.name || 'Unknown Restaurant';
    
    console.log('🔄 Using restaurantId:', restaurantId);
    console.log('🔄 Using restaurantName:', restaurantName);
    console.log('🔄 User type check:', userType, 'typeof:', typeof userType);
    
    // Determine user type from auth context (like WeeklyMenuPage does)
    const actualUserType = user?.userType || 'normal';
    console.log('🔄 Actual user type from auth:', actualUserType);
    console.log('🔄 State userType (from URL):', userType);
    
    // Pro users can always navigate directly - no restrictions
    if (actualUserType === 'pro') {
      console.log('🔄 Pro user detected - navigating directly');
      navigateToWeeklyMenuWithRestaurant(navigate, setSelectedRestaurant, restaurantId, restaurantName, restaurant, contextWeek);
      return;
    }
    
    console.log('🔄 Normal user detected - continuing with conflict checking...');
    
    // For normal users, check for existing selected restaurant in database
    console.log('🔍 Checking existing selected restaurant...');
    console.log('🔍 Current selectedRestaurantId:', mealPlanSelectedRestaurantId);
    console.log('🔍 Current selectedRestaurantName:', mealPlanSelectedRestaurantName);
    console.log('🔍 Current restaurantId (from URL/data):', restaurantId);
    console.log('🔍 Current restaurantName (from data):', restaurantName);
    console.log('🔍 Restaurant ID comparison:', mealPlanSelectedRestaurantId, '===', restaurantId, '?', mealPlanSelectedRestaurantId === restaurantId);
    console.log('🔍 Restaurant Name comparison:', mealPlanSelectedRestaurantName, '===', restaurantName, '?', mealPlanSelectedRestaurantName === restaurantName);
    
    // If no restaurant selected yet, save selection and navigate directly
    if (!mealPlanSelectedRestaurantId && !mealPlanSelectedRestaurantName) {
      console.log('✅ No restaurant selected yet, saving selection and navigating directly');
      navigateToWeeklyMenuWithRestaurant(navigate, setSelectedRestaurant, restaurantId, restaurantName, restaurant, contextWeek);
      return;
    }
    
    // If same restaurant is selected, navigate directly (no data loss)
    // Convert both IDs to strings for comparison (in case one is ObjectId and other is string)
    const selectedIdStr = String(mealPlanSelectedRestaurantId);
    const currentIdStr = String(restaurantId);
    
    if (selectedIdStr === currentIdStr || mealPlanSelectedRestaurantName === restaurantName) {
      console.log('✅ Same restaurant selected, navigating directly');
      console.log('✅ ID match:', selectedIdStr === currentIdStr, 'Name match:', mealPlanSelectedRestaurantName === restaurantName);
      navigateToWeeklyMenuWithRestaurant(navigate, setSelectedRestaurant, restaurantId, restaurantName, restaurant, contextWeek);
      return;
    }
    
    // Different restaurant selected - show confirmation modal
    console.log('🚨 Different restaurant detected, showing confirmation modal');
    const totalItemsWeek0 = getWeekTotalItems(0);
    const totalItemsWeek1 = getWeekTotalItems(1);
    const totalItems = totalItemsWeek0 + totalItemsWeek1;
    
    console.log('🚨 Total items across weeks:', totalItems);
    console.log('🚨 Setting modal data...');
    
    setSwitchModalData({
      existingRestaurant: mealPlanSelectedRestaurantName,
      newRestaurant: restaurantName,
      itemCount: totalItems
    });
    
    // Store the pending restaurant selection
    console.log('🚨 Setting pending item...');
    setPendingItem({
      action: 'SELECT_RESTAURANT',
      restaurantId: restaurantId,
      restaurantName: restaurantName,
      week: contextWeek
    });
    
    console.log('🚨 Setting modal to show...');
    setShowRestaurantSwitchModal(true);
    console.log('🚨 Modal should now be visible!');
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
                  onRemoveFromPlan={handleRemoveFromPlan}
                  isItemInPlan={isItemInPlan}
                  getItemPlanEntries={getItemPlanEntries}
                  title="Menu Items"
                  subtitle={isMealPlanningEnabled ? "Click any item to add to your plan" : "Browse our delicious menu items"}
                    emptyStateMessage="No menu items available"
                    isFromMenuSelection={isFromMenuSelection}
                    isMealPlanningEnabled={isMealPlanningEnabled}
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
                onRemoveFromPlan={handleRemoveFromPlan}
                isItemInPlan={isItemInPlan}
                getItemPlanEntries={getItemPlanEntries}
                title={`${selectedMealType === 'lunch' ? 'Lunch' : 'Dinner'} Planning`}
                subtitle={isMealPlanningEnabled ? `Planning for ${DAYS_OF_WEEK.find(d => d.id === activeDay)?.name}` : "Browse our delicious menu items"}
                emptyStateMessage={`No ${selectedMealType} items available for ${DAYS_OF_WEEK.find(d => d.id === activeDay)?.name}`}
                showProBadges={true}
                isMealPlanningEnabled={isMealPlanningEnabled}
              />
            </div>
          </div>
        </div>
      )}


      {/* Action Button - Only show when NOT in meal planning mode */}
      {!isMealPlanningEnabled && (
        <div className="fixed bottom-20 sm:bottom-6 left-1/2 transform -translate-x-1/2 z-50">
          <button
            onClick={contextSource === 'menu-browse' ? () => navigate(`/weekly-menu`) : handleSelectRestaurant}
            className="bg-gradient-to-r from-grub-red to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-4 px-8 rounded-xl shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 flex items-center space-x-3 whitespace-nowrap"
          >
            <span>{contextSource === 'menu-browse' ? 'Back to Weekly Menu' : 'Select This Restaurant'}</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={contextSource === 'menu-browse' ? "M10 19l-7-7m0 0l7-7m-7 7h18" : "M9 5l7 7-7 7"} />
            </svg>
          </button>
        </div>
      )}

      {/* Back to Weekly Planning Button - Only show when IN meal planning mode */}
      {isMealPlanningEnabled && (
        <div className="fixed bottom-20 sm:bottom-6 left-1/2 transform -translate-x-1/2 sm:left-6 sm:transform-none z-[60] flex flex-col gap-3">
          {/* Quick Day/Slot Indicator */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 px-4 py-2 text-center">
            <div className="text-xs text-gray-600">Currently planning</div>
            <div className="text-sm font-semibold text-grub-red">
              {DAYS_OF_WEEK.find(d => d.id === activeDay)?.name} {selectedMealType.charAt(0).toUpperCase() + selectedMealType.slice(1)}
            </div>
          </div>
          
          {/* Back to Weekly Planning Button */}
          <NextStepButton 
            destination={`/weekly-menu`}
            buttonText="Back to Weekly Planning"
            className="shadow-xl"
          />
        </div>
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


      {/* Restaurant Switch Confirmation Modal */}
      {console.log('🔍 RestaurantDetailPage Modal render - showRestaurantSwitchModal:', showRestaurantSwitchModal)}
      {console.log('🔍 RestaurantDetailPage Modal render - switchModalData:', switchModalData)}
      <RestaurantSwitchModal
        isOpen={showRestaurantSwitchModal}
        onClose={handleCancelRestaurantSwitch}
        onConfirm={handleConfirmRestaurantSwitch}
        existingRestaurant={switchModalData?.existingRestaurant}
        newRestaurant={switchModalData?.newRestaurant}
        itemCount={switchModalData?.itemCount}
      />

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
