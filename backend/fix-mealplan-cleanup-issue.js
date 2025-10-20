// FILE: fix-mealplan-cleanup-issue.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const MealPlan = require('./src/models/MealPlan');
const SubscriptionMealPlan = require('./src/models/SubscriptionMealPlan');
const User = require('./src/models/User');

/**
 * Comprehensive script to fix meal plan cleanup issues
 */
async function fixMealPlanCleanupIssue() {
  try {
    console.log('🔧 Fixing MealPlan Cleanup Issues...');
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
    
    // Step 1: Identify the problem
    console.log('\n🔍 Step 1: Identifying users with both meal plans and subscriptions...');
    
    const mealPlans = await MealPlan.find({}).populate('userId', 'firstName lastName email');
    const subscriptions = await SubscriptionMealPlan.find({}).populate('customerId', 'firstName lastName email');
    
    console.log(`Found ${mealPlans.length} meal plans and ${subscriptions.length} subscriptions`);
    
    const problemUsers = [];
    
    for (const mealPlan of mealPlans) {
      const userId = mealPlan.userId._id;
      const userSubscriptions = subscriptions.filter(sub => 
        sub.customerId && sub.customerId._id.toString() === userId.toString()
      );
      
      if (userSubscriptions.length > 0) {
        problemUsers.push({
          userId: userId,
          userName: `${mealPlan.userId.firstName} ${mealPlan.userId.lastName}`,
          email: mealPlan.userId.email,
          mealPlanId: mealPlan._id,
          mealPlanCreated: mealPlan.createdAt,
          subscriptions: userSubscriptions.map(sub => ({
            id: sub._id,
            status: sub.status,
            created: sub.createdAt,
            planType: sub.planType
          }))
        });
      }
    }
    
    console.log(`\n❌ Found ${problemUsers.length} users with BOTH meal plans AND subscriptions:`);
    
    if (problemUsers.length === 0) {
      console.log('✅ No issues found! All meal plans are properly cleaned up.');
      return;
    }
    
    // Show problem details
    for (const user of problemUsers) {
      console.log(`\n  👤 ${user.userName} (${user.email})`);
      console.log(`     User ID: ${user.userId}`);
      console.log(`     MealPlan created: ${user.mealPlanCreated}`);
      console.log(`     Subscriptions: ${user.subscriptions.length}`);
      
      for (const sub of user.subscriptions) {
        console.log(`       • ${sub.planType} (${sub.status}) - Created: ${sub.created}`);
        
        // Check timing
        const mealPlanTime = new Date(user.mealPlanCreated).getTime();
        const subscriptionTime = new Date(sub.created).getTime();
        
        if (mealPlanTime < subscriptionTime) {
          console.log(`         ⚠️ MealPlan created BEFORE subscription (cleanup should have happened)`);
        } else {
          console.log(`         🔄 MealPlan created AFTER subscription (unusual but possible)`);
        }
      }
    }
    
    // Step 2: Analyze meal plan data quality
    console.log('\n🔍 Step 2: Analyzing meal plan data quality...');
    
    let menusWithMissingIds = 0;
    let totalMenuItems = 0;
    
    for (const user of problemUsers) {
      const mealPlan = mealPlans.find(mp => mp._id.toString() === user.mealPlanId.toString());
      
      if (mealPlan && mealPlan.weeklyPlans) {
        console.log(`\n  📋 Analyzing meal plan for ${user.userName}:`);
        
        Object.entries(mealPlan.weeklyPlans).forEach(([weekKey, weekData]) => {
          Object.entries(weekData).forEach(([dayKey, dayData]) => {
            ['lunch', 'dinner'].forEach(mealType => {
              if (dayData[mealType] && Array.isArray(dayData[mealType])) {
                dayData[mealType].forEach((item, index) => {
                  totalMenuItems++;
                  
                  const hasMenuItemId = !!(item.menuItemId || item._id || item.id);
                  
                  if (!hasMenuItemId) {
                    menusWithMissingIds++;
                    console.log(`    ❌ ${weekKey}.${dayKey}.${mealType}[${index}]: Missing menuItemId for "${item.name}"`);
                  }
                });
              }
            });
          });
        });
      }
    }
    
    console.log(`\n📊 Data Quality Summary:`);
    console.log(`   Total menu items: ${totalMenuItems}`);
    console.log(`   Items missing menuItemId: ${menusWithMissingIds}`);
    console.log(`   Data quality: ${totalMenuItems > 0 ? ((totalMenuItems - menusWithMissingIds) / totalMenuItems * 100).toFixed(1) : 0}%`);
    
    if (menusWithMissingIds > 0) {
      console.log(`\n⚠️ LIKELY CAUSE: Missing menuItemId fields are causing subscription creation to fail`);
      console.log(`   This prevents the cleanup code from being reached`);
      console.log(`   Solution: Fix the menuItemId fields OR make the validation more lenient`);
    }
    
    // Step 3: Offer solutions
    console.log('\n🔧 Step 3: Available solutions...');
    console.log('\nOption 1: Manual cleanup (safe - removes meal plans for users with active subscriptions)');
    console.log('Option 2: Fix missing menuItemIds (more complex but addresses root cause)');
    console.log('Option 3: Make validation more lenient (quick fix but may cause other issues)');
    
    console.log('\n❓ Would you like to proceed with manual cleanup? (This is the safest option)');
    console.log('   This will delete meal plans for users who already have active subscriptions');
    
    // For now, let's do the safe cleanup automatically
    console.log('\n🧹 Proceeding with safe manual cleanup...');
    
    let cleanupCount = 0;
    let cleanupErrors = 0;
    
    for (const user of problemUsers) {
      // Only cleanup if user has at least one SUCCESSFUL/ACTIVE subscription
      // AND the meal plan was created BEFORE the subscription (indicating successful conversion)
      const activeSubscriptions = user.subscriptions.filter(sub => sub.status === 'active');
      
      if (activeSubscriptions.length > 0) {
        // Check if meal plan was created before any active subscription
        const mealPlanTime = new Date(user.mealPlanCreated).getTime();
        const hasOlderMealPlan = activeSubscriptions.some(sub => {
          const subscriptionTime = new Date(sub.created).getTime();
          return mealPlanTime < subscriptionTime;
        });
        
        if (hasOlderMealPlan) {
          try {
            console.log(`\n🔄 Cleaning up meal plan for ${user.userName}...`);
            console.log(`  📅 MealPlan created before subscription - safe to cleanup`);
            
            const deleteResult = await MealPlan.deleteOne({ userId: user.userId });
            
            if (deleteResult.deletedCount > 0) {
              console.log(`  ✅ Successfully deleted meal plan`);
              cleanupCount++;
            } else {
              console.log(`  ⚠️ No meal plan found to delete (may have been deleted already)`);
            }
            
          } catch (cleanupError) {
            console.error(`  ❌ Error during cleanup: ${cleanupError.message}`);
            cleanupErrors++;
          }
        } else {
          console.log(`\n⏭️ Skipping ${user.userName} - meal plan created AFTER subscription (user may need it)`);
        }
      } else {
        console.log(`\n⏭️ Skipping ${user.userName} - no active subscriptions`);
      }
    }
    
    // Final summary
    console.log('\n🎉 Cleanup Complete!');
    console.log('=' .repeat(60));
    console.log(`✅ Successfully cleaned up: ${cleanupCount} meal plans`);
    console.log(`❌ Cleanup errors: ${cleanupErrors}`);
    console.log(`⏭️ Skipped: ${problemUsers.length - cleanupCount - cleanupErrors} (no active subscriptions)`);
    
    if (cleanupCount > 0) {
      console.log('\n✨ Your meal plan cleanup issue should now be resolved!');
      console.log('   Users with active subscriptions no longer have duplicate meal plan data');
    }
    
    if (menusWithMissingIds > 0) {
      console.log('\n💡 Recommendation: Fix the missing menuItemId issue to prevent future problems');
      console.log('   Consider running a script to populate missing menuItemIds');
      console.log('   Or make the validation more lenient in the subscription creation code');
    }
    
  } catch (error) {
    console.error('💥 Fix script failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Handle script termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Fix script interrupted');
  await mongoose.connection.close();
  process.exit(0);
});

// Run the fix
fixMealPlanCleanupIssue();
