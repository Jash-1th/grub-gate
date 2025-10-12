import React, { createContext, useContext, useReducer, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { getStorageItem, setStorageItem, removeStorageItem } from '../utils/ssrSafeStorage';

// SSR-safe check
const isClient = typeof window !== 'undefined';

// API endpoints for subscription meal plans
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://gg0b1.netlify.app/api/v1';

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

// Initial state for subscription meal plan (SSR-safe)
const initialState = {
  // Subscription meal plan data
  subscriptionMealPlan: null,
  planId: null,
  planType: 'bi-weekly', // bi-weekly, monthly, quarterly
  subscriptionId: null,
  restaurantId: null,
  
  // Week-specific data (supports multiple weeks)
  weeks: [],
  currentWeekIndex: 0,
  totalWeeks: 1,
  
  // Legacy compatibility for existing components
  weeklyPlans: {
    week0: { ...initialWeekPlan },
    week1: { ...initialWeekPlan }
  },
  weeklyPlan: { ...initialWeekPlan }, // Backward compatibility
  totalItems: 0,
  
  // Restaurant selection tracking
  selectedRestaurantId: null,
  selectedRestaurantName: null,
  selectedRestaurantData: null,
  
  // Loading and sync states
  isLoadingFromDatabase: false,
  hasLoadedFromDatabase: false,
  isSyncing: false,
  lastSyncTime: null,
  
  // SSR safety
  isClient: false
};

// Action types
const SUBSCRIPTION_MEAL_PLAN_ACTIONS = {
  // Subscription plan actions
  LOAD_SUBSCRIPTION_PLAN: 'LOAD_SUBSCRIPTION_PLAN',
  UPDATE_PLAN_STATUS: 'UPDATE_PLAN_STATUS',
  
  // Meal management actions
  ADD_MEAL_TO_WEEK: 'ADD_MEAL_TO_WEEK',
  REMOVE_MEAL_FROM_WEEK: 'REMOVE_MEAL_FROM_WEEK',
  CLEAR_WEEK: 'CLEAR_WEEK',
  CLEAR_ALL_WEEKS: 'CLEAR_ALL_WEEKS',
  
  // Week navigation
  SET_CURRENT_WEEK: 'SET_CURRENT_WEEK',
  
  // Restaurant selection
  SET_SELECTED_RESTAURANT: 'SET_SELECTED_RESTAURANT',
  CLEAR_SELECTED_RESTAURANT: 'CLEAR_SELECTED_RESTAURANT',
  
  // Loading states
  SET_LOADING: 'SET_LOADING',
  SET_LOADED: 'SET_LOADED',
  SET_SYNCING: 'SET_SYNCING',
  
  // SSR safety
  SET_CLIENT: 'SET_CLIENT',
  
  // Legacy compatibility
  SYNC_TO_LEGACY: 'SYNC_TO_LEGACY'
};

// Helper function to calculate totals from weeks data
const calculateTotals = (weeks) => {
  let totalItems = 0;
  let totalCost = 0;
  
  weeks.forEach(week => {
    if (week.meals) {
      Object.values(week.meals).forEach(dayMeals => {
        if (dayMeals.lunch) {
          totalItems += dayMeals.lunch.length;
          totalCost += dayMeals.lunch.reduce((sum, item) => sum + (item.price || 0), 0);
        }
        if (dayMeals.dinner) {
          totalItems += dayMeals.dinner.length;
          totalCost += dayMeals.dinner.reduce((sum, item) => sum + (item.price || 0), 0);
        }
      });
    }
  });
  
  return { totalItems, totalCost };
};

// Helper function to sync subscription plan data to legacy format
const syncToLegacyFormat = (weeks, currentWeekIndex) => {
  const weeklyPlans = {
    week0: { ...initialWeekPlan },
    week1: { ...initialWeekPlan }
  };
  
  // Map first two weeks to legacy format
  if (weeks[0]) {
    weeklyPlans.week0 = weeks[0].meals || initialWeekPlan;
  }
  if (weeks[1]) {
    weeklyPlans.week1 = weeks[1].meals || initialWeekPlan;
  }
  
  // Current week for backward compatibility
  const weeklyPlan = weeks[currentWeekIndex]?.meals || initialWeekPlan;
  
  return { weeklyPlans, weeklyPlan };
};

// Reducer function
const subscriptionMealPlanReducer = (state, action) => {
  switch (action.type) {
    case SUBSCRIPTION_MEAL_PLAN_ACTIONS.SET_CLIENT:
      return {
        ...state,
        isClient: true
      };
      
    case SUBSCRIPTION_MEAL_PLAN_ACTIONS.LOAD_SUBSCRIPTION_PLAN: {
      const { subscriptionMealPlan } = action.payload;
      
      if (!subscriptionMealPlan) {
        return state;
      }
      
      const weeks = subscriptionMealPlan.weeks || [];
      const { totalItems } = calculateTotals(weeks);
      const { weeklyPlans, weeklyPlan } = syncToLegacyFormat(weeks, subscriptionMealPlan.currentWeekIndex || 0);
      
      return {
        ...state,
        subscriptionMealPlan,
        planId: subscriptionMealPlan._id,
        planType: subscriptionMealPlan.planType,
        subscriptionId: subscriptionMealPlan.subscriptionId,
        restaurantId: subscriptionMealPlan.restaurantId,
        weeks,
        currentWeekIndex: subscriptionMealPlan.currentWeekIndex || 0,
        totalWeeks: weeks.length,
        totalItems,
        selectedRestaurantId: subscriptionMealPlan.selectedRestaurantId,
        selectedRestaurantName: subscriptionMealPlan.selectedRestaurantName,
        selectedRestaurantData: subscriptionMealPlan.selectedRestaurantData,
        weeklyPlans,
        weeklyPlan,
        lastSyncTime: new Date().toISOString()
      };
    }
    
    case SUBSCRIPTION_MEAL_PLAN_ACTIONS.ADD_MEAL_TO_WEEK: {
      const { weekIndex, day, mealType, item, restaurantName } = action.payload;
      
      if (!state.weeks[weekIndex]) {
        return state;
      }
      
      const mealItem = {
        ...item,
        planId: `${weekIndex}_${day}_${mealType}_${item.id}_${Date.now()}`,
        restaurantName,
        addedAt: new Date().toISOString()
      };
      
      const newWeeks = [...state.weeks];
      if (!newWeeks[weekIndex].meals) {
        newWeeks[weekIndex].meals = { ...initialWeekPlan };
      }
      if (!newWeeks[weekIndex].meals[day]) {
        newWeeks[weekIndex].meals[day] = { lunch: [], dinner: [] };
      }
      
      newWeeks[weekIndex].meals[day][mealType] = [
        ...newWeeks[weekIndex].meals[day][mealType],
        mealItem
      ];
      
      const { totalItems } = calculateTotals(newWeeks);
      const { weeklyPlans, weeklyPlan } = syncToLegacyFormat(newWeeks, state.currentWeekIndex);
      
      return {
        ...state,
        weeks: newWeeks,
        totalItems,
        weeklyPlans,
        weeklyPlan
      };
    }
    
    case SUBSCRIPTION_MEAL_PLAN_ACTIONS.REMOVE_MEAL_FROM_WEEK: {
      const { weekIndex, day, mealType, planId } = action.payload;
      
      if (!state.weeks[weekIndex]?.meals?.[day]?.[mealType]) {
        return state;
      }
      
      const newWeeks = [...state.weeks];
      newWeeks[weekIndex].meals[day][mealType] = newWeeks[weekIndex].meals[day][mealType].filter(
        item => item.planId !== planId
      );
      
      const { totalItems } = calculateTotals(newWeeks);
      const { weeklyPlans, weeklyPlan } = syncToLegacyFormat(newWeeks, state.currentWeekIndex);
      
      return {
        ...state,
        weeks: newWeeks,
        totalItems,
        weeklyPlans,
        weeklyPlan
      };
    }
    
    case SUBSCRIPTION_MEAL_PLAN_ACTIONS.CLEAR_WEEK: {
      const { weekIndex } = action.payload;
      
      if (!state.weeks[weekIndex]) {
        return state;
      }
      
      const newWeeks = [...state.weeks];
      newWeeks[weekIndex].meals = { ...initialWeekPlan };
      
      const { totalItems } = calculateTotals(newWeeks);
      const { weeklyPlans, weeklyPlan } = syncToLegacyFormat(newWeeks, state.currentWeekIndex);
      
      return {
        ...state,
        weeks: newWeeks,
        totalItems,
        weeklyPlans,
        weeklyPlan
      };
    }
    
    case SUBSCRIPTION_MEAL_PLAN_ACTIONS.SET_CURRENT_WEEK: {
      const { weekIndex } = action.payload;
      const { weeklyPlans, weeklyPlan } = syncToLegacyFormat(state.weeks, weekIndex);
      
      return {
        ...state,
        currentWeekIndex: weekIndex,
        weeklyPlans,
        weeklyPlan
      };
    }
    
    case SUBSCRIPTION_MEAL_PLAN_ACTIONS.SET_SELECTED_RESTAURANT: {
      const { restaurantId, restaurantName, restaurantData } = action.payload;
      
      return {
        ...state,
        selectedRestaurantId: restaurantId,
        selectedRestaurantName: restaurantName,
        selectedRestaurantData: restaurantData
      };
    }
    
    case SUBSCRIPTION_MEAL_PLAN_ACTIONS.CLEAR_SELECTED_RESTAURANT:
      return {
        ...state,
        selectedRestaurantId: null,
        selectedRestaurantName: null,
        selectedRestaurantData: null
      };
      
    case SUBSCRIPTION_MEAL_PLAN_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoadingFromDatabase: action.payload
      };
      
    case SUBSCRIPTION_MEAL_PLAN_ACTIONS.SET_LOADED:
      return {
        ...state,
        hasLoadedFromDatabase: action.payload
      };
      
    case SUBSCRIPTION_MEAL_PLAN_ACTIONS.SET_SYNCING:
      return {
        ...state,
        isSyncing: action.payload
      };
      
    default:
      return state;
  }
};

