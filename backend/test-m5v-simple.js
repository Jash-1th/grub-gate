#!/usr/bin/env node

const mongoose = require('mongoose');
require('dotenv').config();

const Restaurant = require('./src/models/Restaurant');

async function testM5VSearch() {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.DATABASE_URL;
    
    if (!mongoUri) {
      console.log('❌ MongoDB URI not found');
      return;
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // 1. Check existing M5V 2B4 restaurant
    console.log('🔍 Checking existing M5V 2B4 restaurant...');
    const m5vRestaurant = await Restaurant.findOne({
      'address.postalCode': 'M5V 2B4'
    });

    if (m5vRestaurant) {
      console.log('✅ Found existing restaurant:');
      console.log(`   🏪 Name: ${m5vRestaurant.name}`);
      console.log(`   📍 Postal Code: ${m5vRestaurant.address.postalCode}`);
      console.log(`   🌍 Coordinates: ${m5vRestaurant.address.coordinates ? 
        `${m5vRestaurant.address.coordinates.lat}, ${m5vRestaurant.address.coordinates.lng}` : 
        'NOT SET ❌'}`);
      console.log(`   ⭐ Rating: ${m5vRestaurant.rating}`);
      console.log(`   📧 Email: ${m5vRestaurant.email}`);
    } else {
      console.log('❌ No restaurant found at M5V 2B4');
    }

    console.log('\n' + '='.repeat(60));
    console.log('🧪 TESTING NEARBY POSTAL CODE SEARCH');
    console.log('='.repeat(60));

    // 2. Test exact match search
    console.log('\n🎯 Test 1: Exact Match Search (M5V 2B4)');
    const exactResults = await Restaurant.findNearbyByPostalCode('M5V 2B4', 10);
    console.log(`📊 Found ${exactResults.length} restaurants`);
    
    if (exactResults.length > 0) {
      exactResults.forEach((r, i) => {
        console.log(`   ${i+1}. 🏪 ${r.name} - ${r.address.postalCode}`);
      });
    }

    // 3. Test nearby postal codes
    const testCodes = [
      'M5V 2B1', 'M5V 2B3', 'M5V 2B5', 
      'M5V 2A1', 'M5V 2C1',
      'M5H 3K7', 'M5J 2L4'
    ];

    for (const code of testCodes) {
      console.log(`\n🔍 Test: Searching from ${code}`);
      try {
        const results = await Restaurant.findNearbyByPostalCode(code, 10);
        console.log(`📊 Found ${results.length} restaurants`);
        
        // Check if M5V 2B4 restaurant is in results
        const foundM5V = results.find(r => r.address.postalCode === 'M5V 2B4');
        if (foundM5V) {
          console.log(`   🎯 SUCCESS! Found Maple Leaf Bistro from ${code}`);
        } else if (results.length > 0) {
          console.log(`   📍 Found other restaurants: ${results.map(r => r.address.postalCode).join(', ')}`);
        } else {
          console.log(`   📭 No restaurants found`);
        }
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('💡 ANALYSIS:');
    console.log('='.repeat(60));
    
    if (m5vRestaurant && !m5vRestaurant.address.coordinates) {
      console.log('⚠️  The M5V 2B4 restaurant has NO COORDINATES');
      console.log('📍 This means:');
      console.log('   ✅ Exact postal code searches will work');
      console.log('   ❌ Coordinate-based proximity searches will NOT find it');
      console.log('   ✅ Partial postal code matches (M5V*) will work');
      console.log('\n💡 To fix: Add coordinates to enable full proximity search');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testM5VSearch().catch(console.error);
