// FILE: scripts/test-single-order-enhancement.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const Order = require('../src/models/Order');
const MenuItem = require('../src/models/MenuItem');
const { createScheduledOrder } = require('../src/services/enhancedOrderGenerationService');

/**
 * Test single order enhancement
 */
async function testSingleOrderEnhancement() {
  try {
    console.log('🧪 Testing Single Order Enhancement...');
    console.log('=' .repeat(50));
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
    
    // Create a test meal with menu item reference
    const testMeal = {
      menuItemId: '68e65166b6624cc30f2da908', // Paneer Butter Masala
      name: 'Test Lunch Special',
      price: 299,
      specialInstructions: 'Extra spicy please'
    };
    
    // Create a mock subscription plan
    const mockSubscriptionPlan = {
      customerId: '68e60bc544b875ac6aaf9526',
      restaurantId: '68e60c9d44b875ac6aaf953d',
      deliveryAddress: {
        street: '123 Test Street',
        city: 'Chennai'
      }
    };
    
    // Test the enhanced order creation
    console.log('\n🚀 Creating enhanced order...');
    const orderDate = new Date('2025-10-19');
    const mealType = 'lunch';
    const meals = [testMeal];
    
    // This should trigger our enhanced logic
    const enhancedOrder = await createScheduledOrder(
      mockSubscriptionPlan,
      orderDate,
      mealType,
      meals,
      { weekNumber: 2 }
    );
    
    if (enhancedOrder) {
      console.log('\n✅ Enhanced order created successfully!');
      console.log(`Order Number: ${enhancedOrder.orderNumber}`);
      console.log(`Items: ${enhancedOrder.items.length}`);
      
      if (enhancedOrder.items.length > 0) {
        const item = enhancedOrder.items[0];
        console.log('\n📋 Item Details:');
        console.log(`   Name: ${item.name}`);
        console.log(`   Description: ${item.description || 'Not set'}`);
        console.log(`   Category: ${item.category || 'Not set'}`);
        console.log(`   Prep Time: ${item.prepTime || 'Not set'}`);
        console.log(`   Spice Level: ${item.spiceLevel || 'Not set'}`);
        console.log(`   Dietary Tags: ${item.dietaryTags?.length > 0 ? item.dietaryTags.join(', ') : 'None'}`);
        console.log(`   Ingredients: ${item.ingredients?.length > 0 ? item.ingredients.join(', ') : 'None'}`);
        console.log(`   Allergens: ${item.allergens?.length > 0 ? item.allergens.join(', ') : 'None'}`);
      }
    } else {
      console.log('❌ Failed to create enhanced order');
    }
    
    console.log('\n🎉 Single Order Enhancement Test Complete!');
    
  } catch (error) {
    console.error('💥 Test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Handle script termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Test interrupted');
  await mongoose.connection.close();
  process.exit(0);
});

// Run the test
testSingleOrderEnhancement();
