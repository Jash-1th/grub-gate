const mongoose = require('mongoose');
const MealPlan = require('./src/models/MealPlan');

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://grubgate:grubgate@cluster0.gthunlu.mongodb.net/grubgate?retryWrites=true&w=majority');
    console.log('🗄️ MongoDB Connected for meal plan fix');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Function to fix meal plan menuItemIds
const fixMealPlanMenuItemIds = async () => {
  try {
    console.log('🔧 Starting meal plan menuItemId fix...');
    
    // Find all meal plans
    const mealPlans = await MealPlan.find({});
    console.log(`📊 Found ${mealPlans.length} meal plans to process`);
    
    let updatedCount = 0;
    let itemsFixed = 0;
    
    for (const mealPlan of mealPlans) {
      let planUpdated = false;
      
      console.log(`\n🔍 Processing meal plan for user: ${mealPlan.userId}`);
      
      // Process each week
      for (const weekKey of ['week0', 'week1']) {
        const week = mealPlan.weeklyPlans[weekKey];
        if (!week) continue;
        
        console.log(`  📅 Processing ${weekKey}...`);
        
        // Process each day
        for (const dayKey of ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']) {
          const day = week[dayKey];
          if (!day) continue;
          
          // Process lunch items
          if (day.lunch && Array.isArray(day.lunch)) {
            for (let i = 0; i < day.lunch.length; i++) {
              const item = day.lunch[i];
              if (!item.menuItemId && !item.id && !item._id) {
                // Generate a proper menuItemId using planId as base
                const menuItemId = item.planId || `generated_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                day.lunch[i].menuItemId = menuItemId;
                day.lunch[i].id = menuItemId; // Also add id field for consistency
                
                console.log(`    ✅ Fixed lunch item "${item.name}" on ${dayKey}: ${menuItemId}`);
                planUpdated = true;
                itemsFixed++;
              }
            }
          }
          
          // Process dinner items
          if (day.dinner && Array.isArray(day.dinner)) {
            for (let i = 0; i < day.dinner.length; i++) {
              const item = day.dinner[i];
              if (!item.menuItemId && !item.id && !item._id) {
                // Generate a proper menuItemId using planId as base
                const menuItemId = item.planId || `generated_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                day.dinner[i].menuItemId = menuItemId;
                day.dinner[i].id = menuItemId; // Also add id field for consistency
                
                console.log(`    ✅ Fixed dinner item "${item.name}" on ${dayKey}: ${menuItemId}`);
                planUpdated = true;
                itemsFixed++;
              }
            }
          }
        }
      }
      
      // Save the updated meal plan
      if (planUpdated) {
        mealPlan.markModified('weeklyPlans');
        await mealPlan.save();
        updatedCount++;
        console.log(`  💾 Saved updated meal plan for user: ${mealPlan.userId}`);
      } else {
        console.log(`  ⏭️ No updates needed for user: ${mealPlan.userId}`);
      }
    }
    
    console.log('\n🎉 Meal plan menuItemId fix completed!');
    console.log(`📊 Summary:`);
    console.log(`  - Total meal plans processed: ${mealPlans.length}`);
    console.log(`  - Meal plans updated: ${updatedCount}`);
    console.log(`  - Total items fixed: ${itemsFixed}`);
    
  } catch (error) {
    console.error('❌ Error fixing meal plan menuItemIds:', error);
  }
};

// Main execution
const main = async () => {
  await connectDB();
  await fixMealPlanMenuItemIds();
  await mongoose.disconnect();
  console.log('🔌 Database connection closed');
  process.exit(0);
};

// Run the script
main().catch(error => {
  console.error('❌ Script execution error:', error);
  process.exit(1);
});
