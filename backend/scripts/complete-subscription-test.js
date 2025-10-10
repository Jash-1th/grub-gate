// FILE: scripts/complete-subscription-test.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import models and services
const MealPlan = require('../src/models/MealPlan');
const SubscriptionMealPlan = require('../src/models/SubscriptionMealPlan');
const Order = require('../src/models/Order');
const { generateAllSubscriptionOrders } = require('../src/services/enhancedOrderGenerationService');
const { getNextSunday } = require('../src/utils/dateHelpers');

/**
 * Complete subscription creation and order generation test
 */
async function completeSubscriptionTest() {
  try {
    console.log('💳 COMPLETE SUBSCRIPTION CREATION TEST');
    console.log('=' .repeat(50));
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    
    const customerId = '68e7578c70b1ebbce509b69c';
    const restaurantId = '68e73d168c18e7fd776a6327';
    
    // Find the meal plan we just created
    const mealPlan = await MealPlan.findOne({ 
      userId: customerId,
      restaurantId: restaurantId 
    }).sort({ createdAt: -1 });
    
    if (!mealPlan) {
      throw new Error('Meal plan not found - run Phase 1 first');
    }
    
    console.log(`📋 Found Meal Plan: ${mealPlan._id}`);
    console.log(`   Total Meals: ${mealPlan.totalMeals}`);
    console.log(`   Estimated Cost: $${mealPlan.estimatedCost}`);
    
    // STEP 4: CREATE 3-MONTH SUBSCRIPTION
    console.log('\n💳 STEP 4: CREATE 3-MONTH SUBSCRIPTION');
    console.log('-' .repeat(40));
    
    // Calculate subscription dates
    const today = new Date();
    const nextSunday = getNextSunday(today);
    const planStartDate = new Date(nextSunday);
    planStartDate.setHours(0, 0, 0, 0);
    
    const planEndDate = new Date(planStartDate);
    planEndDate.setDate(planStartDate.getDate() + 90); // 3 months = 90 days
    
    // Calculate weekStartDates for the entire subscription
    const weekStartDates = [];
    const totalDays = Math.ceil((planEndDate - planStartDate) / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.ceil(totalDays / 7);
    
    for (let i = 0; i < totalWeeks; i++) {
      const weekStart = new Date(planStartDate);
      weekStart.setDate(planStartDate.getDate() + (i * 7));
      weekStartDates.push(weekStart);
    }
    
    console.log(`📅 Subscription Period: ${planStartDate.toDateString()} to ${planEndDate.toDateString()}`);
    console.log(`📊 Duration: ${totalDays} days (${totalWeeks} weeks)`);
    
    // Transform meal plan to subscription format
    const weeks = [
      {
        weekNumber: 1,
        weekStartDate: new Date(planStartDate),
        weekEndDate: new Date(planStartDate.getTime() + 6 * 24 * 60 * 60 * 1000),
        meals: mealPlan.weeklyPlans.week0, // Week 0 (empty week)
        isRepeated: false,
        originalWeekIndex: 0
      },
      {
        weekNumber: 2,
        weekStartDate: new Date(planStartDate.getTime() + 7 * 24 * 60 * 60 * 1000),
        weekEndDate: new Date(planStartDate.getTime() + 13 * 24 * 60 * 60 * 1000),
        meals: mealPlan.weeklyPlans.week1, // Week 1 (active week)
        isRepeated: false,
        originalWeekIndex: 1
      }
    ];
    
    // Calculate next billing date
    const nextBillingDate = new Date();
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 3); // Quarterly
    
    // Create subscription
    const subscriptionData = {
      customerId: customerId,
      restaurantId: restaurantId,
      planType: 'quarterly',
      planStartDate: planStartDate,
      planEndDate: planEndDate,
      weekStartDates: weekStartDates,
      weeks: weeks,
      deliveryAddress: {
        street: '123 Test Street',
        city: 'Test City',
        province: 'Test Province',
        postalCode: '12345'
      },
      customerPhone: '+918125744350',
      specialInstructions: 'Complete live workflow test - automated',
      billingCycle: 'quarterly',
      nextBillingDate: nextBillingDate,
      autoRenew: true,
      status: 'active',
      generatedOrders: [],
      isOrdersGenerated: false,
      totalPlanValue: mealPlan.estimatedCost,
      totalMealsCount: mealPlan.totalMeals,
      selectedRestaurantName: 'Maple Leaf Bistro',
      selectedRestaurantData: {
        name: 'Maple Leaf Bistro',
        id: restaurantId
      }
    };
    
    const subscription = new SubscriptionMealPlan(subscriptionData);
    await subscription.save();
    
    console.log(`✅ Subscription Created: ${subscription._id}`);
    console.log(`   Plan Type: ${subscription.planType}`);
    console.log(`   Week Start Dates: ${subscription.weekStartDates.length} weeks`);
    console.log(`   Total Value: $${subscription.totalPlanValue}`);
    
    // STEP 5: GENERATE ORDERS
    console.log('\n📦 STEP 5: GENERATE ORDERS');
    console.log('-' .repeat(25));
    
    console.log('🔄 Generating all subscription orders...');
    const generatedOrders = await generateAllSubscriptionOrders(subscription);
    
    // Update subscription with generated orders
    subscription.generatedOrders = generatedOrders.map(order => order._id);
    subscription.isOrdersGenerated = true;
    await subscription.save();
    
    console.log(`✅ Generated ${generatedOrders.length} orders`);
    
    // STEP 6: ANALYZE GENERATED ORDERS
    console.log('\n📊 STEP 6: ANALYZE GENERATED ORDERS');
    console.log('-' .repeat(35));
    
    // Get all orders for analysis
    const allOrders = await Order.find({ 
      customerId: customerId,
      restaurantId: restaurantId 
    }).sort({ scheduledDate: 1 });
    
    console.log(`📋 Total Orders in Database: ${allOrders.length}`);
    
    // Group orders by week pattern
    const ordersByWeek = {};
    const ordersByDate = {};
    
    allOrders.forEach(order => {
      const scheduledDate = new Date(order.scheduledDate);
      const weekStart = new Date(planStartDate);
      
      // Calculate which week this order belongs to
      const daysDiff = Math.floor((scheduledDate - weekStart) / (1000 * 60 * 60 * 24));
      const weekNumber = Math.floor(daysDiff / 7) + 1;
      
      if (!ordersByWeek[weekNumber]) ordersByWeek[weekNumber] = [];
      ordersByWeek[weekNumber].push(order);
      
      const dateKey = scheduledDate.toISOString().split('T')[0];
      if (!ordersByDate[dateKey]) ordersByDate[dateKey] = [];
      ordersByDate[dateKey].push(order);
    });
    
    console.log('\n📈 Orders by Week:');
    Object.keys(ordersByWeek).sort((a, b) => parseInt(a) - parseInt(b)).forEach(week => {
      const orders = ordersByWeek[week];
      const weekPattern = parseInt(week) % 2 === 1 ? 'Empty Week' : 'Active Week';
      console.log(`   Week ${week} (${weekPattern}): ${orders.length} orders`);
    });
    
    console.log('\n📅 Orders by Date (First 10):');
    Object.keys(ordersByDate).sort().slice(0, 10).forEach(date => {
      const orders = ordersByDate[date];
      const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
      console.log(`   ${date} (${dayName}): ${orders.length} orders`);
      
      orders.forEach(order => {
        console.log(`      - ${order.mealType}: ${order.items[0]?.name || 'Unknown'} ($${order.total})`);
      });
    });
    
    // STEP 7: VERIFY ORDER CORRECTNESS
    console.log('\n✅ STEP 7: VERIFY ORDER CORRECTNESS');
    console.log('-' .repeat(35));
    
    let correctOrders = 0;
    let dateIssues = 0;
    
    allOrders.forEach(order => {
      const scheduledDate = new Date(order.scheduledDate);
      const deliveryDate = new Date(order.deliveryTime.estimated);
      
      const scheduledDateStr = scheduledDate.toISOString().split('T')[0];
      const deliveryDateStr = deliveryDate.toISOString().split('T')[0];
      
      if (scheduledDateStr === deliveryDateStr) {
        correctOrders++;
      } else {
        dateIssues++;
      }
    });
    
    console.log(`📊 Order Analysis:`);
    console.log(`   Total Orders: ${allOrders.length}`);
    console.log(`   Correct Dates: ${correctOrders}/${allOrders.length} ${correctOrders === allOrders.length ? '✅' : '❌'}`);
    console.log(`   Date Issues: ${dateIssues} ${dateIssues === 0 ? '✅' : '❌'}`);
    
    // Check pattern correctness
    const expectedPattern = [0, 4, 0, 4, 0, 4]; // Empty, Active, Empty, Active, etc.
    const actualPattern = Object.keys(ordersByWeek).sort((a, b) => parseInt(a) - parseInt(b)).slice(0, 6).map(week => ordersByWeek[week].length);
    
    console.log(`   Expected Pattern: [${expectedPattern.join(', ')}] (Empty/Active weeks)`);
    console.log(`   Actual Pattern: [${actualPattern.join(', ')}]`);
    
    const patternCorrect = JSON.stringify(expectedPattern) === JSON.stringify(actualPattern);
    console.log(`   Pattern Correct: ${patternCorrect ? '✅' : '❌'}`);
    
    if (correctOrders === allOrders.length && dateIssues === 0 && patternCorrect) {
      console.log('\n🎉 ALL TESTS PASSED! Orders generated correctly');
    } else {
      console.log('\n⚠️  Some issues found in order generation');
    }
    
    return {
      subscription,
      orders: allOrders,
      analysis: {
        totalOrders: allOrders.length,
        correctDates: correctOrders,
        dateIssues: dateIssues,
        patternCorrect: patternCorrect,
        ordersByWeek: ordersByWeek,
        ordersByDate: ordersByDate
      }
    };
    
  } catch (error) {
    console.error('💥 Subscription test failed:', error);
    throw error;
  }
}

// Export for use in other scripts
module.exports = { completeSubscriptionTest };

// Run if called directly
if (require.main === module) {
  completeSubscriptionTest()
    .then((result) => {
      console.log('\n✅ Subscription test completed successfully');
      console.log('📊 Summary:', {
        subscriptionId: result.subscription._id.toString(),
        totalOrders: result.analysis.totalOrders,
        correctDates: result.analysis.correctDates,
        patternCorrect: result.analysis.patternCorrect
      });
    })
    .catch((error) => {
      console.error('💥 Subscription test failed:', error);
    })
    .finally(async () => {
      await mongoose.connection.close();
      console.log('\n🔌 Disconnected from MongoDB');
      process.exit(0);
    });
}
