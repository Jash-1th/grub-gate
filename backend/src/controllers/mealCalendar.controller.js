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

    // Populate restaurant details and order details (with items for price)
    await calendar.populate('calendarEntries.restaurantId', 'name cuisine phone address');
    await calendar.populate('calendarEntries.orderId', 'items price subtotal total');
    
    let meals = calendar.calendarEntries;
    
    // Attach price from Order items to each calendar entry
    meals = meals.map(meal => {
      // Safe object conversion - handle both Mongoose documents and plain objects
      const mealObj = typeof meal.toObject === 'function' ? meal.toObject() : JSON.parse(JSON.stringify(meal));
      
      // Extract price from Order if available
      if (meal.orderId && meal.orderId.items && Array.isArray(meal.orderId.items) && meal.orderId.items.length > 0) {
        // Get price from first item (subscription meals have 1 item per order)
        const firstItem = meal.orderId.items[0];
        mealObj.price = parseFloat(firstItem.price) || 0;
        mealObj.items = meal.orderId.items; // Attach items array for frontend
        console.log(`💰 Backend: Attached price $${mealObj.price} to meal "${meal.mealName}" from Order ${meal.orderId._id}`);
      } else if (meal.orderId && meal.orderId.subtotal) {
        // Fallback to order subtotal if items not available
        mealObj.price = parseFloat(meal.orderId.subtotal) || 0;
        console.log(`💰 Backend: Attached price $${mealObj.price} to meal "${meal.mealName}" from Order subtotal`);
      }
      
      return mealObj;
    });

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

    // Group meals by name and restaurant to calculate quantities
    console.log('🔍 Backend: Processing meals for grouping:', meals.length);
    const groupedMeals = {};
    meals.forEach((meal, index) => {
      // Convert date to consistent string format for grouping
      const dateStr = new Date(meal.date).toISOString().split('T')[0]; // YYYY-MM-DD format
      const mealKey = `${meal.mealName}-${meal.restaurantId}-${dateStr}-${meal.mealType}`;
      console.log(`🔍 Backend: Meal ${index + 1}: ${meal.mealName} (Key: ${mealKey})`);
      
      if (!groupedMeals[mealKey]) {
        // Safe object conversion - handle both Mongoose documents and plain objects
        const mealObj = typeof meal.toObject === 'function' ? meal.toObject() : JSON.parse(JSON.stringify(meal));
        groupedMeals[mealKey] = {
          ...mealObj,
          // Add restaurant name from populated data
          restaurant: meal.restaurantId?.name || mealObj.restaurantId,
          restaurantName: meal.restaurantId?.name || null,
          quantity: 0
        };
        console.log(`🆕 Backend: Created new group for: ${mealKey} with restaurant: ${meal.restaurantId?.name}`);
      }
      groupedMeals[mealKey].quantity++;
      console.log(`📊 Backend: Updated quantity for ${mealKey}: ${groupedMeals[mealKey].quantity}`);
    });
    
    // Convert grouped meals back to array
    const mealsWithQuantity = Object.values(groupedMeals);
    console.log('🎯 Backend: Final grouped meals:', mealsWithQuantity.length);
    console.log('🎯 Backend: Meals with quantities:', mealsWithQuantity.map(m => `${m.mealName}: ${m.quantity} from ${m.restaurant || m.restaurantName || 'Unknown'}`));

    // Calculate summary based on quantities
    const calculateSummaryWithQuantities = (meals) => {
      const totalMeals = meals.reduce((total, meal) => total + (meal.quantity || 1), 0);
      
      return {
        totalMeals,
        byStatus: {
          scheduled: meals.filter(m => m.status === 'scheduled').reduce((total, meal) => total + (meal.quantity || 1), 0),
          preparing: meals.filter(m => m.status === 'preparing').reduce((total, meal) => total + (meal.quantity || 1), 0),
          ready: meals.filter(m => m.status === 'ready').reduce((total, meal) => total + (meal.quantity || 1), 0),
          delivered: meals.filter(m => m.status === 'delivered').reduce((total, meal) => total + (meal.quantity || 1), 0),
          cancelled: meals.filter(m => m.status === 'cancelled').reduce((total, meal) => total + (meal.quantity || 1), 0)
        },
        byMealType: {
          breakfast: meals.filter(m => m.mealType === 'breakfast').reduce((total, meal) => total + (meal.quantity || 1), 0),
          lunch: meals.filter(m => m.mealType === 'lunch').reduce((total, meal) => total + (meal.quantity || 1), 0),
          dinner: meals.filter(m => m.mealType === 'dinner').reduce((total, meal) => total + (meal.quantity || 1), 0)
        }
      };
    };

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
        meals: mealsWithQuantity,
        summary: calculateSummaryWithQuantities(mealsWithQuantity)
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
      // Safe object conversion - handle both Mongoose documents and plain objects
      ...(typeof meal.toObject === 'function' ? meal.toObject() : JSON.parse(JSON.stringify(meal))),
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
