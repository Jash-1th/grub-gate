#!/usr/bin/env node

/**
 * Test Global Location System
 * Tests the new global address, geocoding, and country detection features
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import services
const { detectCountry } = require('./src/services/countryDetectionService');
const { geocodeGlobalAddress, detectCountryFromPostalCode } = require('./src/services/globalGeocodingService');

async function testGlobalSystem() {
  try {
    console.log('🌍 TESTING GLOBAL LOCATION SYSTEM');
    console.log('='.repeat(60));

    // Test 1: Country Detection
    console.log('\n🔍 Test 1: Country Detection');
    console.log('-'.repeat(40));

    const testCases = [
      { ip: '8.8.8.8', timezone: 'America/New_York', postalCode: '10001' },
      { timezone: 'America/Toronto', postalCode: 'M5V 2B4' },
      { postalCode: '515671' },
      { postalCode: 'SW1A 1AA' },
      { postalCode: '2000' },
      { postalCode: '12345' }
    ];

    for (const testCase of testCases) {
      try {
        console.log(`\n📍 Testing: ${JSON.stringify(testCase)}`);
        const result = await detectCountry(testCase);
        console.log(`   ✅ Detected: ${result.countryName} (${result.country})`);
        console.log(`   💰 Currency: ${result.currency}`);
        console.log(`   🎯 Confidence: ${(result.confidence * 100).toFixed(1)}%`);
        console.log(`   📊 Methods: ${result.detectionMethods.join(', ')}`);
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }

    // Test 2: Postal Code Country Detection
    console.log('\n\n🔍 Test 2: Postal Code Pattern Detection');
    console.log('-'.repeat(40));

    const postalCodes = ['10001', 'M5V 2B4', '515671', 'SW1A 1AA', '2000', '12345', '75001', '100-0001'];

    for (const postalCode of postalCodes) {
      const country = detectCountryFromPostalCode(postalCode);
      console.log(`📮 ${postalCode} → ${country || 'Unknown format'}`);
    }

    // Test 3: Global Geocoding
    console.log('\n\n🔍 Test 3: Global Address Geocoding');
    console.log('-'.repeat(40));

    const addresses = [
      {
        country: 'US',
        addressLine1: '1600 Pennsylvania Avenue NW',
        city: 'Washington',
        state: 'DC',
        postalCode: '20500'
      },
      {
        country: 'CA',
        addressLine1: '123 King Street West',
        city: 'Toronto',
        state: 'ON',
        postalCode: 'M5V 2B4'
      },
      {
        country: 'IN',
        addressLine1: 'Main Road',
        city: 'Dharmavaram',
        state: 'Andhra Pradesh',
        postalCode: '515671'
      },
      {
        country: 'UK',
        addressLine1: '10 Downing Street',
        city: 'London',
        state: '',
        postalCode: 'SW1A 2AA'
      }
    ];

    for (const address of addresses) {
      try {
        console.log(`\n🏠 Testing: ${address.addressLine1}, ${address.city}, ${address.country}`);
        const result = await geocodeGlobalAddress(address);
        console.log(`   ✅ Coordinates: ${result.lat}, ${result.lng}`);
        console.log(`   🌍 Provider: ${result.provider}`);
        console.log(`   🎯 Accuracy: ${result.accuracy}`);
        console.log(`   📍 Formatted: ${result.formatted_address}`);
      } catch (error) {
        console.log(`   ❌ Geocoding failed: ${error.message}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 GLOBAL SYSTEM TEST COMPLETE');
    console.log('='.repeat(60));

    console.log('\n💡 NEXT STEPS:');
    console.log('1. Update existing restaurants to use new address format');
    console.log('2. Create migration script for address data');
    console.log('3. Update frontend forms to support global addresses');
    console.log('4. Add country selection UI components');
    console.log('5. Implement currency conversion');
    console.log('6. Add timezone-aware business hours');

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

// Test restaurant creation with global address
async function testGlobalRestaurantCreation() {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.DATABASE_URL;
    
    if (!mongoUri) {
      console.log('⚠️ MongoDB URI not found, skipping database tests');
      return;
    }

    await mongoose.connect(mongoUri);
    console.log('\n🔌 Connected to MongoDB for restaurant test');

    // Import Restaurant model (will use new global schema)
    const Restaurant = require('./src/models/Restaurant');

    console.log('\n🏪 Testing Global Restaurant Creation');
    console.log('-'.repeat(40));

    // Test creating restaurants in different countries
    const globalRestaurants = [
      {
        name: 'NYC Pizza Palace',
        country: 'US',
        addressLine1: '123 Broadway',
        city: 'New York',
        state: 'NY',
        postalCode: '10001'
      },
      {
        name: 'London Fish & Chips',
        country: 'UK', 
        addressLine1: '45 High Street',
        city: 'London',
        state: '',
        postalCode: 'SW1A 1AA'
      },
      {
        name: 'Mumbai Spice House',
        country: 'IN',
        addressLine1: 'MG Road',
        city: 'Mumbai',
        state: 'Maharashtra', 
        postalCode: '400001'
      }
    ];

    for (const restaurantData of globalRestaurants) {
      try {
        console.log(`\n🏪 Testing restaurant in ${restaurantData.country}: ${restaurantData.name}`);
        
        // Test address validation
        const address = {
          country: restaurantData.country,
          addressLine1: restaurantData.addressLine1,
          city: restaurantData.city,
          state: restaurantData.state,
          postalCode: restaurantData.postalCode
        };

        // Test geocoding
        const coordinates = await geocodeGlobalAddress(address);
        console.log(`   🌍 Geocoded: ${coordinates.lat}, ${coordinates.lng}`);

        // Test postal code detection
        const detectedCountry = detectCountryFromPostalCode(restaurantData.postalCode);
        console.log(`   📮 Postal code pattern detected: ${detectedCountry}`);
        
        if (detectedCountry === restaurantData.country) {
          console.log(`   ✅ Country detection matches!`);
        } else {
          console.log(`   ⚠️ Country mismatch: expected ${restaurantData.country}, got ${detectedCountry}`);
        }

      } catch (error) {
        console.log(`   ❌ Error testing ${restaurantData.name}: ${error.message}`);
      }
    }

    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Database test error:', error.message);
  }
}

// Run all tests
async function runAllTests() {
  await testGlobalSystem();
  await testGlobalRestaurantCreation();
}

// Execute if run directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { testGlobalSystem, testGlobalRestaurantCreation };
