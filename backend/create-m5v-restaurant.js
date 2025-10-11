#!/usr/bin/env node

/**
 * Create Test Restaurant at M5V 2B4 for Proximity Testing
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Restaurant = require('./src/models/Restaurant');
const User = require('./src/models/User');

async function createM5VRestaurant() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.DATABASE_URL;
    
    if (!mongoUri) {
      console.log('❌ MongoDB URI not found in environment variables');
      process.exit(1);
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB successfully\n');

    // Check if restaurant already exists at M5V 2B4
    const existingRestaurant = await Restaurant.findOne({
      'address.postalCode': 'M5V 2B4'
    });

    if (existingRestaurant) {
      console.log('🎯 Restaurant already exists at M5V 2B4:');
      console.log(`   🏪 ${existingRestaurant.name}`);
      console.log(`   📍 ${existingRestaurant.address.postalCode} - ${existingRestaurant.address.city}`);
      console.log('✅ No need to create a new one\n');
      return existingRestaurant;
    }

    // Find or create a partner user
    let partnerUser = await User.findOne({ role: 'partner' });
    
    if (!partnerUser) {
      console.log('👤 Creating partner user...');
      partnerUser = await User.create({
        firstName: 'John',
        lastName: 'Smith',
        email: 'partner.m5v@grubgate.com',
        password: 'hashedpassword123', // In real app, this would be properly hashed
        role: 'partner',
        isEmailVerified: true
      });
      console.log('✅ Partner user created');
    }

    console.log('🏪 Creating test restaurant at M5V 2B4...');

    // Create restaurant at M5V 2B4
    const restaurantData = {
      name: 'King West Bistro',
      description: 'Premium dining experience in the heart of Toronto\'s Entertainment District. Fresh, locally-sourced ingredients with innovative Canadian cuisine.',
      cuisine: ['Canadian', 'Contemporary', 'Bistro'],
      businessType: 'restaurant',
      ownerId: partnerUser._id,
      address: {
        street: '123 King Street West',
        city: 'Toronto',
        province: 'ON',
        postalCode: 'M5V 2B4',
        coordinates: {
          lat: 43.6426,  // Actual coordinates for M5V 2B4 area
          lng: -79.3871
        }
      },
      phone: '+1-416-555-0123',
      email: 'info@kingwestbistro.com',
      website: 'https://kingwestbistro.com',
      logo: '/images/king-west-bistro-logo.jpg',
      operatingHours: {
        monday: { open: '11:00', close: '22:00', closed: false },
        tuesday: { open: '11:00', close: '22:00', closed: false },
        wednesday: { open: '11:00', close: '22:00', closed: false },
        thursday: { open: '11:00', close: '23:00', closed: false },
        friday: { open: '11:00', close: '23:00', closed: false },
        saturday: { open: '10:00', close: '23:00', closed: false },
        sunday: { open: '10:00', close: '22:00', closed: false }
      },
      deliverySettings: {
        radius: 15, // 15km delivery radius
        fee: 4.99,
        minOrderAmount: 25.00,
        avgDeliveryTime: 35
      },
      rating: 4.6,
      reviewCount: 127,
      totalOrders: 1250,
      isPopular: true,
      tags: ['fine-dining', 'local-ingredients', 'patio', 'wine-bar', 'date-night'],
      commissionRate: 15,
      businessLicense: 'TOR-REST-2024-001234',
      taxId: 'HST-123456789',
      status: 'active',
      registrationComplete: true,
      registrationStage: 3
    };

    const restaurant = await Restaurant.create(restaurantData);

    console.log('✅ Test restaurant created successfully!');
    console.log(`   🏪 Name: ${restaurant.name}`);
    console.log(`   📍 Address: ${restaurant.address.street}, ${restaurant.address.city}`);
    console.log(`   📮 Postal Code: ${restaurant.address.postalCode}`);
    console.log(`   🌍 Coordinates: ${restaurant.address.coordinates.lat}, ${restaurant.address.coordinates.lng}`);
    console.log(`   ⭐ Rating: ${restaurant.rating} (${restaurant.reviewCount} reviews)`);
    console.log(`   🚚 Delivery: ${restaurant.deliverySettings.radius}km radius, $${restaurant.deliverySettings.fee} fee`);
    console.log(`   🍽️ Cuisine: ${restaurant.cuisine.join(', ')}`);
    console.log(`   🏷️ Tags: ${restaurant.tags.join(', ')}`);

    return restaurant;

  } catch (error) {
    console.error('❌ Error creating restaurant:', error.message);
    if (error.code === 11000) {
      console.log('💡 Restaurant with this email or name might already exist');
    }
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Execute if run directly
if (require.main === module) {
  createM5VRestaurant().catch(console.error);
}

module.exports = { createM5VRestaurant };
