// FILE: scripts/debug-date-calculation.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const SubscriptionMealPlan = require('../src/models/SubscriptionMealPlan');

/**
 * Debug date calculation in order generation
 */
async function debugDateCalculation() {
  try {
    console.log('🔍 DEBUGGING DATE CALCULATION');
    console.log('=' .repeat(40));
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    
    const customerId = '68e7578c70b1ebbce509b69c';
    
    // Get the latest subscription
    const subscription = await SubscriptionMealPlan.findOne({ customerId: customerId })
      .sort({ createdAt: -1 });
    
    if (!subscription) {
      console.log('❌ No subscription found');
      return;
    }
    
    console.log(`📋 Subscription: ${subscription._id}`);
    
    // Test the date calculation logic from the order generation service
    const activeWeek = subscription.weeks.find(w => w.originalWeekIndex === 1);
    
    if (!activeWeek) {
      console.log('❌ Active week not found');
      return;
    }
    
    console.log(`\n📅 ACTIVE WEEK ANALYSIS:`);
    console.log(`Week Start Date: ${activeWeek.weekStartDate}`);
    console.log(`Week End Date: ${activeWeek.weekEndDate}`);
    
    // Simulate the order generation date calculation
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    
    console.log(`\n🔍 DATE CALCULATION SIMULATION:`);
    console.log('-' .repeat(35));
    
    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      const dayName = daysOfWeek[dayIndex];
      const dayMeals = activeWeek.meals[dayName];
      
      // This is the exact logic from the order generation service
      const orderDate = new Date(activeWeek.weekStartDate);
      orderDate.setUTCDate(orderDate.getUTCDate() + dayIndex);
      orderDate.setUTCHours(0, 0, 0, 0);
      
      const lunchCount = dayMeals?.lunch?.length || 0;
      const dinnerCount = dayMeals?.dinner?.length || 0;
      
      console.log(`\nDay ${dayIndex} (${dayName}):`);
      console.log(`   Week Start: ${activeWeek.weekStartDate.toISOString()}`);
      console.log(`   Calculated Date: ${orderDate.toISOString()}`);
      console.log(`   Local Date: ${orderDate.toDateString()}`);
      console.log(`   Meals: ${lunchCount} lunch, ${dinnerCount} dinner`);
      
      if (lunchCount > 0) {
        console.log(`   → Should create LUNCH order for ${orderDate.toDateString()}`);
        dayMeals.lunch.forEach((meal, index) => {
          console.log(`     ${index + 1}. ${meal.name} ($${meal.price})`);
        });
      }
      
      if (dinnerCount > 0) {
        console.log(`   → Should create DINNER order for ${orderDate.toDateString()}`);
        dayMeals.dinner.forEach((meal, index) => {
          console.log(`     ${index + 1}. ${meal.name} ($${meal.price})`);
        });
      }
      
      // Check if this matches what we expect
      const expectedDate = new Date(activeWeek.weekStartDate);
      expectedDate.setDate(expectedDate.getDate() + dayIndex);
      
      const calculatedDateStr = orderDate.toDateString();
      const expectedDateStr = expectedDate.toDateString();
      const datesMatch = calculatedDateStr === expectedDateStr;
      
      console.log(`   Expected: ${expectedDateStr}`);
      console.log(`   Calculated: ${calculatedDateStr}`);
      console.log(`   Match: ${datesMatch ? '✅' : '❌'}`);
      
      if (!datesMatch) {
        console.log(`   ⚠️  DATE MISMATCH DETECTED!`);
      }
    }
    
    // Check timezone issues
    console.log(`\n🌍 TIMEZONE ANALYSIS:`);
    console.log('-' .repeat(20));
    
    const weekStart = new Date(activeWeek.weekStartDate);
    console.log(`Week Start (Original): ${weekStart.toISOString()}`);
    console.log(`Week Start (Local): ${weekStart.toDateString()}`);
    console.log(`Week Start (UTC Date): ${weekStart.getUTCDate()}`);
    console.log(`Week Start (Local Date): ${weekStart.getDate()}`);
    
    // Test UTC vs Local date manipulation
    const testDate1 = new Date(weekStart);
    testDate1.setUTCDate(testDate1.getUTCDate() + 0); // Sunday
    
    const testDate2 = new Date(weekStart);
    testDate2.setDate(testDate2.getDate() + 0); // Sunday
    
    console.log(`\nUTC Manipulation: ${testDate1.toDateString()}`);
    console.log(`Local Manipulation: ${testDate2.toDateString()}`);
    console.log(`Same Result: ${testDate1.toDateString() === testDate2.toDateString() ? '✅' : '❌'}`);
    
  } catch (error) {
    console.error('💥 Debug failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the debug
debugDateCalculation();
