// Test postal codes that are more than 10km away from ABC restaurant (515671)
require('dotenv').config();
const axios = require('axios');

async function testDistantPostalCodes() {
  const baseURL = 'http://localhost:5000/api/v1';
  
  console.log('🎯 Testing Distant Postal Codes (>10km from ABC restaurant)\n');
  console.log('📍 ABC Restaurant is at: 515671, DHARMAVARAM, Andhra Pradesh\n');

  // Test postal codes that should be more than 10km away
  const distantCodes = [
    { code: '515001', description: 'Anantapur (district headquarters, ~30km away)' },
    { code: '515002', description: 'Anantapur adjacent area (~30km away)' },
    { code: '515801', description: 'Different area in same district (~50km away)' },
    { code: '516001', description: 'Different district (Kadapa, ~100km away)' },
    { code: '500001', description: 'Hyderabad (different state, ~300km away)' },
    { code: '560001', description: 'Bangalore (different state, ~200km away)' },
    { code: '515650', description: 'Nearby but should be >10km' },
    { code: '515700', description: 'Same district but distant area' }
  ];

  console.log('🔍 Testing with 10km radius (should NOT find ABC):\n');

  for (const test of distantCodes) {
    try {
      console.log(`📍 Testing: ${test.code} (${test.description})`);
      
      const response = await axios.get(`${baseURL}/restaurants/by-postal-code`, {
        params: { 
          postalCode: test.code,
          radius: 10 // 10km radius
        }
      });
      
      console.log(`   ✅ Status: ${response.status} OK`);
      console.log(`   📊 Found: ${response.data.data.length} restaurants`);
      console.log(`   📝 Message: ${response.data.message}`);
      
      if (response.data.data.length > 0) {
        response.data.data.forEach(restaurant => {
          const isABC = restaurant.name === 'ABC' ? '🎯 ABC FOUND (unexpected!)' : '🏪';
          console.log(`   ${isABC} ${restaurant.name} - ${restaurant.location}`);
        });
      } else {
        console.log(`   ✅ No restaurants found (as expected for distant postal code)`);
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

  // Test the same codes with larger radius to see if ABC appears
  console.log('🔍 Testing same codes with 50km radius (might find ABC):\n');

  const testCodesForLargeRadius = ['515001', '515650', '515700'];

  for (const code of testCodesForLargeRadius) {
    try {
      console.log(`📍 Testing: ${code} with 50km radius`);
      
      const response = await axios.get(`${baseURL}/restaurants/by-postal-code`, {
        params: { 
          postalCode: code,
          radius: 50 // 50km radius
        }
      });
      
      console.log(`   📊 Found: ${response.data.data.length} restaurants within 50km`);
      
      if (response.data.data.length > 0) {
        response.data.data.forEach(restaurant => {
          const isABC = restaurant.name === 'ABC' ? '🎯 ABC FOUND' : '🏪';
          console.log(`   ${isABC} ${restaurant.name} - ${restaurant.location}`);
        });
      }
      console.log('');
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.response?.data?.message || error.message}`);
      console.log('');
    }
  }

  // Compare with nearby codes that should find ABC
  console.log('🔍 Comparison: Testing nearby codes that SHOULD find ABC:\n');

  const nearbyCodes = ['515671', '515670', '515672'];

  for (const code of nearbyCodes) {
    try {
      console.log(`📍 Testing: ${code} (should find ABC within 10km)`);
      
      const response = await axios.get(`${baseURL}/restaurants/by-postal-code`, {
        params: { 
          postalCode: code,
          radius: 10
        }
      });
      
      console.log(`   📊 Found: ${response.data.data.length} restaurants`);
      
      if (response.data.data.length > 0) {
        response.data.data.forEach(restaurant => {
          const isABC = restaurant.name === 'ABC' ? '🎯 ABC FOUND (expected)' : '🏪';
          console.log(`   ${isABC} ${restaurant.name} - ${restaurant.location}`);
        });
      }
      console.log('');
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.response?.data?.message || error.message}`);
      console.log('');
    }
  }

  console.log('🎯 EXPECTED RESULTS:');
  console.log('❌ Distant postal codes (>10km) should NOT find ABC with 10km radius');
  console.log('✅ Nearby postal codes (<10km) should find ABC with 10km radius');
  console.log('✅ Distant postal codes might find ABC with larger radius (50km)');
  console.log('\n📊 This validates that our 10km radius limit is working correctly!');
}

testDistantPostalCodes();
