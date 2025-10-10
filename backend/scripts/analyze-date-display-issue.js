// FILE: scripts/analyze-date-display-issue.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const Order = require('../src/models/Order');
const Restaurant = require('../src/models/Restaurant');

/**
 * Analyze the date display issue - Oct 18 orders showing on Oct 19
 */
async function analyzeDateDisplayIssue() {
  try {
    console.log('🔍 ANALYZING DATE DISPLAY ISSUE');
    console.log('=' .repeat(60));
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    
    const partnerId = '68e73d158c18e7fd776a6325';
    
    // Get restaurant
    const restaurant = await Restaurant.findOne({ 
      $or: [
        { partnerId: partnerId },
        { ownerId: partnerId }
      ]
    });
    
    console.log(`🏪 Restaurant: ${restaurant.name}`);
    
    // Get the problematic orders (Oct 18 orders)
    const oct18Orders = await Order.find({
      restaurantId: restaurant._id,
      scheduledDate: {
        $gte: new Date('2025-10-18T00:00:00.000Z'),
        $lt: new Date('2025-10-19T00:00:00.000Z')
      }
    }).sort({ scheduledDate: 1 });
    
    console.log(`\n📊 Found ${oct18Orders.length} orders for Oct 18:`);
    console.log('-' .repeat(50));
    
    oct18Orders.forEach((order, index) => {
      const scheduledDate = new Date(order.scheduledDate);
      const deliveryDate = new Date(order.deliveryTime.estimated);
      
      console.log(`\n${index + 1}. Order: ${order.orderNumber}`);
      console.log(`   Meal Type: ${order.mealType}`);
      console.log(`   Status: ${order.status}`);
      
      // Raw database values
      console.log('\n   📅 RAW DATABASE VALUES:');
      console.log(`   scheduledDate: ${order.scheduledDate.toISOString()}`);
      console.log(`   deliveryTime.estimated: ${order.deliveryTime.estimated.toISOString()}`);
      
      // Date object analysis
      console.log('\n   🔍 DATE OBJECT ANALYSIS:');
      console.log(`   scheduledDate object: ${scheduledDate}`);
      console.log(`   deliveryTime object: ${deliveryDate}`);
      
      // Different date representations
      console.log('\n   📋 DATE REPRESENTATIONS:');
      console.log(`   scheduledDate.toISOString(): ${scheduledDate.toISOString()}`);
      console.log(`   scheduledDate.toDateString(): ${scheduledDate.toDateString()}`);
      console.log(`   scheduledDate.toLocaleDateString(): ${scheduledDate.toLocaleDateString()}`);
      console.log(`   scheduledDate.toLocaleDateString('en-IN'): ${scheduledDate.toLocaleDateString('en-IN')}`);
      
      console.log(`   deliveryTime.toISOString(): ${deliveryDate.toISOString()}`);
      console.log(`   deliveryTime.toDateString(): ${deliveryDate.toDateString()}`);
      console.log(`   deliveryTime.toLocaleDateString(): ${deliveryDate.toLocaleDateString()}`);
      console.log(`   deliveryTime.toLocaleDateString('en-IN'): ${deliveryDate.toLocaleDateString('en-IN')}`);
      
      // UTC vs Local time analysis
      console.log('\n   ⏰ TIME ZONE ANALYSIS:');
      console.log(`   scheduledDate UTC: ${scheduledDate.getUTCFullYear()}-${String(scheduledDate.getUTCMonth() + 1).padStart(2, '0')}-${String(scheduledDate.getUTCDate()).padStart(2, '0')}`);
      console.log(`   scheduledDate Local: ${scheduledDate.getFullYear()}-${String(scheduledDate.getMonth() + 1).padStart(2, '0')}-${String(scheduledDate.getDate()).padStart(2, '0')}`);
      
      console.log(`   deliveryTime UTC: ${deliveryDate.getUTCFullYear()}-${String(deliveryDate.getUTCMonth() + 1).padStart(2, '0')}-${String(deliveryDate.getUTCDate()).padStart(2, '0')}`);
      console.log(`   deliveryTime Local: ${deliveryDate.getFullYear()}-${String(deliveryDate.getMonth() + 1).padStart(2, '0')}-${String(deliveryDate.getDate()).padStart(2, '0')}`);
      
      // Check if dates match
      const scheduledDateStr = scheduledDate.toISOString().split('T')[0];
      const deliveryDateStr = deliveryDate.toISOString().split('T')[0];
      const datesMatch = scheduledDateStr === deliveryDateStr;
      
      console.log('\n   ✅ DATE CONSISTENCY CHECK:');
      console.log(`   Scheduled Date: ${scheduledDateStr}`);
      console.log(`   Delivery Date: ${deliveryDateStr}`);
      console.log(`   Dates Match: ${datesMatch ? '✅' : '❌'}`);
      
      if (!datesMatch) {
        console.log('   ⚠️  INCONSISTENCY DETECTED!');
      }
    });
    
    // Test what the frontend might be doing
    console.log('\n🌐 FRONTEND DATE PROCESSING SIMULATION:');
    console.log('-' .repeat(50));
    
    if (oct18Orders.length > 0) {
      const testOrder = oct18Orders[0];
      const scheduledDate = new Date(testOrder.scheduledDate);
      const deliveryDate = new Date(testOrder.deliveryTime.estimated);
      
      console.log('\n📱 Common Frontend Date Processing:');
      
      // Scenario 1: Using scheduledDate
      console.log('\n1. Using scheduledDate:');
      console.log(`   new Date("${testOrder.scheduledDate.toISOString()}").toLocaleDateString() = ${new Date(testOrder.scheduledDate.toISOString()).toLocaleDateString()}`);
      console.log(`   new Date("${testOrder.scheduledDate.toISOString()}").toDateString() = ${new Date(testOrder.scheduledDate.toISOString()).toDateString()}`);
      
      // Scenario 2: Using deliveryTime.estimated
      console.log('\n2. Using deliveryTime.estimated:');
      console.log(`   new Date("${testOrder.deliveryTime.estimated.toISOString()}").toLocaleDateString() = ${new Date(testOrder.deliveryTime.estimated.toISOString()).toLocaleDateString()}`);
      console.log(`   new Date("${testOrder.deliveryTime.estimated.toISOString()}").toDateString() = ${new Date(testOrder.deliveryTime.estimated.toISOString()).toDateString()}`);
      
      // Scenario 3: Timezone conversion issues
      console.log('\n3. Potential Timezone Issues:');
      const utcDate = new Date(testOrder.scheduledDate.toISOString());
      const localDate = new Date(testOrder.scheduledDate);
      
      console.log(`   UTC interpretation: ${utcDate.toLocaleDateString()}`);
      console.log(`   Local interpretation: ${localDate.toLocaleDateString()}`);
      
      // Check if frontend is using deliveryTime instead of scheduledDate
      console.log('\n🎯 LIKELY FRONTEND ISSUE:');
      console.log('   If UI shows Oct 19 for Oct 18 orders, the frontend might be:');
      console.log('   1. Using deliveryTime.estimated instead of scheduledDate for display');
      console.log('   2. Converting UTC to local time incorrectly');
      console.log('   3. Adding timezone offset that shifts the date');
    }
    
    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    console.log('-' .repeat(30));
    console.log('1. Check which date field the frontend uses for display');
    console.log('2. Ensure frontend uses scheduledDate, not deliveryTime.estimated');
    console.log('3. Use date-only comparisons (YYYY-MM-DD) to avoid timezone issues');
    console.log('4. Consider storing dates as date-only strings if timezone is causing issues');
    
  } catch (error) {
    console.error('💥 Analysis failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the analysis
analyzeDateDisplayIssue();
