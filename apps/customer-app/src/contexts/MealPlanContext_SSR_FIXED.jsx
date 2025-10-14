import React, { createContext, useContext, useReducer, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import apiClient from '../api/apiClient';
import { getStorageItem, setStorageItem, removeStorageItem } from '../utils/ssrSafeStorage';

// Initial week plan structure
const initialWeekPlan = {
  monday: { lunch: [], dinner: [] },
  tuesday: { lunch: [], dinner: [] },
  wednesday: { lunch: [], dinner: [] },
  thursday: { lunch: [], dinner: [] },
  friday: { lunch: [], dinner: [] },
  saturday: { lunch: [], dinner: [] },
  sunday: { lunch: [], dinner: [] }
};

// Initial state for the meal plan (supports multiple weeks)
const initialState = {
  weeklyPlans: {
    week0: { ...initialWeekPlan },
    week1: { ...initialWeekPlan }
  },
  weeklyPlan: { ...initialWeekPlan },
  totalItems: 0,
  selectedRestaurant: null,
  selectedRestaurantId: null,
  selectedRestaurantName: null,
  selectedRestaurantData: null,
  loadedFromDatabase: false
};

// Action types
const MEAL_PLAN_ACTIONS = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  CLEAR_DAY: 'CLEAR_DAY',
  CLEAR_ALL: 'CLEAR_ALL',
  ADD_ITEM_TO_WEEK: 'ADD_ITEM_TO_WEEK',
  REMOVE_ITEM_FROM_WEEK: 'REMOVE_ITEM_FROM_WEEK',
  CLEAR_WEEK: 'CLEAR_WEEK',
  SET_LOADED_FROM_DATABASE: 'SET_LOADED_FROM_DATABASE',
  SET_SELECTED_RESTAURANT: 'SET_SELECTED_RESTAURANT',
  CLEAR_SELECTED_RESTAURANT: 'CLEAR_SELECTED_RESTAURANT',
  LOAD_FROM_DATABASE: 'LOAD_FROM_DATABASE',
  SYNC_DATABASE_DATA: 'SYNC_DATABASE_DATA'
};

