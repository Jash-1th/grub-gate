// Script to create ABC Restaurant for testing settings API
const mongoose = require('mongoose');
const Restaurant = require('./backend/src/models/Restaurant');
const User = require('./backend/src/models/User');
require('dotenv').config({ path: './backend/.env' });

async function createABCRestaurant() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📦 Connected to MongoDB');

    // First, create a test user for the restaurant owner
    let testUser = await User.findOne({ email: 'abc@restaurant.com' });
    
    if (!testUser) {
      testUser = await User.create({
        firstName: 'ABC',
        lastName: 'Owner',
        email: 'abc@restaurant.com',
        phoneNumber: '+1-555-123-4567',
        roles: ['partner'],
        emailVerified: true,
        phoneVerified: true,
        notificationPreferences: {
          emailNotifications: true,
          smsNotifications: true,
          orderAlerts: true,
          customerMessages: true,
          systemUpdates: false
        },
        billingInfo: {
          paymentMethod: 'Visa ending in 9876',
          taxId: '98-7654321',
          billingAddress: '789 Business Ave, Montreal, QC H3B 2Y7'
        }
      });
      console.log('👤 Created test user for ABC Restaurant');
    }

    // Check if ABC Restaurant already exists
    let abcRestaurant = await Restaurant.findOne({ name: 'ABC Restaurant' });
    
    if (abcRestaurant) {
      console.log('🏪 ABC Restaurant already exists, updating...');
      
      // Update existing restaurant with new schema
      abcRestaurant = await Restaurant.findOneAndUpdate(
        { name: 'ABC Restaurant' },
        {
          description: 'ABC Restaurant - A modern dining experience with diverse cuisine options',
          cuisine: ['American', 'International', 'Fusion'],
          businessType: 'restaurant',
          ownerId: testUser._id,
          address: {
            street: '123 ABC Street',
            city: 'Montreal',
            province: 'QC',
            postalCode: 'H3A 1B2',
            coordinates: {
              lat: 45.5017,
              lng: -73.5673
            }
          },
          phone: '+1-514-555-ABC1',
          email: 'info@abcrestaurant.com',
          website: 'https://abcrestaurant.com',
          deliverySettings: {
            radius: 12,
            fee: 4.99,
            minOrderAmount: 25.00,
            avgDeliveryTime: 35
          },
          operatingHours: {
            monday: { open: '11:00', close: '22:00', closed: false },
            tuesday: { open: '11:00', close: '22:00', closed: false },
            wednesday: { open: '11:00', close: '22:00', closed: false },
            thursday: { open: '11:00', close: '22:00', closed: false },
            friday: { open: '11:00', close: '23:00', closed: false },
            saturday: { open: '10:00', close: '23:00', closed: false },
            sunday: { open: '10:00', close: '21:00', closed: false }
          },
          status: 'active',
          rating: 4.5,
          reviewCount: 127,
          isPopular: true,
          tags: ['family-friendly', 'modern', 'diverse-menu', 'quick-service']
        },
        { new: true, runValidators: true }
      );
    } else {
      // Create new ABC Restaurant
      abcRestaurant = await Restaurant.create({
        name: 'ABC Restaurant',
        description: 'ABC Restaurant - A modern dining experience with diverse cuisine options',
        cuisine: ['American', 'International', 'Fusion'],
        businessType: 'restaurant',
        ownerId: testUser._id,
        address: {
          street: '123 ABC Street',
          city: 'Montreal',
          province: 'QC',
          postalCode: 'H3A 1B2',
          coordinates: {
            lat: 45.5017,
            lng: -73.5673
          }
        },
        phone: '+1-514-555-ABC1',
        email: 'info@abcrestaurant.com',
        website: 'https://abcrestaurant.com',
        deliverySettings: {
          radius: 12,
          fee: 4.99,
          minOrderAmount: 25.00,
          avgDeliveryTime: 35
        },
        operatingHours: {
          monday: { open: '11:00', close: '22:00', closed: false },
          tuesday: { open: '11:00', close: '22:00', closed: false },
          wednesday: { open: '11:00', close: '22:00', closed: false },
          thursday: { open: '11:00', close: '22:00', closed: false },
          friday: { open: '11:00', close: '23:00', closed: false },
          saturday: { open: '10:00', close: '23:00', closed: false },
          sunday: { open: '10:00', close: '21:00', closed: false }
        },
        status: 'active',
        rating: 4.5,
        reviewCount: 127,
        isPopular: true,
        tags: ['family-friendly', 'modern', 'diverse-menu', 'quick-service']
      });
      console.log('🏪 Created ABC Restaurant');
    }

    // Update the user with the restaurant reference
    await User.findByIdAndUpdate(testUser._id, {
      restaurantId: abcRestaurant._id
    });

    console.log('\n✅ ABC Restaurant Setup Complete!');
    console.log('📋 Restaurant Details:');
    console.log(`   ID: ${abcRestaurant._id}`);
    console.log(`   Name: ${abcRestaurant.name}`);
    console.log(`   Owner: ${testUser.firstName} ${testUser.lastName} (${testUser.email})`);
    console.log(`   Address: ${abcRestaurant.address.street}, ${abcRestaurant.address.city}`);
    console.log(`   Phone: ${abcRestaurant.phone}`);
    console.log(`   Email: ${abcRestaurant.email}`);
    console.log(`   Cuisine: ${abcRestaurant.cuisine.join(', ')}`);
    console.log(`   Delivery Radius: ${abcRestaurant.deliverySettings.radius}km`);
    console.log(`   Delivery Fee: $${abcRestaurant.deliverySettings.fee}`);
    
    console.log('\n🧪 Test the settings API with:');
    console.log(`   Restaurant ID: ${abcRestaurant._id}`);
    console.log(`   User Email: ${testUser.email}`);
    console.log(`   Mock Restaurant ID: abc_001`);
    
  } catch (error) {
    console.error('❌ Error creating ABC Restaurant:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📦 Disconnected from MongoDB');
  }
}

// Run the script
createABCRestaurant();