// Create context
const SubscriptionMealPlanContext = createContext();

// Provider component
export const SubscriptionMealPlanProvider = ({ children }) => {
  const [state, dispatch] = useReducer(subscriptionMealPlanReducer, initialState);
  const { isAuthenticated, user } = useAuth();
  const { showError, showSuccess } = useToast();
  const saveTimeoutRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Set client-side flag
  useEffect(() => {
    if (isClient) {
      dispatch({ type: SUBSCRIPTION_MEAL_PLAN_ACTIONS.SET_CLIENT });
      setIsInitialized(true);
    }
  }, []);

  // API functions
  const apiCall = async (endpoint, options = {}) => {
    if (!isClient) return null;
    
    try {
      const token = getStorageItem('token');
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          ...options.headers
        },
        ...options
      });
      
      if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API call error:', error);
      throw error;
    }
  };

  // Load subscription meal plan
  const loadSubscriptionMealPlan = async (subscriptionId, restaurantId, planType = 'bi-weekly') => {
    if (!isClient || !isAuthenticated) return;
    
    try {
      dispatch({ type: SUBSCRIPTION_MEAL_PLAN_ACTIONS.SET_LOADING, payload: true });
      
      const response = await apiCall(
        `/subscription-meal-plans/me?subscriptionId=${subscriptionId}&restaurantId=${restaurantId}&planType=${planType}`
      );
      
      if (response?.status === 'success' && response.data?.mealPlan) {
        dispatch({
          type: SUBSCRIPTION_MEAL_PLAN_ACTIONS.LOAD_SUBSCRIPTION_PLAN,
          payload: { subscriptionMealPlan: response.data.mealPlan }
        });
        
        // Cache in localStorage for offline access
        setStorageItem('subscriptionMealPlan', response.data.mealPlan);
      }
      
    } catch (error) {
      console.error('Error loading subscription meal plan:', error);
      showError('Failed to load meal plan');
      
      // Try to load from cache
      const cachedPlan = getStorageItem('subscriptionMealPlan');
      if (cachedPlan) {
        dispatch({
          type: SUBSCRIPTION_MEAL_PLAN_ACTIONS.LOAD_SUBSCRIPTION_PLAN,
          payload: { subscriptionMealPlan: cachedPlan }
        });
      }
    } finally {
      dispatch({ type: SUBSCRIPTION_MEAL_PLAN_ACTIONS.SET_LOADING, payload: false });
      dispatch({ type: SUBSCRIPTION_MEAL_PLAN_ACTIONS.SET_LOADED, payload: true });
    }
  };

  // Add meal to specific week
  const addMealToWeek = async (weekIndex, day, mealType, item, restaurantName, deliveryTime = '12:00') => {
    if (!isClient) return { success: false, error: 'Not available on server' };
    
    try {
      // Optimistic update
      dispatch({
        type: SUBSCRIPTION_MEAL_PLAN_ACTIONS.ADD_MEAL_TO_WEEK,
        payload: { weekIndex, day, mealType, item, restaurantName }
      });
      
      // Sync to server if authenticated
      if (isAuthenticated && state.planId) {
        dispatch({ type: SUBSCRIPTION_MEAL_PLAN_ACTIONS.SET_SYNCING, payload: true });
        
        await apiCall(`/subscription-meal-plans/${state.planId}`, {
          method: 'PUT',
          body: JSON.stringify({
            action: 'add',
            weekIndex,
            day,
            mealType,
            menuItemId: item.id,
            deliveryTime
          })
        });
      }
      
      return { success: true };
      
    } catch (error) {
      console.error('Error adding meal to week:', error);
      showError('Failed to add meal');
      return { success: false, error: error.message };
    } finally {
      dispatch({ type: SUBSCRIPTION_MEAL_PLAN_ACTIONS.SET_SYNCING, payload: false });
    }
  };

  // Remove meal from specific week
  const removeMealFromWeek = async (weekIndex, day, mealType, planId) => {
    if (!isClient) return;
    
    try {
      // Optimistic update
      dispatch({
        type: SUBSCRIPTION_MEAL_PLAN_ACTIONS.REMOVE_MEAL_FROM_WEEK,
        payload: { weekIndex, day, mealType, planId }
      });
      
      // Sync to server if authenticated
      if (isAuthenticated && state.planId) {
        dispatch({ type: SUBSCRIPTION_MEAL_PLAN_ACTIONS.SET_SYNCING, payload: true });
        
        await apiCall(`/subscription-meal-plans/${state.planId}`, {
          method: 'PUT',
          body: JSON.stringify({
            action: 'remove',
            weekIndex,
            day,
            mealType,
            planItemId: planId
          })
        });
      }
      
    } catch (error) {
      console.error('Error removing meal from week:', error);
      showError('Failed to remove meal');
    } finally {
      dispatch({ type: SUBSCRIPTION_MEAL_PLAN_ACTIONS.SET_SYNCING, payload: false });
    }
  };

  // Clear entire week
  const clearWeek = async (weekIndex) => {
    if (!isClient) return;
    
    try {
      // Optimistic update
      dispatch({
        type: SUBSCRIPTION_MEAL_PLAN_ACTIONS.CLEAR_WEEK,
        payload: { weekIndex }
      });
      
      // Sync to server if authenticated
      if (isAuthenticated && state.planId) {
        dispatch({ type: SUBSCRIPTION_MEAL_PLAN_ACTIONS.SET_SYNCING, payload: true });
        
        await apiCall(`/subscription-meal-plans/${state.planId}`, {
          method: 'PUT',
          body: JSON.stringify({
            action: 'clearWeek',
            weekIndex
          })
        });
      }
      
      showSuccess('Week cleared successfully');
      
    } catch (error) {
      console.error('Error clearing week:', error);
      showError('Failed to clear week');
    } finally {
      dispatch({ type: SUBSCRIPTION_MEAL_PLAN_ACTIONS.SET_SYNCING, payload: false });
    }
  };

  // Set current week
  const setCurrentWeek = (weekIndex) => {
    dispatch({
      type: SUBSCRIPTION_MEAL_PLAN_ACTIONS.SET_CURRENT_WEEK,
      payload: { weekIndex }
    });
  };

  // Set selected restaurant
  const setSelectedRestaurant = (restaurantId, restaurantName, restaurantData) => {
    dispatch({
      type: SUBSCRIPTION_MEAL_PLAN_ACTIONS.SET_SELECTED_RESTAURANT,
      payload: { restaurantId, restaurantName, restaurantData }
    });
  };

  // Helper functions for backward compatibility
  const getWeekPlan = (weekIndex) => {
    return state.weeks[weekIndex]?.meals || initialWeekPlan;
  };

  const getWeekMealItems = (day, mealType, weekIndex) => {
    return state.weeks[weekIndex]?.meals?.[day]?.[mealType] || [];
  };

  const getWeekTotalItems = (weekIndex) => {
    const week = state.weeks[weekIndex];
    if (!week?.meals) return 0;
    
    let count = 0;
    Object.values(week.meals).forEach(dayMeals => {
      count += (dayMeals.lunch?.length || 0) + (dayMeals.dinner?.length || 0);
    });
    return count;
  };

  const getWeekTotalCost = (weekIndex) => {
    const week = state.weeks[weekIndex];
    if (!week?.meals) return 0;
    
    let cost = 0;
    Object.values(week.meals).forEach(dayMeals => {
      if (dayMeals.lunch) {
        cost += dayMeals.lunch.reduce((sum, item) => sum + (item.price || 0), 0);
      }
      if (dayMeals.dinner) {
        cost += dayMeals.dinner.reduce((sum, item) => sum + (item.price || 0), 0);
      }
    });
    return cost;
  };

  // Context value
  const contextValue = {
    // State
    ...state,
    isInitialized,
    
    // Actions
    loadSubscriptionMealPlan,
    addMealToWeek,
    removeMealFromWeek,
    clearWeek,
    setCurrentWeek,
    setSelectedRestaurant,
    
    // Helper functions
    getWeekPlan,
    getWeekMealItems,
    getWeekTotalItems,
    getWeekTotalCost,
    
    // Legacy compatibility functions
    addItemToPlanWeek: addMealToWeek,
    removeItemFromPlanWeek: removeMealFromWeek,
    getRestaurantsInWeekPlan: (weekIndex) => {
      const week = state.weeks[weekIndex];
      if (!week?.meals) return [];
      
      const restaurants = new Set();
      Object.values(week.meals).forEach(dayMeals => {
        [...(dayMeals.lunch || []), ...(dayMeals.dinner || [])].forEach(item => {
          if (item.restaurantName) {
            restaurants.add(item.restaurantName);
          }
        });
      });
      return Array.from(restaurants);
    }
  };

  return (
    <SubscriptionMealPlanContext.Provider value={contextValue}>
      {children}
    </SubscriptionMealPlanContext.Provider>
  );
};

// Hook to use the context
export const useSubscriptionMealPlan = () => {
  const context = useContext(SubscriptionMealPlanContext);
  if (!context) {
    throw new Error('useSubscriptionMealPlan must be used within a SubscriptionMealPlanProvider');
  }
  return context;
};

export default SubscriptionMealPlanContext;
