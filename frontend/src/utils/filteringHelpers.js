import { filterItemsByDay } from './filteringAlgorithms';

/**
 * Food preference options - shared across all pages
 */
export const foodPreferences = [
  { id: 'vegetarian', name: 'Vegetarian' },
  { id: 'vegan', name: 'Vegan' },
  { id: 'gluten-free', name: 'Gluten Free' },
  { id: 'dairy-free', name: 'Dairy Free' },
  { id: 'keto', name: 'Keto' },
  { id: 'halal', name: 'Halal' },
  { id: 'kosher', name: 'Kosher' }
];

/**
 * Apply preference filtering to menu items
 * @param {Array} items - Array of menu items
 * @param {Array} selectedPreferences - Array of selected preference IDs
 * @returns {Array} Filtered items
 */
export const applyPreferenceFilter = (items, selectedPreferences) => {
  if (!selectedPreferences || selectedPreferences.length === 0) {
    return items;
  }
  
  return items.filter(item => 
    selectedPreferences.some(preference => 
      item.dietaryPreferences && item.dietaryPreferences.includes(preference)
    )
  );
};

/**
 * Filter restaurant data for a specific day and meal type
 * @param {Array} restaurantData - Array of restaurants
 * @param {Function} getFoodItemsByRestaurant - Function to get food items for a restaurant
 * @param {string} selectedDay - Selected day ID
 * @param {string} selectedMealType - Selected meal type ('lunch' or 'dinner')
 * @param {Array} selectedPreferences - Array of selected preference IDs
 * @returns {Array} Filtered restaurants with available items
 */
export const filterRestaurantsData = (
  restaurantData, 
  getFoodItemsByRestaurant, 
  selectedDay, 
  selectedMealType, 
  selectedPreferences = []
) => {
  return restaurantData.map(restaurant => {
    const foodItems = getFoodItemsByRestaurant(restaurant.id);
    const dayFilteredItems = filterItemsByDay(foodItems, selectedDay);
    const mealItems = dayFilteredItems[selectedMealType] || [];

    // Apply preference filtering
    const filteredItems = applyPreferenceFilter(mealItems, selectedPreferences);

    return {
      ...restaurant,
      availableItems: filteredItems,
      totalItems: mealItems.length,
      dayFilteredItems // Include for meal availability checks
    };
  }).filter(restaurant => restaurant.availableItems.length > 0);
};

/**
 * Separate menu items into preference-matched and other items
 * @param {Array} items - Array of menu items
 * @param {Array} selectedPreferences - Array of selected preference IDs
 * @returns {Object} Object with preferenceMatchedItems and otherItems arrays
 */
export const separateItemsByPreferences = (items, selectedPreferences) => {
  if (!selectedPreferences || selectedPreferences.length === 0) {
    return {
      preferenceMatchedItems: [],
      otherItems: items
    };
  }

  const preferenceMatchedItems = items.filter(item =>
    selectedPreferences.some(preference =>
      item.dietaryPreferences && item.dietaryPreferences.includes(preference)
    )
  );

  const otherItems = items.filter(item =>
    !selectedPreferences.some(preference =>
      item.dietaryPreferences && item.dietaryPreferences.includes(preference)
    )
  );

  return {
    preferenceMatchedItems,
    otherItems
  };
};

/**
 * Group items by category
 * @param {Array} items - Array of menu items
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
 * Check if any filters are currently applied
 * @param {Array} selectedPreferences - Array of selected preference IDs
 * @param {string} selectedDay - Selected day ID
 * @param {Function} getCurrentDay - Function to get current day
 * @returns {boolean} True if filters are applied
 */
export const hasFiltersApplied = (selectedPreferences, selectedDay, getCurrentDay) => {
  return selectedPreferences.length > 0 || selectedDay !== getCurrentDay();
};
