// Test OTP request endpoint directly
const axios = require('axios');

async function testOTPRequest() {
  try {
    console.log('🧪 Testing OTP request endpoint...');
    
    const response = await axios.post('http://localhost:5000/api/v1/auth/partner/otp/request', {
      identifier: 'jash64326@yahoo.com',
      channel: 'email'
    });
    
    console.log('✅ OTP request successful:', response.data);
  } catch (error) {
    console.error('❌ OTP request failed:', error.response?.data || error.message);
  }
}

testOTPRequest();
