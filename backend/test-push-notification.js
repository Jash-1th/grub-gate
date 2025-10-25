// FILE: test-push-notification.js
// Script to test push notification functionality

require('dotenv').config();
const mongoose = require('mongoose');
const pushNotificationService = require('./src/services/pushNotificationService');

async function testPushNotification() {
  try {
    console.log('🧪 Starting Push Notification Test...\n');

    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Import User model
    const User = require('./src/models/User');

    // Get a test user (customer with FCM tokens)
    console.log('👤 Finding test user with FCM tokens...');
    const testUser = await User.findOne({
      roles: 'customer',
      'fcmTokens.0': { $exists: true }
    });

    if (!testUser) {
      console.log('❌ No customer with FCM tokens found!');
      console.log('💡 Please:');
      console.log('   1. Log in to the Customer App');
      console.log('   2. Allow notification permission');
      console.log('   3. Run this test again\n');
      process.exit(1);
    }

    console.log(`✅ Found user: ${testUser.firstName} ${testUser.lastName}`);
    console.log(`   Email: ${testUser.email}`);
    console.log(`   FCM Tokens: ${testUser.fcmTokens.length}\n`);

    // Test 1: Send basic test notification
    console.log('📤 Test 1: Sending basic test notification...');
    const testNotification = {
      title: '🧪 Test Notification',
      body: 'This is a test notification from the backend!',
      icon: '/icons/logo192.png',
      badge: '/icons/logo192.png',
      data: {
        type: 'TEST',
        timestamp: new Date().toISOString()
      }
    };

    const result1 = await pushNotificationService.sendToUser(
      testUser._id,
      testNotification,
      { test: true }
    );

    if (result1.success) {
      console.log('✅ Test notification sent successfully!');
      console.log(`   Success: ${result1.successCount || 1}`);
      console.log(`   Failed: ${result1.failureCount || 0}\n`);
    } else {
      console.log('❌ Test notification failed:');
      console.log(`   Error: ${result1.error}\n`);
    }

    // Test 2: Send order confirmed notification
    console.log('📤 Test 2: Sending ORDER_CONFIRMED notification...');
    const orderNotification = pushNotificationService.getNotificationTemplate(
      'ORDER_CONFIRMED',
      {
        orderNumber: 'TEST123',
        orderId: 'test-order-id',
        restaurantName: 'Test Restaurant'
      }
    );

    const result2 = await pushNotificationService.sendToUser(
      testUser._id,
      orderNotification,
      { test: true }
    );

    if (result2.success) {
      console.log('✅ Order notification sent successfully!');
      console.log(`   Success: ${result2.successCount || 1}`);
      console.log(`   Failed: ${result2.failureCount || 0}\n`);
    } else {
      console.log('❌ Order notification failed:');
      console.log(`   Error: ${result2.error}\n`);
    }

    // Test 3: Test all order status notifications
    console.log('📤 Test 3: Testing all order status notifications...');
    const statusTests = [
      { type: 'ORDER_PREPARING', data: { orderNumber: 'TEST123', restaurantName: 'Test Restaurant' } },
      { type: 'ORDER_READY', data: { orderNumber: 'TEST123', deliveryType: 'pickup', estimatedTime: '15 mins' } },
      { type: 'ORDER_DELIVERED', data: { orderNumber: 'TEST123' } }
    ];

    for (const test of statusTests) {
      console.log(`   Testing ${test.type}...`);
      const notification = pushNotificationService.getNotificationTemplate(test.type, test.data);
      const result = await pushNotificationService.sendToUser(testUser._id, notification, { test: true });
      
      if (result.success) {
        console.log(`   ✅ ${test.type} sent successfully`);
      } else {
        console.log(`   ❌ ${test.type} failed: ${result.error}`);
      }
    }

    console.log('\n🎉 All tests completed!');
    console.log('\n📋 Summary:');
    console.log(`   User: ${testUser.firstName} ${testUser.lastName}`);
    console.log(`   Total notifications sent: ${statusTests.length + 2}`);
    console.log('\n💡 Check your browser/device for notifications!\n');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('👋 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the test
testPushNotification();
