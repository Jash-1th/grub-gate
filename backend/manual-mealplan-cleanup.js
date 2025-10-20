// FILE: manual-mealplan-cleanup.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const MealPlan = require('./src/models/MealPlan');
const SubscriptionMealPlan = require('./src/models/SubscriptionMealPlan');

/**
 * Manual cleanup script for users who have both meal plans and subscriptions
 */
async function manualMealPlanCleanup() {
  try {
    console.log('🧹 Manual MealPlan Cleanup Script...');
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
    
    // Find users who have both meal plans and active subscriptions
    const mealPlans = await MealPlan.find({}).populate('userId', 'firstName lastName email');
    const subscriptions = await SubscriptionMealPlan.find({ status: 'active' }).populate('customerId', 'firstName lastName email');
    
    console.log(`Found ${mealPlans.length} meal plans and ${subscriptions.length} active subscriptions`);
    
    const usersToCleanup = [];
    
    for (const mealPlan of mealPlans) {
      const userId = mealPlan.userId._id;
      const userSubscriptions = subscriptions.filter(sub => 
        sub.customerId && sub.customerId._id.toString() === userId.toString()
      );
      
      if (userSubscriptions.length > 0) {
        // Only add to cleanup if meal plan was created BEFORE any subscription
        // This indicates the meal plan was successfully converted and should be cleaned up
        const mealPlanTime = new Date(mealPlan.createdAt).getTime();
        const hasOlderMealPlan = userSubscriptions.some(sub => {
          const subscriptionTime = new Date(sub.createdAt).getTime();
          return mealPlanTime < subscriptionTime;
        });
        
        if (hasOlderMealPlan) {
          usersToCleanup.push({
            userId: userId,
            userName: `${mealPlan.userId.firstName} ${mealPlan.userId.lastName}`,
            mealPlanId: mealPlan._id,
            reason: 'MealPlan created before subscription - safe to cleanup'
          });
        } else {
          console.log(`⏭️ Skipping ${mealPlan.userId.firstName} ${mealPlan.userId.lastName} - meal plan created AFTER subscription (may be needed for retry)`);
        }
      }
    }
    
    console.log(`\n🎯 Found ${usersToCleanup.length} users who need meal plan cleanup:`);
    
    if (usersToCleanup.length === 0) {
      console.log('✅ No cleanup needed - all meal plans are properly cleaned up');
      return;
    }
    
    // Show users before cleanup
    for (const user of usersToCleanup) {
      console.log(`  • ${user.userName} (${user.userId})`);
      console.log(`    Reason: ${user.reason}`);
    }
    
    console.log('\n🧹 Starting cleanup process...');
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const user of usersToCleanup) {
      try {
        console.log(`\n🔄 Cleaning up meal plan for ${user.userName}...`);
        
        const deleteResult = await MealPlan.deleteOne({ userId: user.userId });
        
        if (deleteResult.deletedCount > 0) {
          console.log(`  ✅ Successfully deleted meal plan for ${user.userName}`);
          successCount++;
        } else {
          console.log(`  ⚠️ No meal plan found to delete for ${user.userName}`);
        }
        
      } catch (cleanupError) {
        console.error(`  ❌ Error cleaning up ${user.userName}:`, cleanupError.message);
        errorCount++;
      }
    }
    
    // Summary
    console.log('\n📊 Cleanup Summary:');
    console.log('=' .repeat(60));
    console.log(`✅ Successfully cleaned up: ${successCount} users`);
    console.log(`❌ Errors during cleanup: ${errorCount} users`);
    console.log(`📋 Total processed: ${usersToCleanup.length} users`);
    
    if (successCount > 0) {
      console.log('\n🎉 Cleanup completed successfully!');
      console.log('   Users with active subscriptions no longer have duplicate meal plans');
    }
    
    if (errorCount > 0) {
      console.log('\n⚠️ Some errors occurred during cleanup');
      console.log('   Check the error messages above for details');
    }
    
  } catch (error) {
    console.error('💥 Manual cleanup failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Handle script termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Cleanup interrupted');
  await mongoose.connection.close();
  process.exit(0);
});

// Run the cleanup
manualMealPlanCleanup();
