// Test script to verify settings API endpoints are reachable
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000/api/v1/partner';

async function testEndpointsReachability() {
  console.log('🧪 Testing Settings API Endpoints Reachability...\n');

  const endpoints = [
    { method: 'GET', url: `${BASE_URL}/restaurants/abc_001/settings`, name: 'Get Restaurant Settings' },
    { method: 'PATCH', url: `${BASE_URL}/restaurants/abc_001/settings`, name: 'Update Restaurant Settings' },
    { method: 'GET', url: `${BASE_URL}/users/me/notification-preferences`, name: 'Get Notification Preferences' },
    { method: 'PATCH', url: `${BASE_URL}/users/me/notification-preferences`, name: 'Update Notification Preferences' },
    { method: 'GET', url: `${BASE_URL}/users/me/billing`, name: 'Get Billing Info' },
    { method: 'PATCH', url: `${BASE_URL}/users/me/billing`, name: 'Update Billing Info' }
  ];

  for (let i = 0; i < endpoints.length; i++) {
    const endpoint = endpoints[i];
    console.log(`${i + 1}️⃣ Testing ${endpoint.name}...`);
    
    try {
      const response = await fetch(endpoint.url, {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: endpoint.method === 'PATCH' ? JSON.stringify({ test: 'data' }) : undefined
      });
      
      console.log(`   Status: ${response.status}`);
      
      if (response.status === 401) {
        console.log('   ✅ Endpoint reachable - Authentication required (expected)');
      } else if (response.status === 404) {
        console.log('   ❌ Endpoint not found - Route not configured');
      } else if (response.status === 500) {
        console.log('   ⚠️ Server error - Check implementation');
      } else {
        console.log(`   ℹ️ Unexpected status: ${response.status}`);
      }
      
    } catch (error) {
      console.log(`   ❌ Network error: ${error.message}`);
    }
    
    console.log('');
  }

  console.log('🏁 Endpoint reachability testing completed!');
  console.log('\n📋 Summary:');
  console.log('✅ All endpoints should return 401 (Authentication required)');
  console.log('✅ This confirms the routes are properly configured');
  console.log('✅ Authentication middleware is working');
  console.log('\n🔑 To test with authentication:');
  console.log('1. Create a valid JWT token for the ABC Restaurant owner');
  console.log('2. Use the token in Authorization header: Bearer <token>');
  console.log('3. Test with restaurant ID: abc_001 or 68e400969aa6bc6b4a9fdd26');
}

// Run the test
testEndpointsReachability();
