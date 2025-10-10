// FILE: scripts/debug-subscription-dates.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const SubscriptionMealPlan = require('../src/models/SubscriptionMealPlan');
const User = require('../src/models/User');
const Restaurant = require('../src/models/Restaurant');

/**
 * Debug subscription dates and meal planning
 */
async function debugSubscriptionDates() {
  try {
    console.log('🔍 Debugging Subscription Dates and Meal Planning...');
    console.log('=' .repeat(60));
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
    
    // Get the subscription plan
    const subscriptionPlan = await SubscriptionMealPlan.findOne({
      status: 'active'
    }).populate('customerId', 'firstName lastName')
      .populate('restaurantId', 'name');
    
    if (!subscriptionPlan) {
      console.log('❌ No active subscription plan found');
      return;
    }
    
    console.log('\n📋 Subscription Plan Details:');
    console.log(`   Customer: ${subscriptionPlan.customerId.firstName} ${subscriptionPlan.customerId.lastName}`);
    console.log(`   Restaurant: ${subscriptionPlan.restaurantId.name}`);
    console.log(`   Plan Type: ${subscriptionPlan.planType}`);
    console.log(`   Start Date: ${subscriptionPlan.planStartDate.toDateString()}`);
    console.log(`   End Date: ${subscriptionPlan.planEndDate.toDateString()}`);
    
    if (subscriptionPlan.weeks && subscriptionPlan.weeks.length > 0) {
      subscriptionPlan.weeks.forEach((week, weekIndex) => {
        console.log(`\n📅 Week ${week.weekNumber}:`);
        console.log(`   Start: ${new Date(week.weekStartDate).toDateString()}`);
        console.log(`   End: ${new Date(week.weekEndDate).toDateString()}`);
        
        // Check each day of the week
        const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        
        daysOfWeek.forEach((dayName, dayIndex) => {
          // Calculate the actual calendar date for this day
          const weekStart = new Date(week.weekStartDate);
          const actualDate = new Date(weekStart);
          actualDate.setDate(weekStart.getDate() + dayIndex);
          
          const dayMeals = week.meals[dayName];
          
          if (dayMeals && ((dayMeals.lunch && dayMeals.lunch.length > 0) || (dayMeals.dinner && dayMeals.dinner.length > 0))) {
            const lunchCount = dayMeals.lunch ? dayMeals.lunch.length : 0;
            const dinnerCount = dayMeals.dinner ? dayMeals.dinner.length : 0;
            
            console.log(`   🍽️ ${dayName.toUpperCase()} (${actualDate.toDateString()}):`);
            console.log(`      • Lunch: ${lunchCount} items`);
            console.log(`      • Dinner: ${dinnerCount} items`);
            
            if (lunchCount > 0) {
              dayMeals.lunch.forEach((item, index) => {
                console.log(`        L${index + 1}: ${item.name} (₹${item.price})`);
              });
            }
            
            if (dinnerCount > 0) {
              dayMeals.dinner.forEach((item, index) => {
                console.log(`        D${index + 1}: ${item.name} (₹${item.price})`);
              });
            }
          } else {
            console.log(`   ⭕ ${dayName.toUpperCase()} (${actualDate.toDateString()}): No meals`);
          }
        });
      });
    }
    
    // Now let's check what dates we should generate orders for
    console.log('\n🎯 Dates That Should Have Orders:');
    
    const today = new Date();
    console.log(`   Today: ${today.toDateString()}`);
    
    if (subscriptionPlan.weeks && subscriptionPlan.weeks.length > 0) {
      const week = subscriptionPlan.weeks[0];
      const weekStart = new Date(week.weekStartDate);
      
      const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      
      daysOfWeek.forEach((dayName, dayIndex) => {
        const actualDate = new Date(weekStart);
        actualDate.setDate(weekStart.getDate() + dayIndex);
        
        const dayMeals = week.meals[dayName];
        
        if (dayMeals && ((dayMeals.lunch && dayMeals.lunch.length > 0) || (dayMeals.dinner && dayMeals.dinner.length > 0))) {
          const isPast = actualDate < today;
          const isToday = actualDate.toDateString() === today.toDateString();
          const isFuture = actualDate > today;
          
          let status = '';
          if (isToday) status = ' 🔥 TODAY';
          else if (isPast) status = ' ⏰ PAST';
          else if (isFuture) status = ' 📅 FUTURE';
          
          console.log(`   ✅ ${actualDate.toDateString()} (${dayName})${status}`);
        }
      });
    }
    
    console.log('\n💡 Explanation:');
    console.log('   • Orders should exist for dates marked with ✅');
    console.log('   • If you\'re checking Oct 9 & 10, make sure they match the days with meals');
    console.log('   • The subscription week starts on a specific date and maps to specific days');
    
  } catch (error) {
    console.error('💥 Debug failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the debug
debugSubscriptionDates();
