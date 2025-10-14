/**
 * Fix missing dates in existing meal plans
 * Run with: node fix-missing-dates.js
 */

const mongoose = require('mongoose');
const MealPlan = require('./src/models/MealPlan');
const { addDatesToMealPlan } = require('./src/utils/mealPlanDateCalculator');

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

// Fix missing dates
const fixMissingDates = async () => {
  console.log('🔧 Starting to fix missing dates in meal plans...\n');

  try {
    // Find all meal plans
    const mealPlans = await MealPlan.find({});
    console.log(`📋 Found ${mealPlans.length} meal plans to check\n`);

    let fixedCount = 0;

    for (const mealPlan of mealPlans) {
      console.log(`🔍 Checking meal plan for user: ${mealPlan.userId}`);
      
      let needsFix = false;
      const mealPlanObj = mealPlan.toObject();
      
      // Check if any days are missing dates
      ['week0', 'week1'].forEach(weekKey => {
        if (mealPlanObj.weeklyPlans && mealPlanObj.weeklyPlans[weekKey]) {
          const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
          dayNames.forEach(dayName => {
            const dayData = mealPlanObj.weeklyPlans[weekKey][dayName];
            if (dayData && !dayData.date) {
              console.log(`   ❌ Missing date for ${weekKey}.${dayName}`);
              needsFix = true;
            }
          });
        }
      });
      
      if (needsFix || !mealPlan.datesCalculatedAt) {
        console.log('   🔧 Fixing dates...');
        
        // Add dates to meal plan
        const fixedMealPlan = addDatesToMealPlan(mealPlanObj);
        
        // Update the database
        mealPlan.weeklyPlans = fixedMealPlan.weeklyPlans;
        mealPlan.datesCalculatedAt = fixedMealPlan.datesCalculatedAt;
        
        await mealPlan.save();
        fixedCount++;
        
        console.log('   ✅ Fixed and saved to database');
      } else {
        console.log('   ⏭️  No fixes needed');
      }
      
      console.log(''); // Empty line for readability
    }

    console.log('🎉 Date fixing completed!');
    console.log(`✅ Fixed: ${fixedCount} meal plans`);
    console.log(`⏭️  Skipped: ${mealPlans.length - fixedCount} meal plans`);

  } catch (error) {
    console.error('❌ Error fixing dates:', error);
  }
};

// Main execution
const main = async () => {
  await connectDB();
  await fixMissingDates();
  await mongoose.connection.close();
  console.log('\n🔌 Database connection closed');
  process.exit(0);
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log('❌ Unhandled Promise Rejection:', err.message);
  process.exit(1);
});

// Run fix
if (require.main === module) {
  main();
}

module.exports = { fixMissingDates };
