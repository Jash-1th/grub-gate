// Debug script to check date ranges and data filtering
const mongoose = require('mongoose');

// Use the same connection string as the main app
const connectDB = async () => {
  try {
    // Check if there's a .env file to get the connection string
    require('dotenv').config();
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/grubgate';
    
    console.log('🔗 Connecting to:', mongoURI.replace(/\/\/.*@/, '//***:***@')); // Hide credentials
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

async function debugDateRanges() {
  await connectDB();
  
  try {
    const Order = mongoose.model('Order', new mongoose.Schema({}, { strict: false }));
    const restaurantId = '68e73d168c18e7fd776a6327';
    const period = 30;

    console.log('🔍 Debugging Date Ranges and Data Filtering...');
    console.log('=' .repeat(60));
    console.log(`Restaurant ID: ${restaurantId}`);
    console.log(`Period: ${period} days`);

    // Calculate date ranges (same logic as analytics controller)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(period));

    console.log(`\n📅 Date Range:`);
    console.log(`Start Date: ${startDate.toISOString()}`);
    console.log(`End Date: ${endDate.toISOString()}`);
    console.log(`Current Time: ${new Date().toISOString()}`);

    // Check total orders for this restaurant
    const totalOrders = await Order.countDocuments({
      restaurantId: new mongoose.Types.ObjectId(restaurantId)
    });
    console.log(`\n📦 Total Orders for Restaurant: ${totalOrders}`);

    // Check orders within date range
    const ordersInRange = await Order.countDocuments({
      restaurantId: new mongoose.Types.ObjectId(restaurantId),
      createdAt: { $gte: startDate, $lte: endDate }
    });
    console.log(`📦 Orders in Date Range: ${ordersInRange}`);

    // Check paid orders
    const paidOrders = await Order.countDocuments({
      restaurantId: new mongoose.Types.ObjectId(restaurantId),
      paymentStatus: 'paid',
      createdAt: { $gte: startDate, $lte: endDate }
    });
    console.log(`💰 Paid Orders in Range: ${paidOrders}`);

    // Check subscription orders
    const subscriptionOrders = await Order.countDocuments({
      restaurantId: new mongoose.Types.ObjectId(restaurantId),
      isSubscriptionOrder: true,
      paymentStatus: 'paid',
      createdAt: { $gte: startDate, $lte: endDate }
    });
    console.log(`🔄 Subscription Orders in Range: ${subscriptionOrders}`);

    // Get sample orders to see their dates
    const sampleOrders = await Order.find({
      restaurantId: new mongoose.Types.ObjectId(restaurantId)
    })
    .select('orderNumber total createdAt paymentStatus isSubscriptionOrder')
    .sort({ createdAt: -1 })
    .limit(5);

    console.log(`\n📋 Sample Orders:`);
    sampleOrders.forEach(order => {
      const inRange = order.createdAt >= startDate && order.createdAt <= endDate;
      console.log(`  ${order.orderNumber}: $${order.total} - ${order.createdAt.toISOString()} - ${inRange ? '✅ IN RANGE' : '❌ OUT OF RANGE'}`);
    });

    // Test the revenue aggregation
    const revenueStats = await Order.aggregate([
      {
        $match: {
          restaurantId: new mongoose.Types.ObjectId(restaurantId),
          paymentStatus: 'paid',
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          totalOrders: { $sum: 1 },
          averageOrderValue: { $avg: '$total' }
        }
      }
    ]);

    console.log(`\n💵 Revenue Stats:`, revenueStats[0] || 'No data');

    console.log('\n✅ Debug complete!');
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  } finally {
    mongoose.connection.close();
  }
}

debugDateRanges();
