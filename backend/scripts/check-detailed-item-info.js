// FILE: scripts/check-detailed-item-info.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const Order = require('../src/models/Order');
const User = require('../src/models/User');
const Restaurant = require('../src/models/Restaurant');
const MenuItem = require('../src/models/MenuItem');

/**
 * Check detailed item information for customer orders
 */
async function checkDetailedItemInfo() {
  try {
    console.log('🔍 Checking Detailed Item Information...');
    console.log('=' .repeat(70));
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
    
    const customerId = '68e60bc544b875ac6aaf9526';
    const restaurantId = '68e60c9d44b875ac6aaf953d';
    
    // Get customer and restaurant info
    const customer = await User.findById(customerId);
    const restaurant = await Restaurant.findById(restaurantId);
    
    console.log(`👤 Customer: ${customer?.firstName} ${customer?.lastName}`);
    console.log(`🏪 Restaurant: ${restaurant?.name}`);
    
    // Get recent orders with detailed item information
    console.log('\n🍽️ DETAILED ORDER ITEMS:');
    console.log('-' .repeat(50));
    
    const orders = await Order.find({
      customerId: customerId,
      restaurantId: restaurantId
    })
    .sort({ scheduledDate: -1 })
    .limit(5); // Show latest 5 orders for detailed analysis
    
    if (orders.length === 0) {
      console.log('📭 No orders found');
      return;
    }
    
    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      const scheduledDate = order.scheduledDate ? new Date(order.scheduledDate) : null;
      const dayName = scheduledDate ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][scheduledDate.getDay()] : 'N/A';
      
      console.log(`\n📦 ORDER ${i + 1}: ${order.orderNumber}`);
      console.log(`📅 Date: ${scheduledDate ? scheduledDate.toDateString() : 'Not scheduled'} (${dayName})`);
      console.log(`🍽️ Meal: ${order.mealType || 'Not specified'}`);
      console.log(`💰 Total: $${order.total?.toFixed(2) || '0.00'}`);
      console.log(`📊 Status: ${order.status}`);
      
      if (order.items && order.items.length > 0) {
        console.log(`\n🍽️ ITEMS (${order.items.length}):`);
        
        for (let j = 0; j < order.items.length; j++) {
          const item = order.items[j];
          console.log(`\n   🍽️ ITEM ${j + 1}: ${item.name || 'Unnamed Item'}`);
          console.log(`   ═══════════════════════════════════════`);
          
          // Basic Information
          console.log(`   📝 Description: ${item.description || 'No description'}`);
          console.log(`   💰 Price: $${item.price?.toFixed(2) || '0.00'} × ${item.quantity || 1} = $${((item.price || 0) * (item.quantity || 1)).toFixed(2)}`);
          
          // Enhanced Details
          if (item.category) {
            console.log(`   🏷️ Category: ${item.category}`);
          }
          
          if (item.prepTime) {
            console.log(`   ⏱️ Preparation Time: ${item.prepTime} minutes`);
          }
          
          if (item.spiceLevel) {
            const spiceIcons = '🌶️'.repeat(item.spiceLevel);
            const spiceText = ['Mild', 'Medium', 'Hot', 'Very Hot', 'Extremely Hot'][item.spiceLevel - 1] || 'Hot';
            console.log(`   🌶️ Spice Level: ${spiceIcons} (${item.spiceLevel}/5 - ${spiceText})`);
          }
          
          if (item.dietaryTags && item.dietaryTags.length > 0) {
            console.log(`   🥬 Dietary Tags: ${item.dietaryTags.join(', ')}`);
          }
          
          if (item.ingredients && item.ingredients.length > 0) {
            console.log(`   🧄 Ingredients: ${item.ingredients.join(', ')}`);
          }
          
          if (item.allergens && item.allergens.length > 0) {
            console.log(`   ⚠️ Allergens: ${item.allergens.join(', ')}`);
          }
          
          if (item.nutritionalInfo) {
            console.log(`   📊 Nutrition:`);
            if (item.nutritionalInfo.calories) console.log(`      🔥 Calories: ${item.nutritionalInfo.calories}`);
            if (item.nutritionalInfo.protein) console.log(`      🥩 Protein: ${item.nutritionalInfo.protein}g`);
            if (item.nutritionalInfo.carbs) console.log(`      🍞 Carbs: ${item.nutritionalInfo.carbs}g`);
            if (item.nutritionalInfo.fat) console.log(`      🧈 Fat: ${item.nutritionalInfo.fat}g`);
          }
          
          if (item.specialInstructions) {
            console.log(`   📝 Special Instructions: ${item.specialInstructions}`);
          }
          
          if (item.cookingNotes) {
            console.log(`   👨‍🍳 Chef Notes: ${item.cookingNotes}`);
          }
          
          // Additional properties
          if (item.isVegetarian) console.log(`   🥬 Vegetarian: Yes`);
          if (item.isVegan) console.log(`   🌱 Vegan: Yes`);
          if (item.isGlutenFree) console.log(`   🌾 Gluten-Free: Yes`);
          if (item.isDairyFree) console.log(`   🥛 Dairy-Free: Yes`);
          
          if (item.servingSize) {
            console.log(`   🍽️ Serving Size: ${item.servingSize}`);
          }
          
          if (item.temperature) {
            console.log(`   🌡️ Serving Temperature: ${item.temperature}`);
          }
          
          // Menu item ID for reference
          if (item.menuItemId) {
            console.log(`   🆔 Menu Item ID: ${item.menuItemId}`);
          }
          
          if (item.planId) {
            console.log(`   📋 Plan ID: ${item.planId}`);
          }
        }
      } else {
        console.log(`   📭 No items in this order`);
      }
    }
    
    // Check if we have menu items in the database for comparison
    console.log('\n🍽️ MENU ITEMS FROM DATABASE (for comparison):');
    console.log('-' .repeat(50));
    
    const menuItems = await MenuItem.find({ restaurantId: restaurantId }).limit(5);
    
    if (menuItems.length > 0) {
      menuItems.forEach((menuItem, index) => {
        console.log(`\n📋 MENU ITEM ${index + 1}: ${menuItem.name}`);
        console.log(`   📝 Description: ${menuItem.description || 'No description'}`);
        console.log(`   💰 Price: $${menuItem.price?.toFixed(2) || '0.00'}`);
        console.log(`   🏷️ Category: ${menuItem.category || 'Not specified'}`);
        console.log(`   ⏱️ Prep Time: ${menuItem.prepTime || 'Not specified'} min`);
        
        if (menuItem.spiceLevel) {
          console.log(`   🌶️ Spice Level: ${menuItem.spiceLevel}/5`);
        }
        
        if (menuItem.dietaryTags && menuItem.dietaryTags.length > 0) {
          console.log(`   🥬 Dietary: ${menuItem.dietaryTags.join(', ')}`);
        }
        
        if (menuItem.ingredients && menuItem.ingredients.length > 0) {
          console.log(`   🧄 Ingredients: ${menuItem.ingredients.join(', ')}`);
        }
        
        if (menuItem.allergens && menuItem.allergens.length > 0) {
          console.log(`   ⚠️ Allergens: ${menuItem.allergens.join(', ')}`);
        }
      });
    } else {
      console.log('📭 No menu items found in database for this restaurant');
    }
    
    // Summary of what data is available
    console.log('\n📊 DATA AVAILABILITY SUMMARY:');
    console.log('-' .repeat(40));
    
    const sampleOrder = orders[0];
    const sampleItem = sampleOrder?.items?.[0];
    
    if (sampleItem) {
      console.log('✅ Available in Order Items:');
      console.log(`   📝 Name: ${sampleItem.name ? '✅' : '❌'}`);
      console.log(`   📝 Description: ${sampleItem.description ? '✅' : '❌'}`);
      console.log(`   💰 Price: ${sampleItem.price ? '✅' : '❌'}`);
      console.log(`   🔢 Quantity: ${sampleItem.quantity ? '✅' : '❌'}`);
      console.log(`   🏷️ Category: ${sampleItem.category ? '✅' : '❌'}`);
      console.log(`   ⏱️ Prep Time: ${sampleItem.prepTime ? '✅' : '❌'}`);
      console.log(`   🌶️ Spice Level: ${sampleItem.spiceLevel ? '✅' : '❌'}`);
      console.log(`   🥬 Dietary Tags: ${sampleItem.dietaryTags?.length > 0 ? '✅' : '❌'}`);
      console.log(`   🧄 Ingredients: ${sampleItem.ingredients?.length > 0 ? '✅' : '❌'}`);
      console.log(`   ⚠️ Allergens: ${sampleItem.allergens?.length > 0 ? '✅' : '❌'}`);
      console.log(`   📝 Special Instructions: ${sampleItem.specialInstructions ? '✅' : '❌'}`);
      console.log(`   👨‍🍳 Chef Notes: ${sampleItem.cookingNotes ? '✅' : '❌'}`);
      console.log(`   📊 Nutritional Info: ${sampleItem.nutritionalInfo ? '✅' : '❌'}`);
    }
    
    console.log('\n🎉 Detailed Item Information Check Complete!');
    
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
checkDetailedItemInfo();
