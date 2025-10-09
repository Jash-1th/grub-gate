// FILE: scripts/add-test-meal-plan-data.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const MealPlan = require('../src/models/MealPlan');
const User = require('../src/models/User');
const Restaurant = require('../src/models/Restaurant');
const MenuItem = require('../src/models/MenuItem');

/**
 * Add test meal plan data for customer before subscription creation
 */
async function addTestMealPlanData() {
  try {
    console.log('🧪 Adding Test Meal Plan Data...');
    console.log('=' .repeat(60));
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    
    if (!mongoUri) {
      throw new Error('MongoDB URI not found. Please set MONGODB_URI or MONGO_URI in your .env file');
    }
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
    
    // Get the specific customer and restaurant
    const customerId = '68e7578c70b1ebbce509b69c';
    const restaurantId = '68e73d168c18e7fd776a6327';
    
    const customer = await User.findById(customerId);
    const restaurant = await Restaurant.findById(restaurantId);
    
    if (!customer) {
      throw new Error(`Customer not found: ${customerId}`);
    }
    
    if (!restaurant) {
      throw new Error(`Restaurant not found: ${restaurantId}`);
    }
    
    console.log(`👤 Customer: ${customer.firstName} ${customer.lastName} (${customer.email})`);
    console.log(`🏪 Restaurant: ${restaurant.name}`);
    
    // Get some menu items from the restaurant
    const menuItems = await MenuItem.find({ 
      restaurantId: restaurantId,
      status: 'available'
    }).limit(6);
    
    if (menuItems.length === 0) {
      throw new Error('No menu items found for this restaurant');
    }
    
    console.log(`📋 Found ${menuItems.length} menu items:`);
    menuItems.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.name} - $${item.price}`);
    });
    
    // Clean up existing meal plan
    await MealPlan.deleteOne({ userId: customerId });
    console.log('🗑️ Cleaned up existing meal plan');
    
    // Create meal plan data structure for quarterly subscription test
    // Week 0: EMPTY (will create empty weeks in pattern)
    // Week 1: HAS MEALS (will create meal weeks in pattern)
    const mealPlanData = {
      userId: customerId,
      weeklyPlans: {
        week0: {
          // All days empty for Week 0
          sunday: { lunch: [], dinner: [] },
          monday: { lunch: [], dinner: [] },
          tuesday: { lunch: [], dinner: [] },
          wednesday: { lunch: [], dinner: [] },
          thursday: { lunch: [], dinner: [] },
          friday: { lunch: [], dinner: [] },
          saturday: { lunch: [], dinner: [] }
        },
        week1: {
          // Week 1 has meals - this pattern will repeat every 2 weeks
          sunday: {
            lunch: menuItems[0] ? [createMealItem(menuItems[0], restaurant.name)] : [],
            dinner: menuItems[1] ? [createMealItem(menuItems[1], restaurant.name)] : []
          },
          monday: {
            lunch: menuItems[2] ? [createMealItem(menuItems[2], restaurant.name)] : [],
            dinner: []
          },
          tuesday: {
            lunch: [],
            dinner: menuItems[3] ? [createMealItem(menuItems[3], restaurant.name)] : []
          },
          wednesday: { lunch: [], dinner: [] },
          thursday: { lunch: [], dinner: [] },
          friday: { lunch: [], dinner: [] },
          saturday: { lunch: [], dinner: [] }
        }
      },
      totalItems: 4, // Only Week 1 has items
      lastUpdated: new Date()
    };
    
    // Create the meal plan
    const mealPlan = await MealPlan.create(mealPlanData);
    
    console.log('\n✅ Created meal plan with QUARTERLY SUBSCRIPTION pattern:');
    console.log('📅 Week 0 (Pattern Week - EMPTY):');
    console.log(`   Sunday: ${mealPlan.weeklyPlans.week0.sunday.lunch.length} lunch, ${mealPlan.weeklyPlans.week0.sunday.dinner.length} dinner`);
    console.log(`   Monday: ${mealPlan.weeklyPlans.week0.monday.lunch.length} lunch, ${mealPlan.weeklyPlans.week0.monday.dinner.length} dinner`);
    console.log(`   Tuesday: ${mealPlan.weeklyPlans.week0.tuesday.lunch.length} lunch, ${mealPlan.weeklyPlans.week0.tuesday.dinner.length} dinner`);
    
    console.log('📅 Week 1 (Pattern Week - HAS MEALS):');
    console.log(`   Sunday: ${mealPlan.weeklyPlans.week1.sunday.lunch.length} lunch, ${mealPlan.weeklyPlans.week1.sunday.dinner.length} dinner`);
    console.log(`   Monday: ${mealPlan.weeklyPlans.week1.monday.lunch.length} lunch, ${mealPlan.weeklyPlans.week1.monday.dinner.length} dinner`);
    console.log(`   Tuesday: ${mealPlan.weeklyPlans.week1.tuesday.lunch.length} lunch, ${mealPlan.weeklyPlans.week1.tuesday.dinner.length} dinner`);
    
    console.log(`\n📊 Total Items: ${mealPlan.totalItems}`);
    console.log(`🆔 Meal Plan ID: ${mealPlan._id}`);
    
    console.log('\n🔄 QUARTERLY SUBSCRIPTION REPETITION PATTERN (90 days):');
    console.log('   Week 1 (Oct 12-18): EMPTY (Week 0 pattern)');
    console.log('   Week 2 (Oct 19-25): 4 MEALS (Week 1 pattern) ✅');
    console.log('   Week 3 (Oct 26-Nov 1): EMPTY (Week 0 pattern)');
    console.log('   Week 4 (Nov 2-8): 4 MEALS (Week 1 pattern) ✅');
    console.log('   Week 5 (Nov 9-15): EMPTY (Week 0 pattern)');
    console.log('   Week 6 (Nov 16-22): 4 MEALS (Week 1 pattern) ✅');
    console.log('   ... continues for 13 weeks total');
    console.log('   📈 Result: ~26 orders total (4 orders × 6-7 meal weeks)');
    
    console.log('\n🎯 Next Steps:');
    console.log('1. User selects QUARTERLY subscription plan');
    console.log('2. Payment will trigger createSubscriptionFromMealPlan()');
    console.log('3. This will create SubscriptionMealPlan with 90-day duration');
    console.log('4. Order generation will repeat Week0→Week1 pattern for 13 weeks');
    console.log('5. Orders only appear on Week 1 pattern weeks (every other week)');
    
  } catch (error) {
    console.error('💥 Error adding test data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

/**
 * Create meal item in frontend format
 */
function createMealItem(menuItem, restaurantName) {
  return {
    id: menuItem._id.toString(),
    planId: `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: menuItem.name,
    price: menuItem.price,
    restaurantName: restaurantName,
    description: menuItem.description,
    image: menuItem.image,
    category: menuItem.category,
    dietaryPreferences: menuItem.dietaryPreferences || [],
    spiceLevel: menuItem.spiceLevel,
    prepTime: menuItem.prepTime,
    servings: 1,
    ingredients: menuItem.ingredients || [],
    specialInstructions: ''
  };
}

// Handle script termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Script interrupted');
  await mongoose.connection.close();
  process.exit(0);
});

// Run the script
addTestMealPlanData();
