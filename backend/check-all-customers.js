// Script to check all customers and their orders for the restaurant
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./src/models/User');
const Order = require('./src/models/Order');

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

async function checkAllCustomers() {
  await connectDB();
  
  try {
    const restaurantId = '68e73d168c18e7fd776a6327';
    
    console.log('🔍 Checking all customers and orders for restaurant...');
    console.log('=' .repeat(60));

    // Get all orders for this restaurant
    const allOrders = await Order.find({ 
      restaurantId: new mongoose.Types.ObjectId(restaurantId) 
    }).sort({ createdAt: -1 });

    console.log(`📦 Total Orders for Restaurant: ${allOrders.length}`);

    // Group orders by customer
    const customerOrderMap = {};
    
    for (const order of allOrders) {
      const customerId = order.customerId.toString();
      if (!customerOrderMap[customerId]) {
        customerOrderMap[customerId] = [];
      }
      customerOrderMap[customerId].push(order);
    }

    console.log(`👥 Unique Customers: ${Object.keys(customerOrderMap).length}`);

    // Get customer details for each
    for (const [customerId, orders] of Object.entries(customerOrderMap)) {
      console.log(`\n👤 Customer ID: ${customerId}`);
      
      try {
        const customer = await User.findById(customerId);
        if (customer) {
          console.log(`   Name: ${customer.firstName} ${customer.lastName}`);
          console.log(`   Email: ${customer.email}`);
          console.log(`   Phone: ${customer.phoneNumber || 'N/A'}`);
        } else {
          console.log(`   ❌ Customer not found in Users collection`);
        }
      } catch (error) {
        console.log(`   ❌ Error fetching customer: ${error.message}`);
      }
      
      console.log(`   Orders: ${orders.length}`);
      console.log(`   Total Spent: $${orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}`);
      
      // Show recent orders
      console.log(`   Recent Orders:`);
      orders.slice(0, 3).forEach((order, index) => {
        console.log(`     ${index + 1}. ${order.orderNumber} - $${order.total} - ${order.status} - ${order.createdAt.toDateString()}`);
      });
      
      console.log('   ---');
    }

    // Check if Emma Thompson exists
    console.log('\n🔍 Checking for Emma Thompson specifically...');
    const emma = await User.findOne({ email: 'emma.thompson@example.com' });
    
    if (emma) {
      console.log(`✅ Emma found: ${emma.firstName} ${emma.lastName}`);
      console.log(`   ID: ${emma._id}`);
      console.log(`   Email: ${emma.email}`);
      
      const emmaOrders = await Order.find({ customerId: emma._id });
      console.log(`   Emma's Orders: ${emmaOrders.length}`);
      
      if (emmaOrders.length > 0) {
        emmaOrders.forEach((order, index) => {
          console.log(`     ${index + 1}. ${order.orderNumber} - $${order.total} - ${order.status} - ${order.scheduledDate?.toDateString() || order.createdAt.toDateString()}`);
        });
      }
    } else {
      console.log(`❌ Emma Thompson not found`);
    }

    // Check the original customer
    console.log('\n🔍 Checking for original customer (2022cse.r234@svce.edu.in)...');
    const originalCustomer = await User.findOne({ email: '2022cse.r234@svce.edu.in' });
    
    if (originalCustomer) {
      console.log(`✅ Original customer found: ${originalCustomer.firstName} ${originalCustomer.lastName}`);
      console.log(`   ID: ${originalCustomer._id}`);
      
      const originalOrders = await Order.find({ customerId: originalCustomer._id });
      console.log(`   Original customer's Orders: ${originalOrders.length}`);
    } else {
      console.log(`❌ Original customer not found`);
    }

    console.log('\n✅ Customer check complete!');
    
  } catch (error) {
    console.error('❌ Error checking customers:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkAllCustomers();
