// FILE: scripts/test-specific-user-scenario.js
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
const { generateAllSubscriptionOrders } = require('../src/services/enhancedOrderGenerationService');

/**
 * Test specific user scenario:
 * - User: 68e60bc544b875ac6aaf9526
 * - Restaurant: 68e60c9d44b875ac6aaf953d
 * - Week 1: Empty (no items)
 * - Week 2: Every slot filled (14 meals total)
 * - Subscription: 3 months (quarterly)
 */
async function testSpecificUserScenario() {
  try {
    console.log('🧪 Testing Specific User Scenario - 3 Month Subscription');
    console.log('=' .repeat(70));
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
    
    // Get specific user and restaurant
    const userId = '68e60bc544b875ac6aaf9526';
    const restaurantId = '68e60c9d44b875ac6aaf953d';
    
    const customer = await User.findById(userId);
    const restaurant = await Restaurant.findById(restaurantId);
    
    if (!customer || !restaurant) {
      console.log('❌ User or restaurant not found');
      console.log(`   User found: ${!!customer}`);
      console.log(`   Restaurant found: ${!!restaurant}`);
      return;
    }
    
    console.log(`👤 Customer: ${customer.firstName} ${customer.lastName} (${customer.email})`);
    console.log(`🏪 Restaurant: ${restaurant.name}`);
    
    // Clean up existing data for this user
    await SubscriptionMealPlan.deleteMany({ customerId: userId });
    await Subscription.deleteMany({ customerId: userId });
    await Order.deleteMany({ customerId: userId, isScheduledOrder: true });
    console.log('🗑️ Cleaned up existing data for user');
    
    // Create the specific scenario
    await createQuarterlySubscriptionScenario(customer, restaurant);
    
    console.log('\n🎉 Specific User Scenario Test Complete!');
    
  } catch (error) {
    console.error('💥 Test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

/**
 * Create quarterly subscription with Week 1 empty and Week 2 fully filled
 */
async function createQuarterlySubscriptionScenario(customer, restaurant) {
  console.log('\n📋 Creating Quarterly Subscription Scenario');
  console.log('-' .repeat(50));
  
  const today = new Date();
  const week0 = getWeekDateRange(0, today);
  const week1 = getWeekDateRange(1, today);
  
  console.log(`📅 Week 0: ${week0.startDate.toDateString()} - ${week0.endDate.toDateString()}`);
  console.log(`📅 Week 1: ${week1.startDate.toDateString()} - ${week1.endDate.toDateString()}`);
  
  // Create base subscription
  const baseSubscription = await Subscription.create({
    customerId: customer._id,
    planId: 'quarterly',
    planName: 'Quarterly Meal Plan',
    duration: 90,
    price: 2999.99,
    monthlyPrice: 999.99,
    currency: 'INR',
    billingCycle: 'quarterly',
    deliveryFrequency: 'daily',
    status: 'active',
    startDate: week0.startDate,
    endDate: new Date(week0.startDate.getTime() + 90 * 24 * 60 * 60 * 1000),
    nextBillingDate: new Date(week0.startDate.getTime() + 90 * 24 * 60 * 60 * 1000),
    autoRenew: true,
    features: ['Meal Planning', 'Order Management', 'Delivery Tracking']
  });
  
  console.log(`✅ Created base subscription: ${baseSubscription._id}`);
  
  // Create Week 1 (Empty) and Week 2 (Fully Filled)
  const weeks = [
    {
      weekNumber: 1,
      weekStartDate: week0.startDate,
      weekEndDate: week0.endDate,
      meals: createEmptyWeekMeals() // Week 1: Empty
    },
    {
      weekNumber: 2,
      weekStartDate: week1.startDate,
      weekEndDate: week1.endDate,
      meals: createFullyFilledWeekMeals() // Week 2: Every slot filled
    }
  ];
  
  // Create subscription meal plan
  const subscription = await SubscriptionMealPlan.create({
    customerId: customer._id,
    restaurantId: restaurant._id,
    subscriptionId: baseSubscription._id,
    planType: 'quarterly',
    planStartDate: week0.startDate,
    planEndDate: new Date(week0.startDate.getTime() + 90 * 24 * 60 * 60 * 1000),
    weekStartDates: [week0.startDate, week1.startDate],
    weeks: weeks,
    billingCycle: 'quarterly',
    nextBillingDate: new Date(week0.startDate.getTime() + 90 * 24 * 60 * 60 * 1000),
    status: 'active',
    isOrdersGenerated: false,
    deliveryAddress: {
      street: '123 Test Street',
      city: 'Chennai',
      province: 'Tamil Nadu',
      postalCode: '600001',
      instructions: 'Test delivery for quarterly subscription'
    },
    specialInstructions: 'Test quarterly subscription - Week 1 empty, Week 2 fully filled'
  });
  
  console.log(`✅ Created subscription meal plan: ${subscription._id}`);
  
  // Show meal plan summary
  console.log('\n📊 Meal Plan Summary:');
  weeks.forEach((week, index) => {
    const mealCount = countWeekMeals(week);
    console.log(`   Week ${index + 1}: ${mealCount} meals`);
    
    if (mealCount > 0) {
      const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      daysOfWeek.forEach(day => {
        const dayMeals = week.meals[day];
        const lunchCount = dayMeals.lunch ? dayMeals.lunch.length : 0;
        const dinnerCount = dayMeals.dinner ? dayMeals.dinner.length : 0;
        if (lunchCount > 0 || dinnerCount > 0) {
          console.log(`      ${day}: L:${lunchCount}, D:${dinnerCount}`);
        }
      });
    }
  });
  
  // Generate all orders with repetition logic
  console.log('\n🚀 Generating Orders for 90-Day Subscription...');
  const orders = await generateAllSubscriptionOrders(subscription);
  
  console.log(`✅ Generated ${orders.length} orders for quarterly subscription`);
  
  // Analyze order distribution
  analyzeOrderDistribution(orders, subscription);
  
  return { subscription, orders };
}

/**
 * Create empty week meals (Week 1)
 */
function createEmptyWeekMeals() {
  return {
    sunday: { lunch: [], dinner: [] },
    monday: { lunch: [], dinner: [] },
    tuesday: { lunch: [], dinner: [] },
    wednesday: { lunch: [], dinner: [] },
    thursday: { lunch: [], dinner: [] },
    friday: { lunch: [], dinner: [] },
    saturday: { lunch: [], dinner: [] }
  };
}

/**
 * Create fully filled week meals (Week 2 - every slot filled)
 */
function createFullyFilledWeekMeals() {
  const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const meals = {};
  
  daysOfWeek.forEach((day, index) => {
    meals[day] = {
      lunch: [createMeal(`${day.charAt(0).toUpperCase() + day.slice(1)} Lunch Special`, 249 + (index * 10))],
      dinner: [createMeal(`${day.charAt(0).toUpperCase() + day.slice(1)} Dinner Deluxe`, 299 + (index * 15))]
    };
  });
  
  return meals;
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
    description: `Delicious ${name}`,
    category: 'Main Course',
    spiceLevel: 2,
    prepTime: 30
  };
}

/**
 * Count total meals in a week
 */
function countWeekMeals(week) {
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
}

/**
 * Analyze order distribution across the 90-day period
 */
function analyzeOrderDistribution(orders, subscription) {
  console.log('\n📈 Order Distribution Analysis:');
  console.log('-' .repeat(40));
  
  // Group orders by week
  const ordersByWeek = {};
  const startDate = new Date(subscription.planStartDate);
  
  orders.forEach(order => {
    const orderDate = new Date(order.scheduledDate);
    const weekNumber = Math.floor((orderDate - startDate) / (7 * 24 * 60 * 60 * 1000));
    
    if (!ordersByWeek[weekNumber]) {
      ordersByWeek[weekNumber] = 0;
    }
    ordersByWeek[weekNumber]++;
  });
  
  // Show weekly distribution
  console.log('📊 Orders by Week:');
  Object.keys(ordersByWeek).sort((a, b) => parseInt(a) - parseInt(b)).forEach(weekNum => {
    const weekIndex = parseInt(weekNum);
    const patternWeek = weekIndex % 2; // 0 = Week 1 (empty), 1 = Week 2 (full)
    const patternName = patternWeek === 0 ? 'Empty Week' : 'Full Week';
    
    console.log(`   Week ${weekIndex + 1}: ${ordersByWeek[weekNum]} orders (${patternName})`);
  });
  
  // Expected pattern analysis
  console.log('\n🎯 Expected Pattern:');
  console.log('   Week 1 (Empty): 0 orders');
  console.log('   Week 2 (Full): 14 orders (7 days × 2 meals)');
  console.log('   Pattern repeats: 0, 14, 0, 14, 0, 14...');
  
  const totalWeeks = Math.ceil(90 / 7); // ~13 weeks
  const fullWeeks = Math.floor(totalWeeks / 2); // Weeks with meals
  const expectedOrders = fullWeeks * 14; // Each full week has 14 meals
  
  console.log(`\n📋 Summary:`);
  console.log(`   Total Duration: 90 days (~${totalWeeks} weeks)`);
  console.log(`   Full Weeks: ${fullWeeks}`);
  console.log(`   Expected Orders: ~${expectedOrders}`);
  console.log(`   Actual Orders: ${orders.length}`);
  console.log(`   Match: ${Math.abs(orders.length - expectedOrders) <= 14 ? '✅' : '❌'}`);
  
  // Show first few order dates
  console.log('\n📅 First 10 Order Dates:');
  orders.slice(0, 10).forEach((order, index) => {
    const date = new Date(order.scheduledDate);
    const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
    console.log(`   ${index + 1}. ${date.toDateString()} (${dayName}) - ${order.mealType}: ${order.items[0].name}`);
  });
}

// Handle script termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Test interrupted');
  await mongoose.connection.close();
  process.exit(0);
});

// Run the test
testSpecificUserScenario();
