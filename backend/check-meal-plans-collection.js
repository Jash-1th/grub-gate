// Script to check meal plans collection for specific user
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./src/models/User');
const SubscriptionMealPlan = require('./src/models/SubscriptionMealPlan');

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

async function checkMealPlansCollection() {
  await connectDB();
  
  try {
    const userId = '68e7b7ea4a70ed31cffb3fe9';
    
    console.log('🔍 Checking Meal Plans Collection');
    console.log('=' .repeat(60));
    console.log(`👤 User ID: ${userId}`);

    // First verify user exists
    const user = await User.findById(userId);
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log(`📧 User: ${user.firstName} ${user.lastName} (${user.email})`);

    // Check meal plans collection directly
    console.log('\n📋 Searching SubscriptionMealPlan collection...');
    
    // Method 1: Direct query by customerId
    const mealPlans1 = await SubscriptionMealPlan.find({ customerId: userId });
    console.log(`Method 1 - String ID: Found ${mealPlans1.length} meal plans`);

    // Method 2: Query by ObjectId
    const mealPlans2 = await SubscriptionMealPlan.find({ customerId: new mongoose.Types.ObjectId(userId) });
    console.log(`Method 2 - ObjectId: Found ${mealPlans2.length} meal plans`);

    // Method 3: Get all meal plans and filter
    const allMealPlans = await SubscriptionMealPlan.find({});
    console.log(`\n📊 Total meal plans in collection: ${allMealPlans.length}`);
    
    const userMealPlans = allMealPlans.filter(plan => 
      plan.customerId.toString() === userId
    );
    console.log(`Method 3 - Filter: Found ${userMealPlans.length} meal plans for this user`);

    // Show all meal plans for debugging
    if (allMealPlans.length > 0) {
      console.log('\n📋 All Meal Plans in Collection:');
      allMealPlans.forEach((plan, index) => {
        console.log(`   ${index + 1}. Customer ID: ${plan.customerId}`);
        console.log(`      Plan Type: ${plan.planType}`);
        console.log(`      Status: ${plan.status}`);
        console.log(`      Created: ${plan.createdAt?.toDateString()}`);
        console.log(`      Start: ${plan.planStartDate?.toDateString()}`);
        console.log(`      End: ${plan.planEndDate?.toDateString()}`);
        console.log(`      Weeks: ${plan.weeks?.length || 0}`);
        console.log('      ---');
      });
    }

    // Check if any meal plans match our user
    const matchingPlans = mealPlans1.length > 0 ? mealPlans1 : mealPlans2.length > 0 ? mealPlans2 : userMealPlans;
    
    if (matchingPlans.length > 0) {
      console.log(`\n🚨 FOUND ${matchingPlans.length} MEAL PLAN(S) FOR USER!`);
      
      matchingPlans.forEach((plan, index) => {
        console.log(`\n📋 Meal Plan ${index + 1} Details:`);
        console.log(`   ID: ${plan._id}`);
        console.log(`   Customer ID: ${plan.customerId}`);
        console.log(`   Restaurant ID: ${plan.restaurantId}`);
        console.log(`   Plan Type: ${plan.planType}`);
        console.log(`   Status: ${plan.status}`);
        console.log(`   Start Date: ${plan.planStartDate?.toDateString()}`);
        console.log(`   End Date: ${plan.planEndDate?.toDateString()}`);
        console.log(`   Created: ${plan.createdAt?.toDateString()}`);
        console.log(`   Updated: ${plan.updatedAt?.toDateString()}`);
        
        if (plan.weeks && plan.weeks.length > 0) {
          console.log(`   Weeks (${plan.weeks.length}):`);
          plan.weeks.forEach((week, weekIndex) => {
            console.log(`     Week ${weekIndex + 1}: ${week.weekStartDate?.toDateString()} - ${week.weekEndDate?.toDateString()}`);
            
            if (week.meals) {
              const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
              let weekHasMeals = false;
              
              daysOfWeek.forEach(day => {
                const dayMeals = week.meals[day];
                if (dayMeals) {
                  const lunchCount = dayMeals.lunch?.length || 0;
                  const dinnerCount = dayMeals.dinner?.length || 0;
                  
                  if (lunchCount > 0 || dinnerCount > 0) {
                    weekHasMeals = true;
                    console.log(`       ${day}: ${lunchCount} lunch, ${dinnerCount} dinner`);
                    
                    // Show meal details
                    if (lunchCount > 0) {
                      dayMeals.lunch.forEach((meal, mealIndex) => {
                        console.log(`         L${mealIndex + 1}: ${meal.name || 'Unknown'} - $${meal.price || 0}`);
                      });
                    }
                    if (dinnerCount > 0) {
                      dayMeals.dinner.forEach((meal, mealIndex) => {
                        console.log(`         D${mealIndex + 1}: ${meal.name || 'Unknown'} - $${meal.price || 0}`);
                      });
                    }
                  }
                }
              });
              
              if (!weekHasMeals) {
                console.log(`       (No meals selected for this week)`);
              }
            }
          });
        }
      });
      
      console.log('\n🚨 ISSUE IDENTIFIED:');
      console.log('The meal plan(s) still exist in the database!');
      console.log('This explains why the UI is showing selected items.');
      console.log('The deletion script may not have worked completely.');
      
    } else {
      console.log('\n✅ No meal plans found for this user');
      console.log('Database is clean as expected');
    }

    // Check collection indexes
    console.log('\n🔍 Collection Indexes:');
    const indexes = await SubscriptionMealPlan.collection.getIndexes();
    Object.keys(indexes).forEach(indexName => {
      console.log(`   ${indexName}: ${JSON.stringify(indexes[indexName])}`);
    });
    
  } catch (error) {
    console.error('❌ Error checking meal plans collection:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkMealPlansCollection();
