// FILE: scripts/check-user-orders.js
const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../src/models/User');
const Order = require('../src/models/Order');
const Restaurant = require('../src/models/Restaurant');

const connectDB = require('../src/config/database');

const checkUserOrders = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log('✅ Connected to database');

    // Find the user
    const userEmail = '2022cse.r234@svce.edu.in';
    const user = await User.findOne({ email: userEmail });
    
    if (!user) {
      console.log(`❌ User not found: ${userEmail}`);
      return;
    }
    
    console.log(`✅ Found user: ${user.fullName || `${user.firstName} ${user.lastName}`} (ID: ${user._id})`);
    console.log(`   📧 Email: ${user.email}`);
    console.log(`   📱 Phone: ${user.phoneNumber || user.phone || 'N/A'}`);
    console.log(`   👤 Roles: ${user.roles.join(', ')}`);
    console.log(`   ✅ Status: ${user.status}`);

    // Find the ASS restaurant
    const restaurant = await Restaurant.findOne({ 
      $or: [
        { name: { $regex: /ASS/i } },
        { name: { $regex: /ass/i } }
      ]
    });
    
    if (!restaurant) {
      console.log('❌ ASS restaurant not found');
      console.log('\n🔍 Available restaurants:');
      const allRestaurants = await Restaurant.find({}).select('name _id');
      allRestaurants.forEach((r, index) => {
        console.log(`   ${index + 1}. ${r.name} (ID: ${r._id})`);
      });
      return;
    }
    
    console.log(`\n✅ Found restaurant: ${restaurant.name} (ID: ${restaurant._id})`);

    // Get all orders for this user at this restaurant
    const orders = await Order.find({
      customerId: user._id,
      restaurantId: restaurant._id
    }).sort({ createdAt: -1 });

    console.log(`\n📊 ORDER ANALYSIS FOR ${userEmail} at ${restaurant.name}:`);
    console.log(`   📦 Total Orders: ${orders.length}`);

    if (orders.length > 0) {
      // Analyze by payment status
      const paidOrders = orders.filter(o => o.paymentStatus === 'paid');
      const pendingOrders = orders.filter(o => o.paymentStatus === 'pending');
      const failedOrders = orders.filter(o => o.paymentStatus === 'failed');
      const refundedOrders = orders.filter(o => o.paymentStatus === 'refunded');

      console.log(`\n💰 BY PAYMENT STATUS:`);
      console.log(`   ✅ Paid: ${paidOrders.length}`);
      console.log(`   ⏳ Pending: ${pendingOrders.length}`);
      console.log(`   ❌ Failed: ${failedOrders.length}`);
      console.log(`   🔄 Refunded: ${refundedOrders.length}`);

      // Analyze by order status
      const statusCounts = {};
      orders.forEach(order => {
        statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
      });

      console.log(`\n📋 BY ORDER STATUS:`);
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`   ${status}: ${count}`);
      });

      // Calculate totals
      const totalSpent = paidOrders.reduce((sum, order) => sum + order.total, 0);
      const averageOrderValue = paidOrders.length > 0 ? totalSpent / paidOrders.length : 0;

      console.log(`\n💵 FINANCIAL SUMMARY:`);
      console.log(`   💰 Total Spent (Paid Orders): $${totalSpent.toFixed(2)}`);
      console.log(`   📈 Average Order Value: $${averageOrderValue.toFixed(2)}`);

      // Show recent orders
      console.log(`\n📅 RECENT ORDERS (Last 5):`);
      orders.slice(0, 5).forEach((order, index) => {
        console.log(`   ${index + 1}. Order #${order.orderNumber}`);
        console.log(`      💰 Total: $${order.total.toFixed(2)}`);
        console.log(`      💳 Payment: ${order.paymentStatus}`);
        console.log(`      📋 Status: ${order.status}`);
        console.log(`      📅 Date: ${new Date(order.createdAt).toLocaleDateString()}`);
        console.log(`      🍽️  Items: ${order.items.length}`);
        console.log('');
      });

      // Check for duplicates or unusual patterns
      const ordersByDate = {};
      orders.forEach(order => {
        const date = new Date(order.createdAt).toDateString();
        ordersByDate[date] = (ordersByDate[date] || 0) + 1;
      });

      const datesWithMultipleOrders = Object.entries(ordersByDate)
        .filter(([date, count]) => count > 5)
        .sort((a, b) => b[1] - a[1]);

      if (datesWithMultipleOrders.length > 0) {
        console.log(`\n⚠️  DATES WITH HIGH ORDER COUNT:`);
        datesWithMultipleOrders.slice(0, 10).forEach(([date, count]) => {
          console.log(`   ${date}: ${count} orders`);
        });
      }

      // Date range
      const firstOrder = orders[orders.length - 1];
      const lastOrder = orders[0];
      console.log(`\n📅 ORDER DATE RANGE:`);
      console.log(`   🥇 First Order: ${new Date(firstOrder.createdAt).toLocaleDateString()}`);
      console.log(`   🏁 Last Order: ${new Date(lastOrder.createdAt).toLocaleDateString()}`);
      
      const daysDiff = Math.ceil((lastOrder.createdAt - firstOrder.createdAt) / (1000 * 60 * 60 * 24));
      const ordersPerDay = orders.length / Math.max(daysDiff, 1);
      console.log(`   📊 Average Orders per Day: ${ordersPerDay.toFixed(2)}`);
    }

    // Verify the count matches what's shown in dashboard
    console.log(`\n🔍 VERIFICATION:`);
    console.log(`   Database Count: ${orders.length}`);
    console.log(`   Dashboard Shows: 249`);
    console.log(`   Match: ${orders.length === 249 ? '✅ YES' : '❌ NO'}`);

    if (orders.length !== 249) {
      console.log(`\n🔍 INVESTIGATING DISCREPANCY:`);
      console.log(`   Difference: ${Math.abs(orders.length - 249)} orders`);
      
      // Check if there are orders with different criteria
      const allUserOrders = await Order.find({ customerId: user._id });
      console.log(`   Total orders for user (all restaurants): ${allUserOrders.length}`);
      
      const allRestaurantOrders = await Order.find({ restaurantId: restaurant._id });
      console.log(`   Total orders for restaurant (all customers): ${allRestaurantOrders.length}`);
    }

  } catch (error) {
    console.error('❌ Error checking user orders:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

// Run the check
if (require.main === module) {
  checkUserOrders();
}

module.exports = checkUserOrders;
