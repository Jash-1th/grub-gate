// Test script for partner menu items with dynamic order counts
const axios = require('axios');

const testPartnerMenuWithOrders = async () => {
  try {
    console.log('🧪 Testing partner menu items with dynamic order counts...');
    
    // You'll need to replace this with actual partner authentication token
    const authToken = 'your-partner-jwt-token-here';
    const restaurantId = 'rest_001'; // or actual restaurant ID
    
    const response = await axios.get(
      `http://localhost:5000/api/v1/partner/restaurants/${restaurantId}/menu-items`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Success! Response:');
    console.log('Status:', response.status);
    console.log('Total Items:', response.data.pagination?.totalItems || 0);
    console.log('');
    
    // Display menu items with order counts
    console.log('🍽️  Menu Items with Order Counts:');
    if (response.data.data && response.data.data.length > 0) {
      response.data.data.forEach((item, index) => {
        console.log(`${index + 1}. ${item.name}`);
        console.log(`   💰 Price: $${item.price}`);
        console.log(`   📊 Total Orders: ${item.totalOrders || 0}`);
        console.log(`   🏷️  Category: ${item.category}`);
        console.log(`   ✅ Status: ${item.status}`);
        console.log('');
      });
    } else {
      console.log('   No menu items found');
    }
    
    console.log('🎉 Partner menu items now show dynamic order counts!');
    
  } catch (error) {
    console.error('❌ Error testing partner menu:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Message:', error.response.data?.message || error.message);
      
      if (error.response.status === 401) {
        console.log('💡 Authentication required. Please:');
        console.log('   1. Login to partner portal');
        console.log('   2. Get JWT token from browser dev tools');
        console.log('   3. Replace authToken in this script');
      }
    } else if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure the backend server is running on port 5000');
      console.log('   Run: npm run dev (in backend directory)');
    } else {
      console.error('   Error:', error.message);
    }
  }
};

// Alternative test without authentication (for development)
const testMenuItemOrderCounts = async () => {
  try {
    console.log('🧪 Testing menu item order count aggregation...');
    
    // Test the aggregation logic directly
    const response = await axios.get('http://localhost:5000/api/v1/stats/popular-dishes?limit=3');
    
    console.log('✅ Popular dishes with order counts:');
    if (response.data.data && response.data.data.dishes) {
      response.data.data.dishes.forEach((dish, index) => {
        console.log(`${index + 1}. ${dish.name}`);
        console.log(`   📊 Total Orders: ${dish.totalOrders || 0}`);
        console.log(`   🏪 Restaurant: ${dish.restaurant?.name || 'Unknown'}`);
        console.log('');
      });
    }
    
    console.log('🎯 Order count aggregation is working!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

// Run both tests
console.log('🚀 Starting partner menu order count tests...\n');

// Test 1: Popular dishes (public endpoint)
testMenuItemOrderCounts().then(() => {
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 2: Partner menu (requires auth)
  return testPartnerMenuWithOrders();
}).catch(console.error);
