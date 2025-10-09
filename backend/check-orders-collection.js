// Script to check the orders collection directly
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/grubgate', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function checkOrdersCollection() {
  try {
    console.log('🔍 Checking orders collection directly...');
    console.log('=' .repeat(60));

    const db = mongoose.connection.db;
    
    // Check orders collection directly
    const ordersCollection = db.collection('orders');
    const orderCount = await ordersCollection.countDocuments();
    console.log(`📦 Orders Collection Count: ${orderCount}`);

    if (orderCount > 0) {
      // Get sample documents
      const sampleOrders = await ordersCollection.find({}).limit(5).toArray();
      console.log('\n📋 Sample Orders from Collection:');
      sampleOrders.forEach((order, index) => {
        console.log(`${index + 1}. Order:`, JSON.stringify(order, null, 2));
      });

      // Check for our specific restaurant
      const restaurantOrders = await ordersCollection.find({
        restaurantId: '68e73d168c18e7fd776a6327'
      }).toArray();
      console.log(`\n🏪 Orders for restaurant 68e73d168c18e7fd776a6327: ${restaurantOrders.length}`);

      // Also check with ObjectId
      const restaurantOrdersObjectId = await ordersCollection.find({
        restaurantId: new mongoose.Types.ObjectId('68e73d168c18e7fd776a6327')
      }).toArray();
      console.log(`🏪 Orders for restaurant (ObjectId): ${restaurantOrdersObjectId.length}`);

      if (restaurantOrders.length > 0) {
        console.log('\n📋 Orders for this restaurant:');
        restaurantOrders.forEach(order => {
          console.log(JSON.stringify(order, null, 2));
        });
      }
    }

    // Also check other collections that might have data
    console.log('\n🔍 Checking other collections:');
    
    const restaurantsCount = await db.collection('restaurants').countDocuments();
    console.log(`🏪 Restaurants: ${restaurantsCount}`);
    
    const usersCount = await db.collection('users').countDocuments();
    console.log(`👥 Users: ${usersCount}`);
    
    const subscriptionsCount = await db.collection('subscriptions').countDocuments();
    console.log(`🔄 Subscriptions: ${subscriptionsCount}`);
    
    const mealPlansCount = await db.collection('subscriptionmealplans').countDocuments();
    console.log(`📋 Subscription Meal Plans: ${mealPlansCount}`);

    // Check if our restaurant exists
    const restaurant = await db.collection('restaurants').findOne({
      _id: new mongoose.Types.ObjectId('68e73d168c18e7fd776a6327')
    });
    
    if (restaurant) {
      console.log('\n🏪 Restaurant Details:');
      console.log(`Name: ${restaurant.name}`);
      console.log(`Status: ${restaurant.status}`);
      console.log(`Owner: ${restaurant.ownerId}`);
    } else {
      console.log('\n❌ Restaurant 68e73d168c18e7fd776a6327 not found!');
    }

    console.log('\n✅ Collection check complete!');
    
  } catch (error) {
    console.error('❌ Error checking collections:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkOrdersCollection();
