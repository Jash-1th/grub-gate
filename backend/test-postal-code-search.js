#!/usr/bin/env node

/**
 * Test Postal Code Based Nearby Restaurant Search
 * Demonstrates how the global proximity search works with real examples
 */

const mongoose = require('mongoose');
require('dotenv').config();

const Restaurant = require('./src/models/Restaurant');
const { detectCountryFromPostalCode } = require('./src/services/globalGeocodingService');

async function testPostalCodeSearch() {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.DATABASE_URL;
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    console.log('🔍 TESTING POSTAL CODE BASED NEARBY RESTAURANT SEARCH');
    console.log('='.repeat(70));

    // Test scenarios with different postal codes
    const testScenarios = [
      {
        title: '🇨🇦 CANADIAN POSTAL CODE SEARCH',
        searchCode: 'M5V 2B4',
        description: 'Exact match - should find Maple Leaf Bistro',
        expectedCountry: 'CA'
      },
      {
        title: '🇨🇦 NEARBY CANADIAN POSTAL CODES',
        searchCode: 'M5V 2B1',
        description: 'Adjacent unit - should find M5V 2B4 restaurant via proximity',
        expectedCountry: 'CA'
      },
      {
        title: '🇨🇦 SAME FSA (Forward Sortation Area)',
        searchCode: 'M5V 1A1',
        description: 'Same M5V area - should find M5V 2B4 restaurant',
        expectedCountry: 'CA'
      },
      {
        title: '🇨🇦 NEARBY FSA - FINANCIAL DISTRICT',
        searchCode: 'M5H 3K7',
        description: 'Financial District Toronto - should find M5V 2B4 via coordinates',
        expectedCountry: 'CA'
      },
      {
        title: '🇺🇸 US ZIP CODE SEARCH',
        searchCode: '10001',
        description: 'New York ZIP - should NOT find Canadian restaurants',
        expectedCountry: 'US'
      },
      {
        title: '🇮🇳 INDIAN PIN CODE SEARCH',
        searchCode: '515671',
        description: 'Dharmavaram PIN - should find Indian restaurants only',
        expectedCountry: 'IN'
      },
      {
        title: '🇬🇧 UK POSTCODE SEARCH',
        searchCode: 'SW1A 1AA',
        description: 'London postcode - should find UK restaurants only',
        expectedCountry: 'UK'
      }
    ];

    for (const scenario of testScenarios) {
      console.log(`\n${scenario.title}`);
      console.log('-'.repeat(50));
      console.log(`📮 Searching: ${scenario.searchCode}`);
      console.log(`🎯 Expected: ${scenario.description}`);

      try {
        // Step 1: Country Detection
        const detectedCountry = detectCountryFromPostalCode(scenario.searchCode);
        console.log(`🌍 Detected Country: ${detectedCountry || 'Unknown'}`);
        
        if (detectedCountry !== scenario.expectedCountry) {
          console.log(`⚠️  Country mismatch! Expected ${scenario.expectedCountry}, got ${detectedCountry}`);
        }

        // Step 2: Search for nearby restaurants
        const startTime = Date.now();
        const restaurants = await Restaurant.findNearbyByPostalCode(scenario.searchCode, 10, detectedCountry);
        const endTime = Date.now();

        console.log(`⏱️  Search completed in ${endTime - startTime}ms`);
        console.log(`📊 Found ${restaurants.length} restaurants`);

        if (restaurants.length > 0) {
          console.log(`📍 Results:`);
          restaurants.forEach((restaurant, index) => {
            const distance = restaurant.address.coordinates ? 
              `(${restaurant.address.coordinates.lat.toFixed(4)}, ${restaurant.address.coordinates.lng.toFixed(4)})` : 
              '(no coordinates)';
            
            console.log(`   ${index + 1}. 🏪 ${restaurant.name}`);
            console.log(`      📍 ${restaurant.address.postalCode} - ${restaurant.address.city}, ${restaurant.address.country}`);
            console.log(`      🗺️  ${distance}`);
            console.log(`      ⭐ Rating: ${restaurant.rating} (${restaurant.reviewCount} reviews)`);
            
            // Highlight if this is our target M5V 2B4 restaurant
            if (restaurant.address.postalCode === 'M5V 2B4') {
              console.log(`      🎯 TARGET FOUND! This is the Maple Leaf Bistro at M5V 2B4!`);
            }
            console.log('');
          });

          // Analysis
          const canadianRestaurants = restaurants.filter(r => r.address.country === 'CA');
          const usRestaurants = restaurants.filter(r => r.address.country === 'US');
          const indianRestaurants = restaurants.filter(r => r.address.country === 'IN');

          console.log(`📊 Country Breakdown:`);
          console.log(`   🇨🇦 Canadian: ${canadianRestaurants.length}`);
          console.log(`   🇺🇸 US: ${usRestaurants.length}`);
          console.log(`   🇮🇳 Indian: ${indianRestaurants.length}`);

        } else {
          console.log(`📭 No restaurants found`);
          if (scenario.expectedCountry !== detectedCountry) {
            console.log(`💡 This might be expected if no restaurants exist in ${detectedCountry}`);
          }
        }

        // Step 3: Validation
        if (scenario.searchCode.startsWith('M5V') || scenario.searchCode.startsWith('M5H')) {
          const foundM5V = restaurants.find(r => r.address.postalCode === 'M5V 2B4');
          if (foundM5V) {
            console.log(`✅ SUCCESS! Proximity search correctly found M5V 2B4 restaurant`);
          } else {
            console.log(`⚠️  Expected to find M5V 2B4 restaurant but didn't`);
          }
        }

      } catch (error) {
        console.log(`❌ Search failed: ${error.message}`);
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('📋 POSTAL CODE SEARCH ANALYSIS');
    console.log('='.repeat(70));

    console.log('\n🎯 HOW IT WORKS:');
    console.log('1️⃣  **Country Detection**: Postal code pattern → Country (M5V → CA)');
    console.log('2️⃣  **Exact Match**: Look for restaurants with same postal code');
    console.log('3️⃣  **Range Search**: For Indian PIN codes, search ±10 range');
    console.log('4️⃣  **Coordinate Search**: Geocode postal code → find within radius');
    console.log('5️⃣  **Fallback**: Partial postal code matching');

    console.log('\n✅ EXPECTED BEHAVIOR:');
    console.log('🇨🇦 M5V 2B4 → Finds Maple Leaf Bistro (exact match)');
    console.log('🇨🇦 M5V 2B1 → Finds Maple Leaf Bistro (proximity)');
    console.log('🇨🇦 M5H 3K7 → Finds Maple Leaf Bistro (coordinate search)');
    console.log('🇺🇸 10001 → Does NOT find Canadian restaurants (country boundary)');
    console.log('🇮🇳 515671 → Does NOT find Canadian restaurants (country boundary)');

    console.log('\n🌍 GLOBAL BENEFITS:');
    console.log('✅ Country-aware search prevents false matches');
    console.log('✅ Multi-provider geocoding ensures accuracy');
    console.log('✅ Intelligent fallbacks ensure results');
    console.log('✅ Respects geographic boundaries');

  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testPostalCodeSearch().catch(console.error);
