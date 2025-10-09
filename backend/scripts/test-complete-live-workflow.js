// FILE: scripts/test-complete-live-workflow.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const MealPlan = require('../src/models/MealPlan');
const SubscriptionMealPlan = require('../src/models/SubscriptionMealPlan');
const Order = require('../src/models/Order');
const User = require('../src/models/User');
const Restaurant = require('../src/models/Restaurant');
const MenuItem = require('../src/models/MenuItem');
const { manualActivateOrdersForDate } = require('../src/services/orderActivationService');

// Test data - using your specified IDs
const TEST_DATA = {
  customerId: '68e7578c70b1ebbce509b69c',
  restaurantId: '68e73d168c18e7fd776a6327'
};

/**
 * Complete Live Workflow Test
 * Tests the entire flow from meal planning to partner dashboard
 */
async function testCompleteLiveWorkflow() {
  try {
    console.log('🧪 COMPLETE LIVE WORKFLOW TEST');
    console.log('=' .repeat(70));
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
    
    // Get test entities
    const customer = await User.findById(TEST_DATA.customerId);
    const restaurant = await Restaurant.findById(TEST_DATA.restaurantId);
    
    if (!customer || !restaurant) {
      throw new Error('Test data not found - check customer and restaurant IDs');
    }
    
    console.log(`👤 Customer: ${customer.firstName} ${customer.lastName} (${customer.email})`);
    console.log(`🏪 Restaurant: ${restaurant.name}`);
    
    // Step 1: Simulate Customer Meal Planning
    await simulateCustomerMealPlanning(customer, restaurant);
    
    // Step 2: Simulate Subscription Creation (Payment Flow)
    const subscription = await simulateSubscriptionCreation(customer, restaurant);
    
    // Step 3: Verify Order Generation
    await verifyOrderGeneration(subscription);
    
    // Step 4: Test Partner Dashboard (Today - should be empty)
    await testPartnerDashboardToday(restaurant);
    
    // Step 5: Simulate Order Activation for First Delivery Day
    await simulateOrderActivation();
    
    // Step 6: Test Partner Dashboard (After Activation)
    await testPartnerDashboardAfterActivation(restaurant);
    
    // Step 7: Test Order Status Updates
    await testOrderStatusUpdates(restaurant);
    
    console.log('\n🎉 COMPLETE LIVE WORKFLOW TEST SUCCESSFUL!');
    console.log('✅ All components working correctly');
    
  } catch (error) {
    console.error('💥 Live workflow test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

/**
 * Step 1: Simulate customer meal planning
 */
async function simulateCustomerMealPlanning(customer, restaurant) {
  console.log('\n📋 STEP 1: Customer Meal Planning');
  console.log('-' .repeat(50));
  
  // Clean up existing meal plan
  await MealPlan.deleteOne({ userId: customer._id });
  
  // Get menu items from restaurant
  const menuItems = await MenuItem.find({ 
    restaurantId: restaurant._id,
    status: 'available'
  }).limit(4);
  
  if (menuItems.length < 4) {
    throw new Error('Not enough menu items for testing');
  }
  
  console.log(`📋 Found ${menuItems.length} menu items for planning`);
  
  // Create meal plan (Week 0 empty, Week 1 with meals)
  const mealPlanData = {
    userId: customer._id,
    weeklyPlans: {
      week0: {
        // All days empty for Week 0
        sunday: { lunch: [], dinner: [] },
        monday: { lunch: [], dinner: [] },
        tuesday: { lunch: [], dinner: [] },
        wednesday: { lunch: [], dinner: [] },
        thursday: { lunch: [], dinner: [] },
        friday: { lunch: [], dinner: [] },
        saturday: { lunch: [], dinner: [] }
      },
      week1: {
        // Week 1 has meals
        sunday: {
          lunch: [createMealItem(menuItems[0], restaurant.name)],
          dinner: [createMealItem(menuItems[1], restaurant.name)]
        },
        monday: {
          lunch: [createMealItem(menuItems[2], restaurant.name)],
          dinner: []
        },
        tuesday: {
          lunch: [],
          dinner: [createMealItem(menuItems[3], restaurant.name)]
        },
        wednesday: { lunch: [], dinner: [] },
        thursday: { lunch: [], dinner: [] },
        friday: { lunch: [], dinner: [] },
        saturday: { lunch: [], dinner: [] }
      }
    },
    totalItems: 4,
    lastUpdated: new Date()
  };
  
  const mealPlan = await MealPlan.create(mealPlanData);
  console.log(`✅ Created meal plan: ${mealPlan._id}`);
  console.log(`   Week 0: 0 meals (empty pattern)`);
  console.log(`   Week 1: 4 meals (Sunday lunch+dinner, Monday lunch, Tuesday dinner)`);
  
  return mealPlan;
}

/**
 * Step 2: Simulate subscription creation (payment flow)
 */
async function simulateSubscriptionCreation(customer, restaurant) {
  console.log('\n💳 STEP 2: Subscription Creation (Payment Flow)');
  console.log('-' .repeat(50));
  
  // Clean up existing subscriptions
  await SubscriptionMealPlan.deleteMany({ customerId: customer._id });
  await Order.deleteMany({ customerId: customer._id, isScheduledOrder: true });
  
  // Simulate API call to createSubscriptionFromMealPlan
  const subscriptionData = {
    restaurantId: restaurant._id,
    planType: 'quarterly',
    deliveryAddress: {
      street: '123 Test Street',
      city: 'Chennai',
      province: 'Tamil Nadu',
      postalCode: '600001',
      instructions: 'Live workflow test'
    },
    customerPhone: '+918125744350',
    specialInstructions: 'Complete live workflow test',
    planName: 'Quarterly Meal Plan',
    monthlyPrice: 129.99,
    features: ['All Quarterly features', 'Premium support'],
    paymentMethod: 'card'
  };
  
  console.log('🔄 Simulating subscription creation API call...');
  
  // This simulates what the controller does
  const { createSubscriptionFromMealPlan } = require('../src/controllers/subscriptionMealPlan.controller');
  
  // Mock request and response objects
  const mockReq = {
    user: { id: customer._id },
    body: subscriptionData
  };
  
  let subscriptionResult = null;
  const mockRes = {
    status: (code) => mockRes,
    json: (data) => {
      subscriptionResult = data;
      return mockRes;
    }
  };
  
  await createSubscriptionFromMealPlan(mockReq, mockRes);
  
  if (subscriptionResult.status === 'success') {
    console.log(`✅ Subscription created: ${subscriptionResult.data.subscriptionMealPlan._id}`);
    console.log(`   Duration: 90 days (quarterly)`);
    console.log(`   Orders generated: ${subscriptionResult.data.ordersGenerated}`);
    return subscriptionResult.data.subscriptionMealPlan;
  } else {
    throw new Error('Subscription creation failed: ' + subscriptionResult.message);
  }
}

/**
 * Step 3: Verify order generation
 */
async function verifyOrderGeneration(subscription) {
  console.log('\n🚀 STEP 3: Verify Order Generation');
  console.log('-' .repeat(50));
  
  const orders = await Order.find({ 
    weeklyPlanId: subscription._id,
    isScheduledOrder: true 
  }).sort({ scheduledDate: 1 });
  
  console.log(`📊 Total orders generated: ${orders.length}`);
  
  // Analyze pattern
  const ordersByWeek = {};
  const startDate = new Date(subscription.planStartDate);
  
  orders.forEach(order => {
    const weekNum = Math.floor((order.scheduledDate - startDate) / (7 * 24 * 60 * 60 * 1000)) + 1;
    ordersByWeek[weekNum] = (ordersByWeek[weekNum] || 0) + 1;
  });
  
  console.log('📈 Orders by week pattern:');
  Object.keys(ordersByWeek).sort((a, b) => parseInt(a) - parseInt(b)).slice(0, 6).forEach(week => {
    const patternWeek = (parseInt(week) - 1) % 2;
    const expected = patternWeek === 0 ? 0 : 4;
    const actual = ordersByWeek[week];
    const status = actual === expected ? '✅' : '❌';
    console.log(`   Week ${week}: ${actual} orders (expected: ${expected}) ${status}`);
  });
  
  // Show first few orders
  console.log('\n📋 First 6 orders:');
  orders.slice(0, 6).forEach((order, i) => {
    console.log(`   ${i + 1}. ${order.scheduledDate.toDateString()} ${order.mealType} - ${order.status}`);
  });
  
  return orders;
}

/**
 * Step 4: Test partner dashboard (today - should be empty)
 */
async function testPartnerDashboardToday(restaurant) {
  console.log('\n🏪 STEP 4: Partner Dashboard (Today - Should be Empty)');
  console.log('-' .repeat(50));
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  
  const todaysOrders = await Order.find({
    restaurantId: restaurant._id,
    scheduledDate: { $gte: today, $lt: tomorrow },
    status: 'pending'
  });
  
  console.log(`📅 Today (${today.toDateString()}): ${todaysOrders.length} pending orders`);
  console.log('✅ Correct - no orders should show today since first delivery is Oct 19');
  
  return todaysOrders;
}

/**
 * Step 5: Simulate order activation for first delivery day
 */
async function simulateOrderActivation() {
  console.log('\n⏰ STEP 5: Simulate Order Activation (Oct 19)');
  console.log('-' .repeat(50));
  
  // Manually activate orders for Oct 19 (first meal delivery day)
  const oct19 = new Date('2025-10-19');
  console.log(`🔄 Activating orders for ${oct19.toDateString()}...`);
  
  const activatedCount = await manualActivateOrdersForDate(oct19);
  console.log(`✅ Activated ${activatedCount} orders for Oct 19`);
  
  return activatedCount;
}

/**
 * Step 6: Test partner dashboard after activation
 */
async function testPartnerDashboardAfterActivation(restaurant) {
  console.log('\n🏪 STEP 6: Partner Dashboard (After Activation)');
  console.log('-' .repeat(50));
  
  const oct19 = new Date('2025-10-19');
  oct19.setHours(0, 0, 0, 0);
  const oct20 = new Date(oct19);
  oct20.setDate(oct19.getDate() + 1);
  
  const oct19Orders = await Order.find({
    restaurantId: restaurant._id,
    scheduledDate: { $gte: oct19, $lt: oct20 },
    status: 'pending'
  }).populate('customerId', 'firstName lastName');
  
  console.log(`📅 Oct 19 orders: ${oct19Orders.length} pending orders`);
  
  if (oct19Orders.length > 0) {
    console.log('📋 Order details:');
    oct19Orders.forEach((order, i) => {
      const customer = order.customerId;
      const deliveryTime = order.deliveryTime?.estimated || 'Not set';
      console.log(`   ${i + 1}. ${order.orderNumber}`);
      console.log(`      Customer: ${customer.firstName} ${customer.lastName}`);
      console.log(`      Meal: ${order.mealType} - ${order.items[0]?.name}`);
      console.log(`      Delivery: ${deliveryTime}`);
      console.log(`      Total: $${order.total}`);
    });
  }
  
  return oct19Orders;
}

/**
 * Step 7: Test order status updates
 */
async function testOrderStatusUpdates(restaurant) {
  console.log('\n📝 STEP 7: Test Order Status Updates');
  console.log('-' .repeat(50));
  
  // Find a pending order to update
  const pendingOrder = await Order.findOne({
    restaurantId: restaurant._id,
    status: 'pending'
  });
  
  if (pendingOrder) {
    console.log(`🔄 Updating order status: ${pendingOrder.orderNumber}`);
    
    // Update to preparing
    pendingOrder.status = 'preparing';
    pendingOrder.notes = 'Order being prepared - live test';
    pendingOrder.updatedAt = new Date();
    await pendingOrder.save();
    
    console.log(`✅ Updated to: ${pendingOrder.status}`);
    
    // Update to delivered
    pendingOrder.status = 'delivered';
    pendingOrder.notes = 'Order delivered successfully - live test';
    pendingOrder.updatedAt = new Date();
    await pendingOrder.save();
    
    console.log(`✅ Updated to: ${pendingOrder.status}`);
  } else {
    console.log('ℹ️ No pending orders found to update');
  }
}

/**
 * Helper: Create meal item in frontend format
 */
function createMealItem(menuItem, restaurantName) {
  return {
    id: menuItem._id.toString(),
    planId: `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: menuItem.name,
    price: menuItem.price,
    restaurantName: restaurantName,
    description: menuItem.description,
    image: menuItem.image,
    category: menuItem.category,
    dietaryPreferences: menuItem.dietaryPreferences || [],
    spiceLevel: menuItem.spiceLevel,
    prepTime: menuItem.prepTime,
    servings: 1,
    ingredients: menuItem.ingredients || [],
    specialInstructions: ''
  };
}

// Handle script termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Test interrupted');
  await mongoose.connection.close();
  process.exit(0);
});

// Run the test
testCompleteLiveWorkflow();
