// FILE: scripts/debug-order-pattern.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const Order = require('../src/models/Order');
const SubscriptionMealPlan = require('../src/models/SubscriptionMealPlan');

/**
 * Debug order generation pattern to find day mapping issue
 */
async function debugOrderPattern() {
  try {
    console.log('🔍 DEBUGGING ORDER GENERATION PATTERN');
    console.log('=' .repeat(60));
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    
    const customerId = '68e7578c70b1ebbce509b69c';
    
    // Get the latest subscription
    const subscription = await SubscriptionMealPlan.findOne({ customerId: customerId })
      .sort({ createdAt: -1 });
    
    if (!subscription) {
      console.log('❌ No subscription found');
      return;
    }
    
    console.log(`📋 Subscription: ${subscription._id}`);
    console.log(`   Plan Start: ${subscription.planStartDate}`);
    console.log(`   Weeks: ${subscription.weeks.length}`);
    
    // Analyze subscription weeks structure
    console.log('\n📊 SUBSCRIPTION WEEKS ANALYSIS:');
    console.log('-' .repeat(40));
    
    subscription.weeks.forEach((week, index) => {
      console.log(`\nWeek ${index} (Week Number: ${week.weekNumber}):`);
      console.log(`   Start: ${week.weekStartDate.toDateString()}`);
      console.log(`   End: ${week.weekEndDate.toDateString()}`);
      console.log(`   Original Week Index: ${week.originalWeekIndex}`);
      
      // Count meals in this week
      let totalMeals = 0;
      const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      
      console.log('   Meals by day:');
      daysOfWeek.forEach(day => {
        const lunchCount = week.meals[day]?.lunch?.length || 0;
        const dinnerCount = week.meals[day]?.dinner?.length || 0;
        const dayTotal = lunchCount + dinnerCount;
        totalMeals += dayTotal;
        
        if (dayTotal > 0) {
          console.log(`     ${day}: ${lunchCount} lunch, ${dinnerCount} dinner (total: ${dayTotal})`);
        }
      });
      
      console.log(`   Total meals in week: ${totalMeals}`);
    });
    
    // Get all orders and analyze by week
    const orders = await Order.find({ customerId: customerId })
      .sort({ scheduledDate: 1 });
    
    console.log(`\n📦 ORDERS ANALYSIS (${orders.length} total):`);
    console.log('-' .repeat(30));
    
    const planStartDate = new Date(subscription.planStartDate);
    const ordersByWeek = {};
    
    orders.forEach(order => {
      const scheduledDate = new Date(order.scheduledDate);
      
      // Calculate which week this order belongs to
      const daysDiff = Math.floor((scheduledDate - planStartDate) / (1000 * 60 * 60 * 24));
      const weekNumber = Math.floor(daysDiff / 7) + 1;
      
      if (!ordersByWeek[weekNumber]) {
        ordersByWeek[weekNumber] = [];
      }
      ordersByWeek[weekNumber].push({
        order,
        scheduledDate,
        dayOfWeek: scheduledDate.toLocaleDateString('en-US', { weekday: 'long' }),
        daysDiff,
        weekDay: daysDiff % 7
      });
    });
    
    // Analyze each week's orders
    Object.keys(ordersByWeek).sort((a, b) => parseInt(a) - parseInt(b)).forEach(weekNum => {
      const weekOrders = ordersByWeek[weekNum];
      const subscriptionWeek = subscription.weeks[parseInt(weekNum) - 1];
      
      console.log(`\nWeek ${weekNum}:`);
      console.log(`   Orders: ${weekOrders.length}`);
      console.log(`   Expected pattern: ${subscriptionWeek ? (subscriptionWeek.originalWeekIndex === 0 ? 'Empty (0 orders)' : 'Active (4 orders)') : 'Unknown'}`);
      
      weekOrders.forEach((orderInfo, index) => {
        const { order, scheduledDate, dayOfWeek, daysDiff, weekDay } = orderInfo;
        console.log(`   ${index + 1}. ${scheduledDate.toDateString()} (${dayOfWeek}) - ${order.mealType}`);
        console.log(`      Days from start: ${daysDiff}, Week day: ${weekDay}`);
        console.log(`      Item: ${order.items[0]?.name || 'Unknown'}`);
      });
    });
    
    // Check the specific issue: Why are orders on Sat/Sun instead of Sun/Mon/Tue?
    console.log('\n🔍 DAY MAPPING ANALYSIS:');
    console.log('-' .repeat(25));
    
    const firstOrder = orders[0];
    if (firstOrder) {
      const firstOrderDate = new Date(firstOrder.scheduledDate);
      console.log(`First order date: ${firstOrderDate.toDateString()}`);
      console.log(`Plan start date: ${planStartDate.toDateString()}`);
      
      const daysDiff = Math.floor((firstOrderDate - planStartDate) / (1000 * 60 * 60 * 24));
      console.log(`Days difference: ${daysDiff}`);
      console.log(`Expected: Orders should start from plan start date`);
      
      // Check if there's an off-by-one error
      if (daysDiff !== 0) {
        console.log(`⚠️  ISSUE FOUND: Orders are starting ${daysDiff} days after plan start date`);
        console.log(`   This could be causing the day shift issue`);
      }
    }
    
    // Check the meal plan structure vs generated orders
    console.log('\n🍽️  MEAL PLAN VS ORDERS COMPARISON:');
    console.log('-' .repeat(35));
    
    const activeWeek = subscription.weeks.find(w => w.originalWeekIndex === 1);
    if (activeWeek) {
      console.log('Active week meals (should generate orders):');
      const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      
      daysOfWeek.forEach((day, dayIndex) => {
        const lunchCount = activeWeek.meals[day]?.lunch?.length || 0;
        const dinnerCount = activeWeek.meals[day]?.dinner?.length || 0;
        
        if (lunchCount > 0 || dinnerCount > 0) {
          console.log(`   ${day} (day ${dayIndex}): ${lunchCount} lunch, ${dinnerCount} dinner`);
        }
      });
      
      // Check if the day indexing matches
      console.log('\nExpected order days based on meal plan:');
      console.log('   Sunday (0): lunch + dinner = 2 orders');
      console.log('   Monday (1): lunch = 1 order');
      console.log('   Tuesday (2): dinner = 1 order');
      console.log('   Total: 4 orders per active week');
    }
    
  } catch (error) {
    console.error('💥 Debug failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the debug
debugOrderPattern();
