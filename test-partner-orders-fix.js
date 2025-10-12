// Test Partner Portal Orders API Fix
const axios = require('axios');

const API_BASE_URL = 'https://gg0b1.netlify.app/api/v1';

async function testPartnerOrdersAPI() {
  console.log('🧪 Testing Partner Portal Orders API Fix...\n');

  try {
    // Test 1: Check if partner orders endpoint exists
    console.log('1. Testing partner orders endpoint existence...');
    
    try {
      const response = await axios.get(`${API_BASE_URL}/partner/orders`, {
        params: {
          startDate: '2024-10-12',
          endDate: '2024-10-12'
        },
        headers: {
          'Authorization': 'Bearer invalid-token'
        }
      });
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Partner orders endpoint exists - returns 401 for invalid token (not 404)');
      } else if (error.response?.status === 404) {
        console.log('❌ Partner orders endpoint not found - 404 error');
        console.log('Response:', error.response?.data);
      } else {
        console.log('🔍 Other error:', error.response?.status, error.response?.data);
      }
    }

    // Test 2: Check if generic orders endpoint still exists (should not be used by partner portal)
    console.log('\n2. Testing generic orders endpoint...');
    try {
      const response = await axios.get(`${API_BASE_URL}/orders`, {
        headers: {
          'Authorization': 'Bearer invalid-token'
        }
      });
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Generic orders endpoint exists but requires auth');
      } else if (error.response?.status === 404) {
        console.log('ℹ️ Generic orders endpoint not found - this is expected');
      } else {
        console.log('🔍 Other error:', error.response?.status, error.response?.data);
      }
    }

    // Test 3: Check partner orders analytics endpoint
    console.log('\n3. Testing partner orders analytics endpoint...');
    try {
      const response = await axios.get(`${API_BASE_URL}/partner/orders/analytics`, {
        headers: {
          'Authorization': 'Bearer invalid-token'
        }
      });
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Partner orders analytics endpoint exists - returns 401 for invalid token');
      } else if (error.response?.status === 404) {
        console.log('❌ Partner orders analytics endpoint not found - 404 error');
      } else {
        console.log('🔍 Other error:', error.response?.status, error.response?.data);
      }
    }

    // Test 4: Check partner orders today endpoint
    console.log('\n4. Testing partner orders today endpoint...');
    try {
      const response = await axios.get(`${API_BASE_URL}/partner/orders/today`, {
        headers: {
          'Authorization': 'Bearer invalid-token'
        }
      });
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Partner orders today endpoint exists - returns 401 for invalid token');
      } else if (error.response?.status === 404) {
        console.log('❌ Partner orders today endpoint not found - 404 error');
      } else {
        console.log('🔍 Other error:', error.response?.status, error.response?.data);
      }
    }

    // Test 5: Check partner order status update endpoint
    console.log('\n5. Testing partner order status update endpoint...');
    try {
      const response = await axios.put(`${API_BASE_URL}/partner/orders/507f1f77bcf86cd799439011/status`, {
        status: 'confirmed'
      }, {
        headers: {
          'Authorization': 'Bearer invalid-token',
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Partner order status update endpoint exists - returns 401 for invalid token');
      } else if (error.response?.status === 404) {
        console.log('❌ Partner order status update endpoint not found - 404 error');
      } else {
        console.log('🔍 Other error:', error.response?.status, error.response?.data);
      }
    }

    console.log('\n📋 Summary:');
    console.log('The Partner Portal should now use these restaurant-specific endpoints:');
    console.log('- GET /api/v1/partner/orders (with date filters)');
    console.log('- GET /api/v1/partner/orders/:orderId');
    console.log('- PUT /api/v1/partner/orders/:orderId/status');
    console.log('- GET /api/v1/partner/orders/analytics');
    console.log('- GET /api/v1/partner/orders/today');
    console.log('\nThese endpoints automatically filter orders by the partner\'s restaurant.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testPartnerOrdersAPI().then(() => {
  console.log('\n🏁 Test completed');
}).catch(console.error);
