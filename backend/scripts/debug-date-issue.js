// FILE: scripts/debug-date-issue.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const Order = require('../src/models/Order');
const User = require('../src/models/User');
const Restaurant = require('../src/models/Restaurant');

/**
 * Debug date issue between frontend and backend
 */
async function debugDateIssue() {
  try {
    console.log('🔍 Debugging Date Issue...');
    console.log('=' .repeat(60));
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
    
    // Get all scheduled orders and their dates
    const orders = await Order.find({ 
      isScheduledOrder: true,
      status: 'scheduled'
    })
    .populate('customerId', 'firstName lastName')
    .sort({ scheduledDate: 1 })
    .limit(20);
    
    console.log(`\n📊 Found ${orders.length} scheduled orders:`);
    console.log('-' .repeat(60));
    
    orders.forEach((order, index) => {
      const scheduledDate = new Date(order.scheduledDate);
      const localDate = scheduledDate.toLocaleDateString('en-US', { 
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit', 
        day: '2-digit',
        weekday: 'short'
      });
      const utcDate = scheduledDate.toISOString();
      const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][scheduledDate.getDay()];
      
      console.log(`${index + 1}. ${order.orderNumber}`);
      console.log(`   Scheduled Date (UTC): ${utcDate}`);
      console.log(`   Scheduled Date (Local): ${localDate}`);
      console.log(`   Day: ${dayName}`);
      console.log(`   Meal: ${order.mealType}`);
      console.log(`   Customer: ${order.customerId?.firstName} ${order.customerId?.lastName}`);
      console.log('');
    });
    
    // Test specific date queries
    console.log('\n🧪 Testing Date Queries:');
    console.log('-' .repeat(40));
    
    await testDateQuery('2025-10-19');
    await testDateQuery('2025-10-26');
    
    // Test with different date formats
    console.log('\n🔧 Testing Different Date Formats:');
    console.log('-' .repeat(40));
    
    await testDateQueryWithTimezone('2025-10-19');
    await testDateQueryWithTimezone('2025-10-26');
    
  } catch (error) {
    console.error('💥 Debug failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

/**
 * Test date query (current backend logic)
 */
async function testDateQuery(dateString) {
  console.log(`\n📅 Testing ${dateString} (Current Logic):`);
  
  const targetDate = new Date(dateString);
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);
  
  console.log(`   Input: ${dateString}`);
  console.log(`   Start: ${startOfDay.toISOString()}`);
  console.log(`   End: ${endOfDay.toISOString()}`);
  
  const orders = await Order.find({
    scheduledDate: {
      $gte: startOfDay,
      $lte: endOfDay
    },
    isScheduledOrder: true
  });
  
  console.log(`   Results: ${orders.length} orders`);
}

/**
 * Test date query with proper timezone handling
 */
async function testDateQueryWithTimezone(dateString) {
  console.log(`\n📅 Testing ${dateString} (UTC Logic):`);
  
  // Parse date as UTC to avoid timezone issues
  const targetDate = new Date(dateString + 'T00:00:00.000Z');
  const startOfDay = new Date(targetDate);
  const endOfDay = new Date(targetDate);
  endOfDay.setUTCHours(23, 59, 59, 999);
  
  console.log(`   Input: ${dateString}`);
  console.log(`   Start (UTC): ${startOfDay.toISOString()}`);
  console.log(`   End (UTC): ${endOfDay.toISOString()}`);
  
  const orders = await Order.find({
    scheduledDate: {
      $gte: startOfDay,
      $lte: endOfDay
    },
    isScheduledOrder: true
  });
  
  console.log(`   Results: ${orders.length} orders`);
}

// Handle script termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Debug interrupted');
  await mongoose.connection.close();
  process.exit(0);
});

// Run the debug
debugDateIssue();
