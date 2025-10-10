// FILE: scripts/check-user-subscription.js
const mongoose = require('mongoose');
const SubscriptionMealPlan = require('../src/models/SubscriptionMealPlan');
const Order = require('../src/models/Order');
const User = require('../src/models/User');
const Restaurant = require('../src/models/Restaurant');

/**
 * Check user's meal plan subscription and orders
 */
async function checkUserSubscription() {
  try {
    console.log('🔍 CHECKING USER SUBSCRIPTION & ORDERS');
    console.log('=' .repeat(60));
    
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/grub-gate');
    console.log('✅ Connected to MongoDB');
    
    const customerId = '68e7578c70b1ebbce509b69c';
    const restaurantId = '68e73d168c18e7fd776a6327';
    
    // Get user info
    const user = await User.findById(customerId);
    console.log(`\n👤 CUSTOMER: ${user?.name || 'Not found'} (${customerId})`);
    
    // Get restaurant info
    const restaurant = await Restaurant.findById(restaurantId);
    console.log(`🏪 RESTAURANT: ${restaurant?.name || 'Not found'} (${restaurantId})`);
    
    // Find user's subscription
    const subscription = await SubscriptionMealPlan.findOne({ 
      customerId: customerId 
    }).sort({ createdAt: -1 });
    
    if (!subscription) {
      console.log('\n❌ NO SUBSCRIPTION FOUND');
      return;
    }
    
    console.log(`\n📋 SUBSCRIPTION FOUND: ${subscription._id}`);
    console.log(`   Created: ${subscription.createdAt}`);
    console.log(`   Plan Type: ${subscription.planType}`);
    console.log(`   Plan Start: ${subscription.planStartDate}`);
    console.log(`   Plan End: ${subscription.planEndDate}`);
    console.log(`   Total Weeks: ${subscription.weeks?.length || 0}`);
    console.log(`   Restaurant ID: ${subscription.restaurantId}`);
    console.log(`   Status: ${subscription.status}`);
    
    // Analyze meal plan structure
    console.log(`\n🍽️  MEAL PLAN ANALYSIS:`);
    console.log('-' .repeat(40));
    
    let totalMeals = 0;
    subscription.weeks?.forEach((week, index) => {
      let weekMeals = 0;
      const meals = week.meals || {};
      
      Object.keys(meals).forEach(day => {
        const dayMeals = meals[day] || {};
        const lunchCount = dayMeals.lunch?.length || 0;
        const dinnerCount = dayMeals.dinner?.length || 0;
        weekMeals += lunchCount + dinnerCount;
      });
      
      totalMeals += weekMeals;
      console.log(`   Week ${week.weekNumber}: ${weekMeals} meals (${week.weekStartDate?.toDateString()} - ${week.weekEndDate?.toDateString()})`);
      
      if (weekMeals > 0) {
        Object.keys(meals).forEach(day => {
          const dayMeals = meals[day] || {};
          const lunchCount = dayMeals.lunch?.length || 0;
          const dinnerCount = dayMeals.dinner?.length || 0;
          
          if (lunchCount > 0 || dinnerCount > 0) {
            console.log(`     ${day}: ${lunchCount} lunch, ${dinnerCount} dinner`);
            
            // Show actual items
            if (lunchCount > 0) {
              dayMeals.lunch.forEach(item => {
                console.log(`       🍽️  Lunch: ${item.name} ($${item.price})`);
              });
            }
            if (dinnerCount > 0) {
              dayMeals.dinner.forEach(item => {
                console.log(`       🍽️  Dinner: ${item.name} ($${item.price})`);
              });
            }
          }
        });
      }
    });
    
    console.log(`\n📊 TOTAL MEALS IN SUBSCRIPTION: ${totalMeals}`);
    
    // Find orders for this user and restaurant
    const orders = await Order.find({
      customerId: customerId,
      restaurantId: restaurantId
    }).sort({ scheduledDeliveryDate: 1 });
    
    console.log(`\n📦 ORDERS ANALYSIS:`);
    console.log('-' .repeat(40));
    console.log(`   Total Orders: ${orders.length}`);
    
    if (orders.length > 0) {
      console.log(`   Date Range: ${orders[0].scheduledDeliveryDate.toDateString()} to ${orders[orders.length-1].scheduledDeliveryDate.toDateString()}`);
      
      // Group orders by week
      const ordersByWeek = {};
      orders.forEach(order => {
        const date = order.scheduledDeliveryDate;
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay()); // Get Sunday of that week
        const weekKey = weekStart.toDateString();
        
        if (!ordersByWeek[weekKey]) {
          ordersByWeek[weekKey] = [];
        }
        ordersByWeek[weekKey].push(order);
      });
      
      console.log(`\n📅 ORDERS BY WEEK:`);
      Object.keys(ordersByWeek).sort().forEach((weekStart, index) => {
        const weekOrders = ordersByWeek[weekStart];
        console.log(`   Week ${index + 1} (${weekStart}): ${weekOrders.length} orders`);
        
        weekOrders.forEach(order => {
          const dayName = order.scheduledDeliveryDate.toLocaleDateString('en-US', { weekday: 'long' });
          console.log(`     ${order.scheduledDeliveryDate.toDateString()} (${dayName}) - ${order.mealType}: ${order.items[0]?.name} ($${order.totalAmount})`);
        });
      });
      
      // Show first 5 orders in detail
      console.log(`\n📋 FIRST 5 ORDERS:`);
      orders.slice(0, 5).forEach((order, index) => {
        const dayName = order.scheduledDeliveryDate.toLocaleDateString('en-US', { weekday: 'long' });
        console.log(`   ${index + 1}. ${order.scheduledDeliveryDate.toDateString()} (${dayName}) - ${order.mealType}`);
        console.log(`      Item: ${order.items[0]?.name} ($${order.totalAmount})`);
        console.log(`      Status: ${order.status}`);
      });
    } else {
      console.log('   ❌ No orders found for this user and restaurant');
    }
    
    // Summary
    console.log(`\n🎯 SUMMARY:`);
    console.log('-' .repeat(40));
    console.log(`   ✅ Subscription: ${subscription ? 'Found' : 'Not Found'}`);
    console.log(`   ✅ Total Meals Planned: ${totalMeals}`);
    console.log(`   ✅ Total Orders Generated: ${orders.length}`);
    console.log(`   ✅ Match: ${totalMeals > 0 && orders.length > 0 ? 'YES' : 'NO'}`);
    
    if (subscription && orders.length > 0) {
      console.log(`   ✅ Pattern Working: Orders generated from meal plan`);
    } else if (subscription && orders.length === 0) {
      console.log(`   ⚠️  Issue: Meal plan exists but no orders generated`);
    } else {
      console.log(`   ❌ Issue: No subscription or orders found`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

checkUserSubscription();
