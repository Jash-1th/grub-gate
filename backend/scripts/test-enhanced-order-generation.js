// FILE: scripts/test-enhanced-order-generation.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const SubscriptionMealPlan = require('../src/models/SubscriptionMealPlan');
const Subscription = require('../src/models/Subscription');
const User = require('../src/models/User');
const Restaurant = require('../src/models/Restaurant');
const Order = require('../src/models/Order');
const { getWeekDateRange } = require('../src/utils/dateHelpers');
const { generateAllSubscriptionOrders, activateScheduledOrders } = require('../src/services/enhancedOrderGenerationService');

/**
 * Test enhanced order generation with edge cases and repetition logic
 */
async function testEnhancedOrderGeneration() {
  try {
    console.log('🧪 Testing Enhanced Order Generation with Edge Cases...');
    console.log('=' .repeat(70));
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
    
    // Get test data
    const customer = await User.findOne({ email: '2022cse.r234@svce.edu.in' });
    const restaurant = await Restaurant.findOne({ name: 'ASS' });
    
    if (!customer || !restaurant) {
      console.log('❌ Test data not found');
      return;
    }
    
    console.log(`👤 Customer: ${customer.firstName} ${customer.lastName}`);
    console.log(`🏪 Restaurant: ${restaurant.name}`);
    
    // Clean up existing data
    await SubscriptionMealPlan.deleteMany({ customerId: customer._id });
    await Subscription.deleteMany({ customerId: customer._id });
    await Order.deleteMany({ customerId: customer._id, isScheduledOrder: true });
    console.log('🗑️ Cleaned up existing test data');
    
    // Test scenarios
    await testScenario1_NormalTwoWeeks(customer, restaurant);
    await testScenario2_OnlyWeek1(customer, restaurant);
    await testScenario3_OnlyWeek0(customer, restaurant);
    await testScenario4_MonthlyRepetition(customer, restaurant);
    
    // Test daily activation
    await testDailyActivation();
    
    console.log('\n🎉 All Enhanced Order Generation Tests Complete!');
    
  } catch (error) {
    console.error('💥 Test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

/**
 * Test Scenario 1: Normal two-week plan
 */
async function testScenario1_NormalTwoWeeks(customer, restaurant) {
  console.log('\n📋 Test Scenario 1: Normal Two-Week Plan');
  console.log('-' .repeat(50));
  
  const today = new Date();
  const week0 = getWeekDateRange(0, today);
  const week1 = getWeekDateRange(1, today);
  
  // Create subscription with both weeks having meals
  const subscription = await createTestSubscription(customer, restaurant, 'bi-weekly', {
    week0: {
      sunday: { lunch: [createMeal('Paneer Curry', 249)], dinner: [createMeal('Biryani', 299)] },
      monday: { lunch: [createMeal('Dal Tadka', 179)], dinner: [] },
      tuesday: { lunch: [], dinner: [createMeal('Chicken Curry', 269)] }
    },
    week1: {
      sunday: { lunch: [createMeal('Fish Curry', 319)], dinner: [] },
      monday: { lunch: [], dinner: [createMeal('Mutton Biryani', 399)] },
      tuesday: { lunch: [createMeal('Veg Biryani', 229)], dinner: [createMeal('Paneer Tikka', 279)] }
    }
  });
  
  const orders = await generateAllSubscriptionOrders(subscription);
  
  console.log(`✅ Generated ${orders.length} orders for bi-weekly subscription`);
  console.log(`   Expected: 7 orders (3 from Week 0 + 4 from Week 1)`);
  
  // Verify order distribution
  const week0Orders = orders.filter(o => o.scheduledDate >= week0.startDate && o.scheduledDate <= week0.endDate);
  const week1Orders = orders.filter(o => o.scheduledDate >= week1.startDate && o.scheduledDate <= week1.endDate);
  
  console.log(`   Week 0 Orders: ${week0Orders.length}`);
  console.log(`   Week 1 Orders: ${week1Orders.length}`);
  
  return { subscription, orders };
}

/**
 * Test Scenario 2: Only Week 1 has meals (Edge Case)
 */
async function testScenario2_OnlyWeek1(customer, restaurant) {
  console.log('\n📋 Test Scenario 2: Only Week 1 Has Meals (Edge Case)');
  console.log('-' .repeat(50));
  
  const subscription = await createTestSubscription(customer, restaurant, 'monthly', {
    week0: {
      // Empty week
    },
    week1: {
      sunday: { lunch: [createMeal('Special Curry', 299)], dinner: [createMeal('Special Biryani', 349)] },
      wednesday: { lunch: [createMeal('Midweek Meal', 199)], dinner: [] }
    }
  });
  
  const orders = await generateAllSubscriptionOrders(subscription);
  
  console.log(`✅ Generated ${orders.length} orders for monthly subscription (only Week 1)`);
  console.log(`   Expected: 9 orders (0 + 3 + 0 + 3 + 0 + 3 for 30 days)`);
  
  // Verify repetition pattern
  const ordersByWeek = {};
  orders.forEach(order => {
    const weekNum = Math.floor((order.scheduledDate - subscription.planStartDate) / (7 * 24 * 60 * 60 * 1000));
    ordersByWeek[weekNum] = (ordersByWeek[weekNum] || 0) + 1;
  });
  
  console.log('   Orders by week:', ordersByWeek);
  console.log('   Pattern: Week 0 (empty), Week 1 (3 orders), Week 2 (empty), Week 3 (3 orders)');
  
  return { subscription, orders };
}

/**
 * Test Scenario 3: Only Week 0 has meals (Edge Case)
 */
async function testScenario3_OnlyWeek0(customer, restaurant) {
  console.log('\n📋 Test Scenario 3: Only Week 0 Has Meals (Edge Case)');
  console.log('-' .repeat(50));
  
  const subscription = await createTestSubscription(customer, restaurant, 'monthly', {
    week0: {
      sunday: { lunch: [createMeal('Weekend Special', 399)], dinner: [] },
      friday: { lunch: [], dinner: [createMeal('Friday Night', 329)] }
    },
    week1: {
      // Empty week
    }
  });
  
  const orders = await generateAllSubscriptionOrders(subscription);
  
  console.log(`✅ Generated ${orders.length} orders for monthly subscription (only Week 0)`);
  console.log(`   Expected: 6 orders (2 + 0 + 2 + 0 + 2 for 30 days)`);
  
  // Verify repetition pattern
  const ordersByWeek = {};
  orders.forEach(order => {
    const weekNum = Math.floor((order.scheduledDate - subscription.planStartDate) / (7 * 24 * 60 * 60 * 1000));
    ordersByWeek[weekNum] = (ordersByWeek[weekNum] || 0) + 1;
  });
  
  console.log('   Orders by week:', ordersByWeek);
  console.log('   Pattern: Week 0 (2 orders), Week 1 (empty), Week 2 (2 orders), Week 3 (empty)');
  
  return { subscription, orders };
}

/**
 * Test Scenario 4: Monthly repetition with full pattern
 */
async function testScenario4_MonthlyRepetition(customer, restaurant) {
  console.log('\n📋 Test Scenario 4: Monthly Repetition (30 days)');
  console.log('-' .repeat(50));
  
  const subscription = await createTestSubscription(customer, restaurant, 'monthly', {
    week0: {
      sunday: { lunch: [createMeal('Week0 Sunday Lunch', 249)], dinner: [createMeal('Week0 Sunday Dinner', 299)] },
      tuesday: { lunch: [createMeal('Week0 Tuesday Lunch', 199)], dinner: [] }
    },
    week1: {
      monday: { lunch: [], dinner: [createMeal('Week1 Monday Dinner', 279)] },
      thursday: { lunch: [createMeal('Week1 Thursday Lunch', 229)], dinner: [createMeal('Week1 Thursday Dinner', 319)] }
    }
  });
  
  const orders = await generateAllSubscriptionOrders(subscription);
  
  console.log(`✅ Generated ${orders.length} orders for 30-day monthly subscription`);
  console.log(`   Expected: ~15 orders (pattern repeats ~2.1 times)`);
  
  // Show detailed breakdown
  const ordersByDate = {};
  orders.forEach(order => {
    const dateKey = order.scheduledDate.toDateString();
    ordersByDate[dateKey] = (ordersByDate[dateKey] || 0) + 1;
  });
  
  console.log('\n   📅 Order Distribution:');
  Object.keys(ordersByDate).sort().forEach(date => {
    console.log(`      ${date}: ${ordersByDate[date]} orders`);
  });
  
  return { subscription, orders };
}

/**
 * Test daily activation service
 */
async function testDailyActivation() {
  console.log('\n📋 Test Daily Activation Service');
  console.log('-' .repeat(50));
  
  const activatedCount = await activateScheduledOrders();
  console.log(`✅ Activated ${activatedCount} scheduled orders for today`);
}

/**
 * Helper: Create test subscription
 */
async function createTestSubscription(customer, restaurant, planType, weekMeals) {
  const today = new Date();
  const week0 = getWeekDateRange(0, today);
  const week1 = getWeekDateRange(1, today);
  
  // Create base subscription
  const baseSubscription = await Subscription.create({
    customerId: customer._id,
    planId: planType,
    planName: `${planType.charAt(0).toUpperCase() + planType.slice(1)} Meal Plan`,
    duration: planType === 'bi-weekly' ? 14 : 30,
    price: 999.99,
    monthlyPrice: 999.99,
    currency: 'INR',
    billingCycle: planType,
    deliveryFrequency: 'daily',
    status: 'active',
    startDate: week0.startDate,
    endDate: new Date(week0.startDate.getTime() + (planType === 'bi-weekly' ? 14 : 30) * 24 * 60 * 60 * 1000),
    nextBillingDate: new Date(week0.startDate.getTime() + 14 * 24 * 60 * 60 * 1000),
    autoRenew: true,
    features: ['Meal Planning', 'Order Management']
  });
  
  // Create weeks array
  const weeks = [
    {
      weekNumber: 1,
      weekStartDate: week0.startDate,
      weekEndDate: week0.endDate,
      meals: createWeekMeals(weekMeals.week0 || {})
    },
    {
      weekNumber: 2,
      weekStartDate: week1.startDate,
      weekEndDate: week1.endDate,
      meals: createWeekMeals(weekMeals.week1 || {})
    }
  ];
  
  // Create subscription meal plan
  const subscription = await SubscriptionMealPlan.create({
    customerId: customer._id,
    restaurantId: restaurant._id,
    subscriptionId: baseSubscription._id,
    planType: planType,
    planStartDate: week0.startDate,
    planEndDate: new Date(week0.startDate.getTime() + (planType === 'bi-weekly' ? 14 : 30) * 24 * 60 * 60 * 1000),
    weekStartDates: [week0.startDate, week1.startDate],
    weeks: weeks,
    billingCycle: planType,
    nextBillingDate: new Date(week0.startDate.getTime() + 14 * 24 * 60 * 60 * 1000),
    status: 'active',
    isOrdersGenerated: false,
    deliveryAddress: {
      street: '123 Test Street',
      city: 'Chennai',
      province: 'Tamil Nadu',
      postalCode: '600001',
      instructions: 'Test delivery'
    },
    specialInstructions: `Test ${planType} subscription`
  });
  
  return subscription;
}

/**
 * Helper: Create week meals structure
 */
function createWeekMeals(dayMeals) {
  const defaultDay = { lunch: [], dinner: [] };
  
  return {
    sunday: { ...defaultDay, ...(dayMeals.sunday || {}) },
    monday: { ...defaultDay, ...(dayMeals.monday || {}) },
    tuesday: { ...defaultDay, ...(dayMeals.tuesday || {}) },
    wednesday: { ...defaultDay, ...(dayMeals.wednesday || {}) },
    thursday: { ...defaultDay, ...(dayMeals.thursday || {}) },
    friday: { ...defaultDay, ...(dayMeals.friday || {}) },
    saturday: { ...defaultDay, ...(dayMeals.saturday || {}) }
  };
}

/**
 * Helper: Create meal object
 */
function createMeal(name, price) {
  return {
    id: `meal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    planId: `plan_${Date.now()}`,
    menuItemId: '68e65166b6624cc30f2da908', // Default menu item ID
    name: name,
    price: price,
    restaurantName: 'ASS',
    deliveryTime: '12:30',
    description: `Test meal: ${name}`,
    category: 'Test Category',
    spiceLevel: 2,
    prepTime: 30
  };
}

// Handle script termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Test interrupted');
  await mongoose.connection.close();
  process.exit(0);
});

// Run the test
testEnhancedOrderGeneration();
