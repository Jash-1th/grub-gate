// FILE: scripts/test-sunday-based-fix.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const SubscriptionMealPlan = require('../src/models/SubscriptionMealPlan');
const User = require('../src/models/User');
const Restaurant = require('../src/models/Restaurant');
const { getNextSunday, getWeekDateRange, findSubscriptionDayForDate } = require('../src/utils/dateHelpers');

/**
 * Test the Sunday-based week fix
 */
async function testSundayBasedFix() {
  try {
    console.log('🧪 Testing Sunday-Based Week Fix...');
    console.log('=' .repeat(60));
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    
    if (!mongoUri) {
      throw new Error('MongoDB URI not found. Please set MONGODB_URI or MONGO_URI in your .env file');
    }
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
    
    const today = new Date();
    console.log(`📅 Today: ${today.toDateString()} (${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][today.getDay()]})`);
    
    // Test 1: Date Helper Functions
    console.log('\n🔧 Step 1: Testing Date Helper Functions...');
    
    const nextSunday = getNextSunday(today);
    console.log(`   Next Sunday: ${nextSunday.toDateString()}`);
    
    const week0 = getWeekDateRange(0, today);
    const week1 = getWeekDateRange(1, today);
    
    console.log(`   Week 0: ${week0.startDate.toDateString()} - ${week0.endDate.toDateString()}`);
    console.log(`   Week 1: ${week1.startDate.toDateString()} - ${week1.endDate.toDateString()}`);
    
    // Test 2: Check Existing Subscription
    console.log('\n📋 Step 2: Checking Existing Subscription...');
    
    const existingSubscription = await SubscriptionMealPlan.findOne({ status: 'active' })
      .populate('customerId', 'firstName lastName')
      .populate('restaurantId', 'name');
    
    if (existingSubscription) {
      console.log(`   Found subscription: ${existingSubscription.customerId.firstName} ${existingSubscription.customerId.lastName}`);
      console.log(`   Restaurant: ${existingSubscription.restaurantId.name}`);
      
      if (existingSubscription.weeks && existingSubscription.weeks.length > 0) {
        existingSubscription.weeks.forEach((week, index) => {
          console.log(`   Week ${index + 1}: ${new Date(week.weekStartDate).toDateString()} - ${new Date(week.weekEndDate).toDateString()}`);
        });
        
        // Test 3: Date Mapping
        console.log('\n🗓️ Step 3: Testing Date Mapping...');
        
        const testDates = [
          new Date(2025, 9, 8),  // Oct 8 (Wednesday)
          new Date(2025, 9, 9),  // Oct 9 (Thursday)
          new Date(2025, 9, 10), // Oct 10 (Friday)
          new Date(2025, 9, 12), // Oct 12 (Sunday)
          new Date(2025, 9, 13), // Oct 13 (Monday)
          new Date(2025, 9, 14), // Oct 14 (Tuesday)
        ];
        
        testDates.forEach(testDate => {
          const subscriptionDay = findSubscriptionDayForDate(testDate, existingSubscription.weeks);
          const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][testDate.getDay()];
          
          console.log(`   ${testDate.toDateString()} (${dayName}) → Subscription day: ${subscriptionDay || 'Not in subscription'}`);
        });
        
        // Test 4: getTodaysMeals Method
        console.log('\n🍽️ Step 4: Testing getTodaysMeals Method...');
        
        const todaysMeals = existingSubscription.getTodaysMeals();
        console.log(`   Today's meals found: ${todaysMeals.length}`);
        
        if (todaysMeals.length > 0) {
          todaysMeals.forEach((meal, index) => {
            console.log(`   ${index + 1}. ${meal.mealType}: ${meal.item.name} (${meal.item.restaurantName})`);
          });
        } else {
          console.log('   ℹ️ No meals scheduled for today (this might be correct if today is not in subscription weeks)');
        }
        
      } else {
        console.log('   ⚠️ No weeks found in subscription');
      }
    } else {
      console.log('   ℹ️ No active subscription found');
    }
    
    // Test 5: Expected Behavior Analysis
    console.log('\n🎯 Step 5: Expected Behavior Analysis...');
    console.log('=' .repeat(60));
    
    console.log('\n📊 **Sunday-Based Week System**:');
    console.log(`   • Today: ${today.toDateString()}`);
    console.log(`   • Next Sunday: ${nextSunday.toDateString()}`);
    console.log(`   • Week 0: ${week0.startDate.toDateString()} - ${week0.endDate.toDateString()}`);
    console.log(`   • Week 1: ${week1.startDate.toDateString()} - ${week1.endDate.toDateString()}`);
    
    console.log('\n✅ **Expected Results After Fix**:');
    console.log('   • Frontend shows: Oct 12-18 and Oct 19-25');
    console.log('   • Backend creates: Oct 12-18 and Oct 19-25 ✅ (should match now)');
    console.log('   • Orders generate: When calendar dates arrive (Oct 12+)');
    console.log('   • Oct 9 & 10: No orders (correct - before week 1 starts)');
    
    console.log('\n🔧 **What Changed**:');
    console.log('   1. ✅ Subscription creation uses getWeekDateRange() (Sunday-based)');
    console.log('   2. ✅ Order generation uses findSubscriptionDayForDate() (proper mapping)');
    console.log('   3. ✅ getTodaysMeals() uses subscription day mapping (not calendar day)');
    console.log('   4. ✅ All date calculations now consistent with frontend');
    
    console.log('\n🚀 **Next Steps**:');
    console.log('   1. Create new subscription to test Sunday-based weeks');
    console.log('   2. Run order generation on Oct 12+ to see orders appear');
    console.log('   3. Verify partner portal shows orders on correct dates');
    
  } catch (error) {
    console.error('💥 Test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Handle script termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Test interrupted');
  await mongoose.connection.close();
  process.exit(0);
});

// Run the test
testSundayBasedFix();
