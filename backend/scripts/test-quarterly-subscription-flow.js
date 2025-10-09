// FILE: scripts/test-quarterly-subscription-flow.js
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
const { getWeekDateRange, getNextSunday } = require('../src/utils/dateHelpers');
const { generateAllSubscriptionOrders } = require('../src/services/enhancedOrderGenerationService');

/**
 * Test complete quarterly subscription flow with Week 0 empty, Week 1 with meals
 */
async function testQuarterlySubscriptionFlow() {
  try {
    console.log('🧪 Testing Complete Quarterly Subscription Flow...');
    console.log('=' .repeat(70));
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
    
    // Test data
    const customerId = '68e7578c70b1ebbce509b69c';
    const restaurantId = '68e73d168c18e7fd776a6327';
    
    const customer = await User.findById(customerId);
    const restaurant = await Restaurant.findById(restaurantId);
    
    console.log(`👤 Customer: ${customer.firstName} ${customer.lastName}`);
    console.log(`🏪 Restaurant: ${restaurant.name}`);
    
    // Step 1: Verify meal plan exists
    console.log('\n📋 Step 1: Verifying Meal Plan Data...');
    const mealPlan = await MealPlan.findOne({ userId: customerId });
    
    if (!mealPlan) {
      throw new Error('No meal plan found. Run add-test-meal-plan-data.js first');
    }
    
    console.log(`✅ Found meal plan with ${mealPlan.totalItems} items`);
    console.log(`   Week 0: ${countWeekItems(mealPlan.weeklyPlans.week0)} items (should be 0)`);
    console.log(`   Week 1: ${countWeekItems(mealPlan.weeklyPlans.week1)} items (should be 4)`);
    
    // Step 2: Simulate subscription creation (quarterly)
    console.log('\n💳 Step 2: Simulating Quarterly Subscription Creation...');
    
    // Clean up existing subscription data
    await SubscriptionMealPlan.deleteMany({ customerId: customerId });
    await Order.deleteMany({ customerId: customerId, isScheduledOrder: true });
    console.log('🗑️ Cleaned up existing subscription data');
    
    // Simulate the subscription creation process
    const today = new Date();
    const nextSunday = getNextSunday(today);
    
    console.log(`📅 Today: ${today.toDateString()}`);
    console.log(`📅 Plan Start (Next Sunday): ${nextSunday.toDateString()}`);
    
    // Convert meal plan data to subscription format (same as controller)
    const weeks = [];
    
    for (let weekIndex = 0; weekIndex < 2; weekIndex++) {
      const weekKey = `week${weekIndex}`;
      const weekData = mealPlan.weeklyPlans[weekKey];
      
      if (weekData) {
        const { startDate: weekStartDate, endDate: weekEndDate } = getWeekDateRange(weekIndex, today);
        
        const weekMeals = {};
        const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        
        for (const day of daysOfWeek) {
          weekMeals[day] = {
            lunch: (weekData[day]?.lunch || []).map(item => convertMealItem(item, 'lunch')),
            dinner: (weekData[day]?.dinner || []).map(item => convertMealItem(item, 'dinner'))
          };
        }
        
        weeks.push({
          weekNumber: weekIndex + 1,
          weekStartDate: weekStartDate,
          weekEndDate: weekEndDate,
          meals: weekMeals
        });
        
        console.log(`   Week ${weekIndex + 1}: ${weekStartDate.toDateString()} - ${weekEndDate.toDateString()} (${countWeekItems(weekData)} items)`);
      }
    }
    
    // Create SubscriptionMealPlan
    const planStartDate = new Date(nextSunday);
    planStartDate.setHours(0, 0, 0, 0);
    const planEndDate = new Date(planStartDate);
    planEndDate.setDate(planStartDate.getDate() + 90); // Quarterly = 90 days
    
    const subscriptionMealPlan = new SubscriptionMealPlan({
      customerId: customerId,
      restaurantId: restaurantId,
      planType: 'quarterly',
      planStartDate: planStartDate,
      planEndDate: planEndDate,
      weeks: weeks,
      deliveryAddress: {
        street: '123 Test Street',
        city: 'Chennai',
        province: 'Tamil Nadu',
        postalCode: '600001',
        instructions: 'Test quarterly subscription'
      },
      customerPhone: '+918125744350',
      specialInstructions: 'Quarterly subscription test',
      billingCycle: 'quarterly',
      nextBillingDate: new Date(planStartDate.getTime() + 90 * 24 * 60 * 60 * 1000),
      autoRenew: true,
      status: 'active',
      generatedOrders: [],
      isOrdersGenerated: false,
      selectedRestaurantName: restaurant.name,
      selectedRestaurantData: {
        name: restaurant.name,
        planName: 'Quarterly Meal Plan',
        monthlyPrice: 129.99,
        features: ['All Quarterly features', 'Premium customer support', 'Multiple restaurant selection'],
        paymentMethod: 'card'
      }
    });
    
    await subscriptionMealPlan.save();
    console.log(`✅ Created SubscriptionMealPlan: ${subscriptionMealPlan._id}`);
    console.log(`   Duration: ${planStartDate.toDateString()} to ${planEndDate.toDateString()} (90 days)`);
    
    // Step 3: Generate orders with repetition logic
    console.log('\n🚀 Step 3: Generating Orders with Repetition Logic...');
    
    const generatedOrders = await generateAllSubscriptionOrders(subscriptionMealPlan);
    
    console.log(`✅ Generated ${generatedOrders.length} total orders`);
    
    // Step 4: Analyze order distribution
    console.log('\n📊 Step 4: Analyzing Order Distribution...');
    
    const ordersByWeek = {};
    const ordersByStatus = { scheduled: 0, pending: 0, completed: 0 };
    
    generatedOrders.forEach(order => {
      // Calculate week number from start date
      const weekNum = Math.floor((order.scheduledDate - planStartDate) / (7 * 24 * 60 * 60 * 1000)) + 1;
      ordersByWeek[weekNum] = (ordersByWeek[weekNum] || 0) + 1;
      ordersByStatus[order.status] = (ordersByStatus[order.status] || 0) + 1;
    });
    
    console.log('📈 Orders by Week:');
    Object.keys(ordersByWeek).sort((a, b) => parseInt(a) - parseInt(b)).forEach(week => {
      const weekStart = new Date(planStartDate);
      weekStart.setDate(planStartDate.getDate() + (parseInt(week) - 1) * 7);
      const patternWeek = (parseInt(week) - 1) % 2; // 0 or 1
      const expectedOrders = patternWeek === 0 ? 0 : 4; // Week 0 = empty, Week 1 = 4 orders
      
      console.log(`   Week ${week} (${weekStart.toDateString()}): ${ordersByWeek[week]} orders (expected: ${expectedOrders}, pattern: Week ${patternWeek})`);
    });
    
    console.log('\n📊 Orders by Status:');
    Object.keys(ordersByStatus).forEach(status => {
      console.log(`   ${status}: ${ordersByStatus[status]} orders`);
    });
    
    // Step 5: Verify pattern correctness
    console.log('\n✅ Step 5: Pattern Verification...');
    
    let correctPattern = true;
    Object.keys(ordersByWeek).forEach(week => {
      const patternWeek = (parseInt(week) - 1) % 2;
      const expectedOrders = patternWeek === 0 ? 0 : 4;
      const actualOrders = ordersByWeek[week];
      
      if (actualOrders !== expectedOrders) {
        console.log(`❌ Week ${week}: Expected ${expectedOrders}, got ${actualOrders}`);
        correctPattern = false;
      }
    });
    
    if (correctPattern) {
      console.log('✅ Pattern verification PASSED - alternating empty/meal weeks correct!');
    } else {
      console.log('❌ Pattern verification FAILED - check repetition logic');
    }
    
    // Step 6: Show sample orders
    console.log('\n📋 Step 6: Sample Orders (First 10):');
    generatedOrders.slice(0, 10).forEach((order, index) => {
      const weekNum = Math.floor((order.scheduledDate - planStartDate) / (7 * 24 * 60 * 60 * 1000)) + 1;
      console.log(`   ${index + 1}. ${order.scheduledDate.toDateString()} ${order.mealType} - Week ${weekNum} - ${order.status}`);
    });
    
    // Step 7: Partner dashboard simulation
    console.log('\n🏪 Step 7: Partner Dashboard Simulation...');
    
    const todayOrders = generatedOrders.filter(order => {
      const orderDate = new Date(order.scheduledDate);
      orderDate.setHours(0, 0, 0, 0);
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);
      return orderDate.getTime() === todayDate.getTime() && order.status === 'pending';
    });
    
    console.log(`📅 Orders showing in partner dashboard TODAY: ${todayOrders.length}`);
    console.log('   (Should be 0 since first orders are scheduled for Oct 19)');
    
    const firstMealWeekOrders = generatedOrders.filter(order => {
      const orderDate = new Date(order.scheduledDate);
      const oct19 = new Date('2025-10-19');
      const oct25 = new Date('2025-10-25');
      return orderDate >= oct19 && orderDate <= oct25;
    });
    
    console.log(`📅 Orders for first meal week (Oct 19-25): ${firstMealWeekOrders.length}`);
    console.log('   (Should be 4 orders - matching Week 1 pattern)');
    
    console.log('\n🎉 Quarterly Subscription Flow Test Complete!');
    
  } catch (error) {
    console.error('💥 Test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

/**
 * Convert meal item to SubscriptionMealPlan format
 */
function convertMealItem(item, mealType) {
  return {
    id: item.id || item._id?.toString() || new Date().getTime().toString(),
    planId: item.planId || new Date().getTime().toString(),
    menuItemId: item.id || item._id?.toString(),
    name: item.name,
    price: item.price,
    restaurantName: item.restaurantName,
    deliveryTime: mealType === 'lunch' ? '12:30' : '19:30',
    specialInstructions: item.specialInstructions || '',
    description: item.description,
    image: item.image,
    category: item.category,
    dietaryPreferences: item.dietaryPreferences || [],
    spiceLevel: item.spiceLevel,
    prepTime: item.prepTime,
    servings: item.servings || 1,
    ingredients: item.ingredients || []
  };
}

/**
 * Count items in a week
 */
function countWeekItems(weekData) {
  if (!weekData) return 0;
  
  let count = 0;
  const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  
  daysOfWeek.forEach(day => {
    if (weekData[day]) {
      count += (weekData[day].lunch?.length || 0) + (weekData[day].dinner?.length || 0);
    }
  });
  
  return count;
}

// Handle script termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Test interrupted');
  await mongoose.connection.close();
  process.exit(0);
});

// Run the test
testQuarterlySubscriptionFlow();
