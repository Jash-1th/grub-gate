const { asyncHandler } = require('../middlewares/errorHandler');
const MealPlan = require('../models/MealPlan');
const { successResponse, errorResponse, notFoundResponse } = require('../utils/apiResponse');
const { addDatesToMealPlan, needsDateRecalculation } = require('../utils/mealPlanDateCalculator');
const { calculateNutritionTotalsFromWeeklyPlans } = require('../utils/nutritionTotals');

 const getMaxRestaurantsForUser = (user) => {
   return user?.isGrubPass ? null : 2;
 };

/**
 * Clean individual meal items by keeping all necessary fields
 * @param {Array} mealItems - Array of meal items
 * @returns {Array} - Cleaned meal items
 */
const cleanMealItems = (mealItems) => {
  return mealItems.map(item => ({
    id: item.id,                           // Original menu item ID
    name: item.name,                       // Meal name
    price: item.price,                     // Price
    image: item.image,                     // Image URL
    description: item.description,         // Meal description
    category: item.category,               // Meal category (appetizer, main, etc.)
    dietaryPreferences: item.dietaryPreferences || [], // Dietary preferences array
    spiceLevel: item.spiceLevel,           // Spice level (0-5)
    prepTime: item.prepTime,
    servings: item.servings,
    ingredients: item.ingredients || [],
    allergens: item.allergens || [],
    nutritionInfo: item.nutritionInfo || item.nutritionalInfo || {},
    restaurantId: item.restaurantId,       // Restaurant ID
    restaurantName: item.restaurantName,   // Restaurant name
    planId: item.planId,                   // Unique plan item ID
    addedAt: item.addedAt                  // When added to plan
  }));
};

/**
 * Clean meal plan data to ensure all meal items have proper restaurantId
 * @param {Object} weeklyPlans - Weekly plans object
 * @param {String} defaultRestaurantId - Default restaurant ID to use if missing
 * @returns {Object} - Cleaned weekly plans
 */
const cleanMealPlanData = (weeklyPlans, defaultRestaurantId) => {
  if (!weeklyPlans) return {};
  
  const cleanedPlans = {};
  
  ['week0', 'week1'].forEach(weekKey => {
    if (weeklyPlans[weekKey]) {
      cleanedPlans[weekKey] = {};
      
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      dayNames.forEach(dayName => {
        const dayData = weeklyPlans[weekKey][dayName];
        if (dayData) {
          cleanedPlans[weekKey][dayName] = {
            date: dayData.date,
            lunch: cleanMealItemsData(dayData.lunch || [], defaultRestaurantId),
            dinner: cleanMealItemsData(dayData.dinner || [], defaultRestaurantId)
          };
        }
      });
    }
  });
  
  return cleanedPlans;
};

/**
 * Clean meal items data to ensure proper restaurantId
 * @param {Array} mealItems - Array of meal items
 * @param {String} defaultRestaurantId - Default restaurant ID to use if missing
 * @returns {Array} - Cleaned meal items
 */
const cleanMealItemsData = (mealItems, defaultRestaurantId) => {
  if (!Array.isArray(mealItems)) return [];
  
  return mealItems.map(item => {
    const cleanedItem = { ...item };
    
    // Ensure restaurantId is set (use default if missing or invalid)
    if (!cleanedItem.restaurantId || cleanedItem.restaurantId === 'undefined') {
      if (defaultRestaurantId) {
        cleanedItem.restaurantId = defaultRestaurantId;
        console.log(`🔧 Fixed missing restaurantId for item: ${item.name}`);
      } else {
        // If no default, remove the restaurantId field entirely
        delete cleanedItem.restaurantId;
        console.log(`⚠️ Removed invalid restaurantId for item: ${item.name}`);
      }
    }
    
    return cleanedItem;
  });
};

/**
 * Clean meal plan response by removing unnecessary data
 * @param {Object} mealPlan - Meal plan object
 * @returns {Object} - Cleaned meal plan
 */
