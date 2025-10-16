// Script to check user status in database
const mongoose = require('mongoose');
require('dotenv').config();

const checkUserStatus = async (userId) => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Import User model
    const User = require('../src/models/User.refactored');

    // Find user by ID
    const user = await User.findById(userId);

    if (!user) {
      console.log('❌ User not found with ID:', userId);
      return;
    }

    console.log('✅ User found:');
    console.log('- User ID:', user._id);
    console.log('- Name:', user.firstName, user.lastName);
    console.log('- Email:', user.email);
    console.log('- Status:', user.status);
    console.log('- Status Type:', typeof user.status);
    console.log('- Roles:', user.roles);
    console.log('- Restaurant ID:', user.restaurantId);
    console.log('- Created At:', user.createdAt);
    console.log('- Updated At:', user.updatedAt);

    // Check if status is exactly 'active'
    console.log('🔍 Status Checks:');
    console.log('- user.status === "active":', user.status === 'active');
    console.log('- user.status !== "active":', user.status !== 'active');

  } catch (error) {
    console.error('❌ Error checking user status:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
};

// Run the script
const userId = process.argv[2];
if (!userId) {
  console.log('❌ Please provide user ID as argument');
  console.log('Usage: node checkUserStatus.js <userId>');
  process.exit(1);
}

checkUserStatus(userId);
