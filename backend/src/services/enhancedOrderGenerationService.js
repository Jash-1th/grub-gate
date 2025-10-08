// FILE: src/services/enhancedOrderGenerationService.js
const SubscriptionMealPlan = require('../models/SubscriptionMealPlan');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const { getWeekDateRange } = require('../utils/dateHelpers');

/**
 * Enhanced order generation service with repetition logic and future order support
 */

/**
 * Subscription duration mappings
 */
const subscriptionDurations = {
  'bi-weekly': 14,   // 2 weeks
  'monthly': 30,     // ~4.3 weeks  
  'quarterly': 90    // ~13 weeks
};

/**
 * Generate all orders for a subscription with repetition logic
 * Handles edge cases like empty weeks
 */
const generateAllSubscriptionOrders = async (subscriptionPlan) => {
  try {
    console.log(`🚀 Generating all orders for subscription: ${subscriptionPlan._id}`);
    
    const { planType, weeks: originalWeeks } = subscriptionPlan;
    const subscriptionDays = subscriptionDurations[planType] || 14;
    
    console.log(`   Plan Type: ${planType} (${subscriptionDays} days)`);
    console.log(`   Original Weeks: ${originalWeeks.length}`);
    
    // Generate repeating meal plan with edge case handling
    const allWeeks = generateRepeatingMealPlan(originalWeeks, subscriptionDays, subscriptionPlan.planStartDate);
    
    console.log(`   Generated Weeks: ${allWeeks.length}`);
    
    // Generate orders for all weeks
    const allOrders = [];
    
    for (const week of allWeeks) {
      const weekOrders = await generateOrdersForWeek(week, subscriptionPlan);
      allOrders.push(...weekOrders);
    }
    
    console.log(`   Total Orders Generated: ${allOrders.length}`);
    
    // Save all orders to database
    if (allOrders.length > 0) {
      const savedOrders = await Order.insertMany(allOrders);
      console.log(`✅ Saved ${savedOrders.length} orders to database`);
      return savedOrders;
    }
    
    console.log('ℹ️ No orders to generate (empty meal plan)');
    return [];
    
  } catch (error) {
    console.error('💥 Error generating subscription orders:', error);
    throw error;
  }
};

/**
 * Generate repeating meal plan with proper edge case handling
 */
const generateRepeatingMealPlan = (originalWeeks, subscriptionDays, startDate) => {
  const repeatingWeeks = [];
  const cycleLength = originalWeeks.length; // Usually 2 (Week 0 & Week 1)
  
  console.log(`🔄 Generating repeating pattern:`);
  console.log(`   Cycle Length: ${cycleLength} weeks`);
  console.log(`   Subscription Days: ${subscriptionDays}`);
  
  // Check if any weeks have meals (edge case: all weeks empty)
  const hasAnyMeals = originalWeeks.some(week => weekHasMeals(week));
  
  if (!hasAnyMeals) {
    console.log('⚠️ No meals found in any week - no orders will be generated');
    return [];
  }
  
  let currentDay = 0;
  let weekIndex = 0;
  
  while (currentDay < subscriptionDays) {
    // Get the pattern week (cycles through Week 0, Week 1, Week 0, Week 1...)
    const patternWeekIndex = weekIndex % cycleLength;
    const patternWeek = originalWeeks[patternWeekIndex];
    
    // Calculate week dates
    const weekStartDate = new Date(startDate);
    weekStartDate.setDate(startDate.getDate() + currentDay);
    
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekStartDate.getDate() + 6);
    
    // Adjust end date if it exceeds subscription period
    const subscriptionEndDate = new Date(startDate);
    subscriptionEndDate.setDate(startDate.getDate() + subscriptionDays - 1);
    
    if (weekEndDate > subscriptionEndDate) {
      weekEndDate.setTime(subscriptionEndDate.getTime());
    }
    
    // Create new week with same meal pattern
    const newWeek = {
      weekNumber: weekIndex + 1,
      weekStartDate: weekStartDate,
      weekEndDate: weekEndDate,
      meals: JSON.parse(JSON.stringify(patternWeek.meals)), // Deep copy
      originalWeekIndex: patternWeekIndex, // Track which original week this repeats
      isRepeated: weekIndex >= cycleLength // Mark if this is a repeated week
    };
    
    const mealsCount = countWeekMeals(newWeek);
    console.log(`   Week ${weekIndex + 1}: ${weekStartDate.toDateString()} - ${weekEndDate.toDateString()} (${mealsCount} meals, repeats Week ${patternWeekIndex})`);
    
    repeatingWeeks.push(newWeek);
    
    currentDay += 7; // Move to next week
    weekIndex++;
  }
  
  return repeatingWeeks;
};

