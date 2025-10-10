const mongoose = require('mongoose');
require('dotenv').config();

const Order = require('./src/models/Order');
const Restaurant = require('./src/models/Restaurant');
const User = require('./src/models/User');

async function debugOrdersAPI() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔗 Connected to MongoDB');
    
    const customerId = '68e7578c70b1ebbce509b69c';
    const restaurantId = '68e73d168c18e7fd776a6327';
    
    // Get the partner user for this restaurant
    const restaurant = await Restaurant.findById(restaurantId);
    console.log('\n🏪 Restaurant:', restaurant.name);
    console.log('Owner ID:', restaurant.ownerId);
    
    const partner = await User.findById(restaurant.ownerId);
    console.log('\n👤 Partner User:', partner.firstName, partner.lastName);
    console.log('Partner Role:', partner.role);
    
    // Test the exact query that the API would use
    console.log('\n🔍 TESTING API QUERY LOGIC:');
    
    // Simulate partner role query (from order.controller.js line 39-44)
    const restaurants = await Restaurant.find({ ownerId: restaurant.ownerId }).select('_id');
    const restaurantIds = restaurants.map(r => r._id);
    console.log('Partner restaurants:', restaurantIds.map(id => id.toString()));
    
    // Build query like the API does
    let query = {
      restaurantId: { $in: restaurantIds }
    };
    
    // Test date filtering for Oct 12, 2025
    const date = '2025-10-12';
    const targetDate = new Date(date + 'T00:00:00.000Z');
    const startOfDay = new Date(targetDate);
    const endOfDay = new Date(targetDate);
    endOfDay.setUTCHours(23, 59, 59, 999);
    
    console.log('\n📅 Date filtering for:', date);
    console.log('Target date:', targetDate);
    console.log('Start of day:', startOfDay);
    console.log('End of day:', endOfDay);
    
    query.scheduledDate = {
      $gte: startOfDay,
      $lte: endOfDay
    };
    
    // Include scheduled orders
    query.status = { $in: ['scheduled', 'pending', 'confirmed', 'preparing', 'ready', 'out-for-delivery', 'delivered', 'completed', 'cancelled'] };
    
    console.log('\n🔍 Final query:', JSON.stringify(query, null, 2));
    
    // Execute the query
    const orders = await Order.find(query)
      .sort({ scheduledDate: -1 })
      .populate('customerId', 'firstName lastName email phone')
      .populate('restaurantId', 'name cuisine phone address');
    
    console.log('\n📦 QUERY RESULTS:');
    console.log('Orders found:', orders.length);
    
    if (orders.length > 0) {
      orders.forEach((order, index) => {
        console.log(`\nOrder ${index + 1}:`);
        console.log('  ID:', order._id);
        console.log('  Order Number:', order.orderNumber);
        console.log('  Status:', order.status);
        console.log('  Scheduled Date:', order.scheduledDate);
        console.log('  Meal Type:', order.mealType);
        console.log('  Customer:', order.customerId?.firstName, order.customerId?.lastName);
        console.log('  Restaurant:', order.restaurantId?.name);
        console.log('  Total:', '$' + order.total);
      });
    } else {
      console.log('❌ No orders found with the API query');
      
      // Let's check what orders exist for this restaurant
      console.log('\n🔍 CHECKING ALL ORDERS FOR THIS RESTAURANT:');
      const allOrders = await Order.find({ restaurantId: restaurantId })
        .sort({ scheduledDate: 1 })
        .populate('customerId', 'firstName lastName email phone');
      
      console.log('Total orders for restaurant:', allOrders.length);
      
      allOrders.slice(0, 5).forEach((order, index) => {
        console.log(`\nOrder ${index + 1}:`);
        console.log('  Scheduled Date:', order.scheduledDate);
        console.log('  Status:', order.status);
        console.log('  Meal Type:', order.mealType);
        console.log('  Customer:', order.customerId?.firstName, order.customerId?.lastName);
      });
      
      // Check if there are orders for Oct 12 specifically
      console.log('\n🔍 CHECKING ORDERS FOR OCT 12 (any status):');
      const oct12Orders = await Order.find({
        restaurantId: restaurantId,
        scheduledDate: {
          $gte: startOfDay,
          $lte: endOfDay
        }
      });
      
      console.log('Oct 12 orders (any status):', oct12Orders.length);
      oct12Orders.forEach((order, index) => {
        console.log(`  Order ${index + 1}: Status=${order.status}, Date=${order.scheduledDate}`);
      });
    }
    
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.disconnect();
  }
}

debugOrdersAPI();
