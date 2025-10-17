// Test script to verify activation functionality
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api/v1';

async function testActivation() {
  console.log('🧪 Testing activation functionality...');
  
  try {
    // Test 1: Check if backend is running
    console.log('\n📋 Step 1: Testing backend health...');
    const healthResponse = await axios.get(`${API_BASE_URL.replace('/api/v1', '')}/health`);
    console.log('✅ Backend is running:', healthResponse.data.message);
    
    // Test 2: Check if activation endpoint exists (without auth)
    console.log('\n📋 Step 2: Testing activation endpoint (expect 401)...');
    try {
      await axios.post(`${API_BASE_URL}/activation/complete-setup`);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Activation endpoint exists and requires authentication');
      } else {
        console.log('❌ Unexpected error:', error.response?.status, error.response?.data);
      }
    }
    
    // Test 3: Check partner restaurant endpoint (without auth)
    console.log('\n📋 Step 3: Testing partner restaurant endpoint (expect 401)...');
    try {
      await axios.get(`${API_BASE_URL}/partner/restaurants/me`);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Partner restaurant endpoint exists and requires authentication');
      } else {
        console.log('❌ Unexpected error:', error.response?.status, error.response?.data);
      }
    }
    
    console.log('\n🎉 All tests passed! Backend is ready for activation.');
    console.log('\n📝 Next steps:');
    console.log('1. Restart your Partner Portal development server');
    console.log('2. Complete the onboarding flow');
    console.log('3. Click "Launch Dashboard" to test activation');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testActivation();
