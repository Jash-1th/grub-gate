// FILE: scripts/find-restaurant-partner.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const Restaurant = require('../src/models/Restaurant');
const Order = require('../src/models/Order');

/**
 * Find the correct partner ID for restaurant
 */
async function findRestaurantPartner() {
  try {
    console.log('🔍 FINDING RESTAURANT PARTNER INFO');
    console.log('=' .repeat(50));
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    
    const restaurantId = '68e73d168c18e7fd776a6327'; // From our tests
    
    // Find restaurant details
    const restaurant = await Restaurant.findById(restaurantId);
    
    if (!restaurant) {
      console.log(`❌ Restaurant not found: ${restaurantId}`);
      return;
    }
    
    console.log(`🏪 Restaurant Found:`);
    console.log(`   Name: ${restaurant.name}`);
    console.log(`   ID: ${restaurant._id}`);
    console.log(`   Partner ID: ${restaurant.partnerId || 'Not set'}`);
    console.log(`   Owner ID: ${restaurant.ownerId || 'Not set'}`);
    console.log(`   Status: ${restaurant.status || 'Not set'}`);
    
    // Check for orders
    const orderCount = await Order.countDocuments({
      restaurantId: restaurant._id,
      isScheduledOrder: true
    });
    
    console.log(`   Orders: ${orderCount} scheduled orders`);
    
    // Find all restaurants to see partner structure
    console.log(`\n📋 ALL RESTAURANTS WITH PARTNERS:`);
    console.log('-' .repeat(40));
    
    const allRestaurants = await Restaurant.find({});
    
    allRestaurants.forEach(rest => {
      console.log(`${rest.name}:`);
      console.log(`   ID: ${rest._id}`);
      console.log(`   Partner ID: ${rest.partnerId || 'None'}`);
      console.log(`   Owner ID: ${rest.ownerId || 'None'}`);
      console.log(`   Status: ${rest.status || 'None'}`);
      console.log('');
    });
    
    // If our restaurant doesn't have partnerId, let's check if there are orders
    if (orderCount > 0) {
      console.log(`\n📊 ORDERS FOR ${restaurant.name}:`);
      
      const recentOrders = await Order.find({
        restaurantId: restaurant._id,
        isScheduledOrder: true
      })
      .populate('customerId', 'firstName lastName')
      .sort({ scheduledDate: 1 })
      .limit(5);
      
      recentOrders.forEach((order, index) => {
        const scheduledDate = new Date(order.scheduledDate);
        const deliveryDate = new Date(order.deliveryTime.estimated);
        
        console.log(`${index + 1}. ${order.orderNumber}`);
        console.log(`   Customer: ${order.customerId.firstName} ${order.customerId.lastName}`);
        console.log(`   Scheduled: ${scheduledDate.toISOString()}`);
        console.log(`   Delivery: ${deliveryDate.toISOString()}`);
        console.log(`   Same Day: ${scheduledDate.toDateString() === deliveryDate.toDateString() ? '✅' : '❌'}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('💥 Search failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the search
findRestaurantPartner();
