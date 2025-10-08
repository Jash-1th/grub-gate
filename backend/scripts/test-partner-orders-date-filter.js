// FILE: scripts/test-partner-orders-date-filter.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const Order = require('../src/models/Order');
const User = require('../src/models/User');
const Restaurant = require('../src/models/Restaurant');

/**
 * Test partner orders API date filtering with scheduled orders
 */
async function testPartnerOrdersDateFilter() {
  try {
    console.log('🧪 Testing Partner Orders Date Filtering...');
    console.log('=' .repeat(60));
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
    
    // Test different date queries
    await testDateQuery('2025-10-19', 'Oct 19 (Sunday - First scheduled orders)');
    await testDateQuery('2025-10-20', 'Oct 20 (Monday - Second day)');
    await testDateQuery('2025-10-21', 'Oct 21 (Tuesday - Third day)');
    await testDateQuery('2025-10-12', 'Oct 12 (Sunday - Week start, should be empty)');
    await testDateQuery('2025-10-08', 'Oct 8 (Today - should be empty)');
    
    console.log('\n🎉 Partner Orders Date Filter Test Complete!');
    
  } catch (error) {
    console.error('💥 Test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

/**
 * Test date query similar to partner portal API
 */
async function testDateQuery(dateString, description) {
  console.log(`\n📅 Testing ${description}:`);
  console.log('-' .repeat(40));
  
  try {
    // Parse date like the API does
    const targetDate = new Date(dateString);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    console.log(`   Query Date: ${dateString}`);
    console.log(`   Start: ${startOfDay.toISOString()}`);
    console.log(`   End: ${endOfDay.toISOString()}`);
    
    // Query orders using scheduledDate (like the enhanced API)
    const orders = await Order.find({
      scheduledDate: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      isScheduledOrder: true
    })
    .populate('customerId', 'firstName lastName email')
    .populate('restaurantId', 'name')
    .sort({ scheduledDate: -1 });
    
    console.log(`   📊 Results: ${orders.length} orders found`);
    
    if (orders.length > 0) {
      orders.forEach((order, index) => {
        const scheduledDate = new Date(order.scheduledDate);
        const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][scheduledDate.getDay()];
        
        console.log(`      ${index + 1}. ${order.orderNumber} - ${order.mealType} - ${dayName} ${scheduledDate.toDateString()}`);
        console.log(`         Customer: ${order.customerId?.firstName} ${order.customerId?.lastName}`);
        console.log(`         Restaurant: ${order.restaurantId?.name}`);
        console.log(`         Status: ${order.status}`);
        console.log(`         Items: ${order.items?.length || 0}`);
        console.log(`         Total: $${order.total?.toFixed(2) || '0.00'}`);
      });
    } else {
      console.log('      ℹ️ No scheduled orders found for this date');
    }
    
  } catch (error) {
    console.error(`   ❌ Error querying ${dateString}:`, error.message);
  }
}

// Handle script termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Test interrupted');
  await mongoose.connection.close();
  process.exit(0);
});

// Run the test
testPartnerOrdersDateFilter();
