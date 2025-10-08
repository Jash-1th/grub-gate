const Order = require('../models/Order');
const MealPlan = require('../models/MealPlan');
const SubscriptionMealPlan = require('../models/SubscriptionMealPlan');
const Restaurant = require('../models/Restaurant');
const User = require('../models/User');
const { getNextSunday, getWeekDateRange } = require('../utils/dateHelpers');
const { generateAllSubscriptionOrders } = require('../services/enhancedOrderGenerationService');
const Subscription = require('../models/Subscription');
const MenuItem = require('../models/MenuItem');
const { validationResult } = require('express-validator');

// Get or create meal plan for user
const getMealPlan = async (req, res) => {
  try {
    const userId = req.user.id;
    const { subscriptionId, restaurantId, planType = 'bi-weekly' } = req.query;

    // Validate required parameters
    if (!subscriptionId || !restaurantId) {
      return res.status(400).json({
        status: 'error',
        message: 'Subscription ID and Restaurant ID are required'
      });
    }

    // Find or create meal plan
    const mealPlan = await SubscriptionMealPlan.findOrCreateForUser(
      userId, 
      subscriptionId, 
      restaurantId, 
      planType
    );

    // Populate related data
    await mealPlan.populate([
      { path: 'customerId', select: 'firstName lastName email phone' },
      { path: 'restaurantId', select: 'name cuisine rating address' },
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
        const menuItem = await MenuItem.findById(menuItemId);
        if (!menuItem) {
          return res.status(404).json({
            status: 'error',
            message: 'Menu item not found'
          });
        }

        // Add meal to plan
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
      { path: 'restaurantId', select: 'name cuisine rating address' },
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
      { path: 'restaurantId', select: 'name cuisine rating address' },
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
      { path: 'restaurantId', select: 'name cuisine rating address' },
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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user.id;
    const { 
      subscriptionId, 
      restaurantId, 
      planType = 'bi-weekly',
      deliveryAddress,
      specialInstructions,
      customerPhone 
    } = req.body;

    // 1. Get user's current meal plan
    const userMealPlan = await MealPlan.findOne({ userId }).populate('userId', 'firstName lastName email phone');
    
    if (!userMealPlan || !userMealPlan.weeklyPlans) {
      return res.status(404).json({
        status: 'error',
        message: 'No meal plan found. Please create a meal plan first.'
      });
    }

    // 2. Validate restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({
        status: 'error',
        message: 'Restaurant not found'
      });
    }

    // 3. Convert MealPlan data to SubscriptionMealPlan format
    const weeks = [];
    const today = new Date();
    
    // Process week0 and week1 from user's meal plan
    for (let weekIndex = 0; weekIndex < 2; weekIndex++) {
      const weekKey = `week${weekIndex}`;
      const weekData = userMealPlan.weeklyPlans[weekKey];
      
      if (weekData && Object.keys(weekData).length > 0) {
        // Use Sunday-based weeks (matches frontend logic)
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
              weekMeals[day].lunch = weekData[day].lunch.map(item => ({
                id: item.id || item._id?.toString() || new Date().getTime().toString(),
                planId: item.planId || new Date().getTime().toString(),
                menuItemId: item.id,
                name: item.name,
                price: item.price,
                restaurantName: item.restaurantName || restaurant.name,
                deliveryTime: '12:30', // Default lunch time
                specialInstructions: item.specialInstructions || '',
                description: item.description,
                image: item.image,
                category: item.category,
                dietaryPreferences: item.dietaryPreferences || [],
                spiceLevel: item.spiceLevel,
                prepTime: item.prepTime,
                servings: item.servings || 1,
                ingredients: item.ingredients || []
              }));
            }
            
            // Convert dinner items
            if (weekData[day].dinner && Array.isArray(weekData[day].dinner)) {
              weekMeals[day].dinner = weekData[day].dinner.map(item => ({
                id: item.id || item._id?.toString() || new Date().getTime().toString(),
                planId: item.planId || new Date().getTime().toString(),
                menuItemId: item.id,
                name: item.name,
                price: item.price,
                restaurantName: item.restaurantName || restaurant.name,
                deliveryTime: '19:30', // Default dinner time
                specialInstructions: item.specialInstructions || '',
                description: item.description,
                image: item.image,
                category: item.category,
                dietaryPreferences: item.dietaryPreferences || [],
                spiceLevel: item.spiceLevel,
                prepTime: item.prepTime,
                servings: item.servings || 1,
                ingredients: item.ingredients || []
              }));
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

    // 4. Create SubscriptionMealPlan
    const planStartDate = new Date(today);
    planStartDate.setHours(0, 0, 0, 0);
    const planEndDate = new Date(planStartDate);
    planEndDate.setDate(planStartDate.getDate() + (planType === 'bi-weekly' ? 14 : 30));

    const subscriptionMealPlan = new SubscriptionMealPlan({
      customerId: userId,
      restaurantId: restaurantId,
      subscriptionId: subscriptionId,
      planType: planType,
      planStartDate: planStartDate,
      planEndDate: planEndDate,
      weeks: weeks,
      deliveryAddress: deliveryAddress || {
        street: userMealPlan.userId.addresses?.[0]?.street || '',
        city: userMealPlan.userId.addresses?.[0]?.city || '',
        province: userMealPlan.userId.addresses?.[0]?.province || '',
        postalCode: userMealPlan.userId.addresses?.[0]?.postalCode || ''
      },
      customerPhone: customerPhone || userMealPlan.userId.phone,
      specialInstructions: specialInstructions || '',
      billingCycle: 'monthly',
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'active',
      generatedOrders: [],
      isOrdersGenerated: false
    });

    await subscriptionMealPlan.save();

    // 5. **GENERATE ALL ORDERS WITH REPETITION LOGIC**
    console.log(`🚀 Generating all orders for subscription with repetition logic...`);
    
    try {
      const generatedOrders = await generateAllSubscriptionOrders(subscriptionMealPlan);
      
      // Update subscription with order generation status
      subscriptionMealPlan.isOrdersGenerated = true;
      subscriptionMealPlan.generatedOrders = generatedOrders.map(order => order._id);
      await subscriptionMealPlan.save();
      
      console.log(`✅ Generated ${generatedOrders.length} orders for subscription`);
      
    } catch (orderError) {
      console.error('⚠️ Error generating orders:', orderError);
      // Don't fail the subscription creation if order generation fails
    }

    // 6. **CLEANUP: Remove the user's meal plan data**
    console.log(`🧹 Cleaning up meal plan data for user ${userId} after subscription creation...`);
    
    try {
      // Option A: Complete cleanup (remove entire meal plan)
      const deleteResult = await MealPlan.deleteOne({ userId: userId });
      console.log(`✅ Deleted meal plan for user ${userId}:`, deleteResult);
      
      // Alternative Option B: Selective cleanup (just clear the weekly plans)
      // await MealPlan.findOneAndUpdate(
      //   { userId: userId },
      //   { 
      //     $unset: { 
      //       'weeklyPlans.week0': 1,
      //       'weeklyPlans.week1': 1
      //     }
      //   }
      // );
      
    } catch (cleanupError) {
      console.error('⚠️ Error during meal plan cleanup:', cleanupError);
      // Don't fail the entire operation if cleanup fails
    }

    // 6. Populate and return the created subscription meal plan
    await subscriptionMealPlan.populate([
      { path: 'customerId', select: 'firstName lastName email phone' },
      { path: 'restaurantId', select: 'name cuisine rating address' }
    ]);

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

    let query = { restaurantId: { $in: restaurantIds } };
    if (status) {
      query.status = status;
    }

    const mealPlans = await SubscriptionMealPlan.find(query)
      .populate('customerId', 'firstName lastName email phone')
      .populate('restaurantId', 'name cuisine')
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