const cleanMealPlanResponse = (mealPlan) => {
  const cleaned = {
    _id: mealPlan._id,
    userId: mealPlan.userId,
    weeklyPlans: {},
    totalItems: mealPlan.totalItems || 0,
    totalNutrition: mealPlan.totalNutrition || calculateNutritionTotalsFromWeeklyPlans(mealPlan.weeklyPlans || {}),
    // Multi-restaurant support
    selectedRestaurants: mealPlan.selectedRestaurants || [],
    maxRestaurants: mealPlan.maxRestaurants === undefined ? 2 : mealPlan.maxRestaurants,
    // Legacy fields for backward compatibility
    selectedRestaurantId: mealPlan.selectedRestaurants?.[0]?.restaurantId || null,
    selectedRestaurantName: mealPlan.selectedRestaurants?.[0]?.restaurantName || null,
    selectedRestaurantData: mealPlan.selectedRestaurants?.[0] ? {
      _id: mealPlan.selectedRestaurants[0].restaurantId,
      name: mealPlan.selectedRestaurants[0].restaurantName,
      addedAt: mealPlan.selectedRestaurants[0].addedAt
    } : null,
    datesCalculatedAt: mealPlan.datesCalculatedAt,
    lastUpdated: mealPlan.lastUpdated,
    createdAt: mealPlan.createdAt,
    updatedAt: mealPlan.updatedAt
  };

  // Include ALL days that have dates assigned (for calendar display)
  // Days with meals will have meals included, days without meals will have empty arrays
  ['week0', 'week1'].forEach(weekKey => {
    if (mealPlan.weeklyPlans && mealPlan.weeklyPlans[weekKey]) {
      cleaned.weeklyPlans[weekKey] = {};

      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      dayNames.forEach(dayName => {
        const dayData = mealPlan.weeklyPlans[weekKey][dayName];
        // Include day if it has a date assigned (needed for calendar display)
        if (dayData && dayData.date) {
          const hasLunchMeals = dayData.lunch && Array.isArray(dayData.lunch) && dayData.lunch.length > 0;
          const hasDinnerMeals = dayData.dinner && Array.isArray(dayData.dinner) && dayData.dinner.length > 0;

          console.log(`🍽️ Including ${weekKey}.${dayName}: date=${dayData.date}, lunch=${dayData.lunch?.length || 0}, dinner=${dayData.dinner?.length || 0}`);
          cleaned.weeklyPlans[weekKey][dayName] = {
            date: dayData.date,
            lunch: cleanMealItems(dayData.lunch || []),
            dinner: cleanMealItems(dayData.dinner || [])
          };
        }
      });
    }
  });

  return cleaned;
};

/**
 * @desc    Get user's meal plan
 * @route   GET /api/v1/meal-plans/me
 * @route   GET /api/v1/meal-plans/:userId
 * @access  Private
 */
