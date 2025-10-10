const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const { getNextSunday } = require('./src/utils/dateHelpers');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Connect to MongoDB using environment variables
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/grub-gate';
console.log('🔌 Connecting to MongoDB...');
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const SubscriptionMealPlan = require('./src/models/SubscriptionMealPlan');

async function fixSubscriptionDates() {
  try {
    console.log('🔧 FIXING SUBSCRIPTION DATES TO START ON SUNDAY');
    console.log('================================================');

    // Find the problematic subscription
    const subscription = await SubscriptionMealPlan.findById('68e7e9f90250d71176cd103f');
    
    if (!subscription) {
      console.log('❌ Subscription not found');
      return;
    }

    console.log('\n📋 CURRENT SUBSCRIPTION:');
    console.log('Plan Start:', subscription.planStartDate.toDateString(), '(Day', subscription.planStartDate.getDay(), ')');
    console.log('Plan End:', subscription.planEndDate.toDateString(), '(Day', subscription.planEndDate.getDay(), ')');
    
    subscription.weeks.forEach((week, index) => {
      console.log(`Week ${week.weekNumber}: ${week.weekStartDate.toDateString()} (Day ${week.weekStartDate.getDay()}) to ${week.weekEndDate.toDateString()} (Day ${week.weekEndDate.getDay()})`);
    });

    // Calculate correct Sunday-based dates
    const originalStartDate = new Date('2025-10-09'); // The date when subscription was created
    const correctStartDate = getNextSunday(originalStartDate); // Should be Oct 12, 2025 (Sunday)
    
    console.log('\n✅ CORRECTED DATES:');
    console.log('Correct Start Date:', correctStartDate.toDateString(), '(Day', correctStartDate.getDay(), ')');
    
    // Calculate correct end date (13 days later for bi-weekly = 2 weeks)
    const correctEndDate = new Date(correctStartDate);
    correctEndDate.setDate(correctStartDate.getDate() + 13); // 14 days total, but end on Saturday
    correctEndDate.setHours(23, 59, 59, 999);
    
    console.log('Correct End Date:', correctEndDate.toDateString(), '(Day', correctEndDate.getDay(), ')');

    // Generate correct week structure
    const weekStartDates = [];
    const weeks = [];
    
    for (let i = 0; i < 2; i++) { // bi-weekly = 2 weeks
      const weekStart = new Date(correctStartDate);
      weekStart.setDate(correctStartDate.getDate() + (i * 7)); // Each week starts on Sunday
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6); // Each week ends on Saturday
      weekEnd.setHours(23, 59, 59, 999);
      
      weekStartDates.push(weekStart);
      
      console.log(`Week ${i + 1}: ${weekStart.toDateString()} (Day ${weekStart.getDay()}) to ${weekEnd.toDateString()} (Day ${weekEnd.getDay()})`);
      
      weeks.push({
        weekNumber: i + 1,
        weekStartDate: weekStart,
        weekEndDate: weekEnd,
        meals: subscription.weeks[i] ? subscription.weeks[i].meals : {
          monday: { lunch: [], dinner: [] },
          tuesday: { lunch: [], dinner: [] },
          wednesday: { lunch: [], dinner: [] },
          thursday: { lunch: [], dinner: [] },
          friday: { lunch: [], dinner: [] },
          saturday: { lunch: [], dinner: [] },
          sunday: { lunch: [], dinner: [] }
        },
        isRepeated: subscription.weeks[i] ? subscription.weeks[i].isRepeated : false,
        weekTotalValue: subscription.weeks[i] ? subscription.weeks[i].weekTotalValue : 0,
        weekTotalItems: subscription.weeks[i] ? subscription.weeks[i].weekTotalItems : 0
      });
    }

    // Update the subscription
    subscription.planStartDate = correctStartDate;
    subscription.planEndDate = correctEndDate;
    subscription.weekStartDates = weekStartDates;
    subscription.weeks = weeks;

    // Calculate correct next billing date
    const nextBilling = new Date(correctEndDate);
    nextBilling.setDate(correctEndDate.getDate() + 1);
    subscription.nextBillingDate = nextBilling;

    await subscription.save();

    console.log('\n✅ SUBSCRIPTION UPDATED SUCCESSFULLY!');
    console.log('New structure:');
    console.log('Plan Start:', subscription.planStartDate.toDateString(), '(Day', subscription.planStartDate.getDay(), ')');
    console.log('Plan End:', subscription.planEndDate.toDateString(), '(Day', subscription.planEndDate.getDay(), ')');
    
    subscription.weeks.forEach((week, index) => {
      console.log(`Week ${week.weekNumber}: ${week.weekStartDate.toDateString()} (Day ${week.weekStartDate.getDay()}) to ${week.weekEndDate.toDateString()} (Day ${week.weekEndDate.getDay()})`);
    });

    console.log('\n🎉 FIX COMPLETE! Now testing date mapping...');
    
    // Test the fix
    const { findSubscriptionDayForDate } = require('./src/utils/dateHelpers');
    const testDates = [
      new Date('2025-10-11'), // Saturday (should be null - before subscription)
      new Date('2025-10-12'), // Sunday (should be 'sunday' - first day)
      new Date('2025-10-13'), // Monday (should be 'monday')
      new Date('2025-10-18'), // Saturday (should be 'saturday' - last day of week 1)
      new Date('2025-10-19')  // Sunday (should be 'sunday' - first day of week 2)
    ];

    console.log('\n🧪 TESTING DATE MAPPING:');
    testDates.forEach(date => {
      const result = findSubscriptionDayForDate(date, subscription.weeks);
      console.log(`${date.toDateString()} (Day ${date.getDay()}) -> "${result}"`);
    });

  } catch (error) {
    console.error('❌ Error fixing subscription:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixSubscriptionDates();
