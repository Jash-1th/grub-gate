// Test the API call directly to see what's happening
const axios = require('axios');

async function testApiCall() {
  try {
    // You'll need to get a valid partner token from the browser
    const token = 'YOUR_PARTNER_TOKEN_HERE'; // Replace with actual token from browser localStorage
    
    const response = await axios.patch(
      'http://localhost:5000/api/v1/orders/68fbc8204027e108f104352d/status',
      {
        status: 'preparing',
        notes: 'API test call'
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ API Call Success:', response.data);
  } catch (error) {
    console.log('❌ API Call Failed:', error.response?.data || error.message);
    console.log('Status:', error.response?.status);
    console.log('Headers:', error.response?.headers);
  }
}

console.log('🧪 Testing API call...');
console.log('⚠️  You need to replace YOUR_PARTNER_TOKEN_HERE with actual token from browser localStorage');
// testApiCall();
