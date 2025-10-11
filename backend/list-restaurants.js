const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Restaurant = require('./src/models/Restaurant');

async function listRestaurants() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/grubgate');
    console.log('✅ Connected to MongoDB');

    console.log(`\n🏪 ALL RESTAURANTS IN DATABASE:`);
    console.log('=' .repeat(60));

    const restaurants = await Restaurant.find({})
      .select('name cuisine address isActive createdAt')
      .sort({ createdAt: -1 });

    console.log(`   Total Restaurants: ${restaurants.length}`);

    if (restaurants.length > 0) {
      console.log(`\n   📋 RESTAURANT LIST:`);
      restaurants.forEach((restaurant, index) => {
        console.log(`\n     ${index + 1}. ${restaurant.name}`);
        console.log(`        ID: ${restaurant._id}`);
        console.log(`        Cuisine: ${restaurant.cuisine || 'N/A'}`);
        console.log(`        Status: ${restaurant.isActive ? 'Active' : 'Inactive'}`);
        console.log(`        Address: ${restaurant.address?.formattedAddress || restaurant.address?.addressLine1 || 'N/A'}`);
        console.log(`        Created: ${restaurant.createdAt?.toDateString() || 'N/A'}`);
      });

      // Check if the specific ID exists with a different format
      const targetId = '68e73d168c18e7fd776a6327';
      const foundRestaurant = restaurants.find(r => r._id.toString() === targetId);
      
      if (foundRestaurant) {
        console.log(`\n✅ Found target restaurant: ${foundRestaurant.name}`);
      } else {
        console.log(`\n❌ Target restaurant ID ${targetId} not found`);
        console.log(`\n🔍 Looking for similar names...`);
        const mapleLeaf = restaurants.find(r => r.name.toLowerCase().includes('maple'));
        if (mapleLeaf) {
          console.log(`   Found similar: ${mapleLeaf.name} (ID: ${mapleLeaf._id})`);
        }
      }
    }

  } catch (error) {
    console.error('❌ Error listing restaurants:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

// Run the check
listRestaurants();
