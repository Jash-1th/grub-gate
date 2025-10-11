const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Order = require('./src/models/Order');
const Restaurant = require('./src/models/Restaurant');
const SubscriptionMealPlan = require('./src/models/SubscriptionMealPlan');

const RESTAURANT_ID = '68e73d168c18e7fd776a6327';

async function checkRestaurantOrders() {
  try {
    // Connect to MongoDB (use same env var as backend)
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/grubgate';
    console.log(`🔗 Connecting to: ${mongoUri.replace(/\/\/.*@/, '//***:***@')}`); // Hide credentials
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    console.log(`\n🔍 CHECKING ORDERS FOR RESTAURANT: ${RESTAURANT_ID}`);
    console.log('=' .repeat(60));

    // 1. Get restaurant details
    console.log(`🔍 Searching for restaurant with ID: ${RESTAURANT_ID}`);
    const restaurant = await Restaurant.findById(RESTAURANT_ID);
    
    if (!restaurant) {
      console.log('❌ Restaurant not found in database!');
      
      // Try to find any restaurant with similar name
      const allRestaurants = await Restaurant.find({}).select('name _id');
      console.log(`\n📋 Available restaurants (${allRestaurants.length}):`);
      allRestaurants.forEach(r => {
        console.log(`   - ${r.name} (${r._id})`);
      });
      return;
    }

    console.log(`\n🏪 RESTAURANT DETAILS:`);
    console.log(`   Name: ${restaurant.name}`);
    console.log(`   Address: ${restaurant.address?.formattedAddress || 'N/A'}`);
    console.log(`   Status: ${restaurant.isActive ? 'Active' : 'Inactive'}`);

    // 2. Check regular orders
    console.log(`\n📦 REGULAR ORDERS:`);
    const orders = await Order.find({ restaurantId: RESTAURANT_ID })
      .sort({ createdAt: -1 });

    console.log(`   Total Orders: ${orders.length}`);

    if (orders.length > 0) {
      console.log(`\n   📋 ORDER BREAKDOWN:`);
      
      // Group by status
      const statusCounts = {};
      const recentOrders = orders.slice(0, 5); // Show last 5 orders
      
      orders.forEach(order => {
        statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
      });

      console.log(`   Status Distribution:`);
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`     ${status}: ${count} orders`);
      });

      console.log(`\n   📅 RECENT ORDERS (Last 5):`);
      recentOrders.forEach((order, index) => {
        console.log(`     ${index + 1}. Order ${order.orderNumber || order._id}`);
        console.log(`        Customer ID: ${order.customerId}`);
        console.log(`        Status: ${order.status}`);
        console.log(`        Total: $${order.totalAmount}`);
        console.log(`        Date: ${order.createdAt.toDateString()}`);
        console.log(`        Items: ${order.items?.length || 0}`);
        console.log('');
      });
    }

    // 3. Check subscription meal plans
    console.log(`\n📋 SUBSCRIPTION MEAL PLANS:`);
    const subscriptionPlans = await SubscriptionMealPlan.find({ restaurantId: RESTAURANT_ID })
      .sort({ createdAt: -1 });

    console.log(`   Total Subscription Plans: ${subscriptionPlans.length}`);

    if (subscriptionPlans.length > 0) {
      console.log(`\n   📊 SUBSCRIPTION BREAKDOWN:`);
      
      // Group by status
      const subStatusCounts = {};
      subscriptionPlans.forEach(plan => {
        subStatusCounts[plan.status] = (subStatusCounts[plan.status] || 0) + 1;
      });

      console.log(`   Status Distribution:`);
      Object.entries(subStatusCounts).forEach(([status, count]) => {
        console.log(`     ${status}: ${count} plans`);
      });

      console.log(`\n   📅 RECENT SUBSCRIPTION PLANS (Last 3):`);
      subscriptionPlans.slice(0, 3).forEach((plan, index) => {
        console.log(`     ${index + 1}. Plan ${plan._id}`);
        console.log(`        Customer: ${plan.customerId?.firstName} ${plan.customerId?.lastName}`);
        console.log(`        Status: ${plan.status}`);
        console.log(`        Plan Type: ${plan.planType}`);
        console.log(`        Start: ${plan.planStartDate?.toDateString() || 'N/A'}`);
        console.log(`        End: ${plan.planEndDate?.toDateString() || 'N/A'}`);
        console.log(`        Total Weeks: ${plan.weeks?.length || 0}`);
        console.log('');
      });
    }

    // 4. Summary statistics
    console.log(`\n📊 SUMMARY STATISTICS:`);
    console.log(`   Regular Orders: ${orders.length}`);
    console.log(`   Subscription Plans: ${subscriptionPlans.length}`);
    console.log(`   Total Revenue: $${orders.reduce((sum, order) => sum + order.totalAmount, 0).toFixed(2)}`);
    
    const activeOrders = orders.filter(o => ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status));
    console.log(`   Active Orders: ${activeOrders.length}`);
    
    const activeSubscriptions = subscriptionPlans.filter(p => p.status === 'active');
    console.log(`   Active Subscriptions: ${activeSubscriptions.length}`);

    console.log(`\n✅ Analysis complete!`);

  } catch (error) {
    console.error('❌ Error checking restaurant orders:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

// Run the check
checkRestaurantOrders();
