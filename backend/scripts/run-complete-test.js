// FILE: scripts/run-complete-test.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../src/models/User');
const Restaurant = require('../src/models/Restaurant');
const MenuItem = require('../src/models/MenuItem');
const MealPlan = require('../src/models/MealPlan');
const SubscriptionMealPlan = require('../src/models/SubscriptionMealPlan');
const Order = require('../src/models/Order');
const { generateDailyOrders } = require('../src/services/orderGenerationService');

/**
 * Complete test flow: Setup data → Generate orders → Verify results
 */
async function runCompleteTest() {
  try {
    console.log('🚀 Starting Complete Live Test Flow...');
    console.log('=' .repeat(70));
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    
    if (!mongoUri) {
      throw new Error('MongoDB URI not found. Please set MONGODB_URI or MONGO_URI in your .env file');
    }
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
    
    // Customer and Restaurant IDs
    const customerId = '68e60bc544b875ac6aaf9526';
    const restaurantId = '68e60c9d44b875ac6aaf953d';
    
    // ========================================
    // PHASE 1: SETUP TEST DATA
    // ========================================
    console.log('\n📋 PHASE 1: Setting up test data...');
    console.log('-' .repeat(50));
    
    // Verify entities exist
    const customer = await User.findById(customerId);
    const restaurant = await Restaurant.findById(restaurantId);
    
    if (!customer || !restaurant) {
      throw new Error('Customer or Restaurant not found in database');
    }
    
    console.log(`✅ Customer: ${customer.firstName} ${customer.lastName} (${customer.email})`);
    console.log(`✅ Restaurant: ${restaurant.name} (Owner: ${customer.firstName})`);
    
    // Clear existing data for clean test
    console.log('\n🗑️ Cleaning existing data...');
    await MenuItem.deleteMany({ restaurantId: restaurantId });
    await SubscriptionMealPlan.deleteMany({ customerId: customerId });
    await MealPlan.deleteMany({ userId: customerId });
    await Order.deleteMany({ 
      $or: [
        { customerId: customerId },
        { restaurantId: restaurantId }
      ]
    });
    console.log('✅ Cleaned existing menu items, meal plans, and orders');
    
    // Add menu items
    console.log('\n🍽️ Adding menu items...');
    const menuItems = [
      {
        restaurantId: restaurantId,
        name: 'Chicken Biryani Special',
        description: 'Aromatic basmati rice with tender chicken and spices',
        category: 'main',
        cuisine: 'indian',
        price: 299,
        prepTime: 25,
        dietaryPreferences: ['gluten-free'],
        ingredients: ['Basmati Rice', 'Chicken', 'Onions', 'Spices'],
        allergens: ['dairy'],
        nutritionInfo: { 
          calories: 450, 
          protein: '25g', 
          carbs: '55g', 
          fat: '12g' 
        },
        spiceLevel: 3, // medium (0-5 scale)
        availability: {
          monday: { lunch: true, dinner: true },
          tuesday: { lunch: true, dinner: true },
          wednesday: { lunch: true, dinner: true },
          thursday: { lunch: true, dinner: true },
          friday: { lunch: true, dinner: true },
          saturday: { lunch: true, dinner: true },
          sunday: { lunch: true, dinner: true }
        },
        status: 'available'
      },
      {
        restaurantId: restaurantId,
        name: 'Paneer Butter Masala',
        description: 'Creamy tomato curry with soft paneer cubes',
        category: 'main',
        cuisine: 'indian',
        price: 249,
        prepTime: 20,
        dietaryPreferences: ['vegetarian'],
        ingredients: ['Paneer', 'Tomatoes', 'Cream', 'Spices'],
        allergens: ['dairy'],
        nutritionInfo: { 
          calories: 320, 
          protein: '15g', 
          carbs: '12g', 
          fat: '22g' 
        },
        spiceLevel: 2, // mild (0-5 scale)
        availability: {
          monday: { lunch: true, dinner: true },
          tuesday: { lunch: true, dinner: true },
          wednesday: { lunch: true, dinner: true },
          thursday: { lunch: true, dinner: true },
          friday: { lunch: true, dinner: true },
          saturday: { lunch: true, dinner: true },
          sunday: { lunch: true, dinner: true }
        },
        status: 'available'
      },
      {
        restaurantId: restaurantId,
        name: 'Dal Tadka Premium',
        description: 'Yellow lentils with cumin and garlic tempering',
        category: 'main',
        cuisine: 'indian',
        price: 179,
        prepTime: 15,
        dietaryPreferences: ['vegetarian', 'vegan', 'gluten-free'],
        ingredients: ['Yellow Lentils', 'Onions', 'Cumin', 'Garlic'],
        allergens: [],
        nutritionInfo: { 
          calories: 180, 
          protein: '12g', 
          carbs: '28g', 
          fat: '4g' 
        },
        spiceLevel: 3, // medium (0-5 scale)
        availability: {
          monday: { lunch: true, dinner: true },
          tuesday: { lunch: true, dinner: true },
          wednesday: { lunch: true, dinner: true },
          thursday: { lunch: true, dinner: true },
          friday: { lunch: true, dinner: true },
          saturday: { lunch: true, dinner: true },
          sunday: { lunch: true, dinner: true }
        },
        status: 'available'
      }
    ];
    
    const createdItems = await MenuItem.insertMany(menuItems);
    console.log(`✅ Added ${createdItems.length} menu items:`);
    createdItems.forEach(item => {
      console.log(`   • ${item.name} - ₹${item.price}`);
    });
    
    // Create subscription meal plan
    console.log('\n📅 Creating subscription meal plan...');
    const today = new Date();
    const planStartDate = new Date(today);
    planStartDate.setHours(0, 0, 0, 0);
    const planEndDate = new Date(planStartDate);
    planEndDate.setDate(planStartDate.getDate() + 30);
    
    // Create current week meals
    const currentWeekStart = new Date(planStartDate);
    const currentWeekEnd = new Date(currentWeekStart);
    currentWeekEnd.setDate(currentWeekStart.getDate() + 6);
    
    const subscriptionPlan = new SubscriptionMealPlan({
      customerId: customerId,
      restaurantId: restaurantId,
      subscriptionId: new mongoose.Types.ObjectId(),
      planType: 'bi-weekly',
      planStartDate: planStartDate,
      planEndDate: planEndDate,
      weeks: [{
        weekNumber: 1,
        weekStartDate: currentWeekStart,
        weekEndDate: currentWeekEnd,
        meals: {
          monday: {
            lunch: [{
              id: createdItems[0]._id.toString(),
              planId: new mongoose.Types.ObjectId().toString(),
              menuItemId: createdItems[0]._id,
              name: createdItems[0].name,
              price: createdItems[0].price,
              restaurantName: restaurant.name,
              deliveryTime: '12:30',
              specialInstructions: 'Medium spice level please'
            }],
            dinner: [{
              id: createdItems[1]._id.toString(),
              planId: new mongoose.Types.ObjectId().toString(),
              menuItemId: createdItems[1]._id,
              name: createdItems[1].name,
              price: createdItems[1].price,
              restaurantName: restaurant.name,
              deliveryTime: '19:30',
              specialInstructions: 'Extra naan bread'
            }]
          },
          tuesday: {
            lunch: [{
              id: createdItems[2]._id.toString(),
              planId: new mongoose.Types.ObjectId().toString(),
              menuItemId: createdItems[2]._id,
              name: createdItems[2].name,
              price: createdItems[2].price,
              restaurantName: restaurant.name,
              deliveryTime: '12:30',
              specialInstructions: 'Less oil'
            }],
            dinner: [{
              id: createdItems[0]._id.toString(),
              planId: new mongoose.Types.ObjectId().toString(),
              menuItemId: createdItems[0]._id,
              name: createdItems[0].name,
              price: createdItems[0].price,
              restaurantName: restaurant.name,
              deliveryTime: '19:30',
              specialInstructions: 'Mild spice'
            }]
          },
          wednesday: {
            lunch: [{
              id: createdItems[1]._id.toString(),
              planId: new mongoose.Types.ObjectId().toString(),
              menuItemId: createdItems[1]._id,
              name: createdItems[1].name,
              price: createdItems[1].price,
              restaurantName: restaurant.name,
              deliveryTime: '12:30',
              specialInstructions: 'Extra gravy'
            }],
            dinner: []
          },
          thursday: {
            lunch: [],
            dinner: []
          },
          friday: {
            lunch: [],
            dinner: []
          },
          saturday: {
            lunch: [],
            dinner: []
          },
          sunday: {
            lunch: [],
            dinner: []
          }
        }
      }],
      deliveryAddress: {
        street: '123 Test Street, Apartment 4B',
        city: 'Chennai',
        province: 'Tamil Nadu',
        postalCode: '600001',
        instructions: 'Ring doorbell twice, leave at door if no answer'
      },
      deliveryPreferences: {
        timeSlot: 'lunch: 12:00-14:00, dinner: 19:00-21:00',
        specialInstructions: 'Call 5 minutes before delivery'
      },
      billingCycle: 'monthly',
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'active',
      generatedOrders: [],
      isOrdersGenerated: false
    });
    
    await subscriptionPlan.save();
    console.log(`✅ Created subscription meal plan: ${subscriptionPlan._id}`);
    console.log(`   • Status: ${subscriptionPlan.status}`);
    console.log(`   • Duration: ${subscriptionPlan.planStartDate.toDateString()} to ${subscriptionPlan.planEndDate.toDateString()}`);
    console.log(`   • Meals scheduled: Monday (L+D), Tuesday (L+D), Wednesday (L)`);
    
    // ========================================
    // PHASE 2: GENERATE ORDERS
    // ========================================
    console.log('\n🔄 PHASE 2: Generating orders from meal plans...');
    console.log('-' .repeat(50));
    
    const generationResult = await generateDailyOrders();
    
    if (generationResult.success) {
      console.log(`✅ Order generation successful!`);
      console.log(`   • Total orders created: ${generationResult.totalOrdersCreated}`);
      console.log(`   • Subscription orders: ${generationResult.subscriptionOrders}`);
      console.log(`   • Regular meal plan orders: ${generationResult.mealPlanOrders}`);
      
      if (generationResult.errors && generationResult.errors.length > 0) {
        console.log(`   ⚠️ Warnings: ${generationResult.errors.length}`);
      }
    } else {
      console.log(`❌ Order generation failed: ${generationResult.error}`);
      throw new Error('Order generation failed');
    }
    
    // ========================================
    // PHASE 3: VERIFY RESULTS
    // ========================================
    console.log('\n🔍 PHASE 3: Verifying generated orders...');
    console.log('-' .repeat(50));
    
    // Get all generated orders
    const generatedOrders = await Order.find({
      restaurantId: restaurantId,
      type: 'weekly-plan'
    }).populate('customerId', 'firstName lastName email phone')
      .populate('restaurantId', 'name')
      .sort({ createdAt: -1 });
    
    console.log(`📦 Found ${generatedOrders.length} generated orders for restaurant "${restaurant.name}"`);
    
    if (generatedOrders.length > 0) {
      console.log('\n📋 Order Details:');
      generatedOrders.forEach((order, index) => {
        console.log(`\n${index + 1}. Order #${order.orderNumber}`);
        console.log(`   └─ Customer: ${order.customerId?.firstName} ${order.customerId?.lastName}`);
        console.log(`   └─ Email: ${order.customerId?.email}`);
        console.log(`   └─ Phone: ${order.customerId?.phone}`);
        console.log(`   └─ Meal Type: ${order.mealType?.toUpperCase()}`);
        console.log(`   └─ Subscription Order: ${order.isSubscriptionOrder ? 'Yes' : 'No'}`);
        console.log(`   └─ Status: ${order.status}`);
        console.log(`   └─ Payment: ${order.paymentStatus}`);
        console.log(`   └─ Total: ₹${order.total}`);
        console.log(`   └─ Items: ${order.items?.length || 0}`);
        
        if (order.items && order.items.length > 0) {
          order.items.forEach(item => {
            console.log(`      • ${item.name} - ₹${item.price} x${item.quantity}`);
            if (item.specialInstructions) {
              console.log(`        Note: ${item.specialInstructions}`);
            }
          });
        }
        
        if (order.deliveryAddress) {
          console.log(`   └─ Delivery: ${order.deliveryAddress.street}, ${order.deliveryAddress.city}`);
        }
        
        console.log(`   └─ Created: ${order.createdAt.toLocaleString()}`);
      });
      
      // Summary for partner dashboard
      console.log('\n📊 Partner Dashboard Summary:');
      console.log('=' .repeat(60));
      console.log(`🏪 Restaurant: ${restaurant.name}`);
      console.log(`📅 Date: ${today.toDateString()}`);
      console.log(`📦 Total Orders: ${generatedOrders.length}`);
      console.log(`🍽️ Lunch Orders: ${generatedOrders.filter(o => o.mealType === 'lunch').length}`);
      console.log(`🌙 Dinner Orders: ${generatedOrders.filter(o => o.mealType === 'dinner').length}`);
      console.log(`💰 Total Revenue: ₹${generatedOrders.reduce((sum, o) => sum + (o.total || 0), 0)}`);
      console.log(`📋 Pending Orders: ${generatedOrders.filter(o => o.status === 'pending').length}`);
      
    } else {
      console.log('⚠️ No orders were generated. Check meal plan data and generation logic.');
    }
    
    // ========================================
    // PHASE 4: PARTNER PORTAL INSTRUCTIONS
    // ========================================
    console.log('\n🎯 PHASE 4: Partner Portal Testing Instructions');
    console.log('=' .repeat(70));
    
    console.log('\n🔐 Login Credentials:');
    console.log(`   Email: ${customer.email}`);
    console.log(`   Password: [Use the existing password]`);
    console.log(`   Role: Partner (Restaurant Owner)`);
    
    console.log('\n🌐 Partner Portal URLs:');
    console.log('   Dashboard: http://localhost:3001/dashboard');
    console.log('   Orders Page: http://localhost:3001/dashboard/orders');
    
    console.log('\n✅ Expected Results in Partner Portal:');
    console.log(`   • Should see ${generatedOrders.length} orders for today`);
    console.log('   • Orders should show customer details (Mamilla Jaswanth)');
    console.log('   • Each order should have meal type (LUNCH/DINNER)');
    console.log('   • Status should be "pending" initially');
    console.log('   • Should be able to update order status');
    console.log('   • Should see order items and special instructions');
    
    console.log('\n🧪 Test Actions:');
    console.log('   1. Login to partner portal');
    console.log('   2. Navigate to Orders page');
    console.log('   3. Verify orders are displayed');
    console.log('   4. Click "View" on an order to see details');
    console.log('   5. Update order status (pending → confirmed → preparing → ready)');
    console.log('   6. Check mobile responsive view');
    
    console.log('\n🔧 API Endpoints for Testing:');
    console.log('   • GET /api/v1/orders - View all orders');
    console.log('   • PATCH /api/v1/orders/:id/status - Update order status');
    console.log('   • GET /api/v1/orders/generate/status - Check generation status');
    console.log('   • POST /api/v1/orders/generate/daily - Manual order generation');
    
    console.log('\n🎉 LIVE TEST SETUP COMPLETE!');
    console.log('=' .repeat(70));
    console.log('The partner portal should now show real orders from subscription meal plans.');
    console.log('All data is set up and orders are generated for immediate testing.');
    
  } catch (error) {
    console.error('💥 Complete test failed:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Handle script termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Test interrupted');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('unhandledRejection', async (err) => {
  console.error('💥 Unhandled Promise Rejection:', err);
  await mongoose.connection.close();
  process.exit(1);
});

// Run the complete test
runCompleteTest();
