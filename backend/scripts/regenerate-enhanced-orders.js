// FILE: scripts/regenerate-enhanced-orders.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const Order = require('../src/models/Order');
const SubscriptionMealPlan = require('../src/models/SubscriptionMealPlan');
const { generateAllSubscriptionOrders } = require('../src/services/enhancedOrderGenerationService');

/**
 * Regenerate orders with enhanced item details
 */
async function regenerateEnhancedOrders() {
  try {
    console.log('🔄 Regenerating Orders with Enhanced Item Details...');
    console.log('=' .repeat(60));
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
    
    const customerId = '68e60bc544b875ac6aaf9526';
    const restaurantId = '68e60c9d44b875ac6aaf953d';
    
    // Find the subscription meal plan
    const subscription = await SubscriptionMealPlan.findOne({
      customerId: customerId,
      restaurantId: restaurantId,
      status: 'active'
    });
    
    if (!subscription) {
      console.log('❌ No active subscription found for this customer-restaurant combination');
      return;
    }
    
    console.log(`📋 Found subscription: ${subscription._id}`);
    console.log(`   Plan Type: ${subscription.planType}`);
    console.log(`   Status: ${subscription.status}`);
    
    // Delete existing scheduled orders
    const deleteResult = await Order.deleteMany({
      customerId: customerId,
      restaurantId: restaurantId,
      isScheduledOrder: true
    });
    
    console.log(`🗑️ Deleted ${deleteResult.deletedCount} existing scheduled orders`);
    
    // Regenerate orders with enhanced item details
    console.log('\n🚀 Generating Enhanced Orders...');
    const newOrders = await generateAllSubscriptionOrders(subscription);
    
    console.log(`✅ Generated ${newOrders.length} new orders with enhanced item details`);
    
    // Update subscription status
    subscription.isOrdersGenerated = true;
    subscription.generatedOrders = newOrders.map(order => order._id);
    await subscription.save();
    
    // Verify the enhancement by checking a sample order
    console.log('\n🔍 Verifying Enhanced Item Details:');
    console.log('-' .repeat(40));
    
    const sampleOrder = await Order.findOne({
      customerId: customerId,
      restaurantId: restaurantId,
      isScheduledOrder: true
    }).sort({ scheduledDate: 1 });
    
    if (sampleOrder && sampleOrder.items && sampleOrder.items.length > 0) {
      const sampleItem = sampleOrder.items[0];
      console.log(`📦 Sample Order: ${sampleOrder.orderNumber}`);
      console.log(`🍽️ Sample Item: ${sampleItem.name}`);
      console.log(`   📝 Description: ${sampleItem.description || 'Not available'}`);
      console.log(`   🏷️ Category: ${sampleItem.category || 'Not available'}`);
      console.log(`   ⏱️ Prep Time: ${sampleItem.prepTime || 'Not available'} min`);
      console.log(`   🌶️ Spice Level: ${sampleItem.spiceLevel || 'Not available'}/5`);
      console.log(`   🥬 Dietary Tags: ${sampleItem.dietaryTags?.length > 0 ? sampleItem.dietaryTags.join(', ') : 'None'}`);
      console.log(`   🧄 Ingredients: ${sampleItem.ingredients?.length > 0 ? sampleItem.ingredients.slice(0, 3).join(', ') + '...' : 'None'}`);
      console.log(`   ⚠️ Allergens: ${sampleItem.allergens?.length > 0 ? sampleItem.allergens.join(', ') : 'None'}`);
      console.log(`   👨‍🍳 Chef Notes: ${sampleItem.cookingNotes || 'None'}`);
      
      // Check enhancement status
      const hasEnhancedDetails = !!(
        sampleItem.description && 
        sampleItem.category && 
        sampleItem.prepTime
      );
      
      console.log(`\n📊 Enhancement Status: ${hasEnhancedDetails ? '✅ SUCCESS' : '❌ FAILED'}`);
      
      if (hasEnhancedDetails) {
        console.log('🎉 Orders now contain detailed item information for partners!');
      } else {
        console.log('⚠️ Orders still missing detailed information. Check menu item data.');
      }
    } else {
      console.log('❌ No sample order found to verify');
    }
    
    console.log('\n📊 REGENERATION SUMMARY:');
    console.log('-' .repeat(30));
    console.log(`🗑️ Deleted Orders: ${deleteResult.deletedCount}`);
    console.log(`✅ Generated Orders: ${newOrders.length}`);
    console.log(`📋 Subscription Updated: Yes`);
    console.log(`🔧 Enhanced Details: Yes`);
    
    console.log('\n🎉 Order Regeneration Complete!');
    
  } catch (error) {
    console.error('💥 Regeneration failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Handle script termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Regeneration interrupted');
  await mongoose.connection.close();
  process.exit(0);
});

// Run the regeneration
regenerateEnhancedOrders();
