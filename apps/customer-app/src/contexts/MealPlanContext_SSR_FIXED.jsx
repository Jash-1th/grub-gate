import React, { createContext, useContext, useReducer, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import apiClient from '../api/apiClient';
import restaurantSelectionApi from '../api/restaurantSelectionApi';
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

// Function to get initial state with localStorage data (client-side only)
const getInitialState = () => {
  console.log('🚀 DEBUG: getInitialState called');
  console.log('🚀 DEBUG: typeof window:', typeof window);
  
  const baseState = {
    weeklyPlans: {
      week0: { ...initialWeekPlan },
      week1: { ...initialWeekPlan }
    },
    weeklyPlan: { ...initialWeekPlan },
    totalItems: 0,
    // Multi-restaurant support (max 2 restaurants)
    selectedRestaurants: [],
    maxRestaurants: 2,
    // Legacy fields for backward compatibility
    selectedRestaurant: null,
    selectedRestaurantId: null,
    selectedRestaurantName: null,
    selectedRestaurantData: null,
    loadedFromDatabase: false
  };

  console.log('🚀 DEBUG: baseState created:', baseState);

  // Only load from localStorage on client-side to prevent SSR mismatch
  if (typeof window !== 'undefined') {
    console.log('🚀 DEBUG: Window is available, checking localStorage');
    try {
      const savedWeeklyPlans = getStorageItem('weeklyPlans');
      const savedMealPlan = getStorageItem('mealPlan');
      
      console.log('🚀 DEBUG: savedWeeklyPlans:', savedWeeklyPlans);
      console.log('🚀 DEBUG: savedMealPlan:', savedMealPlan);
      
      if (savedWeeklyPlans && savedWeeklyPlans.weeklyPlans) {
        console.log('🔄 DEBUG: Loading initial state from localStorage weeklyPlans:', savedWeeklyPlans);
        const loadedState = {
          ...baseState,
          weeklyPlans: savedWeeklyPlans.weeklyPlans,
          totalItems: savedWeeklyPlans.totalItems || 0,
          selectedRestaurants: savedWeeklyPlans.selectedRestaurants || [],
          maxRestaurants: savedWeeklyPlans.maxRestaurants === undefined ? 2 : savedWeeklyPlans.maxRestaurants,
          // Update legacy fields from first restaurant for backward compatibility
          selectedRestaurantId: savedWeeklyPlans.selectedRestaurants?.[0]?.restaurantId || null,
          selectedRestaurantName: savedWeeklyPlans.selectedRestaurants?.[0]?.restaurantName || null,
          selectedRestaurantData: savedWeeklyPlans.selectedRestaurants?.[0]?.restaurantData || null,
          loadedFromDatabase: true
        };
        console.log('🔄 DEBUG: Returning loaded state with restaurant selection:', loadedState);
        return loadedState;
      } else if (savedMealPlan && savedMealPlan.weeklyPlan) {
        console.log('🔄 DEBUG: Loading initial state from legacy localStorage:', savedMealPlan);
        const legacyState = {
          ...baseState,
          weeklyPlans: { week0: savedMealPlan.weeklyPlan, week1: { ...initialWeekPlan } },
          totalItems: savedMealPlan.totalItems || 0,
          loadedFromDatabase: true
        };
        console.log('🔄 DEBUG: Returning legacy state:', legacyState);
        return legacyState;
      } else {
        console.log('🚀 DEBUG: No localStorage data found');
      }
    } catch (error) {
      console.error('🚀 DEBUG: Error loading initial state from localStorage:', error);
    }
  } else {
    console.log('🚀 DEBUG: Window not available (SSR)');
  }

  console.log('🚀 DEBUG: Returning baseState:', baseState);
  return baseState;
};

// Initial state for the meal plan (supports multiple weeks and restaurants)
const initialState = getInitialState();

// Action types
const MEAL_PLAN_ACTIONS = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  CLEAR_DAY: 'CLEAR_DAY',
  CLEAR_ALL: 'CLEAR_ALL',
  CLEAR_ALL_WEEKS: 'CLEAR_ALL_WEEKS',
  ADD_ITEM_TO_WEEK: 'ADD_ITEM_TO_WEEK',
  REMOVE_ITEM_FROM_WEEK: 'REMOVE_ITEM_FROM_WEEK',
  CLEAR_WEEK: 'CLEAR_WEEK',
  SET_LOADED_FROM_DATABASE: 'SET_LOADED_FROM_DATABASE',
  SET_MAX_RESTAURANTS: 'SET_MAX_RESTAURANTS',
  // Multi-restaurant actions
  ADD_SELECTED_RESTAURANT: 'ADD_SELECTED_RESTAURANT',
  REMOVE_SELECTED_RESTAURANT: 'REMOVE_SELECTED_RESTAURANT',
  CLEAR_SELECTED_RESTAURANTS: 'CLEAR_SELECTED_RESTAURANTS',
  // Legacy actions for backward compatibility
  SET_SELECTED_RESTAURANT: 'SET_SELECTED_RESTAURANT',
  CLEAR_SELECTED_RESTAURANT: 'CLEAR_SELECTED_RESTAURANT',
  LOAD_FROM_DATABASE: 'LOAD_FROM_DATABASE',
  SYNC_DATABASE_DATA: 'SYNC_DATABASE_DATA'
};

