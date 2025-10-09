const mongoose = require('mongoose');
require('dotenv').config();

const Order = require('./src/models/Order');
const SubscriptionMealPlan = require('./src/models/SubscriptionMealPlan');
const User = require('./src/models/User');
const Restaurant = require('./src/models/Restaurant');
const MenuItem = require('./src/models/MenuItem');
const { generateOrdersForExistingSubscription } = require('./src/services/enhancedOrderGenerationService');

async function fixOrderDates() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔗 Connected to MongoDB');
    
    const subscriptionId = '68e782b3127a06385c60b2d6';
    
    console.log('🔧 Fixing order dates for subscription:', subscriptionId);
    
    // Delete existing orders
    console.log('🗑️ Deleting existing orders...');
    const deleteResult = await Order.deleteMany({ 
      weeklyPlanId: subscriptionId,
      isScheduledOrder: true 
    });
    console.log('Deleted', deleteResult.deletedCount, 'existing orders');
    
    // Regenerate orders with fixed date logic
    console.log('🔄 Regenerating orders with correct dates...');
    const newOrders = await generateOrdersForExistingSubscription(subscriptionId);
    
    console.log('✅ Generated', newOrders.length, 'new orders');
    
    // Show first few orders to verify dates
    console.log('\n📅 First 5 orders with corrected dates:');
    const firstOrders = await Order.find({ 
      weeklyPlanId: subscriptionId,
      isScheduledOrder: true 
    })
    .sort({ scheduledDate: 1 })
    .limit(5);
    
    firstOrders.forEach((order, index) => {
      const date = order.scheduledDate.toISOString().split('T')[0];
      const displayDate = order.scheduledDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
      });
      console.log(`${index + 1}. ${order.orderNumber} - ${displayDate} (${date}) - ${order.mealType}`);
      console.log(`   Items: ${order.items?.map(item => item.name).join(', ')}`);
    });
    
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    console.log('✅ Order dates have been fixed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.disconnect();
  }
}

fixOrderDates();
