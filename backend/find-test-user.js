/**
 * Find existing users to test with
 */

const mongoose = require('mongoose');
const User = require('./src/models/User');

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/grub-gate', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const findUsers = async () => {
  try {
    console.log('🔍 Finding existing users...');
    
    const users = await User.find({}).limit(10).select('firstName lastName email _id');
    
    if (users.length === 0) {
      console.log('❌ No users found in database');
      return;
    }
    
    console.log(`✅ Found ${users.length} users:`);
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.firstName} ${user.lastName} - ${user.email} (${user._id})`);
    });
    
    // Let's use the first user for testing
    const testUser = users[0];
    console.log(`\n🎯 Will use for testing: ${testUser.email} (${testUser._id})`);
    
  } catch (error) {
    console.error('❌ Error finding users:', error);
  }
};

const runTest = async () => {
  await connectDB();
  await findUsers();
  await mongoose.connection.close();
  console.log('✅ Database connection closed');
};

runTest();
