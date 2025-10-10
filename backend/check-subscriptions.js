const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/grub-gate', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const SubscriptionMealPlan = require('./src/models/SubscriptionMealPlan');

async function checkSubscriptions() {
  try {
    console.log('🔍 CHECKING ALL SUBSCRIPTIONS');
    console.log('=============================');

    const subscriptions = await SubscriptionMealPlan.find({}).limit(10);
    
    console.log(`Found ${subscriptions.length} subscriptions:`);
    
    subscriptions.forEach((sub, index) => {
      console.log(`\n${index + 1}. ID: ${sub._id}`);
      console.log(`   Customer: ${sub.customerId}`);
      console.log(`   Restaurant: ${sub.restaurantId}`);
      console.log(`   Plan Start: ${sub.planStartDate.toDateString()} (Day ${sub.planStartDate.getDay()})`);
      console.log(`   Plan End: ${sub.planEndDate.toDateString()} (Day ${sub.planEndDate.getDay()})`);
      console.log(`   Status: ${sub.status}`);
      
      if (sub.weeks && sub.weeks.length > 0) {
        sub.weeks.forEach((week, weekIndex) => {
          console.log(`   Week ${week.weekNumber}: ${week.weekStartDate.toDateString()} (Day ${week.weekStartDate.getDay()}) to ${week.weekEndDate.toDateString()} (Day ${week.weekEndDate.getDay()})`);
        });
      }
    });

  } catch (error) {
    console.error('❌ Error checking subscriptions:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkSubscriptions();
