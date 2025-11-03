import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMealPlan } from '../contexts/MealPlanContext_SSR_FIXED';
import { useToast } from '../contexts/ToastContext';
import { usePlanning } from '../contexts/PlanningContext';
import { useAuth } from '../contexts/AuthContext';
// Removed static data import - using API data only
import RestaurantSelectionModal from '../components/modals/RestaurantSelectionModal';
import RestaurantSwitchModal from '../components/modals/RestaurantSwitchModal';
import RestaurantContinueModal from '../components/modals/RestaurantContinueModal';
import RestaurantChoiceModal from '../components/modals/RestaurantChoiceModal';
import RestaurantReplacementModal from '../components/modals/RestaurantReplacementModal';
import mealCalendarApi from '../api/mealCalendarApi';

// Enhanced Meal Slot Component with more features
const EnhancedMealSlot = ({ day, mealType, actualMealItems, onRemoveItem, postalCode, selectedRestaurant, selectedWeek = 0, onShowRestaurantSelectionModal, isAuthenticated, hasLoadedFromDatabase, disabled = false, loading = false, getSelectedRestaurantCount, getSelectedRestaurants }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const hasItems = actualMealItems && actualMealItems.length > 0;
  const firstItem = hasItems ? actualMealItems[0] : null;
  const additionalCount = hasItems ? actualMealItems.length - 1 : 0;

  const handleSlotClick = () => {
    if (disabled) {
      return; // Don't allow clicks when disabled
    }
    
    if (hasItems) {
      navigate(`/meal-plan/${day}?week=${selectedWeek}`);
    } else {
      // Always show modal for empty slots - let the modal handler decide which modal to show
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
        group relative p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 min-h-[100px] sm:min-h-[120px] flex flex-col justify-center touch-manipulation
        ${disabled 
          ? 'cursor-not-allowed opacity-50 bg-gray-100 border-gray-300' 
          : hasItems 
            ? 'cursor-pointer border-grub-red bg-gradient-to-br from-red-50 to-orange-50 shadow-lg hover:shadow-xl hover:border-red-400 transform hover:scale-[1.02] hover:-translate-y-1 active:scale-95' 
            : 'cursor-pointer border-gray-200 bg-gradient-to-br from-white to-gray-50 hover:border-grub-red/60 hover:shadow-lg hover:from-red-50/30 hover:to-orange-50/30 transform hover:scale-[1.02] hover:-translate-y-1 active:scale-95'
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
                  className="sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 p-1 sm:p-1 rounded-full bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-700 touch-manipulation shadow-sm"
                  aria-label="Remove item"
                >
                  <svg className="w-3 h-3 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            {disabled ? (
              <>
                <div className="w-6 h-6 sm:w-10 sm:h-10 mx-auto bg-gray-200 rounded-full flex items-center justify-center">
                  {loading ? (
                    <svg className="w-3 h-3 sm:w-5 sm:h-5 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-3 h-3 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                    </svg>
                  )}
                </div>
                <div className="text-xs sm:text-sm text-gray-400">
                  {loading ? 'Checking Status...' : 'Subscription Active'}
                </div>
                <div className="text-xs text-gray-400">
                  {loading ? 'Please wait' : 'Planning disabled'}
                </div>
              </>
            ) : (
              <>
                <div className="w-6 h-6 sm:w-10 sm:h-10 mx-auto bg-gray-100 group-hover:bg-red-100 rounded-full flex items-center justify-center transition-colors duration-200">
                  <svg className="w-3 h-3 sm:w-5 sm:h-5 text-gray-400 group-hover:text-red-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div className="text-xs sm:text-sm text-gray-500 group-hover:text-gray-600 transition-colors duration-200">
                  Add {mealType}
                </div>
                <div className="hidden sm:flex text-xs text-grub-red/70 font-medium group-hover:text-red-600 transition-colors duration-200 items-center justify-center">
                  <span>
                    {isAuthenticated && !hasLoadedFromDatabase 
                      ? 'Loading...' 
                      : (() => {
                          const selectedCount = getSelectedRestaurantCount();
                          const selectedRestaurantsList = getSelectedRestaurants();
                          
                          
                          if (selectedCount === 0) {
                            return 'Browse restaurants';
                          } else if (selectedCount === 1) {
                            return `Browse ${selectedRestaurantsList[0]?.restaurantName || selectedRestaurantsList[0]?.name || 'restaurant'}`;
                          } else {
                            return 'Browse from selected restaurants';
                          }
                        })()
                    }
                  </span>
                  <svg className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </>
            )}
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
    weeklyPlan, 
    totalItems, 
    removeItemFromPlan, 
    removeItemFromPlanWeek,
    clearAllPlan, 
    clearDay,
    getWeekPlan,
    getWeekDayItems,
    getWeekMealItems,
    getWeekTotalItems,
    getWeekTotalCost,
    getWeeklyPlanSummary,
    clearWeek,
    getRestaurantsInPlan,
    getRestaurantsInWeekPlan,
    getRestaurantsInAllWeeks,
    getRestaurantIdsInWeekPlan,
    getRestaurantIdsInAllWeeks,
    // Multi-restaurant state and actions
    selectedRestaurants,
    maxRestaurants,
    addSelectedRestaurant,
    removeSelectedRestaurant,
    clearSelectedRestaurants,
    canAddRestaurant,
    isRestaurantSelected,
    getSelectedRestaurantCount,
    getSelectedRestaurants,
    // Legacy restaurant selection state and actions (for backward compatibility)
    selectedRestaurantId: mealPlanSelectedRestaurantId,
    selectedRestaurantName: mealPlanSelectedRestaurantName,
    selectedRestaurantData: mealPlanSelectedRestaurantData,
    setSelectedRestaurant,
    clearSelectedRestaurant,
    clearAllMealPlanData,
    clearItemsByRestaurant,
    // Loading states
    isLoadingFromDatabase,
    hasLoadedFromDatabase
  } = useMealPlan();
  const { showError, showSuccess, showInfo } = useToast();
  const { postalCode, selectedRestaurant: planningSelectedRestaurant, updateSelectedRestaurant } = usePlanning();
  const { isAuthenticated, user } = useAuth();
  const [isClient, setIsClient] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(0); // 0 = current week, 1 = next week, etc.
  
  // Subscription overlap state
  const [subscriptionStatus, setSubscriptionStatus] = useState({
    hasActiveSubscription: false,
    hasOverlap: false,
    overlapDetails: null,
    activeSubscription: null,
    loading: true
  });
  
  // Get restaurant info from URL parameters (moved to top to avoid reference errors)
  const urlRestaurantId = searchParams.get('restaurantId');
  const urlRestaurantName = searchParams.get('restaurantName');
  
  // CRITICAL FIX: Check if user just completed a subscription - redirect immediately
  useEffect(() => {
    const recentSubscriptionSuccess = sessionStorage.getItem('recentSubscriptionSuccess');
    if (recentSubscriptionSuccess) {
      console.log('✅ WeeklyMenuPage: Recent subscription detected, redirecting to meal calendar');
      sessionStorage.removeItem('recentSubscriptionSuccess');
      navigate('/meal-calendar', { replace: true });
    }
  }, [navigate]);
  
  // Debug: Log restaurant data when it changes
  useEffect(() => {
    console.log('🔍 WeeklyMenuPage - Restaurant data changed:');
    console.log('🔍 Database selectedRestaurantId:', mealPlanSelectedRestaurantId);
    console.log('🔍 Database selectedRestaurantName:', mealPlanSelectedRestaurantName);
    console.log('🔍 Database selectedRestaurantData:', mealPlanSelectedRestaurantData);
    console.log('🔍 URL restaurantId:', urlRestaurantId);
    console.log('🔍 URL restaurantName:', urlRestaurantName);
  }, [mealPlanSelectedRestaurantId, mealPlanSelectedRestaurantName, mealPlanSelectedRestaurantData, urlRestaurantId, urlRestaurantName]);

  // Clean up URL parameters on mount to ensure database is source of truth
  useEffect(() => {
    // If we have URL parameters but they don't match database, clean them up
    if (hasLoadedFromDatabase && (urlRestaurantId || urlRestaurantName)) {
      const shouldCleanUrl = 
        (mealPlanSelectedRestaurantId && urlRestaurantId && String(mealPlanSelectedRestaurantId) !== String(urlRestaurantId)) ||
        (mealPlanSelectedRestaurantName && urlRestaurantName && mealPlanSelectedRestaurantName !== decodeURIComponent(urlRestaurantName)) ||
        (!mealPlanSelectedRestaurantId && !mealPlanSelectedRestaurantName && (urlRestaurantId || urlRestaurantName));
      
      if (shouldCleanUrl) {
        console.log('🧹 Cleaning URL parameters - database is source of truth');
        const currentWeek = searchParams.get('week') || '0';
        navigate(`/weekly-menu?week=${currentWeek}`, { replace: true });
      }
    }
  }, [hasLoadedFromDatabase, urlRestaurantId, urlRestaurantName, mealPlanSelectedRestaurantId, mealPlanSelectedRestaurantName, navigate, searchParams]);
  
  // Restaurant selection modal state
  const [showRestaurantSelectionModal, setShowRestaurantSelectionModal] = useState(false);
  const [selectionModalData, setSelectionModalData] = useState(null);
  
  // Restaurant continue modal state (for when user has 1 restaurant)
  const [showRestaurantContinueModal, setShowRestaurantContinueModal] = useState(false);
  const [continueModalData, setContinueModalData] = useState(null);
  
  // Restaurant choice modal state (for when user has 2 restaurants)
  const [showRestaurantChoiceModal, setShowRestaurantChoiceModal] = useState(false);
  const [choiceModalData, setChoiceModalData] = useState(null);
  
  // Restaurant switch modal state
  const [showRestaurantSwitchModal, setShowRestaurantSwitchModal] = useState(false);
  const [switchModalData, setSwitchModalData] = useState(null);
  
  // Restaurant replacement modal state (for when user has 2 restaurants and wants to add 3rd)
  const [showRestaurantReplacementModal, setShowRestaurantReplacementModal] = useState(false);
  const [replacementModalData, setReplacementModalData] = useState(null);

  
  // DATABASE-FIRST restaurant selection logic - Database is single source of truth
  const selectedRestaurant = useMemo(() => {
    console.log('🔍 WeeklyMenuPage selectedRestaurant calculation (DATABASE FIRST):');
    console.log('🔍 URL restaurantId:', urlRestaurantId);
    console.log('🔍 Database selectedRestaurantId:', mealPlanSelectedRestaurantId);
    console.log('🔍 Database selectedRestaurantName:', mealPlanSelectedRestaurantName);
    console.log('🔍 isLoadingFromDatabase:', isLoadingFromDatabase);
    console.log('🔍 hasLoadedFromDatabase:', hasLoadedFromDatabase);
    
    // Wait for database loading to complete before making decisions
    if (isAuthenticated && !hasLoadedFromDatabase) {
      console.log('⏳ Still loading from database, waiting...');
      return null; // Don't show anything until database load is complete
    }
    
    // ONLY Priority: Database selected restaurant (single source of truth)
    if (mealPlanSelectedRestaurantId && mealPlanSelectedRestaurantName) {
      console.log('✅ Using database restaurant (SINGLE SOURCE OF TRUTH):', mealPlanSelectedRestaurantId, mealPlanSelectedRestaurantName);
      return {
        id: mealPlanSelectedRestaurantId,
        name: mealPlanSelectedRestaurantName,
        cuisine: 'Restaurant',
        rating: 4.5,
        reviewCount: 0,
        image: '/images/grub-gate-default-restaurant-img.jpg',
        isApiRestaurant: true
      };
    }
    
    // No restaurant selected in database (after loading is complete)
    console.log('❌ No restaurant selected - database is empty (ignoring URL params)');
    console.log('🔍 URL params ignored - database is single source of truth');
    return null;
  }, [
    mealPlanSelectedRestaurantId, 
    mealPlanSelectedRestaurantName,
    isLoadingFromDatabase,
    hasLoadedFromDatabase,
    isAuthenticated
  ]);

  // Update planning context when selected restaurant changes (in useEffect to avoid setState during render)
  useEffect(() => {
    if (selectedRestaurant && (!planningSelectedRestaurant || planningSelectedRestaurant.id !== selectedRestaurant.id)) {
      updateSelectedRestaurant(selectedRestaurant);
    }
  }, [selectedRestaurant, planningSelectedRestaurant, updateSelectedRestaurant]);

  // Check subscription status when component mounts or user authentication changes
  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      if (!isAuthenticated || !user) {
        setSubscriptionStatus({
          hasActiveSubscription: false,
          hasOverlap: false,
          overlapDetails: null,
          activeSubscription: null,
          loading: false
        });
        return;
      }

      try {
        console.log('🔍 Checking subscription status for user:', user._id);
        
        // Calculate date range for next 2 weeks (typical meal plan duration)
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() + 1); // Start from tomorrow
        
        const endDate = new Date(today);
        endDate.setDate(today.getDate() + 14); // 2 weeks from now
        
        const response = await mealCalendarApi.getSubscriptionStatus({
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        });

        console.log('✅ Subscription status received:', response.data);
        
        setSubscriptionStatus({
          hasActiveSubscription: response.data.hasActiveSubscription,
          hasOverlap: response.data.hasOverlap,
          overlapDetails: response.data.overlapDetails,
          activeSubscription: response.data.activeSubscription,
          loading: false
        });

      } catch (error) {
        console.error('❌ Error checking subscription status:', error);
        setSubscriptionStatus(prev => ({ ...prev, loading: false }));
      }
    };

    checkSubscriptionStatus();
  }, [isAuthenticated, user]);


  const selectedRestaurantId = selectedRestaurant?.id;
  const selectedRestaurantName = selectedRestaurant?.name;

  // Get current selected restaurants (not just ones with meals)
  const currentRestaurants = (() => {
    try {
      // Use selectedRestaurants array to show ALL selected restaurants, not just ones with meals
      const allSelectedRestaurants = getSelectedRestaurants();
      console.log('🏪 All selected restaurants:', allSelectedRestaurants);
      
      if (allSelectedRestaurants && allSelectedRestaurants.length > 0) {
        return allSelectedRestaurants.map(r => r.restaurantName);
      }
      
      // Fallback to restaurants with meals if no selected restaurants
      const restaurantsWithMeals = getRestaurantsInPlan();
      console.log('🏪 Restaurants with meals (fallback):', restaurantsWithMeals);
      return restaurantsWithMeals;
    } catch (error) {
      console.error('Error getting restaurants:', error);
      return [];
    }
  })();

  // Helper function to get next Sunday (immediate upcoming Sunday) - SSR-safe
  const getNextSunday = () => {
    if (!isClient) return new Date(); // Return current date during SSR to prevent hydration mismatch
    
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const daysUntilSunday = dayOfWeek === 0 ? 7 : 7 - dayOfWeek; // If today is Sunday, get next Sunday
    
    const nextSunday = new Date(today);
    nextSunday.setDate(today.getDate() + daysUntilSunday);
    nextSunday.setHours(0, 0, 0, 0); // Reset to start of day
    
    return nextSunday;
  };

  // Helper functions for date ranges (SSR-safe) - Starting from next Sunday
  const getWeekDateRange = (weekOffset = 0) => {
    if (!isClient) return ''; // Prevent SSR hydration mismatch
    
    const nextSunday = getNextSunday();
    const startOfWeek = new Date(nextSunday);
    startOfWeek.setDate(nextSunday.getDate() + (weekOffset * 7)); // Next Sunday + week offset
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday
    
    return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  const getFirstWeekDateRange = () => getWeekDateRange(0); // First week starting from next Sunday
  const getSecondWeekDateRange = () => getWeekDateRange(1); // Second week

  // Get specific day date for a week (SSR-safe) - Starting from next Sunday
  const getDayDateForWeek = (dayName, weekOffset = 0) => {
    if (!isClient) return ''; // Prevent SSR hydration mismatch
    
    // Map day names to Sunday-based index (Sunday = 0, Monday = 1, etc.)
    const dayNameToIndex = {
      'sunday': 0,
      'monday': 1,
      'tuesday': 2,
      'wednesday': 3,
      'thursday': 4,
      'friday': 5,
      'saturday': 6
    };
    
    const dayIndex = dayNameToIndex[dayName.toLowerCase()];
    if (dayIndex === undefined) return '';
    
    const nextSunday = getNextSunday();
    const startOfWeek = new Date(nextSunday);
    startOfWeek.setDate(nextSunday.getDate() + (weekOffset * 7)); // Next Sunday + week offset
    const targetDay = new Date(startOfWeek);
    targetDay.setDate(startOfWeek.getDate() + dayIndex); // Add day index (0=Sunday, 1=Monday, etc.)
    
    return targetDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Helper function to check if a date is in the future (for validation) - SSR-safe
  const isDateInFuture = (dayName, weekOffset = 0) => {
    if (!isClient) return true; // Assume valid during SSR to prevent hydration mismatch
    
    try {
      // Map day names to Sunday-based index (Sunday = 0, Monday = 1, etc.)
      const dayNameToIndex = {
        'sunday': 0,
        'monday': 1,
        'tuesday': 2,
        'wednesday': 3,
        'thursday': 4,
        'friday': 5,
        'saturday': 6
      };
      
      const dayIndex = dayNameToIndex[dayName.toLowerCase()];
      if (dayIndex === undefined) return true;
      
      const nextSunday = getNextSunday();
      const startOfWeek = new Date(nextSunday);
      startOfWeek.setDate(nextSunday.getDate() + (weekOffset * 7));
      const targetDay = new Date(startOfWeek);
      targetDay.setDate(startOfWeek.getDate() + dayIndex);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      return targetDay >= today;
    } catch (error) {
      console.error('Error checking date validity:', error);
      return true; // Default to valid if error occurs
    }
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleRemoveItem = (planId, day, mealType) => {
    removeItemFromPlanWeek(planId, day, mealType, selectedWeek);
    showSuccess('Item Removed', 'Item removed from meal plan');
  };

  const handleClearAll = () => {
    if (window.confirm(`Are you sure you want to clear all planned meals from ${selectedWeek === 0 ? 'Week 1' : 'Week 2'}? Your selected restaurants will remain.`)) {
      clearWeek(selectedWeek);
      showSuccess('Meals Cleared', 'All planned meals cleared successfully. Your selected restaurants are still active.');
    }
  };

  const handleAddRestaurant = () => {
    console.log('🔍 handleAddRestaurant called - navigating to restaurants page');
    const postalParam = postalCode ? `&postal=${postalCode}` : '';
    console.log('🔍 Navigating to:', `/plan/restaurants?source=plan${postalParam}`);
    navigate(`/plan/restaurants?source=plan${postalParam}`);
  };

  const handleSelectOtherRestaurant = () => {
    console.log('🔍 handleSelectOtherRestaurant called');
    console.log('🔍 Selected restaurants count:', getSelectedRestaurantCount());
    console.log('🔍 All selected restaurants:', getSelectedRestaurants());
    
    const selectedRestaurantsCount = getSelectedRestaurantCount();
    const allSelectedRestaurants = getSelectedRestaurants();
    
    // Check if user is normal and has restaurants selected
    const userType = user?.userType || 'normal';
    console.log('🔍 Determined user type:', userType);
    
    if (userType === 'normal') {
      if (selectedRestaurantsCount === 0) {
        // User has no restaurants - go directly to restaurants page
        console.log('✅ User has 0 restaurants - navigating directly to restaurants page');
        const postalParam = postalCode ? `&postal=${postalCode}` : '';
        console.log('🔍 Navigating to:', `/plan/restaurants?source=plan${postalParam}`);
        navigate(`/plan/restaurants?source=plan${postalParam}`);
        return;
      } else if (selectedRestaurantsCount === 1) {
        // User has 1 restaurant - show replacement modal (same as 2 restaurants)
        console.log('🚨 User has 1 restaurant - showing replacement modal');
        
        setReplacementModalData({
          selectedRestaurants: allSelectedRestaurants,
          newRestaurant: null // Will be set when user selects from restaurant list
        });
        setShowRestaurantReplacementModal(true);
        return;
      } else if (selectedRestaurantsCount === 2) {
        // User has 2 restaurants - show replacement modal (choose which to replace)
        console.log('🚨 User has 2 restaurants - showing replacement modal');
        
        setReplacementModalData({
          selectedRestaurants: allSelectedRestaurants,
          newRestaurant: { name: 'New Restaurant' } // This will be set when user selects from restaurant list
        });
        setShowRestaurantReplacementModal(true);
        return;
      }
    }
    
    // Pro user or fallback, navigate directly
    const postalParam = postalCode ? `&postal=${postalCode}` : '';
    console.log('🔍 Navigating to:', `/plan/restaurants?source=plan${postalParam}`);
    navigate(`/plan/restaurants?source=plan${postalParam}`);
  };

  const handleShowRestaurantSelectionModal = (day, mealType) => {
    console.log('🎯 handleShowRestaurantSelectionModal called:', { day, mealType, selectedRestaurant });
    console.log('🎯 Selected restaurants count:', getSelectedRestaurantCount());
    console.log('🎯 All selected restaurants:', getSelectedRestaurants());
    
    const selectedRestaurantsCount = getSelectedRestaurantCount();
    const allSelectedRestaurants = getSelectedRestaurants();
    
    if (selectedRestaurantsCount === 0) {
      // No restaurant selected - show selection modal
      setSelectionModalData({ day, mealType, week: selectedWeek });
      setShowRestaurantSelectionModal(true);
    } else if (selectedRestaurantsCount === 1) {
      // User has 1 restaurant - show continue modal
      setContinueModalData({ day, mealType, week: selectedWeek, existingRestaurant: selectedRestaurant });
      setShowRestaurantContinueModal(true);
    } else if (selectedRestaurantsCount === 2) {
      // User has 2 restaurants - show choice modal
      setChoiceModalData({ day, mealType, week: selectedWeek, restaurants: allSelectedRestaurants });
      setShowRestaurantChoiceModal(true);
    }
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

  // Restaurant Continue Modal handlers
  const handleContinueWithExistingRestaurant = () => {
    console.log('🎯 handleContinueWithExistingRestaurant called');
    
    // Close modal
    setShowRestaurantContinueModal(false);
    const modalData = continueModalData;
    setContinueModalData(null);
    
    // Navigate to the selected restaurant with day/slot context
    if (modalData && selectedRestaurant) {
      const restaurantId = selectedRestaurant.id;
      const navigationUrl = `/restaurant/${restaurantId}?day=${modalData.day}&slot=${modalData.mealType}&week=${modalData.week}&userType=normal&source=weekly-menu`;
      console.log('🎯 Navigating to existing restaurant:', navigationUrl);
      navigate(navigationUrl);
    }
  };

  const handleAddSecondRestaurant = () => {
    console.log('🎯 handleAddSecondRestaurant called');
    
    // Close modal
    setShowRestaurantContinueModal(false);
    setContinueModalData(null);
    
    // Navigate to restaurant selection to add a second restaurant
    const postalParam = postalCode ? `&postal=${postalCode}` : '';
    navigate(`/plan/restaurants?source=plan${postalParam}`);
  };

  const handleCloseContinueModal = () => {
    setShowRestaurantContinueModal(false);
    setContinueModalData(null);
  };

  // Restaurant Choice Modal handlers (for 2 restaurants)
  const handleSelectRestaurantFromChoice = (selectedRestaurant) => {
    console.log('🎯 handleSelectRestaurantFromChoice called:', selectedRestaurant);
    
    // Close modal
    setShowRestaurantChoiceModal(false);
    const modalData = choiceModalData;
    setChoiceModalData(null);
    
    // Navigate to the selected restaurant with day/slot context
    if (modalData && selectedRestaurant) {
      const restaurantId = selectedRestaurant.restaurantId || selectedRestaurant.id;
      const navigationUrl = `/restaurant/${restaurantId}?day=${modalData.day}&slot=${modalData.mealType}&week=${modalData.week}&userType=normal&source=weekly-menu`;
      console.log('🎯 Navigating to chosen restaurant:', navigationUrl);
      navigate(navigationUrl);
    }
  };

  const handleCloseChoiceModal = () => {
    setShowRestaurantChoiceModal(false);
    setChoiceModalData(null);
  };

  // Restaurant Removal Modal handlers (for removing selected restaurants)
  const handleConfirmRestaurantReplacement = async (restaurantsToRemove, newRestaurant) => {
    console.log('🔄 handleConfirmRestaurantReplacement called');
    console.log('🔄 Restaurants to remove:', restaurantsToRemove);
    console.log('🔄 New restaurant:', newRestaurant);
    
    try {
      // STEP 1: Handle restaurant removal (when restaurantsToRemove has items)
      if (restaurantsToRemove && restaurantsToRemove.length > 0) {
        console.log('🔄 Processing removal step...');
        
        // Handle multiple restaurants removal
        for (const restaurant of restaurantsToRemove) {
          const restaurantIdToRemove = restaurant.restaurantId || restaurant.id;
          console.log('🔄 Removing items from restaurant ID:', restaurantIdToRemove);
          
          // 1. Clear all meal items from the restaurant
          await clearItemsByRestaurant(restaurantIdToRemove);
          
          // 2. Remove the restaurant from selected restaurants
          await removeSelectedRestaurant(restaurantIdToRemove);
        }
        
        // Show success message for removal
        const restaurantNames = restaurantsToRemove.map(r => r.restaurantName || r.name).join(', ');
        const message = restaurantsToRemove.length === 1 
          ? `Removed ${restaurantNames} and cleared its meals`
          : `Removed ${restaurantsToRemove.length} restaurants (${restaurantNames}) and cleared their meals`;
        
        showSuccess('Restaurants Removed', message);
        
        // Don't close modal here - let it proceed to add step
        return;
      }
      
      // STEP 2: Handle restaurant addition (when newRestaurant is provided)
      if (newRestaurant) {
        console.log('🔄 Processing addition step...');
        
        // Add the new restaurant to selected restaurants
        await addSelectedRestaurant({
          restaurantId: newRestaurant.id,
          restaurantName: newRestaurant.name,
          cuisine: newRestaurant.cuisine,
          rating: newRestaurant.rating
        });
        
        // Close modal
        setShowRestaurantReplacementModal(false);
        setReplacementModalData(null);
        
        // Show success message for addition
        showSuccess('Restaurant Added', `Added ${newRestaurant.name} to your meal plan!`);
        
        return;
      }
      
      // If neither removal nor addition, close modal
      setShowRestaurantReplacementModal(false);
      setReplacementModalData(null);
      
    } catch (error) {
      console.error('❌ Error in restaurant replacement:', error);
      showError('Error', 'Failed to process restaurant change. Please try again.');
    }
  };

  const handleCloseReplacementModal = () => {
    setShowRestaurantReplacementModal(false);
    setReplacementModalData(null);
  };

  // Helper function to get item count for a specific restaurant
  const getItemCountForRestaurant = (restaurantId) => {
    // Find the restaurant name from selectedRestaurants array
    const selectedRestaurants = getSelectedRestaurants();
    const restaurant = selectedRestaurants.find(r => r.restaurantId === restaurantId);
    const restaurantName = restaurant?.restaurantName;
    
    let count = 0;
    
    // Check both weeks
    [0, 1].forEach(week => {
      const weekData = getWeekPlan(week);
      if (weekData) {
        Object.values(weekData).forEach(dayData => {
          if (dayData?.lunch) {
            count += dayData.lunch.filter(item => 
              item.restaurantId === restaurantId || 
              item.restaurantName === restaurantId ||
              item.restaurantName === restaurantName
            ).length;
          }
          if (dayData?.dinner) {
            count += dayData.dinner.filter(item => 
              item.restaurantId === restaurantId || 
              item.restaurantName === restaurantId ||
              item.restaurantName === restaurantName
            ).length;
          }
        });
      }
    });
    
    return count;
  };

  const handleConfirmRestaurantSwitch = () => {
    console.log('🔄 handleConfirmRestaurantSwitch called');
    console.log('🔍 Current state before clearing:', { totalItems, selectedRestaurants });
    
    // Clear all meal plan data and restaurant selection (with immediate database save)
    clearAllMealPlanData();
    
    console.log('✅ clearAllMealPlanData called');
    
    // Close modal
    setShowRestaurantSwitchModal(false);
    setSwitchModalData(null);
    
    // Navigate to restaurant selection
    const postalParam = postalCode ? `&postal=${postalCode}` : '';
    navigate(`/plan/restaurants?source=plan&week=${selectedWeek}${postalParam}`);
    
    // Show success message
    showSuccess('All meal plans cleared. Select a new restaurant!', 'success');
  };

  const handleCloseRestaurantSwitchModal = () => {
    setShowRestaurantSwitchModal(false);
    setSwitchModalData(null);
  };

  // Get week-specific data
  const currentWeekPlan = getWeekPlan(selectedWeek);
  const weekTotalItems = getWeekTotalItems(selectedWeek);
  const weekTotalCost = getWeekTotalCost(selectedWeek);
  const weeklySummary = getWeeklyPlanSummary();

  // Get combined totals for both weeks
  const totalItemsBothWeeks = getWeekTotalItems(0) + getWeekTotalItems(1);
  const totalCostBothWeeks = getWeekTotalCost(0) + getWeekTotalCost(1);
  
  // Check if user has planned any meals
  const hasPlannedMeals = totalItemsBothWeeks > 0;

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col gap-6">
            {/* Title Section */}
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
                Your Weekly Menu
              </h1>
              <p className="text-red-100 text-base sm:text-lg">
                {subscriptionStatus.hasActiveSubscription 
                  ? "Please wait until subscription end date to set your new weekly plan"
                  : "Plan your perfect week with delicious meals"
                }
              </p>
              
              {/* Subscription Status Indicator */}
              {subscriptionStatus.hasActiveSubscription && subscriptionStatus.activeSubscription && (
                <div className="mt-4 space-y-3">
                  {/* Subscription Info Card */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-sm font-semibold text-white">Active Subscription</span>
                    </div>
                    <div className="text-xs text-red-100 space-y-1">
                      <div>Plan Type: {subscriptionStatus.activeSubscription.subscriptionPeriod?.planType || 'N/A'}</div>
                      <div>
                        End Date: {subscriptionStatus.activeSubscription.subscriptionPeriod?.endDate 
                          ? new Date(subscriptionStatus.activeSubscription.subscriptionPeriod.endDate).toLocaleDateString()
                          : 'N/A'
                        }
                      </div>
                      {subscriptionStatus.activeSubscription.remainingDays !== undefined && (
                        <div>Remaining Days: {subscriptionStatus.activeSubscription.remainingDays}</div>
                      )}
                    </div>
                  </div>
                  
                  {/* Prominent View Calendar Button - Always show for subscribed users */}
                  {(
                    <button
                      onClick={() => {
                        // Navigate to meal calendar with subscription start date
                        const subscriptionStartDate = subscriptionStatus.activeSubscription?.subscriptionPeriod?.startDate;
                        if (subscriptionStartDate) {
                          const startDate = new Date(subscriptionStartDate).toISOString().split('T')[0];
                          navigate(`/meal-calendar?startDate=${startDate}`);
                        } else {
                          navigate('/meal-calendar');
                        }
                      }}
                      className="group w-full bg-gradient-to-r from-white to-gray-50 hover:from-gray-50 hover:to-white text-grub-red font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 border-2 border-white/30 hover:border-white/50 relative overflow-hidden"
                    >
                    {/* Animated background effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    
                    <div className="relative z-10 flex items-center justify-center space-x-3">
                      <div className="w-8 h-8 bg-grub-red/10 rounded-full flex items-center justify-center group-hover:bg-grub-red/20 transition-colors duration-300">
                        <svg className="w-5 h-5 text-grub-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="text-center">
                        <div className="text-base font-bold text-grub-red group-hover:text-red-700 transition-colors duration-300">
                          View My Meal Calendar
                        </div>
                        <div className="text-xs text-red-600 group-hover:text-red-700 transition-colors duration-300">
                          Check your scheduled meals & delivery status
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-grub-red group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                  )}
                </div>
              )}
            </div>
            
            {/* Stats Section - Mobile Optimized - Hidden when subscription is active */}
            {!subscriptionStatus.hasActiveSubscription && (
              <div className="grid grid-cols-2 gap-4 sm:flex sm:justify-end sm:items-center sm:gap-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                  <div className="text-xs sm:text-sm text-red-100 mb-1">Total Meals</div>
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold">{totalItemsBothWeeks}</div>
                  <div className="text-xs text-red-200 mt-1">Both Weeks</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                  <div className="text-xs sm:text-sm text-red-100 mb-1">Est. Cost</div>
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-yellow-200">${totalCostBothWeeks.toFixed(2)}</div>
                  <div className="text-xs text-red-200 mt-1">Both Weeks</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Week Selector */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-md backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          {/* Week Selector Buttons */}
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gray-100 rounded-2xl p-1.5 shadow-inner w-full max-w-md">
              <div className="grid grid-cols-2 gap-1">
                {/* First Week Button */}
                <button
                  onClick={() => setSelectedWeek(0)}
                  className={`px-4 py-3 sm:py-4 rounded-xl text-sm sm:text-base font-semibold transition-all duration-300 touch-manipulation ${
                    selectedWeek === 0
                      ? 'bg-white text-grub-red shadow-lg transform scale-105'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2">
                    <svg className="w-5 h-5 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="font-bold">Week 1</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1 sm:hidden">
                    {getWeekTotalItems(0)} meals
                  </div>
                </button>

                {/* Second Week Button */}
                <button
                  onClick={() => setSelectedWeek(1)}
                  className={`px-4 py-3 sm:py-4 rounded-xl text-sm sm:text-base font-semibold transition-all duration-300 touch-manipulation ${
                    selectedWeek === 1
                      ? 'bg-white text-grub-red shadow-lg transform scale-105'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2">
                    <svg className="w-5 h-5 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="font-bold">Week 2</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1 sm:hidden">
                    {getWeekTotalItems(1)} meals
                  </div>
                </button>
              </div>
            </div>
          </div>
          
          {/* Week Date Range Display */}
          <div className="text-center space-y-2">
            <div className="text-sm sm:text-base text-gray-700 font-medium">
              {isClient && (
                selectedWeek === 0 ? (
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-4 h-4 text-grub-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Week 1: {getFirstWeekDateRange()}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-4 h-4 text-grub-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Week 2: {getSecondWeekDateRange()}</span>
                  </div>
                )
              )}
            </div>
            
            {/* Restaurant Restriction Indicator for Normal Users */}
            {user?.userType === 'normal' && selectedRestaurant && (
              <div className="inline-flex items-center px-4 py-2 bg-orange-50 border border-orange-200 rounded-full shadow-sm">
                <svg className="w-4 h-4 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="text-sm text-orange-800 font-medium">
                  🔒 Restricted to {selectedRestaurant.name}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Selected Restaurant Banner */}
      {(selectedRestaurant || (isAuthenticated && !hasLoadedFromDatabase)) && (
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {/* Restaurant Info */}
              <div className="flex items-center space-x-4 flex-1">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-grub-red to-red-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl sm:text-2xl">🍽️</span>
                </div>
                <div className="flex-1 min-w-0">
                  {isAuthenticated && !hasLoadedFromDatabase ? (
                    <>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                        Loading your restaurant selection...
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600">
                        Please wait while we load your meal plan
                      </p>
                    </>
                  ) : selectedRestaurant ? (
                    <>
                      {/* Restaurant Names - Mobile Optimized */}
                      <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900">
                        <span className="block sm:inline">Planning meals from</span>
                        <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0 sm:inline-flex">
                          {currentRestaurants.map((restaurant, index) => (
                            <span key={index} className="inline-flex items-center">
                              <span className="inline-flex items-center px-2 sm:px-3 py-1 bg-gradient-to-r from-grub-red to-red-600 text-white text-xs sm:text-sm font-medium rounded-full shadow-sm">
                                {restaurant}
                              </span>
                              {index < currentRestaurants.length - 1 && (
                                <span className="text-gray-500 mx-1">&</span>
                              )}
                            </span>
                          ))}
                        </div>
                      </h3>
                      <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm md:text-base text-gray-600 mt-1">
                        <span>Click any empty slot to add meals</span>
                        {selectedRestaurant.cuisine && (
                          <>
                            <span>•</span>
                            <span>{selectedRestaurant.cuisine}</span>
                          </>
                        )}
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-3 w-full sm:w-auto">
                {isAuthenticated && !hasLoadedFromDatabase ? (
                  <div className="flex items-center justify-center space-x-2 py-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-grub-red"></div>
                    <span className="text-sm text-gray-600">Loading...</span>
                  </div>
                ) : selectedRestaurant ? (
                  <>
                    {getSelectedRestaurantCount() < 2 && (
                      <button
                        onClick={handleAddRestaurant}
                        className="px-4 py-3 bg-grub-red text-white rounded-xl hover:bg-red-700 transition-colors text-sm font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 touch-manipulation"
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          <span>Add Restaurant</span>
                        </div>
                      </button>
                    )}
                    <button
                      onClick={handleSelectOtherRestaurant}
                      className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm font-semibold border border-gray-200 touch-manipulation"
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                        <span>Change Restaurant</span>
                      </div>
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}


      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pt-8 sm:pt-12">
        {/* Quick Actions */}
        {weekTotalItems > 0 && (
          <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={handleClearAll}
              className="flex items-center justify-center px-4 py-3 border border-red-300 text-red-700 font-semibold rounded-xl hover:bg-red-50 transition-colors duration-200 touch-manipulation"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span className="text-sm sm:text-base">Clear All from {selectedWeek === 0 ? 'Week 1' : 'Week 2'}</span>
            </button>
          </div>
        )}

        {/* Weekly Calendar */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-3 sm:p-6 mb-6 sm:mb-8 mt-4 sm:mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-2">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900">
              {selectedWeek === 0 ? "Week 1 Menu" : "Week 2 Menu"}
            </h2>
            <div className="flex items-center justify-center sm:justify-end space-x-2">
              <span className="text-xs sm:text-sm text-gray-500">Week of</span>
              <span className="text-xs sm:text-sm font-semibold text-gray-900">
                {isClient ? getWeekDateRange(selectedWeek) : ''}
              </span>
            </div>
          </div>

          {/* Mobile Layout - Day Cards */}
          <div className="block sm:hidden space-y-3">
            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, index) => {
              const dayKey = day.toLowerCase();
              const lunchItems = getWeekMealItems(dayKey, 'lunch', selectedWeek);
              const dinnerItems = getWeekMealItems(dayKey, 'dinner', selectedWeek);
              const totalDayItems = lunchItems.length + dinnerItems.length;
              
              return (
                <div key={day} className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
                  {/* Day Header */}
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{day}</h3>
                      <p className="text-sm text-gray-600">
                        {isClient ? getDayDateForWeek(day, selectedWeek) : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                        totalDayItems > 0 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {totalDayItems} meal{totalDayItems !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  
                  {/* Meal Slots */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Lunch */}
                    <div>
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                          <span className="text-sm">🌅</span>
                        </div>
                        <span className="text-sm font-semibold text-yellow-700">Lunch</span>
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
                        isAuthenticated={isAuthenticated}
                        hasLoadedFromDatabase={hasLoadedFromDatabase}
                        disabled={subscriptionStatus.hasActiveSubscription || subscriptionStatus.loading}
                        loading={subscriptionStatus.loading}
                        getSelectedRestaurantCount={getSelectedRestaurantCount}
                        getSelectedRestaurants={getSelectedRestaurants}
                      />
                    </div>
                    
                    {/* Dinner */}
                    <div>
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-sm">🌙</span>
                        </div>
                        <span className="text-sm font-semibold text-purple-700">Dinner</span>
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
                        isAuthenticated={isAuthenticated}
                        hasLoadedFromDatabase={hasLoadedFromDatabase}
                        disabled={subscriptionStatus.hasActiveSubscription || subscriptionStatus.loading}
                        loading={subscriptionStatus.loading}
                        getSelectedRestaurantCount={getSelectedRestaurantCount}
                        getSelectedRestaurants={getSelectedRestaurants}
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
                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, index) => {
                  const dayKey = day.toLowerCase();
                  const dayTotalItems = getWeekMealItems(dayKey, 'lunch', selectedWeek).length + getWeekMealItems(dayKey, 'dinner', selectedWeek).length;
                  
                  return (
                    <div key={day} className="p-3 text-center">
                      <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg px-4 py-3 shadow-sm">
                        <div className="text-sm font-bold text-gray-900">{day}</div>
                        <div className="text-xs text-gray-600 font-medium">
                          {isClient ? getDayDateForWeek(day, selectedWeek) : ''}
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
                {['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].map((day) => (
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
                    isAuthenticated={isAuthenticated}
                    hasLoadedFromDatabase={hasLoadedFromDatabase}
                    disabled={subscriptionStatus.hasActiveSubscription || subscriptionStatus.loading}
                    loading={subscriptionStatus.loading}
                    getSelectedRestaurantCount={getSelectedRestaurantCount}
                    getSelectedRestaurants={getSelectedRestaurants}
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
                {['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].map((day) => (
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
                    isAuthenticated={isAuthenticated}
                    hasLoadedFromDatabase={hasLoadedFromDatabase}
                    disabled={subscriptionStatus.hasActiveSubscription || subscriptionStatus.loading}
                    loading={subscriptionStatus.loading}
                    getSelectedRestaurantCount={getSelectedRestaurantCount}
                    getSelectedRestaurants={getSelectedRestaurants}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-4 sm:p-6 mt-6 border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-3 sm:hidden">Legend</h4>
            <div className="grid grid-cols-1 sm:flex sm:flex-wrap gap-3 sm:gap-6 text-sm text-gray-700">
              <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-200">
                <div className="w-5 h-5 bg-gradient-to-br from-red-50 to-orange-50 border-2 border-grub-red rounded-lg shadow-sm flex-shrink-0"></div>
                <span className="font-medium">Planned Meals</span>
              </div>
              <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-200">
                <div className="w-5 h-5 bg-gradient-to-br from-white to-gray-50 border-2 border-gray-300 rounded-lg shadow-sm flex-shrink-0"></div>
                <span className="font-medium">Available Slots</span>
              </div>
              <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-200">
                <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="font-medium">
                  <span className="sm:hidden">Tap to remove items</span>
                  <span className="hidden sm:inline">Hover to remove items</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Summary - Hidden when subscription is active */}
        {!subscriptionStatus.hasActiveSubscription && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Bi-Weekly Summary</h3>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H9z" />
                  </svg>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">Total Meals</span>
                    <span className="text-2xl font-bold text-gray-900">{totalItemsBothWeeks}</span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">Both weeks combined</div>
                </div>
                
                <div className="bg-green-50 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">Estimated Cost</span>
                    <span className="text-2xl font-bold text-green-600">${totalCostBothWeeks.toFixed(2)}</span>
                  </div>
                  <div className="text-sm text-green-600 mt-1">Both weeks combined</div>
                </div>
                
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">Avg per Meal</span>
                    <span className="text-2xl font-bold text-blue-600">
                      ${totalItemsBothWeeks > 0 ? (totalCostBothWeeks / totalItemsBothWeeks).toFixed(2) : '0.00'}
                    </span>
                  </div>
                  <div className="text-sm text-blue-600 mt-1">Cost efficiency</div>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-yellow-50 rounded-lg p-3">
                      <div className="text-lg font-bold text-yellow-700">{getWeekTotalItems(0)}</div>
                      <div className="text-xs text-yellow-600">Week 1 Meals</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3">
                      <div className="text-lg font-bold text-purple-700">{getWeekTotalItems(1)}</div>
                      <div className="text-xs text-purple-600">Week 2 Meals</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Quick Actions</h3>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <div className="space-y-4">

              {/* View Calendar Button - Only show if user has planned meals */}
              {hasPlannedMeals ? (
                <button
                  onClick={() => navigate('/meal-calendar')}
                  className="group w-full text-left p-4 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden"
                >
                  <div className="relative z-10">
                    <div className="font-semibold text-white flex items-center text-base mb-1">
                      <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v10m6-10v10m-6-4h6" />
                        </svg>
                      </div>
                      View My Calendar
                    </div>
                    <div className="text-blue-100 ml-10 text-sm">Check your scheduled meals and delivery status</div>
                  </div>
                </button>
              ) : (
                <div className="w-full p-4 rounded-xl bg-gray-100 border-2 border-dashed border-gray-300">
                  <div className="flex items-center text-gray-500">
                    <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v10m6-10v10m-6-4h6" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-gray-600 text-base mb-1">Plan meals to view calendar</div>
                      <div className="text-gray-500 text-sm">Add meals to your weekly plan first</div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

          </div>
        )}
      </div>
      
      {/* Restaurant Selection Modal */}
      <RestaurantSelectionModal
        isOpen={showRestaurantSelectionModal}
        onClose={handleCloseRestaurantSelectionModal}
        onConfirm={handleConfirmRestaurantSelection}
        day={selectionModalData?.day}
        mealType={selectionModalData?.mealType}
        week={selectionModalData?.week}
      />

      {/* Restaurant Continue Modal */}
      <RestaurantContinueModal
        isOpen={showRestaurantContinueModal}
        onClose={handleCloseContinueModal}
        onContinueExisting={handleContinueWithExistingRestaurant}
        onAddNew={handleAddSecondRestaurant}
        existingRestaurant={continueModalData?.existingRestaurant}
        day={continueModalData?.day}
        mealType={continueModalData?.mealType}
        week={continueModalData?.week}
      />

      {/* Restaurant Choice Modal */}
      <RestaurantChoiceModal
        isOpen={showRestaurantChoiceModal}
        onClose={handleCloseChoiceModal}
        onSelectRestaurant={handleSelectRestaurantFromChoice}
        restaurants={choiceModalData?.restaurants || []}
        day={choiceModalData?.day}
        mealType={choiceModalData?.mealType}
        week={choiceModalData?.week}
      />

      {/* Restaurant Replacement Modal */}
      <RestaurantReplacementModal
        isOpen={showRestaurantReplacementModal}
        onClose={handleCloseReplacementModal}
        onConfirm={handleConfirmRestaurantReplacement}
        selectedRestaurants={replacementModalData?.selectedRestaurants || []}
        newRestaurant={replacementModalData?.newRestaurant}
        getItemCountForRestaurant={getItemCountForRestaurant}
      />

      {/* Restaurant Switch Modal */}
      {console.log('🔍 Modal render - showRestaurantSwitchModal:', showRestaurantSwitchModal)}
      {console.log('🔍 Modal render - switchModalData:', switchModalData)}
      <RestaurantSwitchModal
        isOpen={showRestaurantSwitchModal}
        onClose={handleCloseRestaurantSwitchModal}
        onConfirm={handleConfirmRestaurantSwitch}
        existingRestaurant={switchModalData?.existingRestaurant}
        newRestaurant={switchModalData?.newRestaurant}
        itemCount={switchModalData?.itemCount}
      />
    </div>
  );
};

export default WeeklyMenuPage;
