const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const { getCalendarDateForSubscriptionDay } = require('./src/utils/dateHelpers');

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

async function fixOrderDeliveryDates() {
  try {
    console.log('🔧 FIXING ORDER DELIVERY DATES');
    console.log('==============================');

    const restaurantId = '68e73d168c18e7fd776a6327';
    const subscriptionId = '68e7e9f90250d71176cd103f';
    
    // Get the subscription to understand the meal structure
    const subscription = await SubscriptionMealPlan.findById(subscriptionId);
    if (!subscription) {
      console.log('❌ Subscription not found');
      return;
    }

    // Get all orders with undefined delivery dates
    const ordersToFix = await Order.find({ 
      restaurantId: restaurantId,
      deliveryDate: { $exists: false }
    });

    console.log(`Found ${ordersToFix.length} orders with undefined delivery dates`);

    if (ordersToFix.length === 0) {
      // Check for orders with null delivery dates
      const nullDateOrders = await Order.find({ 
        restaurantId: restaurantId,
        deliveryDate: null
      });
      console.log(`Found ${nullDateOrders.length} orders with null delivery dates`);
      ordersToFix.push(...nullDateOrders);
    }

    console.log('\n📋 SUBSCRIPTION MEAL STRUCTURE:');
    const mealSchedule = [];
    
    subscription.weeks.forEach((week, weekIndex) => {
      console.log(`\nWeek ${week.weekNumber} (${week.weekStartDate.toDateString()} - ${week.weekEndDate.toDateString()}):`);
      
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      dayNames.forEach((dayName, dayIndex) => {
        const dayMeals = week.meals[dayName];
        if (dayMeals && (dayMeals.lunch.length > 0 || dayMeals.dinner.length > 0)) {
          // Calculate the actual calendar date for this subscription day
          const weekStartDate = new Date(week.weekStartDate);
          const deliveryDate = new Date(weekStartDate);
          deliveryDate.setDate(weekStartDate.getDate() + dayIndex);
          
          console.log(`  ${dayName} (${deliveryDate.toDateString()}): ${dayMeals.lunch.length} lunch + ${dayMeals.dinner.length} dinner`);
          
          // Add lunch meals to schedule
          dayMeals.lunch.forEach(meal => {
            mealSchedule.push({
              deliveryDate: deliveryDate,
              mealType: 'lunch',
              itemName: meal.name,
              itemId: meal.id,
              planId: meal.planId
            });
          });
          
          // Add dinner meals to schedule
          dayMeals.dinner.forEach(meal => {
            mealSchedule.push({
              deliveryDate: deliveryDate,
              mealType: 'dinner', 
              itemName: meal.name,
              itemId: meal.id,
              planId: meal.planId
            });
          });
        }
      });
    });

    console.log(`\n📅 GENERATED MEAL SCHEDULE (${mealSchedule.length} meals):`);
    mealSchedule.forEach((meal, index) => {
      console.log(`${index + 1}. ${meal.deliveryDate.toDateString()} - ${meal.mealType} - ${meal.itemName}`);
    });

    console.log('\n🔧 FIXING ORDERS:');
    let fixedCount = 0;
    
    for (const order of ordersToFix) {
      console.log(`\nProcessing Order ${order._id}:`);
      console.log(`  Current delivery date: ${order.deliveryDate}`);
      console.log(`  Items: ${order.items.map(item => item.name).join(', ')}`);
      
      // Try to match this order with a meal from the schedule
      let matchedMeal = null;
      
      if (order.items && order.items.length > 0) {
        const orderItemName = order.items[0].name.toLowerCase();
        matchedMeal = mealSchedule.find(meal => 
          meal.itemName.toLowerCase().includes(orderItemName) || 
          orderItemName.includes(meal.itemName.toLowerCase())
        );
      }
      
      if (matchedMeal) {
        console.log(`  ✅ Matched with: ${matchedMeal.deliveryDate.toDateString()} - ${matchedMeal.mealType} - ${matchedMeal.itemName}`);
        
        // Update the order with the correct delivery date
        order.deliveryDate = matchedMeal.deliveryDate;
        await order.save();
        fixedCount++;
        
        // Remove this meal from schedule to avoid duplicate matches
        const mealIndex = mealSchedule.indexOf(matchedMeal);
        mealSchedule.splice(mealIndex, 1);
      } else {
        console.log(`  ❌ Could not match order with subscription meals`);
        
        // Assign to first available date as fallback
        if (mealSchedule.length > 0) {
          const fallbackMeal = mealSchedule[0];
          console.log(`  🔄 Assigning to fallback date: ${fallbackMeal.deliveryDate.toDateString()}`);
          order.deliveryDate = fallbackMeal.deliveryDate;
          await order.save();
          fixedCount++;
          mealSchedule.splice(0, 1);
        }
      }
    }

    console.log(`\n✅ FIXED ${fixedCount} ORDERS`);

    // Verify the fix
    console.log('\n🧪 VERIFICATION - Orders after fix:');
    const verifyOrders = await Order.find({ restaurantId: restaurantId }).sort({ deliveryDate: 1 });
    
    verifyOrders.forEach((order, index) => {
      console.log(`${index + 1}. ${order._id}: ${order.deliveryDate ? order.deliveryDate.toDateString() : 'STILL UNDEFINED'} - ${order.items[0].name}`);
    });

    console.log('\n🎯 TESTING PARTNER ORDERS PAGE SCENARIOS:');
    const testDates = [
      new Date('2025-10-11'), // Saturday
      new Date('2025-10-12'), // Sunday
      new Date('2025-10-13')  // Monday
    ];

    for (const testDate of testDates) {
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
      
      console.log(`${testDate.toDateString()}: ${ordersForDate.length} orders`);
      if (ordersForDate.length > 0) {
        ordersForDate.forEach(order => {
          console.log(`  - ${order.items[0].name} (${order.status})`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Error fixing delivery dates:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixOrderDeliveryDates();
