const mongoose = require('mongoose');
require('dotenv').config();

const Order = require('./src/models/Order');
const Restaurant = require('./src/models/Restaurant');

async function checkPartnerView() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔗 Connected to MongoDB');
    
    const restaurantId = '68e73d168c18e7fd776a6327';
    
    console.log('\n🏪 PARTNER RESTAURANT VIEW');
    console.log('='.repeat(50));
    
    const restaurant = await Restaurant.findById(restaurantId);
    console.log('Restaurant:', restaurant.name);
    console.log('Owner ID:', restaurant.ownerId);
    
    console.log('\n📅 TODAY\'S ORDERS (Oct 9, 2025):');
    const today = new Date('2025-10-09T00:00:00.000Z');
    const tomorrow = new Date('2025-10-10T00:00:00.000Z');
    
    const todaysOrders = await Order.find({
      restaurantId: restaurantId,
      scheduledDate: {
        $gte: today,
        $lt: tomorrow
      }
    });
    
    console.log('Orders for today:', todaysOrders.length);
    if (todaysOrders.length === 0) {
      console.log('❌ No orders for today (Oct 9) - Expected since subscription starts Oct 12');
    }
    
    console.log('\n📅 UPCOMING ORDERS (Oct 12-18 - First Week):');
    const oct12 = new Date('2025-10-12T00:00:00.000Z');
    const oct19 = new Date('2025-10-19T00:00:00.000Z');
    
    const firstWeekOrders = await Order.find({
      restaurantId: restaurantId,
      scheduledDate: {
        $gte: oct12,
        $lt: oct19
      }
    }).sort({ scheduledDate: 1 });
    
    console.log('First week orders (Oct 12-18):', firstWeekOrders.length);
    
    firstWeekOrders.forEach((order, index) => {
      console.log(`\n📦 Order #${index + 1}`);
      console.log('Date:', order.scheduledDate?.toDateString());
      console.log('Status:', order.status);
      console.log('Meal Type:', order.mealType);
      console.log('Total: $' + order.total);
      console.log('Items:', order.items?.map(item => `${item.name} ($${item.price})`).join(', '));
    });
    
    console.log('\n📊 REPETITION PATTERN ANALYSIS:');
    const allOrders = await Order.find({
      restaurantId: restaurantId,
      isSubscriptionOrder: true
    }).sort({ scheduledDate: 1 });
    
    console.log('Total subscription orders:', allOrders.length);
    
    // Show first 10 orders to see the pattern
    console.log('\nFirst 10 orders pattern:');
    allOrders.slice(0, 10).forEach((order, index) => {
      const dayOfWeek = order.scheduledDate?.getDay();
      const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek];
      console.log(`${index + 1}. ${order.scheduledDate?.toDateString()} (${dayName}) - ${order.mealType} - ${order.items?.length} items`);
    });
    
    // Analyze weekly pattern
    const pattern = {};
    allOrders.forEach(order => {
      const dayOfWeek = order.scheduledDate?.getDay();
      const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek];
      
      if (!pattern[dayName]) {
        pattern[dayName] = { count: 0, totalValue: 0 };
      }
      pattern[dayName].count++;
      pattern[dayName].totalValue += order.total;
    });
    
    console.log('\n📊 Weekly pattern summary:');
    ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].forEach(day => {
      if (pattern[day] && pattern[day].count > 0) {
        console.log(`${day}: ${pattern[day].count} orders, $${pattern[day].totalValue.toFixed(2)} total revenue`);
      }
    });
    
    console.log('\n🔄 REPETITION LOGIC VERIFICATION:');
    // Group orders by week to show repetition
    const ordersByWeek = {};
    allOrders.forEach(order => {
      const orderDate = new Date(order.scheduledDate);
      const weekStart = new Date(orderDate);
      weekStart.setDate(orderDate.getDate() - orderDate.getDay()); // Get Sunday of that week
      const weekKey = weekStart.toDateString();
      
      if (!ordersByWeek[weekKey]) {
        ordersByWeek[weekKey] = [];
      }
      ordersByWeek[weekKey].push(order);
    });
    
    console.log('\nOrders grouped by week:');
    Object.keys(ordersByWeek).slice(0, 6).forEach((weekStart, weekIndex) => {
      const weekOrders = ordersByWeek[weekStart];
      console.log(`\nWeek ${weekIndex + 1} (starting ${weekStart}):`);
      weekOrders.forEach(order => {
        const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][order.scheduledDate.getDay()];
        console.log(`  ${dayName}: ${order.items?.map(item => item.name).join(', ')} ($${order.total})`);
      });
    });
    
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.disconnect();
  }
}

checkPartnerView();
