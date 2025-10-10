// Script to analyze the mismatch between database storage and UI display
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI;
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB Atlas');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

async function analyzeMealPlanMismatch() {
  await connectDB();
  
  try {
    const userId = '68e7b7ea4a70ed31cffb3fe9';
    
    console.log('🔍 Analyzing Meal Plan Database vs UI Mismatch');
    console.log('=' .repeat(70));
    console.log(`👤 User ID: ${userId}`);

    // Check the 'mealplans' collection (the one that actually has data)
    console.log('\n📋 Checking "mealplans" collection...');
    const mealPlansCollection = mongoose.connection.db.collection('mealplans');
    
    // Try different field names to find the meal plan
    let mealPlan = await mealPlansCollection.findOne({ userId: userId });
    if (!mealPlan) {
      mealPlan = await mealPlansCollection.findOne({ userId: new mongoose.Types.ObjectId(userId) });
    }
    if (!mealPlan) {
      mealPlan = await mealPlansCollection.findOne({ customerId: userId });
    }
    if (!mealPlan) {
      mealPlan = await mealPlansCollection.findOne({ customerId: new mongoose.Types.ObjectId(userId) });
    }
    
    // If still not found, show all documents to debug
    if (!mealPlan) {
      console.log('🔍 Meal plan not found with standard queries. Checking all documents...');
      const allMealPlans = await mealPlansCollection.find({}).toArray();
      console.log(`📊 Total documents in mealplans collection: ${allMealPlans.length}`);
      
      allMealPlans.forEach((plan, index) => {
        console.log(`   ${index + 1}. ID: ${plan._id}`);
        console.log(`      userId: ${plan.userId}`);
        console.log(`      customerId: ${plan.customerId || 'N/A'}`);
        console.log(`      totalItems: ${plan.totalItems || 0}`);
        console.log(`      restaurant: ${plan.selectedRestaurantName || 'N/A'}`);
        console.log('      ---');
      });
      
      // Try to find by matching the ID you provided
      mealPlan = allMealPlans.find(plan => 
        plan.userId === userId || 
        plan.userId?.toString() === userId ||
        plan.customerId === userId ||
        plan.customerId?.toString() === userId
      );
    }

    if (!mealPlan) {
      console.log('❌ No meal plan found in mealplans collection');
      return;
    }

    console.log('✅ Found meal plan in "mealplans" collection');
    console.log(`📊 Total Items: ${mealPlan.totalItems}`);
    console.log(`🏪 Restaurant: ${mealPlan.selectedRestaurantName} (${mealPlan.selectedRestaurantId})`);
    console.log(`📅 Last Updated: ${mealPlan.lastUpdated}`);

    // Analyze the weekly plans structure
    console.log('\n📅 Database Structure Analysis:');
    console.log('=' .repeat(50));

    if (mealPlan.weeklyPlans) {
      Object.keys(mealPlan.weeklyPlans).forEach(weekKey => {
        const week = mealPlan.weeklyPlans[weekKey];
        console.log(`\n📋 ${weekKey.toUpperCase()}:`);
        
        const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        let weekTotalItems = 0;
        
        daysOfWeek.forEach(day => {
          const dayData = week[day];
          if (dayData) {
            const lunchCount = dayData.lunch ? dayData.lunch.length : 0;
            const dinnerCount = dayData.dinner ? dayData.dinner.length : 0;
            const dayTotal = lunchCount + dinnerCount;
            weekTotalItems += dayTotal;
            
            if (dayTotal > 0) {
              console.log(`   ${day.toUpperCase()}: ${lunchCount} lunch, ${dinnerCount} dinner (total: ${dayTotal})`);
              
              // Show actual items
              if (lunchCount > 0) {
                dayData.lunch.forEach((item, index) => {
                  console.log(`     L${index + 1}: ${item.name || 'Unknown'} - $${item.price || 0} (ID: ${item.id || 'N/A'})`);
                  console.log(`          Restaurant: ${item.restaurantName || 'N/A'}`);
                  console.log(`          Added: ${item.addedAt || 'N/A'}`);
                  console.log(`          Plan ID: ${item.planId || 'N/A'}`);
                });
              }
              
              if (dinnerCount > 0) {
                dayData.dinner.forEach((item, index) => {
                  console.log(`     D${index + 1}: ${item.name || 'Unknown'} - $${item.price || 0} (ID: ${item.id || 'N/A'})`);
                  console.log(`          Restaurant: ${item.restaurantName || 'N/A'}`);
                  console.log(`          Added: ${item.addedAt || 'N/A'}`);
                  console.log(`          Plan ID: ${item.planId || 'N/A'}`);
                });
              }
            } else {
              console.log(`   ${day.toUpperCase()}: 0 items`);
            }
          }
        });
        
        console.log(`   📊 ${weekKey.toUpperCase()} TOTAL: ${weekTotalItems} items`);
      });
    }

    // Calculate expected UI display
    console.log('\n🖥️ Expected UI Display Analysis:');
    console.log('=' .repeat(50));
    
    console.log('Based on database structure, UI should show:');
    
    if (mealPlan.weeklyPlans.week0) {
      console.log('\n📅 WEEK 1 (Oct 12 - Oct 18):');
      const week0 = mealPlan.weeklyPlans.week0;
      const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      
      daysOfWeek.forEach(day => {
        const dayData = week0[day];
        const lunchCount = dayData?.lunch?.length || 0;
        const dinnerCount = dayData?.dinner?.length || 0;
        const total = lunchCount + dinnerCount;
        
        console.log(`   ${day.charAt(0).toUpperCase() + day.slice(1)}: ${total} items`);
      });
    }
    
    if (mealPlan.weeklyPlans.week1) {
      console.log('\n📅 WEEK 2 (Oct 19 - Oct 25):');
      const week1 = mealPlan.weeklyPlans.week1;
      const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      
      daysOfWeek.forEach(day => {
        const dayData = week1[day];
        const lunchCount = dayData?.lunch?.length || 0;
        const dinnerCount = dayData?.dinner?.length || 0;
        const total = lunchCount + dinnerCount;
        
        console.log(`   ${day.charAt(0).toUpperCase() + day.slice(1)}: ${total} items`);
      });
    }

    // Compare with what user reported seeing in UI
    console.log('\n🚨 UI vs Database Mismatch Analysis:');
    console.log('=' .repeat(50));
    
    console.log('USER REPORTED UI SHOWS:');
    console.log('Week 1: Sunday(1), Monday(1), Tue-Fri(0), Saturday(0)');
    console.log('Week 2: Sunday(1), Monday(3), Tuesday(0), Saturday(0)');
    
    console.log('\nDATABASE ACTUALLY HAS:');
    // This will show the actual database structure vs UI display
    
    // Check for potential issues
    console.log('\n🔍 Potential Issues Identified:');
    console.log('1. UI might be reading from wrong week index');
    console.log('2. Day mapping might be incorrect (sunday vs monday confusion)');
    console.log('3. Item counting logic might be wrong in frontend');
    console.log('4. Date calculation affecting which week/day is displayed');
    console.log('5. Multiple meal plan contexts might be conflicting');

    // Recommendations
    console.log('\n💡 Investigation Recommendations:');
    console.log('1. Check frontend getWeekMealItems() function logic');
    console.log('2. Verify day name mapping (sunday=0 vs monday=0)');
    console.log('3. Check if UI is using correct week index (0 vs 1)');
    console.log('4. Verify date calculations in frontend match database dates');
    console.log('5. Check if multiple meal plan contexts are interfering');
    
  } catch (error) {
    console.error('❌ Error analyzing meal plan mismatch:', error);
  } finally {
    mongoose.connection.close();
  }
}

analyzeMealPlanMismatch();