// SSR-Safe reducer (no localStorage operations)
const mealPlanReducer = (state, action) => {
  console.log('🔄 DEBUG: Reducer called with action:', action.type);
  console.log('🔄 DEBUG: Current state before action:', state);
  
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

    case MEAL_PLAN_ACTIONS.CLEAR_ALL_WEEKS: {
      console.log('🔄 CLEAR_ALL_WEEKS - clearing all weekly plans');
      
      return {
        ...state,
        weeklyPlans: {
          week0: { ...initialWeekPlan },
          week1: { ...initialWeekPlan }
        },
        totalItems: 0
      };
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

    case MEAL_PLAN_ACTIONS.SET_MAX_RESTAURANTS: {
      const { maxRestaurants } = action.payload;
      console.log('🔄 SET_MAX_RESTAURANTS:', maxRestaurants);
      return {
        ...state,
        maxRestaurants
      };
    }

    case MEAL_PLAN_ACTIONS.ADD_SELECTED_RESTAURANT: {
      const { restaurantId, restaurantName, restaurantData } = action.payload;
      console.log('🔄 ADD_SELECTED_RESTAURANT:', { restaurantId, restaurantName });
      
      // Check if restaurant already exists
      const existingIndex = state.selectedRestaurants.findIndex(r => r.restaurantId === restaurantId);
      if (existingIndex !== -1) {
        console.log('⚠️ Restaurant already selected');
        return state;
      }
      
      // Check max restaurants limit
      if (state.maxRestaurants !== null && state.maxRestaurants !== undefined && state.selectedRestaurants.length >= state.maxRestaurants) {
        console.log('⚠️ Maximum restaurants limit reached');
        return state;
      }
      
      const newRestaurant = {
        restaurantId,
        restaurantName,
        restaurantData,
        addedAt: new Date()
      };
      
      const updatedRestaurants = [...state.selectedRestaurants, newRestaurant];
      
      return {
        ...state,
        selectedRestaurants: updatedRestaurants,
        // Update legacy fields for backward compatibility (use first restaurant)
        selectedRestaurantId: updatedRestaurants[0]?.restaurantId || null,
        selectedRestaurantName: updatedRestaurants[0]?.restaurantName || null,
        selectedRestaurantData: updatedRestaurants[0]?.restaurantData || null
      };
    }

    case MEAL_PLAN_ACTIONS.REMOVE_SELECTED_RESTAURANT: {
      const { restaurantId } = action.payload;
      console.log('🔄 REMOVE_SELECTED_RESTAURANT:', restaurantId);
      
      const updatedRestaurants = state.selectedRestaurants.filter(r => r.restaurantId !== restaurantId);
      
      return {
        ...state,
        selectedRestaurants: updatedRestaurants,
        // Update legacy fields for backward compatibility (use first restaurant)
        selectedRestaurantId: updatedRestaurants[0]?.restaurantId || null,
        selectedRestaurantName: updatedRestaurants[0]?.restaurantName || null,
        selectedRestaurantData: updatedRestaurants[0]?.restaurantData || null
      };
    }

    case MEAL_PLAN_ACTIONS.CLEAR_SELECTED_RESTAURANTS: {
      console.log('🔄 CLEAR_SELECTED_RESTAURANTS');
      
      return {
        ...state,
        selectedRestaurants: [],
        // Clear legacy fields
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
      
      // Fix missing restaurantId in meal items
      const fixedWeeklyPlans = {};
      Object.keys(syncedWeeklyPlans).forEach(weekKey => {
        const week = syncedWeeklyPlans[weekKey];
        fixedWeeklyPlans[weekKey] = {};
        
        Object.keys(week).forEach(dayKey => {
          const day = week[dayKey];
          fixedWeeklyPlans[weekKey][dayKey] = {
            date: day.date, // Preserve the date field from database
            lunch: (day.lunch || []).map(item => {
              // Ensure menuItemId is preserved from database
              const processedItem = {
                ...item,
                menuItemId: item.id || item._id || item.menuItemId // Preserve the database ID as menuItemId
              };
              
              // If item doesn't have restaurantId, try to get it from selectedRestaurants
              if (!processedItem.restaurantId && databaseData.selectedRestaurants) {
                const matchingRestaurant = databaseData.selectedRestaurants.find(r => 
                  r.restaurantName === item.restaurantName || r.name === item.restaurantName
                );
                if (matchingRestaurant) {
                  return { ...processedItem, restaurantId: matchingRestaurant.restaurantId };
                }
              }
              return processedItem;
            }),
            dinner: (day.dinner || []).map(item => {
              // Ensure menuItemId is preserved from database
              const processedItem = {
                ...item,
                menuItemId: item.id || item._id || item.menuItemId // Preserve the database ID as menuItemId
              };
              
              // If item doesn't have restaurantId, try to get it from selectedRestaurants
              if (!processedItem.restaurantId && databaseData.selectedRestaurants) {
                const matchingRestaurant = databaseData.selectedRestaurants.find(r => 
                  r.restaurantName === item.restaurantName || r.name === item.restaurantName
                );
                if (matchingRestaurant) {
                  return { ...processedItem, restaurantId: matchingRestaurant.restaurantId };
                }
              }
              return processedItem;
            })
          };
        });
      });
      
      // Calculate total items
      const totalItems = Object.values(fixedWeeklyPlans).reduce((total, week) => {
        return total + Object.values(week).reduce((weekTotal, day) => {
          return weekTotal + (day.lunch?.length || 0) + (day.dinner?.length || 0);
        }, 0);
      }, 0);
      
      console.log('✅ Synced meal plan data with fixed restaurantIds:', { fixedWeeklyPlans, totalItems });
      
      return {
        ...state,
        weeklyPlans: fixedWeeklyPlans,
        totalItems: totalItems,
        // Multi-restaurant support
        selectedRestaurants: databaseData.selectedRestaurants || [],
        maxRestaurants: databaseData.maxRestaurants === undefined ? 2 : databaseData.maxRestaurants,
        // Legacy fields for backward compatibility
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
  console.log('🎯 DEBUG: MealPlanProvider render started');
  console.log('🎯 DEBUG: initialState at provider creation:', initialState);
  
  const [state, dispatch] = useReducer(mealPlanReducer, initialState);
  // Set isClient synchronously to prevent hydration mismatch on mobile
  const [isClient, setIsClient] = useState(typeof window !== 'undefined');
  // Set initial loading state based on whether we have data
  const [isLoading, setIsLoading] = useState(!initialState.loadedFromDatabase);
  const saveTimeoutRef = useRef(null);
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();

  console.log('🎯 DEBUG: MealPlanProvider state:', state);
  console.log('🎯 DEBUG: isClient:', isClient);
  console.log('🎯 DEBUG: isLoading:', isLoading);
  console.log('🎯 DEBUG: isAuthenticated:', isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const desiredMaxRestaurants = user.isGrubPass ? null : 2;
    if (state.maxRestaurants === desiredMaxRestaurants) return;

    dispatch({
      type: MEAL_PLAN_ACTIONS.SET_MAX_RESTAURANTS,
      payload: { maxRestaurants: desiredMaxRestaurants }
    });
  }, [isAuthenticated, user, state.maxRestaurants]);

  // SSR Safety - sync with database on mount
  useEffect(() => {
    
    const syncWithDatabase = async () => {
      try {
        // localStorage data is already loaded in initialState
        // Only sync with database if authenticated
        if (isAuthenticated && user) {
          try {
            const response = await apiClient.get('/meal-plans/me');
            if (response.data?.status === 'success' && response.data?.data) {
              console.log('📋 Syncing meal plan from database:', response.data.data);
              dispatch({
                type: MEAL_PLAN_ACTIONS.SYNC_DATABASE_DATA,
                payload: { databaseData: response.data.data }
              });
            } else if (response.data?.weeklyPlans) {
              console.log('📋 Syncing meal plan from database (direct format):', response.data);
              dispatch({
                type: MEAL_PLAN_ACTIONS.SYNC_DATABASE_DATA,
                payload: { databaseData: response.data }
              });
            }
          } catch (error) {
            console.log('Could not sync with database:', error.message);
            // Continue with localStorage data that's already loaded
          }
        }
        
      } catch (error) {
        console.error('Error syncing meal plan data:', error);
      } finally {
        // Stop loading state
        setIsLoading(false);
      }
    };

    syncWithDatabase();
  }, []); // ✅ Remove dependencies to prevent re-runs

  // Handle authentication changes separately (load user data when they log in)
  useEffect(() => {
    if (!isClient || isLoading) return;
    
    const loadUserData = async () => {
      if (isAuthenticated && user) {
        try {
          // Load meal plan data
          const mealPlanResponse = await apiClient.get('/meal-plans/me');
          if (mealPlanResponse.data?.status === 'success' && mealPlanResponse.data?.data) {
            console.log('🔄 Syncing meal plan data after login:', mealPlanResponse.data.data);
            dispatch({
              type: MEAL_PLAN_ACTIONS.SYNC_DATABASE_DATA,
              payload: { databaseData: mealPlanResponse.data.data }
            });
          }
          
          // Load restaurant selection data
          try {
            console.log('🎯 Attempting to load restaurant selection from database...');
            const restaurantResponse = await restaurantSelectionApi.getSelectedRestaurants();
            console.log('🎯 Restaurant API response:', restaurantResponse);
            
            if (restaurantResponse.status === 'success' && restaurantResponse.data?.selectedRestaurants?.length > 0) {
              console.log('🎯 Loading selected restaurants from database:', restaurantResponse.data.selectedRestaurants);
              const firstRestaurant = restaurantResponse.data.selectedRestaurants[0];
              
              // Update restaurant state (this will handle both legacy fields and selectedRestaurants array)
              dispatch({
                type: MEAL_PLAN_ACTIONS.ADD_SELECTED_RESTAURANT,
                payload: {
                  restaurantId: firstRestaurant.restaurantId,
                  restaurantName: firstRestaurant.restaurantName,
                  restaurantData: firstRestaurant
                }
              });
              
              console.log('✅ Restaurant selection loaded and set in context');
            } else {
              console.log('🔍 No restaurants found in database or invalid response');
            }
          } catch (restaurantError) {
            console.error('❌ Error loading restaurant selection from database:', restaurantError);
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
        totalItems: calculatedTotalItems,
        selectedRestaurants: state.selectedRestaurants,
        maxRestaurants: state.maxRestaurants
      });

      // Save to database if authenticated
      if (isAuthenticated && user) {
        saveMealPlanToDatabase({
          weeklyPlans: state.weeklyPlans,
          totalItems: calculatedTotalItems,
          selectedRestaurants: state.selectedRestaurants,
          maxRestaurants: state.maxRestaurants
        });
      }
    }, 1000);

    // Cleanup timeout on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [JSON.stringify(state.weeklyPlans), state.totalItems, JSON.stringify(state.selectedRestaurants), isAuthenticated, user, isClient, isLoading]);

  // Database save function
  const saveMealPlanToDatabase = async (mealPlanData) => {
    if (!isAuthenticated || !user) return;

    try {
      // Clean selectedRestaurants to match backend schema
      const selectedRestaurants = (mealPlanData.selectedRestaurants !== undefined ? mealPlanData.selectedRestaurants : state.selectedRestaurants);
      const cleanedSelectedRestaurants = selectedRestaurants.map(restaurant => ({
        restaurantId: restaurant.restaurantId,
        restaurantName: restaurant.restaurantName,
        addedAt: restaurant.addedAt || new Date()
      })).filter(restaurant => restaurant.restaurantId && restaurant.restaurantName); // Filter out invalid entries
      
      // Ensure proper data structure for API
      const apiData = {
        userId: user._id,
        weeklyPlans: mealPlanData.weeklyPlans || state.weeklyPlans,
        totalItems: mealPlanData.totalItems || state.totalItems,
        selectedRestaurants: cleanedSelectedRestaurants,
        maxRestaurants: mealPlanData.maxRestaurants === undefined ? state.maxRestaurants : mealPlanData.maxRestaurants,
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
  const addItemToPlan = async (item, day, mealType, restaurantName, userType, forceReplace = false, restaurantId = null) => {
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
      restaurantId: restaurantId || item.restaurantId, // Include restaurantId for validation
      addedAt: new Date().toISOString()
    };

    dispatch({
      type: MEAL_PLAN_ACTIONS.ADD_ITEM,
      payload: { item: itemWithPlan, day, mealType }
    });

    return { success: true };
  };

  const addItemToPlanWeek = async (item, day, mealType, restaurantName, week, userType, forceReplace = false, restaurantId = null) => {
    if (!isAuthenticated) {
      if (typeof window !== 'undefined') {
        setStorageItem('redirectAfterLogin', window.location.pathname + window.location.search);
      }
      return { success: false, error: 'AUTHENTICATION_REQUIRED' };
    }

    const itemWithPlan = {
      ...item,
      planId: `${Date.now()}-${Math.random()}`,
      menuItemId: item._id || item.id || item.menuItemId, // Ensure menuItemId is included
      restaurantName,
      restaurantId: restaurantId || item.restaurantId, // Include restaurantId for validation
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
  const setSelectedRestaurant = async (restaurantData) => {
    console.log('🎯 setSelectedRestaurant called with:', restaurantData);
    console.log('🎯 Type of restaurantData:', typeof restaurantData);
    console.log('🎯 restaurantData.id:', restaurantData?.id);
    console.log('🎯 restaurantData.name:', restaurantData?.name);
    
    // Validate restaurantData
    if (!restaurantData || typeof restaurantData !== 'object') {
      console.error('❌ Invalid restaurant data - expected object, got:', typeof restaurantData);
      return;
    }
    
    if (!restaurantData.id || !restaurantData.name) {
      console.error('❌ Invalid restaurant data - missing id or name:', restaurantData);
      return;
    }
    
    // Update local state
    dispatch({
      type: MEAL_PLAN_ACTIONS.SET_SELECTED_RESTAURANT,
      payload: { 
        restaurantId: restaurantData.id, 
        restaurantName: restaurantData.name, 
        restaurantData 
      }
    });
    
    // Save to database via restaurant selection API
    if (isAuthenticated && user) {
      try {
        // Sanitize restaurant data to only include fields expected by the schema
        const sanitizedRestaurant = {
          id: restaurantData.id || restaurantData._id,
          name: restaurantData.name,
          image: restaurantData.image,
          rating: restaurantData.rating,
          cuisine: Array.isArray(restaurantData.cuisine) ? restaurantData.cuisine.join(', ') : restaurantData.cuisine,
          distance: restaurantData.distance,
          deliveryTime: restaurantData.deliveryTime,
          isApiRestaurant: true
        };
        
        console.log('💾 Saving restaurant selection to database with sanitized data:', sanitizedRestaurant);
        await restaurantSelectionApi.addSelectedRestaurant(sanitizedRestaurant);
        console.log('✅ Restaurant selection saved successfully');
        
        // Note: The meal plan will be automatically saved by the useEffect when state updates
      } catch (error) {
        console.error('❌ Error saving restaurant selection:', error);
        console.error('❌ Error details:', error.response?.data);
        // Note: showError is not available in this context
        console.error('❌ Failed to save restaurant selection to database');
      }
    }
  };

  const clearSelectedRestaurant = async () => {
    console.log(' clearSelectedRestaurant called');
    console.log('🎯 clearSelectedRestaurant called');
    
    const currentRestaurantId = state.selectedRestaurantId;
    
    // Update local state
    dispatch({
      type: MEAL_PLAN_ACTIONS.CLEAR_SELECTED_RESTAURANT
    });
    
    // Remove from database
    if (isAuthenticated && user && currentRestaurantId) {
      try {
        console.log('💾 Removing restaurant selection from database');
        await restaurantSelectionApi.removeSelectedRestaurant(currentRestaurantId);
        console.log('✅ Restaurant selection removed successfully');
      } catch (error) {
        console.error('❌ Error removing restaurant selection:', error);
        showError?.('Failed to remove restaurant selection');
      }
    }
  };

  // Clear all meal plan data and restaurant selection (for restaurant switching)
  const clearAllMealPlanData = async () => {
    console.log('🎯 clearAllMealPlanData called - clearing everything');
    
    // Clear both weeks
    dispatch({
      type: MEAL_PLAN_ACTIONS.CLEAR_ALL_WEEKS
    });
    
    // Clear restaurant selection
    dispatch({
      type: MEAL_PLAN_ACTIONS.CLEAR_SELECTED_RESTAURANTS
    });
    
    // Clear planning context localStorage data as well
    console.log('🧹 Clearing planning context localStorage data');
    if (typeof window !== 'undefined') {
      removeStorageItem('grubgate_selected_restaurant');
      removeStorageItem('weeklyPlans'); // Also clear old meal plan data
      removeStorageItem('mealPlan'); // Clear legacy meal plan data
    }
    
    // IMPORTANT: Force reload restaurant selection from database to ensure it's cleared
    if (isAuthenticated && user) {
      console.log('🔄 Force reloading restaurant selection after cleanup to ensure it\'s cleared...');
      try {
        const restaurantResponse = await restaurantSelectionApi.getSelectedRestaurants();
        console.log('🔄 Restaurant reload response after cleanup:', restaurantResponse);
        
        // If restaurants still exist in database (shouldn't happen after subscription), clear them
        if (restaurantResponse.status === 'success' && restaurantResponse.data?.selectedRestaurants?.length > 0) {
          console.log('⚠️ WARNING: Restaurants still found in database after cleanup - this indicates incomplete backend cleanup');
        } else {
          console.log('✅ Confirmed: No restaurants found in database after cleanup');
        }
      } catch (error) {
        console.log('✅ Restaurant reload failed (expected after cleanup):', error.message);
      }
    }
    
    // Save properly cleared meal plan to database to ensure clean state
    if (isAuthenticated && user) {
      console.log('💾 Saving cleared meal plan to database after subscription cleanup');
      const clearedData = {
        weeklyPlans: {
          week0: {
            monday: { lunch: [], dinner: [] },
            tuesday: { lunch: [], dinner: [] },
            wednesday: { lunch: [], dinner: [] },
            thursday: { lunch: [], dinner: [] },
            friday: { lunch: [], dinner: [] },
            saturday: { lunch: [], dinner: [] },
            sunday: { lunch: [], dinner: [] }
          },
          week1: {
            monday: { lunch: [], dinner: [] },
            tuesday: { lunch: [], dinner: [] },
            wednesday: { lunch: [], dinner: [] },
            thursday: { lunch: [], dinner: [] },
            friday: { lunch: [], dinner: [] },
            saturday: { lunch: [], dinner: [] },
            sunday: { lunch: [], dinner: [] }
          }
        },
        totalItems: 0,
        selectedRestaurants: [],
        maxRestaurants: state.maxRestaurants
      };
      console.log('🧹 Cleared data to save:', clearedData);
      
      // Save immediately instead of using timeout to ensure it happens
      try {
        await saveMealPlanToDatabase(clearedData);
        console.log('✅ Successfully saved cleared meal plan to database');
      } catch (error) {
        console.error('❌ Error saving cleared meal plan:', error);
      }
    }
  };

  // Clear items from a specific restaurant
  const clearItemsByRestaurant = async (restaurantId) => {
    console.log('🎯 clearItemsByRestaurant called for restaurant:', restaurantId);
    
    try {
      // Call backend API to clear items
      const response = await apiClient.delete(`/meal-plans/${user._id}/clear-restaurant/${restaurantId}`);
      
      if (response.data?.status === 'success') {
        console.log('✅ Items cleared from restaurant successfully');
        
        // Update local state with the cleaned meal plan
        const cleanedMealPlan = response.data.data;
        dispatch({
          type: MEAL_PLAN_ACTIONS.SYNC_DATABASE_DATA,
          payload: { databaseData: cleanedMealPlan }
        });
        
        return response.data.data.itemsRemoved || 0;
      }
    } catch (error) {
      console.error('❌ Error clearing items by restaurant:', error);
      throw error;
    }
  };

  // Multi-restaurant functions
  const addSelectedRestaurant = (restaurantId, restaurantName, restaurantData = null) => {
    console.log('🎯 addSelectedRestaurant called:', { restaurantId, restaurantName });
    
    // Check if restaurant already exists
    const existingRestaurant = state.selectedRestaurants.find(r => r.restaurantId === restaurantId);
    if (existingRestaurant) {
      console.log('⚠️ Restaurant already selected');
      return false;
    }
    
    // Check max restaurants limit
    if (state.maxRestaurants !== null && state.maxRestaurants !== undefined && state.selectedRestaurants.length >= state.maxRestaurants) {
      console.log('⚠️ Maximum restaurants limit reached');
      return false;
    }
    
    dispatch({
      type: MEAL_PLAN_ACTIONS.ADD_SELECTED_RESTAURANT,
      payload: { restaurantId, restaurantName, restaurantData }
    });
    
    // Note: Database save will be triggered by the useEffect that watches for state changes
    // No need for immediate save here as the state update will trigger the save automatically
    
    return true;
  };

  const removeSelectedRestaurant = async (restaurantId) => {
    console.log('🎯 removeSelectedRestaurant called:', restaurantId);
    
    try {
      // Call backend API to remove restaurant
      if (isAuthenticated && user) {
        console.log('💾 Removing restaurant from database via API');
        await restaurantSelectionApi.removeSelectedRestaurant(restaurantId);
        console.log('✅ Restaurant removed from database successfully');
      }
      
      // Update local state
      dispatch({
        type: MEAL_PLAN_ACTIONS.REMOVE_SELECTED_RESTAURANT,
        payload: { restaurantId }
      });
      
    } catch (error) {
      console.error('❌ Error removing selected restaurant:', error);
      throw error;
    }
  };

  const clearSelectedRestaurants = () => {
    console.log('🎯 clearSelectedRestaurants called');
    dispatch({
      type: MEAL_PLAN_ACTIONS.CLEAR_SELECTED_RESTAURANTS
    });
  };

  const canAddRestaurant = () => {
    if (state.maxRestaurants === null || state.maxRestaurants === undefined) return true;
    return state.selectedRestaurants.length < state.maxRestaurants;
  };

  const isRestaurantSelected = (restaurantId) => {
    const result = state.selectedRestaurants.some(r => r.restaurantId === restaurantId);
    console.log('🔍 isRestaurantSelected check:', {
      restaurantId,
      selectedRestaurants: state.selectedRestaurants,
      result
    });
    return result;
  };

  const getSelectedRestaurantCount = () => {
    return state.selectedRestaurants.length;
  };

  const getSelectedRestaurants = () => {
    return state.selectedRestaurants;
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

  // Don't show loading screen during SSR to prevent hydration mismatch
  // Instead, render children with initial state and let useEffect handle data loading
  if (!isClient) {
    // During SSR, provide initial empty state to prevent hydration mismatch
    const ssrValue = {
      // State
      ...initialState,
      isClient: false,
      isLoadingFromDatabase: true,
      hasLoadedFromDatabase: false,
      // Legacy state compatibility
      mealPlan: initialState.weeklyPlan,
      weeklyPlan: initialState.weeklyPlan,
      
      // Actions (no-op functions during SSR)
      addItemToPlan: () => Promise.resolve({ success: false }),
      addItemToPlanWeek: () => Promise.resolve({ success: false }),
      removeItemFromPlan: () => {},
      removeItemFromPlanWeek: () => {},
      clearWeek: () => {},
      clearAll: () => {},
      
      // Restaurant selection actions (legacy)
      setSelectedRestaurant: () => {},
      clearSelectedRestaurant: () => {},
      clearAllMealPlanData: () => {},
      clearItemsByRestaurant: () => Promise.resolve(0),
      
      // Multi-restaurant actions
      addSelectedRestaurant: () => false,
      removeSelectedRestaurant: () => Promise.resolve(),
      clearSelectedRestaurants: () => {},
      canAddRestaurant: () => true,
      isRestaurantSelected: () => false,
      getSelectedRestaurantCount: () => 0,
      getSelectedRestaurants: () => [],
      
      // Helpers
      getWeekPlan: () => initialWeekPlan,
      getWeekMealItems: () => [],
      getWeekTotalItems: () => 0,
      getWeekTotalCost: () => 0,
      getRestaurantsInWeekPlan: () => [],
      getRestaurantsInAllWeeks: () => [],
      getRestaurantsInPlan: () => [],
      getRestaurantIdsInWeekPlan: () => [],
      getRestaurantIdsInAllWeeks: () => [],
      getWeeklyPlanSummary: () => ({ totalItems: 0, totalCost: '0.00', restaurants: [], restaurantCount: 0 }),
      getItemQuantityInPlan: () => 0,
      isItemInPlan: () => false,
      // Legacy compatibility
      getDayItems: () => ({ lunch: [], dinner: [] }),
      getDayItemsCount: () => 0,
      getMealItems: () => [],
      getTotalItemsCount: () => 0
    };

    return (
      <MealPlanContext.Provider value={ssrValue}>
        {children}
      </MealPlanContext.Provider>
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
    
    // Restaurant selection actions (legacy)
    setSelectedRestaurant,
    clearSelectedRestaurant,
    clearAllMealPlanData,
    clearItemsByRestaurant,
    
    // Multi-restaurant actions
    addSelectedRestaurant,
    removeSelectedRestaurant,
    clearSelectedRestaurants,
    canAddRestaurant,
    isRestaurantSelected,
    getSelectedRestaurantCount,
    getSelectedRestaurants,
    
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
