const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

async function testPartnerUsers() {
  try {
    const mongoUrl = process.env.MONGO_URI || 'mongodb://localhost:27017/grub-gate';
    await mongoose.connect(mongoUrl);
    console.log('Connected to MongoDB');
    
    const partners = await User.find({ roles: 'partner' }).select('email firstName lastName roles');
    console.log('Partner users found:', partners.length);
    console.log('Partner users:', JSON.stringify(partners, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testPartnerUsers();
