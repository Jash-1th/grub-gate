// Test Partner Portal API configuration
console.log('🧪 Testing Partner Portal API Configuration\n');

// Simulate the Partner Portal environment
const mockWindow = {
  location: {
    hostname: 'gg0b1.netlify.app'
  }
};

// Mock the environment
global.window = mockWindow;

// Test the API base URL logic
const getApiBaseUrl = () => {
  // If environment variable is set, use it
  const VITE_API_BASE_URL = process.env.VITE_API_BASE_URL;
  if (VITE_API_BASE_URL) {
    return VITE_API_BASE_URL;
  }
  
  // If we're in production (on Netlify), use the backend URL
  if (typeof window !== 'undefined' && window.location.hostname.includes('netlify.app')) {
    return 'https://gg0b1.netlify.app/api/v1';
  }
  
  // For local development, use localhost
  return 'http://localhost:5000/api/v1';
};

console.log('🔧 Testing API Base URL Detection:');
console.log('Environment Variable VITE_API_BASE_URL:', process.env.VITE_API_BASE_URL || 'Not set');
console.log('Window hostname:', mockWindow.location.hostname);
console.log('Detected API Base URL:', getApiBaseUrl());

// Test postal code detection
console.log('\n📮 Testing Backend Postal Code Detection:');
const axios = require('axios');

async function testPostalCodes() {
  const testCodes = ['515671', '5156', 'H3A 1B2', 'M5V 2B4'];
  
  for (const code of testCodes) {
    try {
      const response = await axios.get(`https://gg0b1.netlify.app/api/v1/geocoding/detect-country?postalCode=${encodeURIComponent(code)}`);
      console.log(`✅ "${code}" → ${response.data.data?.country || 'UNKNOWN'}`);
    } catch (error) {
      console.log(`❌ "${code}" → ERROR: ${error.message}`);
    }
  }
}

testPostalCodes().then(() => {
  console.log('\n🎉 Test completed!');
}).catch(console.error);
