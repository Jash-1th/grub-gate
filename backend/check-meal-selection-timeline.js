// Script to check when jash64326@gmail.com selected their meal items
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

async function checkMealSelectionTimeline() {
  await connectDB();
  
  try {
    console.log('🔍 Checking meal selection timeline for jash64326@gmail.com...');
    console.log('=' .repeat(70));

    // Find the user
    const jashUser = await User.findOne({ 
      email: 'jash64326@gmail.com' 
    });

    if (!jashUser) {
      console.log('❌ User not found');
      return;
    }

    console.log(`👤 Customer: ${jashUser.firstName} ${jashUser.lastName}`);
    console.log(`📧 Email: ${jashUser.email}`);
    console.log(`📅 User Account Created: ${jashUser.createdAt ? jashUser.createdAt.toLocaleString() : 'N/A'}`);

    // Get meal plan details
    const mealPlan = await SubscriptionMealPlan.findOne({ 
      customerId: jashUser._id 
    });

    if (mealPlan) {
      console.log('\n📋 Meal Plan Timeline:');
      console.log('=' .repeat(50));
      console.log(`📅 Meal Plan Created: ${mealPlan.createdAt ? mealPlan.createdAt.toLocaleString() : 'N/A'}`);
      console.log(`📅 Plan Start Date: ${mealPlan.planStartDate ? mealPlan.planStartDate.toLocaleString() : 'N/A'}`);
      console.log(`📅 Plan End Date: ${mealPlan.planEndDate ? mealPlan.planEndDate.toLocaleString() : 'N/A'}`);
      console.log(`🔄 Plan Type: ${mealPlan.planType}`);
      console.log(`📊 Status: ${mealPlan.status}`);
    }

    // Get all orders with detailed timestamps
    const orders = await Order.find({ 
      customerId: jashUser._id 
    }).sort({ createdAt: 1 });

    console.log('\n📦 Order Creation Timeline:');
    console.log('=' .repeat(50));
    console.log(`📊 Total Orders: ${orders.length}`);

    orders.forEach((order, index) => {
      console.log(`\n📋 Order ${index + 1} Selection Details:`);
      console.log(`   Order Number: ${order.orderNumber}`);
      console.log(`   🕐 Order Created (Item Selected): ${order.createdAt ? order.createdAt.toLocaleString() : 'N/A'}`);
      console.log(`   📅 Scheduled Delivery Date: ${order.scheduledDate ? order.scheduledDate.toLocaleString() : 'N/A'}`);
      console.log(`   🍽️ Meal Type: ${order.mealType}`);
      console.log(`   📊 Status: ${order.status}`);
      console.log(`   💳 Payment Status: ${order.paymentStatus}`);
      
      if (order.items && order.items.length > 0) {
        console.log(`   🍽️ Selected Items:`);
        order.items.forEach((item, itemIndex) => {
          console.log(`     ${itemIndex + 1}. ${item.name} - $${item.price}`);
          console.log(`        Quantity: ${item.quantity}`);
          if (item.specialInstructions) {
            console.log(`        Special Instructions: ${item.specialInstructions}`);
          }
        });
      }

      // Calculate time difference between selection and delivery
      if (order.createdAt && order.scheduledDate) {
        const timeDiff = order.scheduledDate.getTime() - order.createdAt.getTime();
        const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hoursDiff = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        console.log(`   ⏱️ Lead Time: ${daysDiff} days, ${hoursDiff} hours between selection and delivery`);
      }

      if (order.updatedAt && order.updatedAt.getTime() !== order.createdAt.getTime()) {
        console.log(`   🔄 Last Updated: ${order.updatedAt.toLocaleString()}`);
      }
    });

    // Timeline Summary
    console.log('\n📊 Selection Timeline Summary:');
    console.log('=' .repeat(70));
    
    if (jashUser.createdAt) {
      console.log(`👤 User Registration: ${jashUser.createdAt.toLocaleString()}`);
    }
    
    if (mealPlan && mealPlan.createdAt) {
      console.log(`📋 Meal Plan Setup: ${mealPlan.createdAt.toLocaleString()}`);
    }
    
    if (orders.length > 0) {
      const firstOrder = orders[0];
      const lastOrder = orders[orders.length - 1];
      console.log(`🍽️ First Item Selected: ${firstOrder.createdAt ? firstOrder.createdAt.toLocaleString() : 'N/A'}`);
      if (orders.length > 1) {
        console.log(`🍽️ Last Item Selected: ${lastOrder.createdAt ? lastOrder.createdAt.toLocaleString() : 'N/A'}`);
      }
      
      // Check if all orders were created at the same time (bulk creation)
      const allOrderTimes = orders.map(o => o.createdAt.getTime());
      const uniqueTimes = [...new Set(allOrderTimes)];
      
      if (uniqueTimes.length === 1) {
        console.log(`⚡ All items selected simultaneously (bulk selection)`);
      } else {
        console.log(`🕐 Items selected at different times (individual selection)`);
      }
    }

    // Business Rules Check
    console.log('\n🔍 Business Rules Analysis:');
    console.log('=' .repeat(50));
    
    if (mealPlan && orders.length > 0) {
      const planStart = mealPlan.planStartDate;
      const firstOrderCreated = orders[0].createdAt;
      
      if (planStart && firstOrderCreated) {
        const selectionBeforePlan = firstOrderCreated < planStart;
        console.log(`📅 Items selected before plan start: ${selectionBeforePlan ? '✅ Yes (Correct)' : '❌ No (Issue)'}`);
        
        const timeDiff = planStart.getTime() - firstOrderCreated.getTime();
        const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        console.log(`⏱️ Selection lead time: ${daysDiff} days before plan start`);
      }
    }
    
    console.log('\n✅ Timeline analysis complete!');
    
  } catch (error) {
    console.error('❌ Error checking timeline:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkMealSelectionTimeline();
