// Script to check all orders in the database
const mongoose = require('mongoose');
const Order = require('./src/models/Order');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/grubgate', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function checkAllOrders() {
  try {
    console.log('🔍 Checking ALL orders in the database...');
    console.log('=' .repeat(60));

    // Count total orders
    const totalOrders = await Order.countDocuments();
    console.log(`📦 Total Orders in Database: ${totalOrders}`);

    if (totalOrders === 0) {
      console.log('❌ No orders found in the database at all!');
      
      // Check if the collection exists
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log('\n📋 Available Collections:');
      collections.forEach(col => {
        console.log(`  - ${col.name}`);
      });
      
    } else {
      // Get first 10 orders to see the structure
      const sampleOrders = await Order.find({})
        .limit(10)
        .select('orderNumber total status paymentStatus isSubscriptionOrder createdAt restaurantId customerId')
        .sort({ createdAt: -1 });

      console.log('\n📋 Sample Orders (latest 10):');
      sampleOrders.forEach((order, index) => {
        console.log(`${index + 1}. Order: ${order.orderNumber}`);
        console.log(`   RestaurantId: ${order.restaurantId} (Type: ${typeof order.restaurantId})`);
        console.log(`   CustomerId: ${order.customerId}`);
        console.log(`   Total: $${order.total}`);
        console.log(`   Status: ${order.status}`);
        console.log(`   Payment: ${order.paymentStatus}`);
        console.log(`   Subscription: ${order.isSubscriptionOrder}`);
        console.log(`   Created: ${order.createdAt}`);
        console.log('   ---');
      });

      // Group by restaurant to see all restaurants
      const restaurantStats = await Order.aggregate([
        {
          $group: {
            _id: '$restaurantId',
            orderCount: { $sum: 1 },
            totalRevenue: { $sum: '$total' },
            paidOrders: {
              $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0] }
            },
            subscriptionOrders: {
              $sum: { $cond: [{ $eq: ['$isSubscriptionOrder', true] }, 1, 0] }
            }
          }
        },
        { $sort: { orderCount: -1 } }
      ]);

      console.log('\n🏪 All Restaurants with Orders:');
      restaurantStats.forEach((restaurant, index) => {
        console.log(`${index + 1}. Restaurant ID: ${restaurant._id}`);
        console.log(`   Orders: ${restaurant.orderCount}`);
        console.log(`   Revenue: $${restaurant.totalRevenue?.toFixed(2) || 0}`);
        console.log(`   Paid Orders: ${restaurant.paidOrders}`);
        console.log(`   Subscription Orders: ${restaurant.subscriptionOrders}`);
        console.log('   ---');
      });
    }

    console.log('\n✅ Database check complete!');
    
  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkAllOrders();
