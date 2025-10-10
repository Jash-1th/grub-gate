// FILE: scripts/verify-order-dates.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const Order = require('../src/models/Order');

/**
 * Verify order dates are correctly aligned
 */
async function verifyOrderDates() {
  try {
    console.log('🔍 VERIFYING ORDER DATES');
    console.log('=' .repeat(50));
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    
    // Get recent orders
    const orders = await Order.find({
      customerId: '68e7578c70b1ebbce509b69c',
      isScheduledOrder: true
    })
    .sort({ scheduledDate: 1 })
    .limit(10);
    
    console.log(`\n📊 Found ${orders.length} orders to verify:`);
    console.log('-' .repeat(50));
    
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
      
      console.log(`\n${index + 1}. Order: ${order.orderNumber}`);
      console.log(`   Meal: ${order.mealType}`);
      console.log(`   Scheduled Date: ${scheduledDateStr}`);
      console.log(`   Delivery Time:  ${deliveryDateStr}`);
      console.log(`   Same Day: ${sameDay ? '✅' : '❌'}`);
      
      if (!sameDay) {
        console.log(`   ⚠️  DATE MISMATCH: Scheduled ${scheduledDay} vs Delivery ${deliveryDay}`);
      }
      
      // Check delivery time correctness
      const deliveryHour = deliveryDate.getUTCHours();
      const expectedHour = order.mealType === 'lunch' ? 7 : 14; // UTC hours
      const correctTime = deliveryHour === expectedHour;
      
      console.log(`   Delivery Hour (UTC): ${deliveryHour} (expected: ${expectedHour}) ${correctTime ? '✅' : '❌'}`);
      
      if (!correctTime) {
        console.log(`   ⚠️  TIME MISMATCH: Got ${deliveryHour}:00 UTC, expected ${expectedHour}:00 UTC`);
      }
    });
    
    // Summary
    const sameDayCount = orders.filter(order => {
      const scheduledDay = new Date(order.scheduledDate).toISOString().split('T')[0];
      const deliveryDay = new Date(order.deliveryTime.estimated).toISOString().split('T')[0];
      return scheduledDay === deliveryDay;
    }).length;
    
    console.log('\n📈 SUMMARY:');
    console.log(`   Total Orders: ${orders.length}`);
    console.log(`   Same Day: ${sameDayCount}/${orders.length} ${sameDayCount === orders.length ? '✅' : '❌'}`);
    console.log(`   Date Mismatches: ${orders.length - sameDayCount}`);
    
    if (sameDayCount === orders.length) {
      console.log('\n🎉 ALL DATES ARE CORRECTLY ALIGNED!');
    } else {
      console.log('\n💥 DATE ALIGNMENT ISSUES FOUND!');
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
verifyOrderDates();