// SSR-Safe reducer (no localStorage operations)
const mealPlanReducer = (state, action) => {
  switch (action.type) {
    case MEAL_PLAN_ACTIONS.ADD_ITEM: {
      const { item, day, mealType } = action.payload;
      
      const newWeeklyPlan = {
        ...state.weeklyPlan,
        [day]: {
          ...state.weeklyPlan[day],
          [mealType]: [...state.weeklyPlan[day][mealType], item]
        }
      };

      return {
        ...state,
        weeklyPlan: newWeeklyPlan,
        totalItems: state.totalItems + 1
      };
    }

    case MEAL_PLAN_ACTIONS.REMOVE_ITEM: {
      const { planId, day, mealType } = action.payload;
      
      const newWeeklyPlan = {
        ...state.weeklyPlan,
        [day]: {
          ...state.weeklyPlan[day],
          [mealType]: state.weeklyPlan[day][mealType].filter(item => item.planId !== planId)
        }
      };

      return {
        ...state,
        weeklyPlan: newWeeklyPlan,
        totalItems: state.totalItems - 1
      };
    }

    case MEAL_PLAN_ACTIONS.ADD_ITEM_TO_WEEK: {
      const { item, day, mealType, week } = action.payload;
      
      // Ensure the day exists before accessing it
      const currentWeek = state.weeklyPlans[`week${week}`] || {};
      const currentDay = currentWeek[day] || { lunch: [], dinner: [] };
      const currentMealType = currentDay[mealType] || [];
      
      const newWeeklyPlans = {
        ...state.weeklyPlans,
        [`week${week}`]: {
          ...currentWeek,
          [day]: {
            ...currentDay,
            [mealType]: [...currentMealType, item]
          }
        }
      };

      // Calculate total items across all weeks
      let totalItems = 0;
      Object.values(newWeeklyPlans).forEach(weekPlan => {
        Object.values(weekPlan).forEach(dayMeals => {
          totalItems += dayMeals.lunch.length + dayMeals.dinner.length;
        });
      });

      return {
        ...state,
        weeklyPlans: newWeeklyPlans,
        totalItems
      };
    }

    case MEAL_PLAN_ACTIONS.REMOVE_ITEM_FROM_WEEK: {
      const { planId, day, mealType, week } = action.payload;
      
      // Ensure the day exists before accessing it
      const currentWeek = state.weeklyPlans[`week${week}`] || {};
      const currentDay = currentWeek[day] || { lunch: [], dinner: [] };
      const currentMealType = currentDay[mealType] || [];
      
      const newWeeklyPlans = {
        ...state.weeklyPlans,
        [`week${week}`]: {
          ...currentWeek,
          [day]: {
            ...currentDay,
            [mealType]: currentMealType.filter(item => item.planId !== planId)
          }
        }
      };

      // Calculate total items across all weeks
      let totalItems = 0;
      Object.values(newWeeklyPlans).forEach(weekPlan => {
        Object.values(weekPlan).forEach(dayMeals => {
          totalItems += dayMeals.lunch.length + dayMeals.dinner.length;
        });
      });

      return {
        ...state,
        weeklyPlans: newWeeklyPlans,
        totalItems
      };
    }

    case MEAL_PLAN_ACTIONS.CLEAR_WEEK: {
      const { week } = action.payload;
      
      const newWeeklyPlans = {
        ...state.weeklyPlans,
        [`week${week}`]: { ...initialWeekPlan }
      };

      // Calculate total items across all weeks
      let totalItems = 0;
      Object.values(newWeeklyPlans).forEach(weekPlan => {
        Object.values(weekPlan).forEach(dayMeals => {
          totalItems += dayMeals.lunch.length + dayMeals.dinner.length;
        });
      });

      return {
        ...state,
        weeklyPlans: newWeeklyPlans,
        totalItems
      };
    }

    case MEAL_PLAN_ACTIONS.CLEAR_ALL: {
      return { ...initialState };
    }

    case MEAL_PLAN_ACTIONS.SET_LOADED_FROM_DATABASE: {
      return {
        ...state,
        loadedFromDatabase: true
      };
    }

    case MEAL_PLAN_ACTIONS.LOAD_FROM_DATABASE: {
      const { weeklyPlans, totalItems } = action.payload;
      return {
        ...state,
        weeklyPlans: weeklyPlans || state.weeklyPlans,
        totalItems: totalItems || 0,
        loadedFromDatabase: true
      };
    }

    case MEAL_PLAN_ACTIONS.SET_SELECTED_RESTAURANT: {
      const { restaurantId, restaurantName, restaurantData } = action.payload;
      console.log('🔄 SET_SELECTED_RESTAURANT:', { restaurantId, restaurantName });
      
      return {
        ...state,
        selectedRestaurantId: restaurantId,
        selectedRestaurantName: restaurantName,
        selectedRestaurantData: restaurantData
      };
    }

    case MEAL_PLAN_ACTIONS.CLEAR_SELECTED_RESTAURANT: {
      console.log('🔄 CLEAR_SELECTED_RESTAURANT');
      
      return {
        ...state,
        selectedRestaurantId: null,
        selectedRestaurantName: null,
        selectedRestaurantData: null
      };
    }

    case MEAL_PLAN_ACTIONS.SYNC_DATABASE_DATA: {
      const { databaseData } = action.payload;
      console.log('🔄 Syncing database data:', databaseData);
      
      // Convert database structure to frontend structure
      // Merge database data with initial structure to ensure all days exist
      const syncedWeeklyPlans = {
        week0: { ...initialWeekPlan, ...(databaseData.weeklyPlans?.week0 || {}) },
        week1: { ...initialWeekPlan, ...(databaseData.weeklyPlans?.week1 || {}) }
      };
      
      // Calculate total items
      const totalItems = Object.values(syncedWeeklyPlans).reduce((total, week) => {
        return total + Object.values(week).reduce((weekTotal, day) => {
          return weekTotal + (day.lunch?.length || 0) + (day.dinner?.length || 0);
        }, 0);
      }, 0);
      
      console.log('✅ Synced meal plan data:', { syncedWeeklyPlans, totalItems });
      
      return {
        ...state,
        weeklyPlans: syncedWeeklyPlans,
        totalItems: totalItems,
        selectedRestaurantId: databaseData.selectedRestaurantId || null,
        selectedRestaurantName: databaseData.selectedRestaurantName || null,
        selectedRestaurantData: databaseData.selectedRestaurantData || null,
        loadedFromDatabase: true
      };
    }

    default:
      return state;
  }
};

// Create context
const MealPlanContext = createContext();

