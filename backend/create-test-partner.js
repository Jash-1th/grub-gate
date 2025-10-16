const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

async function createTestPartner() {
  try {
    const mongoUrl = process.env.MONGO_URI || 'mongodb://localhost:27017/grub-gate';
    await mongoose.connect(mongoUrl);
    console.log('Connected to MongoDB');
    
    // Check if test partner already exists
    const existingPartner = await User.findOne({ email: 'partner@test.com' });
    if (existingPartner) {
      console.log('Test partner already exists:', existingPartner.email);
      process.exit(0);
    }
    
    // Create test partner
    const testPartner = await User.create({
      firstName: 'Test',
      lastName: 'Partner',
      email: 'partner@test.com',
      phoneNumber: '+1234567890',
      passwordHash: 'password123', // Will be hashed by pre-save middleware
      roles: ['partner'],
      status: 'active',
      emailVerified: true,
      phoneVerified: true
    });
    
    console.log('Test partner created successfully:');
    console.log('Email:', testPartner.email);
    console.log('Password: password123');
    console.log('Roles:', testPartner.roles);
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating test partner:', error);
    process.exit(1);
  }
}

createTestPartner();
