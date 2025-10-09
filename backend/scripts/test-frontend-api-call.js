// FILE: scripts/test-frontend-api-call.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const { getOrdersByDateRange } = require('../src/controllers/partner/orders.controller');

/**
 * Test the exact API call the frontend makes after our fix
 */
async function testFrontendAPICall() {
  try {
    console.log('🧪 TESTING FRONTEND API CALL SIMULATION');
    console.log('=' .repeat(60));
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    
    const partnerId = '68e73d158c18e7fd776a6325';
    
    // Simulate what the frontend will send after our fix
    // Frontend: { date: '2025-10-18' }
    // Transformed to: { startDate: '2025-10-18', endDate: '2025-10-18' }
    
    console.log('\n📅 TESTING: Frontend selects Oct 18, 2025');
    console.log('-' .repeat(40));
    
    const mockReq = {
      user: { id: partnerId },
      query: {
        startDate: '2025-10-18',
        endDate: '2025-10-18',
        includeScheduled: 'true'
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
    
    console.log('🔄 Calling getOrdersByDateRange...');
    console.log(`   Parameters: startDate=${mockReq.query.startDate}, endDate=${mockReq.query.endDate}`);
    
    await getOrdersByDateRange(mockReq, mockRes);
    
    console.log('\n📊 API Response:');
    console.log(`   Status: ${apiResponse.statusCode || 200}`);
    console.log(`   Success: ${apiResponse.status === 'success' ? '✅' : '❌'}`);
    
    if (apiResponse.status === 'success') {
      const orders = apiResponse.data.orders || [];
      console.log(`   Total Orders: ${orders.length}`);
      
      if (orders.length > 0) {
        console.log('\n📋 Orders Found:');
        orders.forEach((order, index) => {
          const scheduledDate = new Date(order.scheduledDate);
          const deliveryDate = new Date(order.deliveryTime.estimated);
          
          console.log(`   ${index + 1}. ${order.orderNumber}`);
          console.log(`      Scheduled: ${scheduledDate.toDateString()}`);
          console.log(`      Delivery: ${deliveryDate.toDateString()}`);
          console.log(`      Meal: ${order.mealType}`);
          console.log(`      Status: ${order.status}`);
          
          // Check if dates match what frontend expects
          const expectedDate = '2025-10-18';
          const actualScheduledDate = scheduledDate.toISOString().split('T')[0];
          const actualDeliveryDate = deliveryDate.toISOString().split('T')[0];
          
          console.log(`      Expected Date: ${expectedDate}`);
          console.log(`      Actual Scheduled: ${actualScheduledDate} ${actualScheduledDate === expectedDate ? '✅' : '❌'}`);
          console.log(`      Actual Delivery: ${actualDeliveryDate} ${actualDeliveryDate === expectedDate ? '✅' : '❌'}`);
          console.log('');
        });
        
        // Check if all orders are for the correct date
        const correctDateCount = orders.filter(order => {
          const scheduledDate = new Date(order.scheduledDate).toISOString().split('T')[0];
          return scheduledDate === '2025-10-18';
        }).length;
        
        console.log(`📈 SUMMARY:`);
        console.log(`   Orders for correct date: ${correctDateCount}/${orders.length} ${correctDateCount === orders.length ? '✅' : '❌'}`);
        
        if (correctDateCount === orders.length) {
          console.log('\n🎉 SUCCESS! Frontend should now show Oct 18 orders on Oct 18!');
        } else {
          console.log('\n💥 ISSUE: Some orders have wrong dates!');
        }
      } else {
        console.log('\n⚠️  No orders found for Oct 18');
        console.log('   This might be because:');
        console.log('   1. Orders haven\'t been activated yet');
        console.log('   2. Orders are in "scheduled" status (try activating them)');
      }
    } else {
      console.log('\n❌ API Error:');
      console.log(`   Message: ${apiResponse.message}`);
    }
    
    // Test with different dates
    console.log('\n📅 TESTING: Other dates with orders');
    console.log('-' .repeat(40));
    
    const testDates = ['2025-10-19', '2025-10-20', '2025-11-01'];
    
    for (const testDate of testDates) {
      mockReq.query.startDate = testDate;
      mockReq.query.endDate = testDate;
      
      apiResponse = null;
      await getOrdersByDateRange(mockReq, mockRes);
      
      const orderCount = apiResponse.data?.orders?.length || 0;
      console.log(`   ${testDate}: ${orderCount} orders`);
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
testFrontendAPICall();
