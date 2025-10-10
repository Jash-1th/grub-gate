// FILE: scripts/test-ui-api-calls.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const { getOrdersByDateRange } = require('../src/controllers/partner/orders.controller');

/**
 * Test the exact API calls the UI should make
 */
async function testUIAPICalls() {
  try {
    console.log('🧪 TESTING EXACT UI API CALLS');
    console.log('=' .repeat(50));
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    
    const partnerId = '68e73d158c18e7fd776a6325';
    
    // Test different date ranges the UI might use
    const testCases = [
      {
        name: 'Next 7 Days (Current UI)',
        startDate: '2025-10-09',
        endDate: '2025-10-16'
      },
      {
        name: 'Next 14 Days (Extended)',
        startDate: '2025-10-09', 
        endDate: '2025-10-23'
      },
      {
        name: 'This Month',
        startDate: '2025-10-01',
        endDate: '2025-10-31'
      },
      {
        name: 'Where Orders Actually Are',
        startDate: '2025-10-18',
        endDate: '2025-11-05'
      }
    ];
    
    for (const testCase of testCases) {
      console.log(`\n📅 ${testCase.name}`);
      console.log(`   Range: ${testCase.startDate} to ${testCase.endDate}`);
      console.log('-' .repeat(40));
      
      const mockReq = {
        user: { id: partnerId },
        query: {
          startDate: testCase.startDate,
          endDate: testCase.endDate
        }
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
      
      await getOrdersByDateRange(mockReq, mockRes);
      
      const orders = apiResponse.data?.orders || [];
      console.log(`   📊 Total Orders: ${orders.length}`);
      
      if (orders.length > 0) {
        console.log('   📋 Orders:');
        orders.forEach((order, index) => {
          const date = new Date(order.scheduledDate).toDateString();
          console.log(`      ${index + 1}. ${date} - ${order.mealType} (${order.status})`);
        });
      } else {
        console.log('   ❌ No orders in this range');
      }
    }
    
    // Recommendation
    console.log('\n🎯 RECOMMENDATIONS FOR UI:');
    console.log('-' .repeat(40));
    console.log('1. 📅 **Change Default Date Range**:');
    console.log('   - Current: Next 7 days (shows 0 orders)');
    console.log('   - Better: Next 14 days (shows 3+ orders)');
    console.log('   - Best: Next 30 days (shows all orders)');
    console.log('');
    console.log('2. 🔧 **UI Configuration Options**:');
    console.log('   - Add date range picker');
    console.log('   - Add "All upcoming orders" view');
    console.log('   - Default to longer time range');
    console.log('');
    console.log('3. 🧪 **Test URLs to Try**:');
    console.log('   - /orders?startDate=2025-10-18&endDate=2025-11-05');
    console.log('   - /orders?range=30days');
    console.log('   - /orders (should show all upcoming)');
    
  } catch (error) {
    console.error('💥 Test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the test
testUIAPICalls();
