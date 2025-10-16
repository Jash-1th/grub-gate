/**
 * Navigation utilities for GrubGate customer app
 * Ensures database is always the single source of truth for restaurant selection
 */

/**
 * Navigate to weekly menu without URL parameters
 * This ensures the database selected restaurant is shown, not URL parameters
 * @param {Function} navigate - React Router navigate function
 * @param {number} week - Week number (0 for current, 1 for next)
 */
export const navigateToWeeklyMenu = (navigate, week = 0) => {
  console.log('🔄 Navigating to weekly menu (database-first approach)');
  navigate(`/weekly-menu?week=${week}`);
};

/**
 * Navigate to weekly menu from restaurant selection
 * Saves restaurant to database first, then navigates without URL parameters
 * @param {Function} navigate - React Router navigate function
 * @param {Function} setSelectedRestaurant - Function to save restaurant to database
 * @param {string|number} restaurantId - Restaurant ID
 * @param {string} restaurantName - Restaurant name
 * @param {Object} restaurantData - Full restaurant object
 * @param {number} week - Week number (0 for current, 1 for next)
 */
export const navigateToWeeklyMenuWithRestaurant = (
  navigate, 
  setSelectedRestaurant, 
  restaurantId, 
  restaurantName, 
  restaurantData = null, 
  week = 0
) => {
  console.log('🔄 Saving restaurant to database and navigating to weekly menu');
  console.log('🔄 Restaurant:', restaurantId, restaurantName);
  
  // Save restaurant to database first
  const restaurantObject = restaurantData || {
    id: restaurantId,
    name: restaurantName,
    isApiRestaurant: true
  };
  setSelectedRestaurant(restaurantObject);
  
  // Add a small delay to ensure database save completes before navigation
  setTimeout(() => {
    console.log('🔄 Navigating after restaurant save delay');
    navigate(`/weekly-menu?week=${week}`);
  }, 100); // 100ms delay should be enough for the database save
};

/**
 * Clean URL parameters from weekly menu if they don't match database
 * @param {Function} navigate - React Router navigate function
 * @param {URLSearchParams} searchParams - Current URL search parameters
 * @param {string|number} databaseRestaurantId - Restaurant ID from database
 * @param {string} databaseRestaurantName - Restaurant name from database
 */
export const cleanWeeklyMenuUrl = (navigate, searchParams, databaseRestaurantId, databaseRestaurantName) => {
  const urlRestaurantId = searchParams.get('restaurantId');
  const urlRestaurantName = searchParams.get('restaurantName');
  const week = searchParams.get('week') || '0';
  
  if (urlRestaurantId || urlRestaurantName) {
    const shouldClean = 
      (databaseRestaurantId && urlRestaurantId && String(databaseRestaurantId) !== String(urlRestaurantId)) ||
      (databaseRestaurantName && urlRestaurantName && databaseRestaurantName !== decodeURIComponent(urlRestaurantName)) ||
      (!databaseRestaurantId && !databaseRestaurantName);
    
    if (shouldClean) {
      console.log('🧹 Cleaning weekly menu URL - database is source of truth');
      navigate(`/weekly-menu?week=${week}`, { replace: true });
      return true;
    }
  }
  
  return false;
};
