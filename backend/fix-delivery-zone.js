#!/usr/bin/env node

// FILE: backend/fix-delivery-zone.js
/**
 * Quick fix to add delivery zone to Maple Leaf Bistro
 * Uses the existing database connection setup
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function fixDeliveryZone() {
  try {
    // Import the existing database connection
    const connectDB = require('./src/config/database');
    const Restaurant = require('./src/models/Restaurant');

    console.log('🔗 Connecting to database...');
    await connectDB();
    console.log('✅ Connected to database');

    // Find and update the restaurant
    const restaurantId = '68e73d168c18e7fd776a6327';
    console.log('🔍 Finding restaurant:', restaurantId);

    const restaurant = await Restaurant.findById(restaurantId);
    
    if (!restaurant) {
      console.log('❌ Restaurant not found!');
      return;
    }

    console.log('🏪 Found:', restaurant.name);
    console.log('📍 Current location:', restaurant.location);
    console.log('🚚 Current delivery zone:', restaurant.deliveryZone);

    // Update delivery zone and location
    const updateData = {
      deliveryZone: {
        radius: 5.0,        // 5km delivery radius
        fee: 2.99,          // $2.99 delivery fee
        minOrder: 15.00,    // $15 minimum order
        enabled: true       // Delivery enabled
      },
      location: {
        type: 'Point',
        coordinates: [-79.3871, 43.6426] // Toronto coordinates
      }
    };

    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      restaurantId,
      { $set: updateData },
      { new: true }
    );

    console.log('✅ Restaurant updated successfully!');
    console.log('🚚 New delivery zone:', updatedRestaurant.deliveryZone);
    console.log('📍 New location:', updatedRestaurant.location);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

// Run the fix
fixDeliveryZone();
