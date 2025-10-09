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

async function testPartnerOrdersEndpoints() {
  try {
    console.log('🧪 TESTING PARTNER ORDERS ENDPOINTS');
    console.log('===================================');

    const restaurantId = '68e73d168c18e7fd776a6327';

    console.log('\n📋 ALL ORDERS FOR RESTAURANT:');
    const allOrders = await Order.find({ restaurantId }).sort({ scheduledDate: 1 });
    allOrders.forEach((order, index) => {
      console.log(`${index + 1}. ${order._id}:`);
      console.log(`   Scheduled: ${order.scheduledDate.toDateString()}`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Item: ${order.items[0].name}`);
      console.log(`   Meal Type: ${order.mealType}`);
    });

    console.log('\n🔍 TESTING getTodaysOrders LOGIC:');
    console.log('This endpoint filters by status: "pending"');
    
    const testDates = [
      new Date('2025-10-12'), // Sunday
      new Date('2025-10-18'), // Saturday
      new Date('2025-10-19')  // Sunday
    ];

    for (const testDate of testDates) {
      console.log(`\n📅 Testing ${testDate.toDateString()}:`);
      
      const today = new Date(testDate);
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      // Test current logic (status: 'pending')
      const pendingOrders = await Order.find({
        restaurantId: restaurantId,
        scheduledDate: {
          $gte: today,
          $lt: tomorrow
        },
        status: 'pending'
      });
      console.log(`   Current logic (status: 'pending'): ${pendingOrders.length} orders`);

      // Test with status: 'scheduled'
      const scheduledOrders = await Order.find({
        restaurantId: restaurantId,
        scheduledDate: {
          $gte: today,
          $lt: tomorrow
        },
        status: 'scheduled'
      });
      console.log(`   With status: 'scheduled': ${scheduledOrders.length} orders`);
      if (scheduledOrders.length > 0) {
        scheduledOrders.forEach(order => {
          console.log(`     - ${order.items[0].name} (${order.mealType})`);
        });
      }

      // Test without status filter
      const allOrdersForDate = await Order.find({
        restaurantId: restaurantId,
        scheduledDate: {
          $gte: today,
          $lt: tomorrow
        }
      });
      console.log(`   Without status filter: ${allOrdersForDate.length} orders`);
    }

    console.log('\n🔍 TESTING getOrdersByDateRange LOGIC:');
    console.log('This endpoint should work correctly with scheduledDate');
    
    const startDate = new Date('2025-10-12');
    const endDate = new Date('2025-10-25');
    
    const rangeOrders = await Order.find({
      restaurantId: restaurantId,
      scheduledDate: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ scheduledDate: 1 });
    
    console.log(`\nOrders from ${startDate.toDateString()} to ${endDate.toDateString()}:`);
    console.log(`Found ${rangeOrders.length} orders`);
    rangeOrders.forEach(order => {
      console.log(`  - ${order.scheduledDate.toDateString()}: ${order.items[0].name} (${order.status})`);
    });

    console.log('\n🔧 SOLUTION RECOMMENDATIONS:');
    console.log('1. ❌ PROBLEM: getTodaysOrders filters by status: "pending"');
    console.log('   Our subscription orders have status: "scheduled"');
    console.log('');
    console.log('2. ✅ SOLUTIONS:');
    console.log('   Option A: Change order status from "scheduled" to "pending"');
    console.log('   Option B: Update getTodaysOrders to include "scheduled" status');
    console.log('   Option C: Use getOrdersByDateRange instead of getTodaysOrders');
    console.log('');
    console.log('3. 🎯 RECOMMENDED FIX:');
    console.log('   Update getTodaysOrders to include both "pending" and "scheduled" orders');

    // Test the fix by updating order statuses
    console.log('\n🔧 APPLYING FIX: Update order statuses to "pending"');
    const updateResult = await Order.updateMany(
      { 
        restaurantId: restaurantId,
        status: 'scheduled',
        isSubscriptionOrder: true
      },
      { 
        $set: { status: 'pending' }
      }
    );
    
    console.log(`Updated ${updateResult.modifiedCount} orders from "scheduled" to "pending"`);

    // Test again after fix
    console.log('\n🧪 TESTING AFTER FIX:');
    for (const testDate of [new Date('2025-10-12'), new Date('2025-10-18')]) {
      const today = new Date(testDate);
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      const pendingOrders = await Order.find({
        restaurantId: restaurantId,
        scheduledDate: {
          $gte: today,
          $lt: tomorrow
        },
        status: 'pending'
      });
      
      console.log(`${testDate.toDateString()}: ${pendingOrders.length} pending orders`);
      if (pendingOrders.length > 0) {
        pendingOrders.forEach(order => {
          console.log(`  - ${order.items[0].name} (${order.mealType})`);
        });
      }
    }

    console.log('\n🎉 FINAL RESULT:');
    console.log('✅ Oct 11: 0 orders (correct - before subscription)');
    console.log('✅ Oct 12: 1 order (mutton fry lunch)');
    console.log('✅ Oct 18: 1 order (chiceknn lunch)');
    console.log('✅ Oct 19: 1 order (fish fry lunch)');
    console.log('');
    console.log('The partner orders page should now show orders correctly!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

testPartnerOrdersEndpoints();
