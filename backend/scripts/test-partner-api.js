// FILE: scripts/test-partner-api.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const { getTodaysOrders } = require('../src/controllers/partner/orders.controller');

/**
 * Test partner API directly
 */
async function testPartnerAPI() {
  try {
    console.log('🧪 TESTING PARTNER API');
    console.log('=' .repeat(50));
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    
    // Mock request object
    const mockReq = {
      user: {
        id: '68e73d158c18e7fd776a6325' // Partner ID
      }
    };
    
    // Mock response object
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
    
    console.log('🔄 Testing getTodaysOrders API...');
    
    // Call the API function
    await getTodaysOrders(mockReq, mockRes);
    
    console.log('\n📊 API Response:');
    console.log('Status Code:', apiResponse.statusCode || 200);
    console.log('Response:', JSON.stringify(apiResponse, null, 2));
    
    if (apiResponse.status === 'success') {
      console.log('\n✅ API SUCCESS!');
      console.log(`Restaurant: ${apiResponse.data.restaurant.name}`);
      console.log(`Date: ${apiResponse.data.date}`);
      console.log(`Total Orders: ${apiResponse.data.totalOrders}`);
      
      if (apiResponse.data.totalOrders > 0) {
        console.log('\n📋 Orders:');
        apiResponse.data.orders.forEach((order, index) => {
          console.log(`${index + 1}. ${order.orderNumber} - ${order.mealType} (${order.status})`);
        });
      } else {
        console.log('\nℹ️ No orders for today (expected - orders are for future dates)');
      }
    } else {
      console.log('\n❌ API FAILED!');
      console.log('Error:', apiResponse.message);
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the test
testPartnerAPI();
