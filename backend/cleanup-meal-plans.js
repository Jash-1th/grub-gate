/**
 * Cleanup script to optimize existing meal plans by removing unnecessary data
 * Run with: node cleanup-meal-plans.js
 */

const mongoose = require('mongoose');
const MealPlan = require('./src/models/MealPlan');

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/grubgate', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Cleanup function
const cleanupMealPlans = async () => {
  console.log('🧹 Starting meal plan cleanup...\n');

  try {
    // Find all meal plans
    const mealPlans = await MealPlan.find({});
    console.log(`📋 Found ${mealPlans.length} meal plans to clean\n`);

    let cleanedCount = 0;
    let totalSavings = 0;

    for (const mealPlan of mealPlans) {
      const originalSize = JSON.stringify(mealPlan.toObject()).length;
      let hasChanges = false;

      console.log(`🔍 Processing meal plan for user: ${mealPlan.userId}`);
      console.log(`   Original size: ${originalSize} characters`);

      // Clean up weeklyPlans - remove empty days
      ['week0', 'week1'].forEach(weekKey => {
        if (mealPlan.weeklyPlans && mealPlan.weeklyPlans[weekKey]) {
          const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
          
          dayNames.forEach(dayName => {
            const dayData = mealPlan.weeklyPlans[weekKey][dayName];
            if (dayData) {
              const hasLunchMeals = dayData.lunch && dayData.lunch.length > 0;
              const hasDinnerMeals = dayData.dinner && dayData.dinner.length > 0;
              const hasDate = dayData.date;
              
              // Remove day if it has no meals and no date
              if (!hasLunchMeals && !hasDinnerMeals && !hasDate) {
                console.log(`   🗑️  Removing empty ${weekKey}.${dayName}`);
                mealPlan.weeklyPlans[weekKey][dayName] = undefined;
                hasChanges = true;
              }
            }
          });
        }
      });

      // Clean up selectedRestaurantData - keep only essential fields
      if (mealPlan.selectedRestaurantData) {
        const originalRestaurantData = mealPlan.selectedRestaurantData;
        const cleanedRestaurantData = {
          _id: originalRestaurantData._id,
          name: originalRestaurantData.name,
          cuisine: originalRestaurantData.cuisine,
          rating: originalRestaurantData.rating,
          logo: originalRestaurantData.logo
        };

        // Check if we're reducing the restaurant data
        const originalRestaurantSize = JSON.stringify(originalRestaurantData).length;
        const cleanedRestaurantSize = JSON.stringify(cleanedRestaurantData).length;
        
        if (cleanedRestaurantSize < originalRestaurantSize) {
          console.log(`   🎯 Optimizing restaurant data: ${originalRestaurantSize} → ${cleanedRestaurantSize} chars`);
          mealPlan.selectedRestaurantData = cleanedRestaurantData;
          hasChanges = true;
        }
      }

      // Save changes if any
      if (hasChanges) {
        await mealPlan.save();
        const newSize = JSON.stringify(mealPlan.toObject()).length;
        const savings = originalSize - newSize;
        totalSavings += savings;
        cleanedCount++;
        
        console.log(`   ✅ Cleaned! New size: ${newSize} characters (saved ${savings} chars)`);
      } else {
        console.log(`   ⏭️  No changes needed`);
      }
      
      console.log(''); // Empty line for readability
    }

    console.log('🎉 Cleanup completed!');
    console.log(`✅ Cleaned: ${cleanedCount} meal plans`);
    console.log(`⏭️  Skipped: ${mealPlans.length - cleanedCount} meal plans`);
    console.log(`💾 Total space saved: ${totalSavings} characters`);
    console.log(`📊 Average savings per cleaned plan: ${cleanedCount > 0 ? Math.round(totalSavings / cleanedCount) : 0} characters`);

  } catch (error) {
    console.error('❌ Cleanup error:', error);
  }
};

// Main execution
const main = async () => {
  await connectDB();
  await cleanupMealPlans();
  await mongoose.connection.close();
  console.log('\n🔌 Database connection closed');
  process.exit(0);
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log('❌ Unhandled Promise Rejection:', err.message);
  process.exit(1);
});

// Run cleanup
if (require.main === module) {
  main();
}

module.exports = { cleanupMealPlans };
