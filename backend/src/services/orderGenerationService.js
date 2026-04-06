// FILE: src/services/orderGenerationService.js
const Order = require('../models/Order');
const MealPlan = require('../models/MealPlan');
const SubscriptionMealPlan = require('../models/SubscriptionMealPlan');
const Restaurant = require('../models/Restaurant');
const User = require('../models/User');
const { findSubscriptionDayForDate } = require('../utils/dateHelpers');
const { calculateOrderTotals } = require('../utils/pricingCalculator');

/**
 * Generate daily orders from subscription meal plans
 */
const generateDailyOrdersFromSubscriptions = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  
  console.log(`Generating subscription orders for ${today.toDateString()}...`);
  
  try {
    // Find all active subscription meal plans for today
    const activeSubscriptionPlans = await SubscriptionMealPlan.find({
      status: 'active',
      planStartDate: { $lte: today },
      planEndDate: { $gte: today }
    }).populate('customerId', 'firstName lastName email phone addresses')
      .populate('restaurantId', 'name _id');
    
    console.log(`Found ${activeSubscriptionPlans.length} active subscription plans`);
    
    let ordersCreated = 0;
    let errors = [];
    
    for (const subscriptionPlan of activeSubscriptionPlans) {
      try {
        // Check if orders already generated for today
        const existingOrdersToday = await Order.find({
          customerId: subscriptionPlan.customerId._id,
          restaurantId: subscriptionPlan.restaurantId._id,
          type: 'weekly-plan',
          createdAt: { $gte: today, $lt: tomorrow }
        });
        
        if (existingOrdersToday.length > 0) {
          console.log(`Orders already exist for customer ${subscriptionPlan.customerId._id} today`);
          continue;
        }
        
        // Get today's meals from the subscription plan
        const todaysMeals = subscriptionPlan.getTodaysMeals();
        
        if (todaysMeals.length === 0) {
          console.log(`No meals scheduled for customer ${subscriptionPlan.customerId._id} today`);
          continue;
        }
        
        // Create orders for each meal
        for (const meal of todaysMeals) {
          try {
            // Calculate order totals using unified pricing calculator
            const itemTotal = meal.item.price || 0;
            
            const pricing = calculateOrderTotals({
              items: [{ price: itemTotal, quantity: 1 }],
              restaurantDeliveryFee: null,
              planType: 'single'
            });
            
            // Generate unique order number
            const orderNumber = `GG${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}${String(Date.now()).slice(-6)}`;
            
            const newOrder = await Order.create({
              orderNumber: orderNumber,
              customerId: subscriptionPlan.customerId._id,
              restaurantId: subscriptionPlan.restaurantId._id,
              type: 'weekly-plan',
              mealType: meal.mealType,
              items: [{
                menuItemId: meal.item.menuItemId,
                name: meal.item.name,
                price: meal.item.price || 0,
                quantity: 1,
                specialInstructions: meal.item.specialInstructions || ''
              }],
              subtotal: pricing.subtotal,
              deliveryFee: pricing.deliveryFee,
              tax: pricing.tax,
              total: pricing.total,
              deliveryAddress: meal.deliveryAddress || {
                street: subscriptionPlan.deliveryAddress?.street || '',
                city: subscriptionPlan.deliveryAddress?.city || '',
                province: subscriptionPlan.deliveryAddress?.province || '',
                postalCode: subscriptionPlan.deliveryAddress?.postalCode || '',
                instructions: subscriptionPlan.deliveryAddress?.instructions || ''
              },
              deliveryTime: {
                estimated: new Date(today.getTime() + (meal.mealType === 'lunch' ? 12 * 60 * 60 * 1000 : 19 * 60 * 60 * 1000))
              },
              specialInstructions: subscriptionPlan.specialInstructions || '',
              status: 'pending',
              paymentStatus: 'paid', // Subscription orders are pre-paid
              weeklyPlanId: subscriptionPlan._id,
              isSubscriptionOrder: true
            });
            
            // Add order to subscription plan's generated orders
            subscriptionPlan.generatedOrders.push(newOrder._id);
            ordersCreated++;
            
            console.log(`Created order ${newOrder._id} for ${meal.mealType} - Customer: ${subscriptionPlan.customerId.firstName} ${subscriptionPlan.customerId.lastName}`);
            
          } catch (orderError) {
            console.error(`Error creating individual order for meal:`, orderError);
            errors.push({
              subscriptionPlanId: subscriptionPlan._id,
              mealType: meal.mealType,
              error: orderError.message
            });
          }
        }
        
        // Update subscription plan
        if (todaysMeals.length > 0) {
          subscriptionPlan.lastOrderGenerationDate = new Date();
          await subscriptionPlan.save();
        }
        
      } catch (planError) {
        console.error(`Error processing subscription plan ${subscriptionPlan._id}:`, planError);
        errors.push({
          subscriptionPlanId: subscriptionPlan._id,
          error: planError.message
        });
      }
    }
    
    console.log(`✅ Successfully created ${ordersCreated} subscription orders for ${today.toDateString()}`);
    
    return { 
      success: true, 
      ordersCreated,
      errors: errors.length > 0 ? errors : null,
      date: today.toDateString()
    };
    
  } catch (error) {
    console.error('❌ Error generating daily subscription orders:', error);
    return { 
      success: false, 
      error: error.message,
      ordersCreated: 0
    };
  }
};

