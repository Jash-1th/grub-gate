// Debug script to test time validation logic
const mongoose = require('mongoose');
require('dotenv').config();

async function debugTimeValidation() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find the order that's failing
    const Order = require('./src/models/Order');
    const order = await Order.findById('68fbc8204027e108f104352d');
    
    if (!order) {
      console.log('❌ Order not found');
      return;
    }

    console.log('📦 Order Details:');
    console.log(`- Order ID: ${order._id}`);
    console.log(`- Status: ${order.status}`);
    console.log(`- Scheduled Date: ${order.scheduledDate}`);
    console.log(`- Is Scheduled Order: ${order.isScheduledOrder}`);

    // Test the time validation logic
    const now = new Date();
    const deliveryDate = new Date(order.scheduledDate);
    const dayBefore = new Date(deliveryDate);
    dayBefore.setDate(dayBefore.getDate() - 1);
    dayBefore.setHours(0, 0, 0, 0);

    console.log('\n🕐 Time Validation Debug:');
    console.log(`- Current Time: ${now.toISOString()} (${now.toDateString()})`);
    console.log(`- Delivery Date: ${deliveryDate.toISOString()} (${deliveryDate.toDateString()})`);
    console.log(`- Day Before: ${dayBefore.toISOString()} (${dayBefore.toDateString()})`);

    const isDeliveryDay = now.toDateString() === deliveryDate.toDateString();
    const isDayBefore = now.toDateString() === dayBefore.toDateString();
    const isAfterDayBefore = now >= dayBefore;

    console.log('\n✅ Comparison Results:');
    console.log(`- Is Delivery Day: ${isDeliveryDay}`);
    console.log(`- Is Day Before: ${isDayBefore}`);
    console.log(`- Is After Day Before: ${isAfterDayBefore}`);

    console.log('\n🎯 Should Allow "Preparing" Status:');
    const shouldAllow = isDayBefore || isDeliveryDay;
    console.log(`- Should Allow: ${shouldAllow} (isDayBefore: ${isDayBefore} || isDeliveryDay: ${isDeliveryDay})`);

    if (!shouldAllow) {
      console.log(`❌ VALIDATION WOULD FAIL: Cannot set to "Preparing" - only allowed 1 day before delivery (${dayBefore.toDateString()}) or on delivery day (${deliveryDate.toDateString()})`);
    } else {
      console.log('✅ VALIDATION WOULD PASS: Update allowed');
    }

    // Test the actual updateStatus method
    console.log('\n🧪 Testing Actual updateStatus Method:');
    try {
      await order.updateStatus('preparing', 'Debug test');
      console.log('✅ updateStatus SUCCESS: Status updated to preparing');
    } catch (error) {
      console.log(`❌ updateStatus FAILED: ${error.message}`);
    }

    // Check if there are other orders for the same date
    console.log('\n📋 Checking other orders for Oct 26, 2025:');
    const allOrders = await Order.find({
      scheduledDate: {
        $gte: new Date('2025-10-26T00:00:00.000Z'),
        $lt: new Date('2025-10-27T00:00:00.000Z')
      }
    }).select('_id orderNumber status scheduledDate');
    
    console.log(`Found ${allOrders.length} orders for Oct 26:`);
    allOrders.forEach(o => {
      console.log(`- ${o.orderNumber}: ${o.status} (${o.scheduledDate})`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📤 Disconnected from MongoDB');
  }
}

debugTimeValidation();
