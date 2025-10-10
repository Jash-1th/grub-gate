// Script to check Emma Thompson's orders and menu items
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./src/models/User');
const Order = require('./src/models/Order');
const MenuItem = require('./src/models/MenuItem');

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

async function checkEmmaOrders() {
  await connectDB();
  
  try {
    const restaurantId = '68e73d168c18e7fd776a6327';
    
    console.log('🔍 Checking Emma Thompson\'s orders and menu items...');
    console.log('=' .repeat(60));

    // Find Emma Thompson
    const emma = await User.findOne({ 
      email: 'emma.thompson@example.com' 
    });

    if (!emma) {
      console.log('❌ Emma Thompson not found');
      return;
    }

    console.log(`👤 Found customer: ${emma.firstName} ${emma.lastName}`);
    console.log(`📧 Email: ${emma.email}`);
    console.log(`📞 Phone: ${emma.phoneNumber}`);

    // Get Emma's orders
    const emmaOrders = await Order.find({ 
      customerId: emma._id 
    }).sort({ scheduledDate: 1 });

    console.log(`\n📦 Emma's Orders (${emmaOrders.length} total):`);
    console.log('=' .repeat(60));

    if (emmaOrders.length === 0) {
      console.log('❌ No orders found for Emma');
      return;
    }

    for (let i = 0; i < emmaOrders.length; i++) {
      const order = emmaOrders[i];
      console.log(`\n📋 Order ${i + 1}:`);
      console.log(`   Order Number: ${order.orderNumber}`);
      console.log(`   Scheduled Date: ${order.scheduledDate.toDateString()}`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Payment Status: ${order.paymentStatus}`);
      console.log(`   Total: $${order.total}`);
      console.log(`   Meal Type: ${order.mealType}`);
      
      console.log(`   Items:`);
      order.items.forEach((item, itemIndex) => {
        console.log(`     ${itemIndex + 1}. ${item.name}`);
        console.log(`        Price: $${item.price}`);
        console.log(`        Quantity: ${item.quantity}`);
        if (item.specialInstructions) {
          console.log(`        Special Instructions: ${item.specialInstructions}`);
        }
      });
      
      if (order.specialInstructions) {
        console.log(`   Order Instructions: ${order.specialInstructions}`);
      }
      if (order.notes) {
        console.log(`   Notes: ${order.notes}`);
      }
    }

    // Get all menu items for this restaurant to show what's available
    console.log(`\n🍽️ Available Menu Items for Restaurant ${restaurantId}:`);
    console.log('=' .repeat(60));
    
    const menuItems = await MenuItem.find({ 
      restaurantId: new mongoose.Types.ObjectId(restaurantId),
      status: 'available'
    }).sort({ name: 1 });

    if (menuItems.length === 0) {
      console.log('❌ No menu items found for this restaurant');
    } else {
      menuItems.forEach((item, index) => {
        console.log(`${index + 1}. ${item.name}`);
        console.log(`   Price: $${item.price}`);
        console.log(`   Category: ${item.category || 'N/A'}`);
        console.log(`   Description: ${item.description || 'N/A'}`);
        console.log(`   Status: ${item.status}`);
        console.log('   ---');
      });
    }

    // Summary
    console.log('\n📊 Summary:');
    console.log('=' .repeat(60));
    console.log(`👤 Customer: ${emma.firstName} ${emma.lastName}`);
    console.log(`📦 Total Orders: ${emmaOrders.length}`);
    console.log(`💰 Total Spent: $${emmaOrders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}`);
    console.log(`📅 Order Date Range: ${emmaOrders[0]?.scheduledDate.toDateString()} to ${emmaOrders[emmaOrders.length - 1]?.scheduledDate.toDateString()}`);
    console.log(`🍽️ Available Menu Items: ${menuItems.length}`);
    
    console.log('\n✅ Order check complete!');
    
  } catch (error) {
    console.error('❌ Error checking orders:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkEmmaOrders();
