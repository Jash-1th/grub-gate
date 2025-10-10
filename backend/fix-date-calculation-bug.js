// Script to fix the date calculation bug in order generation
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./src/models/User');
const Order = require('./src/models/Order');
const SubscriptionMealPlan = require('./src/models/SubscriptionMealPlan');

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

async function fixDateCalculationBug() {
  await connectDB();
  
  try {
    console.log('🔍 Analyzing date calculation bug for jash64326@gmail.com...');
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

    console.log('📋 Current Meal Plan Analysis:');
    console.log(`   Plan Start Date: ${mealPlan.planStartDate.toDateString()}`);
    console.log(`   Plan End Date: ${mealPlan.planEndDate.toDateString()}`);
    console.log(`   Plan Type: ${mealPlan.planType}`);
    
    if (mealPlan.weekStartDates && mealPlan.weekStartDates.length > 0) {
      console.log(`   Week Start Dates:`);
      mealPlan.weekStartDates.forEach((date, index) => {
        console.log(`     Week ${index + 1}: ${date.toDateString()}`);
      });
    }

    // Get current orders
    const currentOrders = await Order.find({ 
      customerId: jashUser._id 
    }).sort({ scheduledDate: 1 });

    console.log('\n📦 Current Orders Analysis:');
    console.log(`   Total Orders: ${currentOrders.length}`);
    
    currentOrders.forEach((order, index) => {
      console.log(`   Order ${index + 1}:`);
      console.log(`     Scheduled: ${order.scheduledDate.toDateString()}`);
      console.log(`     Meal Type: ${order.mealType}`);
      console.log(`     Items: ${order.items.map(item => item.name).join(', ')}`);
    });

    // Analyze the date calculation issue
    console.log('\n🔍 Date Calculation Analysis:');
    console.log('=' .repeat(50));
    
    const planStartDate = mealPlan.planStartDate;
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    
    console.log(`Plan Start Date: ${planStartDate.toDateString()} (${daysOfWeek[planStartDate.getDay()]})`);
    
    // Calculate what the correct dates should be
    console.log('\n📅 Correct Date Calculations:');
    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      const correctDate = new Date(planStartDate);
      correctDate.setDate(planStartDate.getDate() + dayIndex);
      
      console.log(`   ${daysOfWeek[dayIndex]}: ${correctDate.toDateString()}`);
    }

    // Check if orders match the expected dates
    console.log('\n🚨 Date Mismatch Analysis:');
    const expectedSaturday = new Date(planStartDate);
    expectedSaturday.setDate(planStartDate.getDate() + 6); // Saturday is dayIndex 6
    
    console.log(`Expected Saturday: ${expectedSaturday.toDateString()}`);
    
    const saturdayOrders = currentOrders.filter(order => {
      const orderDay = order.scheduledDate.getDay();
      return orderDay === 6; // Saturday
    });
    
    if (saturdayOrders.length > 0) {
      console.log(`Actual Saturday Orders:`);
      saturdayOrders.forEach(order => {
        console.log(`   ${order.scheduledDate.toDateString()} - ${order.mealType}`);
      });
    } else {
      console.log(`❌ No Saturday orders found`);
    }

    // Check for orders before plan start
    const ordersBeforePlanStart = currentOrders.filter(order => 
      order.scheduledDate < planStartDate
    );
    
    if (ordersBeforePlanStart.length > 0) {
      console.log('\n🚨 CRITICAL ISSUE: Orders scheduled BEFORE plan start date:');
      ordersBeforePlanStart.forEach(order => {
        console.log(`   ${order.scheduledDate.toDateString()} - ${order.mealType} (${order.items.map(i => i.name).join(', ')})`);
      });
    }

    // Propose fix
    console.log('\n💡 Proposed Fix:');
    console.log('=' .repeat(50));
    console.log('1. Delete orders scheduled before plan start date');
    console.log('2. Regenerate orders with correct date calculations');
    console.log('3. Ensure orders start from plan start date (Sunday)');
    console.log('4. Fix the frontend to show correct dates');

    // Ask for confirmation to fix
    console.log('\n❓ Would you like to fix the orders? (This will delete and recreate them)');
    console.log('   Run with --fix flag to apply the fix');
    
    if (process.argv.includes('--fix')) {
      console.log('\n🔧 Applying fix...');
      
      // Delete existing orders
      const deleteResult = await Order.deleteMany({ customerId: jashUser._id });
      console.log(`🗑️ Deleted ${deleteResult.deletedCount} existing orders`);
      
      // Recreate orders with correct dates
      const newOrders = [];
      
      // For bi-weekly plan: Week 1 (Oct 12-18) and Week 2 (Oct 19-25)
      const week1Start = new Date(planStartDate);
      const week2Start = new Date(planStartDate);
      week2Start.setDate(planStartDate.getDate() + 7);
      
      // Create orders for Saturday of Week 1 (Oct 18)
      const saturdayWeek1 = new Date(week1Start);
      saturdayWeek1.setDate(week1Start.getDate() + 6); // Saturday
      
      // Create orders for Sunday of Week 1 (Oct 12) 
      const sundayWeek1 = new Date(week1Start);
      
      const orderCount = await Order.countDocuments();
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      
      // Order 1: Saturday Oct 18 - Fish Fry Dinner
      const order1 = new Order({
        orderNumber: `GG${dateStr}${String(orderCount + 1).padStart(4, '0')}`,
        customerId: jashUser._id,
        restaurantId: mealPlan.restaurantId,
        type: 'weekly-plan',
        isSubscriptionOrder: true,
        items: [{
          menuItemId: null, // Will be populated
          name: 'fish fry',
          price: 20,
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
        notes: `Fixed order - Week 1 Saturday`,
        weeklyPlanId: mealPlan._id
      });
      
      // Order 2: Saturday Oct 18 - Mutton Fry Lunch  
      const order2 = new Order({
        orderNumber: `GG${dateStr}${String(orderCount + 2).padStart(4, '0')}`,
        customerId: jashUser._id,
        restaurantId: mealPlan.restaurantId,
        type: 'weekly-plan',
        isSubscriptionOrder: true,
        items: [{
          menuItemId: null,
          name: 'mutton fry',
          price: 15,
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
        notes: `Fixed order - Week 1 Saturday`,
        weeklyPlanId: mealPlan._id
      });
      
      // Calculate totals
      order1.calculateTotals(3.99, 0.13);
      order2.calculateTotals(3.99, 0.13);
      
      const savedOrders = await Order.insertMany([order1, order2]);
      
      console.log(`✅ Created ${savedOrders.length} corrected orders:`);
      savedOrders.forEach((order, index) => {
        console.log(`   ${index + 1}. ${order.orderNumber} - ${order.scheduledDate.toDateString()} - ${order.mealType}`);
      });
    }
    
    console.log('\n✅ Analysis complete!');
    
  } catch (error) {
    console.error('❌ Error fixing date calculation:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixDateCalculationBug();
