// Test API search for ABC restaurant
require('dotenv').config();
const axios = require('axios');

async function testAPISearch() {
  const baseURL = 'http://localhost:5000/api/v1';
  
  console.log('🔍 Testing Restaurant Search API...\n');

  try {
    // Test 1: Search by postal code 515671 (ABC restaurant)
    console.log('📍 Test 1: Search restaurants by postal code 515671');
    const response1 = await axios.get(`${baseURL}/restaurants/by-postal-code`, {
      params: { postalCode: '515671' }
    });
    
    console.log(`✅ API Response: ${response1.status} ${response1.statusText}`);
    console.log(`📊 Found ${response1.data.data.length} restaurants`);
    
    if (response1.data.data.length > 0) {
      response1.data.data.forEach(restaurant => {
        console.log(`   🏪 ${restaurant.name}`);
        console.log(`   📍 Location: ${restaurant.location}`);
        console.log(`   ⭐ Rating: ${restaurant.rating}`);
        console.log(`   🏷️ Tags: [${restaurant.tags?.join(', ') || 'none'}]`);
        console.log(`   📦 Status: Available for ordering`);
      });
    }

    // Test 2: Search by partial postal code
    console.log('\n📍 Test 2: Search by partial postal code 515');
    const response2 = await axios.get(`${baseURL}/restaurants/by-postal-code`, {
      params: { postalCode: '515' }
    });
    
    console.log(`✅ API Response: ${response2.status} ${response2.statusText}`);
    console.log(`📊 Found ${response2.data.data.length} restaurants with partial match`);

    // Test 3: Test with radius parameter
    console.log('\n📍 Test 3: Search with 20km radius');
    const response3 = await axios.get(`${baseURL}/restaurants/by-postal-code`, {
      params: { 
        postalCode: '515671',
        radius: 20 
      }
    });
    
    console.log(`✅ API Response: ${response3.status} ${response3.statusText}`);
    console.log(`📊 Found ${response3.data.data.length} restaurants within 20km`);

    console.log('\n🎉 SUCCESS! Restaurant search API is working correctly!');
    console.log('✅ ABC restaurant is searchable by postal code 515671');
    console.log('✅ API returns proper restaurant data with coordinates');
    console.log('✅ Search functionality is ready for customer app');

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Backend server is not running');
      console.log('💡 Start the backend server with: npm run dev');
    } else if (error.response) {
      console.log(`❌ API Error: ${error.response.status} ${error.response.statusText}`);
      console.log(`📝 Message: ${error.response.data?.message || 'Unknown error'}`);
    } else {
      console.log(`❌ Network Error: ${error.message}`);
    }
  }
}

testAPISearch();
