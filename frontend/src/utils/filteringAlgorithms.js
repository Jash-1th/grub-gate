// Efficient algorithms for restaurant and food item filtering

// Days of the week with meal availability
export const DAYS_OF_WEEK = [
  { id: 'sunday', name: 'Sunday', short: 'Sun' },
  { id: 'monday', name: 'Monday', short: 'Mon' },
  { id: 'tuesday', name: 'Tuesday', short: 'Tue' },
  { id: 'wednesday', name: 'Wednesday', short: 'Wed' },
  { id: 'thursday', name: 'Thursday', short: 'Thu' },
  { id: 'friday', name: 'Friday', short: 'Fri' },
  { id: 'saturday', name: 'Saturday', short: 'Sat' }
];

// Meal availability by day (restaurants can have different schedules)
export const MEAL_AVAILABILITY = {
  sunday: { lunch: true, dinner: true },
  monday: { lunch: true, dinner: true },
  tuesday: { lunch: true, dinner: true },
  wednesday: { lunch: true, dinner: true },
  thursday: { lunch: true, dinner: true },
  friday: { lunch: true, dinner: true },
  saturday: { lunch: true, dinner: true }
};

/**
 * Efficient preference-based sorting algorithm
 * Prioritizes items matching user preferences, then sorts by rating
 */
export const sortItemsByPreferences = (items, userPreferences = []) => {
  if (!items || items.length === 0) return [];
  if (!userPreferences || userPreferences.length === 0) {
    // No preferences - sort by rating and popularity
    return items.sort((a, b) => {
      if (a.isPopular && !b.isPopular) return -1;
      if (!a.isPopular && b.isPopular) return 1;
      return b.rating - a.rating;
    });
  }

  // Calculate preference match score for each item
  const itemsWithScores = items.map(item => {
    let score = 0;
    let matchedPreferences = 0;
    
    // Count matching preferences
    userPreferences.forEach(userPref => {
      if (item.preferences.includes(userPref)) {
        matchedPreferences++;
        score += 10; // Base score for each match
      }
    });
    
    // Bonus for multiple matches
    if (matchedPreferences > 1) {
      score += matchedPreferences * 5;
    }
    
    // Bonus for popular items
    if (item.isPopular) {
      score += 3;
    }
    
    // Rating contribution (0-5 scale)
    score += item.rating;
    
    return {
      ...item,
      preferenceScore: score,
      matchedPreferences
    };
  });

  // Sort by preference score (desc), then by rating (desc)
  return itemsWithScores.sort((a, b) => {
    if (a.preferenceScore !== b.preferenceScore) {
      return b.preferenceScore - a.preferenceScore;
    }
    return b.rating - a.rating;
  });
};

/**
 * Group items by preference categories for easy scrolling
 */
export const groupItemsByPreferenceCategories = (items, userPreferences = []) => {
  const groups = {
    matched: [],
    popular: [],
    other: []
  };

  items.forEach(item => {
    const hasMatchingPreference = userPreferences.some(pref => 
      item.preferences.includes(pref)
    );
    
    if (hasMatchingPreference) {
      groups.matched.push(item);
    } else if (item.isPopular) {
      groups.popular.push(item);
    } else {
      groups.other.push(item);
    }
  });

  return groups;
};

/**
 * Filter items by day and meal type
 */
export const filterItemsByDay = (allItems, selectedDay, currentTime = new Date()) => {
  const dayAvailability = MEAL_AVAILABILITY[selectedDay];
  if (!dayAvailability) return { lunch: [], dinner: [] };

  const currentHour = currentTime.getHours();
  const isLunchTime = currentHour >= 11 && currentHour < 16; // 11 AM - 4 PM
  const isDinnerTime = currentHour >= 16 || currentHour < 2; // 4 PM - 2 AM

  const result = {
    lunch: dayAvailability.lunch ? allItems.lunch || [] : [],
    dinner: dayAvailability.dinner ? allItems.dinner || [] : [],
    availableMeals: []
  };

  // Determine which meals are currently available
  if (dayAvailability.lunch) result.availableMeals.push('lunch');
  if (dayAvailability.dinner) result.availableMeals.push('dinner');

  // Suggest current meal based on time
  if (isLunchTime && dayAvailability.lunch) {
    result.suggestedMeal = 'lunch';
  } else if (isDinnerTime && dayAvailability.dinner) {
    result.suggestedMeal = 'dinner';
  } else {
    result.suggestedMeal = result.availableMeals[0] || 'lunch';
  }

  return result;
};

/**
 * Advanced restaurant filtering with preference priority
 */
export const filterRestaurantsAdvanced = (restaurants, postalCode, userPreferences = []) => {
  let filteredRestaurants = restaurants;

  // Filter by postal code first
  if (postalCode && postalCode.length >= 3) {
    const prefix = postalCode.substring(0, 3).toUpperCase();
    filteredRestaurants = restaurants.filter(restaurant => 
      restaurant.postalCodes.includes(prefix)
    );
  }

  // If no restaurants found for postal code, fall back to popular ones
  if (filteredRestaurants.length === 0) {
    filteredRestaurants = restaurants.filter(r => r.isPopular);
  }

  // Calculate preference match scores for restaurants
  if (userPreferences.length > 0) {
    const restaurantsWithScores = filteredRestaurants.map(restaurant => {
      let score = 0;
      let matchedPreferences = 0;

      userPreferences.forEach(userPref => {
        if (restaurant.preferences.includes(userPref)) {
          matchedPreferences++;
          score += 10;
        }
      });

      // Bonus for multiple matches
      if (matchedPreferences > 1) {
        score += matchedPreferences * 3;
      }

      // Rating and popularity bonus
      score += restaurant.rating;
      if (restaurant.isPopular) score += 2;
      if (restaurant.isTopRated) score += 2;

      return {
        ...restaurant,
        preferenceScore: score,
        matchedPreferences
      };
    });

    // Sort by preference score, then by rating
    filteredRestaurants = restaurantsWithScores.sort((a, b) => {
      if (a.preferenceScore !== b.preferenceScore) {
        return b.preferenceScore - a.preferenceScore;
      }
      return b.rating - a.rating;
    });
  } else {
    // No preferences - sort by rating and popularity
    filteredRestaurants = filteredRestaurants.sort((a, b) => {
      if (a.isPopular && !b.isPopular) return -1;
      if (!a.isPopular && b.isPopular) return 1;
      return b.rating - a.rating;
    });
  }

  return filteredRestaurants;
};

/**
 * Get current day of week
 */
export const getCurrentDay = () => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[new Date().getDay()];
};

/**
 * Check if a specific meal is available on a given day
 */
export const isMealAvailable = (day, mealType) => {
  const dayAvailability = MEAL_AVAILABILITY[day];
  return dayAvailability ? dayAvailability[mealType] : false;
};

/**
 * Debounce function for performance optimization
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