const getMealPlan = asyncHandler(async (req, res) => {
  // Handle both /me and /:userId routes
  const userId = req.params.userId || req.user.id;

  const maxRestaurants = getMaxRestaurantsForUser(req.user);

  // Ensure user can only access their own meal plan
  if (req.user.id !== userId) {
    return errorResponse(res, 'Access denied', 403);
  }

  console.log(`🔍 Getting meal plan for user: ${userId}`);

  // Try to find meal plan in the mealplans collection
  const mealPlan = await MealPlan.findOne({ userId });

  if (!mealPlan) {
    console.log('📋 No meal plan found, returning empty structure');
    return successResponse(res, {
      userId,
      weeklyPlans: {
        week0: {},
        week1: {}
      },
      totalItems: 0,
      totalNutrition: {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
      },
      selectedRestaurants: [],
      maxRestaurants,
      // Legacy fields for backward compatibility
      selectedRestaurantId: null,
      selectedRestaurantName: null,
      selectedRestaurantData: null
    }, 'Empty meal plan retrieved');
  }

  console.log('✅ Meal plan found:', {
    totalItems: mealPlan.totalItems,
    restaurant: mealPlan.selectedRestaurantName
  });

  // Add dates to meal plan before returning (if needed)
  let mealPlanWithDates = mealPlan.toObject();
  console.log('🔍 Checking if date recalculation needed...');
  if (needsDateRecalculation(mealPlanWithDates)) {
    console.log('📅 Adding dates to meal plan and saving to database...');
    mealPlanWithDates = addDatesToMealPlan(mealPlanWithDates);
    
    // Save the updated dates back to database
    mealPlan.weeklyPlans = mealPlanWithDates.weeklyPlans;
    mealPlan.datesCalculatedAt = mealPlanWithDates.datesCalculatedAt;
    await mealPlan.save();
    console.log('✅ Dates saved to database');
    
    // Get fresh object after save
    mealPlanWithDates = mealPlan.toObject();
  } else {
    console.log('⏭️ Date recalculation not needed');
  }

  // Clean up the response - remove unnecessary data
  const cleanedMealPlan = cleanMealPlanResponse(mealPlanWithDates);
  
  console.log('🧹 Cleaned meal plan response:', {
    originalDays: Object.keys(mealPlanWithDates.weeklyPlans?.week0 || {}),
    cleanedDays: Object.keys(cleanedMealPlan.weeklyPlans?.week0 || {}),
    totalItems: cleanedMealPlan.totalItems,
    originalSize: JSON.stringify(mealPlanWithDates).length,
    cleanedSize: JSON.stringify(cleanedMealPlan).length
  });

  successResponse(res, cleanedMealPlan, 'Meal plan retrieved successfully');
});

/**
 * @desc    Create or update user's meal plan
 * @route   POST /api/v1/meal-plans
 * @access  Private
 */
