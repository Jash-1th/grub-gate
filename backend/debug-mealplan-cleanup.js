// FILE: debug-mealplan-cleanup.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const MealPlan = require('./src/models/MealPlan');
const SubscriptionMealPlan = require('./src/models/SubscriptionMealPlan');
const User = require('./src/models/User');

/**
 * Debug script to check meal plan cleanup issues
 */
async function debugMealPlanCleanup() {
  try {
    console.log('🔍 Debugging MealPlan Cleanup Issues...');
    console.log('=' .repeat(60));
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    
    if (!mongoUri) {
      throw new Error('MongoDB URI not found. Please set MONGODB_URI or MONGO_URI in your .env file');
    }
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
    
    // 1. Check all meal plans in the database
    console.log('\n📋 Step 1: Checking all meal plans in database...');
    const allMealPlans = await MealPlan.find({}).populate('userId', 'firstName lastName email');
    console.log(`Found ${allMealPlans.length} meal plans in database:`);
    
    for (const plan of allMealPlans) {
      console.log(`  • User: ${plan.userId?.firstName} ${plan.userId?.lastName} (${plan.userId?._id})`);
      console.log(`    Created: ${plan.createdAt}`);
      console.log(`    Updated: ${plan.updatedAt}`);
      
      // Count total items in this meal plan
      let totalItems = 0;
      if (plan.weeklyPlans) {
        Object.values(plan.weeklyPlans).forEach(week => {
          Object.values(week).forEach(day => {
            if (day.lunch) totalItems += day.lunch.length;
            if (day.dinner) totalItems += day.dinner.length;
          });
        });
      }
      console.log(`    Total items: ${totalItems}`);
    }
    
    // 2. Check all subscription meal plans
    console.log('\n📅 Step 2: Checking subscription meal plans...');
    const allSubscriptions = await SubscriptionMealPlan.find({}).populate('customerId', 'firstName lastName email');
    console.log(`Found ${allSubscriptions.length} subscription meal plans:`);
    
    for (const sub of allSubscriptions) {
      console.log(`  • User: ${sub.customerId?.firstName} ${sub.customerId?.lastName} (${sub.customerId?._id})`);
      console.log(`    Status: ${sub.status}`);
      console.log(`    Created: ${sub.createdAt}`);
      console.log(`    Plan Type: ${sub.planType}`);
    }
    
    // 3. Find users who have BOTH meal plans AND subscriptions
    console.log('\n🔍 Step 3: Finding users with both meal plans and subscriptions...');
    
    const usersWithBoth = [];
    
    for (const mealPlan of allMealPlans) {
      const userId = mealPlan.userId._id;
      const hasSubscription = allSubscriptions.some(sub => 
        sub.customerId && sub.customerId._id.toString() === userId.toString()
      );
      
      if (hasSubscription) {
        usersWithBoth.push({
          userId: userId,
          userName: `${mealPlan.userId.firstName} ${mealPlan.userId.lastName}`,
          mealPlanCreated: mealPlan.createdAt,
          mealPlanUpdated: mealPlan.updatedAt
        });
      }
    }
    
    console.log(`Found ${usersWithBoth.length} users with both meal plans AND subscriptions:`);
    
    for (const user of usersWithBoth) {
      console.log(`  ⚠️ User: ${user.userName} (${user.userId})`);
      console.log(`     MealPlan created: ${user.mealPlanCreated}`);
      console.log(`     MealPlan updated: ${user.mealPlanUpdated}`);
      
      // Find their subscription
      const userSub = allSubscriptions.find(sub => 
        sub.customerId && sub.customerId._id.toString() === user.userId.toString()
      );
      
      if (userSub) {
        console.log(`     Subscription created: ${userSub.createdAt}`);
        console.log(`     Subscription status: ${userSub.status}`);
        
        // Check if meal plan was created BEFORE subscription (expected)
        // or AFTER subscription (indicates cleanup didn't work)
        const mealPlanTime = new Date(user.mealPlanCreated).getTime();
        const subscriptionTime = new Date(userSub.createdAt).getTime();
        
        if (mealPlanTime < subscriptionTime) {
          console.log(`     ✅ Normal: MealPlan created before subscription`);
          console.log(`     ❌ ISSUE: MealPlan should have been deleted after subscription creation`);
        } else {
          console.log(`     ⚠️ UNUSUAL: MealPlan created AFTER subscription`);
        }
      }
    }
    
    // 4. Test cleanup function manually
    if (usersWithBoth.length > 0) {
      console.log('\n🧹 Step 4: Testing manual cleanup...');
      
      const testUser = usersWithBoth[0];
      console.log(`Testing cleanup for user: ${testUser.userName} (${testUser.userId})`);
      
      // Try the same deletion logic as in the controller
      try {
        const deleteResult = await MealPlan.deleteOne({ userId: testUser.userId });
        console.log(`✅ Manual deletion result:`, deleteResult);
        
        if (deleteResult.deletedCount > 0) {
          console.log(`✅ Successfully deleted meal plan for ${testUser.userName}`);
        } else {
          console.log(`❌ No meal plan was deleted for ${testUser.userName}`);
          console.log(`   This might indicate the query didn't match any documents`);
        }
        
      } catch (deleteError) {
        console.error('❌ Error during manual deletion:', deleteError);
      }
    }
    
    // 5. Summary and recommendations
    console.log('\n📊 Summary:');
    console.log('=' .repeat(60));
    
    if (usersWithBoth.length === 0) {
      console.log('✅ GOOD: No users found with both meal plans and subscriptions');
      console.log('   The cleanup process appears to be working correctly');
    } else {
      console.log(`❌ ISSUE: Found ${usersWithBoth.length} users with both meal plans and subscriptions`);
      console.log('   This indicates the cleanup process is not working properly');
      
      console.log('\n🔧 Possible causes:');
      console.log('   1. Error in cleanup code execution (check server logs)');
      console.log('   2. Database transaction issues');
      console.log('   3. Cleanup code not being reached due to earlier errors');
      console.log('   4. Multiple meal plans for same user (query matches wrong one)');
      
      console.log('\n💡 Recommendations:');
      console.log('   1. Check server logs for cleanup errors during subscription creation');
      console.log('   2. Add more detailed logging to the cleanup process');
      console.log('   3. Consider using transactions to ensure cleanup happens atomically');
      console.log('   4. Run manual cleanup script for affected users');
    }
    
  } catch (error) {
    console.error('💥 Debug script failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Handle script termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Debug interrupted');
  await mongoose.connection.close();
  process.exit(0);
});

// Run the debug
debugMealPlanCleanup();
