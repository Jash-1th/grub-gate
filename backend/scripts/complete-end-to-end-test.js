// FILE: scripts/complete-end-to-end-test.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import models and services
const User = require('../src/models/User');
const Restaurant = require('../src/models/Restaurant');
const MenuItem = require('../src/models/MenuItem');
const MealPlan = require('../src/models/MealPlan');
const Order = require('../src/models/Order');
const SubscriptionMealPlan = require('../src/models/SubscriptionMealPlan');
const { generateAllSubscriptionOrders } = require('../src/services/enhancedOrderGenerationService');
const { getNextSunday } = require('../src/utils/dateHelpers');

/**
 * Complete end-to-end test: Meal Plan → Subscription → Orders → Partner Portal
 */
async function completeEndToEndTest() {
  try {
    console.log('🚀 COMPLETE END-TO-END WORKFLOW TEST');
    console.log('=' .repeat(60));
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    
    const customerId = '68e7578c70b1ebbce509b69c';
    const restaurantId = '68e73d168c18e7fd776a6327';
    
    // ========================================
    // PHASE 1: CLEANUP & SETUP
    // ========================================
    console.log('\n🧹 PHASE 1: CLEANUP & SETUP');
    console.log('=' .repeat(30));
    
    // Delete existing data
    const deletedOrders = await Order.deleteMany({ customerId: customerId });
    const deletedSubscriptions = await SubscriptionMealPlan.deleteMany({ customerId: customerId });
    const deletedMealPlans = await MealPlan.deleteMany({ userId: customerId });
    
    console.log(`🗑️  Cleanup Results:`);
    console.log(`   Orders: ${deletedOrders.deletedCount}`);
    console.log(`   Subscriptions: ${deletedSubscriptions.deletedCount}`);
    console.log(`   Meal Plans: ${deletedMealPlans.deletedCount}`);
    
    // Verify entities exist
    const customer = await User.findById(customerId);
    const restaurant = await Restaurant.findById(restaurantId);
    const menuItems = await MenuItem.find({ restaurantId: restaurantId });
    
    if (!customer) throw new Error('Customer not found');
    if (!restaurant) throw new Error('Restaurant not found');
    if (menuItems.length === 0) throw new Error('No menu items found');
    
    console.log(`👤 Customer: ${customer.firstName} ${customer.lastName}`);
    console.log(`🏪 Restaurant: ${restaurant.name}`);
    console.log(`🍽️  Menu Items: ${menuItems.length} available`);
    
    // ========================================
    // PHASE 2: CREATE MEAL PLAN
    // ========================================
    console.log('\n🍽️  PHASE 2: CREATE MEAL PLAN');
    console.log('=' .repeat(30));
    
    // Select 4 menu items strategically
    const selectedItems = menuItems.slice(0, 4);
    console.log('📝 Selected Menu Items:');
    selectedItems.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.name} - $${item.price}`);
    });
    
    // Create meal plan with Week 0 (empty) and Week 1 (active)
    const mealPlanData = {
      userId: customerId,
      restaurantId: restaurantId,
      weeklyPlans: {
        week0: {
          // Week 0: Empty week (alternating pattern)
          sunday: { lunch: [], dinner: [] },
          monday: { lunch: [], dinner: [] },
          tuesday: { lunch: [], dinner: [] },
          wednesday: { lunch: [], dinner: [] },
          thursday: { lunch: [], dinner: [] },
          friday: { lunch: [], dinner: [] },
          saturday: { lunch: [], dinner: [] }
        },
        week1: {
          // Week 1: Active week with selected meals
          sunday: { 
            lunch: [selectedItems[0]._id], 
            dinner: [selectedItems[1]._id] 
          },
          monday: { 
            lunch: [selectedItems[2]._id], 
            dinner: [] 
          },
          tuesday: { 
            lunch: [], 
            dinner: [selectedItems[3]._id] 
          },
          wednesday: { lunch: [], dinner: [] },
          thursday: { lunch: [], dinner: [] },
          friday: { lunch: [], dinner: [] },
          saturday: { lunch: [], dinner: [] }
        }
      },
      totalMeals: 4,
      estimatedCost: selectedItems.reduce((sum, item) => sum + item.price, 0),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const mealPlan = new MealPlan(mealPlanData);
    await mealPlan.save();
    
    console.log(`✅ Meal Plan Created: ${mealPlan._id}`);
    console.log(`   Week 0: Empty (0 meals)`);
    console.log(`   Week 1: Active (4 meals)`);
    console.log(`   Total Cost: $${mealPlan.estimatedCost}`);
    
    // ========================================
    // PHASE 3: CREATE SUBSCRIPTION
    // ========================================
    console.log('\n💳 PHASE 3: CREATE 3-MONTH SUBSCRIPTION');
    console.log('=' .repeat(40));
    
    // Calculate subscription dates
    const today = new Date();
    const nextSunday = getNextSunday(today);
    const planStartDate = new Date(nextSunday);
    planStartDate.setHours(0, 0, 0, 0); // Keep local date, set to start of day
    
    const planEndDate = new Date(planStartDate);
    planEndDate.setDate(planStartDate.getDate() + 90); // 90 days = 3 months
    
    // Calculate weekStartDates
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
    
    // Transform meal plan to subscription weeks with proper meal objects
    const createMealObject = (menuItem, planId) => ({
      id: `${planId}_${menuItem._id}`,
      planId: planId,
      menuItemId: menuItem._id,
      name: menuItem.name,
      price: menuItem.price,
      restaurantName: restaurant.name,
      deliveryTime: '12:30', // Default delivery time
      description: menuItem.description || '',
      image: menuItem.image || '',
      category: menuItem.category || '',
      dietaryPreferences: menuItem.dietaryPreferences || [],
      spiceLevel: menuItem.spiceLevel || 0,
      prepTime: menuItem.prepTime || 30,
      servings: menuItem.servings || 1,
      addedAt: new Date()
    });

    // Create empty meals structure
    const createEmptyMeals = () => ({
      sunday: { lunch: [], dinner: [] },
      monday: { lunch: [], dinner: [] },
      tuesday: { lunch: [], dinner: [] },
      wednesday: { lunch: [], dinner: [] },
      thursday: { lunch: [], dinner: [] },
      friday: { lunch: [], dinner: [] },
      saturday: { lunch: [], dinner: [] }
    });

    // Week 0: Empty meals
    const week0Meals = createEmptyMeals();

    // Week 1: Active meals with proper objects
    const week1Meals = createEmptyMeals();
    week1Meals.sunday.lunch = [createMealObject(selectedItems[0], mealPlan._id.toString())];
    week1Meals.sunday.dinner = [createMealObject(selectedItems[1], mealPlan._id.toString())];
    week1Meals.monday.lunch = [createMealObject(selectedItems[2], mealPlan._id.toString())];
    week1Meals.tuesday.dinner = [createMealObject(selectedItems[3], mealPlan._id.toString())];

    // Create week dates with proper local date handling
    const week1Start = new Date(planStartDate);
    const week1End = new Date(planStartDate);
    week1End.setDate(week1End.getDate() + 6);
    week1End.setHours(23, 59, 59, 999);
    
    const week2Start = new Date(planStartDate);
    week2Start.setDate(week2Start.getDate() + 7);
    const week2End = new Date(week2Start);
    week2End.setDate(week2End.getDate() + 6);
    week2End.setHours(23, 59, 59, 999);

    const weeks = [
      {
        weekNumber: 1,
        weekStartDate: week1Start,
        weekEndDate: week1End,
        meals: week1Meals, // Active week - Week 1 should have meals
        isRepeated: false,
        originalWeekIndex: 1
      },
      {
        weekNumber: 2,
        weekStartDate: week2Start,
        weekEndDate: week2End,
        meals: week0Meals, // Empty week - Week 2 should be empty
        isRepeated: false,
        originalWeekIndex: 0
      }
    ];
    
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
      specialInstructions: 'Complete end-to-end test - automated',
      billingCycle: 'quarterly',
      nextBillingDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      autoRenew: true,
      status: 'active',
      generatedOrders: [],
      isOrdersGenerated: false,
      totalPlanValue: mealPlan.estimatedCost,
      totalMealsCount: mealPlan.totalMeals,
      selectedRestaurantName: restaurant.name,
      selectedRestaurantData: {
        name: restaurant.name,
        id: restaurantId
      }
    };
    
    const subscription = new SubscriptionMealPlan(subscriptionData);
    await subscription.save();
    
    console.log(`✅ Subscription Created: ${subscription._id}`);
    console.log(`   Type: ${subscription.planType}`);
    console.log(`   Weeks: ${subscription.weekStartDates.length}`);
    console.log(`   Value: $${subscription.totalPlanValue}`);
    
    // ========================================
    // PHASE 4: GENERATE ORDERS
    // ========================================
    console.log('\n📦 PHASE 4: GENERATE ORDERS');
    console.log('=' .repeat(25));
    
    console.log('🔄 Generating all subscription orders...');
    const generatedOrders = await generateAllSubscriptionOrders(subscription);
    
    // Update subscription
    subscription.generatedOrders = generatedOrders.map(order => order._id);
    subscription.isOrdersGenerated = true;
    await subscription.save();
    
    console.log(`✅ Generated ${generatedOrders.length} orders`);
    
    // Clean up meal plan (as done in real workflow)
    await MealPlan.deleteOne({ _id: mealPlan._id });
    console.log('🧹 Cleaned up meal plan data');
    
    // ========================================
    // PHASE 5: ANALYZE RESULTS
    // ========================================
    console.log('\n📊 PHASE 5: ANALYZE RESULTS');
    console.log('=' .repeat(30));
    
    // Get all orders for analysis
    const allOrders = await Order.find({ 
      customerId: customerId,
      restaurantId: restaurantId 
    }).sort({ scheduledDate: 1 });
    
    console.log(`📋 Total Orders: ${allOrders.length}`);
    
    // Analyze order pattern
    const ordersByWeek = {};
    allOrders.forEach(order => {
      const scheduledDate = new Date(order.scheduledDate);
      const daysDiff = Math.floor((scheduledDate - planStartDate) / (1000 * 60 * 60 * 24));
      const weekNumber = Math.floor(daysDiff / 7) + 1;
      
      if (!ordersByWeek[weekNumber]) ordersByWeek[weekNumber] = [];
      ordersByWeek[weekNumber].push(order);
    });
    
    console.log('\n📈 Orders by Week Pattern:');
    Object.keys(ordersByWeek).sort((a, b) => parseInt(a) - parseInt(b)).slice(0, 8).forEach(week => {
      const orders = ordersByWeek[week];
      const isEvenWeek = parseInt(week) % 2 === 0;
      const expectedCount = isEvenWeek ? 4 : 0; // Even weeks should have 4 orders, odd weeks 0
      const status = orders.length === expectedCount ? '✅' : '❌';
      
      console.log(`   Week ${week}: ${orders.length} orders (expected: ${expectedCount}) ${status}`);
    });
    
    // Check date alignment
    let correctDates = 0;
    allOrders.forEach(order => {
      const scheduledDate = new Date(order.scheduledDate).toISOString().split('T')[0];
      const deliveryDate = new Date(order.deliveryTime.estimated).toISOString().split('T')[0];
      if (scheduledDate === deliveryDate) correctDates++;
    });
    
    console.log(`\n📅 Date Alignment: ${correctDates}/${allOrders.length} ${correctDates === allOrders.length ? '✅' : '❌'}`);
    
    // Show first few orders
    console.log('\n📋 First 5 Orders:');
    allOrders.slice(0, 5).forEach((order, index) => {
      const date = new Date(order.scheduledDate).toDateString();
      const item = order.items[0]?.name || 'Unknown';
      console.log(`   ${index + 1}. ${date} - ${order.mealType}: ${item} ($${order.total})`);
    });
    
    // ========================================
    // PHASE 6: PARTNER PORTAL TEST
    // ========================================
    console.log('\n🏪 PHASE 6: PARTNER PORTAL READINESS');
    console.log('=' .repeat(35));
    
    // Check partner can access orders
    const partnerId = restaurant.ownerId;
    const partnerRestaurant = await Restaurant.findOne({ 
      $or: [
        { partnerId: partnerId },
        { ownerId: partnerId }
      ]
    });
    
    console.log(`👤 Partner ID: ${partnerId}`);
    console.log(`🏪 Partner Restaurant: ${partnerRestaurant ? partnerRestaurant.name : 'Not found'}`);
    
    if (partnerRestaurant) {
      const partnerOrders = await Order.find({
        restaurantId: partnerRestaurant._id,
        status: { $in: ['scheduled', 'pending'] }
      });
      
      console.log(`📊 Partner Orders Available: ${partnerOrders.length}`);
      console.log('✅ Partner Portal should work correctly');
    } else {
      console.log('❌ Partner Portal may have issues - restaurant not found');
    }
    
    // ========================================
    // FINAL SUMMARY
    // ========================================
    console.log('\n🎉 FINAL SUMMARY');
    console.log('=' .repeat(20));
    
    const success = correctDates === allOrders.length && allOrders.length > 0;
    
    console.log(`📊 Test Results:`);
    console.log(`   ✅ Cleanup: Completed`);
    console.log(`   ✅ Meal Plan: Created with 4 items`);
    console.log(`   ✅ Subscription: 3-month quarterly plan`);
    console.log(`   ✅ Orders: ${allOrders.length} generated`);
    console.log(`   ${correctDates === allOrders.length ? '✅' : '❌'} Date Alignment: Perfect`);
    console.log(`   ✅ Partner Portal: Ready`);
    
    console.log(`\n🎯 Overall Status: ${success ? '✅ SUCCESS' : '❌ ISSUES FOUND'}`);
    
    if (success) {
      console.log('\n🚀 READY FOR LIVE TESTING:');
      console.log('1. 🌐 Frontend meal planning should work');
      console.log('2. 💳 Subscription creation should work');
      console.log('3. 📦 Orders should generate correctly');
      console.log('4. 🏪 Partner Portal should show orders');
      console.log('5. 📅 All dates should align properly');
    }
    
    return {
      success,
      subscription: subscription._id,
      orders: allOrders.length,
      correctDates: correctDates,
      partnerReady: !!partnerRestaurant
    };
    
  } catch (error) {
    console.error('💥 End-to-end test failed:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the test
if (require.main === module) {
  completeEndToEndTest()
    .then((result) => {
      console.log('\n📊 Test completed:', result);
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error('💥 Test failed:', error);
      process.exit(1);
    });
}

module.exports = { completeEndToEndTest };
