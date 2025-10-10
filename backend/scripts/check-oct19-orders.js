// FILE: scripts/check-oct19-orders.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const Order = require('../src/models/Order');
const SubscriptionMealPlan = require('../src/models/SubscriptionMealPlan');

/**
 * Check October 19th orders in detail
 */
async function checkOct19Orders() {
  try {
    console.log('🔍 Checking October 19th Orders in Detail...');
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
    
    // Check what day October 19, 2025 actually is
    const oct19 = new Date('2025-10-19');
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = dayNames[oct19.getDay()];
    
    console.log(`📅 October 19, 2025 is a ${dayName} (day index: ${oct19.getDay()})`);
    
    // Check the subscription plan to see what's in Sunday lunch
    const subscription = await SubscriptionMealPlan.findOne({
      customerId: customerId,
      restaurantId: restaurantId,
      status: 'active'
    });
    
    if (subscription) {
      const activeWeek = subscription.weeks.find(week => week.weekNumber === 2);
      if (activeWeek && activeWeek.meals.sunday.lunch) {
        console.log(`\n📋 Sunday Lunch in Subscription Plan:`);
        activeWeek.meals.sunday.lunch.forEach((item, index) => {
          console.log(`   ${index + 1}. ${item.name}`);
          console.log(`      💰 Price: $${item.price}`);
          console.log(`      🆔 Menu Item ID: ${item.menuItemId}`);
          console.log(`      📝 Description: ${item.description || 'Not set'}`);
          console.log(`      🏷️ Category: ${item.category || 'Not set'}`);
          console.log(`      ⏱️ Prep Time: ${item.prepTime || 'Not set'}`);
          console.log(`      📝 Special Instructions: ${item.specialInstructions || 'None'}`);
        });
      }
    }
    
    // Get October 19th orders
    const oct19Start = new Date('2025-10-19T00:00:00.000Z');
    const oct19End = new Date('2025-10-19T23:59:59.999Z');
    
    const orders = await Order.find({
      customerId: customerId,
      restaurantId: restaurantId,
      scheduledDate: {
        $gte: oct19Start,
        $lte: oct19End
      },
      isScheduledOrder: true
    }).sort({ scheduledDate: 1 });
    
    console.log(`\n📦 October 19th Orders (${orders.length} found):`);
    console.log('-' .repeat(50));
    
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
        });
      }
    });
    
    console.log('\n🎉 October 19th Order Check Complete!');
    
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
checkOct19Orders();
