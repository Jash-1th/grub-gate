// Test postal code 515680 to see if it finds ABC restaurant
require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');
const Restaurant = require('./src/models/Restaurant');
const { geocodeAddress, calculateDistance } = require('./src/services/geocodingService');

async function test515680() {
  console.log('🎯 Testing Postal Code 515680 vs ABC Restaurant (515671)\n');

  try {
    // Connect to MongoDB to get ABC coordinates
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log('🗄️ Connected to MongoDB\n');

    // Get ABC restaurant coordinates
    const abcRestaurant = await Restaurant.findOne({ name: 'ABC' });
    console.log('📍 ABC Restaurant Details:');
    console.log(`   Location: ${abcRestaurant.address.postalCode}, ${abcRestaurant.address.city}`);
    console.log(`   Coordinates: ${abcRestaurant.address.coordinates.lat}, ${abcRestaurant.address.coordinates.lng}\n`);

    // Test geocoding 515680
    console.log('🌍 Geocoding 515680:');
    try {
      const coords515680 = await geocodeAddress('515680', 'Dharmavaram', 'Andhra Pradesh', 'India');
      console.log(`   Coordinates: ${coords515680.lat}, ${coords515680.lng}`);
      console.log(`   Provider: ${coords515680.provider}`);
      console.log(`   Address: ${coords515680.formatted_address}`);

      // Calculate distance
      const distance = calculateDistance(
        { lat: abcRestaurant.address.coordinates.lat, lng: abcRestaurant.address.coordinates.lng },
        { lat: coords515680.lat, lng: coords515680.lng }
      );
      console.log(`   📏 Distance from ABC: ${distance.toFixed(2)} km`);
      console.log(`   🎯 Within 10km: ${distance <= 10 ? '✅ YES' : '❌ NO'}`);
      console.log('');

    } catch (geocodeError) {
      console.log(`   ❌ Geocoding failed: ${geocodeError.message}\n`);
    }

    await mongoose.disconnect();

  } catch (dbError) {
    console.log(`   ❌ Database error: ${dbError.message}\n`);
  }

  // Test API endpoint
  console.log('🌐 Testing API Endpoint:\n');

  const baseURL = 'http://localhost:5000/api/v1';

  try {
    console.log('📍 Testing 515680 with 10km radius:');
    
    const response = await axios.get(`${baseURL}/restaurants/by-postal-code`, {
      params: { 
        postalCode: '515680',
        radius: 10
      }
    });
    
    console.log(`   ✅ Status: ${response.status} OK`);
    console.log(`   📊 Found: ${response.data.data.length} restaurants`);
    console.log(`   📝 Message: ${response.data.message}`);
    
    if (response.data.data.length > 0) {
      response.data.data.forEach(restaurant => {
        const isABC = restaurant.name === 'ABC' ? '🎯 ABC FOUND' : '🏪';
        console.log(`   ${isABC} ${restaurant.name} - ${restaurant.location}`);
      });
    } else {
      console.log(`   ✅ No restaurants found (as expected if >10km from ABC)`);
    }
    console.log('');

    // Test with larger radius to see if ABC appears
    console.log('📍 Testing 515680 with 25km radius:');
    
    const response25km = await axios.get(`${baseURL}/restaurants/by-postal-code`, {
      params: { 
        postalCode: '515680',
        radius: 25
      }
    });
    
    console.log(`   📊 Found: ${response25km.data.data.length} restaurants within 25km`);
    
    if (response25km.data.data.length > 0) {
      response25km.data.data.forEach(restaurant => {
        const isABC = restaurant.name === 'ABC' ? '🎯 ABC FOUND with larger radius' : '🏪';
        console.log(`   ${isABC} ${restaurant.name} - ${restaurant.location}`);
      });
    }
    console.log('');
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log(`   ❌ Backend server not running`);
    } else {
      console.log(`   ❌ API Error: ${error.response?.status} ${error.response?.statusText}`);
      console.log(`   📝 Message: ${error.response?.data?.message || error.message}`);
    }
    console.log('');
  }

  // Compare with known working postal codes
  console.log('🔍 Comparison with known working codes:\n');

  const comparisonCodes = ['515671', '515670', '515672'];

  for (const code of comparisonCodes) {
    try {
      console.log(`📍 Testing ${code} (should find ABC):`);
      
      const response = await axios.get(`${baseURL}/restaurants/by-postal-code`, {
        params: { 
          postalCode: code,
          radius: 10
        }
      });
      
      console.log(`   📊 Found: ${response.data.data.length} restaurants`);
      
      if (response.data.data.length > 0) {
        response.data.data.forEach(restaurant => {
          const isABC = restaurant.name === 'ABC' ? '🎯 ABC FOUND' : '🏪';
          console.log(`   ${isABC} ${restaurant.name}`);
        });
      }
      console.log('');
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.response?.data?.message || error.message}\n`);
    }
  }

  console.log('🎯 ANALYSIS:');
  console.log('📊 Postal Code Range: 515671 ± 10 = 515661 to 515681');
  console.log('📍 515680 is within postal code range BUT...');
  console.log('📏 Distance matters more than postal code proximity');
  console.log('✅ If 515680 is >10km from ABC, it should NOT be found with 10km radius');
  console.log('✅ This tests both our range matching AND distance validation');
}

test515680();
