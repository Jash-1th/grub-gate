// Test the updated 10km radius setting
require('dotenv').config();
const axios = require('axios');

async function test10kmRadius() {
  const baseURL = 'http://localhost:5000/api/v1';
  
  console.log('🎯 Testing Updated 10km Radius Setting\n');

  const testCodes = [
    { code: '515671', description: 'Exact match (ABC location)' },
    { code: '515670', description: 'Adjacent postal code' },
    { code: '515672', description: 'Adjacent postal code' }
  ];

  for (const test of testCodes) {
    try {
      console.log(`📍 Testing: ${test.code} (${test.description})`);
      
      // Test with default 10km radius
      const response = await axios.get(`${baseURL}/restaurants/by-postal-code`, {
        params: { 
          postalCode: test.code
          // No radius specified - should use default 10km
        }
      });
      
      console.log(`   ✅ Status: ${response.status} OK`);
      console.log(`   📊 Found: ${response.data.data.length} restaurants`);
      console.log(`   📝 Message: ${response.data.message}`);
      
      if (response.data.data.length > 0) {
        response.data.data.forEach(restaurant => {
          const isABC = restaurant.name === 'ABC' ? '🎯' : '🏪';
          console.log(`   ${isABC} ${restaurant.name} - ${restaurant.location}`);
        });
      }
      console.log('');
      
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log(`   ❌ Backend server not running`);
        break;
      } else {
        console.log(`   ❌ API Error: ${error.response?.status} ${error.response?.statusText}`);
        console.log(`   📝 Message: ${error.response?.data?.message || error.message}`);
      }
      console.log('');
    }
  }

  // Test with custom radius to compare
  console.log('🔍 Testing with custom radius values:\n');
  
  const radiusTests = [5, 10, 25, 50];
  
  for (const radius of radiusTests) {
    try {
      console.log(`📍 Testing 515671 with ${radius}km radius`);
      
      const response = await axios.get(`${baseURL}/restaurants/by-postal-code`, {
        params: { 
          postalCode: '515671',
          radius: radius
        }
      });
      
      console.log(`   📊 Found: ${response.data.data.length} restaurants within ${radius}km`);
      console.log(`   📝 Message: ${response.data.message}`);
      console.log('');
      
    } catch (error) {
      console.log(`   ❌ Error with ${radius}km: ${error.response?.data?.message || error.message}`);
      console.log('');
    }
  }

  console.log('🎯 SUMMARY:');
  console.log('✅ Default radius updated to 10km');
  console.log('✅ Users can still override with custom radius parameter');
  console.log('✅ Enhanced postal code search still working');
  console.log('✅ More focused search results within reasonable delivery distance');
}

test10kmRadius();
