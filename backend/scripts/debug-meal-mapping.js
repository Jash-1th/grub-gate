// FILE: scripts/debug-meal-mapping.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const SubscriptionMealPlan = require('../src/models/SubscriptionMealPlan');

/**
 * Debug meal mapping to understand why orders are on wrong days
 */
async function debugMealMapping() {
  try {
    console.log('🔍 DEBUGGING MEAL MAPPING ISSUE');
    console.log('=' .repeat(50));
    
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
    
    // Analyze the subscription weeks structure in detail
    console.log('\n🍽️  DETAILED MEAL STRUCTURE ANALYSIS:');
    console.log('-' .repeat(45));
    
    subscription.weeks.forEach((week, weekIndex) => {
      console.log(`\nWeek ${weekIndex} (Week Number: ${week.weekNumber}, Original Index: ${week.originalWeekIndex}):`);
      console.log(`   Start: ${week.weekStartDate.toDateString()}`);
      
      const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      
      daysOfWeek.forEach((day, dayIndex) => {
        const dayMeals = week.meals[day];
        if (dayMeals) {
          const lunchItems = dayMeals.lunch || [];
          const dinnerItems = dayMeals.dinner || [];
          
          if (lunchItems.length > 0 || dinnerItems.length > 0) {
            console.log(`\n   ${day} (day ${dayIndex}):`);
            
            if (lunchItems.length > 0) {
              console.log(`     Lunch (${lunchItems.length} items):`);
              lunchItems.forEach((item, itemIndex) => {
                console.log(`       ${itemIndex + 1}. ${item.name} ($${item.price}) - ID: ${item.menuItemId}`);
              });
            }
            
            if (dinnerItems.length > 0) {
              console.log(`     Dinner (${dinnerItems.length} items):`);
              dinnerItems.forEach((item, itemIndex) => {
                console.log(`       ${itemIndex + 1}. ${item.name} ($${item.price}) - ID: ${item.menuItemId}`);
              });
            }
          }
        }
      });
    });
    
    // Expected vs Actual mapping
    console.log('\n📊 EXPECTED MEAL MAPPING:');
    console.log('-' .repeat(25));
    console.log('Week 1 (Active - originalWeekIndex: 1):');
    console.log('   Sunday lunch: chiceknn ($10)');
    console.log('   Sunday dinner: fish fry ($20)');
    console.log('   Monday lunch: mutton fry ($15)');
    console.log('   Tuesday dinner: roti with cuury ($26)');
    console.log('   Total: 4 orders');
    console.log('');
    console.log('Week 2 (Empty - originalWeekIndex: 0):');
    console.log('   No meals');
    console.log('   Total: 0 orders');
    
    // Check if the issue is in the subscription structure
    const activeWeek = subscription.weeks.find(w => w.originalWeekIndex === 1);
    const emptyWeek = subscription.weeks.find(w => w.originalWeekIndex === 0);
    
    console.log('\n🔍 WEEK STRUCTURE VERIFICATION:');
    console.log('-' .repeat(30));
    
    if (activeWeek) {
      console.log('✅ Active week found (originalWeekIndex: 1)');
      console.log(`   Week Number: ${activeWeek.weekNumber}`);
      console.log(`   Start Date: ${activeWeek.weekStartDate.toDateString()}`);
      
      // Count actual meals
      let totalMeals = 0;
      const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      daysOfWeek.forEach(day => {
        const lunchCount = activeWeek.meals[day]?.lunch?.length || 0;
        const dinnerCount = activeWeek.meals[day]?.dinner?.length || 0;
        totalMeals += lunchCount + dinnerCount;
      });
      
      console.log(`   Total meals: ${totalMeals} (expected: 4)`);
    } else {
      console.log('❌ Active week not found!');
    }
    
    if (emptyWeek) {
      console.log('✅ Empty week found (originalWeekIndex: 0)');
      console.log(`   Week Number: ${emptyWeek.weekNumber}`);
      console.log(`   Start Date: ${emptyWeek.weekStartDate.toDateString()}`);
    } else {
      console.log('❌ Empty week not found!');
    }
    
  } catch (error) {
    console.error('💥 Debug failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the debug
debugMealMapping();
