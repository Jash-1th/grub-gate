// Quick test script to check what's in the database
const mongoose = require('mongoose');
const Restaurant = require('../src/models/Restaurant');
require('dotenv').config();

async function testQuery() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/grubgate');
    console.log('Connected to MongoDB');

    // Check all restaurants
    const allRestaurants = await Restaurant.find({});
    console.log(`\nTotal restaurants in DB: ${allRestaurants.length}`);
    
    if (allRestaurants.length > 0) {
      console.log('\nFirst restaurant:');
      console.log('Name:', allRestaurants[0].name);
      console.log('Status:', allRestaurants[0].status);
      console.log('Postal Code:', allRestaurants[0].address.postalCode);
      console.log('Full address object:', JSON.stringify(allRestaurants[0].address, null, 2));
    }

    // Test the exact query from our controller
    const h3aRestaurants = await Restaurant.find({
      status: 'active',
      'address.postalCode': 'H3A'
    });
    console.log(`\nRestaurants with status=active and postalCode=H3A: ${h3aRestaurants.length}`);

    // Test without status filter
    const h3aRestaurantsNoStatus = await Restaurant.find({
      'address.postalCode': 'H3A'
    });
    console.log(`\nRestaurants with postalCode=H3A (no status filter): ${h3aRestaurantsNoStatus.length}`);

    // Test with case insensitive
    const h3aRestaurantsCaseInsensitive = await Restaurant.find({
      status: 'active',
      'address.postalCode': /^H3A$/i
    });
    console.log(`\nRestaurants with case insensitive H3A: ${h3aRestaurantsCaseInsensitive.length}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

testQuery();
