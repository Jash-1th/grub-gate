// FILE: scripts/check-restaurant-orders.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const Order = require('../src/models/Order');
const SubscriptionMealPlan = require('../src/models/SubscriptionMealPlan');
const MealPlan = require('../src/models/MealPlan');
const Restaurant = require('../src/models/Restaurant');
const User = require('../src/models/User');

/**
 * Check orders and meal plans for specific restaurant
 */
async function checkRestaurantOrders() {
  try {
    console.log('🔍 Checking Restaurant Orders and Expected Dates...');
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
    
    const restaurantId = '68e60c9d44b875ac6aaf953d';
    
    // Step 1: Get restaurant details
    console.log('\n🏪 Step 1: Restaurant Information...');
    const restaurant = await Restaurant.findById(restaurantId).populate('ownerId');
    
    if (!restaurant) {
      console.log('❌ Restaurant not found');
      return;
    }
    
    console.log(`   • Restaurant Name: ${restaurant.name}`);
    console.log(`   • Owner: ${restaurant.ownerId?.firstName} ${restaurant.ownerId?.lastName}`);
    console.log(`   • Email: ${restaurant.ownerId?.email}`);
    console.log(`   • Status: ${restaurant.status}`);
    console.log(`   • Created: ${restaurant.createdAt?.toLocaleDateString()}`);
    
    // Step 2: Check existing orders
    console.log('\n📦 Step 2: Existing Orders...');
    const existingOrders = await Order.find({ restaurantId })
      .populate('customerId', 'firstName lastName email')
      .sort({ createdAt: -1 });
    
    console.log(`   • Total Orders: ${existingOrders.length}`);
    
    if (existingOrders.length > 0) {
      console.log('\n   📋 Order Details:');
      existingOrders.forEach((order, index) => {
        console.log(`   ${index + 1}. Order #${order.orderNumber}`);
        console.log(`      • Date: ${order.createdAt.toLocaleDateString()} ${order.createdAt.toLocaleTimeString()}`);
        console.log(`      • Customer: ${order.customerId?.firstName} ${order.customerId?.lastName}`);
        console.log(`      • Status: ${order.status}`);
        console.log(`      • Total: ₹${order.total}`);
        console.log(`      • Meal Type: ${order.mealType}`);
        console.log(`      • Subscription Order: ${order.isSubscriptionOrder ? 'Yes' : 'No'}`);
        console.log(`      • Items: ${order.items?.length || 0}`);
        if (order.items?.length > 0) {
          order.items.forEach(item => {
            console.log(`        - ${item.name} (₹${item.price})`);
          });
        }
        console.log('');
      });
    } else {
      console.log('   ℹ️ No existing orders found');
    }
    
    // Step 3: Check active subscription meal plans
    console.log('\n📅 Step 3: Active Subscription Meal Plans...');
    const subscriptionPlans = await SubscriptionMealPlan.find({ 
      restaurantId,
      status: 'active'
    }).populate('customerId', 'firstName lastName email');
    
    console.log(`   • Active Subscription Plans: ${subscriptionPlans.length}`);
    
    if (subscriptionPlans.length > 0) {
      subscriptionPlans.forEach((plan, index) => {
        console.log(`\n   ${index + 1}. Subscription Plan ${plan._id}`);
        console.log(`      • Customer: ${plan.customerId?.firstName} ${plan.customerId?.lastName}`);
        console.log(`      • Plan Type: ${plan.planType}`);
        console.log(`      • Start Date: ${plan.planStartDate?.toLocaleDateString()}`);
        console.log(`      • End Date: ${plan.planEndDate?.toLocaleDateString()}`);
        console.log(`      • Status: ${plan.status}`);
        console.log(`      • Orders Generated: ${plan.isOrdersGenerated ? 'Yes' : 'No'}`);
        
        // Analyze weeks and meals
        if (plan.weeks && plan.weeks.length > 0) {
          console.log(`      • Weeks Planned: ${plan.weeks.length}`);
          
          plan.weeks.forEach((week, weekIndex) => {
            console.log(`\n        Week ${week.weekNumber} (${week.weekStartDate?.toLocaleDateString()} - ${week.weekEndDate?.toLocaleDateString()}):`);
            
            const daysWithMeals = [];
            Object.keys(week.meals).forEach(day => {
              const dayMeals = week.meals[day];
              const lunchCount = dayMeals.lunch?.length || 0;
              const dinnerCount = dayMeals.dinner?.length || 0;
              
              if (lunchCount > 0 || dinnerCount > 0) {
                daysWithMeals.push(`${day.charAt(0).toUpperCase() + day.slice(1)} (L:${lunchCount}, D:${dinnerCount})`);
              }
            });
            
            if (daysWithMeals.length > 0) {
              console.log(`          • Days with meals: ${daysWithMeals.join(', ')}`);
            } else {
              console.log(`          • No meals planned for this week`);
            }
          });
        }
      });
    } else {
      console.log('   ℹ️ No active subscription plans found');
    }
    
    // Step 4: Check regular meal plans
    console.log('\n📋 Step 4: Regular Meal Plans...');
    const regularMealPlans = await MealPlan.find({}).populate('userId', 'firstName lastName email');
    
    let relevantMealPlans = [];
    if (regularMealPlans.length > 0) {
      // Check if any meal plans contain items from this restaurant
      regularMealPlans.forEach(plan => {
        let hasRestaurantItems = false;
        
        // Check legacy weeklyPlan structure
        if (plan.weeklyPlan && Array.isArray(plan.weeklyPlan)) {
          plan.weeklyPlan.forEach(item => {
            if (item.restaurantName === restaurant.name) {
              hasRestaurantItems = true;
            }
          });
        }
        
        // Check new weeklyPlans structure
        if (plan.weeklyPlans) {
          Object.values(plan.weeklyPlans).forEach(week => {
            Object.values(week).forEach(day => {
              ['lunch', 'dinner'].forEach(mealType => {
                if (day[mealType] && Array.isArray(day[mealType])) {
                  day[mealType].forEach(item => {
                    if (item.restaurantName === restaurant.name) {
                      hasRestaurantItems = true;
                    }
                  });
                }
              });
            });
          });
        }
        
        if (hasRestaurantItems) {
          relevantMealPlans.push(plan);
        }
      });
    }
    
    console.log(`   • Regular Meal Plans with this restaurant: ${relevantMealPlans.length}`);
    
    if (relevantMealPlans.length > 0) {
      relevantMealPlans.forEach((plan, index) => {
        console.log(`\n   ${index + 1}. Meal Plan ${plan._id}`);
        console.log(`      • User: ${plan.userId?.firstName} ${plan.userId?.lastName}`);
        console.log(`      • Total Items: ${plan.totalItems || 0}`);
        console.log(`      • Last Updated: ${plan.lastUpdated?.toLocaleDateString()}`);
      });
    }
    
    // Step 5: Expected Order Dates Analysis
    console.log('\n🎯 Step 5: Expected Order Dates Analysis...');
    console.log('=' .repeat(70));
    
    const today = new Date();
    const currentDayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][today.getDay()];
    
    console.log(`   • Today: ${today.toLocaleDateString()} (${currentDayName})`);
    
    if (subscriptionPlans.length > 0) {
      console.log('\n📅 **Expected Orders from Subscription Plans**:');
      
      subscriptionPlans.forEach((plan, index) => {
        console.log(`\n   Subscription ${index + 1} (${plan.customerId?.firstName} ${plan.customerId?.lastName}):`);
        
        if (plan.weeks && plan.weeks.length > 0) {
          plan.weeks.forEach(week => {
            const weekStart = new Date(week.weekStartDate);
            const weekEnd = new Date(week.weekEndDate);
            
            console.log(`\n     Week ${week.weekNumber}: ${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`);
            
            // Check each day of the week
            const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
            
            daysOfWeek.forEach((day, dayIndex) => {
              const dayMeals = week.meals[day];
              if (dayMeals) {
                const lunchItems = dayMeals.lunch?.length || 0;
                const dinnerItems = dayMeals.dinner?.length || 0;
                
                if (lunchItems > 0 || dinnerItems > 0) {
                  // Calculate the actual date for this day
                  const dayDate = new Date(weekStart);
                  dayDate.setDate(weekStart.getDate() + dayIndex);
                  
                  const expectedOrders = [];
                  if (lunchItems > 0) expectedOrders.push(`Lunch (${lunchItems} items)`);
                  if (dinnerItems > 0) expectedOrders.push(`Dinner (${dinnerItems} items)`);
                  
                  const isToday = dayDate.toDateString() === today.toDateString();
                  const isPast = dayDate < today;
                  const isFuture = dayDate > today;
                  
                  let status = '';
                  if (isToday) status = ' 🔥 TODAY';
                  else if (isPast) status = ' ⏰ PAST';
                  else if (isFuture) status = ' 📅 FUTURE';
                  
                  console.log(`       • ${dayDate.toLocaleDateString()} (${day}): ${expectedOrders.join(', ')}${status}`);
                }
              }
            });
          });
        }
      });
    }
    
    if (relevantMealPlans.length > 0) {
      console.log('\n📋 **Potential Orders from Regular Meal Plans**:');
      console.log('   ℹ️ These are planned but not yet converted to orders');
      
      relevantMealPlans.forEach((plan, index) => {
        console.log(`\n   Meal Plan ${index + 1} (${plan.userId?.firstName} ${plan.userId?.lastName}):`);
        console.log(`     • Status: Planned but not ordered yet`);
        console.log(`     • Items: ${plan.totalItems || 0} total items`);
        console.log(`     • Action needed: User needs to complete payment to generate orders`);
      });
    }
    
    // Step 6: Summary and Recommendations
    console.log('\n📊 Step 6: Summary & Recommendations...');
    console.log('=' .repeat(70));
    
    console.log('\n🎯 **Order Expectations for Restaurant "ASS"**:');
    
    if (existingOrders.length > 0) {
      console.log(`   ✅ **Historical Orders**: ${existingOrders.length} orders already placed`);
      const latestOrder = existingOrders[0];
      console.log(`      • Latest: ${latestOrder.createdAt.toLocaleDateString()} - ${latestOrder.mealType} (₹${latestOrder.total})`);
    }
    
    if (subscriptionPlans.length > 0) {
      console.log(`   🔄 **Active Subscriptions**: ${subscriptionPlans.length} active subscription(s)`);
      
      // Count future meal dates
      let futureMealDates = 0;
      subscriptionPlans.forEach(plan => {
        if (plan.weeks) {
          plan.weeks.forEach(week => {
            const weekStart = new Date(week.weekStartDate);
            const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
            
            daysOfWeek.forEach((day, dayIndex) => {
              const dayDate = new Date(weekStart);
              dayDate.setDate(weekStart.getDate() + dayIndex);
              
              if (dayDate >= today) {
                const dayMeals = week.meals[day];
                if (dayMeals && ((dayMeals.lunch?.length || 0) > 0 || (dayMeals.dinner?.length || 0) > 0)) {
                  futureMealDates++;
                }
              }
            });
          });
        }
      });
      
      console.log(`      • Expected future orders: ${futureMealDates} meal deliveries`);
    }
    
    if (relevantMealPlans.length > 0) {
      console.log(`   ⏳ **Pending Meal Plans**: ${relevantMealPlans.length} user(s) have planned meals but not ordered yet`);
    }
    
    console.log('\n🗓️ **Dates You Can Expect Orders**:');
    
    if (subscriptionPlans.length === 0 && relevantMealPlans.length === 0) {
      console.log('   ❌ No active meal plans or subscriptions found');
      console.log('   📝 Recommendation: No orders expected unless new customers subscribe');
    } else {
      console.log('   ✅ Check the detailed analysis above for specific dates');
      console.log('   📱 Use the partner portal date picker to view orders for any specific date');
      console.log('   🔄 Orders are generated automatically from active subscriptions');
    }
    
    console.log('\n🚀 **Partner Portal Usage**:');
    console.log('   • URL: http://localhost:3001/dashboard/orders');
    console.log('   • Login: 2022cse.r234@svce.edu.in');
    console.log('   • Use date picker to check orders for any specific date');
    console.log('   • Future dates will show "Scheduled Orders"');
    
  } catch (error) {
    console.error('💥 Analysis failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Handle script termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Analysis interrupted');
  await mongoose.connection.close();
  process.exit(0);
});

// Run the analysis
checkRestaurantOrders();
