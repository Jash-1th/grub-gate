const mongoose = require('mongoose');
require('dotenv').config();

const SubscriptionMealPlan = require('./src/models/SubscriptionMealPlan');
const Order = require('./src/models/Order');
const User = require('./src/models/User');
const Restaurant = require('./src/models/Restaurant');
const MenuItem = require('./src/models/MenuItem');
const { getWeekDateRange } = require('./src/utils/dateHelpers');
const { generateAllSubscriptionOrders } = require('./src/services/enhancedOrderGenerationService');

async function recreateSubscription() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔗 Connected to MongoDB');
    
    const oldSubscriptionId = '68e782b3127a06385c60b2d6';
    const customerId = '68e7578c70b1ebbce509b69c';
    const restaurantId = '68e73d168c18e7fd776a6327';
    
    // Delete old subscription and orders
    console.log('🗑️ Deleting old subscription and orders...');
    await Order.deleteMany({ weeklyPlanId: oldSubscriptionId });
    await SubscriptionMealPlan.findByIdAndDelete(oldSubscriptionId);
    console.log('✅ Old data deleted');
    
    // Create new subscription with correct dates
    console.log('🔄 Creating new subscription with fixed dates...');
    
    const today = new Date('2025-10-09'); // When subscription was originally created
    
    // Get correct week ranges using fixed date helpers
    const week0 = getWeekDateRange(0, today);
    const week1 = getWeekDateRange(1, today);
    
    console.log('Week 0:', week0.startDate.toDateString(), 'to', week0.endDate.toDateString());
    console.log('Week 1:', week1.startDate.toDateString(), 'to', week1.endDate.toDateString());
    
    const newSubscription = new SubscriptionMealPlan({
      customerId: customerId,
      restaurantId: restaurantId,
      planType: 'quarterly',
      planStartDate: week0.startDate,
      planEndDate: new Date(week0.startDate.getTime() + (90 * 24 * 60 * 60 * 1000)), // 90 days later
      totalPlanValue: 60,
      totalMealsCount: 4,
      status: 'active',
      isOrdersGenerated: false,
      weeks: [
        {
          weekNumber: 1,
          weekStartDate: week0.startDate,
          weekEndDate: week0.endDate,
          originalWeekIndex: 0,
          weekTotalValue: 45,
          weekTotalItems: 3,
          meals: {
            sunday: {
              lunch: [{
                id: '68e756a570b1ebbce509b689',
                planId: 'plan-1',
                menuItemId: '68e756a570b1ebbce509b689',
                name: 'fish fry',
                price: 20,
                restaurantName: 'Maple Leaf Bistro',
                deliveryTime: '12:30',
                specialInstructions: ''
              }]
            },
            monday: {
              lunch: [
                {
                  id: '68e756a570b1ebbce509b689-1',
                  planId: 'plan-1',
                  menuItemId: '68e756a570b1ebbce509b689',
                  name: 'mutton fry',
                  price: 15,
                  restaurantName: 'Maple Leaf Bistro',
                  deliveryTime: '12:30',
                  specialInstructions: ''
                },
                {
                  id: '68e755af70b1ebbce509b671',
                  planId: 'plan-1',
                  menuItemId: '68e755af70b1ebbce509b671',
                  name: 'chiceknn',
                  price: 10,
                  restaurantName: 'Maple Leaf Bistro',
                  deliveryTime: '12:30',
                  specialInstructions: ''
                }
              ]
            },
            tuesday: { lunch: [], dinner: [] },
            wednesday: { lunch: [], dinner: [] },
            thursday: { lunch: [], dinner: [] },
            friday: { lunch: [], dinner: [] },
            saturday: { lunch: [], dinner: [] }
          }
        },
        {
          weekNumber: 2,
          weekStartDate: week1.startDate,
          weekEndDate: week1.endDate,
          originalWeekIndex: 1,
          weekTotalValue: 15,
          weekTotalItems: 1,
          meals: {
            sunday: { lunch: [], dinner: [] },
            monday: {
              lunch: [{
                id: '68e756a570b1ebbce509b689-2',
                planId: 'plan-1',
                menuItemId: '68e756a570b1ebbce509b689',
                name: 'mutton fry',
                price: 15,
                restaurantName: 'Maple Leaf Bistro',
                deliveryTime: '12:30',
                specialInstructions: ''
              }]
            },
            tuesday: { lunch: [], dinner: [] },
            wednesday: { lunch: [], dinner: [] },
            thursday: { lunch: [], dinner: [] },
            friday: { lunch: [], dinner: [] },
            saturday: { lunch: [], dinner: [] }
          }
        }
      ],
      deliveryAddress: {
        street: '123 Main street',
        city: 'Tornoto',
        province: 'NU',
        postalCode: 'M5V 2B4',
        instructions: ''
      },
      billingCycle: 'bi-weekly',
      nextBillingDate: new Date('2025-10-23'),
      autoRenew: true
    });
    
    const savedSubscription = await newSubscription.save();
    console.log('✅ New subscription created:', savedSubscription._id);
    
    // Generate orders with correct dates
    console.log('🔄 Generating orders with correct dates...');
    const orders = await generateAllSubscriptionOrders(savedSubscription);
    console.log('✅ Generated', orders.length, 'orders');
    
    // Verify first few orders
    console.log('\\n📅 First 3 orders verification:');
    const firstOrders = orders.slice(0, 3);
    firstOrders.forEach((order, index) => {
      const date = order.scheduledDate.toISOString().split('T')[0];
      const displayDate = order.scheduledDate.toDateString();
      console.log((index + 1) + '. ' + order.orderNumber + ' - ' + displayDate + ' (' + date + ')');
      console.log('   Items: ' + order.items?.map(item => item.name).join(', '));
    });
    
    console.log('\\n🎯 EXPECTED RESULTS:');
    console.log('Order 1: Sunday, October 12, 2025 - Fish fry');
    console.log('Order 2: Monday, October 13, 2025 - Mutton fry + Chicken');
    console.log('Order 3: Monday, October 20, 2025 - Mutton fry');
    
    await mongoose.disconnect();
    console.log('\\n🔌 Disconnected from MongoDB');
    console.log('✅ Subscription recreated with correct dates!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.disconnect();
  }
}

recreateSubscription();
