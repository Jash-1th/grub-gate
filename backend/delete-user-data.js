// Script to delete subscription plans and orders for a specific user
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./src/models/User');
const Order = require('./src/models/Order');
const Subscription = require('./src/models/Subscription');
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

async function deleteUserData() {
  await connectDB();
  
  try {
    const userId = '68e7b7ea4a70ed31cffb3fe9';
    
    console.log('🗑️ Deleting subscription plans and orders for user...');
    console.log('=' .repeat(60));
    console.log(`👤 User ID: ${userId}`);

    // First, check if user exists and get their info
    const user = await User.findById(userId);
    
    if (!user) {
      console.log('❌ User not found with this ID');
      return;
    }

    console.log(`📧 User: ${user.firstName} ${user.lastName} (${user.email})`);

    // Step 1: Check what data exists
    console.log('\n🔍 Step 1: Checking existing data...');
    
    const orders = await Order.find({ customerId: userId });
    const subscriptions = await Subscription.find({ customerId: userId });
    const mealPlans = await SubscriptionMealPlan.find({ customerId: userId });

    console.log(`📦 Orders found: ${orders.length}`);
    console.log(`🔄 Subscriptions found: ${subscriptions.length}`);
    console.log(`📋 Meal Plans found: ${mealPlans.length}`);

    if (orders.length === 0 && subscriptions.length === 0 && mealPlans.length === 0) {
      console.log('ℹ️ No data to delete for this user');
      return;
    }

    // Show details before deletion
    if (orders.length > 0) {
      console.log('\n📦 Orders to be deleted:');
      orders.forEach((order, index) => {
        console.log(`   ${index + 1}. ${order.orderNumber} - ${order.scheduledDate?.toDateString() || order.createdAt?.toDateString()} - $${order.total} - ${order.status}`);
      });
    }

    if (subscriptions.length > 0) {
      console.log('\n🔄 Subscriptions to be deleted:');
      subscriptions.forEach((sub, index) => {
        console.log(`   ${index + 1}. ${sub.planName} - $${sub.monthlyPrice}/month - ${sub.status}`);
      });
    }

    if (mealPlans.length > 0) {
      console.log('\n📋 Meal Plans to be deleted:');
      mealPlans.forEach((plan, index) => {
        console.log(`   ${index + 1}. ${plan.planType} - ${plan.planStartDate?.toDateString()} to ${plan.planEndDate?.toDateString()} - ${plan.status}`);
      });
    }

    // Step 2: Delete the data
    console.log('\n🗑️ Step 2: Deleting data...');
    
    // Delete orders
    if (orders.length > 0) {
      const deletedOrders = await Order.deleteMany({ customerId: userId });
      console.log(`✅ Deleted ${deletedOrders.deletedCount} orders`);
    }

    // Delete subscriptions
    if (subscriptions.length > 0) {
      const deletedSubscriptions = await Subscription.deleteMany({ customerId: userId });
      console.log(`✅ Deleted ${deletedSubscriptions.deletedCount} subscriptions`);
    }

    // Delete meal plans
    if (mealPlans.length > 0) {
      const deletedMealPlans = await SubscriptionMealPlan.deleteMany({ customerId: userId });
      console.log(`✅ Deleted ${deletedMealPlans.deletedCount} meal plans`);
    }

    // Step 3: Verify deletion
    console.log('\n✅ Step 3: Verifying deletion...');
    
    const remainingOrders = await Order.find({ customerId: userId });
    const remainingSubscriptions = await Subscription.find({ customerId: userId });
    const remainingMealPlans = await SubscriptionMealPlan.find({ customerId: userId });

    console.log(`📦 Remaining orders: ${remainingOrders.length}`);
    console.log(`🔄 Remaining subscriptions: ${remainingSubscriptions.length}`);
    console.log(`📋 Remaining meal plans: ${remainingMealPlans.length}`);

    if (remainingOrders.length === 0 && remainingSubscriptions.length === 0 && remainingMealPlans.length === 0) {
      console.log('🎉 All subscription data successfully deleted!');
    } else {
      console.log('⚠️ Some data may not have been deleted completely');
    }

    // Summary
    console.log('\n📊 Deletion Summary:');
    console.log('=' .repeat(50));
    console.log(`👤 User: ${user.firstName} ${user.lastName}`);
    console.log(`📧 Email: ${user.email}`);
    console.log(`🗑️ Orders deleted: ${orders.length}`);
    console.log(`🗑️ Subscriptions deleted: ${subscriptions.length}`);
    console.log(`🗑️ Meal plans deleted: ${mealPlans.length}`);
    
    console.log('\n🎯 User is now ready for live testing:');
    console.log('✅ No existing subscription data');
    console.log('✅ Clean slate for new meal plans');
    console.log('✅ Can test the fixed date calculations');
    console.log('✅ User account remains active');
    
    console.log('\n🔄 Next Steps:');
    console.log('1. User can create new meal plans');
    console.log('2. Test date calculations work correctly');
    console.log('3. Verify UI shows correct dates');
    console.log('4. Check orders are created on selected dates');
    
  } catch (error) {
    console.error('❌ Error deleting user data:', error);
  } finally {
    mongoose.connection.close();
  }
}

deleteUserData();
