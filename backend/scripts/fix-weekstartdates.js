// FILE: scripts/fix-weekstartdates.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const SubscriptionMealPlan = require('../src/models/SubscriptionMealPlan');

/**
 * Fix the existing subscription by populating weekStartDates
 */
async function fixWeekStartDates() {
  try {
    console.log('🔧 FIXING WEEKSTARTDATES FOR EXISTING SUBSCRIPTION');
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
    
    console.log('📊 CURRENT SUBSCRIPTION:');
    console.log('-' .repeat(30));
    console.log(`Plan Type: ${subscription.planType}`);
    console.log(`Start Date: ${subscription.planStartDate}`);
    console.log(`End Date: ${subscription.planEndDate}`);
    console.log(`Current weekStartDates: ${subscription.weekStartDates?.length || 0} items`);
    
    // Calculate correct weekStartDates
    console.log('\n🔄 CALCULATING CORRECT WEEKSTARTDATES:');
    console.log('-' .repeat(40));
    
    const planStartDate = new Date(subscription.planStartDate);
    const planEndDate = new Date(subscription.planEndDate);
    
    const totalDays = Math.ceil((planEndDate - planStartDate) / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.ceil(totalDays / 7);
    
    console.log(`Plan Duration: ${totalDays} days`);
    console.log(`Total Weeks: ${totalWeeks}`);
    
    const weekStartDates = [];
    
    for (let i = 0; i < totalWeeks; i++) {
      const weekStart = new Date(planStartDate);
      weekStart.setDate(planStartDate.getDate() + (i * 7));
      weekStartDates.push(weekStart);
    }
    
    console.log('\n📅 CALCULATED WEEK START DATES:');
    console.log('-' .repeat(35));
    
    weekStartDates.forEach((date, index) => {
      console.log(`Week ${index + 1}: ${date.toDateString()}`);
    });
    
    // Update the subscription
    console.log('\n💾 UPDATING SUBSCRIPTION:');
    console.log('-' .repeat(25));
    
    const updateResult = await SubscriptionMealPlan.findByIdAndUpdate(
      subscriptionId,
      {
        weekStartDates: weekStartDates,
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (updateResult) {
      console.log('✅ Subscription updated successfully');
      console.log(`   weekStartDates now has ${updateResult.weekStartDates.length} items`);
      
      // Verify the update
      console.log('\n🔍 VERIFICATION:');
      console.log('-' .repeat(15));
      
      const verifySubscription = await SubscriptionMealPlan.findById(subscriptionId);
      const actualCount = verifySubscription.weekStartDates?.length || 0;
      
      console.log(`Expected: ${totalWeeks} week start dates`);
      console.log(`Actual: ${actualCount} week start dates`);
      console.log(`Status: ${actualCount === totalWeeks ? '✅ CORRECT' : '❌ MISMATCH'}`);
      
      if (actualCount === totalWeeks) {
        console.log('\n🎉 SUCCESS! weekStartDates is now properly populated');
        
        console.log('\n📈 BENEFITS:');
        console.log('✅ Week tracking now works');
        console.log('✅ Repetition logic will function correctly');
        console.log('✅ Frontend week navigation enabled');
        console.log('✅ Billing cycle calculations accurate');
        console.log('✅ Subscription progress tracking available');
        
        console.log('\n🧪 TESTING RECOMMENDATIONS:');
        console.log('1. Test subscription week navigation in frontend');
        console.log('2. Verify order generation still works correctly');
        console.log('3. Check billing cycle calculations');
        console.log('4. Test subscription progress tracking');
      } else {
        console.log('\n💥 UPDATE FAILED - weekStartDates count mismatch');
      }
    } else {
      console.log('❌ Failed to update subscription');
    }
    
  } catch (error) {
    console.error('💥 Fix failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the fix
fixWeekStartDates();
