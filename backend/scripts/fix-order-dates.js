// FILE: scripts/fix-order-dates.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const Order = require('../src/models/Order');
const SubscriptionMealPlan = require('../src/models/SubscriptionMealPlan');
const { generateAllSubscriptionOrders } = require('../src/services/enhancedOrderGenerationService');

/**
 * Fix order dates by regenerating all scheduled orders
 */
async function fixOrderDates() {
  try {
    console.log('🔧 Fixing Order Dates...');
    console.log('=' .repeat(50));
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
    
    // Find all subscription meal plans
    const subscriptions = await SubscriptionMealPlan.find({ status: 'active' });
    console.log(`📋 Found ${subscriptions.length} active subscriptions`);
    
    for (const subscription of subscriptions) {
      console.log(`\n🔄 Processing subscription: ${subscription._id}`);
      
      // Delete existing scheduled orders for this subscription
      const deleteResult = await Order.deleteMany({ 
        weeklyPlanId: subscription._id,
        isScheduledOrder: true 
      });
      console.log(`   🗑️ Deleted ${deleteResult.deletedCount} existing scheduled orders`);
      
      // Regenerate orders with fixed date logic
      const newOrders = await generateAllSubscriptionOrders(subscription);
      console.log(`   ✅ Generated ${newOrders.length} new orders with correct dates`);
      
      // Update subscription status
      subscription.isOrdersGenerated = true;
      subscription.generatedOrders = newOrders.map(order => order._id);
      await subscription.save();
    }
    
    console.log('\n🎉 Order Date Fix Complete!');
    
    // Verify the fix
    console.log('\n🧪 Verifying Fix:');
    await verifyFix();
    
  } catch (error) {
    console.error('💥 Fix failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

/**
 * Verify the fix by checking a few sample dates
 */
async function verifyFix() {
  const testDates = ['2025-10-19', '2025-10-20', '2025-10-26'];
  
  for (const dateString of testDates) {
    const targetDate = new Date(dateString + 'T00:00:00.000Z');
    const startOfDay = new Date(targetDate);
    const endOfDay = new Date(targetDate);
    endOfDay.setUTCHours(23, 59, 59, 999);
    
    const orders = await Order.find({
      scheduledDate: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      isScheduledOrder: true
    });
    
    console.log(`   📅 ${dateString}: ${orders.length} orders`);
    
    if (orders.length > 0) {
      orders.forEach(order => {
        const scheduledDate = new Date(order.scheduledDate);
        console.log(`      - ${order.orderNumber}: ${scheduledDate.toISOString()} (${order.mealType})`);
      });
    }
  }
}

// Handle script termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Fix interrupted');
  await mongoose.connection.close();
  process.exit(0);
});

// Run the fix
fixOrderDates();
