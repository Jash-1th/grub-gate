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

async function fixTimezoneIssue() {
  try {
    console.log('🕐 FIXING TIMEZONE ISSUE');
    console.log('========================');

    const restaurantId = '68e73d168c18e7fd776a6327';

    // Get all orders for this restaurant
    const allOrders = await Order.find({ restaurantId }).sort({ scheduledDate: 1 });
    
    console.log(`Found ${allOrders.length} orders for restaurant ${restaurantId}`);
    
    // The correct dates should be:
    const correctDates = [
      { orderId: '68e7f07edac07519a5c7858c', correctDate: '2025-10-12', item: 'mutton fry' },
      { orderId: '68e7f07edac07519a5c7858d', correctDate: '2025-10-18', item: 'chiceknn' },
      { orderId: '68e7f07edac07519a5c7858e', correctDate: '2025-10-19', item: 'fish fry' }
    ];

    console.log('\n🔧 UPDATING ORDER DATES:');
    
    for (const { orderId, correctDate, item } of correctDates) {
      const order = await Order.findById(orderId);
      if (order) {
        // Create date in UTC at start of day
        const newDate = new Date(correctDate + 'T00:00:00.000Z');
        
        console.log(`\n📅 Order ${orderId} (${item}):`);
        console.log(`   Old: ${order.scheduledDate.toISOString()} (${order.scheduledDate.toDateString()})`);
        console.log(`   New: ${newDate.toISOString()} (${newDate.toDateString()})`);
        
        order.scheduledDate = newDate;
        order.activationDate = newDate;
        order.status = 'pending'; // Ensure it's pending for partner visibility
        
        await order.save();
        console.log(`   ✅ Updated successfully`);
      }
    }

    console.log('\n🧪 VERIFICATION:');
    const updatedOrders = await Order.find({ restaurantId }).sort({ scheduledDate: 1 });
    
    updatedOrders.forEach((order, index) => {
      console.log(`${index + 1}. ${order.items[0]?.name}: ${order.scheduledDate.toISOString()} (${order.scheduledDate.toDateString()})`);
    });

    console.log('\n🎯 TESTING DATE QUERIES:');
    const testDates = [
      '2025-10-11',
      '2025-10-12', 
      '2025-10-18',
      '2025-10-19'
    ];

    for (const testDate of testDates) {
      const startOfDay = new Date(testDate + 'T00:00:00.000Z');
      const endOfDay = new Date(testDate + 'T23:59:59.999Z');
      
      const ordersForDate = await Order.find({
        restaurantId,
        scheduledDate: {
          $gte: startOfDay,
          $lte: endOfDay
        }
      });
      
      console.log(`${testDate}: ${ordersForDate.length} orders`);
      if (ordersForDate.length > 0) {
        ordersForDate.forEach(order => {
          console.log(`  - ${order.items[0]?.name} (${order.mealType})`);
        });
      }
    }

    console.log('\n✅ TIMEZONE FIX COMPLETE!');
    console.log('Expected results:');
    console.log('- Oct 11: 0 orders ✅');
    console.log('- Oct 12: 1 order (mutton fry) ✅');
    console.log('- Oct 18: 1 order (chiceknn) ✅');
    console.log('- Oct 19: 1 order (fish fry) ✅');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixTimezoneIssue();
