const Order = require('../models/Order');
const MealPlan = require('../models/MealPlan');
const SubscriptionMealPlan = require('../models/SubscriptionMealPlan');
const UserMealCalendar = require('../models/UserMealCalendar');
const Restaurant = require('../models/Restaurant');
const User = require('../models/User');
const { getNextSunday, getSubscriptionStartSunday, getWeekDateRange } = require('../utils/dateHelpers');
const { generateAllSubscriptionOrders } = require('../services/enhancedOrderGenerationService');
const Subscription = require('../models/Subscription');
const MenuItem = require('../models/MenuItem');
const { validationResult } = require('express-validator');
const pushNotificationService = require('../services/pushNotificationService');
const { calculateNutritionTotalsFromItems } = require('../utils/nutritionTotals');

// Get or create meal plan for user (updated for multi-restaurant)
const getMealPlan = async (req, res) => {
  try {
    const userId = req.user.id;
    const { subscriptionId, planType = 'bi-weekly' } = req.query;

    // Validate required parameters
    if (!subscriptionId) {
      return res.status(400).json({
        status: 'error',
        message: 'Subscription ID is required'
      });
    }

    // Find or create meal plan (multi-restaurant version)
    const mealPlan = await SubscriptionMealPlan.findOrCreateForUser(
      userId, 
      subscriptionId, 
      null, // No single restaurantId - multi-restaurant support
      planType
    );

    // Populate related data (restaurants array instead of single restaurant)
    await mealPlan.populate([
      { path: 'customerId', select: 'firstName lastName email phone' },
      { path: 'restaurants.restaurantId', select: 'name cuisine rating address' },
      { path: 'subscriptionId' }
    ]);

    res.json({
      status: 'success',
      data: {
        mealPlan
      }
    });

  } catch (error) {
    console.error('Error getting meal plan:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get meal plan',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update meal plan (add/remove meals)
const updateMealPlan = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user.id;
    const { planId } = req.params;
    const { action, weekIndex, day, mealType, menuItemId, deliveryTime, planItemId } = req.body;

    // Find meal plan
    const mealPlan = await SubscriptionMealPlan.findOne({
      _id: planId,
      customerId: userId,
      status: 'active'
    });

    if (!mealPlan) {
      return res.status(404).json({
        status: 'error',
        message: 'Meal plan not found'
      });
    }

    let result;

    switch (action) {
      case 'add':
        // Validate required fields for add
        if (weekIndex === undefined || !day || !mealType || !menuItemId || !deliveryTime) {
          return res.status(400).json({
            status: 'error',
            message: 'Week index, day, meal type, menu item ID, and delivery time are required for add action'
          });
        }

        // Get menu item details
        const menuItem = await MenuItem.findById(menuItemId).populate('restaurantId', 'name');
        if (!menuItem) {
          return res.status(404).json({
            status: 'error',
            message: 'Menu item not found'
          });
        }

        // Add meal to plan (now includes restaurantId from menu item)
        result = await mealPlan.addMeal(weekIndex, day, mealType, menuItem, deliveryTime);
        break;

      case 'remove':
        // Validate required fields for remove
        if (weekIndex === undefined || !day || !mealType || !planItemId) {
          return res.status(400).json({
            status: 'error',
            message: 'Week index, day, meal type, and plan item ID are required for remove action'
          });
        }

        // Remove meal from plan
        result = await mealPlan.removeMeal(weekIndex, day, mealType, planItemId);
        break;

      case 'clearWeek':
        // Validate required fields for clear week
        if (weekIndex === undefined) {
          return res.status(400).json({
            status: 'error',
            message: 'Week index is required for clear week action'
          });
        }

        // Clear entire week
        result = await mealPlan.clearWeek(weekIndex);
        break;

      default:
        return res.status(400).json({
          status: 'error',
          message: 'Invalid action. Supported actions: add, remove, clearWeek'
        });
    }

    // Return updated meal plan
    await result.populate([
      { path: 'customerId', select: 'firstName lastName email phone' },
      { path: 'restaurants.restaurantId', select: 'name cuisine rating address' },
      { path: 'subscriptionId' }
    ]);

    res.json({
      status: 'success',
      message: `Meal plan ${action} completed successfully`,
      data: {
        mealPlan: result
      }
    });

  } catch (error) {
    console.error('Error updating meal plan:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update meal plan',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get meal plan by ID
const getMealPlanById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { planId } = req.params;

    const mealPlan = await SubscriptionMealPlan.findOne({
      _id: planId,
      customerId: userId
    }).populate([
      { path: 'customerId', select: 'firstName lastName email phone' },
      { path: 'restaurants.restaurantId', select: 'name cuisine rating address' },
      { path: 'subscriptionId' }
    ]);

    if (!mealPlan) {
      return res.status(404).json({
        status: 'error',
        message: 'Meal plan not found'
      });
    }

    res.json({
      status: 'success',
      data: {
        mealPlan
      }
    });

  } catch (error) {
    console.error('Error getting meal plan by ID:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get meal plan',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all active meal plans for user
const getUserMealPlans = async (req, res) => {
  try {
    const userId = req.user.id;

    const mealPlans = await SubscriptionMealPlan.getActiveForCustomer(userId);

    // Populate related data
    await SubscriptionMealPlan.populate(mealPlans, [
      { path: 'restaurants.restaurantId', select: 'name cuisine rating address' },
      { path: 'subscriptionId' }
    ]);

    res.json({
      status: 'success',
      data: {
        mealPlans,
        count: mealPlans.length
      }
    });

  } catch (error) {
    console.error('Error getting user meal plans:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get meal plans',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update meal plan status
const updateMealPlanStatus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user.id;
    const { planId } = req.params;
    const { status, reason } = req.body;

    const mealPlan = await SubscriptionMealPlan.findOne({
      _id: planId,
      customerId: userId
    });

    if (!mealPlan) {
      return res.status(404).json({
        status: 'error',
        message: 'Meal plan not found'
      });
    }

    // Validate status transition
    const validStatuses = ['active', 'paused', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status'
      });
    }

    mealPlan.status = status;
    
    if (status === 'cancelled' && reason) {
      mealPlan.specialInstructions = `Cancelled: ${reason}`;
    }

    await mealPlan.save();

    res.json({
      status: 'success',
      message: `Meal plan ${status} successfully`,
      data: {
        mealPlan
      }
    });

  } catch (error) {
    console.error('Error updating meal plan status:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update meal plan status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update delivery address
const updateDeliveryAddress = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user.id;
    const { planId } = req.params;
    const { street, city, province, postalCode, instructions } = req.body;

    const mealPlan = await SubscriptionMealPlan.findOne({
      _id: planId,
      customerId: userId
    });

    if (!mealPlan) {
      return res.status(404).json({
        status: 'error',
        message: 'Meal plan not found'
      });
    }

    mealPlan.deliveryAddress = {
      street,
      city,
      province,
      postalCode: postalCode.toUpperCase(),
      instructions: instructions || ''
    };

    await mealPlan.save();

    res.json({
      status: 'success',
      message: 'Delivery address updated successfully',
      data: {
        deliveryAddress: mealPlan.deliveryAddress
      }
    });

  } catch (error) {
    console.error('Error updating delivery address:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update delivery address',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get today's meals for partner dashboard
const getTodaysOrders = async (req, res) => {
  try {
    // Get restaurants owned by this partner
    const restaurants = await Restaurant.find({ ownerId: req.user._id }).select('_id');
    const restaurantIds = restaurants.map(r => r._id);
    
    if (restaurantIds.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No restaurants found for this partner'
      });
    }
    
    // For now, get orders for all partner's restaurants
    // In the future, you might want to filter by specific restaurant
    const allTodaysOrders = [];
    
    for (const restaurantId of restaurantIds) {
      const orders = await SubscriptionMealPlan.getTodaysOrdersForRestaurant(restaurantId);
      allTodaysOrders.push(...orders);
    }

    res.json({
      status: 'success',
      data: {
        orders: allTodaysOrders,
        count: allTodaysOrders.length,
        date: new Date().toISOString().split('T')[0]
      }
    });

  } catch (error) {
    console.error('Error getting today\'s orders:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get today\'s orders',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Create subscription meal plan from user's weekly meal plan (after payment)
const createSubscriptionFromMealPlan = async (req, res) => {
  try {
    console.log('🚀 ===== SUBSCRIPTION CREATION STARTED =====');
    console.log('🚀 Creating subscription meal plan from weekly meal plan...');

    const userId = req.user.id;
    const { 
      planType = 'bi-weekly',
      deliveryAddress,
      specialInstructions,
      customerPhone,
      // Billing information (no separate subscription needed)
      planName,
      monthlyPrice,
      features,
      paymentMethod = 'card'
    } = req.body;

    // 1. Get user's current meal plan
    const userMealPlan = await MealPlan.findOne({ userId }).populate('userId', 'firstName lastName email phone');
    
    if (!userMealPlan || !userMealPlan.weeklyPlans) {
      return res.status(404).json({
        status: 'error',
        message: 'No meal plan found. Please create a meal plan first.'
      });
    }

    // 2. Collect distinct restaurants from user's meal plan items
    // For multi-restaurant support, we will derive restaurants from meal items
    const restaurantMap = new Map();
    const addRestaurantIfMissing = (item) => {
      if (item && item.restaurantId) {
        const id = item.restaurantId._id ? item.restaurantId._id.toString() : item.restaurantId.toString();
        if (!restaurantMap.has(id)) {
          restaurantMap.set(id, {
            _id: id,
            name: item.restaurantName || (item.restaurantId.name || ''),
          });
        }
      }
    };

    // 3. Check for subscription overlap
    const subscriptionStartDate = getSubscriptionStartSunday();
    const subscriptionEndDate = new Date(subscriptionStartDate);
    
    // Calculate end date based on plan type
    if (planType === 'bi-weekly') {
      subscriptionEndDate.setDate(subscriptionStartDate.getDate() + 14); // 2 weeks
    } else if (planType === 'monthly') {
      subscriptionEndDate.setDate(subscriptionStartDate.getDate() + 30); // 30 days
    } else if (planType === '3-months') {
      subscriptionEndDate.setDate(subscriptionStartDate.getDate() + 90); // 90 days
    }

    console.log('🔍 Checking subscription overlap for period:', {
      startDate: subscriptionStartDate,
      endDate: subscriptionEndDate,
      planType
    });

    const existingOverlap = await UserMealCalendar.checkSubscriptionOverlap(
      userId, 
      subscriptionStartDate, 
      subscriptionEndDate
    );

    if (existingOverlap) {
      console.log('❌ Subscription overlap detected:', existingOverlap);
      return res.status(409).json({
        status: 'error',
        message: 'You already have an active subscription for this period',
        data: {
          conflictPeriod: existingOverlap.subscriptionPeriod,
          conflictId: existingOverlap._id,
          planType: existingOverlap.subscriptionPeriod.planType
        }
      });
    }

    console.log('✅ No subscription overlap detected - proceeding with creation');

    // 4. Convert MealPlan data to SubscriptionMealPlan format
    const weeks = [];
    const today = new Date();
    
    // Process week0 and week1 from user's meal plan
    for (let weekIndex = 0; weekIndex < 2; weekIndex++) {
      const weekKey = `week${weekIndex}`;
      const weekData = userMealPlan.weeklyPlans[weekKey];
      
      if (weekData && Object.keys(weekData).length > 0) {
        console.log(`🔍 DEBUG - Processing ${weekKey} data:`, JSON.stringify(weekData, null, 2));
        
        // Use Sunday-based weeks starting from next Sunday (matches frontend logic)
        const { startDate: weekStartDate, endDate: weekEndDate } = getWeekDateRange(weekIndex, today);

        const weekMeals = {};
        const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        
        // Convert each day's meals
        for (const day of daysOfWeek) {
          weekMeals[day] = {
            lunch: [],
            dinner: []
          };
          
          if (weekData[day]) {
            // Convert lunch items
            if (weekData[day].lunch && Array.isArray(weekData[day].lunch)) {
              weekMeals[day].lunch = weekData[day].lunch.map(item => {
                // Convert Mongoose document to plain object
                const plainItem = item.toObject ? item.toObject() : item;
                
                console.log('🔍 DEBUG - Lunch item (plain object):', {
                  name: plainItem.name,
                  hasMenuItemId: !!plainItem.menuItemId,
                  has_id: !!plainItem._id,
                  hasId: !!plainItem.id,
                  allKeys: Object.keys(plainItem)
                });
                
                // Try multiple fields to find the menu item ID (strict - no fallbacks)
                const menuItemId = plainItem.menuItemId || plainItem._id || plainItem.id;
                
                if (!menuItemId) {
                  console.error('⚠️ Missing menuItemId for lunch item:', plainItem);
                  console.error('💡 Run the database fix script: node fix-meal-plan-menuitemids.js');
                  throw new Error(`Missing menuItemId for lunch item: ${plainItem.name || 'Unknown item'}. Please run the database migration script.`);
                }
                
                // Add restaurant to map for multi-restaurant support
                addRestaurantIfMissing(plainItem);
                
                return {
                id: plainItem.id || plainItem._id?.toString() || new Date().getTime().toString(),
                planId: plainItem.planId || new Date().getTime().toString(),
                menuItemId: menuItemId, // Use the found menuItemId
                restaurantId: plainItem.restaurantId ? (plainItem.restaurantId._id || plainItem.restaurantId) : null, // Include restaurantId
                name: plainItem.name,
                price: plainItem.price,
                restaurantName: plainItem.restaurantName,
                deliveryTime: '12:30', // Default lunch time
                specialInstructions: plainItem.specialInstructions || '',
                description: plainItem.description,
                image: plainItem.image,
                category: plainItem.category,
                dietaryPreferences: plainItem.dietaryPreferences || [],
                spiceLevel: plainItem.spiceLevel,
                prepTime: plainItem.prepTime,
                servings: plainItem.servings || 1,
                ingredients: plainItem.ingredients || [],
                allergens: plainItem.allergens || [],
                nutritionInfo: plainItem.nutritionInfo || plainItem.nutritionalInfo || {}
                };
              });
            }
            
            // Convert dinner items
            if (weekData[day].dinner && Array.isArray(weekData[day].dinner)) {
              weekMeals[day].dinner = weekData[day].dinner.map(item => {
                // Convert Mongoose document to plain object
                const plainItem = item.toObject ? item.toObject() : item;
                
                console.log('🔍 DEBUG - Dinner item (plain object):', {
                  name: plainItem.name,
                  hasMenuItemId: !!plainItem.menuItemId,
                  has_id: !!plainItem._id,
                  hasId: !!plainItem.id,
                  allKeys: Object.keys(plainItem)
                });
                
                // Try multiple fields to find the menu item ID (strict - no fallbacks)
                const menuItemId = plainItem.menuItemId || plainItem._id || plainItem.id;
                
                if (!menuItemId) {
                  console.error('⚠️ Missing menuItemId for dinner item:', plainItem);
                  console.error('💡 Run the database fix script: node fix-meal-plan-menuitemids.js');
                  throw new Error(`Missing menuItemId for dinner item: ${plainItem.name || 'Unknown item'}. Please run the database migration script.`);
                }
                
                // Add restaurant to map for multi-restaurant support
                addRestaurantIfMissing(plainItem);
                
                return {
                id: plainItem.id || plainItem._id?.toString() || new Date().getTime().toString(),
                planId: plainItem.planId || new Date().getTime().toString(),
                menuItemId: menuItemId, // Use the found menuItemId
                restaurantId: plainItem.restaurantId ? (plainItem.restaurantId._id || plainItem.restaurantId) : null, // Include restaurantId
                name: plainItem.name,
                price: plainItem.price,
                restaurantName: plainItem.restaurantName,
                deliveryTime: '19:30', // Default dinner time
                specialInstructions: plainItem.specialInstructions || '',
                description: plainItem.description,
                image: plainItem.image,
                category: plainItem.category,
                dietaryPreferences: plainItem.dietaryPreferences || [],
                spiceLevel: plainItem.spiceLevel,
                prepTime: plainItem.prepTime,
                servings: plainItem.servings || 1,
                ingredients: plainItem.ingredients || [],
                allergens: plainItem.allergens || [],
                nutritionInfo: plainItem.nutritionInfo || plainItem.nutritionalInfo || {}
                };
              });
            }
          }
        }

        weeks.push({
          weekNumber: weekIndex + 1,
          weekStartDate: weekStartDate,
          weekEndDate: weekEndDate,
          meals: weekMeals
        });
      }
    }

    if (weeks.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No meal data found in your weekly plan. Please add some meals first.'
      });
    }
    
    // Validate we have at least one restaurant
    const restaurantList = Array.from(restaurantMap.values());
    if (restaurantList.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No restaurants found in your meal plan. Please ensure your meals have restaurant information.'
      });
    }

    if (!req.user?.isGrubPass && restaurantList.length > 2) {
      return res.status(400).json({
        status: 'error',
        message: 'Maximum 2 restaurants allowed per meal plan'
      });
    }
    
    console.log(`📊 Found ${restaurantList.length} restaurants in meal plan:`, restaurantList.map(r => r.name));

    // 4. Create SubscriptionMealPlan using UTC dates with proper planning time
    const subscriptionStartSunday = getSubscriptionStartSunday(today);  // Always gives proper notice
    const planStartDate = subscriptionStartSunday;  // Use the UTC date directly
    
    // DEBUG: Log the calculated dates
    console.log('🔍 DEBUG - Date Calculation:');
    console.log('  Today:', today.toISOString());
    console.log('  Calculated Start Date:', planStartDate.toISOString());
    console.log('  Expected: 2025-10-19 (Sunday)');
    console.log('  Function Used: getSubscriptionStartSunday');
    
    // Calculate plan end date using UTC
    // For monthly plans, we want 30 full days (Oct 19 to Nov 18 inclusive)
    const planDurationDays = planType === 'bi-weekly' ? 14 : planType === 'quarterly' ? 90 : 30;
    const planEndDate = new Date(Date.UTC(
      planStartDate.getUTCFullYear(),
      planStartDate.getUTCMonth(),
      planStartDate.getUTCDate() + planDurationDays, 
      23, 59, 59, 999
    ));

    console.log('📆 Plan Duration Calculation:');
    console.log('  Plan Type:', planType);
    console.log('  Duration Days:', planDurationDays);
    console.log('  Start Date:', planStartDate.toISOString().split('T')[0]);
    console.log('  End Date:', planEndDate.toISOString().split('T')[0]);
    console.log('  Calculation: Oct 19 + 30 days =', planEndDate.toISOString().split('T')[0]);

    // Calculate next billing date based on plan end date (not today)
    const nextBillingDate = new Date(planEndDate);
    nextBillingDate.setDate(planEndDate.getDate() + 1); // Day after plan ends

    // Calculate weekStartDates using UTC for the entire subscription duration
    const weekStartDates = [];
    const totalDays = Math.ceil((planEndDate - planStartDate) / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.ceil(totalDays / 7);
    
    for (let i = 0; i < totalWeeks; i++) {
      const weekStart = new Date(Date.UTC(
        planStartDate.getUTCFullYear(),
        planStartDate.getUTCMonth(),
        planStartDate.getUTCDate() + (i * 7),
        0, 0, 0, 0
      ));
      weekStartDates.push(weekStart);
    }

    // Create restaurants array for the subscription
    const restaurantsArray = restaurantList.map(restaurant => ({
      restaurantId: restaurant._id,
      restaurantName: restaurant.name,
      totalMeals: 0, // Will be calculated in pre-save middleware
      totalValue: 0, // Will be calculated in pre-save middleware
      addedAt: new Date()
    }));
    
    const subscriptionMealPlan = new SubscriptionMealPlan({
      customerId: userId,
      restaurants: restaurantsArray, // Use restaurants array instead of single restaurantId
      // No separate subscriptionId - this IS the subscription
      planType: planType,
      planStartDate: planStartDate,
      planEndDate: planEndDate,
      weekStartDates: weekStartDates,
      weeks: weeks,
      deliveryAddress: deliveryAddress || {
        street: userMealPlan.userId.addresses?.[0]?.street || '',
        city: userMealPlan.userId.addresses?.[0]?.city || '',
        province: userMealPlan.userId.addresses?.[0]?.province || '',
        postalCode: userMealPlan.userId.addresses?.[0]?.postalCode || ''
      },
      customerPhone: customerPhone || userMealPlan.userId.phone,
      specialInstructions: specialInstructions || '',
      // Billing information integrated directly
      billingCycle: planType,
      nextBillingDate: nextBillingDate,
      autoRenew: true,
      status: 'active',
      generatedOrders: [],
      isOrdersGenerated: false,
      // Store plan details for billing (use first restaurant or combined)
      selectedRestaurantName: restaurantList.length === 1 ? restaurantList[0].name : `${restaurantList.length} Restaurants`,
      selectedRestaurantData: {
        name: restaurantList.length === 1 ? restaurantList[0].name : `${restaurantList.length} Restaurants`,
        planName: planName,
        monthlyPrice: monthlyPrice,
        features: features,
        paymentMethod: paymentMethod
      }
    });

    await subscriptionMealPlan.save();

    // 5. **GENERATE ALL ORDERS WITH REPETITION LOGIC**
    console.log(`🚀 Generating all orders for subscription with repetition logic...`);
    
    let generatedOrders = []; // Declare outside try-catch so it's accessible later
    
    try {
      generatedOrders = await generateAllSubscriptionOrders(subscriptionMealPlan);
      
      // Update subscription with order generation status
      subscriptionMealPlan.isOrdersGenerated = true;
      subscriptionMealPlan.generatedOrders = generatedOrders.map(order => order._id);
      await subscriptionMealPlan.save();
      
      console.log(`✅ Generated ${generatedOrders.length} orders for subscription`);
      
    } catch (orderError) {
      console.error('⚠️ Error generating orders:', orderError);
      // Don't fail the subscription creation if order generation fails
    }

    // 6. Create User Meal Calendar
    console.log('📅 Creating user meal calendar...');
    
    try {
      // Create calendar entries from generated orders
      const calendarEntries = [];
      
      if (generatedOrders && generatedOrders.length > 0) {
        console.log('🔍 DEBUG: First generated order structure:', JSON.stringify(generatedOrders[0], null, 2));
        
        for (const order of generatedOrders) {
          console.log('🔍 DEBUG: Processing order deliveryTime:', order.deliveryTime, 'Type:', typeof order.deliveryTime);
          
          // Convert string deliveryTime to object format expected by schema
          let deliveryTimeObj;
          if (typeof order.deliveryTime === 'string') {
            const time = order.deliveryTime;
            const [hours, minutes] = time.split(':');
            const startTime = `${hours}:${minutes}`;
            const endHour = parseInt(hours) + 1; // 1 hour delivery window
            const endTime = `${endHour.toString().padStart(2, '0')}:${minutes}`;
            
            deliveryTimeObj = {
              start: startTime,
              end: endTime
            };
          } else if (order.deliveryTime && typeof order.deliveryTime === 'object') {
            // Check if it has start/end properties
            if (order.deliveryTime.start && order.deliveryTime.end) {
              deliveryTimeObj = order.deliveryTime;
            } else if (order.deliveryTime.estimated) {
              // Convert estimated time to start/end format
              console.log('🔍 DEBUG: Converting estimated time to start/end format');
              const estimatedDate = new Date(order.deliveryTime.estimated);
              const startHour = estimatedDate.getUTCHours();
              const startMinute = estimatedDate.getUTCMinutes();
              const endHour = startHour + 1; // 1 hour delivery window
              
              deliveryTimeObj = {
                start: `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`,
                end: `${endHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`
              };
              console.log('✅ DEBUG: Converted estimated time:', order.deliveryTime.estimated, '→', deliveryTimeObj);
            } else {
              // Object but no valid properties, use fallback
              console.log('⚠️ DEBUG: Object deliveryTime but no valid properties, using fallback');
              const isMorning = order.mealType === 'lunch' || order.mealType === 'breakfast';
              deliveryTimeObj = {
                start: isMorning ? '12:00' : '19:00',
                end: isMorning ? '13:00' : '20:00'
              };
            }
          } else {
            // Fallback if deliveryTime is missing or invalid
            console.log('⚠️ DEBUG: No valid deliveryTime found, using fallback based on mealType');
            const isMorning = order.mealType === 'lunch' || order.mealType === 'breakfast';
            deliveryTimeObj = {
              start: isMorning ? '12:00' : '19:00',
              end: isMorning ? '13:00' : '20:00'
            };
          }

          // Create calendar entry for each item in the order (handles quantities)
          if (order.items && order.items.length > 0) {
            order.items.forEach((item, itemIndex) => {
              calendarEntries.push({
                date: order.scheduledDate,
                mealType: order.mealType,
                mealName: item.name || 'Meal',
                restaurantId: order.restaurantId,
                status: order.status,
                deliveryTime: deliveryTimeObj,
                orderId: order._id,
                itemId: item._id || `${order._id}-${itemIndex}`,
                nutritionInfo: item.nutritionInfo || item.nutritionalInfo || {}
              });
            });
          } else {
            // Fallback for orders without items
            calendarEntries.push({
              date: order.scheduledDate,
              mealType: order.mealType,
              mealName: 'Meal',
              restaurantId: order.restaurantId,
          status: order.status,
          deliveryTime: deliveryTimeObj,
          orderId: order._id,
          nutritionInfo: {}
            });
          }
        }
      }

      const calendarNutritionTotals = calculateNutritionTotalsFromItems(calendarEntries);

      // Create the meal calendar
      const mealCalendar = new UserMealCalendar({
        userId: userId,
        subscriptionId: subscriptionMealPlan._id,
        weeklyPlanId: userMealPlan._id,
        calendarEntries: calendarEntries,
        subscriptionPeriod: {
          startDate: subscriptionStartDate,
          endDate: subscriptionEndDate,
          planType: planType
        },
        isActive: true,
        metadata: {
          totalCost: monthlyPrice || 0,
          currency: 'USD',
          timezone: 'UTC',
          totalNutrition: calendarNutritionTotals
        }
      });

      await mealCalendar.save();
      
      console.log(`✅ Created meal calendar successfully!`);
      console.log(`📅 Calendar ID: ${mealCalendar._id}`);
      console.log(`🍽️ Total entries: ${calendarEntries.length}`);
      console.log(`📊 Subscription period: ${subscriptionStartDate} to ${subscriptionEndDate}`);
      
    } catch (calendarError) {
      console.error('⚠️ Error creating meal calendar:', calendarError);
      console.error('⚠️ Calendar error details:', calendarError.message);
      if (calendarError.errors) {
        console.error('⚠️ Validation errors:', calendarError.errors);
      }
      // Don't fail the subscription creation if calendar creation fails
    }

    // 7. **CLEANUP: Remove the user's meal plan data**
    console.log(`🧹 Cleaning up meal plan data for user ${userId} after subscription creation...`);
    
    try {
      // Option A: Complete cleanup (remove entire meal plan)
      const deleteResult = await MealPlan.deleteOne({ userId: userId });
      console.log(`✅ Deleted meal plan for user ${userId}:`, deleteResult);
      
      if (deleteResult.deletedCount === 0) {
        console.log(`⚠️ No meal plan found to delete for user ${userId}`);
        console.log(`   This might indicate the meal plan was already deleted or doesn't exist`);
      } else {
        console.log(`✅ Successfully deleted ${deleteResult.deletedCount} meal plan(s) for user ${userId}`);
      }
      
    } catch (cleanupError) {
      console.error('⚠️ Error during meal plan cleanup:', cleanupError);
      console.error('⚠️ Cleanup error details:', cleanupError.message);
      // Don't fail the entire operation if cleanup fails
    }

    // 6. Populate and return the created subscription meal plan
    await subscriptionMealPlan.populate([
      { path: 'customerId', select: 'firstName lastName email phone' },
      { path: 'restaurants.restaurantId', select: 'name cuisine rating address' }
    ]);

    // 7. **SEND PUSH NOTIFICATIONS TO PARTNER RESTAURANTS**
    console.log('📱 Sending subscription notifications to partner restaurants...');
    console.log('📊 DEBUG: generatedOrders length:', generatedOrders?.length);
    console.log('📊 DEBUG: subscriptionMealPlan._id:', subscriptionMealPlan._id);
    
    try {
      await sendSubscriptionNotificationsToPartners(subscriptionMealPlan, generatedOrders);
      console.log('✅ Successfully sent subscription notifications to partners');
    } catch (notificationError) {
      console.error('⚠️ Error sending partner notifications:', notificationError);
      console.error('⚠️ Error stack:', notificationError.stack);
      // Don't fail the subscription creation if notifications fail
    }

    res.status(201).json({
      status: 'success',
      message: 'Subscription meal plan created successfully! Your weekly meal plan has been converted to a subscription.',
      data: {
        subscriptionMealPlan,
        weeksCreated: weeks.length,
        cleanupPerformed: true
      }
    });

  } catch (error) {
    console.error('Error creating subscription from meal plan:', error);
    
    // IMPORTANT: DO NOT delete meal plan if subscription creation failed
    // User needs to keep their meal plan to try subscription creation again
    console.log(`🛡️ PRESERVING meal plan for user ${userId} after subscription error`);
    console.log(`   User can fix any issues and retry subscription creation`);
    console.log(`   Meal plan will be cleaned up only after successful subscription creation`);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to create subscription meal plan',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get meal plans for restaurant (partner dashboard)
const getRestaurantMealPlans = async (req, res) => {
  try {
    // Get restaurants owned by this partner
    const restaurants = await Restaurant.find({ ownerId: req.user._id }).select('_id');
    const restaurantIds = restaurants.map(r => r._id);
    
    if (restaurantIds.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No restaurants found for this partner'
      });
    }
    
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = { 'restaurants.restaurantId': { $in: restaurantIds } };
    if (status) {
      query.status = status;
    }

    const mealPlans = await SubscriptionMealPlan.find(query)
      .populate('customerId', 'firstName lastName email phone')
      .populate('restaurants.restaurantId', 'name cuisine')
      .populate('subscriptionId')
      .sort({ planStartDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await SubscriptionMealPlan.countDocuments(query);

    res.json({
      status: 'success',
      data: {
        mealPlans,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error getting restaurant meal plans:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get meal plans',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Send push notifications to partner restaurants about new subscription
 */
const sendSubscriptionNotificationsToPartners = async (subscriptionMealPlan, generatedOrders) => {
  try {
    console.log('📱 Processing subscription notifications for partners...');
    console.log('📊 Generated orders count:', generatedOrders?.length || 0);
    
    // Get customer info
    const customer = subscriptionMealPlan.customerId;
    const customerName = customer ? 
      `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Customer' : 
      'Customer';
    
    console.log('👤 Customer name:', customerName);
    
    // Get unique restaurants from generated orders
    const restaurantMap = new Map();
    
    // Extract restaurants from generated orders
    if (generatedOrders && generatedOrders.length > 0) {
      console.log('🔍 Processing generated orders to find restaurants...');
      console.log('📦 Sample order structure:', JSON.stringify({
        _id: generatedOrders[0]._id,
        restaurantId: generatedOrders[0].restaurantId,
        total: generatedOrders[0].total,
        items: generatedOrders[0].items?.map(i => ({ name: i.name, price: i.price }))
      }, null, 2));
      
      for (let i = 0; i < generatedOrders.length; i++) {
        const order = generatedOrders[i];
        console.log(`\n📦 Processing order ${i + 1}/${generatedOrders.length}:`);
        console.log(`   Order ID: ${order._id}`);
        console.log(`   Restaurant ID: ${order.restaurantId}`);
        console.log(`   Total: ₹${order.total || 0}`);
        console.log(`   Items count: ${order.items?.length || 0}`);
        
        const restaurantId = order.restaurantId ? order.restaurantId.toString() : null;
        
        if (!restaurantId) {
          console.log('   ⚠️ Order missing restaurantId!');
          continue;
        }
        
        console.log(`   ✅ Valid restaurant ID: ${restaurantId}`);
        
        // Initialize restaurant data if not exists
        if (!restaurantMap.has(restaurantId)) {
          console.log(`   🆕 First order for this restaurant, initializing data`);
          restaurantMap.set(restaurantId, {
            restaurantId: restaurantId,
            orderCount: 0,
            totalAmount: 0,
            items: []
          });
        }
        
        // Update restaurant data
        const data = restaurantMap.get(restaurantId);
        data.orderCount++;
        data.totalAmount += order.total || 0;
        
        console.log(`   📊 Updated stats - Orders: ${data.orderCount}, Total: ₹${data.totalAmount.toFixed(2)}`);
        
        // Collect item names
        if (order.items && order.items.length > 0) {
          order.items.forEach(item => {
            if (item.name && !data.items.includes(item.name)) {
              data.items.push(item.name);
              console.log(`   🍽️ Added item: ${item.name}`);
            }
          });
        }
      }
    } else {
      console.log('⚠️ No generated orders found, cannot send notifications');
      return;
    }
    
    console.log(`📊 Found ${restaurantMap.size} unique restaurant(s) in subscription`);
    
    // Send notification to each restaurant owner
    console.log('🔄 Starting to send notifications to restaurant owners...');
    
    for (const [restaurantId, data] of restaurantMap) {
      try {
        console.log(`\n🏪 Processing restaurant: ${restaurantId}`);
        console.log(`   📊 Order count: ${data.orderCount}`);
        console.log(`   💰 Total amount: ₹${data.totalAmount.toFixed(2)}`);
        
        // Get restaurant with owner info
        console.log(`   🔍 Fetching restaurant details from database...`);
        const restaurant = await Restaurant.findById(restaurantId).populate('ownerId');
        
        if (!restaurant) {
          console.log(`   ❌ Restaurant not found in database: ${restaurantId}`);
          continue;
        }
        
        console.log(`   ✅ Restaurant found: ${restaurant.name}`);
        console.log(`   🔍 Checking for owner...`);
        
        if (!restaurant.ownerId) {
          console.log(`   ❌ Restaurant ${restaurant.name} has no ownerId field`);
          console.log(`   📋 Restaurant data:`, JSON.stringify(restaurant, null, 2));
          continue;
        }
        
        const ownerId = restaurant.ownerId._id;
        const restaurantName = restaurant.name;
        
        console.log(`   ✅ Owner found: ${ownerId}`);
        console.log(`   👤 Owner email: ${restaurant.ownerId.email}`);
        console.log(`   📱 Owner FCM tokens count: ${restaurant.ownerId.fcmTokens?.length || 0}`);
        
        // Get subscription duration based on plan type
        let durationText = '';
        if (subscriptionMealPlan.planType === 'bi-weekly') {
          durationText = '2 weeks';
        } else if (subscriptionMealPlan.planType === 'monthly') {
          durationText = '1 month';
        } else {
          // Fallback to calculated duration
          const startDate = new Date(subscriptionMealPlan.planStartDate);
          const endDate = new Date(subscriptionMealPlan.planEndDate);
          const durationWeeks = Math.ceil((endDate - startDate) / (7 * 24 * 60 * 60 * 1000));
          durationText = `${durationWeeks} weeks`;
        }
        
        console.log(`   📅 Subscription duration: ${durationText}`);
        console.log(`   📅 Plan type: ${subscriptionMealPlan.planType}`);
        console.log(`   📅 Start date: ${subscriptionMealPlan.planStartDate}`);
        console.log(`   📅 End date: ${subscriptionMealPlan.planEndDate}`);
        
        // Create notification message
        const notification = {
          title: '🎉 New Subscription Customer!',
          body: `${customerName} subscribed for ${durationText}! ${data.orderCount} orders scheduled (₹${data.totalAmount.toFixed(2)})`,
          icon: '/icons/subscription-icon.png',
          requireInteraction: false
        };
        
        const notificationData = {
          type: 'NEW_SUBSCRIPTION',
          subscriptionId: subscriptionMealPlan._id.toString(),
          customerId: customer._id.toString(),
          customerName: customerName,
          restaurantId: restaurantId,
          restaurantName: restaurantName,
          orderCount: String(data.orderCount),
          totalAmount: String(data.totalAmount),
          duration: durationText,
          planType: subscriptionMealPlan.planType,
          startDate: new Date(subscriptionMealPlan.planStartDate).toISOString(),
          endDate: new Date(subscriptionMealPlan.planEndDate).toISOString(),
          action: 'view_subscriptions'
        };
        
        console.log(`   📝 Notification message:`, notification);
        console.log(`   📝 Notification data:`, notificationData);
        
        // Send notification to restaurant owner
        console.log(`   📤 Calling pushNotificationService.sendToUser...`);
        
        const result = await pushNotificationService.sendToUser(
          ownerId,
          notification,
          notificationData
        );
        
        console.log(`   📥 Push service result:`, result);
        
        if (result.success) {
          console.log(`   ✅ Notification sent to ${restaurantName} successfully`);
        } else {
          console.log(`   ⚠️ Failed to send notification to ${restaurantName}`);
          console.log(`   ⚠️ Error:`, result.error);
        }
        
      } catch (restaurantError) {
        console.error(`   ❌ Error sending notification for restaurant ${restaurantId}:`);
        console.error(`   ❌ Error message:`, restaurantError.message);
        console.error(`   ❌ Error stack:`, restaurantError.stack);
        // Continue with other restaurants
      }
    }
    
    console.log(`\n✅ Completed sending notifications to ${restaurantMap.size} restaurant(s)`);
    
  } catch (error) {
    console.error('❌ Error in sendSubscriptionNotificationsToPartners:', error);
    throw error;
  }
};

module.exports = {
  getMealPlan,
  updateMealPlan,
  getMealPlanById,
  getUserMealPlans,
  updateMealPlanStatus,
  updateDeliveryAddress,
  getTodaysOrders,
  createSubscriptionFromMealPlan,
  getRestaurantMealPlans
};
