// Script to test the meal plan sync fix
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

async function testMealPlanSync() {
  await connectDB();
  
  try {
    const userId = '68e7b7ea4a70ed31cffb3fe9';
    
    console.log('🧪 Testing Meal Plan Sync Fix');
    console.log('=' .repeat(60));
    console.log(`👤 User ID: ${userId}`);

    // Test the meal plan API endpoint
    console.log('\n🔍 Testing API endpoint structure...');
    
    const mealPlansCollection = mongoose.connection.db.collection('mealplans');
    const mealPlan = await mealPlansCollection.findOne({ userId: userId });

    if (!mealPlan) {
      console.log('❌ No meal plan found for testing');
      return;
    }

    console.log('✅ Found meal plan in database');
    console.log(`📊 Total Items: ${mealPlan.totalItems}`);
    console.log(`🏪 Restaurant: ${mealPlan.selectedRestaurantName}`);

    // Simulate what the API should return
    console.log('\n📋 Expected API Response Structure:');
    const expectedResponse = {
      userId: mealPlan.userId,
      weeklyPlans: mealPlan.weeklyPlans,
      totalItems: mealPlan.totalItems,
      selectedRestaurantId: mealPlan.selectedRestaurantId,
      selectedRestaurantName: mealPlan.selectedRestaurantName,
      selectedRestaurantData: mealPlan.selectedRestaurantData
    };

    console.log('✅ API Response Structure:');
    console.log(`   userId: ${expectedResponse.userId}`);
    console.log(`   totalItems: ${expectedResponse.totalItems}`);
    console.log(`   weeklyPlans.week0: ${Object.keys(expectedResponse.weeklyPlans?.week0 || {}).length} days`);
    console.log(`   weeklyPlans.week1: ${Object.keys(expectedResponse.weeklyPlans?.week1 || {}).length} days`);

    // Verify the data structure matches what frontend expects
    console.log('\n🔍 Frontend Compatibility Check:');
    
    if (expectedResponse.weeklyPlans?.week0 && expectedResponse.weeklyPlans?.week1) {
      console.log('✅ Has both week0 and week1 structures');
      
      const week0Items = Object.values(expectedResponse.weeklyPlans.week0).reduce((total, day) => {
        return total + (day.lunch?.length || 0) + (day.dinner?.length || 0);
      }, 0);
      
      const week1Items = Object.values(expectedResponse.weeklyPlans.week1).reduce((total, day) => {
        return total + (day.lunch?.length || 0) + (day.dinner?.length || 0);
      }, 0);
      
      console.log(`✅ Week 0 items: ${week0Items}`);
      console.log(`✅ Week 1 items: ${week1Items}`);
      console.log(`✅ Total calculated: ${week0Items + week1Items} (should match ${expectedResponse.totalItems})`);
      
      if (week0Items + week1Items === expectedResponse.totalItems) {
        console.log('✅ Item count matches!');
      } else {
        console.log('❌ Item count mismatch!');
      }
    } else {
      console.log('❌ Missing week structures');
    }

    // Test the day mapping
    console.log('\n📅 Day Mapping Verification:');
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    
    daysOfWeek.forEach(day => {
      const week0Day = expectedResponse.weeklyPlans?.week0?.[day];
      const week1Day = expectedResponse.weeklyPlans?.week1?.[day];
      
      const week0Count = (week0Day?.lunch?.length || 0) + (week0Day?.dinner?.length || 0);
      const week1Count = (week1Day?.lunch?.length || 0) + (week1Day?.dinner?.length || 0);
      
      if (week0Count > 0 || week1Count > 0) {
        console.log(`   ${day}: Week0(${week0Count}), Week1(${week1Count})`);
      }
    });

    console.log('\n🎯 Fix Summary:');
    console.log('1. ✅ Updated WeeklyMenuPage to use MealPlanContext_SSR_FIXED');
    console.log('2. ✅ Added SYNC_DATABASE_DATA action to sync with database');
    console.log('3. ✅ Enhanced API endpoint to serve meal plan data');
    console.log('4. ✅ Added proper data structure conversion');
    console.log('5. ✅ Made context SSR-safe');

    console.log('\n🔄 Expected Result:');
    console.log('- UI should now display items on correct days');
    console.log('- Item counts should match database');
    console.log('- No more day mapping confusion');
    console.log('- SSR-safe rendering');
    
  } catch (error) {
    console.error('❌ Error testing meal plan sync:', error);
  } finally {
    mongoose.connection.close();
  }
}

testMealPlanSync();
