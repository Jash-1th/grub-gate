#!/usr/bin/env node

/**
 * Test Nearby Postal Code Search for M5V 2B4
 * Tests the real MongoDB database to see nearby restaurant search results
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import the Restaurant model
const Restaurant = require('./src/models/Restaurant');

async function testNearbyPostalCodeSearch() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.DATABASE_URL;
    
    if (!mongoUri) {
      console.log('❌ MongoDB URI not found in environment variables');
      console.log('💡 Please set MONGODB_URI or DATABASE_URL in your .env file');
      console.log('📝 Example: MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/grubgate');
      process.exit(1);
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB successfully\n');

    // Test cases for M5V 2B4 area
    const testCases = [
      { code: 'M5V 2B4', description: 'Exact match (target location)' },
      { code: 'M5V 2B1', description: 'Same FSA, adjacent unit' },
      { code: 'M5V 2B3', description: 'Same FSA, adjacent unit' },
      { code: 'M5V 2B5', description: 'Same FSA, adjacent unit' },
      { code: 'M5V 2A1', description: 'Same FSA, different block' },
      { code: 'M5V 2C1', description: 'Same FSA, different block' },
      { code: 'M5H 3K7', description: 'Adjacent FSA (Financial District)' },
      { code: 'M5J 2L4', description: 'Adjacent FSA (Harbourfront)' },
      { code: 'M5K 1A1', description: 'Adjacent FSA (Entertainment District)' },
      { code: 'M5G 1X8', description: 'Adjacent FSA (Hospital District)' },
      { code: 'M5S 3M2', description: 'Adjacent FSA (University area)' },
      { code: 'M5T 1P7', description: 'Adjacent FSA (Chinatown)' }
    ];

    console.log('🧪 Testing Nearby Postal Code Search for M5V 2B4 Area\n');
    console.log('=' .repeat(80));

    for (const testCase of testCases) {
      console.log(`\n🔍 Testing: ${testCase.code} (${testCase.description})`);
      console.log('-'.repeat(60));

      try {
        // Use the Restaurant model's findNearbyByPostalCode method
        const restaurants = await Restaurant.findNearbyByPostalCode(testCase.code, 10);
        
        console.log(`📊 Found ${restaurants.length} restaurants`);
        
        if (restaurants.length > 0) {
          restaurants.slice(0, 5).forEach((restaurant, index) => {
            const postalCode = restaurant.address?.postalCode || 'N/A';
            const city = restaurant.address?.city || 'N/A';
            const rating = restaurant.rating || 0;
            const reviewCount = restaurant.reviewCount || 0;
            
            console.log(`   ${index + 1}. 🏪 ${restaurant.name}`);
            console.log(`      📍 ${postalCode} - ${city}`);
            console.log(`      ⭐ Rating: ${rating} (${reviewCount} reviews)`);
            console.log(`      🍽️ Cuisine: ${restaurant.cuisine?.join(', ') || 'N/A'}`);
            
            // Check if this restaurant is at M5V 2B4
            if (postalCode === 'M5V 2B4') {
              console.log(`      🎯 TARGET FOUND! This is the M5V 2B4 restaurant!`);
            }
            console.log('');
          });
          
          if (restaurants.length > 5) {
            console.log(`   ... and ${restaurants.length - 5} more restaurants`);
          }
        } else {
          console.log('   📭 No restaurants found for this postal code');
        }

      } catch (error) {
        console.error(`   ❌ Error testing ${testCase.code}:`, error.message);
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('🎯 SUMMARY: Testing Complete');
    console.log('💡 Look for "TARGET FOUND!" messages to see which searches found M5V 2B4 restaurants');
    console.log('📊 This shows how the proximity search algorithm works in practice');

  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('1. Check your MongoDB URI in .env file');
    console.log('2. Ensure your IP is whitelisted in MongoDB Atlas');
    console.log('3. Verify your database credentials');
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Additional function to check existing restaurants in M5V area
async function checkExistingM5VRestaurants() {
  try {
    console.log('\n🔍 Checking existing restaurants in M5V area...\n');
    
    // Find all restaurants with M5V postal codes
    const m5vRestaurants = await Restaurant.find({
      status: 'active',
      'address.postalCode': { $regex: '^M5V', $options: 'i' }
    }).sort({ 'address.postalCode': 1, rating: -1 });

    console.log(`📊 Found ${m5vRestaurants.length} restaurants in M5V area:`);
    
    if (m5vRestaurants.length > 0) {
      m5vRestaurants.forEach((restaurant, index) => {
        const postalCode = restaurant.address?.postalCode || 'N/A';
        const city = restaurant.address?.city || 'N/A';
        const rating = restaurant.rating || 0;
        
        console.log(`   ${index + 1}. 🏪 ${restaurant.name}`);
        console.log(`      📍 ${postalCode} - ${city}`);
        console.log(`      ⭐ Rating: ${rating}`);
        console.log(`      🍽️ Cuisine: ${restaurant.cuisine?.join(', ') || 'N/A'}`);
        console.log('');
      });
    } else {
      console.log('   📭 No restaurants found in M5V area');
      console.log('   💡 You may need to add some test restaurants first');
    }

  } catch (error) {
    console.error('❌ Error checking M5V restaurants:', error.message);
  }
}

// Run the tests
async function runAllTests() {
  await testNearbyPostalCodeSearch();
  await checkExistingM5VRestaurants();
}

// Execute if run directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { testNearbyPostalCodeSearch, checkExistingM5VRestaurants };
