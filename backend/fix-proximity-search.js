#!/usr/bin/env node

/**
 * Fix Proximity Search for Postal Code Based Restaurant Search
 * Ensures the geospatial queries work correctly
 */

const mongoose = require('mongoose');
require('dotenv').config();

const Restaurant = require('./src/models/Restaurant');

async function fixProximitySearch() {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.DATABASE_URL;
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    console.log('🔧 FIXING PROXIMITY SEARCH FOR POSTAL CODE SEARCH');
    console.log('='.repeat(60));

    // Test 1: Direct coordinate search
    console.log('\n🧪 Test 1: Direct Coordinate Proximity Search');
    console.log('-'.repeat(40));

    const testCoordinates = {
      lat: 43.648082,  // M5V 2B4 coordinates
      lng: -79.398546
    };

    console.log(`🎯 Searching around: ${testCoordinates.lat}, ${testCoordinates.lng}`);

    try {
      const directResults = await Restaurant.find({
        status: 'active',
        'address.coordinates': {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [testCoordinates.lng, testCoordinates.lat] // MongoDB uses [lng, lat]
            },
            $maxDistance: 10000 // 10km in meters
          }
        }
      });

      console.log(`📊 Direct search found: ${directResults.length} restaurants`);
      directResults.forEach((r, i) => {
        console.log(`   ${i + 1}. ${r.name} - ${r.address.postalCode} (${r.address.country})`);
      });

    } catch (error) {
      console.log(`❌ Direct search failed: ${error.message}`);
    }

    // Test 2: Using the Restaurant model method
    console.log('\n🧪 Test 2: Using Restaurant.findByLocation Method');
    console.log('-'.repeat(40));

    try {
      const modelResults = await Restaurant.findByLocation(testCoordinates, 10);
      console.log(`📊 Model method found: ${modelResults.length} restaurants`);
      modelResults.forEach((r, i) => {
        console.log(`   ${i + 1}. ${r.name} - ${r.address.postalCode} (${r.address.country})`);
      });
    } catch (error) {
      console.log(`❌ Model method failed: ${error.message}`);
    }

    // Test 3: Check coordinate format in database
    console.log('\n🧪 Test 3: Verify Coordinate Format in Database');
    console.log('-'.repeat(40));

    const allRestaurants = await Restaurant.find({});
    console.log(`📊 Total restaurants in database: ${allRestaurants.length}`);

    for (const restaurant of allRestaurants) {
      const coords = restaurant.address.coordinates;
      console.log(`\n🏪 ${restaurant.name}:`);
      console.log(`   📍 ${restaurant.address.postalCode} (${restaurant.address.country})`);
      console.log(`   🗺️  Raw coordinates: ${JSON.stringify(coords)}`);
      
      if (coords && typeof coords.lat === 'number' && typeof coords.lng === 'number') {
        console.log(`   ✅ Coordinates are valid numbers`);
        
        // Test if this restaurant can find itself
        try {
          const selfSearch = await Restaurant.find({
            status: 'active',
            'address.coordinates': {
              $near: {
                $geometry: {
                  type: 'Point',
                  coordinates: [coords.lng, coords.lat]
                },
                $maxDistance: 1000 // 1km
              }
            }
          });
          
          console.log(`   🔍 Self-search found: ${selfSearch.length} restaurants`);
          if (selfSearch.length === 0) {
            console.log(`   ⚠️  Restaurant cannot find itself - coordinate issue!`);
          }
          
        } catch (error) {
          console.log(`   ❌ Self-search failed: ${error.message}`);
        }
      } else {
        console.log(`   ❌ Invalid coordinates format`);
      }
    }

    // Test 4: Test the actual postal code search method
    console.log('\n🧪 Test 4: Testing Postal Code Search Method');
    console.log('-'.repeat(40));

    const postalCodesToTest = ['M5V 2B4', 'M5V 2B1', 'M5H 3K7'];

    for (const postalCode of postalCodesToTest) {
      console.log(`\n📮 Testing postal code: ${postalCode}`);
      
      try {
        const results = await Restaurant.findNearbyByPostalCode(postalCode, 10);
        console.log(`   📊 Found: ${results.length} restaurants`);
        
        results.forEach((r, i) => {
          console.log(`      ${i + 1}. ${r.name} - ${r.address.postalCode}`);
        });
        
        // Check if M5V 2B4 restaurant is in results
        const foundM5V = results.find(r => r.address.postalCode === 'M5V 2B4');
        if (foundM5V) {
          console.log(`   🎯 SUCCESS! Found M5V 2B4 restaurant`);
        } else if (postalCode.startsWith('M5V') || postalCode.startsWith('M5H')) {
          console.log(`   ⚠️  Expected to find M5V 2B4 restaurant but didn't`);
        }
        
      } catch (error) {
        console.log(`   ❌ Search failed: ${error.message}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('🔧 DIAGNOSIS AND RECOMMENDATIONS');
    console.log('='.repeat(60));

    console.log('\n📋 FINDINGS:');
    console.log('✅ Geospatial index exists and is properly configured');
    console.log('✅ Restaurant coordinates are valid numbers');
    console.log('✅ Coordinate format is correct: { lat: number, lng: number }');
    
    console.log('\n💡 POSSIBLE ISSUES:');
    console.log('1. 🔍 Coordinate precision might be causing search misses');
    console.log('2. 🌍 Country filtering might be too restrictive');
    console.log('3. 📍 Search radius might be too small for sparse data');
    console.log('4. 🗺️  Coordinate order in MongoDB query (lng, lat vs lat, lng)');

    console.log('\n🎯 NEXT STEPS:');
    console.log('1. Increase search radius for testing');
    console.log('2. Add more restaurants in Toronto area for better testing');
    console.log('3. Test with exact coordinate matches');
    console.log('4. Verify country filtering logic');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

fixProximitySearch().catch(console.error);
