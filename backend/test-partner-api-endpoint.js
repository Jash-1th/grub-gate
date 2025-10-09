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

async function testPartnerAPIEndpoint() {
  try {
    console.log('🧪 TESTING PARTNER API ENDPOINT LOGIC');
    console.log('====================================');

    const restaurantId = '68e73d168c18e7fd776a6327';

    // Test the exact query that the partner API endpoint would use
    const testDates = [
      { date: '2025-10-11', label: 'Oct 11 (Saturday)' },
      { date: '2025-10-12', label: 'Oct 12 (Sunday)' },
      { date: '2025-10-13', label: 'Oct 13 (Monday)' },
      { date: '2025-10-18', label: 'Oct 18 (Saturday)' },
      { date: '2025-10-19', label: 'Oct 19 (Sunday)' }
    ];

    for (const { date, label } of testDates) {
      console.log(`\n📅 Testing ${label} (${date}):`);
      
      // Simulate the exact query from getOrdersByDateRange
      const query = {
        restaurantId: restaurantId,
        scheduledDate: {
          $gte: new Date(date),
          $lte: new Date(date)
        }
      };

      console.log('Query:', JSON.stringify(query, null, 2));
      console.log('Date range:', {
        start: new Date(date).toISOString(),
        end: new Date(date).toISOString()
      });

      const orders = await Order.find(query)
        .populate('customerId', 'firstName lastName email phone')
        .sort({ scheduledDate: -1 });

      console.log(`Found ${orders.length} orders`);
      
      if (orders.length > 0) {
        orders.forEach((order, index) => {
          console.log(`  ${index + 1}. ${order._id}:`);
          console.log(`     Scheduled: ${order.scheduledDate ? order.scheduledDate.toDateString() : 'NO DATE'}`);
          console.log(`     Status: ${order.status}`);
          console.log(`     Item: ${order.items[0]?.name}`);
          console.log(`     Customer: ${order.customerId?.firstName} ${order.customerId?.lastName}`);
        });
      }
    }

    console.log('\n🎯 EXPECTED RESULTS:');
    console.log('Oct 11: 0 orders (before subscription)');
    console.log('Oct 12: 1 order (mutton fry lunch)');
    console.log('Oct 13: 0 orders (no meals scheduled)');
    console.log('Oct 18: 1 order (chiceknn lunch)');
    console.log('Oct 19: 1 order (fish fry lunch)');

    console.log('\n🔧 DEBUGGING TIPS:');
    console.log('1. Check browser console for frontend logs');
    console.log('2. Check server logs for backend API calls');
    console.log('3. Verify the partner is authenticated correctly');
    console.log('4. Ensure the restaurant ID matches in the database');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

testPartnerAPIEndpoint();
