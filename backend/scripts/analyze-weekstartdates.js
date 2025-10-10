// FILE: scripts/analyze-weekstartdates.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const SubscriptionMealPlan = require('../src/models/SubscriptionMealPlan');

/**
 * Analyze if empty weekStartDates is correct or problematic
 */
async function analyzeWeekStartDates() {
  try {
    console.log('🔍 ANALYZING WEEKSTARTDATES FIELD');
    console.log('=' .repeat(60));
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    
    const subscriptionId = '68e7735b4745431a2e887e53';
    
    // Get the subscription
    const subscription = await SubscriptionMealPlan.findById(subscriptionId);
    
    if (!subscription) {
      console.log('❌ Subscription not found');
      return;
    }
    
    console.log('📊 SUBSCRIPTION ANALYSIS:');
    console.log('-' .repeat(40));
    console.log(`ID: ${subscription._id}`);
    console.log(`Plan Type: ${subscription.planType}`);
    console.log(`Plan Start: ${subscription.planStartDate}`);
    console.log(`Plan End: ${subscription.planEndDate}`);
    console.log(`Week Start Dates: ${JSON.stringify(subscription.weekStartDates)}`);
    console.log(`Current Week Index: ${subscription.currentWeekIndex}`);
    console.log(`Weeks Array Length: ${subscription.weeks?.length || 0}`);
    console.log(`Generated Orders: ${subscription.generatedOrders?.length || 0}`);
    
    // Analyze the weeks array
    console.log('\n📅 WEEKS ARRAY ANALYSIS:');
    console.log('-' .repeat(30));
    
    if (subscription.weeks && subscription.weeks.length > 0) {
      subscription.weeks.forEach((week, index) => {
        console.log(`\nWeek ${index}:`);
        console.log(`  Week Number: ${week.weekNumber || 'Not set'}`);
        console.log(`  Week Start Date: ${week.weekStartDate || 'Not set'}`);
        console.log(`  Week End Date: ${week.weekEndDate || 'Not set'}`);
        console.log(`  Meals Count: ${Object.keys(week.meals || {}).length}`);
        
        // Check if week has meals
        if (week.meals) {
          let totalMeals = 0;
          Object.values(week.meals).forEach(day => {
            totalMeals += (day.lunch?.length || 0) + (day.dinner?.length || 0);
          });
          console.log(`  Total Meal Items: ${totalMeals}`);
        }
      });
    } else {
      console.log('❌ No weeks data found');
    }
    
    // Check what weekStartDates SHOULD contain
    console.log('\n🎯 WHAT WEEKSTARTDATES SHOULD CONTAIN:');
    console.log('-' .repeat(45));
    
    console.log('The weekStartDates field should contain:');
    console.log('1. 📅 Array of Date objects');
    console.log('2. 🗓️  Each date represents the start of a week in the subscription');
    console.log('3. 📊 Used for tracking which week of the subscription we\'re in');
    console.log('4. 🔄 Used for repetition logic in quarterly subscriptions');
    
    // Calculate what weekStartDates should be
    if (subscription.planStartDate && subscription.planType === 'quarterly') {
      console.log('\n📊 CALCULATED WEEKSTARTDATES:');
      console.log('-' .repeat(35));
      
      const startDate = new Date(subscription.planStartDate);
      const endDate = new Date(subscription.planEndDate);
      
      // Calculate number of weeks in subscription
      const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      const totalWeeks = Math.ceil(totalDays / 7);
      
      console.log(`Plan Duration: ${totalDays} days`);
      console.log(`Total Weeks: ${totalWeeks}`);
      
      console.log('\nExpected weekStartDates:');
      const expectedWeekStartDates = [];
      
      for (let i = 0; i < totalWeeks; i++) {
        const weekStart = new Date(startDate);
        weekStart.setDate(startDate.getDate() + (i * 7));
        expectedWeekStartDates.push(weekStart);
        
        if (i < 10) { // Show first 10 weeks
          console.log(`  Week ${i + 1}: ${weekStart.toDateString()}`);
        }
      }
      
      if (totalWeeks > 10) {
        console.log(`  ... and ${totalWeeks - 10} more weeks`);
      }
      
      console.log(`\nExpected Array Length: ${expectedWeekStartDates.length}`);
      console.log(`Actual Array Length: ${subscription.weekStartDates?.length || 0}`);
      
      const isEmpty = !subscription.weekStartDates || subscription.weekStartDates.length === 0;
      console.log(`Is Empty: ${isEmpty ? '❌ YES (PROBLEM)' : '✅ NO (CORRECT)'}`);
    }
    
    // Check if this affects functionality
    console.log('\n⚠️  IMPACT ANALYSIS:');
    console.log('-' .repeat(25));
    
    const isEmpty = !subscription.weekStartDates || subscription.weekStartDates.length === 0;
    
    if (isEmpty) {
      console.log('🚨 PROBLEMS CAUSED BY EMPTY weekStartDates:');
      console.log('1. ❌ Cannot track current week in subscription');
      console.log('2. ❌ Repetition logic may not work correctly');
      console.log('3. ❌ Week navigation in frontend may break');
      console.log('4. ❌ Billing cycle calculations may be affected');
      console.log('5. ❌ Order generation timing may be incorrect');
      
      console.log('\n💡 RECOMMENDED ACTIONS:');
      console.log('1. 🔧 Fix the subscription creation logic');
      console.log('2. 📊 Populate weekStartDates with correct dates');
      console.log('3. 🧪 Test subscription functionality');
      console.log('4. 🔄 Regenerate orders if needed');
    } else {
      console.log('✅ weekStartDates is properly populated');
      console.log('✅ Subscription should function correctly');
    }
    
    // Check if orders were generated correctly despite empty weekStartDates
    console.log('\n📋 ORDER GENERATION ANALYSIS:');
    console.log('-' .repeat(35));
    
    const orderCount = subscription.generatedOrders?.length || 0;
    console.log(`Generated Orders: ${orderCount}`);
    
    if (orderCount > 0) {
      console.log('✅ Orders were generated successfully');
      console.log('💭 This suggests the order generation used weeks array instead');
      console.log('⚠️  But weekStartDates should still be populated for other features');
    } else {
      console.log('❌ No orders generated - this is a bigger problem');
    }
    
  } catch (error) {
    console.error('💥 Analysis failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the analysis
analyzeWeekStartDates();
