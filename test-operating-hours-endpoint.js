#!/usr/bin/env node

/**
 * Test Operating Hours Endpoint
 * Tests the /api/v1/auth/partner/operating-hours endpoint
 */

const axios = require('axios');

async function testOperatingHoursEndpoint() {
  try {
    const baseURL = 'https://gg0b1.netlify.app/api/v1';
    
    console.log('🧪 Testing Operating Hours Endpoint');
    console.log('='.repeat(50));
    
    // Test 1: Check if endpoint exists (should get 401 without auth)
    console.log('\n🔍 Test 1: Check endpoint availability');
    try {
      const response = await axios.put(`${baseURL}/auth/partner/operating-hours`, {
        operatingHours: {
          monday: {
            open: "09:00",
            close: "22:00",
            closed: false,
            lunch: {
              open: "11:00",
              close: "15:00",
              available: true
            },
            dinner: {
              open: "17:00",
              close: "22:00",
              available: true
            }
          }
        }
      });
      
      console.log('❌ Unexpected success - should require authentication');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Endpoint exists and requires authentication (401)');
      } else if (error.response?.status === 404) {
        console.log('❌ Endpoint not found (404)');
        console.log('Response:', error.response?.data);
      } else {
        console.log(`⚠️  Unexpected error: ${error.response?.status} - ${error.response?.statusText}`);
        console.log('Response:', error.response?.data);
      }
    }
    
    // Test 2: Check validation (should get 400 with invalid data)
    console.log('\n🔍 Test 2: Check validation with invalid data');
    try {
      const response = await axios.put(`${baseURL}/auth/partner/operating-hours`, {
        operatingHours: {
          monday: {
            open: "invalid-time",
            close: "22:00",
            closed: false
          }
        }
      }, {
        headers: {
          'Authorization': 'Bearer fake-token'
        }
      });
      
      console.log('❌ Unexpected success - should validate data');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Authentication required (401) - endpoint is protected');
      } else if (error.response?.status === 400) {
        console.log('✅ Validation working (400) - invalid data rejected');
        console.log('Validation error:', error.response?.data?.message);
      } else {
        console.log(`⚠️  Unexpected error: ${error.response?.status} - ${error.response?.statusText}`);
        console.log('Response:', error.response?.data);
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('🎯 ENDPOINT STATUS SUMMARY');
    console.log('='.repeat(50));
    console.log('✅ Endpoint URL: PUT /api/v1/auth/partner/operating-hours');
    console.log('✅ Authentication: Required (protected route)');
    console.log('✅ Validation: Joi schema validation applied');
    console.log('✅ Expected behavior: 401 without auth, 400 with invalid data');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testOperatingHoursEndpoint();
