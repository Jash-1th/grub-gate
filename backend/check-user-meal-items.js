/**
 * Check what meal plan items were created for user 68e7b7ea4a70ed31cffb3fe9
 * and on which days they were selected
 */

require('dotenv').config();
const mongoose = require('mongoose');
const MealPlan = require('./src/models/MealPlan');
const SubscriptionMealPlan = require('./src/models/SubscriptionMealPlan');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/grub-gate';
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const checkUserMealItems = async () => {
  try {
    console.log('🍽️ Checking meal plan items for user 68e7b7ea4a70ed31cffb3fe9');
    console.log('=' .repeat(70));

    const userId = '68e7b7ea4a70ed31cffb3fe9';
    
    // Check regular meal plan
    console.log('\n📋 Regular Meal Plan:');
    console.log('-' .repeat(40));
    
    const mealPlan = await MealPlan.findOne({ userId });
    
    if (!mealPlan) {
      console.log('❌ No regular meal plan found');
    } else {
      console.log(`✅ Found regular meal plan (ID: ${mealPlan._id})`);
      console.log(`   Total Items: ${mealPlan.totalItems}`);
      console.log(`   Selected Restaurant: ${mealPlan.selectedRestaurantName}`);
      
      // Check each week
      ['week0', 'week1'].forEach((weekKey, weekIndex) => {
        const week = mealPlan.weeklyPlans[weekKey];
        if (!week) return;
        
        console.log(`\n   📅 Week ${weekIndex} (${weekKey}):`);
        
        const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        let weekHasItems = false;
        
        daysOfWeek.forEach(day => {
          const dayMeals = week[day];
          if (!dayMeals) return;
          
          const lunchItems = dayMeals.lunch || [];
          const dinnerItems = dayMeals.dinner || [];
          const totalDayItems = lunchItems.length + dinnerItems.length;
          
          if (totalDayItems > 0) {
            weekHasItems = true;
            console.log(`     🗓️ ${day.toUpperCase()}:`);
            
            if (lunchItems.length > 0) {
              console.log(`       🌅 Lunch (${lunchItems.length} items):`);
              lunchItems.forEach((item, index) => {
                console.log(`         ${index + 1}. ${item.name} - $${item.price}`);
                console.log(`            Added: ${item.addedAt ? new Date(item.addedAt).toLocaleString() : 'Unknown'}`);
              });
            }
            
            if (dinnerItems.length > 0) {
              console.log(`       🌙 Dinner (${dinnerItems.length} items):`);
              dinnerItems.forEach((item, index) => {
                console.log(`         ${index + 1}. ${item.name} - $${item.price}`);
                console.log(`            Added: ${item.addedAt ? new Date(item.addedAt).toLocaleString() : 'Unknown'}`);
              });
            }
          }
        });
        
        if (!weekHasItems) {
          console.log(`     (No items in this week)`);
        }
      });
    }
    
    // Check subscription meal plan
    console.log('\n📋 Subscription Meal Plan:');
    console.log('-' .repeat(40));
    
    const subscriptionPlans = await SubscriptionMealPlan.find({ customerId: userId });
    
    if (subscriptionPlans.length === 0) {
      console.log('❌ No subscription meal plans found');
    } else {
      subscriptionPlans.forEach((plan, planIndex) => {
        console.log(`\n✅ Subscription Plan ${planIndex + 1} (ID: ${plan._id})`);
        console.log(`   Plan Type: ${plan.planType}`);
        console.log(`   Start Date: ${plan.planStartDate.toDateString()}`);
        console.log(`   End Date: ${plan.planEndDate.toDateString()}`);
        console.log(`   Total Meals: ${plan.totalMealsCount}`);
        console.log(`   Selected Restaurant: ${plan.selectedRestaurantName}`);
        
        // Check each week in subscription
        plan.weeks.forEach((week, weekIndex) => {
          console.log(`\n   📅 Week ${weekIndex + 1}:`);
          console.log(`     Week Start: ${week.weekStartDate.toDateString()}`);
          console.log(`     Week End: ${week.weekEndDate.toDateString()}`);
          
          const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
          let weekHasItems = false;
          
          daysOfWeek.forEach(day => {
            const dayMeals = week.meals[day];
            if (!dayMeals) return;
            
            const lunchItems = dayMeals.lunch || [];
            const dinnerItems = dayMeals.dinner || [];
            const totalDayItems = lunchItems.length + dinnerItems.length;
            
            if (totalDayItems > 0) {
              weekHasItems = true;
              console.log(`     🗓️ ${day.toUpperCase()}:`);
              
              if (lunchItems.length > 0) {
                console.log(`       🌅 Lunch (${lunchItems.length} items):`);
                lunchItems.forEach((item, index) => {
                  console.log(`         ${index + 1}. ${item.name} - $${item.price}`);
                  console.log(`            Added: ${item.addedAt ? new Date(item.addedAt).toLocaleString() : 'Unknown'}`);
                });
              }
              
              if (dinnerItems.length > 0) {
                console.log(`       🌙 Dinner (${dinnerItems.length} items):`);
                dinnerItems.forEach((item, index) => {
                  console.log(`         ${index + 1}. ${item.name} - $${item.price}`);
                  console.log(`            Added: ${item.addedAt ? new Date(item.addedAt).toLocaleString() : 'Unknown'}`);
                });
              }
            }
          });
          
          if (!weekHasItems) {
            console.log(`     (No items in this week)`);
          }
        });
      });
    }
    
    // Summary
    console.log('\n🎯 Summary:');
    console.log('-' .repeat(40));
    
    const regularMealCount = mealPlan ? mealPlan.totalItems : 0;
    const subscriptionMealCount = subscriptionPlans.reduce((total, plan) => total + plan.totalMealsCount, 0);
    
    console.log(`Regular Meal Plan Items: ${regularMealCount}`);
    console.log(`Subscription Meal Plan Items: ${subscriptionMealCount}`);
    console.log(`Total Items: ${regularMealCount + subscriptionMealCount}`);
    
    if (regularMealCount > 0 || subscriptionMealCount > 0) {
      console.log('\n✅ Items were found! Check the details above to see which days they were selected for.');
    } else {
      console.log('\n❌ No meal plan items found for this user.');
    }

  } catch (error) {
    console.error('❌ Error checking meal items:', error);
  }
};

const runCheck = async () => {
  await connectDB();
  await checkUserMealItems();
  await mongoose.connection.close();
  console.log('\n✅ Database connection closed');
};

runCheck();
