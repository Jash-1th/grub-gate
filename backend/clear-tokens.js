require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function clearTokens() {
  await mongoose.connect(process.env.MONGO_URI);
  await User.updateOne(
    { email: '2022cse.r234@svce.edu.in' },
    { $set: { fcmTokens: [] } }
  );
  console.log('✅ Cleared FCM tokens for 2022cse.r234@svce.edu.in');
  await mongoose.disconnect();
}

clearTokens();
