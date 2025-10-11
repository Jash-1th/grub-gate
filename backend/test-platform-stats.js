// Test script for all platform statistics endpoints
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/v1';

const testAllStatsEndpoints = async () => {
  console.log('🧪 Testing all statistics endpoints...\n');
  
  try {
    // Test 1: Platform Stats (new comprehensive endpoint)
    console.log('1️⃣ Testing /stats/platform endpoint...');
    const platformResponse = await axios.get(`${BASE_URL}/stats/platform`);
    console.log('✅ Platform Stats Success!');
    console.log('📊 Total Customers:', platformResponse.data.data.totalCustomers);
    console.log('🏪 Total Restaurants:', platformResponse.data.data.totalRestaurants);
    console.log('🍽️  Total Orders (Meals Served):', platformResponse.data.data.totalOrders);
    console.log('📈 Data Source:', platformResponse.data.data.dataSource);
    console.log('');
    
    // Test 2: Restaurant Stats (existing endpoint via new route)
    console.log('2️⃣ Testing /stats/restaurants endpoint...');
    const restaurantResponse = await axios.get(`${BASE_URL}/stats/restaurants`);
    console.log('✅ Restaurant Stats Success!');
    console.log('🏪 Total Restaurants:', restaurantResponse.data.data.totalRestaurants);
    console.log('🍽️  Total Menu Items:', restaurantResponse.data.data.totalMenuItems);
    console.log('⭐ Average Rating:', restaurantResponse.data.data.averageRating);
    console.log('');
    
    // Test 3: Original restaurant stats endpoint (should still work)
    console.log('3️⃣ Testing /restaurants/stats endpoint (original)...');
    const originalResponse = await axios.get(`${BASE_URL}/restaurants/stats`);
    console.log('✅ Original Restaurant Stats Success!');
    console.log('🏪 Total Restaurants:', originalResponse.data.data.totalRestaurants);
    console.log('');
    
    // Summary
    console.log('🎉 ALL ENDPOINTS WORKING CORRECTLY!');
    console.log('');
    console.log('📋 Summary for Homepage:');
    console.log(`   • Happy Customers: ${platformResponse.data.data.totalCustomers.toLocaleString()}`);
    console.log(`   • Partner Restaurants: ${platformResponse.data.data.totalRestaurants.toLocaleString()}`);
    console.log(`   • Meals Served: ${platformResponse.data.data.totalOrders.toLocaleString()}`);
    console.log('');
    console.log('🚀 Ready for frontend integration!');
    
  } catch (error) {
    console.error('❌ Error testing endpoints:');
    console.error('Endpoint:', error.config?.url);
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.message || error.message);
    console.error('');
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure the backend server is running on port 5000');
      console.log('   Run: npm run dev (in backend directory)');
    }
  }
};

// Run the comprehensive test
testAllStatsEndpoints();
