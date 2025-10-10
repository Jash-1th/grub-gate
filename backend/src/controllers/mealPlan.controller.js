const { asyncHandler } = require('../middlewares/errorHandler');
const MealPlan = require('../models/MealPlan');
const { successResponse, errorResponse, notFoundResponse } = require('../utils/apiResponse');

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
      selectedRestaurantId: null,
      selectedRestaurantName: null,
      selectedRestaurantData: null
    }, 'Empty meal plan retrieved');
  }

  console.log('✅ Meal plan found:', {
    totalItems: mealPlan.totalItems,
    restaurant: mealPlan.selectedRestaurantName
  });

  successResponse(res, mealPlan, 'Meal plan retrieved successfully');
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

  if (mealPlan) {
    // Update existing meal plan
    mealPlan.weeklyPlans = weeklyPlans;
    mealPlan.totalItems = totalItems || 0;
    
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
  } else {
    // Create new meal plan
    mealPlan = new MealPlan({
      userId,
      weeklyPlans,
      totalItems: totalItems || 0,
      selectedRestaurantId: selectedRestaurantId || null,
      selectedRestaurantName: selectedRestaurantName || null,
      selectedRestaurantData: selectedRestaurantData || null
    });
    await mealPlan.save();
  }

  successResponse(res, mealPlan, 'Meal plan saved successfully');
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

  successResponse(res, mealPlan, 'Item added to meal plan successfully');
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

  successResponse(res, mealPlan, 'Item removed from meal plan successfully');
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

  successResponse(res, mealPlan, week !== undefined ? `Week ${week} cleared successfully` : 'Meal plan cleared successfully');
});

module.exports = {
  getMealPlan,
  createOrUpdateMealPlan,
  addItemToMealPlan,
  removeItemFromMealPlan,
  clearMealPlan
};
