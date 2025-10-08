// Test script for settings API endpoints
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000/api/v1/partner';

// Mock JWT token for testing (replace with real token)
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';

async function testSettingsAPI() {
  console.log('🧪 Testing Settings API Endpoints...\n');

  try {
    // Test 1: Get Restaurant Settings
    console.log('1️⃣ Testing GET restaurant settings...');
    const getResponse = await fetch(`${BASE_URL}/restaurants/abc_001/settings`, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Status: ${getResponse.status}`);
    if (getResponse.ok) {
      const data = await getResponse.json();
      console.log('✅ Restaurant settings retrieved successfully');
      console.log('Settings:', JSON.stringify(data.data.settings, null, 2));
    } else {
      const error = await getResponse.text();
      console.log('❌ Failed to get restaurant settings:', error);
    }

    console.log('\n2️⃣ Testing UPDATE restaurant settings...');
    const updateData = {
      name: 'Updated Restaurant Name',
      description: 'Updated description for testing',
      cuisine: ['French', 'Mediterranean'],
      phone: '+1-514-555-9999',
      email: 'updated@restaurant.com',
      website: 'https://updated-restaurant.com',
      address: '456 Updated Street, Montreal, QC H1A 2B3',
      deliverySettings: {
        radius: 15,
        fee: 5.99,
        minOrderAmount: 30.00,
        avgDeliveryTime: 40
      }
    };

    const updateResponse = await fetch(`${BASE_URL}/restaurants/abc_001/settings`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });

    console.log(`Status: ${updateResponse.status}`);
    if (updateResponse.ok) {
      const data = await updateResponse.json();
      console.log('✅ Restaurant settings updated successfully');
    } else {
      const error = await updateResponse.text();
      console.log('❌ Failed to update restaurant settings:', error);
    }

    // Test 3: Get Notification Preferences
    console.log('\n3️⃣ Testing GET notification preferences...');
    const notifGetResponse = await fetch(`${BASE_URL}/users/me/notification-preferences`, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Status: ${notifGetResponse.status}`);
    if (notifGetResponse.ok) {
      const data = await notifGetResponse.json();
      console.log('✅ Notification preferences retrieved successfully');
      console.log('Preferences:', JSON.stringify(data.data.preferences, null, 2));
    } else {
      const error = await notifGetResponse.text();
      console.log('❌ Failed to get notification preferences:', error);
    }

    // Test 4: Update Notification Preferences
    console.log('\n4️⃣ Testing UPDATE notification preferences...');
    const notifUpdateData = {
      preferences: {
        emailNotifications: true,
        smsNotifications: false,
        orderAlerts: true,
        customerMessages: true,
        systemUpdates: false
      }
    };

    const notifUpdateResponse = await fetch(`${BASE_URL}/users/me/notification-preferences`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(notifUpdateData)
    });

    console.log(`Status: ${notifUpdateResponse.status}`);
    if (notifUpdateResponse.ok) {
      const data = await notifUpdateResponse.json();
      console.log('✅ Notification preferences updated successfully');
    } else {
      const error = await notifUpdateResponse.text();
      console.log('❌ Failed to update notification preferences:', error);
    }

    // Test 5: Get Billing Info
    console.log('\n5️⃣ Testing GET billing info...');
    const billingGetResponse = await fetch(`${BASE_URL}/users/me/billing`, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Status: ${billingGetResponse.status}`);
    if (billingGetResponse.ok) {
      const data = await billingGetResponse.json();
      console.log('✅ Billing info retrieved successfully');
      console.log('Billing Info:', JSON.stringify(data.data.billingInfo, null, 2));
    } else {
      const error = await billingGetResponse.text();
      console.log('❌ Failed to get billing info:', error);
    }

    // Test 6: Update Billing Info
    console.log('\n6️⃣ Testing UPDATE billing info...');
    const billingUpdateData = {
      billingInfo: {
        paymentMethod: 'Visa ending in 1234',
        taxId: '98-7654321',
        billingAddress: '789 Billing Street, Montreal, QC H2B 3C4'
      }
    };

    const billingUpdateResponse = await fetch(`${BASE_URL}/users/me/billing`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(billingUpdateData)
    });

    console.log(`Status: ${billingUpdateResponse.status}`);
    if (billingUpdateResponse.ok) {
      const data = await billingUpdateResponse.json();
      console.log('✅ Billing info updated successfully');
    } else {
      const error = await billingUpdateResponse.text();
      console.log('❌ Failed to update billing info:', error);
    }

  } catch (error) {
    console.error('🚨 Error testing settings API:', error.message);
  }

  console.log('\n🏁 Settings API testing completed!');
}

// Run the test
testSettingsAPI();
