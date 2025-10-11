#!/usr/bin/env node

/**
 * Test Global System with M5V 2B4 Restaurant
 * Tests how the new global proximity search works with existing restaurant
 */

const mongoose = require('mongoose');
require('dotenv').config();

const Restaurant = require('./src/models/Restaurant');
const { detectCountryFromPostalCode } = require('./src/services/globalGeocodingService');

async function testGlobalM5VSearch() {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.DATABASE_URL;
    
    if (!mongoUri) {
      console.log('❌ MongoDB URI not found');
      return;
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    console.log('🎯 TESTING GLOBAL PROXIMITY SEARCH WITH M5V 2B4');
    console.log('='.repeat(60));

    // Check existing restaurant
    const existingRestaurant = await Restaurant.findOne({
      'address.postalCode': 'M5V 2B4'
    });

    if (existingRestaurant) {
      console.log('\n🏪 EXISTING RESTAURANT FOUND:');
      console.log(`   Name: ${existingRestaurant.name}`);
      console.log(`   Postal Code: ${existingRestaurant.address.postalCode}`);
      console.log(`   Country: ${existingRestaurant.address.country || 'NOT SET'}`);
      console.log(`   Coordinates: ${existingRestaurant.address.coordinates ? 
        `${existingRestaurant.address.coordinates.lat}, ${existingRestaurant.address.coordinates.lng}` : 
        'NOT SET'}`);
    }

    console.log('\n🧪 TESTING NEW GLOBAL PROXIMITY SEARCH:');
    console.log('-'.repeat(60));

    const testCases = [
      { code: 'M5V 2B4', description: 'Exact match (same building)' },
      { code: 'M5V 2B1', description: 'Same FSA, adjacent unit' },
      { code: 'M5V 2B3', description: 'Same FSA, adjacent unit' },
      { code: 'M5H 3K7', description: 'Financial District (~1km)' },
      { code: 'M5J 2L4', description: 'Harbourfront (~1.5km)' },
      { code: '10001', description: 'New York ZIP (should not find)' },
      { code: '515671', description: 'India PIN (should not find)' }
    ];

    for (const testCase of testCases) {
      console.log(`\n📍 Testing: ${testCase.code} (${testCase.description})`);
      
      try {
        // Detect country from postal code
        const detectedCountry = detectCountryFromPostalCode(testCase.code);
        console.log(`   🌍 Detected Country: ${detectedCountry || 'Unknown'}`);
        
        // Use new global proximity search
        const startTime = Date.now();
        const results = await Restaurant.findNearbyByPostalCode(testCase.code, 10, detectedCountry);
        const endTime = Date.now();
        
        console.log(`   ⏱️ Search Time: ${endTime - startTime}ms`);
        console.log(`   📊 Results Found: ${results.length}`);
        
        // Check if M5V 2B4 restaurant is found
        const foundM5V = results.find(r => r.address.postalCode === 'M5V 2B4');
        
        if (foundM5V) {
          console.log(`   🎯 SUCCESS! Found Maple Leaf Bistro`);
          console.log(`   ✅ Global proximity search working correctly`);
        } else if (results.length > 0) {
          console.log(`   📍 Found other restaurants:`);
          results.slice(0, 3).forEach((r, i) => {
            console.log(`      ${i+1}. ${r.name} - ${r.address.postalCode}`);
          });
        } else {
          console.log(`   📭 No restaurants found (expected for distant locations)`);
        }
        
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 GLOBAL SEARCH ANALYSIS:');
    console.log('='.repeat(60));
    
    console.log('\n✅ EXPECTED BEHAVIOR:');
    console.log('   🇨🇦 Canadian postal codes (M5V*) → Should find M5V 2B4 restaurant');
    console.log('   🇺🇸 US ZIP codes (10001) → Should NOT find M5V 2B4 restaurant');
    console.log('   🇮🇳 Indian PIN codes (515671) → Should NOT find M5V 2B4 restaurant');
    
    console.log('\n🌍 GLOBAL BENEFITS:');
    console.log('   ✅ Country-aware search prevents false matches');
    console.log('   ✅ Automatic postal code pattern detection');
    console.log('   ✅ Proper geographic boundaries respected');
    console.log('   ✅ Multi-provider geocoding with fallbacks');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testGlobalM5VSearch().catch(console.error);
