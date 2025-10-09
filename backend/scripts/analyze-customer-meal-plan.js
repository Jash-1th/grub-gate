const mongoose = require('mongoose');
const User = require('../src/models/User');
const Restaurant = require('../src/models/Restaurant');
const MealPlan = require('../src/models/MealPlan');
const SubscriptionMealPlan = require('../src/models/SubscriptionMealPlan');
const Subscription = require('../src/models/Subscription');
const Order = require('../src/models/Order');
const MenuItem = require('../src/models/MenuItem');

// Connect to MongoDB
mongoose.connect('mongodb+srv://grubgate:grubgate123@cluster0.gthunlu.mongodb.net/grubgate?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const customerId = '68e7578c70b1ebbce509b69c';
const restaurantId = '68e73d168c18e7fd776a6327';

async function analyzeCustomerMealPlan() {
  try {
    console.log('🔍 ANALYZING CUSTOMER MEAL PLAN DATA');
    console.log('=====================================');
    console.log(`Customer ID: ${customerId}`);
    console.log(`Restaurant ID: ${restaurantId}`);
    console.log('');

    // 1. Get Customer Information
    console.log('👤 CUSTOMER INFORMATION:');
    console.log('------------------------');
    const customer = await User.findById(customerId);
    if (!customer) {
      console.log('❌ Customer not found!');
      return;
    }
    console.log(`Name: ${customer.firstName} ${customer.lastName}`);
    console.log(`Email: ${customer.email}`);
    console.log(`Phone: ${customer.phoneNumber || 'N/A'}`);
    console.log(`Roles: ${customer.roles?.join(', ') || customer.role || 'N/A'}`);
    console.log(`Created: ${customer.createdAt}`);
    console.log('');

    // 2. Get Restaurant Information
    console.log('🏪 RESTAURANT INFORMATION:');
    console.log('--------------------------');
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      console.log('❌ Restaurant not found!');
      return;
    }
    console.log(`Name: ${restaurant.name}`);
    console.log(`Cuisine: ${restaurant.cuisine}`);
    console.log(`Status: ${restaurant.status}`);
    console.log(`Address: ${restaurant.address?.street}, ${restaurant.address?.city}`);
    console.log('');

    // 3. Get Meal Plans for this customer
    console.log('📅 MEAL PLANS:');
    console.log('--------------');
    const mealPlans = await MealPlan.find({ userId: customerId })
      .populate('items.menuItemId')
      .sort({ createdAt: -1 });
    
    // Also check SubscriptionMealPlan
    const subscriptionMealPlans = await SubscriptionMealPlan.find({ userId: customerId })
      .populate('weeklyPlans.meals.menuItemId')
      .sort({ createdAt: -1 });
    
    if (mealPlans.length === 0 && subscriptionMealPlans.length === 0) {
      console.log('❌ No meal plans found for this customer');
    } else {
      // Display regular meal plans
      if (mealPlans.length > 0) {
        console.log(`\n📋 Regular Meal Plans (${mealPlans.length}):`);
        mealPlans.forEach((plan, index) => {
          console.log(`\n  Meal Plan ${index + 1}:`);
          console.log(`    ID: ${plan._id}`);
          console.log(`    Status: ${plan.status}`);
          console.log(`    Total Cost: $${plan.totalCost || 0}`);
          console.log(`    Created: ${plan.createdAt}`);
          
          if (plan.items && plan.items.length > 0) {
            console.log(`    Items (${plan.items.length}):`);
            plan.items.forEach((item, itemIndex) => {
              console.log(`      ${itemIndex + 1}. ${item.menuItemId?.name || 'Unknown Item'}`);
              console.log(`         Price: $${item.price}`);
              console.log(`         Quantity: ${item.quantity}`);
              console.log(`         Day: ${item.dayOfWeek || 'N/A'}`);
              console.log(`         Meal: ${item.mealType || 'N/A'}`);
            });
          }
        });
      }

      // Display subscription meal plans
      if (subscriptionMealPlans.length > 0) {
        console.log(`\n📋 Subscription Meal Plans (${subscriptionMealPlans.length}):`);
        subscriptionMealPlans.forEach((plan, index) => {
          console.log(`\n  Subscription Plan ${index + 1}:`);
          console.log(`    ID: ${plan._id}`);
          console.log(`    Status: ${plan.status}`);
          console.log(`    Total Cost: $${plan.totalCost || 0}`);
          console.log(`    Created: ${plan.createdAt}`);
          
          if (plan.weeklyPlans && plan.weeklyPlans.length > 0) {
            console.log(`    Weekly Plans (${plan.weeklyPlans.length}):`);
            plan.weeklyPlans.forEach((weekPlan, weekIndex) => {
              console.log(`      Week ${weekIndex + 1}: ${weekPlan.weekStartDate}`);
              if (weekPlan.meals && weekPlan.meals.length > 0) {
                weekPlan.meals.forEach((meal, mealIndex) => {
                  console.log(`        ${mealIndex + 1}. ${meal.dayOfWeek} ${meal.mealType}`);
                  console.log(`           Item: ${meal.menuItemId?.name || 'Unknown Item'}`);
                  console.log(`           Price: $${meal.price}`);
                  console.log(`           Quantity: ${meal.quantity}`);
                });
              }
            });
          }
        });
      }
    }
    console.log('');

    // 4. Get Subscriptions for this customer
    console.log('💳 SUBSCRIPTIONS:');
    console.log('-----------------');
    const subscriptions = await Subscription.find({ userId: customerId })
      .sort({ createdAt: -1 });
    
    if (subscriptions.length === 0) {
      console.log('❌ No subscriptions found for this customer');
    } else {
      subscriptions.forEach((sub, index) => {
        console.log(`\n💰 Subscription ${index + 1}:`);
        console.log(`  ID: ${sub._id}`);
        console.log(`  Plan Type: ${sub.planType}`);
        console.log(`  Status: ${sub.status}`);
        console.log(`  Start Date: ${sub.startDate}`);
        console.log(`  End Date: ${sub.endDate}`);
        console.log(`  Amount: $${sub.amount}`);
        console.log(`  Billing Cycle: ${sub.billingCycle}`);
        console.log(`  Auto Renew: ${sub.autoRenew}`);
        console.log(`  Created: ${sub.createdAt}`);
        
        if (sub.weeklyPlanIds && sub.weeklyPlanIds.length > 0) {
          console.log(`  Associated Weekly Plans: ${sub.weeklyPlanIds.length}`);
          sub.weeklyPlanIds.forEach((planId, planIndex) => {
            console.log(`    ${planIndex + 1}. ${planId}`);
          });
        }
      });
    }
    console.log('');

    // 5. Get Orders for this customer
    console.log('🛍️ ORDERS:');
    console.log('----------');
    const orders = await Order.find({ customerId: customerId })
      .populate('items.menuItemId')
      .sort({ createdAt: -1 });
    
    if (orders.length === 0) {
      console.log('❌ No orders found for this customer');
    } else {
      orders.forEach((order, index) => {
        console.log(`\n📦 Order ${index + 1}:`);
        console.log(`  ID: ${order._id}`);
        console.log(`  Order Number: ${order.orderNumber}`);
        console.log(`  Status: ${order.status}`);
        console.log(`  Total Amount: $${order.totalAmount}`);
        console.log(`  Delivery Date: ${order.deliveryDate}`);
        console.log(`  Delivery Time: ${order.deliveryTimeSlot}`);
        console.log(`  Restaurant: ${order.restaurantId}`);
        console.log(`  Created: ${order.createdAt}`);
        
        if (order.items && order.items.length > 0) {
          console.log(`  Items (${order.items.length}):`);
          order.items.forEach((item, itemIndex) => {
            console.log(`    ${itemIndex + 1}. ${item.menuItemId?.name || 'Unknown Item'}`);
            console.log(`       Quantity: ${item.quantity}`);
            console.log(`       Price: $${item.price}`);
            console.log(`       Subtotal: $${item.quantity * item.price}`);
          });
        }

        if (order.deliveryAddress) {
          console.log(`  Delivery Address:`);
          console.log(`    ${order.deliveryAddress.street}`);
          console.log(`    ${order.deliveryAddress.city}, ${order.deliveryAddress.province} ${order.deliveryAddress.postalCode}`);
        }
      });
    }
    console.log('');

    // 6. Get Menu Items from the selected restaurant
    console.log('🍽️ RESTAURANT MENU ITEMS:');
    console.log('-------------------------');
    const menuItems = await MenuItem.find({ restaurantId: restaurantId })
      .sort({ name: 1 });
    
    if (menuItems.length === 0) {
      console.log('❌ No menu items found for this restaurant');
    } else {
      console.log(`Found ${menuItems.length} menu items:`);
      menuItems.forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.name} - $${item.price}`);
        console.log(`     Category: ${item.category}`);
        console.log(`     Available: ${item.isAvailable ? 'Yes' : 'No'}`);
        if (item.dietaryPreferences && item.dietaryPreferences.length > 0) {
          console.log(`     Dietary: ${item.dietaryPreferences.join(', ')}`);
        }
      });
    }
    console.log('');

    // 7. Summary Analysis
    console.log('📊 SUMMARY ANALYSIS:');
    console.log('--------------------');
    console.log(`✅ Customer: ${customer.firstName} ${customer.lastName} (${customer.email})`);
    console.log(`✅ Restaurant: ${restaurant.name}`);
    console.log(`📅 Weekly Plans: ${weeklyPlans.length} found`);
    console.log(`💳 Subscriptions: ${subscriptions.length} found`);
    console.log(`🛍️ Orders: ${orders.length} found`);
    console.log(`🍽️ Menu Items Available: ${menuItems.length}`);
    
    // Calculate total spending
    const totalOrderValue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalSubscriptionValue = subscriptions.reduce((sum, sub) => sum + sub.amount, 0);
    console.log(`💰 Total Order Value: $${totalOrderValue.toFixed(2)}`);
    console.log(`💰 Total Subscription Value: $${totalSubscriptionValue.toFixed(2)}`);
    console.log(`💰 Combined Total: $${(totalOrderValue + totalSubscriptionValue).toFixed(2)}`);

    // Check if orders match meal plans
    console.log('');
    console.log('🔄 MEAL PLAN TO ORDER CONVERSION:');
    console.log('---------------------------------');
    if (weeklyPlans.length > 0 && orders.length > 0) {
      console.log('✅ Customer has both meal plans and orders - conversion successful!');
      
      // Check if recent orders match recent meal plans
      const recentPlan = weeklyPlans[0];
      const recentOrder = orders[0];
      
      if (recentPlan && recentOrder) {
        console.log(`📋 Most Recent Plan: ${recentPlan._id} (${recentPlan.meals?.length || 0} meals)`);
        console.log(`📦 Most Recent Order: ${recentOrder._id} (${recentOrder.items?.length || 0} items)`);
        
        // Check if they're from the same restaurant
        const planRestaurants = [...new Set(recentPlan.meals?.map(meal => meal.restaurantId.toString()) || [])];
        const orderRestaurant = recentOrder.restaurantId?.toString();
        
        if (planRestaurants.includes(orderRestaurant)) {
          console.log('✅ Recent order matches restaurant from meal plan!');
        } else {
          console.log('⚠️ Recent order restaurant doesn\'t match meal plan restaurant');
        }
      }
    } else if (weeklyPlans.length > 0) {
      console.log('⚠️ Customer has meal plans but no orders yet');
    } else if (orders.length > 0) {
      console.log('⚠️ Customer has orders but no meal plans');
    } else {
      console.log('❌ No meal plans or orders found');
    }

  } catch (error) {
    console.error('❌ Error analyzing customer meal plan:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔚 Analysis complete. Database connection closed.');
  }
}

// Run the analysis
analyzeCustomerMealPlan();