/**
 * Check if a week has any meals planned
 */
const weekHasMeals = (week) => {
  if (!week.meals) return false;
  
  const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  
  return daysOfWeek.some(day => {
    const dayMeals = week.meals[day];
    return dayMeals && (
      (dayMeals.lunch && dayMeals.lunch.length > 0) ||
      (dayMeals.dinner && dayMeals.dinner.length > 0)
    );
  });
};

/**
 * Count total meals in a week
 */
const countWeekMeals = (week) => {
  if (!week.meals) return 0;
  
  let count = 0;
  const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  
  daysOfWeek.forEach(day => {
    const dayMeals = week.meals[day];
    if (dayMeals) {
      if (dayMeals.lunch) count += dayMeals.lunch.length;
      if (dayMeals.dinner) count += dayMeals.dinner.length;
    }
  });
  
  return count;
};

/**
 * Generate orders for a specific week
 */
const generateOrdersForWeek = async (week, subscriptionPlan) => {
  const orders = [];
  const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  
  for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
    const dayName = daysOfWeek[dayIndex];
    const dayMeals = week.meals[dayName];
    
    // Calculate the actual calendar date for this day (UTC to avoid timezone issues)
    const orderDate = new Date(week.weekStartDate);
    orderDate.setUTCDate(week.weekStartDate.getUTCDate() + dayIndex);
    orderDate.setUTCHours(0, 0, 0, 0); // Set to start of day in UTC
    
    // Skip if date is beyond week end (for partial weeks)
    if (orderDate > week.weekEndDate) {
      continue;
    }
    
    if (dayMeals) {
      // Generate lunch order
      if (dayMeals.lunch && dayMeals.lunch.length > 0) {
        const lunchOrder = await createScheduledOrder(
          subscriptionPlan, 
          orderDate, 
          'lunch', 
          dayMeals.lunch,
          week
        );
        if (lunchOrder) orders.push(lunchOrder);
      }
      
      // Generate dinner order
      if (dayMeals.dinner && dayMeals.dinner.length > 0) {
        const dinnerOrder = await createScheduledOrder(
          subscriptionPlan, 
          orderDate, 
          'dinner', 
          dayMeals.dinner,
          week
        );
        if (dinnerOrder) orders.push(dinnerOrder);
      }
    }
  }
  
  return orders;
};

/**
 * Create a scheduled order with proper status
 */
