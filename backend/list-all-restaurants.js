// List all restaurants in database
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

async function listAllRestaurants() {
  console.log('📋 Listing all restaurants in database...\n');

  try {
    await connectDB();

    const restaurants = await Restaurant.find({}).select('name address location status');
    console.log(`📊 Total restaurants: ${restaurants.length}\n`);

    restaurants.forEach((restaurant, index) => {
      console.log(`${index + 1}. ${restaurant.name || 'Unnamed Restaurant'}`);
      console.log(`   Street: ${restaurant.address?.street || 'N/A'}`);
      console.log(`   City: ${restaurant.address?.city || 'N/A'}`);
      console.log(`   State: ${restaurant.address?.state || 'N/A'}`);
      console.log(`   Postal Code: ${restaurant.address?.postalCode || 'N/A'}`);
      console.log(`   Country: ${restaurant.address?.country || 'N/A'}`);
      console.log(`   Status: ${restaurant.status || 'N/A'}`);
      console.log(`   Address Coordinates: ${restaurant.address?.coordinates?.lat || 'N/A'}, ${restaurant.address?.coordinates?.lng || 'N/A'}`);
      console.log(`   Location Coordinates: ${restaurant.location?.coordinates || 'N/A'}`);
      console.log('   ---');
    });

    // Check specifically for postal code 515671
    console.log('\n🔍 Checking for postal code 515671...');
    const matches515671 = restaurants.filter(r => r.address?.postalCode === '515671');
    
    if (matches515671.length > 0) {
      console.log(`✅ Found ${matches515671.length} restaurant(s) with postal code 515671:`);
      matches515671.forEach(r => console.log(`   - ${r.name}`));
    } else {
      console.log('❌ No restaurants found with postal code 515671');
    }

    // Check for India-based restaurants
    console.log('\n🇮🇳 Checking for restaurants in India...');
    const indiaRestaurants = restaurants.filter(r => 
      r.address?.country?.toLowerCase().includes('india') ||
      r.address?.country?.toLowerCase().includes('in') ||
      r.address?.state?.toLowerCase().includes('andhra') ||
      r.address?.postalCode?.match(/^[1-9][0-9]{5}$/) // Indian postal code pattern
    );

    if (indiaRestaurants.length > 0) {
      console.log(`✅ Found ${indiaRestaurants.length} restaurant(s) that might be in India:`);
      indiaRestaurants.forEach(r => {
        console.log(`   - ${r.name} (${r.address?.postalCode || 'No postal code'})`);
      });
    } else {
      console.log('❌ No restaurants found in India');
    }

  } catch (error) {
    console.error('❌ Error listing restaurants:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the check
listAllRestaurants().then(() => {
  console.log('\n🏁 Restaurant listing completed');
}).catch(console.error);
