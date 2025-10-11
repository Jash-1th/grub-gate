#!/usr/bin/env node

/**
 * Simple Global System Test
 * Quick test of key global features
 */

const { detectCountry } = require('./src/services/countryDetectionService');
const { geocodeGlobalAddress, detectCountryFromPostalCode } = require('./src/services/globalGeocodingService');

async function testGlobalFeatures() {
  console.log('🌍 GLOBAL SYSTEM QUICK TEST');
  console.log('='.repeat(50));

  // Test 1: Postal Code Country Detection
  console.log('\n📮 Test 1: Postal Code Country Detection');
  console.log('-'.repeat(30));
  
  const postalCodes = [
    '10001',     // US ZIP
    'M5V 2B4',   // Canadian
    '515671',    // Indian
    'SW1A 1AA',  // UK
    '2000',      // Australian
    '12345',     // German
    '75001',     // French
    '100-0001'   // Japanese
  ];

  for (const code of postalCodes) {
    const country = detectCountryFromPostalCode(code);
    console.log(`   ${code.padEnd(10)} → ${country || 'Unknown'}`);
  }

  // Test 2: Country Detection from Multiple Sources
  console.log('\n🔍 Test 2: Multi-Source Country Detection');
  console.log('-'.repeat(30));

  try {
    const result = await detectCountry({
      timezone: 'America/Toronto',
      postalCode: 'M5V 2B4'
    });
    
    console.log(`   🇨🇦 Canada Detection:`);
    console.log(`      Country: ${result.countryName} (${result.country})`);
    console.log(`      Currency: ${result.currency}`);
    console.log(`      Confidence: ${(result.confidence * 100).toFixed(1)}%`);
    console.log(`      Methods: ${result.detectionMethods.join(', ')}`);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  // Test 3: Global Address Geocoding
  console.log('\n🌍 Test 3: Global Address Geocoding');
  console.log('-'.repeat(30));

  const testAddresses = [
    {
      name: 'Toronto, Canada',
      address: {
        country: 'CA',
        addressLine1: '123 King Street West',
        city: 'Toronto',
        state: 'ON',
        postalCode: 'M5V 2B4'
      }
    },
    {
      name: 'New York, USA',
      address: {
        country: 'US',
        addressLine1: '123 Broadway',
        city: 'New York',
        state: 'NY',
        postalCode: '10001'
      }
    },
    {
      name: 'Mumbai, India',
      address: {
        country: 'IN',
        addressLine1: 'MG Road',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400001'
      }
    }
  ];

  for (const test of testAddresses) {
    try {
      console.log(`\n   🏠 ${test.name}:`);
      const result = await geocodeGlobalAddress(test.address);
      console.log(`      ✅ Coordinates: ${result.lat.toFixed(6)}, ${result.lng.toFixed(6)}`);
      console.log(`      🌍 Provider: ${result.provider}`);
      console.log(`      🎯 Accuracy: ${result.accuracy}`);
    } catch (error) {
      console.log(`      ❌ Failed: ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('✅ GLOBAL SYSTEM TEST COMPLETE');
  console.log('🎉 Your Grub-Gate platform now supports worldwide locations!');
}

testGlobalFeatures().catch(console.error);
