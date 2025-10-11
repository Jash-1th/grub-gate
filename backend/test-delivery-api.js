#!/usr/bin/env node

// FILE: backend/test-delivery-api.js
/**
 * Test the delivery check API directly
 */

const axios = require('axios');

async function testDeliveryAPI() {
  try {
    console.log('🧪 Testing delivery check API...');
    
    const testData = {
      address: {
        street: "Srinivasa Flyover",
        city: "Tirupati",
        province: "Andhra Pradesh",
        postalCode: "517501",
        country: "India",
        coordinates: {
          lat: 13.6244611,
          lng: 79.4310052
        }
      },
      restaurantId: "68e73d168c18e7fd776a6327"
    };

    console.log('📤 Sending request to: http://localhost:5000/api/v1/restaurants/check-delivery');
    console.log('📦 Request data:', JSON.stringify(testData, null, 2));

    const response = await axios.post('http://localhost:5000/api/v1/restaurants/check-delivery', testData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Response received:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('❌ API Test Failed:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.message || error.message);
    console.error('Full error:', error.response?.data || error.message);
  }
}

// Run the test
testDeliveryAPI();