/**
 * Generate daily orders from regular meal plans (non-subscription)
 */
const generateDailyOrdersFromMealPlans = async () => {
  const today = new Date();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDay = dayNames[today.getDay()];
  
  console.log(`Generating meal plan orders for ${currentDay}...`);
  
  try {
    // Find all meal plans with items for today
    const mealPlansQuery = {
      $or: [
        { [`weeklyPlans.week0.${currentDay}.lunch`]: { $exists: true, $ne: [] } },
        { [`weeklyPlans.week0.${currentDay}.dinner`]: { $exists: true, $ne: [] } }
      ]
    };
    
    const mealPlans = await MealPlan.find(mealPlansQuery)
      .populate('userId', 'firstName lastName email phone addresses');
    
    console.log(`Found ${mealPlans.length} meal plans with items for ${currentDay}`);
    
    let ordersCreated = 0;
    let errors = [];
    
    for (const mealPlan of mealPlans) {
      try {
        if (!mealPlan.weeklyPlans?.week0?.[currentDay]) {
          continue;
        }
        
        const todayMeals = mealPlan.weeklyPlans.week0[currentDay];
        
        // Process lunch orders
        if (todayMeals.lunch && todayMeals.lunch.length > 0) {
          const lunchResult = await createOrderFromMealPlanItems(
            mealPlan, 
            todayMeals.lunch, 
            'lunch', 
            today
          );
          if (lunchResult.success) ordersCreated++;
          else errors.push(lunchResult.error);
        }
        
        // Process dinner orders
        if (todayMeals.dinner && todayMeals.dinner.length > 0) {
          const dinnerResult = await createOrderFromMealPlanItems(
            mealPlan, 
            todayMeals.dinner, 
            'dinner', 
            today
          );
          if (dinnerResult.success) ordersCreated++;
          else errors.push(dinnerResult.error);
        }
        
      } catch (planError) {
        console.error(`Error processing meal plan ${mealPlan._id}:`, planError);
        errors.push({
          mealPlanId: mealPlan._id,
          error: planError.message
        });
      }
    }
    
    console.log(`✅ Created ${ordersCreated} meal plan orders for ${currentDay}`);
    
    return { 
      success: true, 
      ordersCreated,
      errors: errors.length > 0 ? errors : null,
      day: currentDay
    };
    
  } catch (error) {
    console.error('❌ Error generating daily meal plan orders:', error);
    return { 
      success: false, 
      error: error.message,
      ordersCreated: 0
    };
  }
};

