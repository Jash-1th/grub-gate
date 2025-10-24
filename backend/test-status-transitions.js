// Test all status transitions: preparing → ready → delivered, cancel
const mongoose = require('mongoose');
require('dotenv').config();

async function testStatusTransitions() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const Order = require('./src/models/Order');

    // Find the chicken lunch order that's currently "preparing"
    const chickenOrder = await Order.findOne({
      orderNumber: 'GG202510265797ejc0',
      status: 'preparing'
    });

    if (!chickenOrder) {
      console.log('❌ Chicken lunch order not found or not in preparing status');
      return;
    }

    console.log(`📦 Testing with order: ${chickenOrder.orderNumber}`);
    console.log(`Current status: ${chickenOrder.status}`);

    // Test 1: preparing → ready
    console.log('\n🧪 TEST 1: preparing → ready');
    try {
      await chickenOrder.updateStatus('ready', 'Test transition to ready');
      console.log('✅ Successfully updated to "ready"');
    } catch (error) {
      console.log(`❌ Failed to update to ready: ${error.message}`);
    }

    // Reload order to get updated status
    await chickenOrder.reload();
    console.log(`Updated status: ${chickenOrder.status}`);

    // Test 2: ready → out-for-delivery
    console.log('\n🧪 TEST 2: ready → out-for-delivery');
    try {
      await chickenOrder.updateStatus('out-for-delivery', 'Test transition to out-for-delivery');
      console.log('✅ Successfully updated to "out-for-delivery"');
    } catch (error) {
      console.log(`❌ Failed to update to out-for-delivery: ${error.message}`);
    }

    // Reload order to get updated status
    await chickenOrder.reload();
    console.log(`Updated status: ${chickenOrder.status}`);

    // Test 3: out-for-delivery → delivered
    console.log('\n🧪 TEST 3: out-for-delivery → delivered');
    try {
      await chickenOrder.updateStatus('delivered', 'Test transition to delivered');
      console.log('✅ Successfully updated to "delivered"');
    } catch (error) {
      console.log(`❌ Failed to update to delivered: ${error.message}`);
    }

    // Reload order to get updated status
    await chickenOrder.reload();
    console.log(`Final status: ${chickenOrder.status}`);

    // Test 4: Test cancel from scheduled order
    console.log('\n🧪 TEST 4: Testing cancel transition');
    const scheduledOrder = await Order.findOne({
      status: 'scheduled',
      scheduledDate: {
        $gte: new Date('2025-10-26T00:00:00.000Z'),
        $lt: new Date('2025-10-27T00:00:00.000Z')
      }
    });

    if (scheduledOrder) {
      console.log(`Testing cancel with order: ${scheduledOrder.orderNumber}`);
      try {
        await scheduledOrder.updateStatus('cancelled', 'Test cancellation');
        console.log('✅ Successfully cancelled order');
        await scheduledOrder.reload();
        console.log(`Cancelled order status: ${scheduledOrder.status}`);
      } catch (error) {
        console.log(`❌ Failed to cancel: ${error.message}`);
      }
    }

    // Check meal calendar sync for all transitions
    console.log('\n📋 Checking meal calendar sync after all transitions:');
    const UserMealCalendar = require('./src/models/UserMealCalendar');
    const mealCalendar = await UserMealCalendar.findOne({
      userId: new mongoose.Types.ObjectId('68f2374eca009e5f57cf9e9e')
    });

    if (mealCalendar) {
      console.log('Calendar entries after status transitions:');
      mealCalendar.calendarEntries.forEach((entry, index) => {
        console.log(`${index + 1}. ${entry.mealName} - ${entry.mealType} - Status: ${entry.status} - OrderID: ${entry.orderId}`);
      });

      const statusCounts = {};
      mealCalendar.calendarEntries.forEach(entry => {
        const key = `${entry.mealType}-${entry.status}`;
        statusCounts[key] = (statusCounts[key] || 0) + 1;
      });

      console.log('\n📊 Final Status Summary:');
      Object.entries(statusCounts).forEach(([key, count]) => {
        console.log(`${key}: ${count}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📤 Disconnected from MongoDB');
  }
}

testStatusTransitions();
