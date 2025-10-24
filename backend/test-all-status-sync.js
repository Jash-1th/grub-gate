// Test all status transitions with order-specific sync
const mongoose = require('mongoose');
require('dotenv').config();

async function testAllStatusSync() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const Order = require('./src/models/Order');
    const UserMealCalendar = require('./src/models/UserMealCalendar');

    // Find all orders for Oct 26
    const orders = await Order.find({
      scheduledDate: {
        $gte: new Date('2025-10-26T00:00:00.000Z'),
        $lt: new Date('2025-10-27T00:00:00.000Z')
      }
    }).sort({ orderNumber: 1 });

    console.log(`\n📦 Found ${orders.length} orders for Oct 26:`);
    orders.forEach((order, index) => {
      console.log(`${index + 1}. ${order.orderNumber} - ${order.mealType} - Status: ${order.status} - Items: ${order.items.length}`);
    });

    // Get current meal calendar state
    const mealCalendar = await UserMealCalendar.findOne({
      userId: new mongoose.Types.ObjectId('68f2374eca009e5f57cf9e9e')
    });

    if (mealCalendar) {
      console.log('\n📋 Current Calendar Entries:');
      mealCalendar.calendarEntries.forEach((entry, index) => {
        const entryDate = new Date(entry.date);
        console.log(`${index + 1}. ${entry.mealName} - ${entry.mealType} - ${entryDate.toDateString()} - Status: ${entry.status} - OrderID: ${entry.orderId}`);
      });

      // Test 1: Reset mutton lunch to scheduled (fix the cross-contamination)
      console.log('\n🧪 TEST 1: Fixing mutton lunch status (should be scheduled, not preparing)');
      let fixedCount = 0;
      mealCalendar.calendarEntries.forEach(entry => {
        // Find mutton lunch entries that were incorrectly set to preparing
        if (entry.mealName === 'mutton' && entry.mealType === 'lunch' && entry.status === 'preparing') {
          // Check if this mutton order is actually still scheduled
          const muttonOrder = orders.find(o => o._id.toString() === entry.orderId.toString());
          if (muttonOrder && muttonOrder.status === 'scheduled') {
            console.log(`🔧 Fixing ${entry.mealName} ${entry.mealType} - resetting to scheduled`);
            entry.status = 'scheduled';
            fixedCount++;
          }
        }
      });

      if (fixedCount > 0) {
        await mealCalendar.save();
        console.log(`✅ Fixed ${fixedCount} incorrectly synced meals`);
      }

      // Test 2: Verify order-specific sync works
      console.log('\n🧪 TEST 2: Testing order-specific sync logic');
      const chickenLunchOrder = orders.find(o => o.mealType === 'lunch' && o.items.some(item => item.name === 'chicken'));
      
      if (chickenLunchOrder) {
        console.log(`\n🎯 Testing with chicken lunch order: ${chickenLunchOrder.orderNumber}`);
        
        // Simulate the sync logic
        let testUpdatedCount = 0;
        const orderDate = new Date(chickenLunchOrder.scheduledDate);
        
        mealCalendar.calendarEntries.forEach(entry => {
          const entryDate = new Date(entry.date);
          
          console.log(`Checking: ${entry.mealName} ${entry.mealType} - Date: ${entryDate.toDateString()} - OrderID: ${entry.orderId}`);
          console.log(`  Match Date: ${entryDate.toDateString() === orderDate.toDateString()}`);
          console.log(`  Match MealType: ${entry.mealType === chickenLunchOrder.mealType}`);
          console.log(`  Match OrderID: ${entry.orderId && entry.orderId.toString() === chickenLunchOrder._id.toString()}`);
          
          if (entryDate.toDateString() === orderDate.toDateString() && 
              entry.mealType === chickenLunchOrder.mealType &&
              entry.orderId && entry.orderId.toString() === chickenLunchOrder._id.toString()) {
            console.log(`  ✅ WOULD UPDATE: ${entry.mealName} to "ready"`);
            testUpdatedCount++;
          } else {
            console.log(`  ❌ WOULD NOT UPDATE: ${entry.mealName}`);
          }
        });
        
        console.log(`\n📊 Order-specific sync test result: ${testUpdatedCount} meals would be updated (should be 2 for chicken lunch)`);
      }

      // Show final state
      console.log('\n📋 Final Calendar State:');
      const updatedCalendar = await UserMealCalendar.findOne({
        userId: new mongoose.Types.ObjectId('68f2374eca009e5f57cf9e9e')
      });
      
      const statusCounts = {};
      updatedCalendar.calendarEntries.forEach((entry, index) => {
        const entryDate = new Date(entry.date);
        console.log(`${index + 1}. ${entry.mealName} - ${entry.mealType} - Status: ${entry.status}`);
        
        const key = `${entry.mealType}-${entry.status}`;
        statusCounts[key] = (statusCounts[key] || 0) + 1;
      });
      
      console.log('\n📊 Status Summary:');
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

testAllStatusSync();
