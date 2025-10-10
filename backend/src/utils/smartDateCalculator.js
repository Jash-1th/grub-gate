// FILE: src/utils/smartDateCalculator.js
/**
 * Intelligent Date Calculator for Order Generation
 * Handles timezone-aware date calculations for subscription orders
 */

/**
 * Calculate the exact delivery date for a subscription day
 * @param {Object} week - Week object from subscription
 * @param {string} dayName - Day name (sunday, monday, etc.)
 * @returns {Date} - UTC date at midnight for delivery
 */
const calculateDeliveryDate = (week, dayName) => {
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayIndex = dayNames.indexOf(dayName.toLowerCase());
  
  if (dayIndex === -1) {
    throw new Error(`Invalid day name: ${dayName}`);
  }
  
  // Get week start date and ensure it's treated as UTC
  const weekStartDate = new Date(week.weekStartDate);
  
  // Calculate target date by adding days to week start
  // Use UTC methods to avoid timezone issues
  const deliveryDate = new Date(Date.UTC(
    weekStartDate.getUTCFullYear(),
    weekStartDate.getUTCMonth(),
    weekStartDate.getUTCDate() + dayIndex,
    0, 0, 0, 0
  ));
  
  return deliveryDate;
};

/**
 * Smart order status determination based on delivery date
 * @param {Date} deliveryDate - The delivery date
 * @returns {string} - Order status (pending, scheduled, completed)
 */
const determineOrderStatus = (deliveryDate) => {
  const now = new Date();
  const todayUTC = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    0, 0, 0, 0
  ));
  
  const deliveryUTC = new Date(Date.UTC(
    deliveryDate.getUTCFullYear(),
    deliveryDate.getUTCMonth(),
    deliveryDate.getUTCDate(),
    0, 0, 0, 0
  ));
  
  if (deliveryUTC.getTime() === todayUTC.getTime()) {
    return 'pending'; // Today's orders are active
  } else if (deliveryUTC < todayUTC) {
    return 'completed'; // Past orders
  } else {
    return 'scheduled'; // Future orders
  }
};

/**
 * Generate delivery time based on meal type and delivery date
 * @param {Date} deliveryDate - The delivery date
 * @param {string} mealType - lunch or dinner
 * @returns {Date} - Delivery time
 */
const calculateDeliveryTime = (deliveryDate, mealType) => {
  const deliveryTime = new Date(deliveryDate);
  
  if (mealType === 'lunch') {
    // 12:30 PM local time
    deliveryTime.setUTCHours(7, 0, 0, 0); // 12:30 PM IST = 07:00 AM UTC
  } else if (mealType === 'dinner') {
    // 7:30 PM local time  
    deliveryTime.setUTCHours(14, 0, 0, 0); // 7:30 PM IST = 14:00 PM UTC
  }
  
  return deliveryTime;
};

/**
 * Create date range for querying orders by date
 * @param {string|Date} date - Date string (YYYY-MM-DD) or Date object
 * @returns {Object} - {startOfDay, endOfDay} in UTC
 */
const createDateRange = (date) => {
  let targetDate;
  
  if (typeof date === 'string') {
    // Parse YYYY-MM-DD format
    const [year, month, day] = date.split('-').map(Number);
    targetDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  } else {
    targetDate = new Date(Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      0, 0, 0, 0
    ));
  }
  
  const startOfDay = new Date(targetDate);
  const endOfDay = new Date(targetDate);
  endOfDay.setUTCHours(23, 59, 59, 999);
  
  return { startOfDay, endOfDay };
};

/**
 * Validate and normalize date input
 * @param {string|Date} input - Date input
 * @returns {Date} - Normalized UTC date
 */
const normalizeDate = (input) => {
  if (!input) {
    throw new Error('Date input is required');
  }
  
  let date;
  if (typeof input === 'string') {
    date = new Date(input);
  } else {
    date = new Date(input);
  }
  
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date input');
  }
  
  // Return UTC midnight
  return new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    0, 0, 0, 0
  ));
};

/**
 * Get current date in UTC midnight format
 * @returns {Date} - Current date at UTC midnight
 */
const getCurrentDateUTC = () => {
  const now = new Date();
  return new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    0, 0, 0, 0
  ));
};

/**
 * Check if two dates are the same day (UTC comparison)
 * @param {Date} date1 
 * @param {Date} date2 
 * @returns {boolean}
 */
const isSameDay = (date1, date2) => {
  const d1 = normalizeDate(date1);
  const d2 = normalizeDate(date2);
  return d1.getTime() === d2.getTime();
};

/**
 * Format date for logging/debugging
 * @param {Date} date 
 * @returns {string}
 */
const formatDateForLog = (date) => {
  if (!date) return 'undefined';
  return `${date.toISOString()} (${date.toDateString()})`;
};

module.exports = {
  calculateDeliveryDate,
  determineOrderStatus,
  calculateDeliveryTime,
  createDateRange,
  normalizeDate,
  getCurrentDateUTC,
  isSameDay,
  formatDateForLog
};
