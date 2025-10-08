// FILE: src/utils/dateHelpers.js
/**
 * Date helper functions for consistent Sunday-based week calculations
 * Matches frontend logic exactly
 */

/**
 * Get the next Sunday from a given date (or today if no date provided)
 * If today is Sunday, returns next Sunday (7 days later)
 * @param {Date} fromDate - Starting date (defaults to today)
 * @returns {Date} - Next Sunday at 00:00:00
 */
const getNextSunday = (fromDate = new Date()) => {
  const date = new Date(fromDate);
  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const daysUntilSunday = dayOfWeek === 0 ? 7 : 7 - dayOfWeek; // If today is Sunday, get next Sunday
  
  const nextSunday = new Date(date);
  nextSunday.setDate(date.getDate() + daysUntilSunday);
  nextSunday.setHours(0, 0, 0, 0); // Reset to start of day
  
  return nextSunday;
};

/**
 * Get week date range starting from next Sunday
 * @param {number} weekOffset - Week offset (0 = first week, 1 = second week, etc.)
 * @param {Date} fromDate - Starting date (defaults to today)
 * @returns {Object} - { startDate, endDate }
 */
const getWeekDateRange = (weekOffset = 0, fromDate = new Date()) => {
  const nextSunday = getNextSunday(fromDate);
  const startOfWeek = new Date(nextSunday);
  startOfWeek.setDate(nextSunday.getDate() + (weekOffset * 7)); // Next Sunday + week offset
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday
  endOfWeek.setHours(23, 59, 59, 999); // End of day
  
  return {
    startDate: startOfWeek,
    endDate: endOfWeek
  };
};

/**
 * Find which subscription day corresponds to a calendar date
 * @param {Date} targetDate - Calendar date to check
 * @param {Array} weeks - Subscription weeks array
 * @returns {string|null} - Day name ('sunday', 'monday', etc.) or null if not found
 */
const findSubscriptionDayForDate = (targetDate, weeks) => {
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);
  
  for (const week of weeks) {
    const weekStart = new Date(week.weekStartDate);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(week.weekEndDate);
    weekEnd.setHours(23, 59, 59, 999);
    
    if (target >= weekStart && target <= weekEnd) {
      // Calculate which subscription day this calendar date represents
      const dayIndex = Math.floor((target - weekStart) / (24 * 60 * 60 * 1000));
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      
      if (dayIndex >= 0 && dayIndex < 7) {
        return dayNames[dayIndex];
      }
    }
  }
  
  return null;
};

/**
 * Get the calendar date for a specific subscription day and week
 * @param {string} subscriptionDay - Day name ('sunday', 'monday', etc.)
 * @param {number} weekOffset - Week offset (0 = first week, 1 = second week)
 * @param {Date} fromDate - Starting date (defaults to today)
 * @returns {Date|null} - Calendar date or null if invalid
 */
const getCalendarDateForSubscriptionDay = (subscriptionDay, weekOffset = 0, fromDate = new Date()) => {
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayIndex = dayNames.indexOf(subscriptionDay.toLowerCase());
  
  if (dayIndex === -1) {
    return null;
  }
  
  const { startDate } = getWeekDateRange(weekOffset, fromDate);
  const targetDate = new Date(startDate);
  targetDate.setDate(startDate.getDate() + dayIndex);
  
  return targetDate;
};

/**
 * Check if a date falls within subscription weeks
 * @param {Date} targetDate - Date to check
 * @param {Array} weeks - Subscription weeks array
 * @returns {boolean} - True if date is within subscription period
 */
const isDateInSubscriptionPeriod = (targetDate, weeks) => {
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);
  
  for (const week of weeks) {
    const weekStart = new Date(week.weekStartDate);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(week.weekEndDate);
    weekEnd.setHours(23, 59, 59, 999);
    
    if (target >= weekStart && target <= weekEnd) {
      return true;
    }
  }
  
  return false;
};

module.exports = {
  getNextSunday,
  getWeekDateRange,
  findSubscriptionDayForDate,
  getCalendarDateForSubscriptionDay,
  isDateInSubscriptionPeriod
};
