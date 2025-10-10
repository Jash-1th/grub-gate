/**
 * Check orders from partner/restaurant perspective
 * Restaurant ID: 68e73d168c18e7fd776a6327 (Maple Leaf Bistro)
 * User ID: 68e7b7ea4a70ed31cffb3fe9 (mamilla jaswanth kumar)
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./src/models/Order');
const SubscriptionMealPlan = require('./src/models/SubscriptionMealPlan');
const MealPlan = require('./src/models/MealPlan');
const Restaurant = require('./src/models/Restaurant');
const User = require('./src/models/User');

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

const checkPartnerOrders = async () => {
  try {
    console.log('🏪 Checking Partner/Restaurant Orders');
    console.log('=' .repeat(60));

    const restaurantId = '68e73d168c18e7fd776a6327'; // Maple Leaf Bistro
    const userId = '68e7b7ea4a70ed31cffb3fe9'; // mamilla jaswanth kumar

    // Get restaurant info
    const restaurant = await Restaurant.findById(restaurantId);
    const user = await User.findById(userId);
    
    console.log(`🏪 Restaurant: ${restaurant?.name || 'Unknown'} (${restaurantId})`);
    console.log(`👤 Customer: ${user?.firstName} ${user?.lastName} (${userId})`);

    // Check all orders for this restaurant
    console.log('\n📋 All Orders for Restaurant:');
    console.log('-' .repeat(40));
    
    const allOrders = await Order.find({ restaurantId })
      .populate('customerId', 'firstName lastName email')
      .sort({ orderDate: -1 });
    
    if (allOrders.length === 0) {
      console.log('❌ No orders found for this restaurant');
    } else {
      console.log(`✅ Found ${allOrders.length} total orders for this restaurant`);
      
      // Show only first 5 orders and any orders from our test user
      const ordersToShow = allOrders.slice(0, 5);
      const testUserOrders = allOrders.filter(order => 
        order.customerId?._id && order.customerId._id.toString() === userId
      );
      
      // Combine and deduplicate
      const combinedOrders = [...ordersToShow];
      testUserOrders.forEach(testOrder => {
        if (!combinedOrders.find(order => order._id.toString() === testOrder._id.toString())) {
          combinedOrders.push(testOrder);
        }
      });
      
      console.log(`Showing ${combinedOrders.length} orders (first 5 + any from test user):`);
      
      combinedOrders.forEach((order, index) => {
        console.log(`\n📦 Order ${index + 1}:`);
        console.log(`   ID: ${order._id}`);
        console.log(`   Customer: ${order.customerId?.firstName || 'Unknown'} ${order.customerId?.lastName || ''} (${order.customerId?._id || 'Unknown'})`);
        console.log(`   Order Date: ${order.orderDate ? order.orderDate.toDateString() : 'Unknown'}`);
        console.log(`   Delivery Date: ${order.deliveryDate ? order.deliveryDate.toDateString() : 'Unknown'}`);
        console.log(`   Status: ${order.status || 'Unknown'}`);
        console.log(`   Total: $${order.totalAmount || 0}`);
        console.log(`   Items: ${order.items?.length || 0}`);
        
        if (order.items && order.items.length > 0) {
          order.items.forEach((item, itemIndex) => {
            console.log(`     ${itemIndex + 1}. ${item.name || 'Unknown'} - $${item.price || 0} (Qty: ${item.quantity || 1})`);
          });
        }
        
        // Check if this order is for our test user
        if (order.customerId?._id && order.customerId._id.toString() === userId) {
          console.log(`   🎯 This is an order from our test user!`);
        }
      });
    }

    // Check orders specifically for our test user
    console.log('\n📋 Orders for Test User:');
    console.log('-' .repeat(40));
    
    const userOrders = await Order.find({ 
      customerId: userId,
      restaurantId: restaurantId 
    }).sort({ orderDate: -1 });
    
    if (userOrders.length === 0) {
      console.log('❌ No orders found for test user at this restaurant');
    } else {
      console.log(`✅ Found ${userOrders.length} orders for test user`);
      
      userOrders.forEach((order, index) => {
        console.log(`\n📦 User Order ${index + 1}:`);
        console.log(`   ID: ${order._id}`);
        console.log(`   Order Date: ${order.orderDate.toDateString()}`);
        console.log(`   Delivery Date: ${order.deliveryDate.toDateString()}`);
        console.log(`   Status: ${order.status}`);
        console.log(`   Items:`);
        
        order.items.forEach((item, itemIndex) => {
          console.log(`     ${itemIndex + 1}. ${item.name} - $${item.price}`);
        });
      });
    }

    // Check today's orders (what partner would see today)
    console.log('\n📋 Today\'s Orders for Restaurant:');
    console.log('-' .repeat(40));
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const todaysOrders = await Order.find({
      restaurantId: restaurantId,
      deliveryDate: {
        $gte: today,
        $lt: tomorrow
      }
    }).populate('customerId', 'firstName lastName email');
    
    console.log(`📅 Checking orders for delivery on: ${today.toDateString()}`);
    
    if (todaysOrders.length === 0) {
      console.log('❌ No orders scheduled for delivery today');
    } else {
      console.log(`✅ Found ${todaysOrders.length} orders for delivery today`);
      
      todaysOrders.forEach((order, index) => {
        console.log(`\n📦 Today's Order ${index + 1}:`);
        console.log(`   Customer: ${order.customerId?.firstName} ${order.customerId?.lastName}`);
        console.log(`   Order ID: ${order._id}`);
        console.log(`   Status: ${order.status}`);
        console.log(`   Items: ${order.items.length}`);
      });
    }

    // Check subscription meal plans that should generate orders
    console.log('\n📋 Active Subscription Meal Plans:');
    console.log('-' .repeat(40));
    
    const activeSubscriptions = await SubscriptionMealPlan.find({
      restaurantId: restaurantId,
      status: 'active'
    }).populate('customerId', 'firstName lastName email');
    
    if (activeSubscriptions.length === 0) {
      console.log('❌ No active subscription meal plans for this restaurant');
    } else {
      console.log(`✅ Found ${activeSubscriptions.length} active subscription meal plans`);
      
      activeSubscriptions.forEach((sub, index) => {
        console.log(`\n📋 Subscription ${index + 1}:`);
        console.log(`   Customer: ${sub.customerId?.firstName} ${sub.customerId?.lastName}`);
        console.log(`   Plan Type: ${sub.planType}`);
        console.log(`   Start: ${sub.planStartDate.toDateString()}`);
        console.log(`   End: ${sub.planEndDate.toDateString()}`);
        console.log(`   Total Meals: ${sub.totalMealsCount}`);
        console.log(`   Orders Generated: ${sub.isOrdersGenerated ? 'Yes' : 'No'}`);
        console.log(`   Generated Orders Count: ${sub.generatedOrders?.length || 0}`);
        
        if (sub.customerId?._id.toString() === userId) {
          console.log(`   🎯 This is our test user's subscription!`);
          
          // Check if this subscription has meal items
          let totalMealsInPlan = 0;
          sub.weeks.forEach((week, weekIndex) => {
            const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            let weekMeals = 0;
            
            daysOfWeek.forEach(day => {
              const dayMeals = week.meals[day];
              if (dayMeals) {
                weekMeals += (dayMeals.lunch?.length || 0) + (dayMeals.dinner?.length || 0);
              }
            });
            
            totalMealsInPlan += weekMeals;
            if (weekMeals > 0) {
              console.log(`     Week ${weekIndex + 1}: ${weekMeals} meals`);
            }
          });
          
          console.log(`   📊 Total meals in subscription plan: ${totalMealsInPlan}`);
        }
      });
    }

    // Summary for partner
    console.log('\n🎯 Partner Dashboard Summary:');
    console.log('-' .repeat(40));
    console.log(`Total Orders: ${allOrders.length}`);
    console.log(`Today's Orders: ${todaysOrders.length}`);
    console.log(`Active Subscriptions: ${activeSubscriptions.length}`);
    console.log(`Test User Orders: ${userOrders.length}`);
    
    if (userOrders.length === 0 && activeSubscriptions.some(sub => sub.customerId?._id.toString() === userId)) {
      console.log('\n💡 Note: Test user has active subscription but no orders yet.');
      console.log('   This could mean:');
      console.log('   1. Orders haven\'t been generated from the subscription yet');
      console.log('   2. The subscription meal plan is empty (no items selected)');
      console.log('   3. Orders are scheduled for future dates');
    }

  } catch (error) {
    console.error('❌ Error checking partner orders:', error);
  }
};

const runCheck = async () => {
  await connectDB();
  await checkPartnerOrders();
  await mongoose.connection.close();
  console.log('\n✅ Database connection closed');
};

runCheck();