const createOrUpdateMealPlan = asyncHandler(async (req, res) => {
  const { 
    userId, 
    weeklyPlans, 
    totalItems, 
    // Multi-restaurant support
    selectedRestaurants,
    // Legacy fields for backward compatibility
    selectedRestaurantId, 
    selectedRestaurantName, 
    selectedRestaurantData 
  } = req.body;

  const maxRestaurants = getMaxRestaurantsForUser(req.user);

  // Ensure user can only update their own meal plan
  if (req.user.id !== userId) {
    return errorResponse(res, 'Access denied', 403);
  }

  // Validate required fields
  if (!userId || !weeklyPlans) {
    return errorResponse(res, 'User ID and weekly plans are required', 400);
  }

  if (!req.user?.isGrubPass && Array.isArray(selectedRestaurants) && selectedRestaurants.length > 2) {
    return errorResponse(res, 'Maximum 2 restaurants allowed per meal plan', 400);
  }

  // Find existing meal plan or create new one
  let mealPlan = await MealPlan.findOne({ userId });

  console.log('💾 Saving meal plan to database:', { userId, totalItems, selectedRestaurants });

  // Clean meal plan data to ensure restaurantId is properly set
  const cleanedWeeklyPlans = cleanMealPlanData(weeklyPlans, selectedRestaurantId);

  // Add dates to meal plan data BEFORE saving to database
  console.log('📅 Adding dates to meal plan before saving...');
  
  // Sanitize selectedRestaurantData to prevent circular references
  let sanitizedRestaurantData = null;
  if (selectedRestaurantData) {
    try {
      sanitizedRestaurantData = JSON.parse(JSON.stringify(selectedRestaurantData));
    } catch (error) {
      console.warn('⚠️ Could not serialize selectedRestaurantData, using basic fields only');
      sanitizedRestaurantData = {
        id: selectedRestaurantData.id,
        name: selectedRestaurantData.name,
        image: selectedRestaurantData.image,
        rating: selectedRestaurantData.rating,
        cuisine: selectedRestaurantData.cuisine
      };
    }
  }
  
  let mealPlanWithDates = {
    userId,
    weeklyPlans: cleanedWeeklyPlans,
    totalItems: totalItems || 0,
    // Multi-restaurant support
    selectedRestaurants: selectedRestaurants || [],
    maxRestaurants,
    // Legacy fields for backward compatibility
    selectedRestaurantId: selectedRestaurantId || null,
    selectedRestaurantName: selectedRestaurantName || null,
    selectedRestaurantData: sanitizedRestaurantData
  };
  
  try {
    mealPlanWithDates = addDatesToMealPlan(mealPlanWithDates);
  } catch (dateError) {
    console.error('❌ Error adding dates to meal plan:', dateError);
    // Continue without dates if date calculation fails
    console.log('⚠️ Continuing without date calculation...');
  }

  if (mealPlan) {
    // Update existing meal plan with dates
    mealPlan.weeklyPlans = mealPlanWithDates.weeklyPlans;
    mealPlan.totalItems = mealPlanWithDates.totalItems;
    mealPlan.totalNutrition = calculateNutritionTotalsFromWeeklyPlans(mealPlanWithDates.weeklyPlans || {});
    mealPlan.datesCalculatedAt = mealPlanWithDates.datesCalculatedAt;
    
    // Update restaurant selection fields
    if (selectedRestaurants !== undefined) {
      mealPlan.selectedRestaurants = selectedRestaurants;
    }
    mealPlan.maxRestaurants = maxRestaurants;
    if (selectedRestaurantId !== undefined) {
      mealPlan.selectedRestaurantId = selectedRestaurantId;
    }
    if (selectedRestaurantName !== undefined) {
      mealPlan.selectedRestaurantName = selectedRestaurantName;
    }
    if (selectedRestaurantData !== undefined) {
      mealPlan.selectedRestaurantData = sanitizedRestaurantData;
    }
    
    await mealPlan.save();
    console.log('✅ Updated existing meal plan with dates in database');
  } else {
    // Create new meal plan with dates
    mealPlan = new MealPlan({
      userId: mealPlanWithDates.userId,
      weeklyPlans: mealPlanWithDates.weeklyPlans,
      totalItems: mealPlanWithDates.totalItems,
      totalNutrition: calculateNutritionTotalsFromWeeklyPlans(mealPlanWithDates.weeklyPlans || {}),
      selectedRestaurants: mealPlanWithDates.selectedRestaurants,
      maxRestaurants: mealPlanWithDates.maxRestaurants,
      selectedRestaurantId: mealPlanWithDates.selectedRestaurantId,
      selectedRestaurantName: mealPlanWithDates.selectedRestaurantName,
      selectedRestaurantData: mealPlanWithDates.selectedRestaurantData,
      datesCalculatedAt: mealPlanWithDates.datesCalculatedAt
    });
    await mealPlan.save();
    console.log('✅ Created new meal plan with dates in database');
  }

  // Convert to object for response
  mealPlanWithDates = mealPlan.toObject();

  // Clean up the response - remove unnecessary data
  const cleanedMealPlan = cleanMealPlanResponse(mealPlanWithDates);
  
  console.log('🧹 Cleaned saved meal plan:', {
    originalDays: Object.keys(mealPlanWithDates.weeklyPlans?.week0 || {}),
    cleanedDays: Object.keys(cleanedMealPlan.weeklyPlans?.week0 || {}),
    totalItems: cleanedMealPlan.totalItems
  });

  successResponse(res, cleanedMealPlan, 'Meal plan saved successfully');
});

/**
 * @desc    Add item to meal plan
 * @route   POST /api/v1/meal-plans/:userId/add-item
 * @access  Private
 */
