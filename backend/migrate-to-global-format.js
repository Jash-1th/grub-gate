#!/usr/bin/env node

/**
 * Migration Script: Convert Existing Restaurants to Global Format
 * Updates existing restaurants to use the new global address schema
 */

const mongoose = require('mongoose');
require('dotenv').config();

const Restaurant = require('./src/models/Restaurant');
const { detectCountryFromPostalCode, geocodeGlobalAddress } = require('./src/services/globalGeocodingService');

async function migrateToGlobalFormat() {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.DATABASE_URL;
    
    if (!mongoUri) {
      console.log('❌ MongoDB URI not found');
      return;
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    console.log('🔄 MIGRATING RESTAURANTS TO GLOBAL FORMAT');
    console.log('='.repeat(60));

    // Find all restaurants that need migration (missing country field)
    const restaurantsToMigrate = await Restaurant.find({
      $or: [
        { 'address.country': { $exists: false } },
        { 'address.country': null },
        { 'address.country': '' }
      ]
    });

    console.log(`📊 Found ${restaurantsToMigrate.length} restaurants to migrate\n`);

    if (restaurantsToMigrate.length === 0) {
      console.log('✅ All restaurants already use global format!');
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    for (const restaurant of restaurantsToMigrate) {
      try {
        console.log(`🏪 Migrating: ${restaurant.name}`);
        console.log(`   Current Address: ${restaurant.address.postalCode}`);

        // Detect country from postal code
        const detectedCountry = detectCountryFromPostalCode(restaurant.address.postalCode);
        console.log(`   🌍 Detected Country: ${detectedCountry || 'Unknown'}`);

        if (!detectedCountry) {
          console.log(`   ⚠️ Could not detect country, skipping...`);
          errorCount++;
          continue;
        }

        // Build new global address format
        const newAddress = {
          country: detectedCountry,
          addressLine1: restaurant.address.street || restaurant.address.addressLine1 || 'Address not specified',
          addressLine2: restaurant.address.addressLine2 || '',
          city: restaurant.address.city,
          state: restaurant.address.province || restaurant.address.state || '',
          postalCode: restaurant.address.postalCode,
          coordinates: restaurant.address.coordinates || {},
          timezone: restaurant.address.timezone || '',
          formattedAddress: restaurant.address.formattedAddress || ''
        };

        // If coordinates are missing, try to geocode
        if (!newAddress.coordinates.lat || !newAddress.coordinates.lng) {
          try {
            console.log(`   🌍 Geocoding address...`);
            const geocodedResult = await geocodeGlobalAddress(newAddress);
            
            newAddress.coordinates = {
              lat: geocodedResult.lat,
              lng: geocodedResult.lng
            };
            newAddress.formattedAddress = geocodedResult.formatted_address;
            
            console.log(`   ✅ Geocoded: ${geocodedResult.lat}, ${geocodedResult.lng}`);
          } catch (geocodingError) {
            console.log(`   ⚠️ Geocoding failed: ${geocodingError.message}`);
            // Keep existing coordinates if any
          }
        }

        // Update restaurant with new address format
        restaurant.address = newAddress;
        await restaurant.save();

        console.log(`   ✅ Migration successful!`);
        console.log(`   📍 New Format: ${newAddress.country} - ${newAddress.postalCode}`);
        successCount++;

      } catch (error) {
        console.log(`   ❌ Migration failed: ${error.message}`);
        errorCount++;
      }

      console.log(''); // Add spacing between restaurants
    }

    console.log('='.repeat(60));
    console.log('📊 MIGRATION SUMMARY:');
    console.log('='.repeat(60));
    console.log(`✅ Successfully migrated: ${successCount} restaurants`);
    console.log(`❌ Failed migrations: ${errorCount} restaurants`);
    console.log(`📊 Total processed: ${restaurantsToMigrate.length} restaurants`);

    if (successCount > 0) {
      console.log('\n🎉 MIGRATION COMPLETE!');
      console.log('✅ Your restaurants now support global addressing');
      console.log('✅ Proximity search will work worldwide');
      console.log('✅ Country-aware geocoding enabled');
    }

    // Test the migrated M5V 2B4 restaurant
    console.log('\n🧪 TESTING MIGRATED M5V 2B4 RESTAURANT:');
    console.log('-'.repeat(40));

    const migratedRestaurant = await Restaurant.findOne({
      'address.postalCode': 'M5V 2B4'
    });

    if (migratedRestaurant) {
      console.log(`🏪 Restaurant: ${migratedRestaurant.name}`);
      console.log(`🌍 Country: ${migratedRestaurant.address.country}`);
      console.log(`📍 Full Address: ${migratedRestaurant.fullAddress}`);
      console.log(`🗺️ Coordinates: ${migratedRestaurant.address.coordinates.lat}, ${migratedRestaurant.address.coordinates.lng}`);

      // Test proximity search with migrated data
      console.log('\n🔍 Testing proximity search...');
      const nearbyResults = await Restaurant.findNearbyByPostalCode('M5V 2B1', 10, 'CA');
      
      const foundMigrated = nearbyResults.find(r => r.address.postalCode === 'M5V 2B4');
      if (foundMigrated) {
        console.log('🎯 SUCCESS! Proximity search now finds M5V 2B4 from nearby postal codes');
      } else {
        console.log('⚠️ Proximity search still needs adjustment');
      }
    }

  } catch (error) {
    console.error('❌ Migration error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

migrateToGlobalFormat().catch(console.error);