const createScheduledOrder = async (subscriptionPlan, orderDate, mealType, meals, week) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const orderDateOnly = new Date(orderDate);
    orderDateOnly.setHours(0, 0, 0, 0);
    
    // Determine initial status based on date
    let status = 'scheduled';
    if (orderDateOnly.getTime() === today.getTime()) {
      status = 'pending'; // Today's orders are active
    } else if (orderDateOnly < today) {
      status = 'completed'; // Past orders are completed (for historical data)
    }
    
    // Generate unique order number with more entropy
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 4);
    const orderNumber = `GG${orderDate.getFullYear()}${String(orderDate.getMonth() + 1).padStart(2, '0')}${String(orderDate.getDate()).padStart(2, '0')}${timestamp.toString().slice(-4)}${random}`;
    
    // Calculate totals and create enhanced order items
    let subtotal = 0;
    const orderItems = [];
    
    for (const meal of meals) {
      subtotal += meal.price || 0;
      
      // Fetch detailed menu item information from database
      let menuItemDetails = null;
      try {
        if (meal.menuItemId) {
          menuItemDetails = await MenuItem.findById(meal.menuItemId);
        }
      } catch (error) {
        console.warn(`Could not fetch menu item details for ${meal.menuItemId}:`, error.message);
      }
      
      // Create enhanced order item with all available details
      const orderItem = {
        menuItemId: meal.menuItemId || meal.id,
        name: meal.name,
        price: meal.price || 0,
        quantity: 1,
        specialInstructions: meal.specialInstructions || ''
      };
      
      // Add detailed information from menu item if available
      if (menuItemDetails) {
        orderItem.description = menuItemDetails.description;
        orderItem.category = menuItemDetails.category;
        orderItem.prepTime = menuItemDetails.prepTime;
        orderItem.spiceLevel = menuItemDetails.spiceLevel;
        orderItem.dietaryTags = menuItemDetails.dietaryTags || [];
        orderItem.ingredients = menuItemDetails.ingredients || [];
        orderItem.allergens = menuItemDetails.allergens || [];
        orderItem.nutritionalInfo = menuItemDetails.nutritionalInfo;
        orderItem.isVegetarian = menuItemDetails.isVegetarian;
        orderItem.isVegan = menuItemDetails.isVegan;
        orderItem.isGlutenFree = menuItemDetails.isGlutenFree;
        orderItem.isDairyFree = menuItemDetails.isDairyFree;
        orderItem.servingSize = menuItemDetails.servingSize;
        orderItem.temperature = menuItemDetails.temperature;
        orderItem.cookingNotes = menuItemDetails.cookingNotes;
      } else {
        // Fallback: use any details available in the meal object itself
        orderItem.description = meal.description || `Delicious ${meal.name}`;
        orderItem.category = meal.category || 'Main Course';
        orderItem.prepTime = meal.prepTime || 30;
        orderItem.spiceLevel = meal.spiceLevel || 2;
        orderItem.dietaryTags = meal.dietaryTags || [];
        orderItem.ingredients = meal.ingredients || [];
        orderItem.allergens = meal.allergens || [];
      }
      
      orderItems.push(orderItem);
    }
    
    const deliveryFee = 3.99;
    const taxRate = 0.13; // 13% tax
    const tax = Math.round((subtotal + deliveryFee) * taxRate * 100) / 100;
    const total = Math.round((subtotal + deliveryFee + tax) * 100) / 100;
    
    // Set delivery time based on meal type
    const deliveryTime = new Date(orderDate);
    if (mealType === 'lunch') {
      deliveryTime.setHours(12, 30, 0, 0);
    } else {
      deliveryTime.setHours(19, 30, 0, 0);
    }
    
    return {
      orderNumber: orderNumber,
      customerId: subscriptionPlan.customerId,
      restaurantId: subscriptionPlan.restaurantId,
      type: 'weekly-plan',
      mealType: mealType,
      isSubscriptionOrder: true,
      isScheduledOrder: true,
      weeklyPlanId: subscriptionPlan._id,
      items: orderItems,
      subtotal: subtotal,
      deliveryFee: deliveryFee,
      tax: tax,
      total: total,
      status: status,
      paymentStatus: 'paid',
      scheduledDate: orderDate,
      activationDate: orderDate,
      deliveryAddress: subscriptionPlan.deliveryAddress,
      deliveryTime: {
        estimated: deliveryTime
      },
      specialInstructions: subscriptionPlan.specialInstructions || '',
      notes: `Generated from Week ${week.weekNumber} (${week.isRepeated ? 'repeated' : 'original'} Week ${week.originalWeekIndex})`
    };
    
  } catch (error) {
    console.error(`Error creating order for ${orderDate.toDateString()} ${mealType}:`, error);
    return null;
  }
};

/**
 * Daily service to activate scheduled orders
 */
const activateScheduledOrders = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    console.log(`🔄 Activating scheduled orders for ${today.toDateString()}...`);
    
    // Find orders scheduled for today
    const result = await Order.updateMany(
      {
        status: 'scheduled',
        scheduledDate: {
          $gte: today,
          $lt: tomorrow
        }
      },
      {
        status: 'pending',
        updatedAt: new Date()
      }
    );
    
    console.log(`✅ Activated ${result.modifiedCount} scheduled orders for today`);
    return result.modifiedCount;
    
  } catch (error) {
    console.error('💥 Error activating scheduled orders:', error);
    throw error;
  }
};

/**
 * Generate orders for existing subscription (migration helper)
 */
const generateOrdersForExistingSubscription = async (subscriptionId) => {
  try {
    const subscription = await SubscriptionMealPlan.findById(subscriptionId)
      .populate('customerId', 'firstName lastName email')
      .populate('restaurantId', 'name');
    
    if (!subscription) {
      throw new Error('Subscription not found');
    }
    
    console.log(`🔄 Generating orders for existing subscription: ${subscription._id}`);
    console.log(`   Customer: ${subscription.customerId.firstName} ${subscription.customerId.lastName}`);
    console.log(`   Restaurant: ${subscription.restaurantId.name}`);
    
    // Delete existing orders for this subscription
    const deleteResult = await Order.deleteMany({ 
      weeklyPlanId: subscription._id,
      isScheduledOrder: true 
    });
    console.log(`🗑️ Deleted ${deleteResult.deletedCount} existing scheduled orders`);
    
    // Generate new orders
    const orders = await generateAllSubscriptionOrders(subscription);
    
    return orders;
    
  } catch (error) {
    console.error('💥 Error generating orders for existing subscription:', error);
    throw error;
  }
};

module.exports = {
  generateAllSubscriptionOrders,
  activateScheduledOrders,
  generateOrdersForExistingSubscription,
  createScheduledOrder,
  subscriptionDurations
};
