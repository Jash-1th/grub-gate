// FILE: src/utils/dateHelpers.js
/**
 * Get the next Sunday from a given date (UTC-based calculation)
 * @param {Date} fromDate - Starting date (defaults to today)
 * @returns {Date} - Next Sunday at UTC midnight
 */
const getNextSunday = (fromDate = new Date()) => {
  const date = new Date(fromDate);
  const dayOfWeek = date.getUTCDay(); // Use UTC day to avoid timezone issues
  
  // Smart calculation: if today is Sunday, return today; otherwise get next Sunday
  const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
  
  // Create UTC date for precise calculation
  const nextSunday = new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate() + daysUntilSunday,
    0, 0, 0, 0
  ));
  
  // Debug log for verification
  console.log(`📅 getNextSunday: From ${date.toDateString()} (UTC day ${dayOfWeek}) -> ${nextSunday.toDateString()} (+${daysUntilSunday} days)`);
  
  return nextSunday;
};

/**
 * Get the next upcoming Sunday for subscription start (always gives at least 1 week notice)
 * @param {Date} fromDate - Starting date (defaults to today)
 * @returns {Date} - Next upcoming Sunday for subscription start
 */
const getSubscriptionStartSunday = (fromDate = new Date()) => {
  const date = new Date(fromDate);
  const dayOfWeek = date.getUTCDay(); // Use UTC day to avoid timezone issues
  
  // Always start from NEXT Sunday to give proper planning time
  // If today is Sunday, start from next Sunday (7 days later)
  // If today is Monday-Saturday, start from upcoming Sunday
  const daysUntilSunday = dayOfWeek === 0 ? 7 : 7 - dayOfWeek;
  
  // Create UTC date for precise calculation
  const subscriptionStartSunday = new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate() + daysUntilSunday,
    0, 0, 0, 0
  ));
  
  // Debug log for verification
  console.log(`📅 getSubscriptionStartSunday: From ${date.toDateString()} (UTC day ${dayOfWeek}) -> ${subscriptionStartSunday.toDateString()} (+${daysUntilSunday} days)`);
  
  return subscriptionStartSunday;
};

/**
 * Get week date range starting from next Sunday
 * @param {number} weekOffset - Week offset (0 = first week, 1 = second week, etc.)
 * @param {Date} fromDate - Starting date (defaults to today)
 * @returns {Object} - { startDate, endDate }
 */
const getWeekDateRange = (weekOffset = 0, fromDate = new Date()) => {
  const nextSunday = getNextSunday(fromDate);
  
  // Use UTC calculation for precise week boundaries
  const startOfWeek = new Date(Date.UTC(
    nextSunday.getUTCFullYear(),
    nextSunday.getUTCMonth(),
    nextSunday.getUTCDate() + (weekOffset * 7),
    0, 0, 0, 0
  ));
  
  const endOfWeek = new Date(Date.UTC(
    startOfWeek.getUTCFullYear(),
    startOfWeek.getUTCMonth(),
    startOfWeek.getUTCDate() + 6,
    23, 59, 59, 999
  ));
  
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
  // Use UTC for all calculations to ensure timezone independence
  const target = new Date(Date.UTC(
    targetDate.getUTCFullYear(),
    targetDate.getUTCMonth(),
    targetDate.getUTCDate(),
    0, 0, 0, 0
  ));
  
  for (const week of weeks) {
    const weekStart = new Date(Date.UTC(
      week.weekStartDate.getUTCFullYear(),
      week.weekStartDate.getUTCMonth(),
      week.weekStartDate.getUTCDate(),
      0, 0, 0, 0
    ));
    
    const weekEnd = new Date(Date.UTC(
      week.weekEndDate.getUTCFullYear(),
      week.weekEndDate.getUTCMonth(),
      week.weekEndDate.getUTCDate(),
      23, 59, 59, 999
    ));
    
    if (target >= weekStart && target <= weekEnd) {
      // Calculate day index using UTC date arithmetic
      const dayIndex = Math.floor((target.getTime() - weekStart.getTime()) / (24 * 60 * 60 * 1000));
      
      // Use UTC day of week for consistent calculation
      const weekStartDayOfWeek = weekStart.getUTCDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
      const allDayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      
      // Create day names array starting from the week's actual start day
      const weekDayNames = [];
      for (let i = 0; i < 7; i++) {
        const dayNameIndex = (weekStartDayOfWeek + i) % 7;
        weekDayNames.push(allDayNames[dayNameIndex]);
      }
      
      if (dayIndex >= 0 && dayIndex < 7) {
        return weekDayNames[dayIndex];
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
  targetDate.setUTCDate(startDate.getUTCDate() + dayIndex);
  
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
  // Use setUTCHours for UTC-based normalization
  target.setUTCHours(0, 0, 0, 0);
  
  for (const week of weeks) {
    const weekStart = new Date(week.weekStartDate);
    // Use setUTCHours for UTC-based normalization
    weekStart.setUTCHours(0, 0, 0, 0);
    
    const weekEnd = new Date(week.weekEndDate);
    // This one is fine as it sets the end of the day
    weekEnd.setUTCHours(23, 59, 59, 999);
    
    if (target >= weekStart && target <= weekEnd) {
      return true;
    }
  }
  
  return false;
};

module.exports = {
  getNextSunday,
  getSubscriptionStartSunday,
  getWeekDateRange,
  findSubscriptionDayForDate,
  getCalendarDateForSubscriptionDay,
  isDateInSubscriptionPeriod
};