/**
 * Helper function to create order from meal plan items
 */
const createOrderFromMealPlanItems = async (mealPlan, mealItems, mealType, orderDate) => {
  try {
    if (!mealItems || mealItems.length === 0) {
      return { success: false, error: 'No meal items provided' };
    }
    
    // Find restaurant by name
    const restaurantName = mealItems[0].restaurantName;
    const restaurant = await Restaurant.findOne({ name: restaurantName });
    
    if (!restaurant) {
      return { 
        success: false, 
        error: `Restaurant not found: ${restaurantName}` 
      };
    }
    
    // Check if order already exists
    const existingOrder = await Order.findOne({
      customerId: mealPlan.userId._id,
      restaurantId: restaurant._id,
      type: 'weekly-plan',
      mealType: mealType,
      createdAt: {
        $gte: new Date(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate()),
        $lt: new Date(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate() + 1)
      }
    });
    
    if (existingOrder) {
      return { 
        success: false, 
        error: `Order already exists for ${mealType}` 
      };
    }
    
    // Calculate totals using unified pricing calculator
    const items = mealItems.map(item => ({
      price: item.price || 0,
      quantity: 1
    }));
    
    const pricing = calculateOrderTotals({
      items,
      restaurantDeliveryFee: restaurant.deliverySettings?.fee,
      planType: 'single'
    });
    
    // Generate unique order number
    const orderNumber = `GG${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}${String(Date.now()).slice(-6)}`;
    
    // Create order
    const newOrder = await Order.create({
      orderNumber: orderNumber,
      customerId: mealPlan.userId._id,
      restaurantId: restaurant._id,
      type: 'weekly-plan',
      mealType: mealType,
      items: mealItems.map(item => ({
        menuItemId: item.id,
        name: item.name,
        price: item.price || 0,
        quantity: 1,
        specialInstructions: item.specialInstructions || ''
      })),
      subtotal: pricing.subtotal,
      deliveryFee: pricing.deliveryFee,
      tax: pricing.tax,
      total: pricing.total,
      deliveryAddress: {
        street: mealPlan.userId.addresses?.[0]?.street || '',
        city: mealPlan.userId.addresses?.[0]?.city || '',
        province: mealPlan.userId.addresses?.[0]?.province || '',
        postalCode: mealPlan.userId.addresses?.[0]?.postalCode || ''
      },
      deliveryTime: {
        estimated: new Date(orderDate.getTime() + (mealType === 'lunch' ? 12 * 60 * 60 * 1000 : 19 * 60 * 60 * 1000))
      },
      status: 'pending',
      paymentStatus: 'pending',
      weeklyPlanId: mealPlan._id,
      isSubscriptionOrder: false
    });
    
    return { success: true, orderId: newOrder._id };
    
  } catch (error) {
    return { 
      success: false, 
      error: `Failed to create order: ${error.message}` 
    };
  }
};

/**
 * Main function to generate all daily orders
 */
