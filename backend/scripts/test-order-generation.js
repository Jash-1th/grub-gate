// FILE: scripts/test-order-generation.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const { generateDailyOrders } = require('../src/services/orderGenerationService');

/**
 * Test script to manually trigger order generation
 * Usage: node scripts/test-order-generation.js
 */
async function testOrderGeneration() {
  try {
    console.log('🚀 Starting order generation test...');
    console.log('📅 Date:', new Date().toDateString());
    
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
    
    // Run order generation
    const result = await generateDailyOrders();
    
    console.log('\n📊 Order Generation Results:');
    console.log('='.repeat(50));
    
    if (result.success) {
      console.log(`✅ Success: ${result.totalOrdersCreated} orders created`);
      console.log(`📦 Subscription Orders: ${result.subscriptionOrders}`);
      console.log(`🍽️ Meal Plan Orders: ${result.mealPlanOrders}`);
      
      if (result.errors && result.errors.length > 0) {
        console.log(`⚠️ Errors encountered: ${result.errors.length}`);
        result.errors.forEach((error, index) => {
          console.log(`   ${index + 1}. ${error.error || error}`);
        });
      }
    } else {
      console.log(`❌ Failed: ${result.error}`);
    }
    
    console.log(`⏰ Completed at: ${result.timestamp}`);
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('💥 Fatal error:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Handle script termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Script interrupted');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('unhandledRejection', async (err) => {
  console.error('💥 Unhandled Promise Rejection:', err);
  await mongoose.connection.close();
  process.exit(1);
});

// Run the test
testOrderGeneration();
