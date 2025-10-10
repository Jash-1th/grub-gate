/**
 * Fix week boundary issue where Oct 18 falls between weeks
 */

require('dotenv').config();
const mongoose = require('mongoose');
const SubscriptionMealPlan = require('./src/models/SubscriptionMealPlan');

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

const fixWeekBoundaries = async () => {
  try {
    console.log('🔧 Fixing Week Boundary Issue');
    console.log('=' .repeat(50));

    const userId = '68e7b7ea4a70ed31cffb3fe9';
    const subscriptionPlan = await SubscriptionMealPlan.findOne({ customerId: userId });
    
    if (!subscriptionPlan) {
      console.log('❌ No subscription plan found');
      return;
    }

    console.log('📋 Current Week Boundaries:');
    subscriptionPlan.weeks.forEach((week, index) => {
      console.log(`Week ${index + 1}: ${week.weekStartDate.toDateString()} - ${week.weekEndDate.toDateString()}`);
    });

    // The issue: Week 1 ends on Oct 18, Week 2 starts on Oct 19
    // This leaves Oct 18 in a gap. Let's fix this:
    
    console.log('\n🔧 Fixing Week 1 End Date');
    console.log('-' .repeat(30));
    
    // Week 1 should end on Oct 17 (Friday), not Oct 18 (Saturday)
    const week1End = new Date(2025, 9, 17); // Oct 17
    week1End.setHours(23, 59, 59, 999);
    
    subscriptionPlan.weeks[0].weekEndDate = week1End;
    
    console.log(`Updated Week 1: ${subscriptionPlan.weeks[0].weekStartDate.toDateString()} - ${week1End.toDateString()}`);
    
    // Week 2 should start on Oct 18 (Saturday), not Oct 19 (Sunday)
    const week2Start = new Date(2025, 9, 18); // Oct 18
    week2Start.setHours(0, 0, 0, 0);
    
    subscriptionPlan.weeks[1].weekStartDate = week2Start;
    subscriptionPlan.weekStartDates[1] = week2Start;
    
    console.log(`Updated Week 2: ${week2Start.toDateString()} - ${subscriptionPlan.weeks[1].weekEndDate.toDateString()}`);
    
    // Save the changes
    await subscriptionPlan.save();
    
    console.log('\n✅ Updated week boundaries:');
    subscriptionPlan.weeks.forEach((week, index) => {
      console.log(`Week ${index + 1}: ${week.weekStartDate.toDateString()} - ${week.weekEndDate.toDateString()}`);
    });

    // Test the fix
    console.log('\n🧪 Testing the Fix');
    console.log('-' .repeat(30));
    
    const { findSubscriptionDayForDate } = require('./src/utils/dateHelpers');
    
    const testDates = [
      new Date(2025, 9, 17), // Oct 17 (end of Week 1)
      new Date(2025, 9, 18), // Oct 18 (start of Week 2)
      new Date(2025, 9, 19), // Oct 19 (in Week 2)
    ];
    
    testDates.forEach(testDate => {
      const mappedDay = findSubscriptionDayForDate(testDate, subscriptionPlan.weeks);
      const expectedDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][testDate.getDay()];
      
      console.log(`${testDate.toDateString()}: Expected ${expectedDay}, Got ${mappedDay} ${mappedDay === expectedDay ? '✅' : '❌'}`);
    });

  } catch (error) {
    console.error('❌ Error during fix:', error);
  }
};

const runFix = async () => {
  await connectDB();
  await fixWeekBoundaries();
  await mongoose.connection.close();
  console.log('\n✅ Database connection closed');
};

runFix();
