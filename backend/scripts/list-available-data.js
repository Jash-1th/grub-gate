// FILE: scripts/list-available-data.js
const mongoose = require('mongoose');
const SubscriptionMealPlan = require('../src/models/SubscriptionMealPlan');
const Order = require('../src/models/Order');
const User = require('../src/models/User');
const Restaurant = require('../src/models/Restaurant');

/**
 * List all available customers, restaurants, subscriptions, and orders
 */
async function listAvailableData() {
  try {
    console.log('📋 LISTING ALL AVAILABLE DATA');
    console.log('=' .repeat(60));
    
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/grub-gate');
    console.log('✅ Connected to MongoDB');
    
    // List all customers
    const customers = await User.find({ roles: { $in: ['customer'] } }).select('_id name email roles');
    console.log(`\n👥 CUSTOMERS (${customers.length}):`);
    customers.forEach(customer => {
      console.log(`   ${customer._id} - ${customer.name} (${customer.email})`);
    });
    
    // List all restaurants
    const restaurants = await Restaurant.find().select('_id name ownerId');
    console.log(`\n🏪 RESTAURANTS (${restaurants.length}):`);
    restaurants.forEach(restaurant => {
      console.log(`   ${restaurant._id} - ${restaurant.name} (Owner: ${restaurant.ownerId})`);
    });
    
    // List all subscriptions
    const subscriptions = await SubscriptionMealPlan.find().select('_id customerId restaurantId planType createdAt status').sort({ createdAt: -1 });
    console.log(`\n📋 SUBSCRIPTIONS (${subscriptions.length}):`);
    subscriptions.forEach(subscription => {
      console.log(`   ${subscription._id}`);
      console.log(`     Customer: ${subscription.customerId}`);
      console.log(`     Restaurant: ${subscription.restaurantId}`);
      console.log(`     Type: ${subscription.planType}`);
      console.log(`     Created: ${subscription.createdAt}`);
      console.log(`     Status: ${subscription.status}`);
      console.log('');
    });
    
    // List all orders
    const orders = await Order.find().select('_id customerId restaurantId scheduledDeliveryDate mealType status totalAmount').sort({ scheduledDeliveryDate: 1 });
    console.log(`\n📦 ORDERS (${orders.length}):`);
    
    if (orders.length > 0) {
      // Group by customer
      const ordersByCustomer = {};
      orders.forEach(order => {
        const customerId = order.customerId.toString();
        if (!ordersByCustomer[customerId]) {
          ordersByCustomer[customerId] = [];
        }
        ordersByCustomer[customerId].push(order);
      });
      
      Object.keys(ordersByCustomer).forEach(customerId => {
        const customerOrders = ordersByCustomer[customerId];
        console.log(`   Customer ${customerId}: ${customerOrders.length} orders`);
        
        // Show first 3 orders for this customer
        customerOrders.slice(0, 3).forEach(order => {
          console.log(`     ${order.scheduledDeliveryDate.toDateString()} - ${order.mealType} ($${order.totalAmount})`);
        });
        
        if (customerOrders.length > 3) {
          console.log(`     ... and ${customerOrders.length - 3} more orders`);
        }
        console.log('');
      });
    } else {
      console.log('   No orders found');
    }
    
    // Show most recent subscription details
    if (subscriptions.length > 0) {
      const latestSubscription = subscriptions[0];
      console.log(`\n🔍 LATEST SUBSCRIPTION DETAILS:`);
      console.log('-' .repeat(40));
      console.log(`   ID: ${latestSubscription._id}`);
      console.log(`   Customer: ${latestSubscription.customerId}`);
      console.log(`   Restaurant: ${latestSubscription.restaurantId}`);
      
      // Get full subscription details
      const fullSubscription = await SubscriptionMealPlan.findById(latestSubscription._id);
      if (fullSubscription) {
        console.log(`   Plan Start: ${fullSubscription.planStartDate}`);
        console.log(`   Plan End: ${fullSubscription.planEndDate}`);
        console.log(`   Weeks: ${fullSubscription.weeks?.length || 0}`);
        
        let totalMeals = 0;
        fullSubscription.weeks?.forEach(week => {
          let weekMeals = 0;
          const meals = week.meals || {};
          
          Object.keys(meals).forEach(day => {
            const dayMeals = meals[day] || {};
            const lunchCount = dayMeals.lunch?.length || 0;
            const dinnerCount = dayMeals.dinner?.length || 0;
            weekMeals += lunchCount + dinnerCount;
          });
          
          totalMeals += weekMeals;
        });
        
        console.log(`   Total Meals: ${totalMeals}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

listAvailableData();
