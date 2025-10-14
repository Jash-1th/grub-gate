/**
 * Migration script to add dates to existing meal plans
 * Run with: node migrate-meal-plan-dates.js
 */

const mongoose = require('mongoose');
const MealPlan = require('./src/models/MealPlan');
const { addDatesToMealPlan, needsDateRecalculation } = require('./src/utils/mealPlanDateCalculator');

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

// Migration function
const migrateMealPlanDates = async () => {
  console.log('🚀 Starting meal plan date migration...\n');

  try {
    // Find all meal plans
    const mealPlans = await MealPlan.find({});
    console.log(`📋 Found ${mealPlans.length} meal plans to process\n`);

    let migratedCount = 0;
    let skippedCount = 0;

    for (const mealPlan of mealPlans) {
      const mealPlanObj = mealPlan.toObject();
      
      // Check if migration is needed
      if (needsDateRecalculation(mealPlanObj)) {
        console.log(`📅 Migrating meal plan for user: ${mealPlan.userId}`);
        
        // Add dates to meal plan
        const mealPlanWithDates = addDatesToMealPlan(mealPlanObj);
        
        // Update the meal plan in database
        await MealPlan.findByIdAndUpdate(mealPlan._id, {
          weeklyPlans: mealPlanWithDates.weeklyPlans,
          datesCalculatedAt: mealPlanWithDates.datesCalculatedAt
        });
        
        migratedCount++;
        console.log(`  ✅ Added dates to meal plan`);
        
        // Show sample dates
        const week0Monday = mealPlanWithDates.weeklyPlans?.week0?.monday;
        if (week0Monday?.date) {
          console.log(`  📅 Week 0 Monday: ${week0Monday.date}`);
        }
      } else {
        console.log(`⏭️  Skipping meal plan for user: ${mealPlan.userId} (already has dates)`);
        skippedCount++;
      }
      
      console.log(''); // Empty line for readability
    }

    console.log('🎉 Migration completed!');
    console.log(`✅ Migrated: ${migratedCount} meal plans`);
    console.log(`⏭️  Skipped: ${skippedCount} meal plans`);
    console.log(`📊 Total processed: ${mealPlans.length} meal plans`);

  } catch (error) {
    console.error('❌ Migration error:', error);
  }
};

// Main execution
const main = async () => {
  await connectDB();
  await migrateMealPlanDates();
  await mongoose.connection.close();
  console.log('\n🔌 Database connection closed');
  process.exit(0);
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log('❌ Unhandled Promise Rejection:', err.message);
  process.exit(1);
});

// Run migration
if (require.main === module) {
  main();
}

module.exports = { migrateMealPlanDates };
