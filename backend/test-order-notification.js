/**
 * Test script to simulate order status update and trigger notification
 * This script will:
 * 1. Find or create a test order for the logged-in customer
 * 2. Update the order status
 * 3. Trigger a push notification to the customer
 * 
 * Run from backend directory: cd backend && node ../test-order-notification.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Import models (adjust paths as needed)
const User = require('./src/models/User');
const Order = require('./src/models/Order');
const Restaurant = require('./src/models/Restaurant');
const pushNotificationService = require('./src/services/pushNotificationService');

async function testOrderNotification() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find the customer (Mamilla Jaswanth from the logs)
    const customer = await User.findOne({ 
      email: '2022cse.r234@svce.edu.in' 
    });

    if (!customer) {
      console.log('❌ Customer not found');
      process.exit(1);
    }

    console.log(`✅ Found customer: ${customer.firstName} ${customer.lastName}`);
    console.log(`📧 Email: ${customer.email}`);
    console.log(`🔑 User ID: ${customer._id}`);
    console.log(`📱 FCM Tokens: ${customer.fcmTokens?.length || 0}\n`);

    if (!customer.fcmTokens || customer.fcmTokens.length === 0) {
      console.log('⚠️  Customer has no FCM tokens registered');
      console.log('💡 Please enable push notifications in the customer app first!\n');
      process.exit(0);
    }

    // Find a restaurant
    const restaurant = await Restaurant.findOne();
    if (!restaurant) {
      console.log('❌ No restaurant found');
      process.exit(1);
    }

    console.log(`🏪 Using restaurant: ${restaurant.name}\n`);

    // Find or create a test order
    let order = await Order.findOne({
      customerId: customer._id,
      restaurantId: restaurant._id
    }).sort({ createdAt: -1 });

    if (!order) {
      console.log('📝 Creating a test order...');
      
      const now = new Date();
      const scheduledDate = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
      const activationDate = new Date(now.getTime() + 30 * 60 * 1000); // 30 mins from now
      
      order = await Order.create({
        customerId: customer._id,
        restaurantId: restaurant._id,
        orderNumber: 'TEST-' + Date.now().toString().slice(-6),
        type: 'single',
        items: [
          {
            menuItemId: new mongoose.Types.ObjectId(),
            name: 'Test Burger',
            quantity: 2,
            price: 15.99
          }
        ],
        subtotal: 31.98,
        deliveryFee: 5.00,
        tax: 3.00,
        total: 39.98,
        status: 'pending',
        paymentStatus: 'paid',
        paymentMethod: 'card',
        scheduledDate,
        activationDate,
        deliveryAddress: {
          street: customer.addresses[0]?.street || '123 Test St',
          city: customer.addresses[0]?.city || 'Test City',
          province: customer.addresses[0]?.province || 'Test Province',
          postalCode: customer.addresses[0]?.postalCode || '12345'
        }
      });
      console.log(`✅ Created test order #${order.orderNumber}\n`);
    } else {
      console.log(`✅ Found existing order #${order.orderNumber || order._id.toString().slice(-6)}\n`);
    }

    // Update order status to trigger notification
    const previousStatus = order.status;
    const newStatus = previousStatus === 'pending' ? 'confirmed' : 'preparing';
    
    console.log(`📤 Updating order status: ${previousStatus} → ${newStatus}`);
    
    order.status = newStatus;
    order.updatedAt = new Date();
    
    if (!order.statusHistory) {
      order.statusHistory = [];
    }
    order.statusHistory.push({
      status: newStatus,
      timestamp: new Date(),
      notes: 'Test status update'
    });
    
    await order.save();
    console.log('✅ Order status updated in database\n');

    // Send push notification
    console.log('🔔 Sending push notification to customer...');
    
    const orderNumber = order.orderNumber || order._id.toString().slice(-6);
    const notificationType = 'ORDER_CONFIRMED';
    const customData = {
      orderNumber,
      orderId: order._id.toString(),
      restaurantName: restaurant.name,
      previousStatus,
      newStatus
    };

    const notification = pushNotificationService.getNotificationTemplate(
      notificationType,
      customData
    );

    if (notification) {
      const result = await pushNotificationService.sendToUser(
        customer._id,
        notification,
        customData
      );

      if (result.success) {
        console.log('✅ Notification sent successfully!');
        console.log(`📊 Success: ${result.successCount || 1}, Failed: ${result.failureCount || 0}\n`);
        
        console.log('🎉 TEST COMPLETE!');
        console.log('📱 Check your browser for the notification!\n');
      } else {
        console.log('❌ Failed to send notification:', result.error);
      }
    } else {
      console.log('❌ No notification template found for:', notificationType);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the test
testOrderNotification();
