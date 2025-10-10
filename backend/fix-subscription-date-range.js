/**
 * Fix subscription meal plan date ranges to include the Saturday before the first Sunday
 * This will resolve the Oct 11 → Oct 12 issue
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

const fixSubscriptionDateRange = async () => {
  try {
    console.log('🔧 Fixing Subscription Date Range Issue');
    console.log('=' .repeat(60));

    const userId = '68e7b7ea4a70ed31cffb3fe9';
    const subscriptionPlan = await SubscriptionMealPlan.findOne({ customerId: userId });
    
    if (!subscriptionPlan) {
      console.log('❌ No subscription plan found');
      return;
    }

    console.log('📋 Current Subscription Plan:');
    console.log(`Plan Start: ${subscriptionPlan.planStartDate.toDateString()}`);
    console.log(`Plan End: ${subscriptionPlan.planEndDate.toDateString()}`);
    
    subscriptionPlan.weeks.forEach((week, index) => {
      console.log(`Week ${index + 1}: ${week.weekStartDate.toDateString()} - ${week.weekEndDate.toDateString()}`);
    });

    // Option 1: Extend Week 1 to start on Saturday (Oct 11)
    console.log('\n🔧 Option 1: Extend Week 1 to include Saturday Oct 11');
    console.log('-' .repeat(50));
    
    const newWeek1Start = new Date(subscriptionPlan.weeks[0].weekStartDate);
    newWeek1Start.setDate(newWeek1Start.getDate() - 1); // Go back 1 day to Saturday
    
    console.log(`New Week 1 Start: ${newWeek1Start.toDateString()}`);
    console.log(`This would include Oct 11 (Saturday) in Week 1`);

    // Option 2: Create a "Week 0" that includes Saturday Oct 11
    console.log('\n🔧 Option 2: Create Week 0 for Saturday Oct 11');
    console.log('-' .repeat(50));
    
    const week0Start = new Date(subscriptionPlan.weeks[0].weekStartDate);
    week0Start.setDate(week0Start.getDate() - 1); // Saturday Oct 11
    const week0End = new Date(week0Start);
    week0End.setHours(23, 59, 59, 999); // End of Saturday
    
    console.log(`Week 0: ${week0Start.toDateString()} - ${week0End.toDateString()}`);

    // Let's implement Option 1 (extend Week 1 to include Saturday)
    console.log('\n✅ Implementing Fix: Extend Week 1 to include Saturday');
    console.log('-' .repeat(50));
    
    // Update Week 1 to start on Saturday Oct 11
    subscriptionPlan.weeks[0].weekStartDate = newWeek1Start;
    
    // Update the plan start date to match
    subscriptionPlan.planStartDate = newWeek1Start;
    
    // Update weekStartDates array
    subscriptionPlan.weekStartDates[0] = newWeek1Start;
    
    // Save the changes
    await subscriptionPlan.save();
    
    console.log('✅ Updated subscription plan:');
    console.log(`New Plan Start: ${subscriptionPlan.planStartDate.toDateString()}`);
    console.log(`New Week 1 Start: ${subscriptionPlan.weeks[0].weekStartDate.toDateString()}`);
    
    // Test the fix
    console.log('\n🧪 Testing the Fix');
    console.log('-' .repeat(30));
    
    const { findSubscriptionDayForDate } = require('./src/utils/dateHelpers');
    
    const testDates = [
      new Date(2025, 9, 11), // Oct 11 (Saturday)
      new Date(2025, 9, 12), // Oct 12 (Sunday)  
      new Date(2025, 9, 13), // Oct 13 (Monday)
    ];
    
    testDates.forEach(testDate => {
      const mappedDay = findSubscriptionDayForDate(testDate, subscriptionPlan.weeks);
      const expectedDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][testDate.getDay()];
      
      console.log(`${testDate.toDateString()}: Expected ${expectedDay}, Got ${mappedDay} ${mappedDay === expectedDay ? '✅' : '❌'}`);
    });

    console.log('\n🎯 Result:');
    console.log('Now when you select Oct 11 from the calendar, it should:');
    console.log('1. Map to "saturday" correctly');
    console.log('2. Show Oct 11 orders (not Oct 12 orders)');
    console.log('3. No more date offset issue');

  } catch (error) {
    console.error('❌ Error during fix:', error);
  }
};

const runFix = async () => {
  await connectDB();
  await fixSubscriptionDateRange();
  await mongoose.connection.close();
  console.log('\n✅ Database connection closed');
};

runFix();
