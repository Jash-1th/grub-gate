// FILE: scripts/generate-test-orders.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const { generateDailyOrders } = require('../src/services/orderGenerationService');
const Order = require('../src/models/Order');

/**
 * Generate orders from the test meal plans and verify they appear correctly
 */
async function generateTestOrders() {
  try {
    console.log('🚀 Generating test orders from meal plans...');
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    
    if (!mongoUri) {
      throw new Error('MongoDB URI not found. Please set MONGODB_URI or MONGO_URI in your .env file');
    }
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
    
    // Step 1: Check existing orders
    console.log('\n📊 Step 1: Checking existing orders...');
    const existingOrders = await Order.find({
      type: 'weekly-plan'
    }).populate('customerId', 'firstName lastName email')
      .populate('restaurantId', 'name');
    
    console.log(`📦 Found ${existingOrders.length} existing weekly-plan orders`);
    
    if (existingOrders.length > 0) {
      console.log('🗑️ Clearing existing weekly-plan orders for clean test...');
      await Order.deleteMany({ type: 'weekly-plan' });
      console.log('✅ Cleared existing orders');
    }
    
    // Step 2: Generate new orders
    console.log('\n🔄 Step 2: Generating new orders...');
    const result = await generateDailyOrders();
    
    console.log('\n📋 Order Generation Results:');
    console.log('=' .repeat(50));
    
    if (result.success) {
      console.log(`✅ Success: ${result.totalOrdersCreated} orders created`);
      console.log(`📦 Subscription Orders: ${result.subscriptionOrders}`);
      console.log(`🍽️ Meal Plan Orders: ${result.mealPlanOrders}`);
      
      if (result.errors && result.errors.length > 0) {
        console.log(`⚠️ Errors encountered: ${result.errors.length}`);
        result.errors.forEach((error, index) => {
          console.log(`   ${index + 1}. ${error.error || error}`);
        });
      }
    } else {
      console.log(`❌ Failed: ${result.error}`);
      return;
    }
    
    // Step 3: Verify created orders
    console.log('\n🔍 Step 3: Verifying created orders...');
    const newOrders = await Order.find({
      type: 'weekly-plan'
    }).populate('customerId', 'firstName lastName email')
      .populate('restaurantId', 'name')
      .sort({ createdAt: -1 });
    
    console.log(`📦 Total orders created: ${newOrders.length}`);
    
    if (newOrders.length > 0) {
      console.log('\n📋 Order Details:');
      console.log('-' .repeat(80));
      
      newOrders.forEach((order, index) => {
        console.log(`${index + 1}. Order #${order.orderNumber}`);
        console.log(`   Customer: ${order.customerId?.firstName} ${order.customerId?.lastName} (${order.customerId?.email})`);
        console.log(`   Restaurant: ${order.restaurantId?.name}`);
        console.log(`   Type: ${order.type} | Meal: ${order.mealType} | Subscription: ${order.isSubscriptionOrder}`);
        console.log(`   Items: ${order.items?.length || 0} | Total: ₹${order.total}`);
        console.log(`   Status: ${order.status} | Payment: ${order.paymentStatus}`);
        console.log(`   Created: ${order.createdAt.toLocaleString()}`);
        
        if (order.items && order.items.length > 0) {
          console.log(`   Menu Items:`);
          order.items.forEach(item => {
            console.log(`     - ${item.name} (₹${item.price}) x${item.quantity}`);
            if (item.specialInstructions) {
              console.log(`       Note: ${item.specialInstructions}`);
            }
          });
        }
        console.log('-' .repeat(80));
      });
      
      // Group by restaurant for partner view
      console.log('\n🏪 Partner View (Orders by Restaurant):');
      console.log('=' .repeat(60));
      
      const ordersByRestaurant = newOrders.reduce((acc, order) => {
        const restaurantName = order.restaurantId?.name || 'Unknown';
        if (!acc[restaurantName]) {
          acc[restaurantName] = [];
        }
        acc[restaurantName].push(order);
        return acc;
      }, {});
      
      Object.entries(ordersByRestaurant).forEach(([restaurantName, orders]) => {
        console.log(`\n🍽️ ${restaurantName}:`);
        console.log(`   Total Orders: ${orders.length}`);
        console.log(`   Lunch Orders: ${orders.filter(o => o.mealType === 'lunch').length}`);
        console.log(`   Dinner Orders: ${orders.filter(o => o.mealType === 'dinner').length}`);
        console.log(`   Total Revenue: ₹${orders.reduce((sum, o) => sum + (o.total || 0), 0)}`);
        
        orders.forEach(order => {
          console.log(`     • ${order.mealType.toUpperCase()}: ${order.items?.[0]?.name} - ₹${order.total} (${order.status})`);
        });
      });
    }
    
    // Step 4: Test partner API endpoint
    console.log('\n🔌 Step 4: Testing Partner API Response Format...');
    
    // Simulate what the partner orders API would return
    const partnerOrders = await Order.find({
      type: 'weekly-plan',
      restaurantId: '68e60c9d44b875ac6aaf953d' // ASS restaurant
    }).populate('customerId', 'firstName lastName email phone')
      .populate('restaurantId', 'name cuisine phone')
      .sort({ createdAt: -1 });
    
    console.log(`📊 Partner API would return ${partnerOrders.length} orders`);
    
    if (partnerOrders.length > 0) {
      const sampleOrder = partnerOrders[0];
      console.log('\n📋 Sample API Response Structure:');
      console.log(JSON.stringify({
        _id: sampleOrder._id,
        orderNumber: sampleOrder.orderNumber,
        customerId: {
          firstName: sampleOrder.customerId?.firstName,
          lastName: sampleOrder.customerId?.lastName,
          email: sampleOrder.customerId?.email,
          phone: sampleOrder.customerId?.phone
        },
        restaurantId: {
          name: sampleOrder.restaurantId?.name
        },
        type: sampleOrder.type,
        mealType: sampleOrder.mealType,
        isSubscriptionOrder: sampleOrder.isSubscriptionOrder,
        items: sampleOrder.items,
        subtotal: sampleOrder.subtotal,
        deliveryFee: sampleOrder.deliveryFee,
        tax: sampleOrder.tax,
        total: sampleOrder.total,
        status: sampleOrder.status,
        paymentStatus: sampleOrder.paymentStatus,
        deliveryAddress: sampleOrder.deliveryAddress,
        deliveryTime: sampleOrder.deliveryTime,
        specialInstructions: sampleOrder.specialInstructions,
        createdAt: sampleOrder.createdAt
      }, null, 2));
    }
    
    console.log('\n🎉 Test Orders Generated Successfully!');
    console.log('=' .repeat(60));
    console.log('🚀 Next Steps:');
    console.log('   1. Open partner portal: http://localhost:3001/dashboard/orders');
    console.log('   2. Login as partner user (restaurant owner)');
    console.log('   3. View today\'s orders in the orders page');
    console.log('   4. Test order status updates');
    
    console.log('\n📱 Partner Login Details:');
    console.log('   Email: 2022cse.r234@svce.edu.in');
    console.log('   Restaurant: ASS');
    console.log(`   Expected Orders: ${partnerOrders.length} orders for today`);
    
  } catch (error) {
    console.error('💥 Order generation failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Handle script termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Generation interrupted');
  await mongoose.connection.close();
  process.exit(0);
});

// Run the generation
generateTestOrders();
