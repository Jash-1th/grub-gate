/**
 * Frontend utility to handle date validation for subscription meal plans
 * This prevents the Oct 11 → Oct 12 fallback issue
 */

/**
 * Check if a selected date is within the subscription period
 * @param {Date} selectedDate - The date selected by user
 * @param {Object} subscriptionPlan - The subscription meal plan object
 * @returns {Object} - Validation result with status and message
 */
export const validateSubscriptionDate = (selectedDate, subscriptionPlan) => {
  if (!selectedDate || !subscriptionPlan) {
    return {
      isValid: false,
      message: 'Invalid date or subscription plan',
      suggestedAction: 'select_valid_date'
    };
  }

  const planStart = new Date(subscriptionPlan.planStartDate);
  const planEnd = new Date(subscriptionPlan.planEndDate);
  
  // Normalize dates to compare only the date part (ignore time)
  const selected = new Date(selectedDate);
  selected.setHours(0, 0, 0, 0);
  planStart.setHours(0, 0, 0, 0);
  planEnd.setHours(23, 59, 59, 999);

  if (selected < planStart) {
    const daysUntilStart = Math.ceil((planStart - selected) / (1000 * 60 * 60 * 24));
    return {
      isValid: false,
      message: `This date is before your subscription starts. Your subscription begins on ${planStart.toDateString()}.`,
      suggestedAction: 'redirect_to_start_date',
      suggestedDate: planStart,
      daysUntilStart
    };
  }

  if (selected > planEnd) {
    const daysAfterEnd = Math.ceil((selected - planEnd) / (1000 * 60 * 60 * 24));
    return {
      isValid: false,
      message: `This date is after your subscription ends. Your subscription ended on ${planEnd.toDateString()}.`,
      suggestedAction: 'show_renewal_options',
      daysAfterEnd
    };
  }

  return {
    isValid: true,
    message: 'Date is within subscription period',
    suggestedAction: 'show_orders'
  };
};

/**
 * Get the appropriate message for out-of-range dates
 * @param {Date} selectedDate 
 * @param {Object} subscriptionPlan 
 * @returns {string} - User-friendly message
 */
export const getDateRangeMessage = (selectedDate, subscriptionPlan) => {
  const validation = validateSubscriptionDate(selectedDate, subscriptionPlan);
  
  if (validation.isValid) {
    return null; // No message needed for valid dates
  }

  switch (validation.suggestedAction) {
    case 'redirect_to_start_date':
      return `No orders scheduled for ${selectedDate.toDateString()}. Your subscription starts on ${validation.suggestedDate.toDateString()}.`;
    
    case 'show_renewal_options':
      return `Your subscription ended on ${new Date(subscriptionPlan.planEndDate).toDateString()}. Would you like to renew?`;
    
    default:
      return 'This date is not available in your current subscription plan.';
  }
};

/**
 * Handle date selection with proper validation
 * @param {Date} selectedDate 
 * @param {Object} subscriptionPlan 
 * @param {Function} onValidDate - Callback for valid dates
 * @param {Function} onInvalidDate - Callback for invalid dates
 */
export const handleDateSelection = (selectedDate, subscriptionPlan, onValidDate, onInvalidDate) => {
  const validation = validateSubscriptionDate(selectedDate, subscriptionPlan);
  
  if (validation.isValid) {
    onValidDate(selectedDate, validation);
  } else {
    onInvalidDate(selectedDate, validation);
  }
};

/**
 * Get the nearest valid date within subscription period
 * @param {Date} selectedDate 
 * @param {Object} subscriptionPlan 
 * @returns {Date|null} - Nearest valid date or null if no valid dates
 */
export const getNearestValidDate = (selectedDate, subscriptionPlan) => {
  if (!subscriptionPlan) return null;
  
  const planStart = new Date(subscriptionPlan.planStartDate);
  const planEnd = new Date(subscriptionPlan.planEndDate);
  const selected = new Date(selectedDate);
  
  planStart.setHours(0, 0, 0, 0);
  planEnd.setHours(0, 0, 0, 0);
  selected.setHours(0, 0, 0, 0);
  
  if (selected < planStart) {
    return planStart; // Return start date if selected is before
  }
  
  if (selected > planEnd) {
    return planEnd; // Return end date if selected is after
  }
  
  return selected; // Return selected date if it's within range
};
