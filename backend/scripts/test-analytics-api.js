// FILE: scripts/test-analytics-api.js
// Test the analytics API with proper authentication

const { default: fetch } = require('node-fetch');

const API_BASE_URL = 'http://localhost:5000/api/v1';
const JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZTYwYmM1NDRiODc1YWM2YWFmOTUyNiIsImVtYWlsIjoiMjAyMmNzZS5yMjM0QHN2Y2UuZWR1LmluIiwiaWF0IjoxNzU5OTQ3NDE4LCJleHAiOjE3NjAwMzM4MTh9.TZsofM0BJ_OeSLdOg6B6Rs8_X4bwR68XWftOXFRibWc';

async function testAnalyticsEndpoints() {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${JWT_TOKEN}`
  };

  console.log('🧪 Testing Analytics API Endpoints...\n');

  // Test 1: Overview Analytics
  try {
    console.log('1️⃣ Testing /analytics/overview...');
    const response = await fetch(`${API_BASE_URL}/analytics/overview?period=30`, {
      method: 'GET',
      headers
    });
    
    console.log(`   Status: ${response.status}`);
    const data = await response.json();
    console.log(`   Response:`, JSON.stringify(data, null, 2));
    console.log('   ✅ Overview endpoint working\n');
  } catch (error) {
    console.log(`   ❌ Overview endpoint failed:`, error.message, '\n');
  }

  // Test 2: Top Items
  try {
    console.log('2️⃣ Testing /analytics/top-items...');
    const response = await fetch(`${API_BASE_URL}/analytics/top-items?limit=5`, {
      method: 'GET',
      headers
    });
    
    console.log(`   Status: ${response.status}`);
    const data = await response.json();
    console.log(`   Response:`, JSON.stringify(data, null, 2));
    console.log('   ✅ Top items endpoint working\n');
  } catch (error) {
    console.log(`   ❌ Top items endpoint failed:`, error.message, '\n');
  }

  // Test 3: Revenue Trend
  try {
    console.log('3️⃣ Testing /analytics/revenue-trend...');
    const response = await fetch(`${API_BASE_URL}/analytics/revenue-trend?period=30`, {
      method: 'GET',
      headers
    });
    
    console.log(`   Status: ${response.status}`);
    const data = await response.json();
    console.log(`   Response:`, JSON.stringify(data, null, 2));
    console.log('   ✅ Revenue trend endpoint working\n');
  } catch (error) {
    console.log(`   ❌ Revenue trend endpoint failed:`, error.message, '\n');
  }

  // Test 4: Order Status
  try {
    console.log('4️⃣ Testing /analytics/order-status...');
    const response = await fetch(`${API_BASE_URL}/analytics/order-status?period=30`, {
      method: 'GET',
      headers
    });
    
    console.log(`   Status: ${response.status}`);
    const data = await response.json();
    console.log(`   Response:`, JSON.stringify(data, null, 2));
    console.log('   ✅ Order status endpoint working\n');
  } catch (error) {
    console.log(`   ❌ Order status endpoint failed:`, error.message, '\n');
  }

  // Test 5: Customer Overview
  try {
    console.log('5️⃣ Testing /analytics/customer-overview...');
    const response = await fetch(`${API_BASE_URL}/analytics/customer-overview?period=30`, {
      method: 'GET',
      headers
    });
    
    console.log(`   Status: ${response.status}`);
    const data = await response.json();
    console.log(`   Response:`, JSON.stringify(data, null, 2));
    console.log('   ✅ Customer overview endpoint working\n');
  } catch (error) {
    console.log(`   ❌ Customer overview endpoint failed:`, error.message, '\n');
  }

  // Test 6: Top Customers
  try {
    console.log('6️⃣ Testing /analytics/top-customers...');
    const response = await fetch(`${API_BASE_URL}/analytics/top-customers?limit=5&period=30`, {
      method: 'GET',
      headers
    });
    
    console.log(`   Status: ${response.status}`);
    const data = await response.json();
    console.log(`   Response:`, JSON.stringify(data, null, 2));
    console.log('   ✅ Top customers endpoint working\n');
  } catch (error) {
    console.log(`   ❌ Top customers endpoint failed:`, error.message, '\n');
  }

  // Test 7: Customer Segments
  try {
    console.log('7️⃣ Testing /analytics/customer-segments...');
    const response = await fetch(`${API_BASE_URL}/analytics/customer-segments?period=30`, {
      method: 'GET',
      headers
    });
    
    console.log(`   Status: ${response.status}`);
    const data = await response.json();
    console.log(`   Response:`, JSON.stringify(data, null, 2));
    console.log('   ✅ Customer segments endpoint working\n');
  } catch (error) {
    console.log(`   ❌ Customer segments endpoint failed:`, error.message, '\n');
  }

  // Test 8: Performance Overview
  try {
    console.log('8️⃣ Testing /analytics/performance-overview...');
    const response = await fetch(`${API_BASE_URL}/analytics/performance-overview?period=30`, {
      method: 'GET',
      headers
    });
    
    console.log(`   Status: ${response.status}`);
    const data = await response.json();
    console.log(`   Response:`, JSON.stringify(data, null, 2));
    console.log('   ✅ Performance overview endpoint working\n');
  } catch (error) {
    console.log(`   ❌ Performance overview endpoint failed:`, error.message, '\n');
  }

  // Test 9: Delivery Performance Trend
  try {
    console.log('9️⃣ Testing /analytics/delivery-performance-trend...');
    const response = await fetch(`${API_BASE_URL}/analytics/delivery-performance-trend?period=7`, {
      method: 'GET',
      headers
    });
    
    console.log(`   Status: ${response.status}`);
    const data = await response.json();
    console.log(`   Response:`, JSON.stringify(data, null, 2));
    console.log('   ✅ Delivery performance trend endpoint working\n');
  } catch (error) {
    console.log(`   ❌ Delivery performance trend endpoint failed:`, error.message, '\n');
  }

  // Test 10: Recent Orders
  try {
    console.log('🔟 Testing /analytics/recent-orders...');
    const response = await fetch(`${API_BASE_URL}/analytics/recent-orders?limit=5`, {
      method: 'GET',
      headers
    });
    
    console.log(`   Status: ${response.status}`);
    const data = await response.json();
    console.log(`   Response:`, JSON.stringify(data, null, 2));
    console.log('   ✅ Recent orders endpoint working\n');
  } catch (error) {
    console.log(`   ❌ Recent orders endpoint failed:`, error.message, '\n');
  }
}

// Run the test
testAnalyticsEndpoints().catch(console.error);
