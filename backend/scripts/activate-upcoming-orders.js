// FILE: scripts/activate-upcoming-orders.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const { manualActivateOrdersForDate } = require('../src/services/orderActivationService');

/**
 * Activate orders for upcoming dates to make them visible in UI
 */
async function activateUpcomingOrders() {
  try {
    console.log('🔄 ACTIVATING UPCOMING ORDERS FOR UI TESTING');
    console.log('=' .repeat(50));
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    
    // Activate orders for next few days to make them visible
    const datesToActivate = [
      '2025-10-19', // Sunday
      '2025-10-20', // Monday  
      '2025-11-01', // Friday (next week)
      '2025-11-02'  // Saturday (next week)
    ];
    
    let totalActivated = 0;
    
    for (const dateStr of datesToActivate) {
      console.log(`\n🔄 Activating orders for ${dateStr}...`);
      const activatedCount = await manualActivateOrdersForDate(new Date(dateStr));
      console.log(`✅ Activated ${activatedCount} orders for ${dateStr}`);
      totalActivated += activatedCount;
    }
    
    console.log(`\n🎉 TOTAL ACTIVATED: ${totalActivated} orders`);
    console.log('\n📅 Now the Partner Portal should show orders on:');
    console.log('   - Oct 18: 2 orders (already activated)');
    console.log('   - Oct 19: Orders (newly activated)');
    console.log('   - Oct 20: Orders (newly activated)');
    console.log('   - Nov 1: Orders (newly activated)');
    console.log('   - Nov 2: Orders (newly activated)');
    
    console.log('\n💡 UI TESTING TIPS:');
    console.log('   1. Login to Partner Portal');
    console.log('   2. Check Orders page');
    console.log('   3. Look for orders on Oct 18-20');
    console.log('   4. If still not showing, check UI date range settings');
    
  } catch (error) {
    console.error('💥 Activation failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the activation
activateUpcomingOrders();
