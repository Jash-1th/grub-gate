/**
 * Final verification test for the Oct 11 → Oct 12 fix
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

const finalVerificationTest = async () => {
  try {
    console.log('🎉 FINAL VERIFICATION: Oct 11 → Oct 12 Fix');
    console.log('=' .repeat(60));

    const userId = '68e7b7ea4a70ed31cffb3fe9';
    const subscriptionPlan = await SubscriptionMealPlan.findOne({ customerId: userId });
    
    if (!subscriptionPlan) {
      console.log('❌ No subscription plan found');
      return;
    }

    // Test the complete date range
    console.log('📅 Testing Complete Date Range');
    console.log('-' .repeat(40));
    
    const testDates = [];
    for (let day = 11; day <= 25; day++) {
      testDates.push(new Date(2025, 9, day)); // Oct 11-25
    }
    
    let allCorrect = true;
    
    testDates.forEach(testDate => {
      const mappedDay = findSubscriptionDayForDate(testDate, subscriptionPlan.weeks);
      const expectedDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][testDate.getDay()];
      const isCorrect = mappedDay === expectedDay;
      
      if (!isCorrect) allCorrect = false;
      
      console.log(`${testDate.toDateString()}: Expected ${expectedDay}, Got ${mappedDay} ${isCorrect ? '✅' : '❌'}`);
    });

    // Test specific user scenario
    console.log('\n🎯 User Scenario Test');
    console.log('-' .repeat(40));
    console.log('Scenario: User selects Oct 11 from calendar');
    
    const userSelectedDate = new Date(2025, 9, 11); // Oct 11
    const mappedDay = findSubscriptionDayForDate(userSelectedDate, subscriptionPlan.weeks);
    
    console.log(`Selected Date: ${userSelectedDate.toDateString()}`);
    console.log(`Mapped to Day: ${mappedDay}`);
    console.log(`Expected: saturday`);
    console.log(`Result: ${mappedDay === 'saturday' ? '✅ CORRECT - Shows Oct 11 orders' : '❌ INCORRECT - Still showing wrong orders'}`);

    // Test edge cases
    console.log('\n🔍 Edge Case Tests');
    console.log('-' .repeat(40));
    
    const edgeCases = [
      { name: 'Start of subscription (Oct 11)', date: new Date(2025, 9, 11) },
      { name: 'End of Week 1 (Oct 18)', date: new Date(2025, 9, 18) },
      { name: 'Start of Week 2 (Oct 19)', date: new Date(2025, 9, 19) },
      { name: 'End of subscription (Oct 25)', date: new Date(2025, 9, 25) },
    ];
    
    edgeCases.forEach(testCase => {
      const mappedDay = findSubscriptionDayForDate(testCase.date, subscriptionPlan.weeks);
      const expectedDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][testCase.date.getDay()];
      const isCorrect = mappedDay === expectedDay;
      
      console.log(`${testCase.name}: ${isCorrect ? '✅' : '❌'} (${testCase.date.toDateString()} → ${mappedDay})`);
    });

    // Summary
    console.log('\n🎯 FINAL RESULT');
    console.log('-' .repeat(40));
    
    if (allCorrect) {
      console.log('🎉 SUCCESS: All date mappings are now CORRECT!');
      console.log('');
      console.log('✅ Oct 11 selection → Shows Oct 11 orders (not Oct 12)');
      console.log('✅ Oct 12 selection → Shows Oct 12 orders');
      console.log('✅ All dates map to correct days');
      console.log('✅ No more +1 day offset issue');
      console.log('');
      console.log('🚀 The live webpage should now work correctly!');
      console.log('   When you select Oct 11 from the calendar,');
      console.log('   it will show Oct 11 orders, not Oct 12 orders.');
    } else {
      console.log('❌ ISSUE: Some date mappings are still incorrect');
      console.log('   Check the failed tests above for details');
    }

  } catch (error) {
    console.error('❌ Error during verification:', error);
  }
};

const runTest = async () => {
  await connectDB();
  await finalVerificationTest();
  await mongoose.connection.close();
  console.log('\n✅ Database connection closed');
};

runTest();
