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
  LOAD_FROM_DATABASE: 'LOAD_FROM_DATABASE'
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
      
      const newWeeklyPlans = {
        ...state.weeklyPlans,
        [`week${week}`]: {
          ...state.weeklyPlans[`week${week}`],
          [day]: {
            ...state.weeklyPlans[`week${week}`][day],
            [mealType]: [...state.weeklyPlans[`week${week}`][day][mealType], item]
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
      
      const newWeeklyPlans = {
        ...state.weeklyPlans,
        [`week${week}`]: {
          ...state.weeklyPlans[`week${week}`],
          [day]: {
            ...state.weeklyPlans[`week${week}`][day],
            [mealType]: state.weeklyPlans[`week${week}`][day][mealType].filter(item => item.planId !== planId)
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
      if (isAuthenticated && user) {
        // Try to load from database first
        try {
          const response = await apiClient.get('/weekly-plans/me');
          if (response.data?.status === 'success' && response.data?.data) {
            const { weeklyPlans, totalItems } = response.data.data;
            dispatch({
              type: MEAL_PLAN_ACTIONS.LOAD_FROM_DATABASE,
              payload: { weeklyPlans, totalItems }
            });
            setIsLoading(false);
            return;
          }
        } catch (error) {
          console.log('Could not load from database, falling back to localStorage:', error.message);
        }
      }
      
      // Fallback to localStorage
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
      
      setIsLoading(false);
    };

    loadMealPlanData();
  }, [isAuthenticated, user]);

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
        calculatedTotalItems += dayMeals.lunch.length + dayMeals.dinner.length;
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
      await apiClient.post('/weekly-plans', mealPlanData);
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
    
    // Actions
    addItemToPlan,
    addItemToPlanWeek,
    removeItemFromPlan,
    removeItemFromPlanWeek,
    clearWeek,
    clearAll,
    
    // Helpers
    getWeekPlan,
    getWeekMealItems,
    getWeekTotalItems,
    getRestaurantsInWeekPlan,
    getRestaurantsInAllWeeks
  };

  return (
    <MealPlanContext.Provider value={value}>
      {children}
    </MealPlanContext.Provider>
  );
};
