/**
 * Focused test for Oct 11 → Oct 12 date offset issue
 */

require('dotenv').config();
const mongoose = require('mongoose');
const SubscriptionMealPlan = require('./src/models/SubscriptionMealPlan');
const { findSubscriptionDayForDate } = require('./src/utils/dateHelpers');

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

const testOct11Issue = async () => {
  try {
    console.log('🚨 FOCUSED TEST: Oct 11 → Oct 12 Issue');
    console.log('=' .repeat(60));

    // Get the test user's subscription plan
    const userId = '68e7b7ea4a70ed31cffb3fe9';
    const subscriptionPlan = await SubscriptionMealPlan.findOne({ customerId: userId });
    
    if (!subscriptionPlan) {
      console.log('❌ No subscription plan found');
      return;
    }

    console.log(`✅ Found subscription plan: ${subscriptionPlan._id}`);
    console.log(`Plan Start: ${subscriptionPlan.planStartDate.toDateString()} (${subscriptionPlan.planStartDate.toISOString()})`);
    console.log(`Plan End: ${subscriptionPlan.planEndDate.toDateString()} (${subscriptionPlan.planEndDate.toISOString()})`);
    
    console.log('\nWeek Details:');
    subscriptionPlan.weeks.forEach((week, index) => {
      console.log(`Week ${index + 1}:`);
      console.log(`  Start: ${week.weekStartDate.toDateString()} (${week.weekStartDate.toISOString()})`);
      console.log(`  End: ${week.weekEndDate.toDateString()} (${week.weekEndDate.toISOString()})`);
    });

    // Test the specific problematic scenario
    console.log('\n🎯 CRITICAL TEST: Oct 11 Selection');
    console.log('-' .repeat(40));
    
    // Create Oct 11, 2025 in different ways to see if parsing affects it
    const oct11Scenarios = [
      { name: 'new Date(2025, 9, 11)', date: new Date(2025, 9, 11) },
      { name: 'new Date("2025-10-11")', date: new Date('2025-10-11') },
      { name: 'new Date("2025-10-11T00:00:00")', date: new Date('2025-10-11T00:00:00') },
      { name: 'new Date("2025-10-11T00:00:00.000Z")', date: new Date('2025-10-11T00:00:00.000Z') },
      { name: 'new Date("Oct 11, 2025")', date: new Date('Oct 11, 2025') },
    ];

    oct11Scenarios.forEach(scenario => {
      console.log(`\n📅 Testing: ${scenario.name}`);
      console.log(`   Created Date: ${scenario.date.toString()}`);
      console.log(`   Date String: ${scenario.date.toDateString()}`);
      console.log(`   ISO String: ${scenario.date.toISOString()}`);
      console.log(`   Day of Week: ${scenario.date.getDay()} (${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][scenario.date.getDay()]})`);
      
      // Test with findSubscriptionDayForDate
      const mappedDay = findSubscriptionDayForDate(scenario.date, subscriptionPlan.weeks);
      const expectedDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][scenario.date.getDay()];
      
      console.log(`   Expected Day: ${expectedDay}`);
      console.log(`   Mapped Day: ${mappedDay}`);
      console.log(`   Correct: ${mappedDay === expectedDay ? '✅' : '❌'}`);
      
      if (mappedDay !== expectedDay) {
        console.log(`   🚨 ISSUE FOUND: ${scenario.date.toDateString()} should be ${expectedDay} but mapped to ${mappedDay}`);
      }
    });

    // Test edge cases around Oct 11-12 boundary
    console.log('\n🕐 TIMEZONE BOUNDARY TEST');
    console.log('-' .repeat(40));
    
    const boundaryTimes = [
      '2025-10-10T23:59:59.999Z', // End of Oct 10 UTC
      '2025-10-11T00:00:00.000Z', // Start of Oct 11 UTC
      '2025-10-11T18:29:59.999Z', // Just before IST midnight
      '2025-10-11T18:30:00.000Z', // IST midnight (Oct 12 00:00 IST)
      '2025-10-11T23:59:59.999Z', // End of Oct 11 UTC
      '2025-10-12T00:00:00.000Z', // Start of Oct 12 UTC
    ];

    boundaryTimes.forEach(timeStr => {
      const date = new Date(timeStr);
      const mappedDay = findSubscriptionDayForDate(date, subscriptionPlan.weeks);
      const expectedDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];
      
      console.log(`UTC: ${timeStr}`);
      console.log(`Local: ${date.toString()}`);
      console.log(`Date: ${date.toDateString()}`);
      console.log(`Expected: ${expectedDay}, Got: ${mappedDay}, Match: ${mappedDay === expectedDay ? '✅' : '❌'}`);
      console.log('---');
    });

    // Test the specific week ranges
    console.log('\n📊 WEEK RANGE ANALYSIS');
    console.log('-' .repeat(40));
    
    subscriptionPlan.weeks.forEach((week, index) => {
      console.log(`\nWeek ${index + 1} Analysis:`);
      
      const weekStart = new Date(week.weekStartDate);
      const weekEnd = new Date(week.weekEndDate);
      
      console.log(`  Start: ${weekStart.toDateString()} ${weekStart.toTimeString()}`);
      console.log(`  End: ${weekEnd.toDateString()} ${weekEnd.toTimeString()}`);
      
      // Test Oct 11 against this week
      const oct11 = new Date(2025, 9, 11);
      oct11.setHours(0, 0, 0, 0);
      
      weekStart.setHours(0, 0, 0, 0);
      weekEnd.setHours(23, 59, 59, 999);
      
      const isInWeek = oct11 >= weekStart && oct11 <= weekEnd;
      console.log(`  Oct 11 in this week: ${isInWeek ? '✅ YES' : '❌ NO'}`);
      
      if (isInWeek) {
        const dayIndex = Math.floor((oct11 - weekStart) / (24 * 60 * 60 * 1000));
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        console.log(`  Day index calculation: ${dayIndex}`);
        console.log(`  Calculated day: ${dayNames[dayIndex]}`);
        console.log(`  Expected day: saturday (Oct 11 is Saturday)`);
      }
    });

  } catch (error) {
    console.error('❌ Error during test:', error);
  }
};

const runTest = async () => {
  await connectDB();
  await testOct11Issue();
  await mongoose.connection.close();
  console.log('\n✅ Database connection closed');
};

runTest();
