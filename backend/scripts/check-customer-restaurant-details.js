// FILE: scripts/check-customer-restaurant-details.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const Order = require('../src/models/Order');
const User = require('../src/models/User');
const Restaurant = require('../src/models/Restaurant');
const SubscriptionMealPlan = require('../src/models/SubscriptionMealPlan');

/**
 * Check customer and restaurant details with their orders and meal plans
 */
async function checkCustomerRestaurantDetails() {
  try {
    console.log('🔍 Checking Customer & Restaurant Details...');
    console.log('=' .repeat(70));
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
    
    const customerId = '68e60bc544b875ac6aaf9526';
    const restaurantId = '68e60c9d44b875ac6aaf953d';
    
    // Get customer details
    console.log('\n👤 CUSTOMER DETAILS:');
    console.log('-' .repeat(40));
    
    const customer = await User.findById(customerId);
    if (customer) {
      console.log(`📋 Name: ${customer.firstName} ${customer.lastName}`);
      console.log(`📧 Email: ${customer.email}`);
      console.log(`📱 Phone: ${customer.phoneNumber || 'Not provided'}`);
      console.log(`🎭 Roles: ${customer.roles?.join(', ') || customer.role || 'Not specified'}`);
      console.log(`📅 Created: ${customer.createdAt?.toDateString()}`);
    } else {
      console.log('❌ Customer not found');
      return;
    }
    
    // Get restaurant details
    console.log('\n🏪 RESTAURANT DETAILS:');
    console.log('-' .repeat(40));
    
    const restaurant = await Restaurant.findById(restaurantId);
    if (restaurant) {
      console.log(`🍽️ Name: ${restaurant.name}`);
      console.log(`🍜 Cuisine: ${Array.isArray(restaurant.cuisine) ? restaurant.cuisine.join(', ') : restaurant.cuisine}`);
      console.log(`🏢 Type: ${restaurant.businessType || 'Not specified'}`);
      console.log(`📍 Address: ${restaurant.address?.street}, ${restaurant.address?.city}`);
      console.log(`📞 Phone: ${restaurant.contactInfo?.phone || 'Not provided'}`);
      console.log(`🌐 Status: ${restaurant.status}`);
      console.log(`👨‍💼 Owner: ${restaurant.ownerId}`);
    } else {
      console.log('❌ Restaurant not found');
      return;
    }
    
    // Get subscription meal plans
    console.log('\n📋 SUBSCRIPTION MEAL PLANS:');
    console.log('-' .repeat(40));
    
    const subscriptions = await SubscriptionMealPlan.find({
      customerId: customerId,
      restaurantId: restaurantId
    }).sort({ createdAt: -1 });
    
    if (subscriptions.length > 0) {
      subscriptions.forEach((sub, index) => {
        console.log(`\n📦 Subscription ${index + 1}: ${sub._id}`);
        console.log(`   📅 Plan Type: ${sub.planType}`);
        console.log(`   📊 Status: ${sub.status}`);
        console.log(`   🗓️ Start Date: ${sub.planStartDate?.toDateString()}`);
        console.log(`   🏁 End Date: ${sub.planEndDate?.toDateString()}`);
        console.log(`   🔄 Orders Generated: ${sub.isOrdersGenerated ? 'Yes' : 'No'}`);
        console.log(`   📍 Delivery Address: ${sub.deliveryAddress?.street}, ${sub.deliveryAddress?.city}`);
        
        // Show weeks summary
        if (sub.weeks && sub.weeks.length > 0) {
          console.log(`   📅 Weeks: ${sub.weeks.length} weeks planned`);
          sub.weeks.forEach((week, weekIndex) => {
            const mealCount = countWeekMeals(week);
            console.log(`      Week ${week.weekNumber}: ${mealCount} meals (${week.weekStartDate?.toDateString()} - ${week.weekEndDate?.toDateString()})`);
          });
        }
      });
    } else {
      console.log('📭 No subscription meal plans found for this customer-restaurant combination');
    }
    
    // Get orders
    console.log('\n📦 ORDERS:');
    console.log('-' .repeat(40));
    
    const orders = await Order.find({
      customerId: customerId,
      restaurantId: restaurantId
    })
    .sort({ scheduledDate: -1 })
    .limit(20);
    
    if (orders.length > 0) {
      console.log(`📊 Found ${orders.length} orders (showing latest 20):`);
      
      orders.forEach((order, index) => {
        const scheduledDate = order.scheduledDate ? new Date(order.scheduledDate) : null;
        const dayName = scheduledDate ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][scheduledDate.getDay()] : 'N/A';
        
        console.log(`\n🍽️ Order ${index + 1}: ${order.orderNumber}`);
        console.log(`   📅 Scheduled: ${scheduledDate ? scheduledDate.toDateString() : 'Not scheduled'} (${dayName})`);
        console.log(`   🍽️ Meal Type: ${order.mealType || 'Not specified'}`);
        console.log(`   📊 Status: ${order.status}`);
        console.log(`   💰 Total: $${order.total?.toFixed(2) || '0.00'}`);
        console.log(`   📦 Type: ${order.type || 'Not specified'}`);
        console.log(`   🔄 Scheduled Order: ${order.isScheduledOrder ? 'Yes' : 'No'}`);
        
        // Show items
        if (order.items && order.items.length > 0) {
          console.log(`   🍽️ Items (${order.items.length}):`);
          order.items.forEach((item, itemIndex) => {
            console.log(`      ${itemIndex + 1}. ${item.name || 'Unnamed Item'}`);
            console.log(`         💰 $${item.price?.toFixed(2) || '0.00'} × ${item.quantity || 1} = $${((item.price || 0) * (item.quantity || 1)).toFixed(2)}`);
            if (item.description) {
              console.log(`         📝 ${item.description}`);
            }
            if (item.specialInstructions) {
              console.log(`         ⚠️ Special: ${item.specialInstructions}`);
            }
            if (item.category) {
              console.log(`         🏷️ Category: ${item.category}`);
            }
            if (item.prepTime) {
              console.log(`         ⏱️ Prep Time: ${item.prepTime} min`);
            }
            if (item.spiceLevel) {
              console.log(`         🌶️ Spice Level: ${'🌶️'.repeat(item.spiceLevel)} (${item.spiceLevel}/5)`);
            }
            if (item.dietaryTags && item.dietaryTags.length > 0) {
              console.log(`         🥬 Dietary: ${item.dietaryTags.join(', ')}`);
            }
            if (item.allergens && item.allergens.length > 0) {
              console.log(`         ⚠️ Allergens: ${item.allergens.join(', ')}`);
            }
            if (item.ingredients && item.ingredients.length > 0) {
              console.log(`         🧄 Ingredients: ${item.ingredients.slice(0, 5).join(', ')}${item.ingredients.length > 5 ? '...' : ''}`);
            }
          });
        } else {
          console.log(`   📭 No items found`);
        }
      });
    } else {
      console.log('📭 No orders found for this customer-restaurant combination');
    }
    
    // Summary statistics
    console.log('\n📊 SUMMARY STATISTICS:');
    console.log('-' .repeat(40));
    console.log(`👤 Customer: ${customer.firstName} ${customer.lastName}`);
    console.log(`🏪 Restaurant: ${restaurant.name}`);
    console.log(`📦 Total Subscriptions: ${subscriptions.length}`);
    console.log(`🍽️ Total Orders: ${orders.length}`);
    
    if (orders.length > 0) {
      const totalValue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
      const scheduledOrders = orders.filter(o => o.isScheduledOrder).length;
      const completedOrders = orders.filter(o => o.status === 'delivered' || o.status === 'completed').length;
      
      console.log(`💰 Total Order Value: $${totalValue.toFixed(2)}`);
      console.log(`📅 Scheduled Orders: ${scheduledOrders}`);
      console.log(`✅ Completed Orders: ${completedOrders}`);
      console.log(`📈 Average Order Value: $${(totalValue / orders.length).toFixed(2)}`);
    }
    
    console.log('\n🎉 Customer & Restaurant Details Check Complete!');
    
  } catch (error) {
    console.error('💥 Check failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

/**
 * Count total meals in a week
 */
function countWeekMeals(week) {
  if (!week.meals) return 0;
  
  let count = 0;
  const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  
  daysOfWeek.forEach(day => {
    const dayMeals = week.meals[day];
    if (dayMeals) {
      if (dayMeals.lunch) count += dayMeals.lunch.length;
      if (dayMeals.dinner) count += dayMeals.dinner.length;
    }
  });
  
  return count;
}

// Handle script termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Check interrupted');
  await mongoose.connection.close();
  process.exit(0);
});

// Run the check
checkCustomerRestaurantDetails();
