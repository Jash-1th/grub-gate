// FILE: test-create-new-subscription.js
/**
 * Test creating a new subscription to verify new logic works
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./src/models/User');
const Restaurant = require('./src/models/Restaurant');
const SubscriptionMealPlan = require('./src/models/SubscriptionMealPlan');
const { getSubscriptionStartSunday } = require('./src/utils/dateHelpers');

async function createNewSubscriptionTest() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    
    console.log('🧪 TESTING NEW SUBSCRIPTION CREATION');
    console.log('='.repeat(50));
    
    // Find existing user and restaurant
    const customer = await User.findOne({ email: '2022cse.r234@svce.edu.in' });
    const restaurant = await Restaurant.findOne({ name: 'xyz' });
    
    if (!customer || !restaurant) {
      console.log('❌ Customer or restaurant not found');
      return;
    }
    
    console.log('👤 Customer:', customer.firstName, customer.lastName);
    console.log('🏪 Restaurant:', restaurant.name);
    
    // Test what new subscription would look like (without actually creating)
    const today = new Date();
    const newStartDate = getSubscriptionStartSunday(today);
    const newEndDate = new Date(newStartDate);
    newEndDate.setDate(newStartDate.getDate() + 13); // Bi-weekly
    
    console.log('\n📅 NEW SUBSCRIPTION WOULD BE:');
    console.log('  Today:', today.toDateString());
    console.log('  Start Date:', newStartDate.toDateString(), '(+7 days from today)');
    console.log('  End Date:', newEndDate.toDateString());
    console.log('  Planning Time: 7 days');
    
    console.log('\n🔍 COMPARISON WITH EXISTING:');
    const existingSub = await SubscriptionMealPlan.findOne({ 
      customerId: customer._id, 
      status: 'active' 
    });
    
    if (existingSub) {
      console.log('  Existing Start:', existingSub.planStartDate.toDateString());
      console.log('  New Logic Start:', newStartDate.toDateString());
      console.log('  Improvement: +7 days planning time');
    }
    
    console.log('\n🎯 TO ACTUALLY TEST:');
    console.log('1. Deactivate existing subscription');
    console.log('2. Create new subscription via API');
    console.log('3. Verify it starts on', newStartDate.toDateString());
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

createNewSubscriptionTest();
