// Test script to verify automatic login after signup
const axios = require('axios');

const testAutoLogin = async () => {
  try {
    console.log('🧪 Testing automatic login after customer signup...\n');
    
    // Test registration with a unique email
    const testEmail = `test${Date.now()}@example.com`;
    const registrationData = {
      firstName: 'Test',
      lastName: 'User',
      email: testEmail,
      password: 'Password123!',
      phoneNumber: '+1234567890',
      role: 'customer'
    };

    console.log('📝 Registering new customer:', testEmail);
    
    const response = await axios.post('http://localhost:5000/api/v1/auth/register', registrationData);
    
    console.log('✅ Registration Response Status:', response.status);
    console.log('📦 Response Data Structure:');
    console.log('- success:', response.data.success);
    console.log('- message:', response.data.message);
    console.log('- data keys:', Object.keys(response.data.data));
    
    const { user, accessToken, refreshToken } = response.data.data;
    
    if (accessToken && user) {
      console.log('\n🎉 AUTO-LOGIN TOKENS PRESENT:');
      console.log('✅ accessToken:', accessToken ? 'Present' : 'Missing');
      console.log('✅ refreshToken:', refreshToken ? 'Present' : 'Missing');
      console.log('✅ user data:', user ? 'Present' : 'Missing');
      console.log('✅ user roles:', user.roles);
      
      // Test if token works by calling protected endpoint
      console.log('\n🔐 Testing token validity...');
      const meResponse = await axios.get('http://localhost:5000/api/v1/auth/me', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      console.log('✅ Token validation successful!');
      console.log('👤 Authenticated user:', meResponse.data.data.user.email);
      
      console.log('\n🎯 CONCLUSION: Automatic login is working perfectly!');
      console.log('- User is registered ✅');
      console.log('- Tokens are generated ✅'); 
      console.log('- User is automatically authenticated ✅');
      
    } else {
      console.log('\n❌ AUTO-LOGIN ISSUE:');
      console.log('- accessToken:', accessToken ? 'Present' : 'Missing');
      console.log('- user:', user ? 'Present' : 'Missing');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
};

// Run the test
testAutoLogin();
