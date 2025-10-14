require('dotenv').config();
const mongoose = require('mongoose');
const UserMealCalendar = require('./src/models/UserMealCalendar');
const SubscriptionMealPlan = require('./src/models/SubscriptionMealPlan');
const MealPlan = require('./src/models/MealPlan');

// Connect to MongoDB using .env
const mongoUrl = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/grubgate';
console.log('🔗 Connecting to MongoDB:', mongoUrl);

mongoose.connect(mongoUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function createTestMealCalendar() {
  try {
    const userId = '68e7578c70b1ebbce509b69c'; // Your user ID from logs
    
    console.log('🔍 Checking for existing subscription meal plan...');
    
    // Find user's subscription meal plan
    const subscriptionMealPlan = await SubscriptionMealPlan.findOne({ 
      customerId: userId 
    }).sort({ createdAt: -1 });
    
    if (!subscriptionMealPlan) {
      console.log('❌ No subscription meal plan found for user');
      return;
    }
    
    console.log('✅ Found subscription meal plan:', subscriptionMealPlan._id);
    
    // Delete existing meal calendar if it exists (to recreate with current dates)
    const existingCalendar = await UserMealCalendar.findOne({ userId });
    if (existingCalendar) {
      console.log('🗑️ Deleting existing meal calendar:', existingCalendar._id);
      await UserMealCalendar.deleteOne({ userId });
    }
    
    // Find user's meal plan
    const userMealPlan = await MealPlan.findOne({ userId });
    
    // Create sample calendar entries based on subscription (current dates)
    const startDate = new Date(); // Today
    startDate.setHours(0, 0, 0, 0); // Start of today
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 14); // 2 weeks from today
    
    const calendarEntries = [];
    
    // Create sample meals for 2 weeks
    const mealTypes = ['lunch', 'dinner'];
    const sampleMeals = [
      'Chicken Biryani',
      'Fish Curry',
      'Mutton Curry', 
      'Paneer Butter Masala',
      'Dal Makhani',
      'Butter Chicken'
    ];
    
    let currentDate = new Date(startDate);
    let mealIndex = 0;
    
    while (currentDate <= endDate) {
      // Create meals for all days (not just Sundays)
      for (const mealType of mealTypes) {
        calendarEntries.push({
          date: new Date(currentDate),
          mealType: mealType,
          mealName: sampleMeals[mealIndex % sampleMeals.length],
          restaurantId: subscriptionMealPlan.restaurantId,
          status: 'scheduled',
          deliveryTime: {
            start: mealType === 'lunch' ? '12:00' : '19:00',
            end: mealType === 'lunch' ? '13:00' : '20:00'
          }
        });
        mealIndex++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Create the meal calendar
    const mealCalendar = new UserMealCalendar({
      userId: userId,
      subscriptionId: subscriptionMealPlan._id,
      weeklyPlanId: userMealPlan?._id,
      calendarEntries: calendarEntries,
      subscriptionPeriod: {
        startDate: startDate,
        endDate: endDate,
        planType: 'bi-weekly'
      },
      isActive: true,
      metadata: {
        totalCost: 500,
        currency: 'USD',
        timezone: 'UTC'
      }
    });
    
    await mealCalendar.save();
    
    console.log('✅ Created meal calendar successfully!');
    console.log('📅 Calendar ID:', mealCalendar._id);
    console.log('🍽️ Total meals:', calendarEntries.length);
    console.log('📊 Progress:', mealCalendar.progressPercentage + '%');
    
  } catch (error) {
    console.error('❌ Error creating meal calendar:', error);
  } finally {
    mongoose.connection.close();
  }
}

createTestMealCalendar();