export const useMealPlan = () => {
  const context = useContext(MealPlanContext);
  if (!context) {
    throw new Error('useMealPlan must be used within a MealPlanProvider');
  }
  return context;
};

export const MealPlanProvider = ({ children }) => {
  const [state, dispatch] = useReducer(mealPlanReducer, initialState);
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const saveTimeoutRef = useRef(null);
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();

  // SSR Safety - only run on client side
  useEffect(() => {
    setIsClient(true);
    
    const loadMealPlanData = async () => {
      try {
        if (isAuthenticated && user) {
          // Try to load from database first
          try {
            const response = await apiClient.get('/meal-plans/me');
            if (response.data?.status === 'success' && response.data?.data) {
              console.log('📋 Loading meal plan from database:', response.data.data);
              dispatch({
                type: MEAL_PLAN_ACTIONS.SYNC_DATABASE_DATA,
                payload: { databaseData: response.data.data }
              });
              return; // Exit early on success
            }
          } catch (error) {
            console.log('Could not load from database, falling back to localStorage:', error.message);
          }
        }
        
        // Try to load from the 'mealplans' collection directly
        if (isAuthenticated && user) {
          try {
            const response = await apiClient.get('/meal-plans/me');
            if (response.data?.weeklyPlans) {
              console.log('📋 Loading meal plan from database:', response.data);
              dispatch({
                type: MEAL_PLAN_ACTIONS.SYNC_DATABASE_DATA,
                payload: { databaseData: response.data }
              });
              return;
            }
          } catch (error) {
            console.log('Could not load meal plan from database:', error.message);
          }
        }
        
        // Fallback to localStorage (for both authenticated and non-authenticated users)
        const savedWeeklyPlans = getStorageItem('weeklyPlans');
        const savedMealPlan = getStorageItem('mealPlan');
        
        if (savedWeeklyPlans) {
          dispatch({
            type: MEAL_PLAN_ACTIONS.LOAD_FROM_DATABASE,
            payload: { weeklyPlans: savedWeeklyPlans, totalItems: savedWeeklyPlans.totalItems || 0 }
          });
        } else if (savedMealPlan) {
          // Handle legacy meal plan format
          dispatch({
            type: MEAL_PLAN_ACTIONS.LOAD_FROM_DATABASE,
            payload: { weeklyPlans: { week0: savedMealPlan.weeklyPlan }, totalItems: savedMealPlan.totalItems || 0 }
          });
        }
        // If no data exists, state remains at initialState (empty meal plan)
        
      } catch (error) {
        console.error('Error loading meal plan data:', error);
        // On error, use initial state (empty meal plan)
      } finally {
        // ALWAYS stop loading, regardless of success/failure/no data
        setIsLoading(false);
      }
    };

    loadMealPlanData();
  }, []); // ✅ Remove dependencies to prevent re-runs

  // Handle authentication changes separately (load user data when they log in)
  useEffect(() => {
    if (!isClient || isLoading) return;
    
    const loadUserData = async () => {
      if (isAuthenticated && user) {
        try {
          const response = await apiClient.get('/meal-plans/me');
          if (response.data?.status === 'success' && response.data?.data) {
            console.log('🔄 Syncing user data after login:', response.data.data);
            dispatch({
              type: MEAL_PLAN_ACTIONS.SYNC_DATABASE_DATA,
              payload: { databaseData: response.data.data }
            });
          }
        } catch (error) {
          console.log('Could not sync with database after login:', error.message);
        }
      }
    };

    loadUserData();
  }, [isAuthenticated, user, isClient, isLoading]);

  // Auto-save to localStorage and database (client-side only)
  useEffect(() => {
    if (!isClient || isLoading) return;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Calculate fresh totalItems from current state
    let calculatedTotalItems = 0;
    Object.values(state.weeklyPlans).forEach(weekPlan => {
      Object.values(weekPlan).forEach(dayMeals => {
        // Add null checks to prevent undefined errors
        const lunchCount = dayMeals?.lunch?.length || 0;
        const dinnerCount = dayMeals?.dinner?.length || 0;
        calculatedTotalItems += lunchCount + dinnerCount;
      });
    });

    // Debounced save with fresh calculations
    saveTimeoutRef.current = setTimeout(() => {
      // Save to localStorage
      setStorageItem('weeklyPlans', {
        weeklyPlans: state.weeklyPlans,
        totalItems: calculatedTotalItems
      });

      // Save to database if authenticated
      if (isAuthenticated && user) {
        saveMealPlanToDatabase({
          weeklyPlans: state.weeklyPlans,
          totalItems: calculatedTotalItems
        });
      }
    }, 1000);

    // Cleanup timeout on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [JSON.stringify(state.weeklyPlans), state.totalItems, isAuthenticated, user, isClient, isLoading]);

  // Database save function
  const saveMealPlanToDatabase = async (mealPlanData) => {
    if (!isAuthenticated || !user) return;

    try {
      // Ensure proper data structure for API
      const apiData = {
        userId: user._id,
        weeklyPlans: mealPlanData.weeklyPlans || state.weeklyPlans,
        totalItems: mealPlanData.totalItems || state.totalItems,
        selectedRestaurantId: state.selectedRestaurantId,
        selectedRestaurantName: state.selectedRestaurantName,
        selectedRestaurantData: state.selectedRestaurantData
      };
      
      console.log('💾 Saving meal plan to database:', apiData);
      await apiClient.post('/meal-plans', apiData);
    } catch (error) {
      console.error('Error saving meal plan to database:', error);
    }
  };

  // Action creators with authentication checks
  const addItemToPlan = async (item, day, mealType, restaurantName, userType, forceReplace = false) => {
    if (!isAuthenticated) {
      if (typeof window !== 'undefined') {
        setStorageItem('redirectAfterLogin', window.location.pathname + window.location.search);
      }
      return { success: false, error: 'AUTHENTICATION_REQUIRED' };
    }

    const itemWithPlan = {
      ...item,
      planId: `${Date.now()}-${Math.random()}`,
      restaurantName,
      addedAt: new Date().toISOString()
    };

    dispatch({
      type: MEAL_PLAN_ACTIONS.ADD_ITEM,
      payload: { item: itemWithPlan, day, mealType }
    });

    return { success: true };
  };

  const addItemToPlanWeek = async (item, day, mealType, restaurantName, week, userType, forceReplace = false) => {
    if (!isAuthenticated) {
      if (typeof window !== 'undefined') {
        setStorageItem('redirectAfterLogin', window.location.pathname + window.location.search);
      }
      return { success: false, error: 'AUTHENTICATION_REQUIRED' };
    }

    const itemWithPlan = {
      ...item,
      planId: `${Date.now()}-${Math.random()}`,
      restaurantName,
      addedAt: new Date().toISOString()
    };

    dispatch({
      type: MEAL_PLAN_ACTIONS.ADD_ITEM_TO_WEEK,
      payload: { item: itemWithPlan, day, mealType, week }
    });

    return { success: true };
  };

  const removeItemFromPlan = (planId, day, mealType) => {
    dispatch({
      type: MEAL_PLAN_ACTIONS.REMOVE_ITEM,
      payload: { planId, day, mealType }
    });
  };

  const removeItemFromPlanWeek = (planId, day, mealType, week) => {
    dispatch({
      type: MEAL_PLAN_ACTIONS.REMOVE_ITEM_FROM_WEEK,
      payload: { planId, day, mealType, week }
    });
  };

  const clearWeek = (week) => {
    dispatch({ type: MEAL_PLAN_ACTIONS.CLEAR_WEEK, payload: { week } });
  };

  const clearAll = () => {
    dispatch({ type: MEAL_PLAN_ACTIONS.CLEAR_ALL });
    
    // Clear localStorage
    removeStorageItem('weeklyPlans');
    removeStorageItem('mealPlan');
  };

  // Helper functions
  const getWeekPlan = (week = 0) => {
    return state.weeklyPlans[`week${week}`] || initialWeekPlan;
  };

  const getWeekMealItems = (day, mealType, week = 0) => {
    const weekPlan = getWeekPlan(week);
    return weekPlan[day]?.[mealType] || [];
  };

  const getWeekTotalItems = (week = 0) => {
    const weekPlan = getWeekPlan(week);
    return Object.values(weekPlan).reduce((total, day) => {
      return total + day.lunch.length + day.dinner.length;
    }, 0);
  };

  const getWeekTotalCost = (week = 0) => {
    const weekPlan = getWeekPlan(week);
    return Object.values(weekPlan).reduce((total, day) => {
      const dayCost = [...day.lunch, ...day.dinner].reduce((dayTotal, item) => {
        return dayTotal + (parseFloat(item.price) || 0);
      }, 0);
      return total + dayCost;
    }, 0);
  };

  const getRestaurantsInWeekPlan = (week = 0) => {
    const restaurants = new Set();
    const weekPlan = getWeekPlan(week);
    Object.values(weekPlan).forEach(day => {
      [...day.lunch, ...day.dinner].forEach(item => {
        if (item.restaurantName) {
          restaurants.add(item.restaurantName);
        }
      });
    });
    return Array.from(restaurants);
  };

  const getRestaurantsInAllWeeks = () => {
    const restaurants = new Set();
    Object.values(state.weeklyPlans).forEach(weekPlan => {
      Object.values(weekPlan).forEach(day => {
        [...day.lunch, ...day.dinner].forEach(item => {
          if (item.restaurantName) {
            restaurants.add(item.restaurantName);
          }
        });
      });
    });
    return Array.from(restaurants);
  };

  // Get restaurant IDs in a specific week's plan
  const getRestaurantIdsInWeekPlan = (week = 0) => {
    const restaurantIds = new Set();
    const weekPlan = getWeekPlan(week);
    
    // Check if weekPlan exists and is an object
    if (!weekPlan || typeof weekPlan !== 'object') {
      return [];
    }
    
    Object.values(weekPlan).forEach(day => {
      // Check if day exists and has the expected structure
      if (!day || typeof day !== 'object') {
        return;
      }
      
      // Check if lunch and dinner exist and are arrays
      const lunchItems = Array.isArray(day.lunch) ? day.lunch : [];
      const dinnerItems = Array.isArray(day.dinner) ? day.dinner : [];
      
      [...lunchItems, ...dinnerItems].forEach(item => {
        if (item && item.restaurantId) {
          restaurantIds.add(item.restaurantId);
        }
      });
    });
    return Array.from(restaurantIds);
  };

  // Get restaurant IDs from ALL weeks
  const getRestaurantIdsInAllWeeks = () => {
    const restaurantIds = new Set();
    
    // Check if weeklyPlans exists and is an object
    if (!state.weeklyPlans || typeof state.weeklyPlans !== 'object') {
      return [];
    }
    
    Object.values(state.weeklyPlans).forEach(weekPlan => {
      // Check if weekPlan exists and is an object
      if (!weekPlan || typeof weekPlan !== 'object') {
        return;
      }
      
      Object.values(weekPlan).forEach(day => {
        // Check if day exists and has the expected structure
        if (!day || typeof day !== 'object') {
          return;
        }
        
        // Check if lunch and dinner exist and are arrays
        const lunchItems = Array.isArray(day.lunch) ? day.lunch : [];
        const dinnerItems = Array.isArray(day.dinner) ? day.dinner : [];
        
        [...lunchItems, ...dinnerItems].forEach(item => {
          if (item && item.restaurantId) {
            restaurantIds.add(item.restaurantId);
          }
        });
      });
    });
    return Array.from(restaurantIds);
  };

  // Alias for backward compatibility
  const getRestaurantsInPlan = () => {
    return getRestaurantsInAllWeeks();
  };

  const getWeeklyPlanSummary = () => {
    const totalItems = Object.values(state.weeklyPlans).reduce((total, week) => {
      return total + Object.values(week).reduce((weekTotal, day) => {
        return weekTotal + (day.lunch?.length || 0) + (day.dinner?.length || 0);
      }, 0);
    }, 0);

    const totalCost = Object.values(state.weeklyPlans).reduce((total, week) => {
      return total + Object.values(week).reduce((weekTotal, day) => {
        const dayCost = [...(day.lunch || []), ...(day.dinner || [])].reduce((dayTotal, item) => {
          return dayTotal + (parseFloat(item.price) || 0);
        }, 0);
        return weekTotal + dayCost;
      }, 0);
    }, 0);

    const restaurants = getRestaurantsInAllWeeks();

    return {
      totalItems,
      totalCost: totalCost.toFixed(2),
      restaurants,
      restaurantCount: restaurants.length
    };
  };

  const getItemQuantityInPlan = (itemId, day, mealType, week = 0) => {
    const weekPlan = getWeekPlan(week);
    const dayItems = weekPlan[day]?.[mealType] || [];
    return dayItems.filter(item => item.id === itemId).length;
  };

  const isItemInPlan = (itemId, day, mealType, week = 0) => {
    const weekPlan = getWeekPlan(week);
    const dayItems = weekPlan[day]?.[mealType] || [];
    return dayItems.some(item => item.id === itemId);
  };

  // Restaurant selection actions
  const setSelectedRestaurant = (restaurantId, restaurantName, restaurantData = null) => {
    console.log('🎯 setSelectedRestaurant called:', { restaurantId, restaurantName });
    dispatch({
      type: MEAL_PLAN_ACTIONS.SET_SELECTED_RESTAURANT,
      payload: { restaurantId, restaurantName, restaurantData }
    });
    
    // Trigger immediate database save for restaurant selection
    if (isAuthenticated && user) {
      console.log('💾 Triggering immediate database save for restaurant selection');
      setTimeout(() => {
        saveMealPlanToDatabase({
          weeklyPlans: state.weeklyPlans,
          totalItems: state.totalItems,
          selectedRestaurantId: restaurantId,
          selectedRestaurantName: restaurantName,
          selectedRestaurantData: restaurantData
        });
      }, 50); // Small delay to ensure state is updated
    }
  };

  const clearSelectedRestaurant = () => {
    console.log('🎯 clearSelectedRestaurant called');
    dispatch({
      type: MEAL_PLAN_ACTIONS.CLEAR_SELECTED_RESTAURANT
    });
  };

  // Clear all meal plan data and restaurant selection (for restaurant switching)
  const clearAllMealPlanData = () => {
    console.log('🎯 clearAllMealPlanData called - clearing everything');
    
    // Clear both weeks
    dispatch({
      type: MEAL_PLAN_ACTIONS.CLEAR_WEEK,
      payload: { week: 0 }
    });
    dispatch({
      type: MEAL_PLAN_ACTIONS.CLEAR_WEEK,
      payload: { week: 1 }
    });
    
    // Clear selected restaurant
    dispatch({
      type: MEAL_PLAN_ACTIONS.CLEAR_SELECTED_RESTAURANT
    });
    
    // Clear planning context localStorage data as well
    console.log('🧹 Clearing planning context localStorage data');
    if (typeof window !== 'undefined') {
      removeStorageItem('grubgate_selected_restaurant');
      removeStorageItem('weeklyPlans'); // Also clear old meal plan data
      removeStorageItem('mealPlan'); // Clear legacy meal plan data
    }
  };

  // Legacy compatibility functions
  const getDayItems = (day) => {
    return getWeekPlan(0)[day] || { lunch: [], dinner: [] };
  };

  const getDayItemsCount = (day) => {
    const dayItems = getDayItems(day);
    return dayItems.lunch.length + dayItems.dinner.length;
  };

  const getMealItems = (day, mealType) => {
    return getWeekMealItems(day, mealType, 0);
  };

  const getTotalItemsCount = () => {
    return state.totalItems;
  };

  // Show loading state during SSR and initial client hydration
  if (!isClient || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-grub-red mx-auto mb-4"></div>
          <p className="text-gray-600">Loading meal plan...</p>
        </div>
      </div>
    );
  }

  const value = {
    // State
    ...state,
    isClient,
    isLoadingFromDatabase: isLoading,
    hasLoadedFromDatabase: !isLoading,
    // Legacy state compatibility
    mealPlan: state.weeklyPlan,
    weeklyPlan: state.weeklyPlan,
    
    // Actions
    addItemToPlan,
    addItemToPlanWeek,
    removeItemFromPlan,
    removeItemFromPlanWeek,
    clearWeek,
    clearAll,
    
    // Restaurant selection actions
    setSelectedRestaurant,
    clearSelectedRestaurant,
    clearAllMealPlanData,
    
    // Helpers
    getWeekPlan,
    getWeekMealItems,
    getWeekTotalItems,
    getWeekTotalCost,
    getRestaurantsInWeekPlan,
    getRestaurantsInAllWeeks,
    getRestaurantsInPlan,
    getRestaurantIdsInWeekPlan,
    getRestaurantIdsInAllWeeks,
    getWeeklyPlanSummary,
    getItemQuantityInPlan,
    isItemInPlan,
    // Legacy compatibility
    getDayItems,
    getDayItemsCount,
    getMealItems,
    getTotalItemsCount
  };

  return (
    <MealPlanContext.Provider value={value}>
      {children}
    </MealPlanContext.Provider>
  );
};
