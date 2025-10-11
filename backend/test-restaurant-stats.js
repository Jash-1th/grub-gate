// Test script for restaurant stats endpoint
const axios = require('axios');

const testRestaurantStats = async () => {
  try {
    console.log('🧪 Testing restaurant stats endpoint...');
    
    const response = await axios.get('http://localhost:5000/api/v1/restaurants/stats');
    
    console.log('✅ Success! Response:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
    // Validate response structure
    const data = response.data.data;
    if (data.totalRestaurants !== undefined) {
      console.log(`📊 Total Restaurants: ${data.totalRestaurants}`);
    }
    if (data.totalMenuItems !== undefined) {
      console.log(`🍽️  Total Menu Items: ${data.totalMenuItems}`);
    }
    if (data.averageRating !== undefined) {
      console.log(`⭐ Average Rating: ${data.averageRating}`);
    }
    
  } catch (error) {
    console.error('❌ Error testing endpoint:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.message || error.message);
    console.error('Full error:', error.response?.data || error.message);
  }
};

// Run the test
testRestaurantStats();
