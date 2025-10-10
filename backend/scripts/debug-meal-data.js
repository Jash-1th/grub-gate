// FILE: scripts/debug-meal-data.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const SubscriptionMealPlan = require('../src/models/SubscriptionMealPlan');

async function debugMealData() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    
    const subscription = await SubscriptionMealPlan.findById('68e7635769c614351d4dd059');
    
    console.log('=== SUBSCRIPTION MEAL DATA DEBUG ===');
    
    subscription.weeks.forEach((week, weekIndex) => {
      console.log(`\nWeek ${weekIndex} (${week.weekStartDate.toDateString()} - ${week.weekEndDate.toDateString()}):`);
      
      const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      let weekTotal = 0;
      
      daysOfWeek.forEach(day => {
        const dayMeals = week.meals[day];
        const lunchCount = dayMeals?.lunch?.length || 0;
        const dinnerCount = dayMeals?.dinner?.length || 0;
        weekTotal += lunchCount + dinnerCount;
        
        if (lunchCount > 0 || dinnerCount > 0) {
          console.log(`  ${day}: ${lunchCount} lunch, ${dinnerCount} dinner`);
          
          // Show actual meal items
          if (lunchCount > 0) {
            dayMeals.lunch.forEach((meal, i) => {
              console.log(`    Lunch ${i+1}: ${meal.name} (${meal.deliveryTime})`);
            });
          }
          if (dinnerCount > 0) {
            dayMeals.dinner.forEach((meal, i) => {
              console.log(`    Dinner ${i+1}: ${meal.name} (${meal.deliveryTime})`);
            });
          }
        }
      });
      
      console.log(`  Week ${weekIndex} Total: ${weekTotal} meals`);
    });
    
    await mongoose.connection.close();
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

debugMealData();
