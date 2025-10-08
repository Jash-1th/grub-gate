// FILE: scripts/debug-day-mapping.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const SubscriptionMealPlan = require('../src/models/SubscriptionMealPlan');

/**
 * Debug day mapping in order generation
 */
async function debugDayMapping() {
  try {
    console.log('🔍 Debugging Day Mapping...');
    console.log('=' .repeat(50));
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
    
    const customerId = '68e60bc544b875ac6aaf9526';
    const restaurantId = '68e60c9d44b875ac6aaf953d';
    
    // Get the subscription
    const subscription = await SubscriptionMealPlan.findOne({
      customerId: customerId,
      restaurantId: restaurantId,
      status: 'active'
    });
    
    if (!subscription) {
      console.log('❌ No subscription found');
      return;
    }
    
    // Find Week 2 (the active week)
    const activeWeek = subscription.weeks.find(week => week.weekNumber === 2);
    
    if (!activeWeek) {
      console.log('❌ Active week not found');
      return;
    }
    
    console.log(`\n📅 Week ${activeWeek.weekNumber} Details:`);
    console.log(`   Start Date: ${activeWeek.weekStartDate?.toISOString()}`);
    console.log(`   End Date: ${activeWeek.weekEndDate?.toISOString()}`);
    
    // Check what day October 19, 2025 should be
    const oct19 = new Date('2025-10-19T00:00:00.000Z');
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = dayNames[oct19.getDay()];
    
    console.log(`\n🗓️ October 19, 2025:`);
    console.log(`   Date: ${oct19.toISOString()}`);
    console.log(`   Day of Week: ${dayName} (index: ${oct19.getDay()})`);
    
    // Simulate the order generation day calculation
    console.log(`\n🔄 Order Generation Day Calculation:`);
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    
    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      const dayNameLower = daysOfWeek[dayIndex];
      
      // Calculate the actual calendar date for this day (same logic as service)
      const orderDate = new Date(activeWeek.weekStartDate);
      orderDate.setUTCDate(activeWeek.weekStartDate.getUTCDate() + dayIndex);
      orderDate.setUTCHours(0, 0, 0, 0);
      
      const isOct19 = orderDate.getTime() === oct19.getTime();
      const marker = isOct19 ? ' ← OCT 19!' : '';
      
      console.log(`   Day ${dayIndex}: ${dayNameLower} → ${orderDate.toISOString().split('T')[0]}${marker}`);
      
      if (isOct19) {
        console.log(`      🎯 This should use "${dayNameLower}" meals from subscription`);
        
        // Check what meals are available for this day
        const dayMeals = activeWeek.meals[dayNameLower];
        if (dayMeals) {
          if (dayMeals.lunch && dayMeals.lunch.length > 0) {
            console.log(`      🍽️ Lunch: ${dayMeals.lunch[0].name}`);
          }
          if (dayMeals.dinner && dayMeals.dinner.length > 0) {
            console.log(`      🍽️ Dinner: ${dayMeals.dinner[0].name}`);
          }
        }
      }
    }
    
    console.log('\n🎉 Day Mapping Debug Complete!');
    
  } catch (error) {
    console.error('💥 Debug failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Handle script termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Debug interrupted');
  await mongoose.connection.close();
  process.exit(0);
});

// Run the debug
debugDayMapping();
