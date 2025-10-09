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

async function checkAllOrdersStatus() {
  try {
    console.log('🔍 CHECKING ALL ORDERS STATUS');
    console.log('=============================');

    const restaurantId = '68e73d168c18e7fd776a6327';

    // Get all orders for this restaurant
    const allOrders = await Order.find({ restaurantId }).sort({ createdAt: -1 });
    
    console.log(`Found ${allOrders.length} total orders for restaurant ${restaurantId}`);
    
    allOrders.forEach((order, index) => {
      console.log(`\n${index + 1}. Order ${order._id}:`);
      console.log(`   Created: ${order.createdAt.toISOString()}`);
      console.log(`   Scheduled Date: ${order.scheduledDate ? order.scheduledDate.toISOString() : 'undefined'} (${order.scheduledDate ? order.scheduledDate.toDateString() : 'undefined'})`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Item: ${order.items[0]?.name}`);
      console.log(`   Order Number: ${order.orderNumber}`);
    });

    console.log('\n📊 STATUS BREAKDOWN:');
    const statusCounts = {};
    allOrders.forEach(order => {
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
    });
    
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count} orders`);
    });

    console.log('\n🎯 ISSUE IDENTIFIED:');
    console.log('There are orders with status "scheduled" that should be "pending" for partner visibility');
    
    console.log('\n🔧 FIXING ORDER STATUSES:');
    const updateResult = await Order.updateMany(
      { 
        restaurantId: restaurantId,
        status: 'scheduled'
      },
      { 
        $set: { status: 'pending' }
      }
    );
    
    console.log(`Updated ${updateResult.modifiedCount} orders from "scheduled" to "pending"`);

    console.log('\n✅ VERIFICATION AFTER FIX:');
    const updatedOrders = await Order.find({ restaurantId }).sort({ scheduledDate: 1 });
    
    const testDates = [
      '2025-10-11',
      '2025-10-12', 
      '2025-10-18',
      '2025-10-19'
    ];

    for (const testDate of testDates) {
      const startOfDay = new Date(testDate + 'T00:00:00.000Z');
      const endOfDay = new Date(testDate + 'T23:59:59.999Z');
      
      const ordersForDate = await Order.find({
        restaurantId,
        scheduledDate: {
          $gte: startOfDay,
          $lte: endOfDay
        },
        status: 'pending'
      });
      
      console.log(`${testDate}: ${ordersForDate.length} pending orders`);
      if (ordersForDate.length > 0) {
        ordersForDate.forEach(order => {
          console.log(`  - ${order.items[0]?.name} (${order.mealType})`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkAllOrdersStatus();
