const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const { findSubscriptionDayForDate } = require('./src/utils/dateHelpers');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Connect to MongoDB using environment variables
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/grub-gate';
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const SubscriptionMealPlan = require('./src/models/SubscriptionMealPlan');
const Order = require('./src/models/Order');

async function debugPartnerOrdersUI() {
  try {
    console.log('🐛 DEBUGGING PARTNER ORDERS UI ISSUE');
    console.log('====================================');

    // Find the subscription
    const subscription = await SubscriptionMealPlan.findById('68e7e9f90250d71176cd103f');
    
    if (!subscription) {
      console.log('❌ Subscription not found');
      return;
    }

    console.log('\n📋 SUBSCRIPTION VERIFICATION:');
    console.log('ID:', subscription._id);
    console.log('Restaurant ID:', subscription.restaurantId);
    console.log('Plan Start:', subscription.planStartDate.toDateString(), '(Day', subscription.planStartDate.getDay(), ')');
    console.log('Plan End:', subscription.planEndDate.toDateString(), '(Day', subscription.planEndDate.getDay(), ')');
    
    subscription.weeks.forEach((week, index) => {
      console.log(`Week ${week.weekNumber}: ${week.weekStartDate.toDateString()} (Day ${week.weekStartDate.getDay()}) to ${week.weekEndDate.toDateString()} (Day ${week.weekEndDate.getDay()})`);
    });

    console.log('\n🔍 TESTING DATE MAPPING:');
    const testDates = [
      { date: new Date('2025-10-11'), label: 'Oct 11 (Saturday)' },
      { date: new Date('2025-10-12'), label: 'Oct 12 (Sunday)' },
      { date: new Date('2025-10-13'), label: 'Oct 13 (Monday)' }
    ];

    testDates.forEach(({ date, label }) => {
      const subscriptionDay = findSubscriptionDayForDate(date, subscription.weeks);
      console.log(`${label}: findSubscriptionDayForDate -> "${subscriptionDay}"`);
    });

    console.log('\n🗄️ CHECKING ACTUAL ORDERS IN DATABASE:');
    
    // Check if there are any orders for this restaurant
    const allOrders = await Order.find({ restaurantId: subscription.restaurantId }).sort({ deliveryDate: 1 });
    console.log(`Found ${allOrders.length} total orders for restaurant ${subscription.restaurantId}`);
    
    if (allOrders.length > 0) {
      console.log('\nAll orders:');
      allOrders.forEach((order, index) => {
        console.log(`${index + 1}. Order ${order._id}:`);
        console.log(`   Delivery Date: ${order.deliveryDate.toDateString()} (Day ${order.deliveryDate.getDay()})`);
        console.log(`   Status: ${order.status}`);
        console.log(`   Customer: ${order.customerId}`);
        console.log(`   Items: ${order.items ? order.items.length : 0}`);
      });
    }

    console.log('\n🧪 TESTING getTodaysOrdersForRestaurant METHOD:');
    
    // Test the method that the partner orders page likely uses
    const restaurantId = subscription.restaurantId;
    
    // Mock different dates to see what orders are returned
    const testOrderDates = [
      new Date('2025-10-11'), // Saturday
      new Date('2025-10-12'), // Sunday  
      new Date('2025-10-13')  // Monday
    ];

    for (const testDate of testOrderDates) {
      console.log(`\n🗓️ Testing date: ${testDate.toDateString()} (Day ${testDate.getDay()})`);
      
      // Mock Date.now to simulate "today" being the test date
      const originalDateNow = Date.now;
      Date.now = () => testDate.getTime();
      
      try {
        // Test the static method
        const todaysOrders = await SubscriptionMealPlan.getTodaysOrdersForRestaurant(restaurantId);
        console.log(`   getTodaysOrdersForRestaurant returned: ${todaysOrders.length} orders`);
        
        if (todaysOrders.length > 0) {
          todaysOrders.forEach((order, index) => {
            console.log(`   Order ${index + 1}: ${order.mealType} - ${order.item.name} - Delivery: ${order.deliveryDate.toDateString()}`);
          });
        }
        
        // Test the instance method
        const instanceOrders = subscription.getTodaysMeals();
        console.log(`   subscription.getTodaysMeals returned: ${instanceOrders.length} meals`);
        
        if (instanceOrders.length > 0) {
          instanceOrders.forEach((meal, index) => {
            console.log(`   Meal ${index + 1}: ${meal.mealType} - ${meal.item.name} - Delivery: ${meal.deliveryDate.toDateString()}`);
          });
        }
        
        // Check what subscription day this date maps to
        const subscriptionDay = findSubscriptionDayForDate(testDate, subscription.weeks);
        console.log(`   Date maps to subscription day: "${subscriptionDay}"`);
        
        // Check if there are meals for this day in the subscription
        if (subscriptionDay) {
          const currentWeek = subscription.weeks.find(week => {
            const weekStart = new Date(week.weekStartDate);
            weekStart.setHours(0, 0, 0, 0);
            const weekEnd = new Date(week.weekEndDate);
            weekEnd.setHours(23, 59, 59, 999);
            const target = new Date(testDate);
            target.setHours(0, 0, 0, 0);
            return target >= weekStart && target <= weekEnd;
          });
          
          if (currentWeek && currentWeek.meals[subscriptionDay]) {
            const dayMeals = currentWeek.meals[subscriptionDay];
            const lunchCount = dayMeals.lunch ? dayMeals.lunch.length : 0;
            const dinnerCount = dayMeals.dinner ? dayMeals.dinner.length : 0;
            console.log(`   Subscription has ${lunchCount} lunch + ${dinnerCount} dinner items for ${subscriptionDay}`);
          } else {
            console.log(`   No meals found in subscription for ${subscriptionDay}`);
          }
        }
        
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
      
      // Restore original Date.now
      Date.now = originalDateNow;
    }

    console.log('\n🔍 CHECKING PARTNER ORDERS CONTROLLER LOGIC:');
    console.log('The partner orders page likely uses one of these methods:');
    console.log('1. SubscriptionMealPlan.getTodaysOrdersForRestaurant(restaurantId)');
    console.log('2. Order.find({ restaurantId, deliveryDate })');
    console.log('3. Custom date filtering logic');
    
    console.log('\n📅 POTENTIAL ISSUES TO CHECK:');
    console.log('1. ❓ Are there actual meal items in the subscription for Oct 12?');
    console.log('2. ❓ Are orders generated from the subscription?');
    console.log('3. ❓ Is the partner orders page using the correct date format?');
    console.log('4. ❓ Is there timezone conversion happening in the UI?');
    console.log('5. ❓ Is the partner orders page filtering by the correct restaurant ID?');

  } catch (error) {
    console.error('❌ Error debugging partner orders UI:', error);
  } finally {
    mongoose.connection.close();
  }
}

debugPartnerOrdersUI();