const generateDailyOrders = async () => {
  console.log('🚀 Starting daily order generation...');
  
  try {
    // Generate from subscription meal plans
    const subscriptionResult = await generateDailyOrdersFromSubscriptions();
    
    // Generate from regular meal plans  
    const mealPlanResult = await generateDailyOrdersFromMealPlans();
    
    const totalOrdersCreated = subscriptionResult.ordersCreated + mealPlanResult.ordersCreated;
    const allErrors = [
      ...(subscriptionResult.errors || []),
      ...(mealPlanResult.errors || [])
    ];
    
    console.log(`🎉 Daily order generation complete! Total orders created: ${totalOrdersCreated}`);
    
    return {
      success: true,
      totalOrdersCreated,
      subscriptionOrders: subscriptionResult.ordersCreated,
      mealPlanOrders: mealPlanResult.ordersCreated,
      errors: allErrors.length > 0 ? allErrors : null,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('💥 Fatal error in daily order generation:', error);
    return {
      success: false,
      error: error.message,
      totalOrdersCreated: 0,
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Manual trigger for order generation (for testing)
 */
const generateOrdersForDay = async (dayName) => {
  console.log(`Manually generating orders for ${dayName}...`);
  
  try {
    // Override today's date for testing
    const testDate = new Date();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayIndex = dayNames.indexOf(dayName.toLowerCase());
    
    if (dayIndex === -1) {
      throw new Error(`Invalid day name: ${dayName}`);
    }
    
    // Set test date to the specified day
    const currentDayIndex = testDate.getDay();
    const daysToAdd = (dayIndex - currentDayIndex + 7) % 7;
    testDate.setDate(testDate.getDate() + daysToAdd);
    testDate.setHours(0, 0, 0, 0);
    
    console.log(`Generating orders for ${dayName} (${testDate.toDateString()})`);
    
    // Use the same logic as generateDailyOrders but with test date
    const result = await generateDailyOrders();
    
    return {
      ...result,
      testDay: dayName,
      testDate: testDate.toDateString()
    };
    
  } catch (error) {
    console.error(`Error generating orders for ${dayName}:`, error);
    return {
      success: false,
      error: error.message,
      testDay: dayName
    };
  }
};

/**
 * Get order generation statistics
 */
const getOrderGenerationStats = async (startDate, endDate) => {
  try {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    
    // Get orders created in date range
    const orders = await Order.find({
      type: 'weekly-plan',
      createdAt: { $gte: start, $lte: end }
    }).populate('restaurantId', 'name');
    
    // Get subscription plans with generated orders
    const subscriptionPlans = await SubscriptionMealPlan.find({
      lastOrderGenerationDate: { $gte: start, $lte: end }
    }).populate('restaurantId', 'name');
    
    // Calculate statistics
    const stats = {
      dateRange: {
        start: start.toDateString(),
        end: end.toDateString()
      },
      totalOrders: orders.length,
      subscriptionOrders: orders.filter(o => o.isSubscriptionOrder).length,
      mealPlanOrders: orders.filter(o => !o.isSubscriptionOrder).length,
      ordersByMealType: {
        lunch: orders.filter(o => o.mealType === 'lunch').length,
        dinner: orders.filter(o => o.mealType === 'dinner').length
      },
      ordersByStatus: {
        pending: orders.filter(o => o.status === 'pending').length,
        confirmed: orders.filter(o => o.status === 'confirmed').length,
        preparing: orders.filter(o => o.status === 'preparing').length,
        ready: orders.filter(o => o.status === 'ready').length,
        delivered: orders.filter(o => o.status === 'delivered').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length
      },
      restaurantBreakdown: orders.reduce((acc, order) => {
        const restaurantName = order.restaurantId?.name || 'Unknown';
        acc[restaurantName] = (acc[restaurantName] || 0) + 1;
        return acc;
      }, {}),
      activeSubscriptionPlans: subscriptionPlans.length,
      dailyBreakdown: {}
    };
    
    // Calculate daily breakdown
    const currentDate = new Date(start);
    while (currentDate <= end) {
      const dayStart = new Date(currentDate);
      const dayEnd = new Date(currentDate);
      dayEnd.setHours(23, 59, 59, 999);
      
      const dayOrders = orders.filter(o => 
        o.createdAt >= dayStart && o.createdAt <= dayEnd
      );
      
      stats.dailyBreakdown[currentDate.toDateString()] = {
        total: dayOrders.length,
        lunch: dayOrders.filter(o => o.mealType === 'lunch').length,
        dinner: dayOrders.filter(o => o.mealType === 'dinner').length
      };
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return {
      success: true,
      stats
    };
    
  } catch (error) {
    console.error('Error getting order generation stats:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  generateDailyOrders,
  generateDailyOrdersFromSubscriptions,
  generateDailyOrdersFromMealPlans,
  generateOrdersForDay,
  getOrderGenerationStats
};
