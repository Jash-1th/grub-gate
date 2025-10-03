import React, { createContext, useContext, useReducer, useEffect } from 'react';

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
  totalItems: 0
};

// Action types
const MEAL_PLAN_ACTIONS = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  CLEAR_DAY: 'CLEAR_DAY',
  CLEAR_ALL: 'CLEAR_ALL',
  LOAD_FROM_STORAGE: 'LOAD_FROM_STORAGE',
  // New week-specific actions
  ADD_ITEM_TO_WEEK: 'ADD_ITEM_TO_WEEK',
  REMOVE_ITEM_FROM_WEEK: 'REMOVE_ITEM_FROM_WEEK',
  CLEAR_WEEK: 'CLEAR_WEEK'
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
      
      // Clear localStorage
      localStorage.removeItem('mealPlan');
      return newState;
    }

    case MEAL_PLAN_ACTIONS.LOAD_FROM_STORAGE: {
      return action.payload || initialState;
    }

    case MEAL_PLAN_ACTIONS.ADD_ITEM_TO_WEEK: {
      const { item, day, mealType, restaurantName, week } = action.payload;
      const weekKey = `week${week}`;
      
      // Create the meal plan item with additional metadata
      const mealPlanItem = {
        ...item,
        planId: `${Date.now()}_${Math.random()}`,
        addedAt: new Date().toISOString(),
        dayId: day,
        mealType: mealType,
        restaurantName: restaurantName,
        week: week
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

    default:
      return state;
  }
};

// Create context
const MealPlanContext = createContext();

// Provider component
export const MealPlanProvider = ({ children }) => {
  const [state, dispatch] = useReducer(mealPlanReducer, initialState);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedPlan = localStorage.getItem('mealPlan');
      if (savedPlan) {
        const parsedPlan = JSON.parse(savedPlan);
        dispatch({ type: MEAL_PLAN_ACTIONS.LOAD_FROM_STORAGE, payload: parsedPlan });
      }
    } catch (error) {
      console.error('Error loading meal plan from storage:', error);
    }
  }, []);

  // Helper function to get all restaurants in current meal plan
  const getRestaurantsInPlan = () => {
    const restaurants = new Set();
    Object.values(state.weeklyPlan).forEach(day => {
      [...day.lunch, ...day.dinner].forEach(item => {
        if (item.restaurantName) {
          restaurants.add(item.restaurantName);
        }
      });
    });
    return Array.from(restaurants);
  };

  // Action creators
  const addItemToPlan = (item, day, mealType, restaurantName, userType = 'normal', forceReplace = false) => {
    // Check restaurant restriction for normal users
    if (userType === 'normal') {
      const existingRestaurants = getRestaurantsInPlan();
      if (existingRestaurants.length > 0 && !existingRestaurants.includes(restaurantName)) {
        if (!forceReplace) {
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
          dispatch({ type: MEAL_PLAN_ACTIONS.CLEAR_ALL });
        }
      }
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
  const addItemToPlanWeek = (item, day, mealType, restaurantName, week = 0, userType = 'normal', forceReplace = false) => {
    // Check restaurant restriction for normal users (same logic as original)
    if (userType === 'normal') {
      const existingRestaurants = getRestaurantsInPlan();
      if (existingRestaurants.length > 0 && !existingRestaurants.includes(restaurantName)) {
        if (!forceReplace) {
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
          dispatch({ type: MEAL_PLAN_ACTIONS.CLEAR_ALL });
        }
      }
    }

    dispatch({
      type: MEAL_PLAN_ACTIONS.ADD_ITEM_TO_WEEK,
      payload: { item, day, mealType, restaurantName, week }
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
    dispatch({
      type: MEAL_PLAN_ACTIONS.CLEAR_WEEK,
      payload: { week }
    });
  };

  // Helper functions
  const getDayItems = (day) => {
    return state.weeklyPlan[day] || { lunch: [], dinner: [] };
  };

  const getDayItemsCount = (day) => {
    const dayItems = getDayItems(day);
    return dayItems.lunch.length + dayItems.dinner.length;
  };

  const getMealItems = (day, mealType) => {
    return state.weeklyPlan[day]?.[mealType] || [];
  };

  const getTotalItemsCount = () => {
    return state.totalItems;
  };

  const getWeeklyPlanSummary = () => {
    const summary = {};
    Object.keys(state.weeklyPlan).forEach(day => {
      summary[day] = {
        lunch: state.weeklyPlan[day].lunch.length,
        dinner: state.weeklyPlan[day].dinner.length,
        total: state.weeklyPlan[day].lunch.length + state.weeklyPlan[day].dinner.length
      };
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
    return Object.values(weekPlan).reduce((total, dayMeals) => {
      return total + dayMeals.lunch.length + dayMeals.dinner.length;
    }, 0);
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
    Object.values(weekPlan).forEach(day => {
      [...day.lunch, ...day.dinner].forEach(item => {
        if (item.restaurantName) {
          restaurants.add(item.restaurantName);
        }
      });
    });
    return Array.from(restaurants);
  };

  // Get restaurants from ALL weeks (for normal users who can only select one restaurant)
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

  const value = {
    // State
    weeklyPlan: state.weeklyPlan,
    mealPlan: state.weeklyPlan, // Alias for easier access
    totalItems: state.totalItems,
    
    // Actions
    addItemToPlan,
    removeItemFromPlan,
    clearDay,
    clearAllPlan,
    
    // Week-specific actions
    addItemToPlanWeek,
    removeItemFromPlanWeek,
    clearWeek,
    
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
    getRestaurantsInAllWeeks
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
