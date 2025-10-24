// Debug script to check meal calendar sync
const mongoose = require('mongoose');
require('dotenv').config();

async function debugMealCalendarSync() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const Order = require('./src/models/Order');
    const UserMealCalendar = require('./src/models/UserMealCalendar');

    // Find the order that was updated to "preparing"
    const order = await Order.findById('68fbc8204027e108f104352d');
    
    if (!order) {
      console.log('❌ Order not found');
      return;
    }

    console.log('📦 Order Details:');
    console.log(`- Order ID: ${order._id}`);
    console.log(`- Order Number: ${order.orderNumber}`);
    console.log(`- Status: ${order.status}`);
    console.log(`- Customer ID: ${order.customerId}`);
    console.log(`- Restaurant ID: ${order.restaurantId}`);
    console.log(`- Weekly Plan ID: ${order.weeklyPlanId}`);
    console.log(`- Scheduled Date: ${order.scheduledDate}`);
    console.log(`- Meal Type: ${order.mealType}`);
    console.log(`- Is Scheduled Order: ${order.isScheduledOrder}`);

    // Check if there are corresponding meal calendar entries
    console.log('\n🍽️ Checking Meal Calendar Entries:');
    const mealCalendarQuery = {
      customerId: order.customerId,
      weeklyPlanId: order.weeklyPlanId,
      scheduledDate: order.scheduledDate,
      mealType: order.mealType
    };

    console.log('Query:', mealCalendarQuery);

    const mealCalendarEntries = await UserMealCalendar.find(mealCalendarQuery);
    
    console.log(`\n📋 Found ${mealCalendarEntries.length} meal calendar entries:`);
    mealCalendarEntries.forEach((meal, index) => {
      console.log(`${index + 1}. ${meal.mealName} - Status: ${meal.status} - Date: ${meal.scheduledDate}`);
    });

    if (mealCalendarEntries.length === 0) {
      console.log('\n❌ No meal calendar entries found! This explains why sync is not working.');
      
      // Check if there are any meal calendar entries for this customer
      const allCustomerMeals = await UserMealCalendar.find({ customerId: order.customerId });
      console.log(`\n📊 Total meal calendar entries for customer: ${allCustomerMeals.length}`);
      
      if (allCustomerMeals.length > 0) {
        console.log('\nFirst few entries:');
        allCustomerMeals.slice(0, 3).forEach((meal, index) => {
          console.log(`${index + 1}. ${meal.mealName} - Status: ${meal.status} - Date: ${meal.scheduledDate} - WeeklyPlan: ${meal.weeklyPlanId}`);
        });
      }
    } else {
      console.log('\n✅ Meal calendar entries exist - sync should work');
      
      // Test the sync manually
      console.log('\n🧪 Testing manual sync...');
      const updateResult = await UserMealCalendar.updateMany(
        mealCalendarQuery,
        { $set: { status: 'preparing' } }
      );
      
      console.log(`🔄 Manual sync result: ${updateResult.modifiedCount} meals updated`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📤 Disconnected from MongoDB');
  }
}

debugMealCalendarSync();
