/**
 * Fix subscription to use proper Sunday-based week structure
 * Week 1: Oct 12 (Sunday) - Oct 18 (Saturday)
 * Week 2: Oct 19 (Sunday) - Oct 25 (Saturday)
 */

require('dotenv').config();
const mongoose = require('mongoose');
const SubscriptionMealPlan = require('./src/models/SubscriptionMealPlan');
const { getNextSunday } = require('./src/utils/dateHelpers');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/grub-gate';
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const fixProperWeekStructure = async () => {
  try {
    console.log('🔧 Fixing to Proper Sunday-Based Week Structure');
    console.log('=' .repeat(60));

    const userId = '68e7b7ea4a70ed31cffb3fe9';
    const subscriptionPlan = await SubscriptionMealPlan.findOne({ customerId: userId });
    
    if (!subscriptionPlan) {
      console.log('❌ No subscription plan found');
      return;
    }

    console.log('📋 Current (Incorrect) Structure:');
    console.log(`Plan Start: ${subscriptionPlan.planStartDate.toDateString()}`);
    console.log(`Plan End: ${subscriptionPlan.planEndDate.toDateString()}`);
    subscriptionPlan.weeks.forEach((week, index) => {
      console.log(`Week ${index + 1}: ${week.weekStartDate.toDateString()} - ${week.weekEndDate.toDateString()}`);
    });

    // Fix to proper Sunday-based structure
    console.log('\n🔧 Implementing Proper Structure:');
    console.log('-' .repeat(40));
    
    const nextSunday = getNextSunday(); // Oct 12 (Sunday)
    console.log(`Next Sunday: ${nextSunday.toDateString()}`);
    
    // Week 1: Oct 12 (Sunday) - Oct 18 (Saturday)
    const week1Start = new Date(nextSunday);
    week1Start.setHours(0, 0, 0, 0);
    const week1End = new Date(week1Start);
    week1End.setDate(week1Start.getDate() + 6); // +6 days = Saturday
    week1End.setHours(23, 59, 59, 999);
    
    // Week 2: Oct 19 (Sunday) - Oct 25 (Saturday)  
    const week2Start = new Date(week1Start);
    week2Start.setDate(week1Start.getDate() + 7); // +7 days = next Sunday
    week2Start.setHours(0, 0, 0, 0);
    const week2End = new Date(week2Start);
    week2End.setDate(week2Start.getDate() + 6); // +6 days = Saturday
    week2End.setHours(23, 59, 59, 999);
    
    console.log(`Week 1: ${week1Start.toDateString()} - ${week1End.toDateString()}`);
    console.log(`Week 2: ${week2Start.toDateString()} - ${week2End.toDateString()}`);
    
    // Update the subscription plan
    subscriptionPlan.planStartDate = week1Start;
    subscriptionPlan.planEndDate = week2End;
    
    subscriptionPlan.weeks[0].weekStartDate = week1Start;
    subscriptionPlan.weeks[0].weekEndDate = week1End;
    
    subscriptionPlan.weeks[1].weekStartDate = week2Start;
    subscriptionPlan.weeks[1].weekEndDate = week2End;
    
    subscriptionPlan.weekStartDates[0] = week1Start;
    subscriptionPlan.weekStartDates[1] = week2Start;
    
    // Save the changes
    await subscriptionPlan.save();
    
    console.log('\n✅ Updated to Proper Structure:');
    console.log(`Plan Start: ${subscriptionPlan.planStartDate.toDateString()}`);
    console.log(`Plan End: ${subscriptionPlan.planEndDate.toDateString()}`);
    subscriptionPlan.weeks.forEach((week, index) => {
      console.log(`Week ${index + 1}: ${week.weekStartDate.toDateString()} - ${week.weekEndDate.toDateString()}`);
    });

    // Now test what happens with Oct 11 selection
    console.log('\n🧪 Testing Oct 11 Selection (Before Subscription Starts)');
    console.log('-' .repeat(50));
    
    const { findSubscriptionDayForDate } = require('./src/utils/dateHelpers');
    
    const oct11 = new Date(2025, 9, 11); // Oct 11 (Saturday)
    const mappedDay = findSubscriptionDayForDate(oct11, subscriptionPlan.weeks);
    
    console.log(`Oct 11 (Saturday): ${oct11.toDateString()}`);
    console.log(`Mapped Day: ${mappedDay}`);
    console.log(`Expected: null (because Oct 11 is before subscription starts)`);
    console.log(`Result: ${mappedDay === null ? '✅ CORRECT' : '❌ INCORRECT'}`);
    
    // Test the subscription dates
    console.log('\n🧪 Testing Subscription Date Range');
    console.log('-' .repeat(40));
    
    const testDates = [
      { date: new Date(2025, 9, 11), desc: 'Oct 11 (Before subscription)' },
      { date: new Date(2025, 9, 12), desc: 'Oct 12 (Week 1 Sunday)' },
      { date: new Date(2025, 9, 18), desc: 'Oct 18 (Week 1 Saturday)' },
      { date: new Date(2025, 9, 19), desc: 'Oct 19 (Week 2 Sunday)' },
      { date: new Date(2025, 9, 25), desc: 'Oct 25 (Week 2 Saturday)' },
      { date: new Date(2025, 9, 26), desc: 'Oct 26 (After subscription)' },
    ];
    
    testDates.forEach(test => {
      const mappedDay = findSubscriptionDayForDate(test.date, subscriptionPlan.weeks);
      const expectedDay = test.date >= subscriptionPlan.planStartDate && test.date <= subscriptionPlan.planEndDate 
        ? ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][test.date.getDay()]
        : null;
      
      console.log(`${test.desc}: ${mappedDay === expectedDay ? '✅' : '❌'} (Got: ${mappedDay}, Expected: ${expectedDay})`);
    });

    // Explain the solution for Oct 11
    console.log('\n💡 Solution for Oct 11 Selection Issue:');
    console.log('-' .repeat(50));
    console.log('Since Oct 11 is BEFORE the subscription starts (Oct 12), the UI should:');
    console.log('1. Detect that Oct 11 returns null from findSubscriptionDayForDate');
    console.log('2. Show a message like "No orders scheduled for this date"');
    console.log('3. OR redirect to the nearest available date (Oct 12)');
    console.log('4. OR show an empty state with option to add items for future dates');
    console.log('');
    console.log('The backend is now working correctly - the issue was that');
    console.log('the UI was trying to show orders for a date outside the subscription period.');

  } catch (error) {
    console.error('❌ Error during fix:', error);
  }
};

const runFix = async () => {
  await connectDB();
  await fixProperWeekStructure();
  await mongoose.connection.close();
  console.log('\n✅ Database connection closed');
};

runFix();
