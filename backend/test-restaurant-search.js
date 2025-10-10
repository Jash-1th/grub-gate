// Test restaurant search by postal code
require('dotenv').config();
const mongoose = require('mongoose');
const Restaurant = require('./src/models/Restaurant');

async function testRestaurantSearch() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log('🗄️ Connected to MongoDB\n');

    // Test 1: Find restaurant ABC by exact postal code
    console.log('🔍 Test 1: Search for restaurants with postal code 515671');
    const exactMatch = await Restaurant.find({
      'address.postalCode': '515671'
    });
    console.log(`Found ${exactMatch.length} restaurants:`);
    exactMatch.forEach(r => {
      console.log(`- ${r.name} (${r.status}) - ${r.address.postalCode}, ${r.address.city}`);
      console.log(`  Coordinates: ${r.address.coordinates?.lat}, ${r.address.coordinates?.lng}`);
    });

    // Test 2: Find active restaurants only
    console.log('\n🔍 Test 2: Search for ACTIVE restaurants with postal code 515671');
    const activeMatch = await Restaurant.find({
      'address.postalCode': '515671',
      status: 'active'
    });
    console.log(`Found ${activeMatch.length} active restaurants:`);
    activeMatch.forEach(r => {
      console.log(`- ${r.name} (${r.status}) - ${r.address.postalCode}, ${r.address.city}`);
    });

    // Test 3: Check ABC restaurant status
    console.log('\n🔍 Test 3: Check ABC restaurant details');
    const abcRestaurant = await Restaurant.findOne({ name: 'ABC' });
    if (abcRestaurant) {
      console.log(`✅ Found ABC restaurant:`);
      console.log(`   Name: ${abcRestaurant.name}`);
      console.log(`   Status: ${abcRestaurant.status}`);
      console.log(`   Postal Code: ${abcRestaurant.address.postalCode}`);
      console.log(`   City: ${abcRestaurant.address.city}`);
      console.log(`   Coordinates: ${abcRestaurant.address.coordinates?.lat}, ${abcRestaurant.address.coordinates?.lng}`);
      console.log(`   Tags: [${abcRestaurant.tags?.join(', ') || 'none'}]`);
      
      if (abcRestaurant.status !== 'active') {
        console.log(`\n⚠️  ABC restaurant status is "${abcRestaurant.status}" - needs to be "active" to appear in customer searches`);
      }
    } else {
      console.log('❌ ABC restaurant not found');
    }

    // Test 4: Test the enhanced search method
    console.log('\n🔍 Test 4: Test enhanced postal code search (with coordinate fallback)');
    try {
      const nearbyRestaurants = await Restaurant.findNearbyByPostalCode('515671', 10);
      console.log(`Found ${nearbyRestaurants.length} restaurants using enhanced search:`);
      nearbyRestaurants.forEach(r => {
        console.log(`- ${r.name} (${r.status}) - ${r.address.postalCode}, ${r.address.city}`);
      });
    } catch (error) {
      console.log(`Enhanced search error: ${error.message}`);
    }

    console.log('\n🎯 Summary:');
    console.log('- If ABC shows up in Test 1: Coordinates populated successfully ✅');
    console.log('- If ABC shows up in Test 2: Restaurant is active and searchable ✅');
    console.log('- If ABC missing from Test 2: Change status to "active" in database');

  } catch (error) {
    console.error('🚨 Test error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testRestaurantSearch();
