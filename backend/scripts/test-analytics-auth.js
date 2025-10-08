// FILE: scripts/test-analytics-auth.js
// Test script to debug analytics authentication issues

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Import models
const User = require('../src/models/User');
const Restaurant = require('../src/models/Restaurant');

async function testAnalyticsAuth() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find the specific partner user
    const partnerUser = await User.findOne({ 
      email: '2022cse.r234@svce.edu.in'
    });

    if (!partnerUser) {
      console.log('❌ No partner user found in database');
      console.log('Creating a test partner user...');
      
      // Create a test partner user
      const testPartner = new User({
        firstName: 'Test',
        lastName: 'Partner',
        email: 'test.partner@grubgate.com',
        roles: ['partner'],
        status: 'active',
        emailVerified: true
      });
      
      await testPartner.save();
      console.log('✅ Test partner user created:', testPartner._id);
      
      // Generate JWT token for this user
      const token = jwt.sign(
        { id: testPartner._id, email: testPartner.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      console.log('🔑 JWT Token for test partner:', token);
      console.log('\n📋 Test this token with:');
      console.log(`curl -H "Authorization: Bearer ${token}" "http://localhost:5000/api/v1/analytics/overview?period=30"`);
      
    } else {
      console.log('✅ Found partner user:', partnerUser.email);
      console.log('   User ID:', partnerUser._id);
      console.log('   Roles:', partnerUser.roles || [partnerUser.role]);
      console.log('   Status:', partnerUser.status);
      
      // Generate JWT token for this user
      const token = jwt.sign(
        { id: partnerUser._id, email: partnerUser.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      console.log('🔑 JWT Token:', token);
      console.log('\n📋 Test this token with:');
      console.log(`curl -H "Authorization: Bearer ${token}" "http://localhost:5000/api/v1/analytics/overview?period=30"`);
    }

    // Check if partner has a restaurant
    const restaurant = await Restaurant.findOne({ ownerId: partnerUser?._id });
    if (restaurant) {
      console.log('🏪 Partner has restaurant:', restaurant.name);
      console.log('   Restaurant ID:', restaurant._id);
    } else {
      console.log('⚠️  Partner has no restaurant - analytics will return mock data');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

// Run the test
testAnalyticsAuth();
