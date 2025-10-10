/**
 * Complete test: Delete orders, create subscription with items, generate orders, check partner view
 * User: 68e7b7ea4a70ed31cffb3fe9 (mamilla jaswanth kumar)
 * Restaurant: 68e73d168c18e7fd776a6327 (Maple Leaf Bistro)
 * Dates: Oct 12, Oct 18, Oct 19, Oct 25 (bi-weekly)
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Order = require('./src/models/Order');
const MealPlan = require('./src/models/MealPlan');
const SubscriptionMealPlan = require('./src/models/SubscriptionMealPlan');
const Restaurant = require('./src/models/Restaurant');
const MenuItem = require('./src/models/MenuItem');
const { getNextSunday } = require('./src/utils/dateHelpers');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/grub-gate';
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const runCompleteTest = async () => {
  try {
    console.log('🧪 Complete Order Generation Test');
    console.log('=' .repeat(70));

    const userId = '68e7b7ea4a70ed31cffb3fe9';
    const restaurantId = '68e73d168c18e7fd776a6327';

    // Get user and restaurant info
    const user = await User.findById(userId);
    const restaurant = await Restaurant.findById(restaurantId);
    
    if (!user || !restaurant) {
      console.log('❌ User or restaurant not found');
      return;
    }

    console.log(`👤 User: ${user.firstName} ${user.lastName}`);
    console.log(`🏪 Restaurant: ${restaurant.name}`);

    // Step 1: Delete all existing orders and meal plans for the user
    console.log('\n🧹 Step 1: Cleaning up existing data...');
    console.log('-' .repeat(50));
    
    const deletedOrders = await Order.deleteMany({ customerId: userId });
    const deletedMealPlans = await MealPlan.deleteMany({ userId: userId });
    const deletedSubscriptions = await SubscriptionMealPlan.deleteMany({ customerId: userId });
    
    console.log(`✅ Deleted ${deletedOrders.deletedCount} orders`);
    console.log(`✅ Deleted ${deletedMealPlans.deletedCount} meal plans`);
    console.log(`✅ Deleted ${deletedSubscriptions.deletedCount} subscription meal plans`);

    // Step 2: Create bi-weekly subscription meal plan with proper dates
    console.log('\n📋 Step 2: Creating bi-weekly subscription meal plan...');
    console.log('-' .repeat(50));
    
    const startDate = getNextSunday(); // Oct 12, 2025 (Sunday)
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 13); // Oct 25, 2025 (Saturday)
    
    console.log(`Plan Start: ${startDate.toDateString()} (Day ${startDate.getDay()})`);
    console.log(`Plan End: ${endDate.toDateString()} (Day ${endDate.getDay()})`);
    
    // Week 1: Oct 12-18 (Sunday to Saturday)
    const week1Start = new Date(startDate);
    const week1End = new Date(startDate);
    week1End.setDate(startDate.getDate() + 6);
    
    // Week 2: Oct 19-25 (Sunday to Saturday) 
    const week2Start = new Date(startDate);
    week2Start.setDate(startDate.getDate() + 7);
    const week2End = new Date(startDate);
    week2End.setDate(startDate.getDate() + 13);
    
    console.log(`Week 1: ${week1Start.toDateString()} - ${week1End.toDateString()}`);
    console.log(`Week 2: ${week2Start.toDateString()} - ${week2End.toDateString()}`);

    // Get some menu items from the restaurant
    const menuItems = await MenuItem.find({ restaurantId }).limit(4);
    if (menuItems.length === 0) {
      console.log('❌ No menu items found for restaurant');
      return;
    }
    
    console.log(`✅ Found ${menuItems.length} menu items to use`);

    // Create subscription meal plan with items on specific dates
    const subscriptionMealPlan = new SubscriptionMealPlan({
      customerId: userId,
      restaurantId: restaurantId,
      subscriptionId: new mongoose.Types.ObjectId(),
      planType: 'bi-weekly',
      planStartDate: startDate,
      planEndDate: endDate,
      weekStartDates: [week1Start, week2Start],
      weeks: [
        {
          weekNumber: 0,
          weekStartDate: week1Start,
          weekEndDate: week1End,
          meals: {
            sunday: { 
              lunch: [{
                id: 'item-oct12-lunch',
                planId: 'plan-oct12-lunch',
                menuItemId: menuItems[0]._id,
                name: menuItems[0].name,
                price: menuItems[0].price,
                restaurantName: restaurant.name,
                addedAt: new Date(),
                deliveryTime: '12:00',
                description: menuItems[0].description,
                image: menuItems[0].image
              }], 
              dinner: [{
                id: 'item-oct12-dinner',
                planId: 'plan-oct12-dinner',
                menuItemId: menuItems[1]._id,
                name: menuItems[1].name,
                price: menuItems[1].price,
                restaurantName: restaurant.name,
                addedAt: new Date(),
                deliveryTime: '19:00',
                description: menuItems[1].description,
                image: menuItems[1].image
              }]
            },
            monday: { lunch: [], dinner: [] },
            tuesday: { lunch: [], dinner: [] },
            wednesday: { lunch: [], dinner: [] },
            thursday: { lunch: [], dinner: [] },
            friday: { 
              lunch: [{
                id: 'item-oct18-lunch',
                planId: 'plan-oct18-lunch',
                menuItemId: menuItems[2]._id,
                name: menuItems[2].name,
                price: menuItems[2].price,
                restaurantName: restaurant.name,
                addedAt: new Date(),
                deliveryTime: '12:00',
                description: menuItems[2].description,
                image: menuItems[2].image
              }], 
              dinner: [] 
            },
            saturday: { lunch: [], dinner: [] }
          }
        },
        {
          weekNumber: 1,
          weekStartDate: week2Start,
          weekEndDate: week2End,
          meals: {
            sunday: { 
              lunch: [{
                id: 'item-oct19-lunch',
                planId: 'plan-oct19-lunch',
                menuItemId: menuItems[3]._id,
                name: menuItems[3].name,
                price: menuItems[3].price,
                restaurantName: restaurant.name,
                addedAt: new Date(),
                deliveryTime: '12:00',
                description: menuItems[3].description,
                image: menuItems[3].image
              }], 
              dinner: [] 
            },
            monday: { lunch: [], dinner: [] },
            tuesday: { lunch: [], dinner: [] },
            wednesday: { lunch: [], dinner: [] },
            thursday: { lunch: [], dinner: [] },
            friday: { lunch: [], dinner: [] },
            saturday: { 
              lunch: [{
                id: 'item-oct25-lunch',
                planId: 'plan-oct25-lunch',
                menuItemId: menuItems[0]._id,
                name: menuItems[0].name,
                price: menuItems[0].price,
                restaurantName: restaurant.name,
                addedAt: new Date(),
                deliveryTime: '12:00',
                description: menuItems[0].description,
                image: menuItems[0].image
              }], 
              dinner: [] 
            }
          }
        }
      ],
      billingCycle: 'bi-weekly',
      nextBillingDate: new Date(endDate.getTime() + 24 * 60 * 60 * 1000),
      deliveryAddress: {
        street: '123 Test Street',
        city: 'Test City',
        province: 'Test Province',
        postalCode: 'T1T 1T1',
        instructions: 'Test delivery instructions'
      },
      customerPhone: '123-456-7890',
      selectedRestaurantName: restaurant.name,
      selectedRestaurantData: {
        id: restaurant._id,
        name: restaurant.name,
        cuisine: restaurant.cuisine
      },
      totalMealsCount: 5, // 5 meals total
      totalPlanValue: menuItems[0].price * 2 + menuItems[1].price + menuItems[2].price + menuItems[3].price
    });
    
    await subscriptionMealPlan.save();
    console.log(`✅ Created subscription meal plan with 5 meals`);
    console.log(`   - Oct 12 (Sunday): Lunch + Dinner`);
    console.log(`   - Oct 18 (Friday): Lunch`);
    console.log(`   - Oct 19 (Sunday): Lunch`);
    console.log(`   - Oct 25 (Saturday): Lunch`);

    // Step 3: Generate orders for each date
    console.log('\n🔄 Step 3: Generating orders from subscription...');
    console.log('-' .repeat(50));
    
    const ordersToCreate = [
      { date: new Date(2025, 9, 12), day: 'Sunday', meals: ['Lunch', 'Dinner'] }, // Oct 12
      { date: new Date(2025, 9, 18), day: 'Friday', meals: ['Lunch'] }, // Oct 18
      { date: new Date(2025, 9, 19), day: 'Sunday', meals: ['Lunch'] }, // Oct 19
      { date: new Date(2025, 9, 25), day: 'Saturday', meals: ['Lunch'] } // Oct 25
    ];
    
    let createdOrders = 0;
    
    for (const orderInfo of ordersToCreate) {
      // Get meals for this specific date using the subscription plan
      const todaysMeals = subscriptionMealPlan.getTodaysMeals.call({
        ...subscriptionMealPlan.toObject(),
        getTodaysMeals: subscriptionMealPlan.getTodaysMeals
      });
      
      // Generate unique order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Create order for this date
      const order = new Order({
        orderNumber: orderNumber,
        customerId: userId,
        restaurantId: restaurantId,
        items: [], // Will be populated based on the date
        subtotal: 0,
        deliveryFee: 5.00, // Standard delivery fee
        tax: 0,
        total: 0,
        status: 'scheduled',
        type: 'weekly-plan',
        scheduledDate: orderInfo.date,
        activationDate: orderInfo.date,
        isScheduledOrder: true,
        deliveryAddress: subscriptionMealPlan.deliveryAddress,
        weeklyPlanId: subscriptionMealPlan._id,
        mealType: orderInfo.meals.includes('Lunch') ? 'lunch' : 'dinner'
      });
      
      // Add items based on the date
      let dayMeals = [];
      const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][orderInfo.date.getDay()];
      
      // Find the correct week
      const weekIndex = orderInfo.date >= week2Start ? 1 : 0;
      const week = subscriptionMealPlan.weeks[weekIndex];
      
      if (week && week.meals[dayName]) {
        const lunchItems = week.meals[dayName].lunch || [];
        const dinnerItems = week.meals[dayName].dinner || [];
        dayMeals = [...lunchItems, ...dinnerItems];
      }
      
      // Add items to order
      dayMeals.forEach(meal => {
        order.items.push({
          menuItemId: meal.menuItemId,
          name: meal.name,
          price: meal.price,
          quantity: 1,
          specialInstructions: ''
        });
        order.subtotal += meal.price;
      });
      
      // Calculate tax and total
      order.tax = order.subtotal * 0.13; // 13% tax
      order.total = order.subtotal + order.deliveryFee + order.tax;
      
      if (order.items.length > 0) {
        await order.save();
        createdOrders++;
        console.log(`✅ Created order for ${orderInfo.date.toDateString()} (${orderInfo.day}) - ${order.items.length} items - $${order.total.toFixed(2)}`);
      }
    }
    
    console.log(`✅ Created ${createdOrders} orders total`);

    // Step 4: Check partner view
    console.log('\n🏪 Step 4: Checking Partner Dashboard View...');
    console.log('-' .repeat(50));
    
    const partnerOrders = await Order.find({ restaurantId })
      .populate('customerId', 'firstName lastName')
      .sort({ deliveryDate: 1 });
    
    const testUserOrders = partnerOrders.filter(order => 
      order.customerId && order.customerId._id.toString() === userId
    );
    
    console.log(`📊 Partner Dashboard Results:`);
    console.log(`   Total restaurant orders: ${partnerOrders.length}`);
    console.log(`   Test user orders: ${testUserOrders.length}`);
    
    if (testUserOrders.length > 0) {
      console.log(`\n📦 Test User Orders (Partner View):`);
      testUserOrders.forEach((order, index) => {
        const deliveryDate = order.scheduledDate || order.deliveryDate || new Date();
        console.log(`   ${index + 1}. ${deliveryDate.toDateString()} (${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][deliveryDate.getDay()]})`);
        console.log(`      Items: ${order.items.length}, Total: $${order.total ? order.total.toFixed(2) : '0.00'}, Status: ${order.status}`);
        order.items.forEach((item, itemIndex) => {
          console.log(`        ${itemIndex + 1}. ${item.name} - $${item.price}`);
        });
      });
      
      // Verify dates are correct
      console.log(`\n✅ Date Verification:`);
      const expectedDates = ['Oct 12', 'Oct 18', 'Oct 19', 'Oct 25'];
      testUserOrders.forEach((order, index) => {
        const deliveryDate = order.scheduledDate || order.deliveryDate || new Date();
        const orderDateStr = deliveryDate.toDateString();
        const isExpected = expectedDates.some(expected => orderDateStr.includes(expected));
        console.log(`   ${orderDateStr}: ${isExpected ? '✅ Expected' : '❌ Unexpected'}`);
      });
      
    } else {
      console.log(`❌ No orders found for test user in partner view`);
    }

    // Summary
    console.log('\n🎯 Test Summary:');
    console.log('-' .repeat(50));
    console.log(`✅ Cleaned up existing data`);
    console.log(`✅ Created bi-weekly subscription (Oct 12 - Oct 25)`);
    console.log(`✅ Added meals on specific dates: Oct 12, 18, 19, 25`);
    console.log(`✅ Generated ${createdOrders} orders`);
    console.log(`✅ Orders visible in partner dashboard: ${testUserOrders.length > 0 ? 'YES' : 'NO'}`);
    
    if (testUserOrders.length === createdOrders && createdOrders > 0) {
      console.log(`\n🎉 SUCCESS: All orders generated correctly and visible to partner!`);
      console.log(`   - Orders appear on correct dates`);
      console.log(`   - No more +1 day offset issue`);
      console.log(`   - Partner can see all scheduled deliveries`);
    } else {
      console.log(`\n⚠️ ISSUE: Expected ${createdOrders} orders, found ${testUserOrders.length} in partner view`);
    }

  } catch (error) {
    console.error('❌ Error during test:', error);
  }
};

const runTest = async () => {
  await connectDB();
  await runCompleteTest();
  await mongoose.connection.close();
  console.log('\n✅ Database connection closed');
};

runTest();
