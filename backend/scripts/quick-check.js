const mongoose = require('mongoose');
const SubscriptionMealPlan = require('../src/models/SubscriptionMealPlan');
const Order = require('../src/models/Order');

async function quickCheck() {
  await mongoose.connect('mongodb://localhost:27017/grub-gate');
  
  const subscriptions = await SubscriptionMealPlan.find().sort({createdAt: -1}).limit(1);
  const orders = await Order.find().sort({createdAt: -1}).limit(5);
  
  console.log('Latest Subscription:', subscriptions[0]?._id || 'None');
  console.log('Customer ID:', subscriptions[0]?.customerId || 'None');
  console.log('Restaurant ID:', subscriptions[0]?.restaurantId || 'None');
  console.log('Total Orders:', orders.length);
  
  await mongoose.disconnect();
}

quickCheck().catch(console.error);
