// FILE: scripts/complete-live-workflow-test.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import models
const User = require('../src/models/User');
const Restaurant = require('../src/models/Restaurant');
const MenuItem = require('../src/models/MenuItem');
const MealPlan = require('../src/models/MealPlan');
const Order = require('../src/models/Order');
const SubscriptionMealPlan = require('../src/models/SubscriptionMealPlan');

/**
 * Complete end-to-end live workflow test
 * Simulates the entire process from meal planning to order generation
 */
async function completeLiveWorkflowTest() {
  try {
    console.log('🚀 COMPLETE LIVE WORKFLOW TEST');
    console.log('=' .repeat(60));
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    
    const customerId = '68e7578c70b1ebbce509b69c';
    const restaurantId = '68e73d168c18e7fd776a6327';
    
    // STEP 1: CLEANUP - Delete existing orders and subscriptions
    console.log('\n🧹 STEP 1: CLEANUP EXISTING DATA');
    console.log('-' .repeat(40));
    
    // Delete existing orders
    const deletedOrders = await Order.deleteMany({ customerId: customerId });
    console.log(`🗑️  Deleted ${deletedOrders.deletedCount} existing orders`);
    
    // Delete existing subscriptions
    const deletedSubscriptions = await SubscriptionMealPlan.deleteMany({ customerId: customerId });
    console.log(`🗑️  Deleted ${deletedSubscriptions.deletedCount} existing subscriptions`);
    
    // Delete existing meal plans
    const deletedMealPlans = await MealPlan.deleteMany({ userId: customerId });
    console.log(`🗑️  Deleted ${deletedMealPlans.deletedCount} existing meal plans`);
    
    // STEP 2: VERIFY CUSTOMER-RESTAURANT CONNECTIONS
    console.log('\n🔍 STEP 2: VERIFY CONNECTIONS');
    console.log('-' .repeat(35));
    
    // Check customer exists
    const customer = await User.findById(customerId);
    if (!customer) {
      throw new Error(`Customer ${customerId} not found`);
    }
    console.log(`👤 Customer: ${customer.firstName} ${customer.lastName} (${customer.email})`);
    
    // Check restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      throw new Error(`Restaurant ${restaurantId} not found`);
    }
    console.log(`🏪 Restaurant: ${restaurant.name}`);
    console.log(`   Status: ${restaurant.status}`);
    console.log(`   Owner: ${restaurant.ownerId}`);
    
    // Check menu items available
    const menuItems = await MenuItem.find({ restaurantId: restaurantId });
    console.log(`🍽️  Available Menu Items: ${menuItems.length}`);
    
    if (menuItems.length === 0) {
      throw new Error('No menu items found for restaurant');
    }
    
    // Display available menu items
    console.log('\n📋 AVAILABLE MENU ITEMS:');
    menuItems.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.name} - $${item.price} (${item.category})`);
    });
    
    // STEP 3: CREATE MEAL PLAN WITH STRATEGIC SELECTIONS
    console.log('\n🍽️  STEP 3: CREATE MEAL PLAN');
    console.log('-' .repeat(30));
    
    // Select diverse menu items for testing
    const selectedItems = menuItems.slice(0, 4); // Take first 4 items
    
    console.log('📝 Selected Items for Meal Plan:');
    selectedItems.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.name} - $${item.price}`);
    });
    
    // Create meal plan structure
    const mealPlanData = {
      userId: customerId,
      restaurantId: restaurantId,
      weeklyPlans: {
        week0: {
          // Week 0: Empty week (for alternating pattern)
          sunday: { lunch: [], dinner: [] },
          monday: { lunch: [], dinner: [] },
          tuesday: { lunch: [], dinner: [] },
          wednesday: { lunch: [], dinner: [] },
          thursday: { lunch: [], dinner: [] },
          friday: { lunch: [], dinner: [] },
          saturday: { lunch: [], dinner: [] }
        },
        week1: {
          // Week 1: Active week with meals
          sunday: { 
            lunch: [selectedItems[0]._id], 
            dinner: [selectedItems[1]._id] 
          },
          monday: { 
            lunch: [selectedItems[2]._id], 
            dinner: [] 
          },
          tuesday: { 
            lunch: [], 
            dinner: [selectedItems[3]._id] 
          },
          wednesday: { lunch: [], dinner: [] },
          thursday: { lunch: [], dinner: [] },
          friday: { lunch: [], dinner: [] },
          saturday: { lunch: [], dinner: [] }
        }
      },
      totalMeals: 4,
      estimatedCost: selectedItems.reduce((sum, item) => sum + item.price, 0),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('\n📊 Meal Plan Structure:');
    console.log(`   Week 0: Empty (alternating pattern)`);
    console.log(`   Week 1: 4 meals selected`);
    console.log(`     - Sunday: Lunch + Dinner`);
    console.log(`     - Monday: Lunch only`);
    console.log(`     - Tuesday: Dinner only`);
    console.log(`   Total Cost: $${mealPlanData.estimatedCost}`);
    
    // Save meal plan
    const mealPlan = new MealPlan(mealPlanData);
    await mealPlan.save();
    console.log(`✅ Meal Plan Created: ${mealPlan._id}`);
    
    // STEP 4: SIMULATE SUBSCRIPTION CREATION
    console.log('\n💳 STEP 4: CREATE 3-MONTH SUBSCRIPTION');
    console.log('-' .repeat(40));
    
    // This will be continued in the next part...
    console.log('🔄 Preparing subscription creation...');
    
    return {
      customerId,
      restaurantId,
      customer,
      restaurant,
      menuItems: selectedItems,
      mealPlan,
      cleanup: {
        deletedOrders: deletedOrders.deletedCount,
        deletedSubscriptions: deletedSubscriptions.deletedCount,
        deletedMealPlans: deletedMealPlans.deletedCount
      }
    };
    
  } catch (error) {
    console.error('💥 Test failed:', error);
    throw error;
  }
}

// Export for use in other scripts
module.exports = { completeLiveWorkflowTest };

// Run if called directly
if (require.main === module) {
  completeLiveWorkflowTest()
    .then((result) => {
      console.log('\n✅ Phase 1 completed successfully');
      console.log('📊 Results:', {
        customer: result.customer.email,
        restaurant: result.restaurant.name,
        menuItems: result.menuItems.length,
        mealPlan: result.mealPlan._id.toString(),
        cleanup: result.cleanup
      });
    })
    .catch((error) => {
      console.error('💥 Phase 1 failed:', error);
    })
    .finally(async () => {
      await mongoose.connection.close();
      console.log('\n🔌 Disconnected from MongoDB');
      process.exit(0);
    });
}
