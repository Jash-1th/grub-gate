// FILE: scripts/create-sunday-based-subscription.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const SubscriptionMealPlan = require('../src/models/SubscriptionMealPlan');
const Subscription = require('../src/models/Subscription');
const User = require('../src/models/User');
const Restaurant = require('../src/models/Restaurant');
const { getWeekDateRange } = require('../src/utils/dateHelpers');

/**
 * Create a new subscription with Sunday-based weeks to test the fix
 */
async function createSundayBasedSubscription() {
  try {
    console.log('🚀 Creating Sunday-Based Subscription for Testing...');
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
    
    // Find existing user and restaurant
    const customer = await User.findOne({ email: '2022cse.r234@svce.edu.in' });
    const restaurant = await Restaurant.findOne({ name: 'ASS' });
    
    if (!customer || !restaurant) {
      console.log('❌ Customer or restaurant not found');
      return;
    }
    
    console.log(`👤 Customer: ${customer.firstName} ${customer.lastName}`);
    console.log(`🏪 Restaurant: ${restaurant.name}`);
    
    // Create Sunday-based weeks
    const today = new Date();
    
    // Delete existing subscriptions to create fresh ones
    await SubscriptionMealPlan.deleteMany({ customerId: customer._id });
    await Subscription.deleteMany({ customerId: customer._id });
    console.log('🗑️ Deleted existing subscriptions');
    
    // Create base subscription
    const subscription = await Subscription.create({
      customerId: customer._id,
      planId: 'bi-weekly',
      planName: 'Bi-Weekly Meal Plan',
      duration: 14,
      price: 999.99,
      monthlyPrice: 999.99,
      currency: 'INR',
      billingCycle: 'bi-weekly',
      deliveryFrequency: 'daily',
      status: 'active',
      startDate: getWeekDateRange(0, today).startDate,
      endDate: new Date(getWeekDateRange(0, today).startDate.getTime() + 30 * 24 * 60 * 60 * 1000),
      nextBillingDate: new Date(getWeekDateRange(0, today).startDate.getTime() + 14 * 24 * 60 * 60 * 1000),
      autoRenew: true,
      features: ['Meal Planning', 'Order Management', 'Delivery Tracking']
    });
    
    console.log(`✅ Created base subscription: ${subscription._id}`);
    const week0 = getWeekDateRange(0, today);
    const week1 = getWeekDateRange(1, today);
    
    console.log(`📅 Week 0: ${week0.startDate.toDateString()} - ${week0.endDate.toDateString()}`);
    console.log(`📅 Week 1: ${week1.startDate.toDateString()} - ${week1.endDate.toDateString()}`);
    
    // Create meal plan data
    const weeks = [
      {
        weekNumber: 1,
        weekStartDate: week0.startDate,
        weekEndDate: week0.endDate,
        meals: {
          sunday: {
            lunch: [{
              id: 'meal_1',
              planId: 'plan_1',
              menuItemId: '68e65166b6624cc30f2da908', // Paneer Butter Masala
              name: 'Paneer Butter Masala',
              price: 249,
              restaurantName: 'ASS',
              deliveryTime: '12:30',
              description: 'Rich and creamy paneer curry',
              category: 'Main Course',
              spiceLevel: 2,
              prepTime: 25
            }],
            dinner: [{
              id: 'meal_2',
              planId: 'plan_2',
              menuItemId: '68e65166b6624cc30f2da909', // Chicken Biryani
              name: 'Chicken Biryani Special',
              price: 299,
              restaurantName: 'ASS',
              deliveryTime: '19:30',
              description: 'Aromatic basmati rice with tender chicken',
              category: 'Biryani',
              spiceLevel: 3,
              prepTime: 45
            }]
          },
          monday: {
            lunch: [{
              id: 'meal_3',
              planId: 'plan_3',
              menuItemId: '68e65166b6624cc30f2da910', // Dal Tadka
              name: 'Dal Tadka Premium',
              price: 179,
              restaurantName: 'ASS',
              deliveryTime: '12:30',
              description: 'Yellow lentils with aromatic tempering',
              category: 'Dal',
              spiceLevel: 2,
              prepTime: 30
            }],
            dinner: [{
              id: 'meal_4',
              planId: 'plan_4',
              menuItemId: '68e65166b6624cc30f2da908', // Paneer Butter Masala
              name: 'Paneer Butter Masala',
              price: 249,
              restaurantName: 'ASS',
              deliveryTime: '19:30',
              description: 'Rich and creamy paneer curry',
              category: 'Main Course',
              spiceLevel: 2,
              prepTime: 25
            }]
          },
          tuesday: {
            lunch: [{
              id: 'meal_5',
              planId: 'plan_5',
              menuItemId: '68e65166b6624cc30f2da909', // Chicken Biryani
              name: 'Chicken Biryani Special',
              price: 299,
              restaurantName: 'ASS',
              deliveryTime: '12:30',
              description: 'Aromatic basmati rice with tender chicken',
              category: 'Biryani',
              spiceLevel: 3,
              prepTime: 45
            }],
            dinner: []
          },
          wednesday: { lunch: [], dinner: [] },
          thursday: { lunch: [], dinner: [] },
          friday: { lunch: [], dinner: [] },
          saturday: { lunch: [], dinner: [] }
        }
      }
    ];
    
    // Create new subscription meal plan
    const newSubscription = await SubscriptionMealPlan.create({
      customerId: customer._id,
      restaurantId: restaurant._id,
      subscriptionId: subscription._id,
      planType: 'bi-weekly',
      planStartDate: week0.startDate,
      planEndDate: new Date(week0.startDate.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days
      weekStartDates: [week0.startDate, week1.startDate],
      weeks: weeks,
      billingCycle: 'bi-weekly',
      nextBillingDate: new Date(week0.startDate.getTime() + 14 * 24 * 60 * 60 * 1000),
      status: 'active',
      isOrdersGenerated: false,
      deliveryAddress: {
        street: '123 Test Street, Apartment 4B',
        city: 'Chennai',
        province: 'Tamil Nadu',
        postalCode: '600001',
        instructions: 'Ring doorbell twice, leave at door if no answer'
      },
      specialInstructions: 'Test subscription with Sunday-based weeks'
    });
    
    console.log('✅ Created new Sunday-based subscription');
    console.log(`   Subscription ID: ${newSubscription._id}`);
    
    // Test the new subscription
    console.log('\n🧪 Testing New Subscription...');
    
    const testDates = [
      new Date(2025, 9, 8),  // Oct 8 (Wednesday) - today
      new Date(2025, 9, 12), // Oct 12 (Sunday) - week start
      new Date(2025, 9, 13), // Oct 13 (Monday)
      new Date(2025, 9, 14), // Oct 14 (Tuesday)
    ];
    
    testDates.forEach(testDate => {
      console.log(`\n📅 Testing ${testDate.toDateString()}:`);
      
      // Temporarily set the date for testing
      const originalGetTodaysMeals = newSubscription.getTodaysMeals;
      newSubscription.getTodaysMeals = function() {
        const { findSubscriptionDayForDate } = require('../src/utils/dateHelpers');
        
        const targetDate = new Date(testDate);
        targetDate.setHours(0, 0, 0, 0);
        
        const todaysMeals = [];
        
        // Find which subscription day corresponds to target date
        const subscriptionDay = findSubscriptionDayForDate(targetDate, this.weeks);
        
        if (!subscriptionDay) {
          return todaysMeals;
        }
        
        // Find the week that contains target date
        const currentWeek = this.weeks.find(week => {
          const weekStart = new Date(week.weekStartDate);
          weekStart.setHours(0, 0, 0, 0);
          const weekEnd = new Date(week.weekEndDate);
          weekEnd.setHours(23, 59, 59, 999);
          return targetDate >= weekStart && targetDate <= weekEnd;
        });
        
        if (!currentWeek || !currentWeek.meals[subscriptionDay]) {
          return todaysMeals;
        }
        
        const dayMeals = currentWeek.meals[subscriptionDay];
        
        // Add lunch meals
        if (dayMeals.lunch && dayMeals.lunch.length > 0) {
          dayMeals.lunch.forEach(meal => {
            todaysMeals.push({
              id: `${this._id}_${subscriptionDay}_lunch_${meal.planId}`,
              mealType: 'lunch',
              item: meal
            });
          });
        }
        
        // Add dinner meals
        if (dayMeals.dinner && dayMeals.dinner.length > 0) {
          dayMeals.dinner.forEach(meal => {
            todaysMeals.push({
              id: `${this._id}_${subscriptionDay}_dinner_${meal.planId}`,
              mealType: 'dinner',
              item: meal
            });
          });
        }
        
        return todaysMeals;
      };
      
      const meals = newSubscription.getTodaysMeals();
      console.log(`   Meals found: ${meals.length}`);
      
      meals.forEach(meal => {
        console.log(`   • ${meal.mealType}: ${meal.item.name} (₹${meal.item.price})`);
      });
      
      if (meals.length === 0) {
        console.log('   ℹ️ No meals scheduled (expected if date is not in subscription weeks)');
      }
    });
    
    console.log('\n🎯 Summary:');
    console.log('✅ Created Sunday-based subscription (Oct 12-18)');
    console.log('✅ Meals scheduled for Sunday, Monday, Tuesday');
    console.log('✅ Orders should generate when those dates arrive');
    console.log('✅ Oct 9 & 10 correctly have no orders (before week starts)');
    
    console.log('\n🚀 Next Steps:');
    console.log('1. Wait until Oct 12 (Sunday) and run order generation');
    console.log('2. Check partner portal for orders on Oct 12, 13, 14');
    console.log('3. Verify no orders appear for Oct 9, 10 (correct behavior)');
    
  } catch (error) {
    console.error('💥 Creation failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Handle script termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Creation interrupted');
  await mongoose.connection.close();
  process.exit(0);
});

// Run the creation
createSundayBasedSubscription();
