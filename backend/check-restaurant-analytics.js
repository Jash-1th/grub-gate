// Script to check analytics data for restaurant 68e73d168c18e7fd776a6327
const mongoose = require('mongoose');
const Order = require('./src/models/Order');
const Subscription = require('./src/models/Subscription');
const SubscriptionMealPlan = require('./src/models/SubscriptionMealPlan');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/grubgate', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const restaurantId = '68e73d168c18e7fd776a6327';

async function checkRestaurantAnalytics() {
  try {
    console.log(`🔍 Checking analytics for restaurant: ${restaurantId}`);
    console.log('=' .repeat(60));

    // First, let's check ALL orders in the collection to see what restaurants exist
    console.log('\n🔍 Checking all restaurants in Order collection:');
    const allRestaurants = await Order.aggregate([
      {
        $group: {
          _id: '$restaurantId',
          orderCount: { $sum: 1 },
          totalRevenue: { $sum: '$total' }
        }
      },
      { $sort: { orderCount: -1 } }
    ]);
    
    console.log('All restaurants with orders:');
    allRestaurants.forEach(restaurant => {
      console.log(`  Restaurant ${restaurant._id}: ${restaurant.orderCount} orders, $${restaurant.totalRevenue?.toFixed(2) || 0} revenue`);
    });

    // Check Orders for our specific restaurant
    console.log(`\n📦 Checking orders for restaurant ${restaurantId}:`);
    
    const totalOrders = await Order.countDocuments({ 
      restaurantId: new mongoose.Types.ObjectId(restaurantId) 
    });
    console.log(`📦 Total Orders: ${totalOrders}`);

    // Let's also try string comparison in case ObjectId conversion is the issue
    const totalOrdersString = await Order.countDocuments({ 
      restaurantId: restaurantId 
    });
    console.log(`📦 Total Orders (string match): ${totalOrdersString}`);

    const paidOrders = await Order.countDocuments({ 
      restaurantId: new mongoose.Types.ObjectId(restaurantId),
      paymentStatus: 'paid'
    });
    console.log(`💰 Paid Orders: ${paidOrders}`);

    const subscriptionOrders = await Order.countDocuments({ 
      restaurantId: new mongoose.Types.ObjectId(restaurantId),
      isSubscriptionOrder: true
    });
    console.log(`🔄 Subscription Orders: ${subscriptionOrders}`);

    // Get ALL orders for this restaurant to see what's there
    const allOrdersForRestaurant = await Order.find({ 
      restaurantId: new mongoose.Types.ObjectId(restaurantId) 
    }).select('orderNumber total status paymentStatus isSubscriptionOrder createdAt restaurantId');
    
    console.log(`\n📋 ALL Orders for restaurant ${restaurantId}:`);
    if (allOrdersForRestaurant.length === 0) {
      console.log('  No orders found');
      
      // Let's check if there are orders with restaurantId as string
      const ordersAsString = await Order.find({ 
        restaurantId: restaurantId 
      }).select('orderNumber total status paymentStatus isSubscriptionOrder createdAt restaurantId');
      
      console.log(`\n📋 Orders with restaurantId as string:`);
      if (ordersAsString.length === 0) {
        console.log('  No orders found with string restaurantId either');
      } else {
        ordersAsString.forEach(order => {
          console.log(`  ${order.orderNumber}: $${order.total} - ${order.status} - ${order.paymentStatus} - RestaurantId: ${order.restaurantId}`);
        });
      }
    } else {
      allOrdersForRestaurant.forEach(order => {
        console.log(`  ${order.orderNumber}: $${order.total} - ${order.status} - ${order.paymentStatus} - RestaurantId: ${order.restaurantId}`);
      });
    }

    // Check Revenue
    const revenueStats = await Order.aggregate([
      {
        $match: {
          restaurantId: new mongoose.Types.ObjectId(restaurantId),
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          subscriptionRevenue: {
            $sum: {
              $cond: [{ $eq: ['$isSubscriptionOrder', true] }, '$total', 0]
            }
          },
          oneTimeRevenue: {
            $sum: {
              $cond: [{ $ne: ['$isSubscriptionOrder', true] }, '$total', 0]
            }
          },
          avgOrderValue: { $avg: '$total' }
        }
      }
    ]);

    if (revenueStats.length > 0) {
      const stats = revenueStats[0];
      console.log(`💵 Total Revenue: $${stats.totalRevenue?.toFixed(2) || 0}`);
      console.log(`🔄 Subscription Revenue: $${stats.subscriptionRevenue?.toFixed(2) || 0}`);
      console.log(`🛒 One-time Revenue: $${stats.oneTimeRevenue?.toFixed(2) || 0}`);
      console.log(`📊 Avg Order Value: $${stats.avgOrderValue?.toFixed(2) || 0}`);
      
      if (stats.totalRevenue > 0) {
        const subPercentage = (stats.subscriptionRevenue / stats.totalRevenue) * 100;
        console.log(`📈 Subscription %: ${subPercentage.toFixed(1)}%`);
      }
    } else {
      console.log('💵 No revenue data found');
    }

    // Check Customers
    const uniqueCustomers = await Order.aggregate([
      {
        $match: {
          restaurantId: new mongoose.Types.ObjectId(restaurantId),
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: '$customerId'
        }
      },
      {
        $count: 'uniqueCustomers'
      }
    ]);

    const customerCount = uniqueCustomers[0]?.uniqueCustomers || 0;
    console.log(`👥 Unique Customers: ${customerCount}`);

    // Check Subscription Plans
    const subscriptionPlans = await SubscriptionMealPlan.countDocuments({
      restaurantId: new mongoose.Types.ObjectId(restaurantId)
    });
    console.log(`📋 Subscription Plans: ${subscriptionPlans}`);

    const activeSubscriptionPlans = await SubscriptionMealPlan.countDocuments({
      restaurantId: new mongoose.Types.ObjectId(restaurantId),
      status: 'active'
    });
    console.log(`✅ Active Subscription Plans: ${activeSubscriptionPlans}`);

    // Check Recent Orders
    const recentOrders = await Order.find({ 
      restaurantId: new mongoose.Types.ObjectId(restaurantId) 
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('orderNumber total status paymentStatus isSubscriptionOrder createdAt');

    console.log('\n📋 Recent Orders:');
    recentOrders.forEach(order => {
      console.log(`  ${order.orderNumber}: $${order.total} - ${order.status} - ${order.paymentStatus} - ${order.isSubscriptionOrder ? 'Subscription' : 'One-time'} - ${order.createdAt.toISOString().split('T')[0]}`);
    });

    console.log('\n✅ Analytics check complete!');
    
  } catch (error) {
    console.error('❌ Error checking analytics:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkRestaurantAnalytics();
