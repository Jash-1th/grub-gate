#!/usr/bin/env node

const mongoose = require('mongoose');
require('dotenv').config();

const Restaurant = require('./src/models/Restaurant');
const { geocodeAddress } = require('./src/services/geocodingService');

async function fixM5VCoordinates() {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.DATABASE_URL;
    
    if (!mongoUri) {
      console.log('❌ MongoDB URI not found');
      return;
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Find the M5V 2B4 restaurant
    const restaurant = await Restaurant.findOne({
      'address.postalCode': 'M5V 2B4'
    });

    if (!restaurant) {
      console.log('❌ No restaurant found at M5V 2B4');
      return;
    }

    console.log('🏪 Found restaurant:', restaurant.name);
    console.log('📍 Current coordinates:', restaurant.address.coordinates);

    // Check if coordinates already exist
    if (restaurant.address.coordinates && 
        restaurant.address.coordinates.lat && 
        restaurant.address.coordinates.lng) {
      console.log('✅ Coordinates already exist, no need to update');
      return;
    }

    console.log('\n🌍 Adding coordinates for M5V 2B4...');

    try {
      // Geocode the address properly for Canada
      const coordinates = await geocodeAddress(
        'M5V 2B4', 
        'Toronto', 
        'Ontario', 
        'Canada'
      );

      console.log('✅ Geocoding successful:', coordinates);

      // Update the restaurant with coordinates
      restaurant.address.coordinates = {
        lat: coordinates.lat,
        lng: coordinates.lng
      };

      await restaurant.save();

      console.log('✅ Restaurant updated successfully!');
      console.log(`   🌍 New coordinates: ${coordinates.lat}, ${coordinates.lng}`);
      console.log(`   📍 Address: ${restaurant.address.street}, ${restaurant.address.city}`);

    } catch (geocodingError) {
      console.log('⚠️  Geocoding failed, using default Toronto coordinates');
      
      // Use default coordinates for M5V 2B4 area (King West/Entertainment District)
      const defaultCoordinates = {
        lat: 43.6426,  // M5V 2B4 approximate location
        lng: -79.3871
      };

      restaurant.address.coordinates = defaultCoordinates;
      await restaurant.save();

      console.log('✅ Restaurant updated with default coordinates');
      console.log(`   🌍 Coordinates: ${defaultCoordinates.lat}, ${defaultCoordinates.lng}`);
    }

    console.log('\n🧪 Now testing proximity search...');
    
    // Test the proximity search now that coordinates are set
    const testCodes = ['M5V 2B1', 'M5H 3K7', 'M5J 2L4'];
    
    for (const code of testCodes) {
      console.log(`\n🔍 Testing search from ${code}:`);
      try {
        const results = await Restaurant.findNearbyByPostalCode(code, 10);
        const foundM5V = results.find(r => r.address.postalCode === 'M5V 2B4');
        
        if (foundM5V) {
          console.log(`   🎯 SUCCESS! Found ${foundM5V.name} from ${code}`);
        } else {
          console.log(`   📭 Maple Leaf Bistro not found from ${code}`);
        }
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

fixM5VCoordinates().catch(console.error);
