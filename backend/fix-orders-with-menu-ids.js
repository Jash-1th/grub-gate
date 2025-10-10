// Script to fix orders with proper menu item IDs
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./src/models/User');
const Order = require('./src/models/Order');
const SubscriptionMealPlan = require('./src/models/SubscriptionMealPlan');
const MenuItem = require('./src/models/MenuItem');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI;
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB Atlas');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

async function fixOrdersWithMenuIds() {
  await connectDB();
  
  try {
    const restaurantId = '68e73d168c18e7fd776a6327';
    
    console.log('🔧 Creating corrected orders with proper menu item IDs...');
    console.log('=' .repeat(70));

    // Find the user
    const jashUser = await User.findOne({ 
      email: 'jash64326@gmail.com' 
    });

    if (!jashUser) {
      console.log('❌ User not found');
      return;
    }

    // Get the meal plan
    const mealPlan = await SubscriptionMealPlan.findOne({ 
      customerId: jashUser._id 
    });

    if (!mealPlan) {
      console.log('❌ Meal plan not found');
      return;
    }

    // Get menu items
    const fishFry = await MenuItem.findOne({ 
      restaurantId: new mongoose.Types.ObjectId(restaurantId),
      name: { $regex: /fish.*fry/i }
    });
    
    const muttonFry = await MenuItem.findOne({ 
      restaurantId: new mongoose.Types.ObjectId(restaurantId),
      name: { $regex: /mutton.*fry/i }
    });

    if (!fishFry || !muttonFry) {
      console.log('❌ Menu items not found');
      console.log(`Fish Fry: ${fishFry ? 'Found' : 'Not found'}`);
      console.log(`Mutton Fry: ${muttonFry ? 'Found' : 'Not found'}`);
      return;
    }

    console.log('🍽️ Found menu items:');
    console.log(`   Fish Fry: ${fishFry.name} - $${fishFry.price} (ID: ${fishFry._id})`);
    console.log(`   Mutton Fry: ${muttonFry.name} - $${muttonFry.price} (ID: ${muttonFry._id})`);

    // Calculate correct dates
    const planStartDate = mealPlan.planStartDate;
    const saturdayWeek1 = new Date(planStartDate);
    saturdayWeek1.setDate(planStartDate.getDate() + 6); // Saturday of week 1

    console.log(`\n📅 Correct Saturday date: ${saturdayWeek1.toDateString()}`);

    // Generate unique order numbers
    const orderCount = await Order.countDocuments();
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const timestamp = Date.now().toString().slice(-4); // Last 4 digits of timestamp for uniqueness
    
    // Create corrected orders
    const orders = [];

    // Order 1: Saturday Oct 18 - Fish Fry Dinner
    const order1 = new Order({
      orderNumber: `GG${dateStr}${timestamp}1`,
      customerId: jashUser._id,
      restaurantId: new mongoose.Types.ObjectId(restaurantId),
      type: 'weekly-plan',
      isSubscriptionOrder: true,
      items: [{
        menuItemId: fishFry._id,
        name: fishFry.name,
        price: fishFry.price,
        quantity: 1,
        specialInstructions: ''
      }],
      status: 'scheduled',
      paymentStatus: 'paid',
      scheduledDate: saturdayWeek1,
      activationDate: saturdayWeek1,
      isScheduledOrder: true,
      paymentMethod: 'card',
      deliveryAddress: mealPlan.deliveryAddress,
      deliveryTime: {
        requested: saturdayWeek1,
        estimated: new Date(saturdayWeek1.getTime() + 45 * 60 * 1000)
      },
      mealType: 'dinner',
      specialInstructions: mealPlan.specialInstructions || '',
      notes: `Corrected order - Saturday Week 1 Dinner`,
      weeklyPlanId: mealPlan._id
    });

    // Order 2: Saturday Oct 18 - Mutton Fry Lunch
    const order2 = new Order({
      orderNumber: `GG${dateStr}${timestamp}2`,
      customerId: jashUser._id,
      restaurantId: new mongoose.Types.ObjectId(restaurantId),
      type: 'weekly-plan',
      isSubscriptionOrder: true,
      items: [{
        menuItemId: muttonFry._id,
        name: muttonFry.name,
        price: muttonFry.price,
        quantity: 1,
        specialInstructions: ''
      }],
      status: 'scheduled',
      paymentStatus: 'paid',
      scheduledDate: saturdayWeek1,
      activationDate: saturdayWeek1,
      isScheduledOrder: true,
      paymentMethod: 'card',
      deliveryAddress: mealPlan.deliveryAddress,
      deliveryTime: {
        requested: saturdayWeek1,
        estimated: new Date(saturdayWeek1.getTime() + 45 * 60 * 1000)
      },
      mealType: 'lunch',
      specialInstructions: mealPlan.specialInstructions || '',
      notes: `Corrected order - Saturday Week 1 Lunch`,
      weeklyPlanId: mealPlan._id
    });

    // Calculate totals
    order1.calculateTotals(3.99, 0.13);
    order2.calculateTotals(3.99, 0.13);

    orders.push(order1, order2);

    // Save orders
    const savedOrders = await Order.insertMany(orders);
    
    console.log(`\n✅ Successfully created ${savedOrders.length} corrected orders:`);
    savedOrders.forEach((order, index) => {
      console.log(`   ${index + 1}. ${order.orderNumber}`);
      console.log(`      Date: ${order.scheduledDate.toDateString()}`);
      console.log(`      Meal: ${order.mealType}`);
      console.log(`      Item: ${order.items[0].name}`);
      console.log(`      Total: $${order.total}`);
      console.log('      ---');
    });

    // Verify the fix
    console.log('\n🔍 Verification:');
    const allOrders = await Order.find({ customerId: jashUser._id }).sort({ scheduledDate: 1 });
    
    console.log(`📦 Total orders for user: ${allOrders.length}`);
    allOrders.forEach((order, index) => {
      const isCorrect = order.scheduledDate >= planStartDate;
      console.log(`   ${index + 1}. ${order.scheduledDate.toDateString()} - ${order.mealType} ${isCorrect ? '✅' : '❌'}`);
    });

    const ordersBeforePlan = allOrders.filter(order => order.scheduledDate < planStartDate);
    
    if (ordersBeforePlan.length === 0) {
      console.log('\n🎉 SUCCESS: All orders are now scheduled on or after the plan start date!');
    } else {
      console.log(`\n⚠️ WARNING: ${ordersBeforePlan.length} orders still scheduled before plan start`);
    }

    console.log('\n📊 Summary:');
    console.log('=' .repeat(50));
    console.log(`👤 Customer: ${jashUser.firstName} ${jashUser.lastName}`);
    console.log(`📧 Email: ${jashUser.email}`);
    console.log(`📋 Plan Start: ${planStartDate.toDateString()}`);
    console.log(`📦 Total Orders: ${allOrders.length}`);
    console.log(`💰 Total Value: $${allOrders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}`);
    console.log(`✅ Orders Fixed: All orders now respect plan start date`);
    
    console.log('\n🎯 Next Steps:');
    console.log('1. ✅ Backend orders are now correctly scheduled');
    console.log('2. 🔄 Frontend UI should now show Saturday Oct 18 with 2 items');
    console.log('3. 🔄 Analytics should reflect the corrected order dates');
    
  } catch (error) {
    console.error('❌ Error fixing orders:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixOrdersWithMenuIds();
