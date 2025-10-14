const { asyncHandler } = require('../middlewares/errorHandler');
const MealPlan = require('../models/MealPlan');
const { successResponse, errorResponse, notFoundResponse } = require('../utils/apiResponse');
const { addDatesToMealPlan, needsDateRecalculation } = require('../utils/mealPlanDateCalculator');

/**
 * Clean individual meal items by keeping only essential fields
 * @param {Array} mealItems - Array of meal items
 * @returns {Array} - Cleaned meal items
 */
const cleanMealItems = (mealItems) => {
  return mealItems.map(item => ({
    _id: item._id,
    name: item.name,
    price: item.price,
    image: item.image,
    planId: item.planId,
    restaurantName: item.restaurantName,
    addedAt: item.addedAt
  }));
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
    selectedRestaurantId: mealPlan.selectedRestaurantId,
    selectedRestaurantName: mealPlan.selectedRestaurantName,
    // Only include essential restaurant data
    selectedRestaurantData: mealPlan.selectedRestaurantData ? {
      _id: mealPlan.selectedRestaurantData._id,
      name: mealPlan.selectedRestaurantData.name,
      cuisine: mealPlan.selectedRestaurantData.cuisine,
      rating: mealPlan.selectedRestaurantData.rating,
      logo: mealPlan.selectedRestaurantData.logo
    } : null,
    datesCalculatedAt: mealPlan.datesCalculatedAt,
    lastUpdated: mealPlan.lastUpdated,
    createdAt: mealPlan.createdAt,
    updatedAt: mealPlan.updatedAt
  };

  // Clean up weekly plans - only include days with meals
  ['week0', 'week1'].forEach(weekKey => {
    if (mealPlan.weeklyPlans && mealPlan.weeklyPlans[weekKey]) {
      cleaned.weeklyPlans[weekKey] = {};
      
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      dayNames.forEach(dayName => {
        const dayData = mealPlan.weeklyPlans[weekKey][dayName];
        if (dayData) {
          const hasLunchMeals = dayData.lunch && Array.isArray(dayData.lunch) && dayData.lunch.length > 0;
          const hasDinnerMeals = dayData.dinner && Array.isArray(dayData.dinner) && dayData.dinner.length > 0;
          
          // Only include day if it has actual meals (strict check for non-empty arrays)
          if (hasLunchMeals || hasDinnerMeals) {
            console.log(`🍽️ Including ${weekKey}.${dayName}: lunch=${dayData.lunch?.length || 0}, dinner=${dayData.dinner?.length || 0}`);
            cleaned.weeklyPlans[weekKey][dayName] = {
              date: dayData.date,
              lunch: cleanMealItems(dayData.lunch || []),
              dinner: cleanMealItems(dayData.dinner || [])
            };
          } else {
            console.log(`🗑️ Excluding ${weekKey}.${dayName}: no meals (lunch=${dayData.lunch?.length || 0}, dinner=${dayData.dinner?.length || 0})`);
          }
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
    selectedRestaurantId, 
    selectedRestaurantName, 
    selectedRestaurantData 
  } = req.body;

  // Ensure user can only update their own meal plan
  if (req.user.id !== userId) {
    return errorResponse(res, 'Access denied', 403);
  }

  // Validate required fields
  if (!userId || !weeklyPlans) {
    return errorResponse(res, 'User ID and weekly plans are required', 400);
  }

  // Find existing meal plan or create new one
  let mealPlan = await MealPlan.findOne({ userId });

  console.log('💾 Saving meal plan to database:', { userId, totalItems });

  // Add dates to meal plan data BEFORE saving to database
  console.log('📅 Adding dates to meal plan before saving...');
  let mealPlanWithDates = {
    userId,
    weeklyPlans,
    totalItems: totalItems || 0,
    selectedRestaurantId: selectedRestaurantId || null,
    selectedRestaurantName: selectedRestaurantName || null,
    selectedRestaurantData: selectedRestaurantData || null
  };
  mealPlanWithDates = addDatesToMealPlan(mealPlanWithDates);

  if (mealPlan) {
    // Update existing meal plan with dates
    mealPlan.weeklyPlans = mealPlanWithDates.weeklyPlans;
    mealPlan.totalItems = mealPlanWithDates.totalItems;
    mealPlan.datesCalculatedAt = mealPlanWithDates.datesCalculatedAt;
    
    // Update restaurant selection fields
    if (selectedRestaurantId !== undefined) {
      mealPlan.selectedRestaurantId = selectedRestaurantId;
    }
    if (selectedRestaurantName !== undefined) {
      mealPlan.selectedRestaurantName = selectedRestaurantName;
    }
    if (selectedRestaurantData !== undefined) {
      mealPlan.selectedRestaurantData = selectedRestaurantData;
    }
    
    await mealPlan.save();
    console.log('✅ Updated existing meal plan with dates in database');
  } else {
    // Create new meal plan with dates
    mealPlan = new MealPlan({
      userId: mealPlanWithDates.userId,
      weeklyPlans: mealPlanWithDates.weeklyPlans,
      totalItems: mealPlanWithDates.totalItems,
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

module.exports = {
  getMealPlan,
  createOrUpdateMealPlan,
  addItemToMealPlan,
  removeItemFromMealPlan,
  clearMealPlan
};
