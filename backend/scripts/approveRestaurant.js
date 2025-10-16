// Script to approve a restaurant
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const approveRestaurant = async (restaurantId) => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Import Restaurant model
    const Restaurant = require('../src/models/Restaurant');

    // Find and update restaurant status
    const restaurant = await Restaurant.findByIdAndUpdate(
      restaurantId,
      { 
        status: 'active',
        approvedAt: new Date()
      },
      { new: true }
    );

    if (!restaurant) {
      console.log('❌ Restaurant not found with ID:', restaurantId);
      return;
    }

    console.log('✅ Restaurant approved successfully:');
    console.log('- Restaurant ID:', restaurant._id);
    console.log('- Restaurant Name:', restaurant.name);
    console.log('- Status:', restaurant.status);
    console.log('- Approved At:', restaurant.approvedAt);

  } catch (error) {
    console.error('❌ Error approving restaurant:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
};

// Run the script
const restaurantId = process.argv[2];
if (!restaurantId) {
  console.log('❌ Please provide restaurant ID as argument');
  console.log('Usage: node approveRestaurant.js <restaurantId>');
  process.exit(1);
}

approveRestaurant(restaurantId);