const addItemToMealPlan = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { item, day, mealType, restaurantName, week = 0 } = req.body;

  // Ensure user can only update their own meal plan
  if (req.user.id !== userId) {
    return errorResponse(res, 'Access denied', 403);
  }

  // Validate required fields
  if (!item || !day || !mealType || !restaurantName) {
    return errorResponse(res, 'Item, day, meal type, and restaurant name are required', 400);
  }

  const mealPlan = await MealPlan.findOrCreateForUser(userId);

  // Create meal plan item with metadata
  const mealPlanItem = {
    ...item,
    restaurantName,
    addedAt: new Date(),
    planId: `${day}-${mealType}-${item.id}-${Date.now()}`
  };

  // Add item to the specified week, day, and meal type
  const weekKey = `week${week}`;
  if (!mealPlan.weeklyPlans[weekKey]) {
    return errorResponse(res, 'Invalid week specified', 400);
  }

  if (!mealPlan.weeklyPlans[weekKey][day]) {
    return errorResponse(res, 'Invalid day specified', 400);
  }

  if (!mealPlan.weeklyPlans[weekKey][day][mealType]) {
    mealPlan.weeklyPlans[weekKey][day][mealType] = [];
  }

  mealPlan.weeklyPlans[weekKey][day][mealType].push(mealPlanItem);
  mealPlan.totalItems += 1;
  mealPlan.totalNutrition = calculateNutritionTotalsFromWeeklyPlans(mealPlan.weeklyPlans || {});

  await mealPlan.save();

  // Clean up the response - remove unnecessary data
  const cleanedMealPlan = cleanMealPlanResponse(mealPlan.toObject());

  successResponse(res, cleanedMealPlan, 'Item added to meal plan successfully');
});

/**
 * @desc    Remove item from meal plan
 * @route   DELETE /api/v1/meal-plans/:userId/remove-item
 * @access  Private
 */
const removeItemFromMealPlan = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { planId, day, mealType, week = 0 } = req.body;

  // Ensure user can only update their own meal plan
  if (req.user.id !== userId) {
    return errorResponse(res, 'Access denied', 403);
  }

  // Validate required fields
  if (!planId || !day || !mealType) {
    return errorResponse(res, 'Plan ID, day, and meal type are required', 400);
  }

  const mealPlan = await MealPlan.findOne({ userId });
  if (!mealPlan) {
    return notFoundResponse(res, 'Meal plan not found');
  }

  const weekKey = `week${week}`;
  if (!mealPlan.weeklyPlans[weekKey] || !mealPlan.weeklyPlans[weekKey][day]) {
    return errorResponse(res, 'Invalid week or day specified', 400);
  }

  // Remove item from the specified meal type
  const mealItems = mealPlan.weeklyPlans[weekKey][day][mealType];
  const itemIndex = mealItems.findIndex(item => item.planId === planId);

  if (itemIndex === -1) {
    return notFoundResponse(res, 'Item not found in meal plan');
  }

  mealItems.splice(itemIndex, 1);
  mealPlan.totalItems = Math.max(0, mealPlan.totalItems - 1);
  mealPlan.totalNutrition = calculateNutritionTotalsFromWeeklyPlans(mealPlan.weeklyPlans || {});

  await mealPlan.save();

  // Clean up the response - remove unnecessary data
  const cleanedMealPlan = cleanMealPlanResponse(mealPlan.toObject());

  successResponse(res, cleanedMealPlan, 'Item removed from meal plan successfully');
});

/**
 * @desc    Clear entire meal plan
 * @route   DELETE /api/v1/meal-plans/:userId/clear
 * @access  Private
 */
const clearMealPlan = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { week } = req.query; // Optional: clear specific week

  // Ensure user can only clear their own meal plan
  if (req.user.id !== userId) {
    return errorResponse(res, 'Access denied', 403);
  }

  const mealPlan = await MealPlan.findOne({ userId });
  if (!mealPlan) {
    return notFoundResponse(res, 'Meal plan not found');
  }

  const defaultWeekStructure = {
    monday: { lunch: [], dinner: [] },
    tuesday: { lunch: [], dinner: [] },
    wednesday: { lunch: [], dinner: [] },
    thursday: { lunch: [], dinner: [] },
    friday: { lunch: [], dinner: [] },
    saturday: { lunch: [], dinner: [] },
    sunday: { lunch: [], dinner: [] }
  };

  if (week !== undefined) {
    // Clear specific week
    const weekKey = `week${week}`;
    if (mealPlan.weeklyPlans[weekKey]) {
      mealPlan.weeklyPlans[weekKey] = defaultWeekStructure;
    }
  } else {
    // Clear all weeks
    mealPlan.weeklyPlans = {
      week0: defaultWeekStructure,
      week1: defaultWeekStructure
    };
    
    // Clear restaurant selection when clearing all weeks
    mealPlan.selectedRestaurantId = null;
    mealPlan.selectedRestaurantName = null;
    mealPlan.selectedRestaurantData = null;
  }

  mealPlan.totalItems = 0;
  await mealPlan.save();

  // Clean up the response - remove unnecessary data
  const cleanedMealPlan = cleanMealPlanResponse(mealPlan.toObject());

  successResponse(res, cleanedMealPlan, week !== undefined ? `Week ${week} cleared successfully` : 'Meal plan cleared successfully');
});

