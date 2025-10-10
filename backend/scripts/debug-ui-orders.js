// FILE: scripts/debug-ui-orders.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const { getTodaysOrders, getOrdersByDateRange } = require('../src/controllers/partner/orders.controller');
const Order = require('../src/models/Order');
const Restaurant = require('../src/models/Restaurant');

/**
 * Debug what the UI should be seeing
 */
async function debugUIOrders() {
  try {
    console.log('🔍 DEBUGGING UI ORDER DISPLAY ISSUES');
    console.log('=' .repeat(60));
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    
    const partnerId = '68e73d158c18e7fd776a6325';
    
    // Mock request/response objects
    const mockReq = {
      user: { id: partnerId },
      query: {}
    };
    
    let apiResponse = null;
    const mockRes = {
      status: (code) => {
        apiResponse = { statusCode: code };
        return mockRes;
      },
      json: (data) => {
        apiResponse = { ...apiResponse, ...data };
        return mockRes;
      }
    };
    
    // Test 1: Today's Orders API
    console.log('\n📅 TEST 1: Today\'s Orders API');
    console.log('-' .repeat(40));
    
    await getTodaysOrders(mockReq, mockRes);
    console.log(`Status: ${apiResponse.statusCode}`);
    console.log(`Total Orders: ${apiResponse.data?.totalOrders || 0}`);
    
    // Test 2: Date Range API for Oct 18 (where we have orders)
    console.log('\n📅 TEST 2: Date Range API (Oct 18)');
    console.log('-' .repeat(40));
    
    mockReq.query = {
      startDate: '2025-10-18',
      endDate: '2025-10-18'
    };
    
    apiResponse = null;
    await getOrdersByDateRange(mockReq, mockRes);
    console.log(`Status: ${apiResponse.statusCode}`);
    console.log(`Total Orders: ${apiResponse.data?.totalOrders || 0}`);
    
    if (apiResponse.data?.orders?.length > 0) {
      console.log('📋 Orders found:');
      apiResponse.data.orders.forEach((order, index) => {
        console.log(`   ${index + 1}. ${order.orderNumber} - ${order.mealType} (${order.status})`);
      });
    }
    
    // Test 3: Check what orders exist in database
    console.log('\n📅 TEST 3: Raw Database Query');
    console.log('-' .repeat(40));
    
    const restaurant = await Restaurant.findOne({ 
      $or: [
        { partnerId: partnerId },
        { ownerId: partnerId }
      ]
    });
    
    console.log(`Restaurant: ${restaurant.name} (${restaurant._id})`);
    
    // Get all orders for this restaurant
    const allOrders = await Order.find({
      restaurantId: restaurant._id,
      isScheduledOrder: true
    }).sort({ scheduledDate: 1 });
    
    console.log(`\n📊 Total Orders in Database: ${allOrders.length}`);
    
    // Group by status
    const ordersByStatus = {};
    allOrders.forEach(order => {
      const status = order.status;
      if (!ordersByStatus[status]) ordersByStatus[status] = 0;
      ordersByStatus[status]++;
    });
    
    console.log('\n📈 Orders by Status:');
    Object.keys(ordersByStatus).forEach(status => {
      console.log(`   ${status}: ${ordersByStatus[status]}`);
    });
    
    // Show first few orders with dates
    console.log('\n📋 First 5 Orders:');
    allOrders.slice(0, 5).forEach((order, index) => {
      const scheduledDate = new Date(order.scheduledDate);
      const deliveryDate = new Date(order.deliveryTime.estimated);
      
      console.log(`${index + 1}. ${order.orderNumber}`);
      console.log(`   Scheduled: ${scheduledDate.toISOString().split('T')[0]} (${scheduledDate.toDateString()})`);
      console.log(`   Delivery: ${deliveryDate.toISOString().split('T')[0]} (${deliveryDate.toDateString()})`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Meal: ${order.mealType}`);
      console.log('');
    });
    
    // Test 4: Check specific date ranges that UI might be using
    console.log('\n📅 TEST 4: Common UI Date Ranges');
    console.log('-' .repeat(40));
    
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
    
    const thisWeekEnd = new Date(thisWeekStart);
    thisWeekEnd.setDate(thisWeekStart.getDate() + 6); // End of week (Saturday)
    
    console.log(`Today: ${today.toISOString().split('T')[0]}`);
    console.log(`Tomorrow: ${tomorrow.toISOString().split('T')[0]}`);
    console.log(`This Week: ${thisWeekStart.toISOString().split('T')[0]} to ${thisWeekEnd.toISOString().split('T')[0]}`);
    
    // Check orders for this week
    const thisWeekOrders = await Order.find({
      restaurantId: restaurant._id,
      scheduledDate: {
        $gte: thisWeekStart,
        $lte: thisWeekEnd
      }
    });
    
    console.log(`\n📊 This Week Orders: ${thisWeekOrders.length}`);
    
    // Test 5: Check if UI is filtering by specific status
    console.log('\n📅 TEST 5: Orders by Status Filter');
    console.log('-' .repeat(40));
    
    const statuses = ['scheduled', 'pending', 'confirmed', 'preparing', 'ready', 'delivered'];
    
    for (const status of statuses) {
      const count = await Order.countDocuments({
        restaurantId: restaurant._id,
        status: status
      });
      console.log(`   ${status}: ${count} orders`);
    }
    
    // Test 6: What should UI show for next 7 days?
    console.log('\n📅 TEST 6: Next 7 Days (What UI Should Show)');
    console.log('-' .repeat(40));
    
    const next7Days = new Date(today);
    next7Days.setDate(today.getDate() + 7);
    
    const upcomingOrders = await Order.find({
      restaurantId: restaurant._id,
      scheduledDate: {
        $gte: today,
        $lte: next7Days
      }
    }).sort({ scheduledDate: 1 });
    
    console.log(`📊 Orders in Next 7 Days: ${upcomingOrders.length}`);
    
    if (upcomingOrders.length > 0) {
      console.log('\n📋 Upcoming Orders:');
      upcomingOrders.forEach((order, index) => {
        const date = new Date(order.scheduledDate);
        console.log(`   ${index + 1}. ${date.toDateString()} - ${order.mealType} (${order.status})`);
      });
    }
    
    // Summary and recommendations
    console.log('\n🎯 DIAGNOSIS & RECOMMENDATIONS:');
    console.log('-' .repeat(50));
    
    if (allOrders.length === 0) {
      console.log('❌ NO ORDERS FOUND - Check if orders were generated correctly');
    } else {
      console.log(`✅ ${allOrders.length} orders exist in database`);
      
      const pendingCount = ordersByStatus['pending'] || 0;
      const scheduledCount = ordersByStatus['scheduled'] || 0;
      
      if (pendingCount === 0 && scheduledCount > 0) {
        console.log('⚠️  All orders are "scheduled" - UI might only show "pending" orders');
        console.log('💡 Solution: Activate orders for specific dates to make them "pending"');
      }
      
      if (upcomingOrders.length === 0) {
        console.log('⚠️  No orders in next 7 days - UI date range might be too narrow');
        console.log('💡 Solution: Check UI date filtering logic');
      }
    }
    
  } catch (error) {
    console.error('💥 Debug failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the debug
debugUIOrders();
