import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import apiClient from '../api/apiClient';

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
    week0: { // Current week
      monday: { lunch: [], dinner: [] },
      tuesday: { lunch: [], dinner: [] },
      wednesday: { lunch: [], dinner: [] },
      thursday: { lunch: [], dinner: [] },
      friday: { lunch: [], dinner: [] },
      saturday: { lunch: [], dinner: [] },
      sunday: { lunch: [], dinner: [] }
    },
    week1: { // Next week
      monday: { lunch: [], dinner: [] },
      tuesday: { lunch: [], dinner: [] },
      wednesday: { lunch: [], dinner: [] },
      thursday: { lunch: [], dinner: [] },
      friday: { lunch: [], dinner: [] },
      saturday: { lunch: [], dinner: [] },
      sunday: { lunch: [], dinner: [] }
    }
  },
  // Keep backward compatibility
  weeklyPlan: {
    monday: { lunch: [], dinner: [] },
    tuesday: { lunch: [], dinner: [] },
    wednesday: { lunch: [], dinner: [] },
    thursday: { lunch: [], dinner: [] },
    friday: { lunch: [], dinner: [] },
    saturday: { lunch: [], dinner: [] },
    sunday: { lunch: [], dinner: [] }
  },
  totalItems: 0,
  // Restaurant selection tracking
  selectedRestaurantId: null, // MongoDB ObjectId or numeric ID of selected restaurant
  selectedRestaurantName: null, // Name of selected restaurant for display
  selectedRestaurantData: null, // Full restaurant object for UI display
  // Loading state tracking
  isLoadingFromDatabase: false, // Track if we're currently loading from database
  hasLoadedFromDatabase: false // Track if we've completed the initial database load
};

// Action types
const MEAL_PLAN_ACTIONS = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  CLEAR_DAY: 'CLEAR_DAY',
  CLEAR_ALL: 'CLEAR_ALL',
  LOAD_FROM_STORAGE: 'LOAD_FROM_STORAGE',
  LOAD_WEEKLY_PLANS: 'LOAD_WEEKLY_PLANS',
  LOAD_MEAL_PLAN: 'LOAD_MEAL_PLAN',
  // New week-specific actions
  ADD_ITEM_TO_WEEK: 'ADD_ITEM_TO_WEEK',
  REMOVE_ITEM_FROM_WEEK: 'REMOVE_ITEM_FROM_WEEK',
  CLEAR_WEEK: 'CLEAR_WEEK',
  // Restaurant selection actions
  SET_SELECTED_RESTAURANT: 'SET_SELECTED_RESTAURANT',
  CLEAR_SELECTED_RESTAURANT: 'CLEAR_SELECTED_RESTAURANT',
  // Loading state actions
  SET_LOADING_FROM_DATABASE: 'SET_LOADING_FROM_DATABASE',
  SET_LOADED_FROM_DATABASE: 'SET_LOADED_FROM_DATABASE'
};

