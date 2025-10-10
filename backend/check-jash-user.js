// Script to check the new user jash64326@gmail.com and their orders/subscription
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

async function checkJashUser() {
  await connectDB();
  
  try {
    const restaurantId = '68e73d168c18e7fd776a6327';
    
    console.log('🔍 Checking user jash64326@gmail.com...');
    console.log('=' .repeat(60));

    // Find the user
    const jashUser = await User.findOne({ 
      email: 'jash64326@gmail.com' 
    });

    if (!jashUser) {
      console.log('❌ User jash64326@gmail.com not found');
      return;
    }

    console.log(`👤 Found user: ${jashUser.firstName} ${jashUser.lastName}`);
    console.log(`📧 Email: ${jashUser.email}`);
    console.log(`📞 Phone: ${jashUser.phoneNumber || 'N/A'}`);
    console.log(`📅 User Created: ${jashUser.createdAt ? jashUser.createdAt.toDateString() : 'N/A'}`);
    console.log(`🏠 Address: ${jashUser.address ? `${jashUser.address.street}, ${jashUser.address.city}` : 'N/A'}`);

    // Check subscriptions
    console.log('\n🔄 Subscription Details:');
    console.log('=' .repeat(40));
    
    const subscriptions = await Subscription.find({ 
      customerId: jashUser._id 
    }).sort({ createdAt: -1 });

    if (subscriptions.length === 0) {
      console.log('❌ No subscriptions found');
    } else {
      subscriptions.forEach((sub, index) => {
        console.log(`\n📋 Subscription ${index + 1}:`);
        console.log(`   Plan: ${sub.planName}`);
        console.log(`   Price: $${sub.monthlyPrice}/month`);
        console.log(`   Status: ${sub.status}`);
        console.log(`   Start Date: ${sub.startDate ? sub.startDate.toDateString() : 'N/A'}`);
        console.log(`   Next Billing: ${sub.nextBillingDate ? sub.nextBillingDate.toDateString() : 'N/A'}`);
        console.log(`   Created: ${sub.createdAt ? sub.createdAt.toDateString() : 'N/A'}`);
        console.log(`   Frequency: ${sub.deliveryFrequency || 'N/A'}`);
      });
    }

    // Check meal plans
    console.log('\n📋 Meal Plan Details:');
    console.log('=' .repeat(40));
    
    const mealPlans = await SubscriptionMealPlan.find({ 
      customerId: jashUser._id,
      restaurantId: new mongoose.Types.ObjectId(restaurantId)
    }).sort({ createdAt: -1 });

    if (mealPlans.length === 0) {
      console.log('❌ No meal plans found');
    } else {
      mealPlans.forEach((plan, index) => {
        console.log(`\n🍽️ Meal Plan ${index + 1}:`);
        console.log(`   Plan Type: ${plan.planType}`);
        console.log(`   Status: ${plan.status}`);
        console.log(`   Plan Start: ${plan.planStartDate ? plan.planStartDate.toDateString() : 'N/A'}`);
        console.log(`   Plan End: ${plan.planEndDate ? plan.planEndDate.toDateString() : 'N/A'}`);
        console.log(`   Created: ${plan.createdAt ? plan.createdAt.toDateString() : 'N/A'}`);
        console.log(`   Billing Cycle: ${plan.billingCycle || 'N/A'}`);
        console.log(`   Next Billing: ${plan.nextBillingDate ? plan.nextBillingDate.toDateString() : 'N/A'}`);
        
        if (plan.weekStartDates && plan.weekStartDates.length > 0) {
          console.log(`   Week Start Dates:`);
          plan.weekStartDates.forEach((date, weekIndex) => {
            console.log(`     Week ${weekIndex + 1}: ${date.toDateString()}`);
          });
        }
      });
    }

    // Check orders
    console.log('\n📦 Order Details:');
    console.log('=' .repeat(40));
    
    const orders = await Order.find({ 
      customerId: jashUser._id,
      restaurantId: new mongoose.Types.ObjectId(restaurantId)
    }).sort({ scheduledDate: 1 });

    if (orders.length === 0) {
      console.log('❌ No orders found');
    } else {
      console.log(`📦 Total Orders: ${orders.length}`);
      console.log(`💰 Total Spent: $${orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}`);
      
      orders.forEach((order, index) => {
        console.log(`\n📋 Order ${index + 1}:`);
        console.log(`   Order Number: ${order.orderNumber}`);
        console.log(`   Scheduled Date: ${order.scheduledDate ? order.scheduledDate.toDateString() : 'N/A'}`);
        console.log(`   Created Date: ${order.createdAt ? order.createdAt.toDateString() : 'N/A'}`);
        console.log(`   Status: ${order.status}`);
        console.log(`   Payment Status: ${order.paymentStatus}`);
        console.log(`   Total: $${order.total}`);
        console.log(`   Type: ${order.type || 'N/A'}`);
        console.log(`   Is Subscription: ${order.isSubscriptionOrder ? 'Yes' : 'No'}`);
        console.log(`   Meal Type: ${order.mealType || 'N/A'}`);
        
        if (order.items && order.items.length > 0) {
          console.log(`   Items:`);
          order.items.forEach((item, itemIndex) => {
            console.log(`     ${itemIndex + 1}. ${item.name} - $${item.price} (Qty: ${item.quantity})`);
          });
        }
        
        if (order.specialInstructions) {
          console.log(`   Special Instructions: ${order.specialInstructions}`);
        }
      });
    }

    // Summary
    console.log('\n📊 Summary for jash64326@gmail.com:');
    console.log('=' .repeat(60));
    console.log(`👤 Customer: ${jashUser.firstName} ${jashUser.lastName}`);
    console.log(`📧 Email: ${jashUser.email}`);
    console.log(`🔄 Subscriptions: ${subscriptions.length}`);
    console.log(`📋 Meal Plans: ${mealPlans.length}`);
    console.log(`📦 Orders: ${orders.length}`);
    
    if (orders.length > 0) {
      const firstOrder = orders[0];
      const lastOrder = orders[orders.length - 1];
      console.log(`📅 Order Date Range: ${firstOrder.scheduledDate?.toDateString() || firstOrder.createdAt?.toDateString()} to ${lastOrder.scheduledDate?.toDateString() || lastOrder.createdAt?.toDateString()}`);
      console.log(`💰 Total Spent: $${orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}`);
    }
    
    if (subscriptions.length > 0) {
      const activeSub = subscriptions.find(s => s.status === 'active') || subscriptions[0];
      console.log(`🔄 Active Subscription: $${activeSub.monthlyPrice}/month`);
      console.log(`📅 Subscription Start: ${activeSub.startDate?.toDateString() || 'N/A'}`);
    }
    
    if (mealPlans.length > 0) {
      const activePlan = mealPlans.find(p => p.status === 'active') || mealPlans[0];
      console.log(`📋 Meal Plan Period: ${activePlan.planStartDate?.toDateString()} to ${activePlan.planEndDate?.toDateString()}`);
    }
    
    console.log('\n✅ User check complete!');
    
  } catch (error) {
    console.error('❌ Error checking user:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkJashUser();
