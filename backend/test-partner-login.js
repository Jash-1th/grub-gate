const mongoose = require('mongoose');
require('dotenv').config();
const axios = require('axios');

async function testPartnerLogin() {
  try {
    console.log('🔐 Testing partner login...');
    
    // Test login
    const loginResponse = await axios.post('http://localhost:5000/api/v1/auth/login', {
      identifier: 'jaswanthmamilla@gmail.com',
      password: '1qazxsw2Qa'
    });
    
    console.log('✅ Login successful');
    console.log('Token received:', loginResponse.data.data.accessToken ? 'Yes' : 'No');
    console.log('User role (single):', loginResponse.data.data.user.role);
    console.log('User roles (array):', loginResponse.data.data.user.roles);
    console.log('User name:', loginResponse.data.data.user.firstName, loginResponse.data.data.user.lastName);
    console.log('Full user object:', JSON.stringify(loginResponse.data.data.user, null, 2));
    
    const token = loginResponse.data.data.accessToken;
    
    // Test orders API with the token
    console.log('\n📦 Testing orders API...');
    const ordersResponse = await axios.get('http://localhost:5000/api/v1/orders', {
      params: {
        date: '2025-10-12',
        includeScheduled: 'true'
      },
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Orders API successful');
    console.log('Orders found:', ordersResponse.data.data?.length || 0);
    
    if (ordersResponse.data.data && ordersResponse.data.data.length > 0) {
      const order = ordersResponse.data.data[0];
      console.log('\nFirst order details:');
      console.log('  Order Number:', order.orderNumber);
      console.log('  Status:', order.status);
      console.log('  Scheduled Date:', order.scheduledDate);
      console.log('  Meal Type:', order.mealType);
      console.log('  Customer:', order.customerId?.firstName, order.customerId?.lastName);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testPartnerLogin();
