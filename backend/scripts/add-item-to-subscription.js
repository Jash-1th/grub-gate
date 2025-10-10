// FILE: scripts/add-item-to-subscription.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const SubscriptionMealPlan = require('../src/models/SubscriptionMealPlan');
const MenuItem = require('../src/models/MenuItem');
const Order = require('../src/models/Order');
const { generateAllSubscriptionOrders } = require('../src/services/enhancedOrderGenerationService');

/**
 * Add a new item to subscription plan for October 19th
 */
async function addItemToSubscription() {
  try {
    console.log('🍽️ Adding New Item to Subscription Plan...');
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
    
    // Find the subscription
    const subscription = await SubscriptionMealPlan.findOne({
      customerId: customerId,
      restaurantId: restaurantId,
      status: 'active'
    });
    
    if (!subscription) {
      console.log('❌ No active subscription found');
      return;
    }
    
    console.log(`📋 Found subscription: ${subscription._id}`);
    
    // Get available menu items to choose from
    const menuItems = await MenuItem.find({ restaurantId: restaurantId });
    console.log(`\n🍽️ Available Menu Items:`);
    menuItems.forEach((item, index) => {
      console.log(`${index + 1}. ${item.name} - $${item.price?.toFixed(2)}`);
      console.log(`   📝 ${item.description}`);
      console.log(`   🏷️ Category: ${item.category}, ⏱️ Prep: ${item.prepTime}min, 🌶️ Spice: ${item.spiceLevel}/5`);
    });
    
    // Choose the Chicken Biryani Special (first item) for our test
    const selectedMenuItem = menuItems[0]; // Chicken Biryani Special
    
    console.log(`\n🎯 Selected Item: ${selectedMenuItem.name}`);
    console.log(`   💰 Price: $${selectedMenuItem.price?.toFixed(2)}`);
    console.log(`   📝 Description: ${selectedMenuItem.description}`);
    console.log(`   🏷️ Category: ${selectedMenuItem.category}`);
    console.log(`   ⏱️ Prep Time: ${selectedMenuItem.prepTime} min`);
    console.log(`   🌶️ Spice Level: ${selectedMenuItem.spiceLevel}/5`);
    console.log(`   🧄 Ingredients: ${selectedMenuItem.ingredients?.join(', ')}`);
    console.log(`   ⚠️ Allergens: ${selectedMenuItem.allergens?.join(', ')}`);
    
    // Find Week 2 (the active week with meals)
    const activeWeek = subscription.weeks.find(week => week.weekNumber === 2);
    
    if (!activeWeek) {
      console.log('❌ Active week (Week 2) not found');
      return;
    }
    
    console.log(`\n📅 Adding to Week ${activeWeek.weekNumber} (Oct 19-25, 2025)`);
    
    // Get the existing Sunday lunch item to copy required fields
    const existingLunchItem = activeWeek.meals.sunday.lunch[0];
    
    console.log(`\n📋 Existing lunch item structure:`);
    console.log(`   ID: ${existingLunchItem.id}`);
    console.log(`   Plan ID: ${existingLunchItem.planId}`);
    console.log(`   Restaurant Name: ${existingLunchItem.restaurantName}`);
    console.log(`   Delivery Time: ${existingLunchItem.deliveryTime}`);
    
    // Add the new item to Sunday lunch (Oct 19) - replacing existing lunch
    const newLunchItem = {
      id: existingLunchItem.id, // Keep existing ID
      planId: existingLunchItem.planId, // Keep existing plan ID
      restaurantName: existingLunchItem.restaurantName, // Keep existing restaurant name
      deliveryTime: existingLunchItem.deliveryTime, // Keep existing delivery time
      menuItemId: selectedMenuItem._id,
      name: `Enhanced Sunday Lunch - ${selectedMenuItem.name}`,
      price: selectedMenuItem.price,
      description: selectedMenuItem.description,
      category: selectedMenuItem.category,
      prepTime: selectedMenuItem.prepTime,
      spiceLevel: selectedMenuItem.spiceLevel,
      ingredients: selectedMenuItem.ingredients,
      allergens: selectedMenuItem.allergens,
      specialInstructions: 'Extra fresh herbs and served hot - Enhanced with detailed info'
    };
    
    // Replace the existing lunch item with our enhanced one
    activeWeek.meals.sunday.lunch = [newLunchItem];
    
    console.log(`✅ Replaced Sunday lunch with enhanced item: ${newLunchItem.name}`);
    
    // Save the updated subscription
    await subscription.save();
    console.log('💾 Subscription updated successfully');
    
    // Delete existing orders for October 19th to regenerate with new item
    const oct19Start = new Date('2025-10-19T00:00:00.000Z');
    const oct19End = new Date('2025-10-19T23:59:59.999Z');
    
    const deleteResult = await Order.deleteMany({
      customerId: customerId,
      restaurantId: restaurantId,
      scheduledDate: {
        $gte: oct19Start,
        $lte: oct19End
      },
      isScheduledOrder: true
    });
    
    console.log(`🗑️ Deleted ${deleteResult.deletedCount} existing orders for Oct 19`);
    
    // Regenerate orders for the updated subscription
    console.log('\n🚀 Regenerating Orders with New Item...');
    const newOrders = await generateAllSubscriptionOrders(subscription);
    
    console.log(`✅ Generated ${newOrders.length} total orders`);
    
    // Find and display the new October 19th orders
    const oct19Orders = await Order.find({
      customerId: customerId,
      restaurantId: restaurantId,
      scheduledDate: {
        $gte: oct19Start,
        $lte: oct19End
      },
      isScheduledOrder: true
    }).sort({ scheduledDate: 1 });
    
    console.log(`\n📦 October 19th Orders (${oct19Orders.length} orders):`);
    console.log('-' .repeat(50));
    
    oct19Orders.forEach((order, index) => {
      console.log(`\n🍽️ Order ${index + 1}: ${order.orderNumber}`);
      console.log(`   📅 Date: ${order.scheduledDate?.toDateString()}`);
      console.log(`   🍽️ Meal: ${order.mealType}`);
      console.log(`   💰 Total: $${order.total?.toFixed(2)}`);
      console.log(`   📊 Status: ${order.status}`);
      
      if (order.items && order.items.length > 0) {
        console.log(`   🍽️ Items (${order.items.length}):`);
        order.items.forEach((item, itemIndex) => {
          console.log(`      ${itemIndex + 1}. ${item.name}`);
          console.log(`         💰 $${item.price?.toFixed(2)} × ${item.quantity}`);
          console.log(`         📝 Description: ${item.description || 'Not available'}`);
          console.log(`         🏷️ Category: ${item.category || 'Not available'}`);
          console.log(`         ⏱️ Prep Time: ${item.prepTime || 'Not available'} min`);
          console.log(`         🌶️ Spice Level: ${item.spiceLevel || 'Not available'}/5`);
          console.log(`         🧄 Ingredients: ${item.ingredients?.length > 0 ? item.ingredients.join(', ') : 'Not available'}`);
          console.log(`         ⚠️ Allergens: ${item.allergens?.length > 0 ? item.allergens.join(', ') : 'Not available'}`);
          if (item.specialInstructions) {
            console.log(`         📝 Special: ${item.specialInstructions}`);
          }
        });
      }
    });
    
    // Check if enhancement worked
    const hasEnhancedDetails = oct19Orders.some(order => 
      order.items.some(item => 
        item.description && item.category && item.prepTime
      )
    );
    
    console.log(`\n📊 Enhancement Status: ${hasEnhancedDetails ? '✅ SUCCESS' : '❌ FAILED'}`);
    
    if (hasEnhancedDetails) {
      console.log('🎉 New orders contain detailed item information!');
      console.log('Partners will now see comprehensive details in the portal.');
    } else {
      console.log('⚠️ Orders still missing detailed information.');
    }
    
    console.log('\n🎉 Item Addition and Order Generation Complete!');
    
  } catch (error) {
    console.error('💥 Process failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Handle script termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Process interrupted');
  await mongoose.connection.close();
  process.exit(0);
});

// Run the process
addItemToSubscription();
