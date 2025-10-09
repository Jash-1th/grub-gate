const mongoose = require('mongoose');
const User = require('../src/models/User');
const Restaurant = require('../src/models/Restaurant');
const MealPlan = require('../src/models/MealPlan');
const SubscriptionMealPlan = require('../src/models/SubscriptionMealPlan');
const Subscription = require('../src/models/Subscription');
const Order = require('../src/models/Order');
const MenuItem = require('../src/models/MenuItem');

// Connect to MongoDB
mongoose.connect('mongodb+srv://jaswanth:1qazxsw2QAZXSW@cluster0.gthunlu.mongodb.net/grubgate?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const customerId = '68e7578c70b1ebbce509b69c';
const restaurantId = '68e73d168c18e7fd776a6327';

async function demonstrateUserFlow() {
  try {
    console.log('🚀 GRUBGATE USER FLOW DEMONSTRATION');
    console.log('=====================================');
    console.log('From Weekly Plan Selection → Order Generation');
    console.log('');

    // STEP 1: Get Customer Information
    console.log('📋 STEP 1: CUSTOMER PROFILE');
    console.log('---------------------------');
    const customer = await User.findById(customerId);
    if (!customer) {
      console.log('❌ Customer not found!');
      return;
    }
    console.log(`👤 Customer: ${customer.firstName} ${customer.lastName}`);
    console.log(`📧 Email: ${customer.email}`);
    console.log(`📱 Phone: ${customer.phoneNumber || 'N/A'}`);
    console.log(`🎭 User Type: ${customer.roles?.includes('pro') ? 'PRO USER' : 'NORMAL USER'}`);
    console.log(`📅 Member Since: ${customer.createdAt.toDateString()}`);
    console.log('');

    // STEP 2: Restaurant Selection
    console.log('📋 STEP 2: RESTAURANT SELECTION');
    console.log('-------------------------------');
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      console.log('❌ Restaurant not found!');
      return;
    }
    console.log(`🏪 Selected Restaurant: ${restaurant.name}`);
    console.log(`🍽️ Cuisine Type: ${restaurant.cuisine}`);
    console.log(`📍 Location: ${restaurant.address?.city}, ${restaurant.address?.province}`);
    console.log(`⭐ Status: ${restaurant.status}`);
    console.log(`🚚 Delivery Fee: $${restaurant.deliverySettings?.deliveryFee || 0}`);
    console.log(`⏱️ Avg Delivery Time: ${restaurant.deliverySettings?.avgDeliveryTime || 30} minutes`);
    console.log('');

    // STEP 3: Available Menu Items
    console.log('📋 STEP 3: MENU ITEM SELECTION');
    console.log('------------------------------');
    const menuItems = await MenuItem.find({ restaurantId: restaurantId, isAvailable: true })
      .sort({ category: 1, name: 1 });
    
    console.log(`🍽️ Available Menu Items: ${menuItems.length}`);
    
    // Group by category for better display
    const itemsByCategory = {};
    menuItems.forEach(item => {
      if (!itemsByCategory[item.category]) {
        itemsByCategory[item.category] = [];
      }
      itemsByCategory[item.category].push(item);
    });

    Object.keys(itemsByCategory).forEach(category => {
      console.log(`\n  📂 ${category.toUpperCase()}:`);
      itemsByCategory[category].forEach((item, index) => {
        const isAlwaysAvailable = item.availability && 
          Object.values(item.availability).every(day => 
            day.lunch === true && day.dinner === true
          );
        const availabilityTag = isAlwaysAvailable ? ' [ALWAYS AVAILABLE]' : ' [LIMITED AVAILABILITY]';
        console.log(`    ${index + 1}. ${item.name} - $${item.price}${availabilityTag}`);
        if (item.dietaryPreferences && item.dietaryPreferences.length > 0) {
          console.log(`       🏷️ ${item.dietaryPreferences.join(', ')}`);
        }
      });
    });
    console.log('');

    // STEP 4: Current Meal Plans
    console.log('📋 STEP 4: CURRENT MEAL PLANS');
    console.log('-----------------------------');
    
    // Check regular meal plans
    const mealPlans = await MealPlan.find({ userId: customerId })
      .populate('items.menuItemId')
      .sort({ createdAt: -1 });
    
    // Check subscription meal plans
    const subscriptionMealPlans = await SubscriptionMealPlan.find({ userId: customerId })
      .populate('weeklyPlans.meals.menuItemId')
      .sort({ createdAt: -1 });

    if (mealPlans.length === 0 && subscriptionMealPlans.length === 0) {
      console.log('📝 No existing meal plans found - Fresh start!');
    } else {
      if (mealPlans.length > 0) {
        console.log(`📋 Regular Meal Plans: ${mealPlans.length}`);
        mealPlans.forEach((plan, index) => {
          console.log(`\n  Plan ${index + 1}: ${plan._id}`);
          console.log(`    Status: ${plan.status}`);
          console.log(`    Total Cost: $${plan.totalCost || 0}`);
          console.log(`    Items: ${plan.items?.length || 0}`);
          
          if (plan.items && plan.items.length > 0) {
            plan.items.forEach((item, itemIndex) => {
              console.log(`      ${itemIndex + 1}. ${item.menuItemId?.name || 'Unknown'} - ${item.dayOfWeek} ${item.mealType}`);
            });
          }
        });
      }

      if (subscriptionMealPlans.length > 0) {
        console.log(`\n📋 Subscription Meal Plans: ${subscriptionMealPlans.length}`);
        subscriptionMealPlans.forEach((plan, index) => {
          console.log(`\n  Subscription Plan ${index + 1}: ${plan._id}`);
          console.log(`    Status: ${plan.status}`);
          console.log(`    Total Cost: $${plan.totalCost || 0}`);
          
          if (plan.weeklyPlans && plan.weeklyPlans.length > 0) {
            console.log(`    Weekly Plans: ${plan.weeklyPlans.length}`);
            plan.weeklyPlans.forEach((weekPlan, weekIndex) => {
              console.log(`      Week ${weekIndex + 1}: ${weekPlan.weekStartDate}`);
              if (weekPlan.meals && weekPlan.meals.length > 0) {
                weekPlan.meals.forEach((meal, mealIndex) => {
                  console.log(`        ${mealIndex + 1}. ${meal.menuItemId?.name || 'Unknown'} - ${meal.dayOfWeek} ${meal.mealType}`);
                });
              }
            });
          }
        });
      }
    }
    console.log('');

    // STEP 5: Active Subscriptions
    console.log('📋 STEP 5: SUBSCRIPTION STATUS');
    console.log('------------------------------');
    const subscriptions = await Subscription.find({ userId: customerId })
      .sort({ createdAt: -1 });
    
    if (subscriptions.length === 0) {
      console.log('💳 No active subscriptions - Pay-per-order model');
    } else {
      subscriptions.forEach((sub, index) => {
        console.log(`\n💳 Subscription ${index + 1}: ${sub._id}`);
        console.log(`    Plan Type: ${sub.planType}`);
        console.log(`    Status: ${sub.status}`);
        console.log(`    Amount: $${sub.amount}`);
        console.log(`    Billing: ${sub.billingCycle}`);
        console.log(`    Start: ${sub.startDate?.toDateString()}`);
        console.log(`    End: ${sub.endDate?.toDateString()}`);
        console.log(`    Auto Renew: ${sub.autoRenew ? 'Yes' : 'No'}`);
        
        if (sub.weeklyPlanIds && sub.weeklyPlanIds.length > 0) {
          console.log(`    Associated Plans: ${sub.weeklyPlanIds.length}`);
        }
      });
    }
    console.log('');

    // STEP 6: Generated Orders
    console.log('📋 STEP 6: ORDER GENERATION RESULTS');
    console.log('-----------------------------------');
    const orders = await Order.find({ customerId: customerId })
      .populate('items.menuItemId')
      .sort({ createdAt: -1 });
    
    if (orders.length === 0) {
      console.log('📦 No orders generated yet');
      console.log('💡 Orders will be created when:');
      console.log('   - Customer confirms meal plan');
      console.log('   - Subscription becomes active');
      console.log('   - Payment is processed');
    } else {
      console.log(`📦 Generated Orders: ${orders.length}`);
      
      orders.forEach((order, index) => {
        console.log(`\n📦 Order ${index + 1}: ${order.orderNumber}`);
        console.log(`    Order ID: ${order._id}`);
        console.log(`    Status: ${order.status}`);
        console.log(`    Total: $${order.totalAmount}`);
        console.log(`    Restaurant: ${order.restaurantId}`);
        console.log(`    Delivery Date: ${order.deliveryDate?.toDateString() || 'TBD'}`);
        console.log(`    Delivery Time: ${order.deliveryTimeSlot || 'TBD'}`);
        console.log(`    Created: ${order.createdAt.toDateString()}`);
        
        if (order.items && order.items.length > 0) {
          console.log(`    Items (${order.items.length}):`);
          order.items.forEach((item, itemIndex) => {
            console.log(`      ${itemIndex + 1}. ${item.menuItemId?.name || 'Unknown Item'}`);
            console.log(`         Qty: ${item.quantity} × $${item.price} = $${(item.quantity * item.price).toFixed(2)}`);
          });
        }

        if (order.deliveryAddress) {
          console.log(`    Delivery To:`);
          console.log(`      ${order.deliveryAddress.street}`);
          console.log(`      ${order.deliveryAddress.city}, ${order.deliveryAddress.province} ${order.deliveryAddress.postalCode}`);
        }

        if (order.paymentDetails) {
          console.log(`    Payment: ${order.paymentDetails.method} - ${order.paymentDetails.status}`);
        }
      });
    }
    console.log('');

    // STEP 7: Flow Analysis & Next Steps
    console.log('📋 STEP 7: FLOW ANALYSIS & RECOMMENDATIONS');
    console.log('------------------------------------------');
    
    const hasActivePlans = mealPlans.length > 0 || subscriptionMealPlans.length > 0;
    const hasActiveSubscription = subscriptions.some(sub => sub.status === 'active');
    const hasOrders = orders.length > 0;
    const totalOrderValue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalSubscriptionValue = subscriptions.reduce((sum, sub) => sum + sub.amount, 0);

    console.log('📊 CURRENT STATUS:');
    console.log(`   👤 Customer Type: ${customer.roles?.includes('pro') ? 'PRO' : 'NORMAL'}`);
    console.log(`   🏪 Selected Restaurant: ${restaurant.name}`);
    console.log(`   📋 Active Meal Plans: ${hasActivePlans ? 'YES' : 'NO'}`);
    console.log(`   💳 Active Subscription: ${hasActiveSubscription ? 'YES' : 'NO'}`);
    console.log(`   📦 Generated Orders: ${hasOrders ? orders.length : 'NONE'}`);
    console.log(`   💰 Total Spent: $${(totalOrderValue + totalSubscriptionValue).toFixed(2)}`);

    console.log('\n🔄 EXPECTED FLOW:');
    console.log('   1. ✅ Customer Profile Created');
    console.log('   2. ✅ Restaurant Selected');
    console.log('   3. ✅ Menu Items Available');
    console.log(`   4. ${hasActivePlans ? '✅' : '⏳'} Meal Plan Created`);
    console.log(`   5. ${hasActiveSubscription ? '✅' : '⏳'} Subscription Activated`);
    console.log(`   6. ${hasOrders ? '✅' : '⏳'} Orders Generated`);
    console.log('   7. ⏳ Orders Delivered');

    console.log('\n💡 NEXT STEPS:');
    if (!hasActivePlans) {
      console.log('   📝 Create a meal plan by selecting items for specific days/meals');
      console.log('   🔗 Frontend: WeeklyMenuPage → Select items → Add to plan');
    } else if (!hasActiveSubscription && !hasOrders) {
      console.log('   💳 Activate subscription or process one-time payment');
      console.log('   🔗 Backend: Process payment → Create subscription → Generate orders');
    } else if (!hasOrders) {
      console.log('   📦 Orders should be generated from active meal plans');
      console.log('   🔗 Backend: Order generation service should create orders from meal plans');
    } else {
      console.log('   🚚 Orders ready for delivery scheduling and fulfillment');
      console.log('   📱 Customer can track orders in their dashboard');
    }

    // STEP 8: Technical Implementation Details
    console.log('\n📋 STEP 8: TECHNICAL IMPLEMENTATION');
    console.log('-----------------------------------');
    
    console.log('🔧 FRONTEND FLOW:');
    console.log('   1. WeeklyMenuPage.jsx - Week selection (current/next)');
    console.log('   2. RestaurantDetailPage.jsx - Menu browsing & item selection');
    console.log('   3. MealPlanContext.jsx - State management & restaurant restrictions');
    console.log('   4. SubscriptionPlans.jsx - Subscription selection & payment');
    console.log('   5. OrdersPage.jsx - Order tracking & history');

    console.log('\n🔧 BACKEND FLOW:');
    console.log('   1. MenuItem.js - Menu items with availability rules');
    console.log('   2. MealPlan.js - Individual meal plan storage');
    console.log('   3. SubscriptionMealPlan.js - Subscription-based meal plans');
    console.log('   4. Subscription.js - Subscription management');
    console.log('   5. Order.js - Order generation & tracking');
    console.log('   6. OrderGenerationService.js - Automated order creation');

    console.log('\n🔧 DATA FLOW:');
    console.log('   Frontend State → API Calls → Database Storage → Order Generation → Delivery');
    console.log('   MealPlanContext → /api/meal-plans → MealPlan/SubscriptionMealPlan → Order → Fulfillment');

    console.log('\n🔧 KEY BUSINESS RULES:');
    console.log('   • Normal users: 1 restaurant per meal plan');
    console.log('   • Pro users: Multiple restaurants allowed');
    console.log('   • Always available items: Shown to normal users');
    console.log('   • Full menu: Available to pro users');
    console.log('   • Week-aware planning: Current week (0) vs Next week (1)');
    console.log('   • Order generation: Triggered by subscription activation or payment');

  } catch (error) {
    console.error('❌ Error in user flow demonstration:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔚 Flow analysis complete. Database connection closed.');
  }
}

// Run the demonstration
demonstrateUserFlow();
