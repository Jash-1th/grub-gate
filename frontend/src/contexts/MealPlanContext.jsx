import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Initial state for the meal plan
const initialState = {
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
  LOAD_FROM_STORAGE: 'LOAD_FROM_STORAGE'
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

  // Action creators
  const addItemToPlan = (item, day, mealType, restaurantName) => {
    dispatch({
      type: MEAL_PLAN_ACTIONS.ADD_ITEM,
      payload: { item, day, mealType, restaurantName }
    });
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
    
    // Helpers
    getDayItems,
    getDayItemsCount,
    getMealItems,
    getTotalItemsCount,
    getWeeklyPlanSummary
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
