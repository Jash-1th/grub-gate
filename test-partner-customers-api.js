// Test Partner Portal Customers API
const axios = require('axios');

const API_BASE_URL = 'https://gg0b1.netlify.app/api/v1';

async function testPartnerCustomersAPI() {
  console.log('🧪 Testing Partner Portal Customers API...\n');

  try {
    // Test 1: Check if admin routes are accessible
    console.log('1. Testing admin/my-customers endpoint...');
    
    // This should return 401 without auth token
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/my-customers`);
      console.log('❌ Expected 401 but got:', response.status);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly returns 401 without auth token');
      } else {
        console.log('❌ Unexpected error:', error.response?.status, error.response?.data);
      }
    }

    // Test 2: Check if the route exists (should not be 404)
    console.log('\n2. Testing route existence...');
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/my-customers`, {
        headers: {
          'Authorization': 'Bearer invalid-token'
        }
      });
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Route exists - returns 401 for invalid token (not 404)');
      } else if (error.response?.status === 404) {
        console.log('❌ Route not found - 404 error');
        console.log('Response:', error.response?.data);
      } else {
        console.log('🔍 Other error:', error.response?.status, error.response?.data);
      }
    }

    // Test 3: Check backend health
    console.log('\n3. Testing backend health...');
    try {
      const response = await axios.get(`${API_BASE_URL}/health`);
      console.log('✅ Backend is healthy:', response.data);
    } catch (error) {
      console.log('❌ Backend health check failed:', error.response?.status, error.response?.data);
    }

    // Test 4: Check available routes
    console.log('\n4. Testing available routes...');
    try {
      // Try a known working route
      const response = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': 'Bearer invalid-token'
        }
      });
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Auth routes are working');
      } else if (error.response?.status === 404) {
        console.log('❌ Auth routes not found');
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testPartnerCustomersAPI().then(() => {
  console.log('\n🏁 Test completed');
}).catch(console.error);
