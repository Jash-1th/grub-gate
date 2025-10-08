// FILE: scripts/generate-future-orders.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const Order = require('../src/models/Order');
const SubscriptionMealPlan = require('../src/models/SubscriptionMealPlan');
const User = require('../src/models/User');
const Restaurant = require('../src/models/Restaurant');

/**
 * Generate orders for future dates from subscription meal plans
 */
async function generateFutureOrders() {
  try {
    console.log('🚀 Generating Future Orders from Subscription Plans...');
    console.log('=' .repeat(60));
    
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
    
    // Define dates to generate orders for (based on subscription mapping)
    const today = new Date();
    const datesToGenerate = [
      new Date(2025, 9, 9), // Oct 9, 2025 = "Tuesday" in subscription
      new Date(2025, 9, 10) // Oct 10, 2025 = "Wednesday" in subscription
    ];
    
    // Debug: Check subscription day mapping
    console.log('📅 Subscription day mapping:');
    datesToGenerate.forEach(date => {
      console.log(`   ${date.toDateString()} = Calendar date`);
    });
    
    console.log(`📅 Generating orders for dates: ${datesToGenerate.map(d => d.toDateString()).join(', ')}`);
    
    // Get active subscription plans
    const activeSubscriptionPlans = await SubscriptionMealPlan.find({
      status: 'active'
    }).populate('customerId', 'firstName lastName email phone')
      .populate('restaurantId', 'name _id');
    
    console.log(`📋 Found ${activeSubscriptionPlans.length} active subscription plans`);
    
    let totalOrdersCreated = 0;
    
    for (const targetDate of datesToGenerate) {
      console.log(`\n🗓️ Generating orders for ${targetDate.toDateString()}...`);
      
      const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][targetDate.getDay()];
      console.log(`   Day: ${dayName}`);
      
      let ordersForDate = 0;
      
      for (const subscriptionPlan of activeSubscriptionPlans) {
        try {
          // Check if this date falls within the subscription period
          if (targetDate < subscriptionPlan.planStartDate || targetDate > subscriptionPlan.planEndDate) {
            console.log(`   ⏭️ Date outside subscription period for ${subscriptionPlan.customerId.firstName}`);
            continue;
          }
          
          // Find the week that contains this date
          let targetWeek = null;
          if (subscriptionPlan.weeks) {
            for (const week of subscriptionPlan.weeks) {
              const weekStart = new Date(week.weekStartDate);
              const weekEnd = new Date(week.weekEndDate);
              
              if (targetDate >= weekStart && targetDate <= weekEnd) {
                targetWeek = week;
                break;
              }
            }
          }
          
          if (!targetWeek) {
            console.log(`   ⏭️ No week found for ${targetDate.toDateString()}`);
            continue;
          }
          
          // Get meals for this day
          const dayMeals = targetWeek.meals[dayName];
          if (!dayMeals) {
            console.log(`   ⏭️ No meals planned for ${dayName}`);
            continue;
          }
          
          // Generate orders for lunch and dinner
          const mealTypes = ['lunch', 'dinner'];
          
          for (const mealType of mealTypes) {
            const meals = dayMeals[mealType];
            
            if (!meals || meals.length === 0) {
              console.log(`   ⏭️ No ${mealType} meals for ${dayName}`);
              continue;
            }
            
            // Check if order already exists
            const existingOrder = await Order.findOne({
              customerId: subscriptionPlan.customerId._id,
              restaurantId: subscriptionPlan.restaurantId._id,
              mealType: mealType,
              createdAt: {
                $gte: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()),
                $lt: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1)
              }
            });
            
            if (existingOrder) {
              console.log(`   ⏭️ Order already exists for ${mealType} on ${dayName}`);
              continue;
            }
            
            // Generate order number
            const orderNumber = `GG${targetDate.getFullYear()}${String(targetDate.getMonth() + 1).padStart(2, '0')}${String(targetDate.getDate()).padStart(2, '0')}${String(Date.now()).slice(-6)}`;
            
            // Calculate totals
            let subtotal = 0;
            const orderItems = meals.map(meal => {
              subtotal += meal.price || 0;
              return {
                menuItemId: meal.menuItemId || meal.id,
                name: meal.name,
                price: meal.price || 0,
                quantity: 1,
                specialInstructions: meal.specialInstructions || ''
              };
            });
            
            const deliveryFee = 3.99;
            const taxRate = 0.13; // 13% tax
            const tax = Math.round((subtotal + deliveryFee) * taxRate * 100) / 100;
            const total = Math.round((subtotal + deliveryFee + tax) * 100) / 100;
            
            // Create the order with the target date
            const newOrder = await Order.create({
              orderNumber: orderNumber,
              customerId: subscriptionPlan.customerId._id,
              restaurantId: subscriptionPlan.restaurantId._id,
              type: 'weekly-plan',
              mealType: mealType,
              isSubscriptionOrder: true,
              weeklyPlanId: subscriptionPlan._id,
              items: orderItems,
              subtotal: subtotal,
              deliveryFee: deliveryFee,
              tax: tax,
              total: total,
              status: 'pending',
              paymentStatus: 'paid',
              deliveryAddress: subscriptionPlan.deliveryAddress,
              deliveryTime: {
                estimated: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), mealType === 'lunch' ? 12 : 19, 30)
              },
              specialInstructions: subscriptionPlan.specialInstructions || '',
              createdAt: targetDate // Set the creation date to the target date
            });
            
            console.log(`   ✅ Created ${mealType} order: ${orderNumber} (₹${total})`);
            ordersForDate++;
            totalOrdersCreated++;
          }
          
        } catch (error) {
          console.error(`   ❌ Error creating order for ${subscriptionPlan.customerId.firstName}:`, error.message);
        }
      }
      
      console.log(`   📊 Created ${ordersForDate} orders for ${targetDate.toDateString()}`);
    }
    
    console.log(`\n🎉 Future Order Generation Complete!`);
    console.log(`📊 Total orders created: ${totalOrdersCreated}`);
    
    // Verify created orders
    console.log('\n🔍 Verifying created orders...');
    
    for (const targetDate of datesToGenerate) {
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      const ordersForDate = await Order.find({
        createdAt: {
          $gte: startOfDay,
          $lte: endOfDay
        }
      }).populate('customerId', 'firstName lastName')
        .populate('restaurantId', 'name');
      
      console.log(`\n📅 ${targetDate.toDateString()}: ${ordersForDate.length} orders`);
      
      ordersForDate.forEach((order, index) => {
        console.log(`   ${index + 1}. ${order.orderNumber} - ${order.customerId.firstName} ${order.customerId.lastName}`);
        console.log(`      Restaurant: ${order.restaurantId.name} | Meal: ${order.mealType} | Total: ₹${order.total}`);
      });
    }
    
    console.log('\n🚀 Partner Portal Testing:');
    console.log('   • URL: http://localhost:3001/dashboard/orders');
    console.log('   • Login: 2022cse.r234@svce.edu.in');
    console.log('   • Use date picker to select Oct 9 or Oct 10');
    console.log('   • You should now see the generated orders!');
    
  } catch (error) {
    console.error('💥 Future order generation failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Handle script termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Future order generation interrupted');
  await mongoose.connection.close();
  process.exit(0);
});

// Run the generation
generateFutureOrders();
