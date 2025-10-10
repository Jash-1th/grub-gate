import { applyPreferenceFilter } from './filteringHelpers';

/**
 * Get all food items from all restaurants for a specific day and slot
 * @param {string} day - Day of the week (e.g., 'monday', 'tuesday')
 * @param {string} slot - Meal slot ('lunch' or 'dinner')
 * @param {Array} preferences - Array of selected preference IDs (optional)
 * @returns {Array} Array of food items with restaurant information
 */
export const getAllFoodItemsForDayAndSlot = (day, slot, preferences = [], restaurants = []) => {
  const allItems = [];

  restaurants.forEach(restaurant => {
    if (restaurant.foodItems && restaurant.foodItems.length > 0) {
      restaurant.foodItems.forEach(item => {
        // Check if item is available for the specified day and slot
        if (item.availability && 
            item.availability[day] && 
            item.availability[day][slot]) {
          
          // Add restaurant information to the item
          const itemWithRestaurant = {
            ...item,
            restaurantName: restaurant.name,
            restaurantId: restaurant.id,
            restaurantImage: restaurant.image,
            restaurantRating: restaurant.rating,
            restaurantCuisine: restaurant.cuisine,
            restaurantDeliveryTime: restaurant.deliveryTime,
            restaurantDeliveryFee: restaurant.deliveryFee
          };

          allItems.push(itemWithRestaurant);
        }
      });
    }
  });

  // Apply preference filtering if preferences are provided
  if (preferences && preferences.length > 0) {
    return applyPreferenceFilter(allItems, preferences);
  }

  return allItems;
};

/**
 * Get all food items from all restaurants for both lunch and dinner for a specific day
 * @param {string} day - Day of the week (e.g., 'monday', 'tuesday')
 * @param {Array} preferences - Array of selected preference IDs (optional)
 * @returns {Object} Object with lunch and dinner arrays
 */
export const getAllFoodItemsForDay = (day, preferences = [], restaurants = []) => {
  const lunchItems = getAllFoodItemsForDayAndSlot(day, 'lunch', preferences, restaurants);
  const dinnerItems = getAllFoodItemsForDayAndSlot(day, 'dinner', preferences, restaurants);

  return {
    lunch: lunchItems,
    dinner: dinnerItems
  };
};

/**
 * Group items by category for better organization
 * @param {Array} items - Array of food items
 * @returns {Object} Object with items grouped by category
 */
export const groupItemsByCategory = (items) => {
  return items.reduce((acc, item) => {
    const category = item.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});
};

/**
 * Get unique restaurants from a list of food items
 * @param {Array} items - Array of food items with restaurant information
 * @returns {Array} Array of unique restaurant objects
 */
export const getUniqueRestaurants = (items) => {
  const restaurantMap = new Map();
  
  items.forEach(item => {
    if (!restaurantMap.has(item.restaurantId)) {
      restaurantMap.set(item.restaurantId, {
        id: item.restaurantId,
        name: item.restaurantName,
        image: item.restaurantImage,
        rating: item.restaurantRating,
        cuisine: item.restaurantCuisine,
        deliveryTime: item.restaurantDeliveryTime,
        deliveryFee: item.restaurantDeliveryFee
      });
    }
  });

  return Array.from(restaurantMap.values());
};

/**
 * Capitalize first letter of a string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};
