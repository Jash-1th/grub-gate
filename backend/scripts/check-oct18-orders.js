// FILE: scripts/check-oct18-orders.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const Order = require('../src/models/Order');

/**
 * Check October 18th orders (which should use Sunday meals)
 */
async function checkOct18Orders() {
  try {
    console.log('🔍 Checking October 18th Orders (Sunday Meals)...');
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
    
    // Get October 18th orders (which should use Sunday meals)
    const oct18Start = new Date('2025-10-18T00:00:00.000Z');
    const oct18End = new Date('2025-10-18T23:59:59.999Z');
    
    const orders = await Order.find({
      customerId: customerId,
      restaurantId: restaurantId,
      scheduledDate: {
        $gte: oct18Start,
        $lte: oct18End
      },
      isScheduledOrder: true
    }).sort({ scheduledDate: 1 });
    
    console.log(`\n📦 October 18th Orders (${orders.length} found):`);
    console.log('-' .repeat(50));
    
    if (orders.length === 0) {
      console.log('📭 No orders found for October 18th');
      console.log('This means the week calculation is off by one day.');
      return;
    }
    
    orders.forEach((order, index) => {
      console.log(`\n🍽️ Order ${index + 1}: ${order.orderNumber}`);
      console.log(`   📅 Scheduled Date: ${order.scheduledDate?.toISOString()}`);
      console.log(`   🍽️ Meal Type: ${order.mealType}`);
      console.log(`   💰 Total: $${order.total?.toFixed(2)}`);
      console.log(`   📊 Status: ${order.status}`);
      
      if (order.items && order.items.length > 0) {
        console.log(`   🍽️ Items (${order.items.length}):`);
        order.items.forEach((item, itemIndex) => {
          console.log(`      ${itemIndex + 1}. ${item.name}`);
          console.log(`         🆔 Menu Item ID: ${item.menuItemId}`);
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
          
          // Check if this is our enhanced item
          const isEnhanced = item.name.includes('Enhanced Sunday Lunch') || 
                           item.menuItemId === '68e65166b6624cc30f2da907' ||
                           (item.description && item.description.includes('Aromatic basmati rice'));
          
          if (isEnhanced) {
            console.log(`         ✅ THIS IS OUR ENHANCED ITEM!`);
          }
        });
      }
    });
    
    // Check if enhancement worked
    const hasEnhancedDetails = orders.some(order => 
      order.items.some(item => 
        item.description && item.category && item.prepTime && 
        (item.description.includes('Aromatic basmati rice') || item.menuItemId === '68e65166b6624cc30f2da907')
      )
    );
    
    console.log(`\n📊 Enhancement Status: ${hasEnhancedDetails ? '✅ SUCCESS' : '❌ FAILED'}`);
    
    if (hasEnhancedDetails) {
      console.log('🎉 Enhanced item details are working!');
      console.log('The issue was just the day mapping - our enhancement is successful!');
    }
    
    console.log('\n🎉 October 18th Order Check Complete!');
    
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
checkOct18Orders();
