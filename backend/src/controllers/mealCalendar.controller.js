const UserMealCalendar = require('../models/UserMealCalendar');
const SubscriptionMealPlan = require('../models/SubscriptionMealPlan');

/**
 * @desc    Get user's meal calendar
 * @route   GET /api/v1/meal-calendar
 * @access  Private (Customer only)
 */
const getUserMealCalendar = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    
    // Find user's active calendar
    const calendar = await UserMealCalendar.findActiveSubscription(req.user._id);
    
    if (!calendar) {
      return res.status(404).json({
        success: false,
        message: 'No active meal calendar found'
      });
    }

    let meals = calendar.calendarEntries;

    // Filter by date range if provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      meals = calendar.getMealsForDateRange(start, end);
    }

    // Filter by status if provided
    if (status) {
      meals = meals.filter(meal => meal.status === status);
    }

    // Populate restaurant details
    await calendar.populate('calendarEntries.restaurantId', 'name cuisine phone address');

    res.status(200).json({
      success: true,
      data: {
        calendar: {
          _id: calendar._id,
          subscriptionPeriod: calendar.subscriptionPeriod,
          isActive: calendar.isActive,
          totalMeals: calendar.totalMeals,
          deliveredMeals: calendar.deliveredMeals,
          progressPercentage: calendar.progressPercentage,
          remainingDays: calendar.remainingDays,
          metadata: calendar.metadata
        },
        meals: meals,
        summary: {
          totalMeals: meals.length,
          byStatus: {
            scheduled: meals.filter(m => m.status === 'scheduled').length,
            preparing: meals.filter(m => m.status === 'preparing').length,
            ready: meals.filter(m => m.status === 'ready').length,
            delivered: meals.filter(m => m.status === 'delivered').length,
            cancelled: meals.filter(m => m.status === 'cancelled').length
          },
          byMealType: {
            breakfast: meals.filter(m => m.mealType === 'breakfast').length,
            lunch: meals.filter(m => m.mealType === 'lunch').length,
            dinner: meals.filter(m => m.mealType === 'dinner').length
          }
        }
      }
    });
    
  } catch (error) {
    console.error('Error getting meal calendar:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get meal calendar',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Check subscription status and overlap
 * @route   GET /api/v1/meal-calendar/subscription-status
 * @access  Private (Customer only)
 */
const getSubscriptionStatus = async (req, res) => {
  try {
  const { startDate, endDate } = req.query;
  
  // Check for active subscription
  const activeCalendar = await UserMealCalendar.findActiveSubscription(req.user._id);
  
  let hasActiveSubscription = false;
  let hasOverlap = false;
  let overlapDetails = null;

  if (activeCalendar) {
    hasActiveSubscription = true;
  }

  // Check for overlap if dates provided
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const overlap = await UserMealCalendar.checkSubscriptionOverlap(req.user._id, start, end);
    
    if (overlap) {
      hasOverlap = true;
      overlapDetails = {
        subscriptionId: overlap._id,
        conflictPeriod: overlap.subscriptionPeriod,
        planType: overlap.subscriptionPeriod.planType
      };
    }
  }

  res.status(200).json({
    success: true,
    data: {
      hasActiveSubscription,
      hasOverlap,
      overlapDetails,
      activeSubscription: activeCalendar ? {
        _id: activeCalendar._id,
        subscriptionPeriod: activeCalendar.subscriptionPeriod,
        progressPercentage: activeCalendar.progressPercentage,
        remainingDays: activeCalendar.remainingDays
      } : null
    }
  });
  
  } catch (error) {
    console.error('Error checking subscription status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check subscription status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get meal calendar for specific date range
 * @route   GET /api/v1/meal-calendar/range
 * @access  Private (Customer only)
 */
const getMealCalendarRange = async (req, res) => {
  try {
  const { startDate, endDate } = req.query;
  
  if (!startDate || !endDate) {
    return res.status(400).json({
      success: false,
      message: 'Start date and end date are required'
    });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  // Find all calendars that overlap with the requested range
  const calendars = await UserMealCalendar.find({
    userId: req.user._id,
    $or: [
      {
        'subscriptionPeriod.startDate': { $lte: end },
        'subscriptionPeriod.endDate': { $gte: start }
      }
    ]
  }).populate('calendarEntries.restaurantId', 'name cuisine phone address');

  // Collect all meals in the date range
  let allMeals = [];
  
  calendars.forEach(calendar => {
    const mealsInRange = calendar.getMealsForDateRange(start, end);
    allMeals = allMeals.concat(mealsInRange.map(meal => ({
      ...meal.toObject(),
      calendarId: calendar._id,
      subscriptionPeriod: calendar.subscriptionPeriod
    })));
  });

  // Sort by date and meal type
  allMeals.sort((a, b) => {
    const dateCompare = new Date(a.date) - new Date(b.date);
    if (dateCompare !== 0) return dateCompare;
    
    // Sort by meal type: breakfast, lunch, dinner
    const mealOrder = { breakfast: 1, lunch: 2, dinner: 3 };
    return mealOrder[a.mealType] - mealOrder[b.mealType];
  });

  res.status(200).json({
    success: true,
    data: {
      dateRange: { startDate: start, endDate: end },
      meals: allMeals,
      totalMeals: allMeals.length,
      calendarsFound: calendars.length
    }
  });
  
  } catch (error) {
    console.error('Error getting meal calendar range:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get meal calendar range',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Update meal status
 * @route   PATCH /api/v1/meal-calendar/meals/:mealId/status
 * @access  Private (Customer only)
 */
const updateMealStatus = async (req, res) => {
  try {
  const { mealId } = req.params;
  const { status } = req.body;

  if (!status || !['scheduled', 'preparing', 'ready', 'delivered', 'cancelled'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Valid status is required'
    });
  }

  // Find the calendar containing this meal
  const calendar = await UserMealCalendar.findOne({
    userId: req.user._id,
    'calendarEntries._id': mealId
  });

  if (!calendar) {
    return res.status(404).json({
      success: false,
      message: 'Meal not found'
    });
  }

  // Update meal status
  await calendar.updateMealStatus(mealId, status);

  // Get updated meal
  const updatedMeal = calendar.calendarEntries.id(mealId);

  res.status(200).json({
    success: true,
    message: 'Meal status updated successfully',
    data: {
      meal: updatedMeal,
      calendar: {
        totalMeals: calendar.totalMeals,
        deliveredMeals: calendar.deliveredMeals,
        progressPercentage: calendar.progressPercentage
      }
    }
  });
  
  } catch (error) {
    console.error('Error updating meal status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update meal status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get meal calendar statistics
 * @route   GET /api/v1/meal-calendar/stats
 * @access  Private (Customer only)
 */
const getMealCalendarStats = async (req, res) => {
  try {
  const { period = '30' } = req.query; // days
  
  const daysBack = parseInt(period);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);

  const calendars = await UserMealCalendar.find({
    userId: req.user._id,
    'subscriptionPeriod.endDate': { $gte: startDate }
  });

  let totalMeals = 0;
  let deliveredMeals = 0;
  let totalCost = 0;
  let mealsByType = { breakfast: 0, lunch: 0, dinner: 0 };
  let mealsByStatus = { scheduled: 0, preparing: 0, ready: 0, delivered: 0, cancelled: 0 };

  calendars.forEach(calendar => {
    totalMeals += calendar.totalMeals;
    deliveredMeals += calendar.deliveredMeals;
    totalCost += calendar.metadata.totalCost || 0;

    calendar.calendarEntries.forEach(meal => {
      const mealDate = new Date(meal.date);
      if (mealDate >= startDate) {
        mealsByType[meal.mealType]++;
        mealsByStatus[meal.status]++;
      }
    });
  });

  res.status(200).json({
    success: true,
    data: {
      period: `${daysBack} days`,
      summary: {
        totalMeals,
        deliveredMeals,
        totalCost,
        deliveryRate: totalMeals > 0 ? Math.round((deliveredMeals / totalMeals) * 100) : 0,
        activeSubscriptions: calendars.filter(c => c.isActive).length
      },
      breakdown: {
        mealsByType,
        mealsByStatus
      }
    }
  });
  
  } catch (error) {
    console.error('Error getting meal calendar stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get meal calendar statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getUserMealCalendar,
  getSubscriptionStatus,
  getMealCalendarRange,
  updateMealStatus,
  getMealCalendarStats
};
