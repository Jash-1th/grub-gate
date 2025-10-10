// Check restaurants in database
const mongoose = require('mongoose');
const Restaurant = require('./src/models/Restaurant');

mongoose.connect('mongodb://localhost:27017/grub-gate', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const checkRestaurants = async () => {
  try {
    console.log('🔍 Checking restaurants in database...\n');

    const allRestaurants = await Restaurant.find({});
    console.log(`📊 Total restaurants: ${allRestaurants.length}`);

    if (allRestaurants.length > 0) {
      console.log('\n🏪 Restaurant details:');
      allRestaurants.forEach((restaurant, index) => {
        console.log(`${index + 1}. ${restaurant.name}`);
        console.log(`   ID: ${restaurant._id}`);
        console.log(`   Status: ${restaurant.status}`);
        console.log(`   Owner: ${restaurant.ownerId}`);
        console.log(`   Cuisine: ${restaurant.cuisine}`);
        console.log('');
      });

      // Check active restaurants specifically
      const activeRestaurants = await Restaurant.find({ status: 'active' });
      console.log(`✅ Active restaurants: ${activeRestaurants.length}`);
      
      if (activeRestaurants.length === 0) {
        console.log('⚠️  No active restaurants found. Updating first restaurant to active...');
        if (allRestaurants.length > 0) {
          await Restaurant.findByIdAndUpdate(allRestaurants[0]._id, { status: 'active' });
          console.log(`✅ Updated ${allRestaurants[0].name} to active status`);
        }
      }
    } else {
      console.log('❌ No restaurants found in database');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
};

checkRestaurants();
