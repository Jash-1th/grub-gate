// FILE: apps/customer-app/src/utils/subscriptionDateUtils.js
/**
 * Frontend utility functions for subscription date calculations
 * These should match the backend logic for consistency
 */

/**
 * Calculate the next upcoming Sunday for subscription start (frontend version)
 * This matches the backend getSubscriptionStartSunday() function
 * @param {Date} fromDate - Starting date (defaults to today)
 * @returns {Date} - Next upcoming Sunday for subscription start
 */
export const getSubscriptionStartSunday = (fromDate = new Date()) => {
  const date = new Date(fromDate);
  const dayOfWeek = date.getDay(); // 0=Sunday, 1=Monday, etc.
  
  // Always start from NEXT Sunday to give proper planning time
  // If today is Sunday, start from next Sunday (7 days later)
  // If today is Monday-Saturday, start from upcoming Sunday
  const daysUntilSunday = dayOfWeek === 0 ? 7 : 7 - dayOfWeek;
  
  const subscriptionStartSunday = new Date(date);
  subscriptionStartSunday.setDate(date.getDate() + daysUntilSunday);
  subscriptionStartSunday.setHours(0, 0, 0, 0); // Start of day
  
  return subscriptionStartSunday;
};

/**
 * Calculate subscription end date based on plan type
 * @param {Date} startDate - Subscription start date
 * @param {string} planType - Plan type ('bi-weekly', 'monthly', 'quarterly')
 * @returns {Date} - Subscription end date
 */
export const calculateSubscriptionEndDate = (startDate, planType = 'bi-weekly') => {
  const endDate = new Date(startDate);
  
  switch (planType) {
    case 'bi-weekly':
      endDate.setDate(startDate.getDate() + 13); // 14 days total, end on Saturday
      break;
    case 'monthly':
      endDate.setDate(startDate.getDate() + 27); // 28 days total, end on Saturday
      break;
    case 'quarterly':
      endDate.setDate(startDate.getDate() + 83); // 84 days total, end on Saturday
      break;
    default:
      endDate.setDate(startDate.getDate() + 13); // Default to bi-weekly
  }
  
  endDate.setHours(23, 59, 59, 999); // End of day
  return endDate;
};

/**
 * Get planning time in days from today to subscription start
 * @param {Date} startDate - Subscription start date
 * @returns {number} - Number of days for planning
 */
export const getPlanningDays = (startDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  
  return Math.ceil((start - today) / (1000 * 60 * 60 * 24));
};

/**
 * Format subscription date range for display
 * @param {Date} startDate - Subscription start date
 * @param {Date} endDate - Subscription end date
 * @returns {string} - Formatted date range
 */
export const formatSubscriptionDateRange = (startDate, endDate) => {
  const options = { 
    weekday: 'short', 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  };
  
  const start = startDate.toLocaleDateString('en-US', options);
  const end = endDate.toLocaleDateString('en-US', options);
  
  return `${start} - ${end}`;
};

/**
 * Get user-friendly planning time message
 * @param {number} planningDays - Number of planning days
 * @returns {string} - User-friendly message
 */
export const getPlanningTimeMessage = (planningDays) => {
  if (planningDays === 1) {
    return "Your subscription starts tomorrow - you have 1 day to plan your meals";
  } else if (planningDays <= 7) {
    return `Your subscription starts in ${planningDays} days - plenty of time to plan your meals`;
  } else {
    return `Your subscription starts in ${planningDays} days - lots of time to plan your perfect meals`;
  }
};

/**
 * Check if a date is a Sunday
 * @param {Date} date - Date to check
 * @returns {boolean} - True if Sunday
 */
export const isSunday = (date) => {
  return date.getDay() === 0;
};

/**
 * Get the current subscription week info for display
 * @param {Date} startDate - Subscription start date
 * @param {string} planType - Plan type
 * @returns {Object} - Week information
 */
export const getSubscriptionWeekInfo = (startDate, planType = 'bi-weekly') => {
  const endDate = calculateSubscriptionEndDate(startDate, planType);
  const planningDays = getPlanningDays(startDate);
  
  return {
    startDate,
    endDate,
    planningDays,
    dateRange: formatSubscriptionDateRange(startDate, endDate),
    planningMessage: getPlanningTimeMessage(planningDays),
    isStartingSoon: planningDays <= 3,
    hasGoodPlanningTime: planningDays >= 3
  };
};
