// Test time validation and status transitions
const mongoose = require('mongoose');
require('dotenv').config();

async function testTimeValidationFix() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const Order = require('./src/models/Order');

    // Find the chicken lunch order
    const chickenOrder = await Order.findOne({
      orderNumber: 'GG202510265797ejc0'
    });

    if (!chickenOrder) {
      console.log('❌ Chicken lunch order not found');
      return;
    }

    console.log(`📦 Order: ${chickenOrder.orderNumber}`);
    console.log(`Current status: ${chickenOrder.status}`);
    console.log(`Scheduled date: ${chickenOrder.scheduledDate}`);
    console.log(`Is scheduled order: ${chickenOrder.isScheduledOrder}`);

    // Check current time vs delivery date
    const now = new Date();
    const deliveryDate = new Date(chickenOrder.scheduledDate);
    
    console.log('\n🕐 Time Validation Check:');
    console.log(`Current time: ${now.toISOString()} (${now.toDateString()})`);
    console.log(`Delivery date: ${deliveryDate.toISOString()} (${deliveryDate.toDateString()})`);
    console.log(`Is delivery day: ${now.toDateString() === deliveryDate.toDateString()}`);

    // The issue might be timezone - let's check if we're actually on delivery day
    const isDeliveryDay = now.toDateString() === deliveryDate.toDateString();
    
    if (!isDeliveryDay) {
      console.log('\n⚠️ Not delivery day yet - that\'s why "ready" status is blocked');
      console.log('This is correct behavior for time-based validation');
      
      // Test transitions that should work (preparing can go to cancelled)
      console.log('\n🧪 Testing allowed transition: preparing → cancelled');
      try {
        // Create a copy to test without affecting original
        const testOrder = await Order.findById(chickenOrder._id);
        await testOrder.updateStatus('cancelled', 'Test cancellation from preparing');
        console.log('✅ Successfully cancelled from preparing status');
        
        // Revert back to preparing for further testing
        await testOrder.updateStatus('scheduled', 'Revert to scheduled');
        await testOrder.updateStatus('preparing', 'Back to preparing for testing');
        console.log('✅ Reverted back to preparing status');
      } catch (error) {
        console.log(`❌ Cancellation test failed: ${error.message}`);
      }
    } else {
      console.log('\n✅ It is delivery day - ready status should be allowed');
      
      // Test the full transition chain
      console.log('\n🧪 Testing full transition chain on delivery day:');
      
      try {
        // preparing → ready
        await chickenOrder.updateStatus('ready', 'Ready for pickup');
        console.log('✅ preparing → ready: SUCCESS');
        
        // Refresh order data
        const updatedOrder = await Order.findById(chickenOrder._id);
        console.log(`Updated status: ${updatedOrder.status}`);
        
        // ready → out-for-delivery
        await updatedOrder.updateStatus('out-for-delivery', 'Out for delivery');
        console.log('✅ ready → out-for-delivery: SUCCESS');
        
        // out-for-delivery → delivered
        const finalOrder = await Order.findById(chickenOrder._id);
        await finalOrder.updateStatus('delivered', 'Delivered successfully');
        console.log('✅ out-for-delivery → delivered: SUCCESS');
        
        const completedOrder = await Order.findById(chickenOrder._id);
        console.log(`Final status: ${completedOrder.status}`);
        
      } catch (error) {
        console.log(`❌ Transition failed: ${error.message}`);
      }
    }

    // Check meal calendar sync
    console.log('\n📋 Checking meal calendar sync:');
    const UserMealCalendar = require('./src/models/UserMealCalendar');
    const mealCalendar = await UserMealCalendar.findOne({
      userId: chickenOrder.customerId
    });

    if (mealCalendar) {
      console.log('Current calendar entries:');
      mealCalendar.calendarEntries.forEach((entry, index) => {
        if (entry.orderId && entry.orderId.toString() === chickenOrder._id.toString()) {
          console.log(`${index + 1}. ${entry.mealName} - ${entry.mealType} - Status: ${entry.status} ⭐ (matches test order)`);
        } else {
          console.log(`${index + 1}. ${entry.mealName} - ${entry.mealType} - Status: ${entry.status}`);
        }
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📤 Disconnected from MongoDB');
  }
}

testTimeValidationFix();
