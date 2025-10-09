const mongoose = require('mongoose');
const User = require('../src/models/User');
const Restaurant = require('../src/models/Restaurant');
const MealPlan = require('../src/models/MealPlan');
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
    console.log('🚀 GRUBGATE USER FLOW: WEEKLY PLAN → ORDERS');
    console.log('===========================================');
    console.log(`Customer ID: ${customerId}`);
    console.log(`Restaurant ID: ${restaurantId}`);
    console.log('');

    // STEP 1: Customer Profile
    console.log('📋 STEP 1: CUSTOMER PROFILE');
    console.log('---------------------------');
    const customer = await User.findById(customerId);
    if (!customer) {
      console.log('❌ Customer not found!');
      return;
    }
    console.log(`👤 Name: ${customer.firstName} ${customer.lastName}`);
    console.log(`📧 Email: ${customer.email}`);
    console.log(`🎭 User Type: ${customer.roles?.includes('pro') ? 'PRO USER' : 'NORMAL USER'}`);
    console.log(`📅 Joined: ${customer.createdAt.toDateString()}`);
    console.log('');

    // STEP 2: Selected Restaurant
    console.log('📋 STEP 2: SELECTED RESTAURANT');
    console.log('------------------------------');
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      console.log('❌ Restaurant not found!');
      return;
    }
    console.log(`🏪 Restaurant: ${restaurant.name}`);
    console.log(`🍽️ Cuisine: ${restaurant.cuisine}`);
    console.log(`📍 Location: ${restaurant.address?.city}, ${restaurant.address?.province}`);
    console.log(`⭐ Status: ${restaurant.status}`);
    console.log('');

    // STEP 3: Available Menu Items
    console.log('📋 STEP 3: AVAILABLE MENU ITEMS');
    console.log('-------------------------------');
    const menuItems = await MenuItem.find({ 
      restaurantId: restaurantId, 
      isAvailable: true 
    }).sort({ category: 1, name: 1 });
    
    console.log(`🍽️ Total Menu Items: ${menuItems.length}`);
    
    if (menuItems.length > 0) {
      // Show first few items as examples
      console.log('\n📝 Sample Menu Items:');
      menuItems.slice(0, 5).forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.name} - $${item.price}`);
        console.log(`     Category: ${item.category}`);
        if (item.dietaryPreferences && item.dietaryPreferences.length > 0) {
          console.log(`     Dietary: ${item.dietaryPreferences.join(', ')}`);
        }
      });
      if (menuItems.length > 5) {
        console.log(`     ... and ${menuItems.length - 5} more items`);
      }
    }
    console.log('');

    // STEP 4: Current Meal Plans
    console.log('📋 STEP 4: CURRENT MEAL PLANS');
    console.log('-----------------------------');
    const mealPlans = await MealPlan.find({ userId: customerId }).sort({ createdAt: -1 });
    
    if (mealPlans.length === 0) {
      console.log('📝 No meal plans found - User needs to create one');
    } else {
      console.log(`📋 Found ${mealPlans.length} meal plan(s)`);
      
      mealPlans.forEach((plan, index) => {
        console.log(`\n  📋 Meal Plan ${index + 1}: ${plan._id}`);
        console.log(`     Created: ${plan.createdAt.toDateString()}`);
        console.log(`     Total Items: ${plan.totalItems || 0}`);
        console.log(`     Selected Restaurant: ${plan.selectedRestaurantName || 'None'}`);
        
        // Check weekly plans structure
        if (plan.weeklyPlans) {
          console.log('     Weekly Plans Structure:');
          
          // Check Week 0 (Current Week)
          if (plan.weeklyPlans.week0) {
            let week0Items = 0;
            Object.keys(plan.weeklyPlans.week0).forEach(day => {
              const dayPlan = plan.weeklyPlans.week0[day];
              if (dayPlan && dayPlan.lunch && dayPlan.dinner) {
                week0Items += dayPlan.lunch.length + dayPlan.dinner.length;
              }
            });
            console.log(`       Week 0 (Current): ${week0Items} items`);
            
            // Show sample items from Week 0
            if (week0Items > 0) {
              Object.keys(plan.weeklyPlans.week0).forEach(day => {
                const dayPlan = plan.weeklyPlans.week0[day];
                if (dayPlan && (dayPlan.lunch.length > 0 || dayPlan.dinner.length > 0)) {
                  console.log(`         ${day.charAt(0).toUpperCase() + day.slice(1)}:`);
                  if (dayPlan.lunch.length > 0) {
                    console.log(`           Lunch: ${dayPlan.lunch.map(item => item.name).join(', ')}`);
                  }
                  if (dayPlan.dinner.length > 0) {
                    console.log(`           Dinner: ${dayPlan.dinner.map(item => item.name).join(', ')}`);
                  }
                }
              });
            }
          }
          
          // Check Week 1 (Next Week)
          if (plan.weeklyPlans.week1) {
            let week1Items = 0;
            Object.keys(plan.weeklyPlans.week1).forEach(day => {
              const dayPlan = plan.weeklyPlans.week1[day];
              if (dayPlan && dayPlan.lunch && dayPlan.dinner) {
                week1Items += dayPlan.lunch.length + dayPlan.dinner.length;
              }
            });
            console.log(`       Week 1 (Next): ${week1Items} items`);
          }
        }
      });
    }
    console.log('');

    // STEP 5: Generated Orders
    console.log('📋 STEP 5: GENERATED ORDERS');
    console.log('---------------------------');
    const orders = await Order.find({ customerId: customerId }).sort({ createdAt: -1 });
    
    if (orders.length === 0) {
      console.log('📦 No orders found yet');
      console.log('');
      console.log('💡 EXPECTED ORDER GENERATION FLOW:');
      console.log('   1. User creates meal plan with items');
      console.log('   2. User confirms meal plan');
      console.log('   3. Payment is processed');
      console.log('   4. Orders are automatically generated');
      console.log('   5. Orders appear in /orders page');
    } else {
      console.log(`📦 Found ${orders.length} order(s)`);
      
      orders.forEach((order, index) => {
        console.log(`\n  📦 Order ${index + 1}: ${order.orderNumber || order._id}`);
        console.log(`     Status: ${order.status}`);
        console.log(`     Total: $${order.totalAmount}`);
        console.log(`     Restaurant: ${order.restaurantId}`);
        console.log(`     Created: ${order.createdAt.toDateString()}`);
        
        if (order.deliveryDate) {
          console.log(`     Delivery Date: ${order.deliveryDate.toDateString()}`);
        }
        
        if (order.items && order.items.length > 0) {
          console.log(`     Items (${order.items.length}):`);
          order.items.forEach((item, itemIndex) => {
            console.log(`       ${itemIndex + 1}. ${item.name || 'Unknown Item'} - Qty: ${item.quantity} × $${item.price}`);
          });
        }
      });
    }
    console.log('');

    // STEP 6: Flow Analysis
    console.log('📋 STEP 6: FLOW ANALYSIS');
    console.log('------------------------');
    
    const hasMenuItems = menuItems.length > 0;
    const hasMealPlans = mealPlans.length > 0;
    const hasOrders = orders.length > 0;
    
    console.log('🔍 CURRENT STATUS:');
    console.log(`   ✅ Customer Profile: Found`);
    console.log(`   ✅ Restaurant Selected: ${restaurant.name}`);
    console.log(`   ${hasMenuItems ? '✅' : '❌'} Menu Items Available: ${menuItems.length}`);
    console.log(`   ${hasMealPlans ? '✅' : '❌'} Meal Plans Created: ${mealPlans.length}`);
    console.log(`   ${hasOrders ? '✅' : '❌'} Orders Generated: ${orders.length}`);
    
    console.log('\n🔄 COMPLETE USER FLOW:');
    console.log('   1. ✅ User Registration & Login');
    console.log('   2. ✅ Restaurant Selection');
    console.log('   3. ✅ Menu Browsing');
    console.log(`   4. ${hasMealPlans ? '✅' : '⏳'} Weekly Plan Creation`);
    console.log('   5. ⏳ Payment Processing');
    console.log(`   6. ${hasOrders ? '✅' : '⏳'} Order Generation`);
    console.log('   7. ⏳ Order Fulfillment');
    
    console.log('\n🎯 NEXT STEPS FOR COMPLETE FLOW:');
    if (!hasMealPlans) {
      console.log('   📝 Create meal plan by adding items to weekly schedule');
      console.log('   🔗 Frontend: WeeklyMenuPage → Add items to specific days/meals');
    } else if (!hasOrders) {
      console.log('   💳 Process payment to generate orders from meal plans');
      console.log('   🔗 Backend: Payment processing → Order generation service');
    } else {
      console.log('   🚚 Orders ready for delivery management');
      console.log('   📱 Customer can track orders in dashboard');
    }

    // STEP 7: Technical Implementation
    console.log('\n📋 STEP 7: TECHNICAL IMPLEMENTATION');
    console.log('-----------------------------------');
    
    console.log('🔧 FRONTEND COMPONENTS:');
    console.log('   • WeeklyMenuPage.jsx - Week selection & meal planning');
    console.log('   • RestaurantDetailPage.jsx - Menu browsing & item selection');
    console.log('   • MealPlanContext.jsx - State management & data persistence');
    console.log('   • OrdersPage.jsx - Order tracking & history');
    
    console.log('\n🔧 BACKEND MODELS:');
    console.log('   • User.js - Customer profiles & authentication');
    console.log('   • Restaurant.js - Restaurant data & menu management');
    console.log('   • MenuItem.js - Menu items with availability rules');
    console.log('   • MealPlan.js - Weekly meal planning data');
    console.log('   • Order.js - Order generation & tracking');
    
    console.log('\n🔧 DATA FLOW:');
    console.log('   Frontend State → API Calls → Database → Order Generation');
    console.log('   MealPlanContext → /api/meal-plans → MealPlan → Order');
    
    console.log('\n🔧 KEY BUSINESS RULES:');
    console.log('   • Normal users: 1 restaurant per meal plan');
    console.log('   • Pro users: Multiple restaurants allowed');
    console.log('   • Week-aware planning: Current (week0) vs Next (week1)');
    console.log('   • Order generation: Triggered by payment confirmation');

  } catch (error) {
    console.error('❌ Error in flow demonstration:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔚 Flow analysis complete. Database connection closed.');
  }
}

// Run the demonstration
demonstrateUserFlow();
