// FILE: scripts/populateCoordinates.js
const mongoose = require('mongoose');
const Restaurant = require('../src/models/Restaurant');
const { geocodeAddress } = require('../src/services/geocodingService');
require('dotenv').config();

/**
 * Script to populate missing coordinates for existing restaurants
 * This script will geocode addresses and update restaurant documents with coordinates
 */

const populateCoordinates = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MongoDB URI not found. Please set MONGODB_URI or MONGO_URI in your .env file');
    }
    await mongoose.connect(mongoUri);
    console.log('🗄️ Connected to MongoDB');

    // Find restaurants without coordinates
    const restaurantsWithoutCoords = await Restaurant.find({
      $or: [
        { 'address.coordinates': { $exists: false } },
        { 'address.coordinates.lat': { $exists: false } },
        { 'address.coordinates.lng': { $exists: false } }
      ]
    });

    console.log(`📍 Found ${restaurantsWithoutCoords.length} restaurants without coordinates`);

    if (restaurantsWithoutCoords.length === 0) {
      console.log('✅ All restaurants already have coordinates!');
      process.exit(0);
    }

    let successCount = 0;
    let failureCount = 0;

    for (const restaurant of restaurantsWithoutCoords) {
      try {
        const { street, city, province, postalCode } = restaurant.address;
        
        if (!postalCode || !city || !province) {
          console.log(`⚠️ Skipping ${restaurant.name} - incomplete address info`);
          failureCount++;
          continue;
        }

        console.log(`🌍 Geocoding ${restaurant.name} at ${postalCode}, ${city}, ${province}`);

        // Geocode the address
        const coordinates = await geocodeAddress(postalCode, city, province, 'Canada');

        // Update the restaurant with coordinates
        restaurant.address.coordinates = {
          lat: coordinates.lat,
          lng: coordinates.lng
        };

        await restaurant.save();

        console.log(`✅ Updated coordinates for ${restaurant.name}: ${coordinates.lat}, ${coordinates.lng}`);
        successCount++;

        // Add a small delay to respect API rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`❌ Failed to geocode ${restaurant.name}:`, error.message);
        failureCount++;
      }
    }

    console.log('\n📊 Summary:');
    console.log(`✅ Successfully updated: ${successCount} restaurants`);
    console.log(`❌ Failed to update: ${failureCount} restaurants`);
    console.log(`📍 Total processed: ${successCount + failureCount} restaurants`);

  } catch (error) {
    console.error('🚨 Script error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the script
if (require.main === module) {
  populateCoordinates();
}

module.exports = populateCoordinates;
