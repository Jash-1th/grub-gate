// Check restaurants near postal code 515671
const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/grubgate');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Restaurant schema (simplified)
const restaurantSchema = new mongoose.Schema({
  name: String,
  description: String,
  cuisine: String,
  address: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: [Number] // [longitude, latitude]
  },
  status: String,
  ownerId: mongoose.Schema.Types.ObjectId
}, { timestamps: true });

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

async function checkRestaurantsNear515671() {
  console.log('🔍 Checking restaurants near postal code 515671...\n');

  try {
    await connectDB();

    // First, let's check all restaurants in the database
    console.log('1. Getting all restaurants in database...');
    const allRestaurants = await Restaurant.find({}).select('name address location status');
    console.log(`📊 Total restaurants in database: ${allRestaurants.length}\n`);

    if (allRestaurants.length === 0) {
      console.log('❌ No restaurants found in database');
      return;
    }

    // Show all restaurants with their postal codes
    console.log('📍 All restaurants with postal codes:');
    allRestaurants.forEach((restaurant, index) => {
      console.log(`${index + 1}. ${restaurant.name}`);
      console.log(`   Address: ${restaurant.address?.street || 'N/A'}, ${restaurant.address?.city || 'N/A'}`);
      console.log(`   Postal Code: ${restaurant.address?.postalCode || 'N/A'}`);
      console.log(`   Country: ${restaurant.address?.country || 'N/A'}`);
      console.log(`   Status: ${restaurant.status || 'N/A'}`);
      console.log(`   Coordinates: ${restaurant.address?.coordinates?.lat || 'N/A'}, ${restaurant.address?.coordinates?.lng || 'N/A'}`);
      console.log(`   Location: ${restaurant.location?.coordinates || 'N/A'}`);
      console.log('');
    });

    // Check for restaurants with postal code 515671
    console.log('2. Searching for restaurants with postal code 515671...');
    const exactMatches = await Restaurant.find({
      'address.postalCode': '515671'
    }).select('name address status');

    if (exactMatches.length > 0) {
      console.log(`✅ Found ${exactMatches.length} restaurant(s) with postal code 515671:`);
      exactMatches.forEach((restaurant, index) => {
        console.log(`${index + 1}. ${restaurant.name}`);
        console.log(`   Address: ${restaurant.address?.street}, ${restaurant.address?.city}`);
        console.log(`   Status: ${restaurant.status}`);
      });
    } else {
      console.log('❌ No restaurants found with exact postal code 515671');
    }

    // Check for restaurants in the same state/region (Andhra Pradesh, India)
    console.log('\n3. Searching for restaurants in Andhra Pradesh, India...');
    const regionMatches = await Restaurant.find({
      $or: [
        { 'address.state': { $regex: /andhra pradesh/i } },
        { 'address.state': { $regex: /AP/i } },
        { 'address.country': { $regex: /india/i } }
      ]
    }).select('name address status');

    if (regionMatches.length > 0) {
      console.log(`✅ Found ${regionMatches.length} restaurant(s) in India/Andhra Pradesh region:`);
      regionMatches.forEach((restaurant, index) => {
        console.log(`${index + 1}. ${restaurant.name}`);
        console.log(`   Address: ${restaurant.address?.street || 'N/A'}, ${restaurant.address?.city || 'N/A'}`);
        console.log(`   State: ${restaurant.address?.state || 'N/A'}`);
        console.log(`   Postal Code: ${restaurant.address?.postalCode || 'N/A'}`);
        console.log(`   Status: ${restaurant.status || 'N/A'}`);
        console.log('');
      });
    } else {
      console.log('❌ No restaurants found in Andhra Pradesh/India region');
    }

    // Check for restaurants with similar postal codes (515xxx)
    console.log('4. Searching for restaurants with similar postal codes (515xxx)...');
    const similarPostalCodes = await Restaurant.find({
      'address.postalCode': { $regex: /^515/ }
    }).select('name address status');

    if (similarPostalCodes.length > 0) {
      console.log(`✅ Found ${similarPostalCodes.length} restaurant(s) with postal codes starting with 515:`);
      similarPostalCodes.forEach((restaurant, index) => {
        console.log(`${index + 1}. ${restaurant.name}`);
        console.log(`   Postal Code: ${restaurant.address?.postalCode}`);
        console.log(`   City: ${restaurant.address?.city || 'N/A'}`);
        console.log(`   Status: ${restaurant.status || 'N/A'}`);
        console.log('');
      });
    } else {
      console.log('❌ No restaurants found with postal codes starting with 515');
    }

  } catch (error) {
    console.error('❌ Error checking restaurants:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the check
checkRestaurantsNear515671().then(() => {
  console.log('\n🏁 Restaurant check completed');
}).catch(console.error);
