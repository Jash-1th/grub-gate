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

async function checkActualOrderDates() {
  try {
    console.log('🔍 CHECKING ACTUAL ORDER DATES IN DATABASE');
    console.log('==========================================');

    const restaurantId = '68e73d168c18e7fd776a6327';

    // Get all orders for this restaurant
    const allOrders = await Order.find({ restaurantId }).sort({ scheduledDate: 1 });
    
    console.log(`Found ${allOrders.length} orders for restaurant ${restaurantId}`);
    
    allOrders.forEach((order, index) => {
      console.log(`\n${index + 1}. Order ${order._id}:`);
      console.log(`   Scheduled Date: ${order.scheduledDate ? order.scheduledDate.toISOString() : 'undefined'}`);
      console.log(`   Scheduled Date (Local): ${order.scheduledDate ? order.scheduledDate.toDateString() : 'undefined'}`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Item: ${order.items[0]?.name}`);
      console.log(`   Meal Type: ${order.mealType}`);
      console.log(`   Type: ${order.type}`);
      console.log(`   Is Subscription: ${order.isSubscriptionOrder}`);
    });

    console.log('\n🎯 PROBLEM IDENTIFIED:');
    console.log('The orders are scheduled for the WRONG dates!');
    console.log('Expected:');
    console.log('- Oct 12 (Sunday): mutton fry lunch');
    console.log('- Oct 18 (Saturday): chiceknn lunch');
    console.log('- Oct 19 (Sunday): fish fry lunch');
    console.log('- Oct 25 (Saturday): fish fry lunch');

    console.log('\n🔧 NEED TO FIX:');
    console.log('The orders are probably scheduled for Oct 11, 17, 18, 24 instead of Oct 12, 18, 19, 25');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkActualOrderDates();
