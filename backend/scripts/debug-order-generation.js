// FILE: scripts/debug-order-generation.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const SubscriptionMealPlan = require('../src/models/SubscriptionMealPlan');
const Order = require('../src/models/Order');

async function debugOrderGeneration() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    
    const subscription = await SubscriptionMealPlan.findById('68e7635769c614351d4dd059');
    const orders = await Order.find({ weeklyPlanId: subscription._id }).sort({ scheduledDate: 1 });
    
    console.log('=== ORDER GENERATION DEBUG ===');
    console.log(`Total Orders Generated: ${orders.length}`);
    
    // Group orders by week
    const ordersByWeek = {};
    
    orders.forEach(order => {
      const weekNum = Math.floor((order.scheduledDate - subscription.planStartDate) / (7 * 24 * 60 * 60 * 1000)) + 1;
      if (!ordersByWeek[weekNum]) {
        ordersByWeek[weekNum] = [];
      }
      ordersByWeek[weekNum].push(order);
    });
    
    // Show detailed breakdown
    Object.keys(ordersByWeek).sort((a, b) => parseInt(a) - parseInt(b)).forEach(weekNum => {
      const weekOrders = ordersByWeek[weekNum];
      const patternWeek = (parseInt(weekNum) - 1) % 2; // 0 or 1
      
      console.log(`\nWeek ${weekNum} (Pattern Week ${patternWeek}):`);
      console.log(`  Expected: ${patternWeek === 0 ? '0 orders (empty)' : '4 orders (meals)'}`);
      console.log(`  Actual: ${weekOrders.length} orders`);
      
      weekOrders.forEach(order => {
        const dayOfWeek = order.scheduledDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        console.log(`    ${order.scheduledDate.toDateString()} ${dayOfWeek} ${order.mealType}`);
      });
    });
    
    // Check specific weeks
    console.log('\n=== DETAILED ANALYSIS ===');
    
    // Week 1 (should be empty)
    const week1Orders = orders.filter(order => {
      const orderDate = new Date(order.scheduledDate);
      const oct12 = new Date('2025-10-12');
      const oct18 = new Date('2025-10-18');
      return orderDate >= oct12 && orderDate <= oct18;
    });
    
    console.log(`\nWeek 1 (Oct 12-18, should be EMPTY): ${week1Orders.length} orders`);
    week1Orders.forEach(order => {
      console.log(`  ${order.scheduledDate.toDateString()} ${order.mealType} - SHOULD NOT EXIST!`);
    });
    
    // Week 2 (should have 4 orders)
    const week2Orders = orders.filter(order => {
      const orderDate = new Date(order.scheduledDate);
      const oct19 = new Date('2025-10-19');
      const oct25 = new Date('2025-10-25');
      return orderDate >= oct19 && orderDate <= oct25;
    });
    
    console.log(`\nWeek 2 (Oct 19-25, should have 4 MEALS): ${week2Orders.length} orders`);
    console.log('Expected: Sun lunch+dinner, Mon lunch, Tue dinner');
    week2Orders.forEach(order => {
      const dayOfWeek = order.scheduledDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      console.log(`  ${order.scheduledDate.toDateString()} ${dayOfWeek} ${order.mealType}`);
    });
    
    await mongoose.connection.close();
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

debugOrderGeneration();
