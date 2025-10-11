#!/usr/bin/env node

// FILE: backend/check-restaurant-data.js
/**
 * Quick check of restaurant data to see what fields exist
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function checkRestaurantData() {
  try {
    // Import the existing database connection
    const connectDB = require('./src/config/database');
    const Restaurant = require('./src/models/Restaurant');

    console.log('🔗 Connecting to database...');
    await connectDB();
    console.log('✅ Connected to database');

    // Find the restaurant
    const restaurantId = '68e73d168c18e7fd776a6327';
    console.log('🔍 Finding restaurant:', restaurantId);

    const restaurant = await Restaurant.findById(restaurantId);
    
    if (!restaurant) {
      console.log('❌ Restaurant not found!');
      return;
    }

    console.log('🏪 === COMPLETE RESTAURANT DATA ===');
    console.log('Name:', restaurant.name);
    console.log('Status:', restaurant.status);
    
    console.log('\n📍 === ADDRESS DATA ===');
    console.log('Address:', JSON.stringify(restaurant.address, null, 2));
    
    console.log('\n🚚 === DELIVERY SETTINGS ===');
    console.log('Delivery Settings:', JSON.stringify(restaurant.deliverySettings, null, 2));
    
    console.log('\n🔍 === FIELD EXISTENCE CHECK ===');
    console.log('Has address:', !!restaurant.address);
    console.log('Has address.coordinates:', !!restaurant.address?.coordinates);
    console.log('Has address.coordinates.lat:', restaurant.address?.coordinates?.lat);
    console.log('Has address.coordinates.lng:', restaurant.address?.coordinates?.lng);
    console.log('Has deliverySettings:', !!restaurant.deliverySettings);
    console.log('Has deliverySettings.radius:', restaurant.deliverySettings?.radius);
    
    console.log('\n✅ === VALIDATION REQUIREMENTS ===');
    const hasCoords = restaurant.address?.coordinates?.lat && restaurant.address?.coordinates?.lng;
    const hasRadius = restaurant.deliverySettings?.radius;
    
    console.log('Coordinates valid:', hasCoords);
    console.log('Delivery radius valid:', hasRadius);
    console.log('Ready for distance calculation:', hasCoords && hasRadius);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

// Run the check
checkRestaurantData();
