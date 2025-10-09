const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Connect to MongoDB using environment variables
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/grub-gate';
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const Order = require('./src/models/Order');
const SubscriptionMealPlan = require('./src/models/SubscriptionMealPlan');

async function debugOrdersSimple() {
  try {
    console.log('🔍 DEBUGGING ORDERS FOR RESTAURANT');
    console.log('==================================');

    const restaurantId = '68e73d168c18e7fd776a6327';
    
    // Check all orders for this restaurant
    const allOrders = await Order.find({ restaurantId: restaurantId }).sort({ deliveryDate: 1 });
    console.log(`Found ${allOrders.length} total orders for restaurant ${restaurantId}`);
    
    if (allOrders.length > 0) {
      console.log('\n📋 ALL ORDERS:');
      allOrders.forEach((order, index) => {
        console.log(`\n${index + 1}. Order ID: ${order._id}`);
        console.log(`   Delivery Date: ${order.deliveryDate ? order.deliveryDate.toDateString() : 'undefined'} (Day ${order.deliveryDate ? order.deliveryDate.getDay() : 'undefined'})`);
        console.log(`   Status: ${order.status}`);
        console.log(`   Customer: ${order.customerId}`);
        console.log(`   Restaurant: ${order.restaurantId}`);
        console.log(`   Items Count: ${order.items ? order.items.length : 0}`);
        
        if (order.items && order.items.length > 0) {
          order.items.forEach((item, itemIndex) => {
            console.log(`     Item ${itemIndex + 1}: ${item.name || 'No name'} - $${item.price || 0}`);
          });
        }
      });
    }

    console.log('\n🗓️ FILTERING ORDERS BY SPECIFIC DATES:');
    
    const testDates = [
      new Date('2025-10-11'), // Saturday
      new Date('2025-10-12'), // Sunday
      new Date('2025-10-13')  // Monday
    ];

    for (const testDate of testDates) {
      console.log(`\n📅 Orders for ${testDate.toDateString()} (Day ${testDate.getDay()}):`);
      
      // Create date range for the entire day
      const startOfDay = new Date(testDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(testDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      const ordersForDate = await Order.find({
        restaurantId: restaurantId,
        deliveryDate: {
          $gte: startOfDay,
          $lte: endOfDay
        }
      });
      
      console.log(`   Found ${ordersForDate.length} orders`);
      
      if (ordersForDate.length > 0) {
        ordersForDate.forEach((order, index) => {
          console.log(`   ${index + 1}. ${order._id} - ${order.deliveryDate.toDateString()} - ${order.status} - ${order.items ? order.items.length : 0} items`);
        });
      }
    }

    console.log('\n🔍 CHECKING SUBSCRIPTION MEAL STRUCTURE:');
    const subscription = await SubscriptionMealPlan.findById('68e7e9f90250d71176cd103f');
    
    if (subscription) {
      console.log('Subscription found with weeks:');
      subscription.weeks.forEach((week, weekIndex) => {
        console.log(`\nWeek ${week.weekNumber}:`);
        console.log(`  Start: ${week.weekStartDate.toDateString()}`);
        console.log(`  End: ${week.weekEndDate.toDateString()}`);
        
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        dayNames.forEach(dayName => {
          const dayMeals = week.meals[dayName];
          if (dayMeals) {
            const lunchCount = dayMeals.lunch ? dayMeals.lunch.length : 0;
            const dinnerCount = dayMeals.dinner ? dayMeals.dinner.length : 0;
            if (lunchCount > 0 || dinnerCount > 0) {
              console.log(`    ${dayName}: ${lunchCount} lunch + ${dinnerCount} dinner items`);
            }
          }
        });
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

debugOrdersSimple();
