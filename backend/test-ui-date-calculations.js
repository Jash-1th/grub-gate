/**
 * Comprehensive test to identify UI date calculation issues
 * This will test all possible date calculation scenarios to find where Oct 11 → Oct 12 offset occurs
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./src/models/Order');
const SubscriptionMealPlan = require('./src/models/SubscriptionMealPlan');
const { getNextSunday, getWeekDateRange, findSubscriptionDayForDate, getCalendarDateForSubscriptionDay } = require('./src/utils/dateHelpers');

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

const testAllDateCalculations = async () => {
  try {
    console.log('🧪 Comprehensive UI Date Calculation Test');
    console.log('=' .repeat(70));
    console.log(`Current Time: ${new Date().toString()}`);
    console.log(`Current Time (ISO): ${new Date().toISOString()}`);
    console.log(`Current Time (Local): ${new Date().toLocaleString()}`);
    console.log(`Timezone Offset: ${new Date().getTimezoneOffset()} minutes`);

    // Test 1: Basic Date Creation and Manipulation
    console.log('\n📅 Test 1: Basic Date Operations');
    console.log('-' .repeat(50));
    
    const testDates = [
      new Date(2025, 9, 11), // Oct 11, 2025 (month is 0-indexed)
      new Date(2025, 9, 12), // Oct 12, 2025
      new Date(2025, 9, 13), // Oct 13, 2025
    ];
    
    testDates.forEach(date => {
      console.log(`Date: ${date.toDateString()} | Day: ${date.getDay()} | ISO: ${date.toISOString()}`);
      console.log(`  Local String: ${date.toLocaleString()}`);
      console.log(`  Date String: ${date.toDateString()}`);
      console.log(`  Time String: ${date.toTimeString()}`);
    });

    // Test 2: Frontend Date Helper Functions
    console.log('\n📅 Test 2: Frontend Date Helper Functions');
    console.log('-' .repeat(50));
    
    const nextSunday = getNextSunday();
    console.log(`getNextSunday(): ${nextSunday.toDateString()} (Day ${nextSunday.getDay()})`);
    
    for (let weekOffset = 0; weekOffset <= 2; weekOffset++) {
      const weekRange = getWeekDateRange(weekOffset);
      console.log(`Week ${weekOffset}: ${weekRange.startDate.toDateString()} - ${weekRange.endDate.toDateString()}`);
    }

    // Test 3: Day Name to Date Conversion
    console.log('\n📅 Test 3: Day Name to Date Conversion');
    console.log('-' .repeat(50));
    
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    
    for (let weekOffset = 0; weekOffset <= 1; weekOffset++) {
      console.log(`\nWeek ${weekOffset}:`);
      dayNames.forEach(dayName => {
        const calendarDate = getCalendarDateForSubscriptionDay(dayName, weekOffset);
        if (calendarDate) {
          console.log(`  ${dayName}: ${calendarDate.toDateString()} (Day ${calendarDate.getDay()})`);
        }
      });
    }

    // Test 4: Reverse Date to Day Name Conversion
    console.log('\n📅 Test 4: Date to Day Name Conversion (Critical Test)');
    console.log('-' .repeat(50));
    
    // Get subscription meal plan to test with
    const userId = '68e7b7ea4a70ed31cffb3fe9';
    const subscriptionPlan = await SubscriptionMealPlan.findOne({ customerId: userId });
    
    if (subscriptionPlan) {
      console.log(`Found subscription plan: ${subscriptionPlan._id}`);
      console.log(`Plan Start: ${subscriptionPlan.planStartDate.toDateString()}`);
      console.log(`Plan End: ${subscriptionPlan.planEndDate.toDateString()}`);
      
      // Test specific problematic dates
      const problematicDates = [
        new Date(2025, 9, 11), // Oct 11 (Friday)
        new Date(2025, 9, 12), // Oct 12 (Saturday) 
        new Date(2025, 9, 13), // Oct 13 (Sunday)
        new Date(2025, 9, 14), // Oct 14 (Monday)
      ];
      
      console.log('\n🚨 CRITICAL TEST: Date → Day Name Mapping');
      problematicDates.forEach(testDate => {
        const dayName = findSubscriptionDayForDate(testDate, subscriptionPlan.weeks);
        const expectedDayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][testDate.getDay()];
        const isCorrect = dayName === expectedDayName;
        
        console.log(`${testDate.toDateString()} (${expectedDayName}): `);
        console.log(`  Expected: ${expectedDayName}`);
        console.log(`  Got: ${dayName}`);
        console.log(`  Correct: ${isCorrect ? '✅' : '❌'}`);
        
        if (!isCorrect) {
          console.log(`  🚨 FOUND ISSUE: ${testDate.toDateString()} should map to ${expectedDayName} but got ${dayName}`);
        }
      });
    } else {
      console.log('❌ No subscription plan found for testing');
    }

    // Test 5: Order Generation Date Logic
    console.log('\n📅 Test 5: Order Generation Date Logic');
    console.log('-' .repeat(50));
    
    // Test the getTodaysMeals function for different dates
    if (subscriptionPlan) {
      const testOrderDates = [
        new Date(2025, 9, 11), // Oct 11
        new Date(2025, 9, 12), // Oct 12
        new Date(2025, 9, 13), // Oct 13
      ];
      
      testOrderDates.forEach(testDate => {
        console.log(`\nTesting getTodaysMeals for ${testDate.toDateString()}:`);
        
        // Simulate the getTodaysMeals logic
        const todaysMeals = [];
        const subscriptionDay = findSubscriptionDayForDate(testDate, subscriptionPlan.weeks);
        
        if (subscriptionDay) {
          // Find the week that contains this date
          const currentWeek = subscriptionPlan.weeks.find(week => {
            const weekStart = new Date(week.weekStartDate);
            weekStart.setHours(0, 0, 0, 0);
            const weekEnd = new Date(week.weekEndDate);
            weekEnd.setHours(23, 59, 59, 999);
            return testDate >= weekStart && testDate <= weekEnd;
          });
          
          if (currentWeek && currentWeek.meals[subscriptionDay]) {
            const dayMeals = currentWeek.meals[subscriptionDay];
            const lunchItems = dayMeals.lunch || [];
            const dinnerItems = dayMeals.dinner || [];
            todaysMeals.push(...lunchItems, ...dinnerItems);
          }
        }
        
        console.log(`  Subscription Day: ${subscriptionDay}`);
        console.log(`  Meals Found: ${todaysMeals.length}`);
        console.log(`  Expected Day: ${['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][testDate.getDay()]}`);
        
        if (subscriptionDay !== ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][testDate.getDay()]) {
          console.log(`  🚨 MISMATCH: Expected ${['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][testDate.getDay()]} but got ${subscriptionDay}`);
        }
      });
    }

    // Test 6: Timezone Edge Cases
    console.log('\n📅 Test 6: Timezone Edge Cases');
    console.log('-' .repeat(50));
    
    const edgeCaseDates = [
      new Date('2025-10-11T00:00:00.000Z'), // UTC midnight
      new Date('2025-10-11T18:30:00.000Z'), // UTC 6:30 PM (12:00 AM IST next day)
      new Date('2025-10-11T23:59:59.999Z'), // UTC end of day
      new Date('2025-10-12T00:00:00.000Z'), // UTC start of next day
    ];
    
    edgeCaseDates.forEach(date => {
      const localDate = new Date(date);
      console.log(`UTC: ${date.toISOString()}`);
      console.log(`Local: ${localDate.toString()}`);
      console.log(`Local Date: ${localDate.toDateString()}`);
      console.log(`Day of Week: ${localDate.getDay()} (${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][localDate.getDay()]})`);
      console.log('---');
    });

    // Test 7: Frontend Date Parsing Simulation
    console.log('\n📅 Test 7: Frontend Date Parsing Simulation');
    console.log('-' .repeat(50));
    
    // Simulate how frontend might parse dates from calendar selection
    const calendarSelections = [
      '2025-10-11', // ISO date string
      'Oct 11, 2025', // Formatted string
      'October 11, 2025', // Full month name
    ];
    
    calendarSelections.forEach(dateStr => {
      const parsedDate = new Date(dateStr);
      console.log(`Input: "${dateStr}"`);
      console.log(`Parsed: ${parsedDate.toString()}`);
      console.log(`Date: ${parsedDate.toDateString()}`);
      console.log(`Day: ${parsedDate.getDay()} (${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][parsedDate.getDay()]})`);
      console.log('---');
    });

    // Summary
    console.log('\n🎯 Summary and Recommendations');
    console.log('-' .repeat(50));
    console.log('If you see any ❌ MISMATCH or 🚨 FOUND ISSUE above, that indicates the source of the Oct 11 → Oct 12 problem.');
    console.log('Key areas to check:');
    console.log('1. findSubscriptionDayForDate function accuracy');
    console.log('2. Timezone handling in date parsing');
    console.log('3. Frontend calendar component date selection');
    console.log('4. Order generation date mapping');

  } catch (error) {
    console.error('❌ Error during comprehensive test:', error);
  }
};

const runTest = async () => {
  await connectDB();
  await testAllDateCalculations();
  await mongoose.connection.close();
  console.log('\n✅ Database connection closed');
};

runTest();
