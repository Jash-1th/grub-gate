// Script to create a second customer with meal plan subscription
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

async function createSecondCustomer() {
  await connectDB();
  
  try {
    const restaurantId = '68e73d168c18e7fd776a6327';
    
    console.log('🔍 Creating second customer and subscription...');
    console.log('=' .repeat(60));

    // Step 1: Create new customer user
    console.log('\n👤 Step 1: Creating new customer user...');
    
    const newCustomer = new User({
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.wilson@gmail.com',
      passwordHash: '$2a$10$hashedPasswordExample', // Pre-hashed password
      phoneNumber: '+16471234567', // E.164 format
      roles: ['customer'],
      status: 'active',
      address: {
        street: '456 Oak Avenue',
        city: 'Toronto',
        province: 'ON',
        postalCode: 'M5V 2A8',
        country: 'Canada'
      },
      preferences: {
        dietaryRestrictions: ['vegetarian'],
        spiceLevel: 'medium',
        notifications: {
          email: true,
          sms: false,
          push: true
        }
      }
    });

    const savedCustomer = await newCustomer.save();
    console.log(`✅ Created customer: ${savedCustomer.firstName} ${savedCustomer.lastName}`);
    console.log(`   Customer ID: ${savedCustomer._id}`);
    console.log(`   Email: ${savedCustomer.email}`);

    // Step 2: Create subscription
    console.log('\n🔄 Step 2: Creating monthly subscription...');
    
    const subscription = new Subscription({
      customerId: savedCustomer._id,
      planId: 'monthly',
      planName: 'Monthly Meal Plan',
      duration: '30 days',
      deliveryFrequency: 'Weekly',
      monthlyPrice: 120.00, // $120/month
      status: 'active',
      startDate: new Date(),
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      paymentMethod: 'card',
      features: [
        'Weekly meal delivery',
        'Customizable menu',
        'Free delivery',
        'Cancel anytime'
      ],
      billingHistory: [{
        date: new Date(),
        amount: 120.00,
        status: 'paid',
        description: 'Monthly subscription payment'
      }]
    });

    const savedSubscription = await subscription.save();
    console.log(`✅ Created subscription: ${savedSubscription.planName}`);
    console.log(`   Subscription ID: ${savedSubscription._id}`);
    console.log(`   Monthly Price: $${savedSubscription.monthlyPrice}`);

    // Step 3: Create subscription meal plan
    console.log('\n📋 Step 3: Creating subscription meal plan...');
    
    // Calculate plan dates (monthly = 4 weeks) - start from next Sunday
    const today = new Date();
    const daysUntilSunday = (7 - today.getDay()) % 7;
    const planStartDate = new Date(today);
    planStartDate.setDate(today.getDate() + (daysUntilSunday === 0 ? 7 : daysUntilSunday));
    planStartDate.setHours(0, 0, 0, 0);
    
    const planEndDate = new Date(planStartDate);
    planEndDate.setDate(planStartDate.getDate() + 28); // 4 weeks = 28 days

    // Generate 4 weeks of meal plan
    const weeks = [];
    const weekStartDates = [];
    
    for (let i = 0; i < 4; i++) {
      const weekStart = new Date(planStartDate);
      weekStart.setDate(planStartDate.getDate() + (i * 7));
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
      planStartDate: planStartDate,
      planEndDate: planEndDate,
      weekStartDates: weekStartDates,
      weeks: weeks,
      billingCycle: 'monthly',
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      deliveryAddress: {
        street: '456 Oak Avenue',
        city: 'Toronto',
        province: 'ON',
        postalCode: 'M5V 2A8',
        instructions: 'Leave at front door'
      },
      customerPhone: '+16471234567',
      specialInstructions: 'Vegetarian meals only please',
      status: 'active'
    });

    const savedMealPlan = await mealPlan.save();
    console.log(`✅ Created meal plan: ${savedMealPlan.planType}`);
    console.log(`   Plan ID: ${savedMealPlan._id}`);
    console.log(`   Duration: ${planStartDate.toDateString()} to ${planEndDate.toDateString()}`);

    // Step 4: Get menu items from the restaurant to create orders
    console.log('\n🍽️ Step 4: Getting restaurant menu items...');
    
    const menuItems = await MenuItem.find({ 
      restaurantId: new mongoose.Types.ObjectId(restaurantId),
      status: 'available'
    }).limit(3);

    if (menuItems.length === 0) {
      console.log('⚠️ No menu items found for this restaurant');
      return;
    }

    console.log(`✅ Found ${menuItems.length} menu items:`);
    menuItems.forEach(item => {
      console.log(`   - ${item.name}: $${item.price}`);
    });

    // Step 5: Create sample orders for the new customer
    console.log('\n📦 Step 5: Creating sample orders...');
    
    // Use the same Sunday calculation from meal plan creation
    console.log(`📅 Following business rules: Orders start from plan start date: ${planStartDate.toDateString()}`);
    
    const orders = [];
    const orderDates = [
      new Date(planStartDate.getTime() + 1 * 24 * 60 * 60 * 1000), // Monday after plan start Sunday
      new Date(planStartDate.getTime() + 8 * 24 * 60 * 60 * 1000), // Following Monday
      new Date(planStartDate.getTime() + 15 * 24 * 60 * 60 * 1000), // Third Monday
    ];

    for (let i = 0; i < 3; i++) {
      const selectedItem = menuItems[i % menuItems.length];
      const orderDate = orderDates[i];
      
      // Generate order number manually
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
          specialInstructions: 'Vegetarian preparation'
        }],
        status: 'scheduled',
        paymentStatus: 'paid',
        scheduledDate: orderDate,
        activationDate: orderDate,
        isScheduledOrder: true,
        paymentMethod: 'card',
        deliveryAddress: {
          street: '456 Oak Avenue',
          city: 'Toronto',
          province: 'ON',
          postalCode: 'M5V 2A8',
          instructions: 'Leave at front door'
        },
        deliveryTime: {
          requested: orderDate,
          estimated: new Date(orderDate.getTime() + 45 * 60 * 1000) // 45 minutes
        },
        mealType: 'lunch',
        specialInstructions: 'Vegetarian meals only',
        notes: `Generated for new customer ${savedCustomer.firstName}`,
        weeklyPlanId: savedMealPlan._id
      });

      // Calculate totals using the model method
      order.calculateTotals(3.99, 0.13); // delivery fee $3.99, tax rate 13%
      
      const savedOrder = await order.save();
      orders.push(savedOrder);
      
      console.log(`✅ Created order ${i + 1}: ${savedOrder.orderNumber}`);
      console.log(`   Item: ${selectedItem.name}`);
      console.log(`   Total: $${savedOrder.total}`);
      console.log(`   Scheduled: ${orderDate.toDateString()}`);
    }

    // Step 6: Summary
    console.log('\n📊 Summary:');
    console.log('=' .repeat(60));
    console.log(`👤 New Customer: ${savedCustomer.firstName} ${savedCustomer.lastName}`);
    console.log(`📧 Email: ${savedCustomer.email}`);
    console.log(`🔄 Subscription: Monthly ($${savedSubscription.monthlyPrice}/month)`);
    console.log(`📋 Meal Plan: ${savedMealPlan.planType} (${weeks.length} weeks)`);
    console.log(`📦 Orders Created: ${orders.length}`);
    console.log(`💰 Total Order Value: $${orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}`);
    
    console.log('\n🎉 Second customer setup complete!');
    console.log('\n📈 Expected Analytics Changes:');
    console.log('   - Active Customers: 1 → 2');
    console.log('   - Total Revenue: Increased');
    console.log('   - Top Customers: Will show 2 customers');
    console.log('   - Customer Segments: 2 active, 2 new, 2 loyal');
    console.log('   - Subscription Conversion: Still 100%');
    
  } catch (error) {
    console.error('❌ Error creating second customer:', error);
  } finally {
    mongoose.connection.close();
  }
}

createSecondCustomer();
