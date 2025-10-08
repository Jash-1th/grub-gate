// FILE: scripts/check-menu-item-ids.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const MenuItem = require('../src/models/MenuItem');
const SubscriptionMealPlan = require('../src/models/SubscriptionMealPlan');

/**
 * Check menu item IDs and subscription meal plan references
 */
async function checkMenuItemIds() {
  try {
    console.log('🔍 Checking Menu Item IDs...');
    console.log('=' .repeat(50));
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
    
    const restaurantId = '68e60c9d44b875ac6aaf953d';
    
    // Get all menu items for this restaurant
    console.log('\n🍽️ MENU ITEMS IN DATABASE:');
    console.log('-' .repeat(40));
    
    const menuItems = await MenuItem.find({ restaurantId: restaurantId });
    
    if (menuItems.length > 0) {
      menuItems.forEach((item, index) => {
        console.log(`${index + 1}. ${item.name}`);
        console.log(`   🆔 ID: ${item._id}`);
        console.log(`   💰 Price: $${item.price?.toFixed(2)}`);
        console.log(`   📝 Description: ${item.description || 'No description'}`);
        console.log(`   🏷️ Category: ${item.category}`);
        console.log(`   ⏱️ Prep Time: ${item.prepTime} min`);
        console.log('');
      });
    } else {
      console.log('❌ No menu items found for this restaurant');
    }
    
    // Check subscription meal plan
    console.log('\n📋 SUBSCRIPTION MEAL PLAN ITEMS:');
    console.log('-' .repeat(40));
    
    const subscription = await SubscriptionMealPlan.findOne({
      restaurantId: restaurantId,
      status: 'active'
    });
    
    if (subscription && subscription.weeks) {
      subscription.weeks.forEach((week, weekIndex) => {
        console.log(`\nWeek ${week.weekNumber}:`);
        
        if (week.meals) {
          const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
          
          daysOfWeek.forEach(day => {
            const dayMeals = week.meals[day];
            if (dayMeals) {
              if (dayMeals.lunch && dayMeals.lunch.length > 0) {
                dayMeals.lunch.forEach(meal => {
                  console.log(`   ${day} Lunch: ${meal.name}`);
                  console.log(`      🆔 Menu Item ID: ${meal.menuItemId}`);
                  console.log(`      💰 Price: $${meal.price}`);
                });
              }
              if (dayMeals.dinner && dayMeals.dinner.length > 0) {
                dayMeals.dinner.forEach(meal => {
                  console.log(`   ${day} Dinner: ${meal.name}`);
                  console.log(`      🆔 Menu Item ID: ${meal.menuItemId}`);
                  console.log(`      💰 Price: $${meal.price}`);
                });
              }
            }
          });
        }
      });
    }
    
    // Check if the referenced menu item ID exists
    console.log('\n🔍 CHECKING REFERENCED MENU ITEM ID:');
    console.log('-' .repeat(40));
    
    const referencedId = '68e65166b6624cc30f2da908';
    console.log(`Looking for menu item ID: ${referencedId}`);
    
    const referencedItem = await MenuItem.findById(referencedId);
    if (referencedItem) {
      console.log(`✅ Found: ${referencedItem.name}`);
      console.log(`   Restaurant: ${referencedItem.restaurantId}`);
      console.log(`   Price: $${referencedItem.price?.toFixed(2)}`);
    } else {
      console.log(`❌ Menu item with ID ${referencedId} not found`);
      console.log('   This explains why the enhancement failed!');
    }
    
    console.log('\n🎉 Menu Item ID Check Complete!');
    
  } catch (error) {
    console.error('💥 Check failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Handle script termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Check interrupted');
  await mongoose.connection.close();
  process.exit(0);
});

// Run the check
checkMenuItemIds();
