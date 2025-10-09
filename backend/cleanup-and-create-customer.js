// Script to cleanup existing test customer and create a new one following business rules
const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('./src/models/User');
const Subscription = require('./src/models/Subscription');
const SubscriptionMealPlan = require('./src/models/SubscriptionMealPlan');
const Order = require('./src/models/Order');
const MenuItem = require('./src/models/MenuItem');

// Connect to MongoDB
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

async function cleanupAndCreateCustomer() {
  await connectDB();
  
  try {
    const restaurantId = '68e73d168c18e7fd776a6327';
    
    console.log('🧹 Step 1: Cleaning up existing test customer...');
    
    // Find and delete existing test customer
    const existingCustomer = await User.findOne({ 
      email: { $in: ['sarah.wilson@gmail.com', 'sarah.johnson2@example.com', 'sarah.wilson.new@grubgate.test'] }
    });
    
    if (existingCustomer) {
      console.log(`🗑️ Found existing customer: ${existingCustomer.firstName} ${existingCustomer.lastName}`);
      
      // Delete related orders
      const deletedOrders = await Order.deleteMany({ customerId: existingCustomer._id });
      console.log(`🗑️ Deleted ${deletedOrders.deletedCount} orders`);
      
      // Delete related meal plans
      const deletedMealPlans = await SubscriptionMealPlan.deleteMany({ customerId: existingCustomer._id });
      console.log(`🗑️ Deleted ${deletedMealPlans.deletedCount} meal plans`);
      
      // Delete related subscriptions
      const deletedSubscriptions = await Subscription.deleteMany({ customerId: existingCustomer._id });
      console.log(`🗑️ Deleted ${deletedSubscriptions.deletedCount} subscriptions`);
      
      // Delete the customer
      await User.deleteOne({ _id: existingCustomer._id });
      console.log(`🗑️ Deleted customer: ${existingCustomer.email}`);
    } else {
      console.log('ℹ️ No existing test customer found');
    }
    
    console.log('\n👤 Step 2: Creating new customer following business rules...');
    
    // Create new customer
    const newCustomer = new User({
      firstName: 'Emma',
      lastName: 'Thompson',
      email: 'emma.thompson@example.com',
      passwordHash: '$2a$10$hashedPasswordExample',
      phoneNumber: '+14165551234',
      roles: ['customer'],
      status: 'active',
      address: {
        street: '789 Maple Street',
        city: 'Toronto',
        province: 'ON',
        postalCode: 'M4B 1A1',
        country: 'Canada'
      },
      preferences: {
        dietaryRestrictions: [],
        spiceLevel: 'mild',
        notifications: {
          email: true,
          sms: true,
          push: true
        }
      }
    });

    const savedCustomer = await newCustomer.save();
    console.log(`✅ Created customer: ${savedCustomer.firstName} ${savedCustomer.lastName}`);
    console.log(`   Email: ${savedCustomer.email}`);

    // Calculate next Sunday (following business rules)
    const today = new Date();
    const daysUntilSunday = (7 - today.getDay()) % 7;
    const nextSunday = new Date(today);
    nextSunday.setDate(today.getDate() + (daysUntilSunday === 0 ? 7 : daysUntilSunday));
    nextSunday.setHours(0, 0, 0, 0);
    
    console.log(`📅 Today is: ${today.toDateString()}`);
    console.log(`📅 Next Sunday (plan start): ${nextSunday.toDateString()}`);

    // Create subscription
    const subscription = new Subscription({
      customerId: savedCustomer._id,
      planId: 'monthly',
      planName: 'Monthly Meal Plan',
      duration: '30 days',
      deliveryFrequency: 'Weekly',
      monthlyPrice: 150.00,
      status: 'active',
      startDate: nextSunday,
      nextBillingDate: new Date(nextSunday.getTime() + 30 * 24 * 60 * 60 * 1000),
      paymentMethod: 'card',
      features: [
        'Weekly meal delivery',
        'Customizable menu',
        'Free delivery',
        'Cancel anytime'
      ],
      billingHistory: [{
        date: new Date(),
        amount: 150.00,
        status: 'paid',
        description: 'Monthly subscription payment'
      }]
    });

    const savedSubscription = await subscription.save();
    console.log(`✅ Created subscription starting: ${nextSunday.toDateString()}`);

    // Create meal plan (4 weeks starting from next Sunday)
    const planEndDate = new Date(nextSunday);
    planEndDate.setDate(nextSunday.getDate() + 28);

    const weeks = [];
    const weekStartDates = [];
    
    for (let i = 0; i < 4; i++) {
      const weekStart = new Date(nextSunday);
      weekStart.setDate(nextSunday.getDate() + (i * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      weekStartDates.push(weekStart);
      weeks.push({
        weekNumber: i,
        weekStartDate: weekStart,
        weekEndDate: weekEnd,
        meals: {
          monday: { lunch: [], dinner: [] },
          tuesday: { lunch: [], dinner: [] },
          wednesday: { lunch: [], dinner: [] },
          thursday: { lunch: [], dinner: [] },
          friday: { lunch: [], dinner: [] },
          saturday: { lunch: [], dinner: [] },
          sunday: { lunch: [], dinner: [] }
        }
      });
    }

    const mealPlan = new SubscriptionMealPlan({
      customerId: savedCustomer._id,
      restaurantId: new mongoose.Types.ObjectId(restaurantId),
      subscriptionId: savedSubscription._id,
      planType: 'monthly',
      planStartDate: nextSunday,
      planEndDate: planEndDate,
      weekStartDates: weekStartDates,
      weeks: weeks,
      billingCycle: 'monthly',
      nextBillingDate: new Date(nextSunday.getTime() + 30 * 24 * 60 * 60 * 1000),
      deliveryAddress: {
        street: '789 Maple Street',
        city: 'Toronto',
        province: 'ON',
        postalCode: 'M4B 1A1',
        instructions: 'Ring doorbell'
      },
      customerPhone: '+14165551234',
      specialInstructions: 'No spicy food please',
      status: 'active'
    });

    const savedMealPlan = await mealPlan.save();
    console.log(`✅ Created meal plan: ${nextSunday.toDateString()} to ${planEndDate.toDateString()}`);

    // Get menu items
    const menuItems = await MenuItem.find({ 
      restaurantId: new mongoose.Types.ObjectId(restaurantId),
      status: 'available'
    }).limit(3);

    if (menuItems.length === 0) {
      console.log('⚠️ No menu items found');
      return;
    }

    console.log(`✅ Found ${menuItems.length} menu items:`);
    menuItems.forEach(item => {
      console.log(`   - ${item.name}: $${item.price}`);
    });

    // Create orders starting from Monday after next Sunday
    console.log('\n📦 Step 3: Creating orders following business rules...');
    
    const orders = [];
    const orderDates = [
      new Date(nextSunday.getTime() + 1 * 24 * 60 * 60 * 1000), // Monday
      new Date(nextSunday.getTime() + 8 * 24 * 60 * 60 * 1000), // Next Monday  
      new Date(nextSunday.getTime() + 15 * 24 * 60 * 60 * 1000), // Third Monday
      new Date(nextSunday.getTime() + 22 * 24 * 60 * 60 * 1000), // Fourth Monday
    ];

    for (let i = 0; i < 4; i++) {
      const selectedItem = menuItems[i % menuItems.length];
      const orderDate = orderDates[i];
      
      const orderCount = await Order.countDocuments();
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const orderNumber = `GG${dateStr}${String(orderCount + i + 1).padStart(4, '0')}`;
      
      const order = new Order({
        orderNumber: orderNumber,
        customerId: savedCustomer._id,
        restaurantId: new mongoose.Types.ObjectId(restaurantId),
        type: 'weekly-plan',
        isSubscriptionOrder: true,
        items: [{
          menuItemId: selectedItem._id,
          name: selectedItem.name,
          price: selectedItem.price,
          quantity: 1,
          specialInstructions: 'No spicy preparation'
        }],
        status: 'scheduled',
        paymentStatus: 'paid',
        scheduledDate: orderDate,
        activationDate: orderDate,
        isScheduledOrder: true,
        paymentMethod: 'card',
        deliveryAddress: {
          street: '789 Maple Street',
          city: 'Toronto',
          province: 'ON',
          postalCode: 'M4B 1A1',
          instructions: 'Ring doorbell'
        },
        deliveryTime: {
          requested: orderDate,
          estimated: new Date(orderDate.getTime() + 45 * 60 * 1000)
        },
        mealType: 'lunch',
        specialInstructions: 'No spicy food please',
        notes: `Generated for customer ${savedCustomer.firstName} - Week ${i + 1}`,
        weeklyPlanId: savedMealPlan._id
      });

      order.calculateTotals(3.99, 0.13);
      const savedOrder = await order.save();
      orders.push(savedOrder);
      
      console.log(`✅ Order ${i + 1}: ${savedOrder.orderNumber}`);
      console.log(`   Date: ${orderDate.toDateString()}`);
      console.log(`   Item: ${selectedItem.name}`);
      console.log(`   Total: $${savedOrder.total}`);
    }

    // Summary
    console.log('\n📊 Summary:');
    console.log('=' .repeat(60));
    console.log(`👤 Customer: ${savedCustomer.firstName} ${savedCustomer.lastName}`);
    console.log(`📧 Email: ${savedCustomer.email}`);
    console.log(`🔄 Subscription: $${savedSubscription.monthlyPrice}/month`);
    console.log(`📅 Plan Period: ${nextSunday.toDateString()} to ${planEndDate.toDateString()}`);
    console.log(`📦 Orders: ${orders.length} orders created`);
    console.log(`💰 Total Order Value: $${orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}`);
    
    console.log('\n✅ Business Rules Followed:');
    console.log(`   ✅ Meal plan starts from next Sunday: ${nextSunday.toDateString()}`);
    console.log(`   ✅ Orders scheduled for Mondays (delivery days)`);
    console.log(`   ✅ 4-week monthly subscription plan`);
    console.log(`   ✅ All orders marked as subscription orders`);
    
    console.log('\n🎉 Customer created successfully following business rules!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

cleanupAndCreateCustomer();
