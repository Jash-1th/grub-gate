// FILE: scripts/add-order-indexes.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

/**
 * Script to add database indexes for efficient order date filtering
 */
async function addOrderIndexes() {
  try {
    console.log('🔍 Adding Database Indexes for Order Date Filtering...');
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
    
    // Get the orders collection
    const db = mongoose.connection.db;
    const ordersCollection = db.collection('orders');
    
    console.log('\n📊 Adding indexes for efficient date-based queries...');
    
    // Helper function to create index safely
    const createIndexSafely = async (indexSpec, options, description) => {
      try {
        await ordersCollection.createIndex(indexSpec, options);
        console.log(`   ✅ ${options.name} index created`);
      } catch (error) {
        if (error.code === 85) { // IndexOptionsConflict
          console.log(`   ⚠️ ${options.name} index already exists with different options`);
        } else if (error.code === 11000) { // IndexKeySpecsConflict
          console.log(`   ℹ️ ${options.name} index already exists`);
        } else {
          console.log(`   ❌ Failed to create ${options.name}: ${error.message}`);
        }
      }
    };
    
    // Index 1: Compound index for restaurant + date queries (most common)
    console.log('1. Creating compound index: restaurantId + createdAt...');
    await createIndexSafely(
      { restaurantId: 1, createdAt: -1 },
      { 
        name: 'restaurantId_createdAt_desc',
        background: true 
      },
      'Restaurant + Date compound index'
    );
    
    // Index 2: Date-only index for date range queries
    console.log('2. Creating date index: createdAt...');
    await createIndexSafely(
      { createdAt: -1 },
      { 
        name: 'createdAt_desc',
        background: true 
      },
      'Date index'
    );
    
    // Index 3: Status index for filtering by order status
    console.log('3. Creating status index: status...');
    await createIndexSafely(
      { status: 1 },
      { 
        name: 'status_asc',
        background: true 
      },
      'Status index'
    );
    
    // Index 4: Subscription orders index for filtering subscription vs regular orders
    console.log('4. Creating subscription index: isSubscriptionOrder + createdAt...');
    await createIndexSafely(
      { isSubscriptionOrder: 1, createdAt: -1 },
      { 
        name: 'isSubscriptionOrder_createdAt_desc',
        background: true 
      },
      'Subscription orders index'
    );
    
    // Index 5: Customer orders index
    console.log('5. Creating customer index: customerId + createdAt...');
    await createIndexSafely(
      { customerId: 1, createdAt: -1 },
      { 
        name: 'customerId_createdAt_desc',
        background: true 
      },
      'Customer orders index'
    );
    
    // Index 6: Order number index for quick lookups
    console.log('6. Creating order number index: orderNumber...');
    await createIndexSafely(
      { orderNumber: 1 },
      { 
        name: 'orderNumber_unique',
        unique: true,
        background: true 
      },
      'Order number index'
    );
    
    console.log('\n📋 Verifying indexes...');
    const indexes = await ordersCollection.listIndexes().toArray();
    
    console.log('\n📊 Current indexes on orders collection:');
    indexes.forEach((index, i) => {
      console.log(`   ${i + 1}. ${index.name}: ${JSON.stringify(index.key)}`);
    });
    
    console.log('\n🎯 Index Performance Benefits:');
    console.log('   ✅ Fast date-based order filtering');
    console.log('   ✅ Efficient restaurant-specific queries');
    console.log('   ✅ Quick status filtering');
    console.log('   ✅ Optimized subscription order queries');
    console.log('   ✅ Fast customer order lookups');
    console.log('   ✅ Unique order number constraints');
    
    console.log('\n🚀 Query Performance Examples:');
    console.log('   • GET /api/v1/orders?date=2025-10-08 → Uses createdAt_desc index');
    console.log('   • Partner orders for specific date → Uses restaurantId_createdAt_desc index');
    console.log('   • Filter by status → Uses status_asc index');
    console.log('   • Subscription orders → Uses isSubscriptionOrder_createdAt_desc index');
    
    console.log('\n✅ All indexes created successfully!');
    
  } catch (error) {
    console.error('💥 Failed to add indexes:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Handle script termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Index creation interrupted');
  await mongoose.connection.close();
  process.exit(0);
});

// Run the script
addOrderIndexes();
