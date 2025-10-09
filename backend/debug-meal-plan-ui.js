// Script to debug meal plan UI issues by checking actual stored data
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./src/models/User');
const SubscriptionMealPlan = require('./src/models/SubscriptionMealPlan');
const Order = require('./src/models/Order');

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

async function debugMealPlanUI() {
  await connectDB();
  
  try {
    const userId = '68e7b7ea4a70ed31cffb3fe9'; // jash64326@gmail.com
    
    console.log('🔍 Debugging Meal Plan UI Issues');
    console.log('=' .repeat(60));
    console.log(`👤 User ID: ${userId}`);

    // Check current data
    const user = await User.findById(userId);
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log(`📧 User: ${user.firstName} ${user.lastName} (${user.email})`);

    // Check meal plans
    const mealPlans = await SubscriptionMealPlan.find({ customerId: userId });
    console.log(`\n📋 Meal Plans Found: ${mealPlans.length}`);

    if (mealPlans.length === 0) {
      console.log('ℹ️ No meal plans found - user has clean slate as expected');
      console.log('\n🎯 Expected UI Behavior:');
      console.log('✅ All days should show "0 items"');
      console.log('✅ All meal slots should show "Add lunch/dinner"');
      console.log('✅ No selected meals should be visible');
      return;
    }

    // Analyze each meal plan
    mealPlans.forEach((plan, planIndex) => {
      console.log(`\n📋 Meal Plan ${planIndex + 1}:`);
      console.log(`   Plan Type: ${plan.planType}`);
      console.log(`   Status: ${plan.status}`);
      console.log(`   Start: ${plan.planStartDate?.toDateString()}`);
      console.log(`   End: ${plan.planEndDate?.toDateString()}`);
      console.log(`   Weeks: ${plan.weeks?.length || 0}`);

      if (plan.weeks && plan.weeks.length > 0) {
        plan.weeks.forEach((week, weekIndex) => {
          console.log(`\n   📅 Week ${weekIndex + 1} (${week.weekStartDate?.toDateString()} - ${week.weekEndDate?.toDateString()}):`);
          
          const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
          let weekTotalItems = 0;
          
          daysOfWeek.forEach(day => {
            const dayMeals = week.meals?.[day];
            if (dayMeals) {
              const lunchCount = dayMeals.lunch?.length || 0;
              const dinnerCount = dayMeals.dinner?.length || 0;
              const dayTotal = lunchCount + dinnerCount;
              weekTotalItems += dayTotal;
              
              if (dayTotal > 0) {
                console.log(`     ${day}: ${lunchCount} lunch, ${dinnerCount} dinner (total: ${dayTotal})`);
                
                // Show actual items
                if (lunchCount > 0) {
                  dayMeals.lunch.forEach((item, itemIndex) => {
                    console.log(`       L${itemIndex + 1}: ${item.name || 'Unknown'} - $${item.price || 0}`);
                  });
                }
                if (dinnerCount > 0) {
                  dayMeals.dinner.forEach((item, itemIndex) => {
                    console.log(`       D${itemIndex + 1}: ${item.name || 'Unknown'} - $${item.price || 0}`);
                  });
                }
              }
            }
          });
          
          console.log(`   📊 Week ${weekIndex + 1} Total Items: ${weekTotalItems}`);
        });
      }
    });

    // Check orders
    const orders = await Order.find({ customerId: userId }).sort({ scheduledDate: 1 });
    console.log(`\n📦 Orders Found: ${orders.length}`);

    if (orders.length > 0) {
      orders.forEach((order, index) => {
        console.log(`   ${index + 1}. ${order.orderNumber}`);
        console.log(`      Date: ${order.scheduledDate?.toDateString()}`);
        console.log(`      Meal: ${order.mealType}`);
        console.log(`      Items: ${order.items?.map(item => item.name).join(', ')}`);
        console.log(`      Total: $${order.total}`);
      });
    }

    // UI Analysis
    console.log('\n🔍 UI Issue Analysis:');
    console.log('=' .repeat(50));
    
    if (mealPlans.length > 0 && orders.length === 0) {
      console.log('🚨 ISSUE FOUND: Meal plan exists but no orders');
      console.log('   This suggests:');
      console.log('   1. UI is showing meal plan data that doesn\'t have corresponding orders');
      console.log('   2. Frontend meal plan context is out of sync with backend');
      console.log('   3. Local storage might have stale data');
    }

    if (mealPlans.length === 0 && orders.length === 0) {
      console.log('✅ EXPECTED STATE: No meal plans, no orders');
      console.log('   UI should show all days with 0 items');
    }

    // Recommendations
    console.log('\n💡 Recommendations:');
    console.log('1. Clear browser local storage/session storage');
    console.log('2. Check if frontend is using cached meal plan data');
    console.log('3. Verify meal plan context is properly synced with backend');
    console.log('4. Check if there are multiple meal plan contexts being used');
    
  } catch (error) {
    console.error('❌ Error debugging meal plan UI:', error);
  } finally {
    mongoose.connection.close();
  }
}

debugMealPlanUI();
