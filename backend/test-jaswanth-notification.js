require('dotenv').config();
const mongoose = require('mongoose');
const pushService = require('./src/services/pushNotificationService');

async function testNotification() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const userId = '68f234629460247f85a6a1bb'; // jaswanthmamilla@gmail.com

    console.log('🔔 Sending push notification to user:', userId);
    
    const notification = {
      title: '🎉 Test Notification',
      body: 'Push notifications are working perfectly for all users!',
      icon: '/icons/logo192.png',
      badge: '/icons/notification-badge.png'
    };

    const data = {
      timestamp: new Date().toISOString(),
      url: '/',
      message: 'This is a test notification'
    };

    const result = await pushService.sendToUser(
      userId,
      notification,
      data
    );

    if (result.success) {
      console.log('✅ Notification sent successfully!');
      console.log('📊 Success:', result.successCount, ', Failed:', result.failureCount);
    } else {
      console.error('❌ Failed to send notification:', result.error);
    }

    console.log('\n🎉 TEST COMPLETE!');
    console.log('📱 Check your browser for the notification!\n');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    console.log('🔌 Disconnected from MongoDB');
    await mongoose.disconnect();
  }
}

testNotification();
