// FILE: scripts/verify-partner-orders.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const Order = require('../src/models/Order');
const Restaurant = require('../src/models/Restaurant');
const User = require('../src/models/User');

/**
 * Verify partner orders and date alignment
 */
async function verifyPartnerOrders() {
  try {
    console.log('🔍 VERIFYING PARTNER ORDERS');
    console.log('=' .repeat(60));
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    
    const partnerId = '68e73d158c18e7fd776a6325';
    
    // Find partner's restaurant (check both partnerId and ownerId)
    const restaurant = await Restaurant.findOne({ 
      $or: [
        { partnerId: partnerId },
        { ownerId: partnerId }
      ]
    });
    
    if (!restaurant) {
      console.log(`❌ No restaurant found for partner ${partnerId}`);
      return;
    }
    
    console.log(`🏪 Restaurant: ${restaurant.name} (ID: ${restaurant._id})`);
    console.log(`👤 Partner ID: ${partnerId}`);
    
    // Find all orders for this restaurant
    const orders = await Order.find({
      restaurantId: restaurant._id,
      isScheduledOrder: true
    })
    .populate('customerId', 'firstName lastName email')
    .sort({ scheduledDate: 1 });
    
    console.log(`\n📊 Found ${orders.length} orders for this restaurant:`);
    
    if (orders.length === 0) {
      console.log('ℹ️  No orders found for this partner');
      return;
    }
    
    console.log('-' .repeat(60));
    
    // Group orders by date
    const ordersByDate = {};
    let dateIssues = 0;
    let timeIssues = 0;
    
    orders.forEach((order, index) => {
      const scheduledDate = new Date(order.scheduledDate);
      const deliveryDate = new Date(order.deliveryTime.estimated);
      
      // Format dates for comparison
      const scheduledDateStr = scheduledDate.toISOString();
      const deliveryDateStr = deliveryDate.toISOString();
      
      // Check if dates are on same day
      const scheduledDay = scheduledDate.toISOString().split('T')[0];
      const deliveryDay = deliveryDate.toISOString().split('T')[0];
      const sameDay = scheduledDay === deliveryDay;
      
      if (!sameDay) dateIssues++;
      
      // Check delivery time correctness
      const deliveryHour = deliveryDate.getUTCHours();
      const expectedHour = order.mealType === 'lunch' ? 7 : 14; // UTC hours
      const correctTime = deliveryHour === expectedHour;
      
      if (!correctTime) timeIssues++;
      
      // Group by scheduled date
      if (!ordersByDate[scheduledDay]) {
        ordersByDate[scheduledDay] = [];
      }
      ordersByDate[scheduledDay].push(order);
      
      console.log(`\n${index + 1}. Order: ${order.orderNumber}`);
      console.log(`   Customer: ${order.customerId.firstName} ${order.customerId.lastName}`);
      console.log(`   Meal: ${order.mealType} (${order.items.length} items)`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Scheduled Date: ${scheduledDateStr}`);
      console.log(`   Delivery Time:  ${deliveryDateStr}`);
      console.log(`   Same Day: ${sameDay ? '✅' : '❌'}`);
      console.log(`   Correct Time: ${correctTime ? '✅' : '❌'} (UTC ${deliveryHour}:00, expected ${expectedHour}:00)`);
      console.log(`   Total: $${order.total}`);
      
      if (!sameDay) {
        console.log(`   ⚠️  DATE MISMATCH: Scheduled ${scheduledDay} vs Delivery ${deliveryDay}`);
      }
      
      if (!correctTime) {
        console.log(`   ⚠️  TIME MISMATCH: Got ${deliveryHour}:00 UTC, expected ${expectedHour}:00 UTC`);
      }
    });
    
    // Orders by date summary
    console.log('\n📅 ORDERS BY DATE:');
    console.log('-' .repeat(40));
    
    Object.keys(ordersByDate).sort().forEach(date => {
      const dayOrders = ordersByDate[date];
      const lunchCount = dayOrders.filter(o => o.mealType === 'lunch').length;
      const dinnerCount = dayOrders.filter(o => o.mealType === 'dinner').length;
      
      console.log(`${date}: ${dayOrders.length} orders (${lunchCount} lunch, ${dinnerCount} dinner)`);
    });
    
    // Today's orders specifically
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];
    
    const todaysOrders = orders.filter(order => {
      const orderDate = new Date(order.scheduledDate).toISOString().split('T')[0];
      return orderDate === todayStr && order.status === 'pending';
    });
    
    console.log(`\n📅 TODAY'S ORDERS (${todayStr}):`);
    console.log(`   Pending Orders: ${todaysOrders.length}`);
    
    if (todaysOrders.length > 0) {
      todaysOrders.forEach(order => {
        console.log(`   - ${order.orderNumber}: ${order.mealType} (${order.status})`);
      });
    }
    
    // Summary
    console.log('\n📈 SUMMARY:');
    console.log(`   Total Orders: ${orders.length}`);
    console.log(`   Date Issues: ${dateIssues} ${dateIssues === 0 ? '✅' : '❌'}`);
    console.log(`   Time Issues: ${timeIssues} ${timeIssues === 0 ? '✅' : '❌'}`);
    console.log(`   Today's Pending: ${todaysOrders.length}`);
    
    if (dateIssues === 0 && timeIssues === 0) {
      console.log('\n🎉 ALL ORDERS HAVE CORRECT DATES AND TIMES!');
    } else {
      console.log('\n💥 ISSUES FOUND WITH ORDER DATES/TIMES!');
    }
    
    // Check upcoming orders (next 7 days)
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    const upcomingOrders = orders.filter(order => {
      const orderDate = new Date(order.scheduledDate);
      return orderDate >= today && orderDate <= nextWeek && order.status === 'scheduled';
    });
    
    console.log(`\n📅 UPCOMING ORDERS (Next 7 days): ${upcomingOrders.length}`);
    if (upcomingOrders.length > 0) {
      upcomingOrders.slice(0, 5).forEach(order => {
        const orderDate = new Date(order.scheduledDate).toDateString();
        console.log(`   - ${orderDate}: ${order.mealType} (${order.orderNumber})`);
      });
      if (upcomingOrders.length > 5) {
        console.log(`   ... and ${upcomingOrders.length - 5} more`);
      }
    }
    
  } catch (error) {
    console.error('💥 Verification failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Handle script termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Verification interrupted');
  await mongoose.connection.close();
  process.exit(0);
});

// Run the verification
verifyPartnerOrders();