// Reducer function
const mealPlanReducer = (state, action) => {
  switch (action.type) {
    case MEAL_PLAN_ACTIONS.ADD_ITEM: {
      const { item, day, mealType, restaurantName } = action.payload;
      
      // Create the meal plan item with additional metadata
      const mealPlanItem = {
        ...item,
        restaurantName,
        addedAt: new Date().toISOString(),
        planId: `${day}-${mealType}-${item.id}-${Date.now()}`
      };

      const newWeeklyPlan = {
        ...state.weeklyPlan,
        [day]: {
          ...state.weeklyPlan[day],
          [mealType]: [...state.weeklyPlan[day][mealType], mealPlanItem]
        }
      };

      const newState = {
        ...state,
        weeklyPlan: newWeeklyPlan,
        totalItems: state.totalItems + 1
      };

      // Save to localStorage
      localStorage.setItem('mealPlan', JSON.stringify(newState));
      return newState;
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

      const newState = {
        ...state,
        weeklyPlan: newWeeklyPlan,
        totalItems: state.totalItems - 1
      };

      // Save to localStorage
      localStorage.setItem('mealPlan', JSON.stringify(newState));
      return newState;
    }

    case MEAL_PLAN_ACTIONS.CLEAR_DAY: {
      const { day } = action.payload;
      const dayItemsCount = state.weeklyPlan[day].lunch.length + state.weeklyPlan[day].dinner.length;
      
      const newWeeklyPlan = {
        ...state.weeklyPlan,
        [day]: { lunch: [], dinner: [] }
      };

      const newState = {
        ...state,
        weeklyPlan: newWeeklyPlan,
        totalItems: state.totalItems - dayItemsCount
      };

      // Save to localStorage
      localStorage.setItem('mealPlan', JSON.stringify(newState));
      return newState;
    }

    case MEAL_PLAN_ACTIONS.CLEAR_ALL: {
      const newState = { ...initialState };
      
      // Clear localStorage (both legacy and new structure)
      localStorage.removeItem('mealPlan');
      localStorage.removeItem('weeklyPlans');
      return newState;
    }

    case MEAL_PLAN_ACTIONS.LOAD_FROM_STORAGE: {
      const loadedData = action.payload || {};
      
      // Ensure proper structure initialization
      const mergedState = {
        ...initialState,
        ...loadedData,
        // Ensure weeklyPlans structure exists
        weeklyPlans: {
          ...initialState.weeklyPlans,
          ...(loadedData.weeklyPlans || {})
        },
        // Ensure weeklyPlan structure exists for backward compatibility
        weeklyPlan: {
          ...initialState.weeklyPlan,
          ...(loadedData.weeklyPlan || {})
        }
      };
      
      // Recalculate totalItems based on actual items in weeklyPlans
      let calculatedTotalItems = 0;
      if (mergedState.weeklyPlans) {
        Object.values(mergedState.weeklyPlans).forEach(weekPlan => {
          if (weekPlan && typeof weekPlan === 'object') {
            Object.values(weekPlan).forEach(dayMeals => {
              if (dayMeals && dayMeals.lunch && dayMeals.dinner) {
                calculatedTotalItems += dayMeals.lunch.length + dayMeals.dinner.length;
              }
            });
          }
        });
      }
      
      // Also count legacy weeklyPlan if it exists
      if (mergedState.weeklyPlan) {
        Object.values(mergedState.weeklyPlan).forEach(dayMeals => {
          if (dayMeals && dayMeals.lunch && dayMeals.dinner) {
            calculatedTotalItems += dayMeals.lunch.length + dayMeals.dinner.length;
          }
        });
      }
      
      
      return {
        ...mergedState,
        totalItems: calculatedTotalItems
      };
    }

    case MEAL_PLAN_ACTIONS.ADD_ITEM_TO_WEEK: {
      const { item, day, mealType, restaurantName, week } = action.payload;
      const weekKey = `week${week}`;
      
      // Use the item as-is (planId and metadata already added in action creator)
      const mealPlanItem = {
        ...item,
        addedAt: new Date().toISOString()
      };

      const newState = {
        ...state,
        weeklyPlans: {
          ...state.weeklyPlans,
          [weekKey]: {
            ...state.weeklyPlans[weekKey],
            [day]: {
              ...state.weeklyPlans[weekKey][day],
              [mealType]: [...state.weeklyPlans[weekKey][day][mealType], mealPlanItem]
            }
          }
        }
      };

      // Update total items count
      newState.totalItems = Object.values(newState.weeklyPlans).reduce((total, week) => {
        return total + Object.values(week).reduce((weekTotal, dayMeals) => {
          return weekTotal + dayMeals.lunch.length + dayMeals.dinner.length;
        }, 0);
      }, 0);

      // Save to localStorage
      localStorage.setItem('mealPlan', JSON.stringify(newState));
      return newState;
    }

    case MEAL_PLAN_ACTIONS.REMOVE_ITEM_FROM_WEEK: {
      const { planId, day, mealType, week } = action.payload;
      const weekKey = `week${week}`;

      const newState = {
        ...state,
        weeklyPlans: {
          ...state.weeklyPlans,
          [weekKey]: {
            ...state.weeklyPlans[weekKey],
            [day]: {
              ...state.weeklyPlans[weekKey][day],
              [mealType]: state.weeklyPlans[weekKey][day][mealType].filter(item => item.planId !== planId)
            }
          }
        }
      };

      // Update total items count
      newState.totalItems = Object.values(newState.weeklyPlans).reduce((total, week) => {
        return total + Object.values(week).reduce((weekTotal, dayMeals) => {
          return weekTotal + dayMeals.lunch.length + dayMeals.dinner.length;
        }, 0);
      }, 0);

      // Save to localStorage
      localStorage.setItem('mealPlan', JSON.stringify(newState));
      return newState;
    }

    case MEAL_PLAN_ACTIONS.CLEAR_WEEK: {
      const { week } = action.payload;
      const weekKey = `week${week}`;

      const newState = {
        ...state,
        weeklyPlans: {
          ...state.weeklyPlans,
          [weekKey]: {
            monday: { lunch: [], dinner: [] },
            tuesday: { lunch: [], dinner: [] },
            wednesday: { lunch: [], dinner: [] },
            thursday: { lunch: [], dinner: [] },
            friday: { lunch: [], dinner: [] },
            saturday: { lunch: [], dinner: [] },
            sunday: { lunch: [], dinner: [] }
          }
        }
      };

      // Update total items count
      newState.totalItems = Object.values(newState.weeklyPlans).reduce((total, week) => {
        return total + Object.values(week).reduce((weekTotal, dayMeals) => {
          return weekTotal + dayMeals.lunch.length + dayMeals.dinner.length;
        }, 0);
      }, 0);

      // Save to localStorage
      localStorage.setItem('mealPlan', JSON.stringify(newState));
      return newState;
    }

    case MEAL_PLAN_ACTIONS.LOAD_WEEKLY_PLANS: {
      const weeklyPlans = action.payload || {};
      
      const newState = {
        ...state,
        weeklyPlans: {
          ...initialState.weeklyPlans,
          ...weeklyPlans
        }
      };
      
      // Recalculate totalItems
      newState.totalItems = Object.values(newState.weeklyPlans).reduce((total, week) => {
        return total + Object.values(week).reduce((weekTotal, dayMeals) => {
          return weekTotal + dayMeals.lunch.length + dayMeals.dinner.length;
        }, 0);
      }, 0);
      
      return newState;
    }

    case MEAL_PLAN_ACTIONS.LOAD_MEAL_PLAN: {
      const mealPlan = action.payload || [];
      
      return {
        ...state,
        weeklyPlan: Array.isArray(mealPlan) ? initialState.weeklyPlan : mealPlan,
        totalItems: Array.isArray(mealPlan) ? mealPlan.length : 0
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

    case MEAL_PLAN_ACTIONS.SET_LOADING_FROM_DATABASE: {
      return {
        ...state,
        isLoadingFromDatabase: true,
        hasLoadedFromDatabase: false
      };
    }

    case MEAL_PLAN_ACTIONS.SET_LOADED_FROM_DATABASE: {
      return {
        ...state,
        isLoadingFromDatabase: false,
        hasLoadedFromDatabase: true
      };
    }

    default:
      return state;
  }
};

// Create context
const MealPlanContext = createContext();

// Provider component
export const MealPlanProvider = ({ children }) => {
  const [state, dispatch] = useReducer(mealPlanReducer, initialState);
  const { isAuthenticated, user } = useAuth();
  const { showError, showInfo } = useToast();
  const saveTimeoutRef = useRef(null);

  // Get user type from user object
  const userType = user?.userType || 'normal';

  // Save meal plan to database
  const saveMealPlanToDatabase = async (mealPlanData) => {
    if (!isAuthenticated || !user) return;
    
    const payload = {
      userId: user.id,
      weeklyPlans: mealPlanData.weeklyPlans,
      totalItems: mealPlanData.totalItems,
      selectedRestaurantId: mealPlanData.selectedRestaurantId,
      selectedRestaurantName: mealPlanData.selectedRestaurantName,
      selectedRestaurantData: mealPlanData.selectedRestaurantData
    };
    
    console.log('📤 Sending to API /meal-plans:', payload);
    console.log('📤 Payload selectedRestaurantId:', payload.selectedRestaurantId);
    console.log('📤 Payload selectedRestaurantName:', payload.selectedRestaurantName);
    
    try {
      const response = await apiClient.post('/meal-plans', payload);
      console.log('✅ API Response:', response.data);
    } catch (error) {
      console.error('❌ Error saving meal plan to database:', error);
      console.error('❌ Error details:', error.response?.data);
    }
  };

  // Debounced save function to prevent excessive API calls
  const debouncedSave = () => {
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Set new timeout
    saveTimeoutRef.current = setTimeout(() => {
      // Calculate fresh totalItems from current state
      let calculatedTotalItems = 0;
      Object.values(state.weeklyPlans).forEach(weekPlan => {
        Object.values(weekPlan).forEach(dayMeals => {
          calculatedTotalItems += dayMeals.lunch.length + dayMeals.dinner.length;
        });
      });
      
      console.log('💾 Auto-saving to database - totalItems:', calculatedTotalItems);
      console.log('💾 Selected restaurant:', state.selectedRestaurantId, state.selectedRestaurantName);
      
      // Save to database with fresh calculations
      saveMealPlanToDatabase({
        weeklyPlans: state.weeklyPlans,
        totalItems: calculatedTotalItems,
        selectedRestaurantId: state.selectedRestaurantId,
        selectedRestaurantName: state.selectedRestaurantName,
        selectedRestaurantData: state.selectedRestaurantData
      });
    }, 1000); // 1 second delay
  };

  // Debounced save function with specific restaurant data (for immediate updates)
  const debouncedSaveWithRestaurant = (restaurantId, restaurantName, restaurantData) => {
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Set new timeout
    saveTimeoutRef.current = setTimeout(() => {
      // Calculate fresh totalItems from current state
      let calculatedTotalItems = 0;
      Object.values(state.weeklyPlans).forEach(weekPlan => {
        Object.values(weekPlan).forEach(dayMeals => {
          calculatedTotalItems += dayMeals.lunch.length + dayMeals.dinner.length;
        });
      });
      
      console.log('💾 Auto-saving to database with restaurant - totalItems:', calculatedTotalItems);
      console.log('💾 Selected restaurant:', restaurantId, restaurantName);
      
      // Save to database with the provided restaurant data
      saveMealPlanToDatabase({
        weeklyPlans: state.weeklyPlans,
        totalItems: calculatedTotalItems,
        selectedRestaurantId: restaurantId,
        selectedRestaurantName: restaurantName,
        selectedRestaurantData: restaurantData
      });
    }, 1000); // 1 second delay
  };

  // Load meal plan from database first, then localStorage as fallback
  useEffect(() => {
    const loadMealPlanFromDatabase = async () => {
      if (!isAuthenticated || !user) {
        console.log('⚠️ Not authenticated or no user, skipping database load');
        return;
      }
      
      // Set loading state
      dispatch({ type: MEAL_PLAN_ACTIONS.SET_LOADING_FROM_DATABASE });
      
      try {
        console.log('🔄 Loading meal plan from database for user:', user.id);
        const response = await apiClient.get(`/meal-plans/${user.id}`);
        
        console.log('🔍 Raw API response:', response.data);
        console.log('🔍 Response status:', response.data.status);
        console.log('🔍 Response data exists:', !!response.data.data);
        
        if (response.data.status === 'success' && response.data.data) {
          const mealPlanData = response.data.data;
          console.log('✅ Loaded meal plan from database:', mealPlanData);
          console.log('🔍 Database response - selectedRestaurantId:', mealPlanData.selectedRestaurantId);
          console.log('🔍 Database response - selectedRestaurantName:', mealPlanData.selectedRestaurantName);
          console.log('🔍 Database response - selectedRestaurantData:', mealPlanData.selectedRestaurantData);
          
          // Load weekly plans if they exist
          if (mealPlanData.weeklyPlans) {
            dispatch({ 
              type: MEAL_PLAN_ACTIONS.LOAD_WEEKLY_PLANS, 
              payload: mealPlanData.weeklyPlans 
            });
          }
          
          // Load selected restaurant data
          if (mealPlanData.selectedRestaurantId || mealPlanData.selectedRestaurantName || mealPlanData.selectedRestaurantData) {
            // Extract ID and name from selectedRestaurantData if individual fields are null
            const restaurantId = mealPlanData.selectedRestaurantId || mealPlanData.selectedRestaurantData?._id;
            const restaurantName = mealPlanData.selectedRestaurantName || mealPlanData.selectedRestaurantData?.name;
            
            console.log('🎯 Loading selected restaurant from database:', {
              id: restaurantId,
              name: restaurantName,
              fromData: !mealPlanData.selectedRestaurantId && !!mealPlanData.selectedRestaurantData
            });
            
            dispatch({
              type: MEAL_PLAN_ACTIONS.SET_SELECTED_RESTAURANT,
              payload: {
                restaurantId: restaurantId,
                restaurantName: restaurantName,
                restaurantData: mealPlanData.selectedRestaurantData
              }
            });
          }
          
          // Mark as loaded from database
          dispatch({ type: MEAL_PLAN_ACTIONS.SET_LOADED_FROM_DATABASE });
          return; // Successfully loaded from database, skip localStorage
        } else {
          console.log('⚠️ API response structure unexpected:', {
            status: response.data.status,
            hasData: !!response.data.data,
            fullResponse: response.data
          });
        }
      } catch (error) {
        console.log('⚠️ Could not load from database, falling back to localStorage:', error.message);
        console.log('⚠️ Full error details:', error);
        console.log('⚠️ Error response:', error.response?.data);
      }
      
      // Fallback to localStorage if database loading fails
      loadFromLocalStorage();
    };
    
    const loadFromLocalStorage = () => {
      try {
        // Load weekly plans (new structure)
        const savedWeeklyPlans = localStorage.getItem('weeklyPlans');
        if (savedWeeklyPlans) {
          const parsedWeeklyPlans = JSON.parse(savedWeeklyPlans);
          
          // PROACTIVE VALIDATION: Check for multiple restaurants in normal user data
          if (userType === 'normal') {
            const allRestaurants = new Set();
            Object.values(parsedWeeklyPlans).forEach(weekPlan => {
              Object.values(weekPlan).forEach(day => {
                [...day.lunch, ...day.dinner].forEach(item => {
                  if (item.restaurantName) {
                    allRestaurants.add(item.restaurantName);
                  }
                });
              });
            });
            
            // If multiple restaurants detected, only warn but don't clear data automatically
            if (allRestaurants.size > 1) {
              console.log('⚠️ MealPlanContext: Multiple restaurants detected in saved data');
              console.log('🏪 Restaurants found:', Array.from(allRestaurants));
              console.log('📝 Loading data as-is - user can resolve conflicts when adding new items');
              
              // Show informational notification to user (not an error)
              showToast(
                `Multiple restaurants detected in your meal plan (${Array.from(allRestaurants).join(', ')}). You can resolve this when adding new items.`,
                'info',
                { duration: 6000 }
              );
              
              // Continue loading the data - don't clear it!
              // User can resolve conflicts through the existing restaurant switch modal
            }
          }
          
          dispatch({ 
            type: MEAL_PLAN_ACTIONS.LOAD_WEEKLY_PLANS, 
            payload: parsedWeeklyPlans 
          });
        }

        // Load legacy meal plan for backward compatibility with validation
        const savedMealPlan = localStorage.getItem('mealPlan');
        if (savedMealPlan) {
          const parsedMealPlan = JSON.parse(savedMealPlan);
          
          // PROACTIVE VALIDATION: Check for multiple restaurants in legacy data
          if (userType === 'normal' && Array.isArray(parsedMealPlan)) {
            const restaurants = new Set();
            parsedMealPlan.forEach(planItem => {
              if (planItem.restaurantName) {
                restaurants.add(planItem.restaurantName);
              }
            });
            
            // If multiple restaurants detected, warn but don't clear legacy data
            if (restaurants.size > 1) {
              console.log('⚠️ MealPlanContext: Multiple restaurants in legacy data');
              console.log('📝 Loading legacy data as-is - user can resolve conflicts when needed');
              
              // Show informational notification to user
              showToast(
                `Legacy meal plan contains multiple restaurants (${Array.from(restaurants).join(', ')}). You can resolve this when adding new items.`,
                'info',
                { duration: 5000 }
              );
              
              // Continue loading the legacy data - don't clear it!
            }
          }
          
          dispatch({ 
            type: MEAL_PLAN_ACTIONS.LOAD_MEAL_PLAN, 
            payload: parsedMealPlan 
          });
        }
      } catch (error) {
        console.error('Error loading meal plan from localStorage:', error);
      }
      
      // Mark as loaded (from localStorage fallback)
      dispatch({ type: MEAL_PLAN_ACTIONS.SET_LOADED_FROM_DATABASE });
    };

    // Start the loading process
    if (isAuthenticated && user) {
      loadMealPlanFromDatabase();
    } else {
      loadFromLocalStorage();
    }
  }, [isAuthenticated, user, userType]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Auto-save to database when state changes
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    
    // Don't auto-save until initial database load is complete to prevent overwriting database with initial state
    if (!state.hasLoadedFromDatabase) {
      console.log('⏳ Skipping auto-save - database not loaded yet');
      return;
    }

    let calculatedTotalItems = 0;
    Object.values(state.weeklyPlans).forEach(weekPlan => {
      if (weekPlan && typeof weekPlan === 'object') {
        Object.values(weekPlan).forEach(dayMeals => {
          if (dayMeals && dayMeals.lunch && dayMeals.dinner) {
            calculatedTotalItems += dayMeals.lunch.length + dayMeals.dinner.length;
          }
        });
      }
    });

    // Always save to database when state changes (including when clearing)
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      console.log('💾 Auto-saving to database - totalItems:', calculatedTotalItems);
      console.log('💾 Auto-saving restaurant selection:', state.selectedRestaurantId, state.selectedRestaurantName);
      saveMealPlanToDatabase({
        weeklyPlans: state.weeklyPlans,
        totalItems: calculatedTotalItems,
        selectedRestaurantId: state.selectedRestaurantId,
        selectedRestaurantName: state.selectedRestaurantName
      });
    }, 1000); // 1 second debounce

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [JSON.stringify(state.weeklyPlans), state.totalItems, state.selectedRestaurantId, state.selectedRestaurantName, state.hasLoadedFromDatabase, isAuthenticated, user]);

  // PROACTIVE CONTINUOUS VALIDATION: Monitor state for mixed restaurants and auto-clear
  useEffect(() => {
    if (userType !== 'normal') return; // Only for normal users

    const allRestaurants = getRestaurantsInAllWeeks();
    
    // If multiple restaurants detected in current state, immediately clear everything
    if (allRestaurants.length > 1) {
      console.log('🚨 PROACTIVE CONTINUOUS VALIDATION: Mixed restaurants detected in state!');
      console.log('🚨 Restaurants found:', allRestaurants);
      console.log('🧹 IMMEDIATELY clearing all data to prevent mixed state UI');
      
      // Show notification to user
      showError(
        'Mixed Restaurants Detected',
        'Multiple restaurants detected in your meal plan. Data cleared to maintain consistency.',
        { duration: 8000 }
      );
      
      // Clear everything immediately
      dispatch({ type: MEAL_PLAN_ACTIONS.CLEAR_ALL });
      localStorage.removeItem('weeklyPlans');
      localStorage.removeItem('mealPlan');
    }
  }, [state.weeklyPlans, userType]); // Monitor state changes

  // Helper function to get all restaurants in current meal plan
  const getRestaurantsInPlan = () => {
    const restaurants = new Set();
    
    // Check if weeklyPlan exists and is an object
    if (!state.weeklyPlan || typeof state.weeklyPlan !== 'object') {
      return [];
    }
    
    Object.values(state.weeklyPlan).forEach(day => {
      // Check if day exists and has the expected structure
      if (!day || typeof day !== 'object') {
        return;
      }
      
      // Check if lunch and dinner exist and are arrays
      const lunchItems = Array.isArray(day.lunch) ? day.lunch : [];
      const dinnerItems = Array.isArray(day.dinner) ? day.dinner : [];
      
      [...lunchItems, ...dinnerItems].forEach(item => {
        if (item && item.restaurantName) {
          restaurants.add(item.restaurantName);
        }
      });
    });
    return Array.from(restaurants);
  };

  // Action creators
  const addItemToPlan = async (item, day, mealType, restaurantName) => {
    // Check authentication first
    if (!isAuthenticated) {
      // Store current page URL for redirect after login
      const currentUrl = window.location.pathname + window.location.search;
      localStorage.setItem('redirectAfterLogin', currentUrl);
      
      return {
        success: false,
        error: 'AUTHENTICATION_REQUIRED',
        message: 'Please log in to add items to your meal plan',
        redirectToLogin: true
      };
    }

    dispatch({
      type: MEAL_PLAN_ACTIONS.ADD_ITEM,
      payload: { item, day, mealType, restaurantName }
    });

    return { success: true };
  };

  const removeItemFromPlan = (planId, day, mealType) => {
    dispatch({
      type: MEAL_PLAN_ACTIONS.REMOVE_ITEM,
      payload: { planId, day, mealType }
    });
  };

  const clearDay = (day) => {
    dispatch({
      type: MEAL_PLAN_ACTIONS.CLEAR_DAY,
      payload: { day }
    });
  };

  const clearAllPlan = () => {
    dispatch({ type: MEAL_PLAN_ACTIONS.CLEAR_ALL });
  };


  // Week-specific action creators
  const addItemToPlanWeek = async (item, day, mealType, restaurantName, week = 0, userType = 'normal', forceReplace = false, restaurantId = null) => {
    // Check authentication first
    if (!isAuthenticated) {
      // Store current page URL for redirect after login
      const currentUrl = window.location.pathname + window.location.search;
      localStorage.setItem('redirectAfterLogin', currentUrl);
      
      return {
        success: false,
        error: 'AUTHENTICATION_REQUIRED',
        message: 'Please log in to add items to your meal plan',
        redirectToLogin: true
      };
    }

    // Restaurant restriction for normal users
    if (userType === 'normal') {
      const existingRestaurants = getRestaurantsInAllWeeks();
      
      console.log('🔍 Restaurant Check - Existing:', existingRestaurants);
      console.log('🔍 Restaurant Check - New:', restaurantName);
      console.log('🔍 Restaurant Check - Includes new?', existingRestaurants.includes(restaurantName));
      console.log('🔍 Restaurant Check - Force replace?', forceReplace);
      
      if (existingRestaurants.length > 0 && !existingRestaurants.includes(restaurantName)) {
        console.log('🚨 RESTAURANT CONFLICT DETECTED!');
        if (!forceReplace) {
          console.log('🔄 Returning RESTAURANT_SWITCH_CONFIRMATION');
          // Return confirmation needed - user can choose to clear and switch
          return {
            success: false,
            error: 'RESTAURANT_SWITCH_CONFIRMATION',
            message: `You already have items from ${existingRestaurants[0]}. Switching to ${restaurantName} will clear your current meal plan.`,
            existingRestaurant: existingRestaurants[0],
            newRestaurant: restaurantName,
            needsConfirmation: true
          };
        } else {
          // User confirmed - clear existing plan and add new item
          console.log('🔄 MealPlanContext: User confirmed restaurant switch - clearing all weeks');
          dispatch({ type: MEAL_PLAN_ACTIONS.CLEAR_ALL });
        }
      } else {
        console.log('✅ No restaurant conflict - proceeding with add');
      }
    }

    // Create item with planId for the reducer
    const itemWithPlanId = {
      ...item,
      planId: `${item.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      restaurantName,
      restaurantId, // Store MongoDB ObjectId
      dayId: day,
      mealType: mealType,
      week: week
    };

    dispatch({
      type: MEAL_PLAN_ACTIONS.ADD_ITEM_TO_WEEK,
      payload: { item: itemWithPlanId, day, mealType, restaurantName, week, restaurantId }
    });

    return { success: true };
  };

  const removeItemFromPlanWeek = (planId, day, mealType, week = 0) => {
    dispatch({
      type: MEAL_PLAN_ACTIONS.REMOVE_ITEM_FROM_WEEK,
      payload: { planId, day, mealType, week }
    });
  };

  const clearWeek = (week = 0) => {
    console.log('🎯 clearWeek called for week:', week);
    dispatch({
      type: MEAL_PLAN_ACTIONS.CLEAR_WEEK,
      payload: { week }
    });
    debouncedSave(); // Save cleared state to database
  };

  // Restaurant selection actions
  const setSelectedRestaurant = (restaurantId, restaurantName, restaurantData = null) => {
    console.log('🎯 setSelectedRestaurant called:', { restaurantId, restaurantName });
    dispatch({
      type: MEAL_PLAN_ACTIONS.SET_SELECTED_RESTAURANT,
      payload: { restaurantId, restaurantName, restaurantData }
    });
    // Call debouncedSave with the new restaurant data
    debouncedSaveWithRestaurant(restaurantId, restaurantName, restaurantData);
  };

  const clearSelectedRestaurant = () => {
    console.log('🎯 clearSelectedRestaurant called');
    dispatch({
      type: MEAL_PLAN_ACTIONS.CLEAR_SELECTED_RESTAURANT
    });
    debouncedSave(); // Save to database
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
      localStorage.removeItem('grubgate_selected_restaurant');
      localStorage.removeItem('weeklyPlans'); // Also clear old meal plan data
      localStorage.removeItem('mealPlan'); // Clear legacy meal plan data
    }
    
    // Force immediate save to database
    console.log('💾 Force saving cleared data to database');
    saveMealPlanToDatabase({
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
      selectedRestaurantId: null,
      selectedRestaurantName: null,
      selectedRestaurantData: null
    });
  };

  // Helper functions
  const getDayItems = (day) => {
    // Try new weeklyPlans structure first (week0 for current week)
    if (state.weeklyPlans?.week0?.[day]) {
      return state.weeklyPlans.week0[day];
    }
    
    // Fallback to legacy weeklyPlan structure
    if (state.weeklyPlan?.[day]) {
      return state.weeklyPlan[day];
    }
    
    return { lunch: [], dinner: [] };
  };

  const getDayItemsCount = (day) => {
    const dayItems = getDayItems(day);
    return dayItems.lunch.length + dayItems.dinner.length;
  };

  const getMealItems = (day, mealType) => {
    // Validate inputs
    if (!day || !mealType) {
      return [];
    }
    
    // Try new weeklyPlans structure first (week0 for current week)
    if (state.weeklyPlans?.week0?.[day]?.[mealType]) {
      return state.weeklyPlans.week0[day][mealType];
    }
    
    // Fallback to legacy weeklyPlan structure
    if (state.weeklyPlan?.[day]?.[mealType]) {
      return state.weeklyPlan[day][mealType];
    }
    
    return [];
  };

  const getTotalItemsCount = () => {
    return state.totalItems;
  };

  const getWeeklyPlanSummary = () => {
    const summary = {};
    
    // Use new weeklyPlans structure if available (week0 for current week)
    const weekPlan = state.weeklyPlans?.week0 || state.weeklyPlan || {};
    
    Object.keys(weekPlan).forEach(day => {
      if (weekPlan[day]) {
        summary[day] = {
          lunch: weekPlan[day].lunch?.length || 0,
          dinner: weekPlan[day].dinner?.length || 0,
          total: (weekPlan[day].lunch?.length || 0) + (weekPlan[day].dinner?.length || 0)
        };
      }
    });
    return summary;
  };

  // Check if an item is already in the meal plan and get its quantity
  const getItemQuantityInPlan = (itemId, day, mealType) => {
    const mealItems = getMealItems(day, mealType);
    return mealItems.filter(item => item.id === itemId).length;
  };

  // Check if an item exists in the meal plan
  const isItemInPlan = (itemId, day, mealType) => {
    return getItemQuantityInPlan(itemId, day, mealType) > 0;
  };

  // Week-specific helper functions
  const getWeekPlan = (week = 0) => {
    const weekKey = `week${week}`;
    return state.weeklyPlans[weekKey] || initialState.weeklyPlans[weekKey];
  };

  const getWeekDayItems = (day, week = 0) => {
    const weekPlan = getWeekPlan(week);
    return weekPlan[day] || { lunch: [], dinner: [] };
  };

  const getWeekMealItems = (day, mealType, week = 0) => {
    const weekPlan = getWeekPlan(week);
    return weekPlan[day]?.[mealType] || [];
  };

  const getWeekTotalItems = (week = 0) => {
    const weekPlan = getWeekPlan(week);
    console.log('🔍 getWeekTotalItems - week:', week, 'weekPlan:', weekPlan);
    const total = Object.values(weekPlan).reduce((total, dayMeals) => {
      return total + dayMeals.lunch.length + dayMeals.dinner.length;
    }, 0);
    console.log('🔍 getWeekTotalItems - total:', total);
    return total;
  };

  const getWeekTotalCost = (week = 0) => {
    const weekPlan = getWeekPlan(week);
    return Object.values(weekPlan).reduce((total, dayMeals) => {
      const dayTotal = [...dayMeals.lunch, ...dayMeals.dinner].reduce((daySum, item) => {
        return daySum + parseFloat(item.price || 0);
      }, 0);
      return total + dayTotal;
    }, 0);
  };

  // Get restaurants in a specific week's plan
  const getRestaurantsInWeekPlan = (week = 0) => {
    const restaurants = new Set();
    const weekPlan = getWeekPlan(week);
    
    console.log('🔍 getRestaurantsInWeekPlan - week:', week, 'weekPlan:', weekPlan);
    
    // Check if weekPlan exists and is an object
    if (!weekPlan || typeof weekPlan !== 'object') {
      console.log('🔍 getRestaurantsInWeekPlan - weekPlan is invalid');
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
      
      console.log('🔍 getRestaurantsInWeekPlan - day items:', { lunchItems, dinnerItems });
      
      [...lunchItems, ...dinnerItems].forEach(item => {
        if (item && item.restaurantName) {
          console.log('🔍 getRestaurantsInWeekPlan - found restaurant:', item.restaurantName);
          restaurants.add(item.restaurantName);
        }
      });
    });
    
    const result = Array.from(restaurants);
    console.log('🔍 getRestaurantsInWeekPlan - result:', result);
    return result;
  };

  // Get restaurants from ALL weeks (for normal users who can only select one restaurant)
  const getRestaurantsInAllWeeks = () => {
    const restaurants = new Set();
    
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
          if (item && item.restaurantName) {
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

  const value = {
    // State
    weeklyPlan: state.weeklyPlan,
    mealPlan: state.weeklyPlan, // Alias for easier access
    totalItems: state.totalItems,
    weeklyPlans: state.weeklyPlans,
    selectedRestaurantId: state.selectedRestaurantId,
    selectedRestaurantName: state.selectedRestaurantName,
    // Loading states
    isLoadingFromDatabase: state.isLoadingFromDatabase,
    hasLoadedFromDatabase: state.hasLoadedFromDatabase,
    selectedRestaurantData: state.selectedRestaurantData,
    
    // Actions
    addItemToPlan,
    removeItemFromPlan,
    clearDay,
    clearAllPlan,
    
    // Week-specific actions
    addItemToPlanWeek,
    removeItemFromPlanWeek,
    clearWeek,
    
    // Restaurant selection actions
    setSelectedRestaurant,
    clearSelectedRestaurant,
    clearAllMealPlanData,
    // Debug function to manually clear all data sources
    clearAllDataSources: () => {
      console.log('🧹 MANUAL CLEAR: Clearing all data sources');
      
      // Clear React state
      dispatch({ type: MEAL_PLAN_ACTIONS.CLEAR_WEEK, payload: { week: 0 } });
      dispatch({ type: MEAL_PLAN_ACTIONS.CLEAR_WEEK, payload: { week: 1 } });
      dispatch({ type: MEAL_PLAN_ACTIONS.CLEAR_SELECTED_RESTAURANT });
      
      // Clear all localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('grubgate_selected_restaurant');
        localStorage.removeItem('grubgate_postal_code');
        localStorage.removeItem('grubgate_preferences');
        localStorage.removeItem('weeklyPlans');
        localStorage.removeItem('mealPlan');
        console.log('🧹 All localStorage cleared');
      }
      
      // Force save empty data to database
      saveMealPlanToDatabase({
        weeklyPlans: {
          week0: { monday: { lunch: [], dinner: [] }, tuesday: { lunch: [], dinner: [] }, wednesday: { lunch: [], dinner: [] }, thursday: { lunch: [], dinner: [] }, friday: { lunch: [], dinner: [] }, saturday: { lunch: [], dinner: [] }, sunday: { lunch: [], dinner: [] } },
          week1: { monday: { lunch: [], dinner: [] }, tuesday: { lunch: [], dinner: [] }, wednesday: { lunch: [], dinner: [] }, thursday: { lunch: [], dinner: [] }, friday: { lunch: [], dinner: [] }, saturday: { lunch: [], dinner: [] }, sunday: { lunch: [], dinner: [] } }
        },
        totalItems: 0,
        selectedRestaurantId: null,
        selectedRestaurantName: null,
        selectedRestaurantData: null
      });
      
      console.log('🧹 MANUAL CLEAR: All data sources cleared');
    },
    
    // Helpers
    getDayItems,
    getDayItemsCount,
    getMealItems,
    getTotalItemsCount,
    getWeeklyPlanSummary,
    getItemQuantityInPlan,
    isItemInPlan,
    getRestaurantsInPlan,
    
    // Week-specific helpers
    getWeekPlan,
    getWeekDayItems,
    getWeekMealItems,
    getWeekTotalItems,
    getWeekTotalCost,
    getRestaurantsInWeekPlan,
    getRestaurantsInAllWeeks,
    getRestaurantIdsInWeekPlan,
    getRestaurantIdsInAllWeeks
  };

  return (
    <MealPlanContext.Provider value={value}>
      {children}
    </MealPlanContext.Provider>
  );
};

// Custom hook to use the meal plan context
export const useMealPlan = () => {
  const context = useContext(MealPlanContext);
  if (!context) {
    throw new Error('useMealPlan must be used within a MealPlanProvider');
  }
  return context;
};

export default MealPlanContext;
