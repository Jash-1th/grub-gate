// Test script for geocoding service
require('dotenv').config();
const { geocodeAddress } = require('./src/services/geocodingService');

async function testGeocodingSetup() {
  console.log('🧪 Testing Geocoding Service Setup...\n');
  
  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log('- GOOGLE_MAPS_API_KEY:', process.env.GOOGLE_MAPS_API_KEY ? '✅ Set' : '❌ Not set');
  console.log('- MAPBOX_ACCESS_TOKEN:', process.env.MAPBOX_ACCESS_TOKEN ? '✅ Set' : '❌ Not set');
  console.log('- Nominatim (free):', '✅ Always available\n');

  // Test cases
  const testCases = [
    {
      name: 'Indian Postal Code (Your Restaurant ABC)',
      postalCode: '515671',
      city: 'DHARMAVARAM',
      province: 'Andhra Pradesh',
      country: 'India'
    },
    {
      name: 'Canadian Postal Code',
      postalCode: 'H3A 0G4',
      city: 'Montreal',
      province: 'Quebec',
      country: 'Canada'
    },
    {
      name: 'US ZIP Code',
      postalCode: '10001',
      city: 'New York',
      province: 'NY',
      country: 'USA'
    }
  ];

  for (const testCase of testCases) {
    try {
      console.log(`🌍 Testing: ${testCase.name}`);
      console.log(`   Address: ${testCase.postalCode}, ${testCase.city}, ${testCase.province}, ${testCase.country}`);
      
      const startTime = Date.now();
      const result = await geocodeAddress(
        testCase.postalCode,
        testCase.city,
        testCase.province,
        testCase.country
      );
      const endTime = Date.now();
      
      console.log(`   ✅ Success! (${endTime - startTime}ms)`);
      console.log(`   📍 Coordinates: ${result.lat}, ${result.lng}`);
      console.log(`   🔧 Provider: ${result.provider}`);
      console.log(`   📝 Address: ${result.formatted_address}`);
      console.log('');
      
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}`);
      console.log('');
    }
  }
  
  console.log('🎯 Test Summary:');
  console.log('If you see ✅ Success results above, your geocoding is working!');
  console.log('If all tests failed, check your API keys in the .env file.');
  console.log('\n📚 Next steps:');
  console.log('1. If tests passed: Run "node scripts/populateCoordinates.js" to update existing restaurants');
  console.log('2. Create new restaurants through partner portal - coordinates will be auto-calculated');
  console.log('3. Test restaurant search by postal code in customer app');
}

// Run the test
testGeocodingSetup().catch(console.error);
