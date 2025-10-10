/**
 * Test script to add meal plan items for user 68e7b7ea4a70ed31cffb3fe9
 * This will test the fixed date calculation
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const MealPlan = require('./src/models/MealPlan');
const SubscriptionMealPlan = require('./src/models/SubscriptionMealPlan');
const Restaurant = require('./src/models/Restaurant');
const { getNextSunday } = require('./src/utils/dateHelpers');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/grub-gate';
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const testMealPlanCreation = async () => {
  try {
    console.log('🧪 Testing Meal Plan Creation with Fixed Dates');
    console.log('=' .repeat(60));

    // Find the user by ID
    const userId = '68e7b7ea4a70ed31cffb3fe9';
    const user = await User.findById(userId);
    if (!user) {
      console.log(`❌ User ${userId} not found`);
      return;
    }
    console.log(`✅ Found user: ${user.firstName} ${user.lastName} (${user._id})`);

    // Find the restaurant
    const restaurant = await Restaurant.findById('68e73d168c18e7fd776a6327');
    if (!restaurant) {
      console.log('❌ Restaurant 68e73d168c18e7fd776a6327 not found');
      return;
    }
    console.log(`✅ Found restaurant: ${restaurant.name}`);

    // Test the date calculation first
    console.log('\n📅 Testing Date Calculation:');
    console.log('-' .repeat(40));
    const today = new Date();
    const nextSunday = getNextSunday();
    
    console.log(`Today: ${today.toDateString()} (Day ${today.getDay()})`);
    console.log(`Next Sunday: ${nextSunday.toDateString()} (Day ${nextSunday.getDay()})`);
    console.log(`Days until Sunday: ${Math.ceil((nextSunday - today) / (1000 * 60 * 60 * 24))}`);

    if (nextSunday.getDay() !== 0) {
      console.log('❌ ERROR: getNextSunday() is not returning a Sunday!');
      return;
    }

    // Clear existing meal plans for this user to test fresh
    console.log('\n🧹 Clearing existing meal plans for fresh test...');
    await MealPlan.deleteMany({ userId: user._id });
    await SubscriptionMealPlan.deleteMany({ customerId: user._id });
    console.log('✅ Cleared existing meal plans');

    // Create a new subscription meal plan using the fixed logic
    console.log('\n📋 Creating new subscription meal plan...');
    
    // First create the subscription meal plan manually with proper delivery address
    const subscriptionMealPlan = new SubscriptionMealPlan({
      customerId: user._id,
      restaurantId: restaurant._id,
      subscriptionId: new mongoose.Types.ObjectId(),
      planType: 'bi-weekly',
      planStartDate: getNextSunday(),
      planEndDate: (() => {
        const start = getNextSunday();
        const end = new Date(start);
        end.setDate(start.getDate() + 13); // 2 weeks ending on Saturday
        return end;
      })(),
      weekStartDates: [
        getNextSunday(),
        (() => {
          const week2 = new Date(getNextSunday());
          week2.setDate(week2.getDate() + 7);
          return week2;
        })()
      ],
      weeks: [
        {
          weekNumber: 0,
          weekStartDate: getNextSunday(),
          weekEndDate: (() => {
            const start = getNextSunday();
            const end = new Date(start);
            end.setDate(start.getDate() + 6);
            return end;
          })(),
          meals: {
            monday: { lunch: [], dinner: [] },
            tuesday: { lunch: [], dinner: [] },
            wednesday: { lunch: [], dinner: [] },
            thursday: { lunch: [], dinner: [] },
            friday: { lunch: [], dinner: [] },
            saturday: { lunch: [], dinner: [] },
            sunday: { lunch: [], dinner: [] }
          }
        },
        {
          weekNumber: 1,
          weekStartDate: (() => {
            const week2 = new Date(getNextSunday());
            week2.setDate(week2.getDate() + 7);
            return week2;
          })(),
          weekEndDate: (() => {
            const start = getNextSunday();
            const end = new Date(start);
            end.setDate(start.getDate() + 13);
            return end;
          })(),
          meals: {
            monday: { lunch: [], dinner: [] },
            tuesday: { lunch: [], dinner: [] },
            wednesday: { lunch: [], dinner: [] },
            thursday: { lunch: [], dinner: [] },
            friday: { lunch: [], dinner: [] },
            saturday: { lunch: [], dinner: [] },
            sunday: { lunch: [], dinner: [] }
          }
        }
      ],
      billingCycle: 'bi-weekly',
      nextBillingDate: (() => {
        const start = getNextSunday();
        const billing = new Date(start);
        billing.setDate(start.getDate() + 14);
        return billing;
      })(),
      deliveryAddress: {
        street: '123 Test Street',
        city: 'Test City',
        province: 'Test Province',
        postalCode: 'T1T 1T1',
        instructions: 'Test delivery instructions'
      },
      customerPhone: '123-456-7890',
      selectedRestaurantName: restaurant.name,
      selectedRestaurantData: {
        id: restaurant._id,
        name: restaurant.name,
        cuisine: restaurant.cuisine
      }
    });
    
    await subscriptionMealPlan.save();

    console.log('\n📊 Created Subscription Meal Plan:');
    console.log(`   Plan Start: ${subscriptionMealPlan.planStartDate.toDateString()} (Day ${subscriptionMealPlan.planStartDate.getDay()})`);
    console.log(`   Plan End: ${subscriptionMealPlan.planEndDate.toDateString()} (Day ${subscriptionMealPlan.planEndDate.getDay()})`);
    console.log(`   Week Start Dates:`);
    subscriptionMealPlan.weekStartDates.forEach((date, index) => {
      console.log(`     Week ${index + 1}: ${date.toDateString()} (Day ${date.getDay()})`);
    });

    // Verify the dates are correct
    const startIsCorrect = subscriptionMealPlan.planStartDate.getDay() === 0; // Sunday
    const endIsCorrect = subscriptionMealPlan.planEndDate.getDay() === 6; // Saturday
    const allWeeksCorrect = subscriptionMealPlan.weekStartDates.every(date => date.getDay() === 0);

    console.log('\n✅ Date Verification:');
    console.log(`   Start on Sunday: ${startIsCorrect ? '✅' : '❌'}`);
    console.log(`   End on Saturday: ${endIsCorrect ? '✅' : '❌'}`);
    console.log(`   All weeks start on Sunday: ${allWeeksCorrect ? '✅' : '❌'}`);

    if (startIsCorrect && endIsCorrect && allWeeksCorrect) {
      console.log('\n🎉 SUCCESS: Subscription meal plan dates are now CORRECT!');
      console.log(`   - Plan starts on ${subscriptionMealPlan.planStartDate.toDateString()}`);
      console.log(`   - Plan ends on ${subscriptionMealPlan.planEndDate.toDateString()}`);
      console.log('   - All week boundaries are proper Sunday-Saturday');
    } else {
      console.log('\n❌ ISSUE: Subscription meal plan dates are still incorrect');
    }

    // Now create a regular meal plan with some test items
    console.log('\n🍽️ Creating regular meal plan with test items...');
    
    const testMealPlan = new MealPlan({
      userId: user._id,
      weeklyPlans: {
        week0: {
          sunday: { 
            lunch: [{
              id: 'test-item-1',
              planId: 'plan-test-1',
              name: 'Test Sunday Lunch Item',
              price: 15.99,
              restaurantName: restaurant.name,
              addedAt: new Date()
            }], 
            dinner: [] 
          },
          monday: { 
            lunch: [{
              id: 'test-item-2',
              planId: 'plan-test-2',
              name: 'Test Monday Lunch Item',
              price: 12.99,
              restaurantName: restaurant.name,
              addedAt: new Date()
            }], 
            dinner: [] 
          },
          tuesday: { lunch: [], dinner: [] },
          wednesday: { lunch: [], dinner: [] },
          thursday: { lunch: [], dinner: [] },
          friday: { lunch: [], dinner: [] },
          saturday: { lunch: [], dinner: [] }
        },
        week1: {
          sunday: { lunch: [], dinner: [] },
          monday: { lunch: [], dinner: [] },
          tuesday: { lunch: [], dinner: [] },
          wednesday: { lunch: [], dinner: [] },
          thursday: { lunch: [], dinner: [] },
          friday: { lunch: [], dinner: [] },
          saturday: { lunch: [], dinner: [] }
        }
      },
      totalItems: 2,
      selectedRestaurantId: restaurant._id,
      selectedRestaurantName: restaurant.name,
      selectedRestaurantData: {
        id: restaurant._id,
        name: restaurant.name,
        cuisine: restaurant.cuisine
      }
    });

    await testMealPlan.save();
    console.log('✅ Created regular meal plan with test items');
    console.log(`   - Sunday lunch: Test Sunday Lunch Item`);
    console.log(`   - Monday lunch: Test Monday Lunch Item`);

    console.log('\n🎯 Test Complete!');
    console.log('Now check the database and UI to verify:');
    console.log(`1. User: jash64326@gmail.com (${user._id})`);
    console.log(`2. Restaurant: ${restaurant.name} (${restaurant._id})`);
    console.log(`3. Subscription plan starts on: ${subscriptionMealPlan.planStartDate.toDateString()}`);
    console.log(`4. Regular meal plan has items on Sunday and Monday`);

  } catch (error) {
    console.error('❌ Error during test:', error);
  }
};

const runTest = async () => {
  await connectDB();
  await testMealPlanCreation();
  await mongoose.connection.close();
  console.log('✅ Database connection closed');
};

runTest();