/**
 * @desc    Get user's selected restaurants from meal plan
 * @route   GET /api/v1/meal-plans/selected-restaurants
 * @access  Private
 */
const getSelectedRestaurants = asyncHandler(async (req, res) => {
  try {
    console.log('🔍 getSelectedRestaurants: Starting...');
    console.log('🔍 getSelectedRestaurants: req.user =', req.user);
    console.log('🔍 getSelectedRestaurants: req.user type =', typeof req.user);
    console.log('🔍 getSelectedRestaurants: req.user keys =', req.user ? Object.keys(req.user) : 'null');
    
    // More robust user ID extraction
    let userId = null;
    if (req.user) {
      userId = req.user._id?.toString() || req.user.id?.toString();
      
      // If still no userId, try other common fields
      if (!userId && req.user.userId) {
        userId = req.user.userId.toString();
      }
    }
    
    console.log('🔍 getSelectedRestaurants: extracted userId =', userId);
    
    if (!userId) {
      console.log('❌ getSelectedRestaurants: No userId found in req.user');
      console.log('❌ getSelectedRestaurants: req.user structure:', JSON.stringify(req.user, null, 2));
      return res.status(400).json({
        success: false,
        message: 'User ID not found in request. Please ensure you are authenticated.',
        debug: {
          userExists: !!req.user,
          userKeys: req.user ? Object.keys(req.user) : null
        }
      });
    }
    
    const mealPlan = await MealPlan.findOne({ userId });
    console.log('🔍 getSelectedRestaurants: mealPlan found =', !!mealPlan);
    
    if (!mealPlan) {
      console.log('🔍 getSelectedRestaurants: No meal plan found, returning empty array');
      return successResponse(res, {
        selectedRestaurants: []
      }, 'No meal plan found - empty restaurant list');
    }
    
    console.log('🔍 getSelectedRestaurants: selectedRestaurants =', mealPlan.selectedRestaurants);
    return successResponse(res, {
      selectedRestaurants: mealPlan.selectedRestaurants || []
    }, 'Selected restaurants retrieved successfully');
  } catch (error) {
    console.log('❌ getSelectedRestaurants: Error =', error);
    console.log('❌ getSelectedRestaurants: Error stack =', error.stack);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * @desc    Add a restaurant to user's meal plan selected restaurants
 * @route   POST /api/v1/meal-plans/selected-restaurants
 * @access  Private
 */
const addSelectedRestaurant = asyncHandler(async (req, res) => {
  console.log('💾 Backend: addSelectedRestaurant called (MealPlan)');
  console.log('💾 Backend: req.body:', JSON.stringify(req.body, null, 2));
  
  const { restaurant } = req.body;
  
  console.log('💾 Backend: extracted restaurant:', JSON.stringify(restaurant, null, 2));
  console.log('💾 Backend: restaurant.id:', restaurant?.id);
  console.log('💾 Backend: restaurant.name:', restaurant?.name);
  
  if (!restaurant || !restaurant.id || !restaurant.name) {
    console.log('❌ Backend: Validation failed - missing restaurant data');
    return errorResponse(res, 'Restaurant data is required (id and name)', 400);
  }
  
  console.log('✅ Backend: Validation passed, proceeding with save');
  
  // Find or create meal plan - robust user ID extraction
  let userId = null;
  if (req.user) {
    userId = req.user._id?.toString() || req.user.id?.toString();
    
    // If still no userId, try other common fields
    if (!userId && req.user.userId) {
      userId = req.user.userId.toString();
    }
  }
  
  if (!userId) {
    console.log('❌ Backend: No userId found in req.user');
    return errorResponse(res, 'User ID not found in request. Please ensure you are authenticated.', 400);
  }

  const maxRestaurants = getMaxRestaurantsForUser(req.user);

  let mealPlan = await MealPlan.findOne({ userId });
  
  if (!mealPlan) {
    // Create new meal plan if it doesn't exist
    mealPlan = new MealPlan({
      userId,
      weeklyPlans: {
        week0: {
          monday: { lunch: [], dinner: [] },
          tuesday: { lunch: [], dinner: [] },
          wednesday: { lunch: [], dinner: [] },
          thursday: { lunch: [], dinner: [] },
          friday: { lunch: [], dinner: [] },
          saturday: { lunch: [], dinner: [] },
          sunday: { lunch: [], dinner: [] }
        },
        week1: {
          monday: { lunch: [], dinner: [] },
          tuesday: { lunch: [], dinner: [] },
          wednesday: { lunch: [], dinner: [] },
          thursday: { lunch: [], dinner: [] },
          friday: { lunch: [], dinner: [] },
          saturday: { lunch: [], dinner: [] },
          sunday: { lunch: [], dinner: [] }
        }
      },
      totalItems: 0,
      selectedRestaurants: [],
      maxRestaurants
    });
  }

  mealPlan.maxRestaurants = maxRestaurants;
  
  // Initialize selectedRestaurants if it doesn't exist
  if (!mealPlan.selectedRestaurants) {
    mealPlan.selectedRestaurants = [];
  }
  
  // Check if restaurant already exists
  const existingIndex = mealPlan.selectedRestaurants.findIndex(
    r => r.restaurantId.toString() === restaurant.id
  );
  
  if (existingIndex !== -1) {
    // Update existing restaurant
    mealPlan.selectedRestaurants[existingIndex] = {
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      addedAt: new Date()
    };
  } else {
    // Check max limit
    if (maxRestaurants !== null && maxRestaurants !== undefined && mealPlan.selectedRestaurants.length >= maxRestaurants) {
      return errorResponse(res, 'Maximum 2 restaurants can be selected', 400);
    }
    // Add new restaurant
    mealPlan.selectedRestaurants.push({
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      addedAt: new Date()
    });
  }
  
  mealPlan.lastUpdated = new Date();
  await mealPlan.save();
  
  console.log('✅ Backend: Restaurant saved to meal plan successfully');
  
  return successResponse(res, {
    selectedRestaurants: mealPlan.selectedRestaurants
  }, 'Restaurant added successfully');
});

/**
 * @desc    Remove a restaurant from user's meal plan selected restaurants
 * @route   DELETE /api/v1/meal-plans/selected-restaurants/:restaurantId
 * @access  Private
 */
const removeSelectedRestaurant = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;
  
  // Robust user ID extraction
  let userId = null;
  if (req.user) {
    userId = req.user._id?.toString() || req.user.id?.toString();
    
    // If still no userId, try other common fields
    if (!userId && req.user.userId) {
      userId = req.user.userId.toString();
    }
  }
  
  if (!userId) {
    console.log('❌ Backend: No userId found in req.user');
    return errorResponse(res, 'User ID not found in request. Please ensure you are authenticated.', 400);
  }
  
  console.log('🗑️ Backend: Removing restaurant', restaurantId, 'for user', userId);
  
  const mealPlan = await MealPlan.findOne({ userId });
  
  if (!mealPlan) {
    return notFoundResponse(res, 'Meal plan not found');
  }
  
  if (!mealPlan.selectedRestaurants) {
    mealPlan.selectedRestaurants = [];
  }
  
  console.log('🗑️ Backend: Before removal - selectedRestaurants:', mealPlan.selectedRestaurants);
  
  // Remove restaurant
  mealPlan.selectedRestaurants = mealPlan.selectedRestaurants.filter(
    r => r.restaurantId.toString() !== restaurantId
  );
  
  console.log('🗑️ Backend: After removal - selectedRestaurants:', mealPlan.selectedRestaurants);
  
  mealPlan.lastUpdated = new Date();
  await mealPlan.save();
  
  console.log('✅ Backend: Restaurant removed and saved successfully');
  
  return successResponse(res, {
    selectedRestaurants: mealPlan.selectedRestaurants
  }, 'Restaurant removed successfully');
});

/**
 * @desc    Clear all items from a specific restaurant
 * @route   DELETE /api/v1/meal-plans/:userId/clear-restaurant/:restaurantId
 * @access  Private
 */
const clearItemsByRestaurant = asyncHandler(async (req, res) => {
  const { userId, restaurantId } = req.params;
  
  // Ensure user can only clear their own meal plan
  if (req.user.id !== userId) {
    return errorResponse(res, 'Access denied', 403);
  }
  
  const mealPlan = await MealPlan.findOne({ userId });
  if (!mealPlan) {
    return notFoundResponse(res, 'Meal plan not found');
  }
  
  let itemsRemoved = 0;
  
  // Clear items from both weeks
  ['week0', 'week1'].forEach(weekKey => {
    if (mealPlan.weeklyPlans[weekKey]) {
      Object.keys(mealPlan.weeklyPlans[weekKey]).forEach(day => {
        ['lunch', 'dinner'].forEach(mealType => {
          if (mealPlan.weeklyPlans[weekKey][day][mealType]) {
            const originalLength = mealPlan.weeklyPlans[weekKey][day][mealType].length;
            
            // Log items before filtering for debugging
            if (mealPlan.weeklyPlans[weekKey][day][mealType].length > 0) {
              console.log(`🔍 ${weekKey}.${day}.${mealType} has ${originalLength} items:`, 
                mealPlan.weeklyPlans[weekKey][day][mealType].map(item => ({
                  name: item.name,
                  restaurantId: item.restaurantId?.toString(),
                  restaurantName: item.restaurantName,
                  matchesId: item.restaurantId?.toString() === restaurantId,
                  matchesName: item.restaurantName === restaurantId
                }))
              );
            }
            
            // Filter out items from the specific restaurant
            mealPlan.weeklyPlans[weekKey][day][mealType] = mealPlan.weeklyPlans[weekKey][day][mealType].filter(
              item => item.restaurantId?.toString() !== restaurantId && item.restaurantName !== restaurantId
            );
            
            // Log items after filtering
            if (originalLength !== mealPlan.weeklyPlans[weekKey][day][mealType].length) {
              console.log(`🔍 ${weekKey}.${day}.${mealType} after filtering: ${mealPlan.weeklyPlans[weekKey][day][mealType].length} items remaining`);
            }
            
            const newLength = mealPlan.weeklyPlans[weekKey][day][mealType].length;
            itemsRemoved += (originalLength - newLength);
          }
        });
      });
    }
  });
  
  // Update total items count
  mealPlan.totalItems = Math.max(0, mealPlan.totalItems - itemsRemoved);
  mealPlan.totalNutrition = calculateNutritionTotalsFromWeeklyPlans(mealPlan.weeklyPlans || {});
  mealPlan.lastUpdated = new Date();
  
  console.log(`🔍 Final result: ${itemsRemoved} items removed from restaurant ${restaurantId}, new total: ${mealPlan.totalItems}`);
  
  await mealPlan.save();
  
  // Clean up the response
  const cleanedMealPlan = cleanMealPlanResponse(mealPlan.toObject());
  
  return successResponse(res, {
    ...cleanedMealPlan,
    itemsRemoved
  }, `Cleared ${itemsRemoved} items from restaurant`);
});

module.exports = {
  getMealPlan,
  createOrUpdateMealPlan,
  addItemToMealPlan,
  removeItemFromMealPlan,
  clearMealPlan,
  clearItemsByRestaurant,
  getSelectedRestaurants,
  addSelectedRestaurant,
  removeSelectedRestaurant
};
