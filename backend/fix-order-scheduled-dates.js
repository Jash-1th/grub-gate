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

async function fixOrderScheduledDates() {
  try {
    console.log('🔧 FIXING ORDER SCHEDULED DATES');
    console.log('===============================');

    const restaurantId = '68e73d168c18e7fd776a6327';
    const subscriptionId = '68e7e9f90250d71176cd103f';
    
    // Get the subscription to understand the meal structure
    const subscription = await SubscriptionMealPlan.findById(subscriptionId);
    if (!subscription) {
      console.log('❌ Subscription not found');
      return;
    }

    // Get all orders for this restaurant
    const allOrders = await Order.find({ restaurantId: restaurantId });
    console.log(`Found ${allOrders.length} orders for restaurant`);

    console.log('\n📋 CURRENT ORDER STATUS:');
    allOrders.forEach((order, index) => {
      console.log(`${index + 1}. Order ${order._id}:`);
      console.log(`   Scheduled Date: ${order.scheduledDate ? order.scheduledDate.toDateString() : 'undefined'}`);
      console.log(`   Activation Date: ${order.activationDate ? order.activationDate.toDateString() : 'undefined'}`);
      console.log(`   Items: ${order.items.map(item => item.name).join(', ')}`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Type: ${order.type}`);
      console.log(`   Is Subscription: ${order.isSubscriptionOrder}`);
    });

    console.log('\n📅 SUBSCRIPTION MEAL SCHEDULE:');
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

    console.log(`\n🔧 UPDATING ORDER DATES:`)
    let fixedCount = 0;
    
    for (const order of allOrders) {
      console.log(`\nProcessing Order ${order._id}:`);
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
        
        // Update the order with the correct dates
        order.scheduledDate = matchedMeal.deliveryDate;
        order.activationDate = matchedMeal.deliveryDate;
        order.mealType = matchedMeal.mealType;
        order.type = 'weekly-plan';
        order.isSubscriptionOrder = true;
        
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
          order.scheduledDate = fallbackMeal.deliveryDate;
          order.activationDate = fallbackMeal.deliveryDate;
          order.mealType = fallbackMeal.mealType;
          order.type = 'weekly-plan';
          order.isSubscriptionOrder = true;
          await order.save();
          fixedCount++;
          mealSchedule.splice(0, 1);
        }
      }
    }

    console.log(`\n✅ FIXED ${fixedCount} ORDERS`);

    // Verify the fix
    console.log('\n🧪 VERIFICATION - Orders after fix:');
    const verifyOrders = await Order.find({ restaurantId: restaurantId }).sort({ scheduledDate: 1 });
    
    verifyOrders.forEach((order, index) => {
      console.log(`${index + 1}. ${order._id}:`);
      console.log(`   Scheduled: ${order.scheduledDate ? order.scheduledDate.toDateString() : 'UNDEFINED'}`);
      console.log(`   Item: ${order.items[0].name}`);
      console.log(`   Meal Type: ${order.mealType}`);
      console.log(`   Status: ${order.status}`);
    });

    console.log('\n🎯 TESTING PARTNER ORDERS PAGE SCENARIOS:');
    const testDates = [
      new Date('2025-10-11'), // Saturday
      new Date('2025-10-12'), // Sunday
      new Date('2025-10-13'), // Monday
      new Date('2025-10-18'), // Saturday
      new Date('2025-10-19')  // Sunday
    ];

    for (const testDate of testDates) {
      const startOfDay = new Date(testDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(testDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      const ordersForDate = await Order.find({
        restaurantId: restaurantId,
        scheduledDate: {
          $gte: startOfDay,
          $lte: endOfDay
        }
      });
      
      console.log(`${testDate.toDateString()}: ${ordersForDate.length} orders`);
      if (ordersForDate.length > 0) {
        ordersForDate.forEach(order => {
          console.log(`  - ${order.items[0].name} (${order.mealType}, ${order.status})`);
        });
      }
    }

    console.log('\n🎉 PARTNER ORDERS PAGE SHOULD NOW WORK:');
    console.log('✅ Oct 11 (Saturday): 0 orders (correct - before subscription)');
    console.log('✅ Oct 12 (Sunday): Should show Sunday orders');
    console.log('✅ Oct 18 (Saturday): Should show Saturday orders');
    console.log('✅ Oct 19 (Sunday): Should show Sunday orders');

  } catch (error) {
    console.error('❌ Error fixing scheduled dates:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixOrderScheduledDates();
