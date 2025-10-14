/**
 * Meal Plan Date Calculator
 * Calculates actual dates for meal plan days using proven subscription logic
 */

const { getSubscriptionStartSunday } = require('./dateHelpers');

/**
 * Calculate actual dates for a meal plan based on planning date
 * Uses the same proven logic as subscription system
 * @param {Date} planningDate - When the user is planning (defaults to now)
 * @returns {Object} - Object with week0 and week1 date mappings
 */
const calculateMealPlanDates = (planningDate = new Date()) => {
  console.log('📅 Calculating meal plan dates from:', planningDate.toISOString());
  
  // Use the same logic as subscription system - start on next Sunday
  const week0StartDate = getSubscriptionStartSunday(planningDate);
  
  // Week 1 starts 7 days after week 0
  const week1StartDate = new Date(week0StartDate);
  week1StartDate.setUTCDate(week0StartDate.getUTCDate() + 7);
  
  console.log('📅 Week 0 starts:', week0StartDate.toISOString());
  console.log('📅 Week 1 starts:', week1StartDate.toISOString());
  
  // Calculate dates for each day of both weeks
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  
  const week0Dates = {};
  const week1Dates = {};
  
  dayNames.forEach((dayName, index) => {
    // Week 0 dates
    const week0Date = new Date(week0StartDate);
    week0Date.setUTCDate(week0StartDate.getUTCDate() + index);
    week0Dates[dayName] = week0Date.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Week 1 dates  
    const week1Date = new Date(week1StartDate);
    week1Date.setUTCDate(week1StartDate.getUTCDate() + index);
    week1Dates[dayName] = week1Date.toISOString().split('T')[0]; // YYYY-MM-DD format
  });
  
  const result = {
    week0: week0Dates,
    week1: week1Dates,
    calculatedAt: new Date().toISOString()
  };
  
  console.log('✅ Meal plan dates calculated:', result);
  return result;
};

/**
 * Get date for a specific week and day
 * @param {number} weekIndex - 0 or 1
 * @param {string} dayName - monday, tuesday, etc.
 * @param {Date} planningDate - When the user planned (optional)
 * @returns {string} - Date in YYYY-MM-DD format
 */
const getDateForWeekDay = (weekIndex, dayName, planningDate = new Date()) => {
  const dates = calculateMealPlanDates(planningDate);
  const weekKey = weekIndex === 0 ? 'week0' : 'week1';
  return dates[weekKey][dayName.toLowerCase()];
};

/**
 * Update existing meal plan with calculated dates
 * @param {Object} mealPlan - Existing meal plan object
 * @param {Date} planningDate - When the user planned (optional)
 * @returns {Object} - Updated meal plan with dates
 */
const addDatesToMealPlan = (mealPlan, planningDate = new Date()) => {
  const dates = calculateMealPlanDates(planningDate);
  
  // Create updated meal plan structure
  const updatedMealPlan = JSON.parse(JSON.stringify(mealPlan)); // Deep clone
  
  // Add dates to week0 - ensure all days get dates (whether they have meals or not)
  if (updatedMealPlan.weeklyPlans && updatedMealPlan.weeklyPlans.week0) {
    Object.keys(dates.week0).forEach(dayName => {
      // Create day object if it doesn't exist
      if (!updatedMealPlan.weeklyPlans.week0[dayName]) {
        updatedMealPlan.weeklyPlans.week0[dayName] = { lunch: [], dinner: [] };
      }
      // Always set the date
      updatedMealPlan.weeklyPlans.week0[dayName].date = dates.week0[dayName];
    });
  }
  
  // Add dates to week1 - ensure all days get dates (whether they have meals or not)
  if (updatedMealPlan.weeklyPlans && updatedMealPlan.weeklyPlans.week1) {
    Object.keys(dates.week1).forEach(dayName => {
      // Create day object if it doesn't exist
      if (!updatedMealPlan.weeklyPlans.week1[dayName]) {
        updatedMealPlan.weeklyPlans.week1[dayName] = { lunch: [], dinner: [] };
      }
      // Always set the date
      updatedMealPlan.weeklyPlans.week1[dayName].date = dates.week1[dayName];
    });
  }
  
  // Add metadata
  updatedMealPlan.datesCalculatedAt = dates.calculatedAt;
  
  console.log('✅ Added dates to meal plan');
  return updatedMealPlan;
};

/**
 * Validate if meal plan dates need recalculation
 * @param {Object} mealPlan - Meal plan object
 * @returns {boolean} - True if dates need recalculation
 */
const needsDateRecalculation = (mealPlan) => {
  // Always recalculate if no timestamp
  if (!mealPlan.datesCalculatedAt) {
    console.log('📅 Date recalculation needed: No datesCalculatedAt timestamp');
    return true;
  }
  
  // Check if any day with meals is missing dates
  const week0 = mealPlan.weeklyPlans?.week0;
  const week1 = mealPlan.weeklyPlans?.week1;
  
  if (week0) {
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    for (const dayName of dayNames) {
      const dayData = week0[dayName];
      if (dayData) {
        const hasLunchMeals = dayData.lunch && dayData.lunch.length > 0;
        const hasDinnerMeals = dayData.dinner && dayData.dinner.length > 0;
        
        // If day has meals but no date, recalculation needed
        if ((hasLunchMeals || hasDinnerMeals) && !dayData.date) {
          console.log(`📅 Date recalculation needed: week0.${dayName} has meals but no date`);
          return true;
        }
      }
    }
  }
  
  if (week1) {
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    for (const dayName of dayNames) {
      const dayData = week1[dayName];
      if (dayData) {
        const hasLunchMeals = dayData.lunch && dayData.lunch.length > 0;
        const hasDinnerMeals = dayData.dinner && dayData.dinner.length > 0;
        
        // If day has meals but no date, recalculation needed
        if ((hasLunchMeals || hasDinnerMeals) && !dayData.date) {
          console.log(`📅 Date recalculation needed: week1.${dayName} has meals but no date`);
          return true;
        }
      }
    }
  }
  
  console.log('📅 Date recalculation not needed: All days with meals have dates');
  return false;
};

module.exports = {
  calculateMealPlanDates,
  getDateForWeekDay,
  addDatesToMealPlan,
  needsDateRecalculation
};
