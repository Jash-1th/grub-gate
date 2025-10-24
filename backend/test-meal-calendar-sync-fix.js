// Test the fixed meal calendar sync
const mongoose = require('mongoose');
require('dotenv').config();

async function testMealCalendarSyncFix() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const Order = require('./src/models/Order');
    const UserMealCalendar = require('./src/models/UserMealCalendar');

    // Find the order
    const order = await Order.findById('68fbc8204027e108f104352d');
    console.log(`📦 Order: ${order.orderNumber} - Status: ${order.status}`);
    console.log(`📅 Scheduled: ${order.scheduledDate} - Meal Type: ${order.mealType}`);

    // Find the meal calendar using the correct structure
    const mealCalendar = await UserMealCalendar.findOne({
      userId: order.customerId,
      subscriptionId: order.weeklyPlanId
    });

    if (mealCalendar) {
      console.log(`✅ Found meal calendar with ${mealCalendar.calendarEntries.length} entries`);
      
      // Show current status of meals
      console.log('\n📋 Current meal calendar entries:');
      mealCalendar.calendarEntries.forEach((entry, index) => {
        const entryDate = new Date(entry.date); // Fixed: use 'date' field
        console.log(`${index + 1}. ${entry.mealName} - ${entry.mealType} - ${entryDate.toDateString()} - Status: ${entry.status}`);
      });

      // Test the sync logic
      console.log('\n🧪 Testing sync logic...');
      let updatedCount = 0;
      const orderDate = new Date(order.scheduledDate);
      
      mealCalendar.calendarEntries.forEach(entry => {
        const entryDate = new Date(entry.date); // Fixed: use 'date' field
        
        console.log(`Comparing: ${entryDate.toDateString()} === ${orderDate.toDateString()} && ${entry.mealType} === ${order.mealType}`);
        
        if (entryDate.toDateString() === orderDate.toDateString() && 
            entry.mealType === order.mealType) {
          console.log(`✅ MATCH FOUND: ${entry.mealName} - updating status to "preparing"`);
          entry.status = 'preparing';
          updatedCount++;
        }
      });
      
      if (updatedCount > 0) {
        await mealCalendar.save();
        console.log(`🔄 Updated ${updatedCount} meals to "preparing" status`);
        
        // Verify the update
        const updatedCalendar = await UserMealCalendar.findOne({
          userId: order.customerId,
          subscriptionId: order.weeklyPlanId
        });
        
        console.log('\n✅ Verification - Updated meal statuses:');
        updatedCalendar.calendarEntries.forEach((entry, index) => {
          const entryDate = new Date(entry.date); // Fixed: use 'date' field
          console.log(`${index + 1}. ${entry.mealName} - ${entry.mealType} - ${entryDate.toDateString()} - Status: ${entry.status}`);
        });
      } else {
        console.log('❌ No matching meals found for sync');
      }
    } else {
      console.log('❌ No meal calendar found');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📤 Disconnected from MongoDB');
  }
}

testMealCalendarSyncFix();
