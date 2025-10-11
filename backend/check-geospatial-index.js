#!/usr/bin/env node

/**
 * Check MongoDB Geospatial Index for Restaurant Proximity Search
 */

const mongoose = require('mongoose');
require('dotenv').config();

async function checkGeospatialIndex() {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.DATABASE_URL;
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    console.log('🔍 CHECKING GEOSPATIAL INDEX AND COORDINATES');
    console.log('='.repeat(60));

    // Get the restaurants collection
    const db = mongoose.connection.db;
    const collection = db.collection('restaurants');

    // Check indexes
    console.log('\n📊 Current Indexes:');
    const indexes = await collection.indexes();
    indexes.forEach((index, i) => {
      console.log(`   ${i + 1}. ${JSON.stringify(index.key)} - ${index.name}`);
    });

    // Check if 2dsphere index exists
    const has2dsphere = indexes.some(index => 
      index.key && index.key['address.coordinates'] === '2dsphere'
    );

    if (has2dsphere) {
      console.log('\n✅ 2dsphere index exists for address.coordinates');
    } else {
      console.log('\n❌ 2dsphere index missing for address.coordinates');
      console.log('🔧 Creating 2dsphere index...');
      
      try {
        await collection.createIndex({ 'address.coordinates': '2dsphere' });
        console.log('✅ 2dsphere index created successfully');
      } catch (error) {
        console.log('❌ Failed to create index:', error.message);
      }
    }

    // Check restaurant coordinates
    console.log('\n🏪 Restaurant Coordinates Check:');
    console.log('-'.repeat(40));

    const restaurants = await collection.find({}).toArray();
    
    for (const restaurant of restaurants) {
      console.log(`\n🏪 ${restaurant.name}`);
      console.log(`   📍 Postal Code: ${restaurant.address?.postalCode || 'N/A'}`);
      console.log(`   🌍 Country: ${restaurant.address?.country || 'N/A'}`);
      
      const coords = restaurant.address?.coordinates;
      if (coords && coords.lat && coords.lng) {
        console.log(`   🗺️  Coordinates: ${coords.lat}, ${coords.lng} ✅`);
        
        // Validate coordinates are numbers
        if (typeof coords.lat === 'number' && typeof coords.lng === 'number') {
          console.log(`   ✅ Coordinates are valid numbers`);
        } else {
          console.log(`   ❌ Coordinates are not numbers: lat=${typeof coords.lat}, lng=${typeof coords.lng}`);
        }
      } else {
        console.log(`   ❌ Missing or invalid coordinates`);
      }
    }

    // Test proximity search manually
    console.log('\n🧪 Manual Proximity Search Test:');
    console.log('-'.repeat(40));

    // Find M5V 2B4 restaurant
    const m5vRestaurant = await collection.findOne({
      'address.postalCode': 'M5V 2B4'
    });

    if (m5vRestaurant && m5vRestaurant.address?.coordinates) {
      const coords = m5vRestaurant.address.coordinates;
      console.log(`\n🎯 Testing proximity search around M5V 2B4:`);
      console.log(`   📍 Center: ${coords.lat}, ${coords.lng}`);

      // Test $near query
      try {
        const nearbyRestaurants = await collection.find({
          'address.coordinates': {
            $near: {
              $geometry: {
                type: 'Point',
                coordinates: [coords.lng, coords.lat]
              },
              $maxDistance: 10000 // 10km in meters
            }
          }
        }).toArray();

        console.log(`   📊 Found ${nearbyRestaurants.length} restaurants within 10km`);
        nearbyRestaurants.forEach((r, i) => {
          console.log(`      ${i + 1}. ${r.name} - ${r.address?.postalCode}`);
        });

      } catch (error) {
        console.log(`   ❌ Proximity search failed: ${error.message}`);
      }
    } else {
      console.log('\n❌ M5V 2B4 restaurant not found or missing coordinates');
    }

    console.log('\n' + '='.repeat(60));
    console.log('💡 RECOMMENDATIONS:');
    console.log('='.repeat(60));
    
    if (has2dsphere) {
      console.log('✅ Geospatial index is properly configured');
    } else {
      console.log('🔧 Ensure 2dsphere index exists for proximity search');
    }
    
    console.log('🔧 Ensure all restaurants have valid coordinates');
    console.log('🔧 Coordinates should be numbers, not strings');
    console.log('🔧 Format: { lat: 43.648082, lng: -79.398546 }');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

checkGeospatialIndex().catch(console.error);
