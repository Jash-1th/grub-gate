#!/usr/bin/env node

// FILE: backend/fix-restaurant-delivery.js
/**
 * Fix Maple Leaf Bistro delivery zone configuration
 */

const mongoose = require('mongoose');

// Restaurant schema (flexible)
const restaurantSchema = new mongoose.Schema({}, { strict: false });
const Restaurant = mongoose.model('Restaurant', restaurantSchema);

async function fixRestaurantDelivery() {
  try {
    // Connect to MongoDB
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://grubgate:grubgate123@cluster0.f9wza.mongodb.net/grubgate?retryWrites=true&w=majority');
    console.log('✅ Connected to MongoDB');

    // Find the restaurant
    const restaurantId = '68e73d168c18e7fd776a6327';
    console.log('🔍 Looking for restaurant:', restaurantId);
    
    const restaurant = await Restaurant.findById(restaurantId);
    
    if (!restaurant) {
      console.log('❌ Restaurant not found!');
      return;
    }

    console.log('🏪 Found Restaurant:', restaurant.name);
    console.log('📍 Current Address:', restaurant.address);
    console.log('📍 Current Location:', restaurant.location);
    console.log('🚚 Current Delivery Zone:', restaurant.deliveryZone);

    // Check if delivery zone needs to be added/updated
    if (!restaurant.deliveryZone || !restaurant.deliveryZone.radius) {
      console.log('🔧 Adding delivery zone configuration...');
      
      restaurant.deliveryZone = {
        radius: 5.0,        // 5km delivery radius
        fee: 2.99,          // $2.99 delivery fee
        minOrder: 15.00,    // $15 minimum order
        enabled: true       // Delivery enabled
      };
      
      console.log('✅ Added delivery zone:', restaurant.deliveryZone);
    }

    // Check if location coordinates need to be added/updated
    if (!restaurant.location || !restaurant.location.coordinates) {
      console.log('🔧 Adding location coordinates...');
      
      // Toronto coordinates for Maple Leaf Bistro
      restaurant.location = {
        type: 'Point',
        coordinates: [-79.3871, 43.6426] // [longitude, latitude]
      };
      
      console.log('✅ Added location coordinates:', restaurant.location);
    }

    // Save the updated restaurant
    await restaurant.save();
    console.log('💾 Restaurant updated successfully!');

    // Verify the update
    const updatedRestaurant = await Restaurant.findById(restaurantId);
    console.log('🔍 Verification - Updated Restaurant:');
    console.log('🚚 Delivery Zone:', updatedRestaurant.deliveryZone);
    console.log('📍 Location:', updatedRestaurant.location);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the fix
fixRestaurantDelivery();
