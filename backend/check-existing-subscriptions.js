/**
 * Check existing subscription meal plans for the user
 */

require('dotenv').config();
const mongoose = require('mongoose');
const SubscriptionMealPlan = require('./src/models/SubscriptionMealPlan');

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

const checkSubscriptions = async () => {
  try {
    console.log('🔍 Checking existing subscription meal plans...');
    console.log('=' .repeat(60));

    const userId = '68e7b7ea4a70ed31cffb3fe9';
    
    // Find all subscription meal plans for this user
    const subscriptions = await SubscriptionMealPlan.find({ customerId: userId });
    
    console.log(`Found ${subscriptions.length} subscription meal plans for user ${userId}:`);
    
    subscriptions.forEach((sub, index) => {
      console.log(`\n📋 Subscription ${index + 1}:`);
      console.log(`   ID: ${sub._id}`);
      console.log(`   Plan Start: ${sub.planStartDate.toISOString()} (${sub.planStartDate.toDateString()}, Day ${sub.planStartDate.getDay()})`);
      console.log(`   Plan End: ${sub.planEndDate.toISOString()} (${sub.planEndDate.toDateString()}, Day ${sub.planEndDate.getDay()})`);
      console.log(`   Status: ${sub.status}`);
      console.log(`   Created: ${sub.createdAt.toISOString()}`);
      console.log(`   Week Start Dates:`);
      sub.weekStartDates.forEach((date, weekIndex) => {
        console.log(`     Week ${weekIndex + 1}: ${date.toISOString()} (${date.toDateString()}, Day ${date.getDay()})`);
      });
      
      // Check if dates are correct
      const startCorrect = sub.planStartDate.getDay() === 0; // Sunday
      const endCorrect = sub.planEndDate.getDay() === 6; // Saturday
      const weeksCorrect = sub.weekStartDates.every(date => date.getDay() === 0);
      
      console.log(`   Date Verification:`);
      console.log(`     Start on Sunday: ${startCorrect ? '✅' : '❌'}`);
      console.log(`     End on Saturday: ${endCorrect ? '✅' : '❌'}`);
      console.log(`     All weeks start on Sunday: ${weeksCorrect ? '✅' : '❌'}`);
      
      if (!startCorrect || !endCorrect || !weeksCorrect) {
        console.log(`   🚨 This subscription has INCORRECT dates!`);
      } else {
        console.log(`   ✅ This subscription has CORRECT dates!`);
      }
    });
    
    // Show which one is the problematic one
    const problematicSubs = subscriptions.filter(sub => 
      sub.planStartDate.getDay() !== 0 || 
      sub.planEndDate.getDay() !== 6 ||
      !sub.weekStartDates.every(date => date.getDay() === 0)
    );
    
    if (problematicSubs.length > 0) {
      console.log(`\n🚨 Found ${problematicSubs.length} subscription(s) with incorrect dates:`);
      problematicSubs.forEach(sub => {
        console.log(`   - ${sub._id} (created: ${sub.createdAt.toDateString()})`);
      });
      
      console.log(`\n💡 Recommendation:`);
      console.log(`   1. Delete the old subscription(s) with incorrect dates`);
      console.log(`   2. Keep only the subscription(s) with correct Sunday-Saturday dates`);
      console.log(`   3. Or update the old subscription(s) to use correct dates`);
    } else {
      console.log(`\n✅ All subscriptions have correct dates!`);
    }

  } catch (error) {
    console.error('❌ Error checking subscriptions:', error);
  }
};

const runCheck = async () => {
  await connectDB();
  await checkSubscriptions();
  await mongoose.connection.close();
  console.log('\n✅ Database connection closed');
};

runCheck();
