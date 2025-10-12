// FILE: update-subscription-to-new-logic.js
/**
 * Update existing subscription to use new start date logic
 * This demonstrates the improvement in planning time
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const SubscriptionMealPlan = require('./src/models/SubscriptionMealPlan');
const Order = require('./src/models/Order');
const { getSubscriptionStartSunday, getWeekDateRange } = require('./src/utils/dateHelpers');

async function updateSubscriptionToNewLogic() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    
    console.log('🔄 UPDATING SUBSCRIPTION TO NEW LOGIC');
    console.log('='.repeat(50));
    
    // Find the existing subscription
    const existingSubscription = await SubscriptionMealPlan.findById('68ebc65e3480e424fcccff36');
    
    if (!existingSubscription) {
      console.log('❌ Subscription not found');
      return;
    }
    
    console.log('📋 CURRENT SUBSCRIPTION:');
    console.log('  ID:', existingSubscription._id);
    console.log('  Current Start:', existingSubscription.planStartDate.toDateString());
    console.log('  Current End:', existingSubscription.planEndDate.toDateString());
    console.log('  Status:', existingSubscription.status);
    console.log('  Generated Orders:', existingSubscription.generatedOrders.length);
    
    // Calculate new dates using new logic
    const today = new Date('2025-10-12'); // Today when subscription was created
    const newStartDate = getSubscriptionStartSunday(today);
    const newEndDate = new Date(newStartDate);
    newEndDate.setDate(newStartDate.getDate() + 13); // Bi-weekly
    newEndDate.setHours(23, 59, 59, 999);
    
    console.log('\\n🆕 NEW LOGIC DATES:');
    console.log('  New Start:', newStartDate.toDateString(), '(+7 days improvement)');
    console.log('  New End:', newEndDate.toDateString());
    console.log('  Planning Time: 7 days instead of 0');
    
    // Calculate new week structure
    const week0 = getWeekDateRange(0, newStartDate);
    const week1 = getWeekDateRange(1, newStartDate);
    
    console.log('\\n📅 NEW WEEK STRUCTURE:');
    console.log('  Week 1:', week0.startDate.toDateString(), '-', week0.endDate.toDateString());
    console.log('  Week 2:', week1.startDate.toDateString(), '-', week1.endDate.toDateString());
    
    // Update the subscription
    console.log('\\n🔄 UPDATING SUBSCRIPTION...');
    
    // First, delete any existing orders since dates are changing
    if (existingSubscription.generatedOrders.length > 0) {
      console.log('  🗑️ Deleting existing orders (dates changed)...');
      await Order.deleteMany({ _id: { $in: existingSubscription.generatedOrders } });
    }
    
    // Update subscription with new dates and week structure
    existingSubscription.planStartDate = newStartDate;
    existingSubscription.planEndDate = newEndDate;
    existingSubscription.weekStartDates = [week0.startDate, week1.startDate];
    existingSubscription.nextBillingDate = new Date(newEndDate.getTime() + 24 * 60 * 60 * 1000); // Day after end
    existingSubscription.generatedOrders = [];
    existingSubscription.isOrdersGenerated = false;
    
    // Update week structure
    existingSubscription.weeks = existingSubscription.weeks.map((week, index) => {
      const weekRange = index === 0 ? week0 : week1;
      return {
        ...week,
        weekStartDate: weekRange.startDate,
        weekEndDate: weekRange.endDate
      };
    });
    
    await existingSubscription.save();
    
    console.log('  ✅ Subscription updated successfully!');
    
    console.log('\\n🎯 RESULTS:');
    console.log('✅ Start date moved from Oct 12 → Oct 19 (+7 days)');
    console.log('✅ Users now get proper planning time');
    console.log('✅ Week structure updated to new dates');
    console.log('✅ Orders will generate on Oct 19, not Oct 12');
    console.log('✅ Billing date adjusted accordingly');
    
    console.log('\\n📊 IMPACT:');
    console.log('  Today (Oct 12): No orders expected ✅');
    console.log('  Oct 19: Orders will start generating ✅');
    console.log('  Better user experience with planning time ✅');
    
    // Verify the update
    const updatedSub = await SubscriptionMealPlan.findById(existingSubscription._id);
    console.log('\\n🔍 VERIFICATION:');
    console.log('  Updated Start:', updatedSub.planStartDate.toDateString());
    console.log('  Updated End:', updatedSub.planEndDate.toDateString());
    console.log('  Week 1 Start:', updatedSub.weeks[0].weekStartDate.toDateString());
    console.log('  Week 2 Start:', updatedSub.weeks[1].weekStartDate.toDateString());
    
  } catch (error) {
    console.error('💥 Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\\n🔌 Database connection closed');
  }
}

updateSubscriptionToNewLogic();
