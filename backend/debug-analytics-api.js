// Debug script to test analytics API endpoints
const axios = require('axios');

const baseURL = 'http://localhost:5000/api/v1/analytics';

// Mock authentication token - you'll need to replace this with a real token
const mockToken = 'your-jwt-token-here';

async function debugAnalyticsAPI() {
  try {
    console.log('🔍 Debugging Analytics API Endpoints...');
    console.log('=' .repeat(60));

    // Test endpoints without authentication first to see the structure
    const endpoints = [
      '/overview?period=30',
      '/subscription-overview?period=30',
      '/revenue-breakdown?period=30',
      '/top-items?limit=5',
      '/order-status?period=30'
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`\n📡 Testing: ${endpoint}`);
        
        // Try without auth first to see if it's an auth issue
        const response = await axios.get(`${baseURL}${endpoint}`, {
          timeout: 5000,
          validateStatus: function (status) {
            return status < 500; // Don't throw for 4xx errors
          }
        });
        
        console.log(`Status: ${response.status}`);
        console.log(`Response:`, JSON.stringify(response.data, null, 2));
        
      } catch (error) {
        console.log(`❌ Error for ${endpoint}:`, error.message);
        if (error.response) {
          console.log(`Status: ${error.response.status}`);
          console.log(`Response:`, error.response.data);
        }
      }
    }

    console.log('\n✅ API Debug complete!');
    
  } catch (error) {
    console.error('❌ Debug error:', error.message);
  }
}

debugAnalyticsAPI();
