// Setup script for OTP authentication system
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const logSection = (title) => {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60));
};

const logSuccess = (message) => {
  log(`✅ ${message}`, 'green');
};

const logError = (message) => {
  log(`❌ ${message}`, 'red');
};

const logInfo = (message) => {
  log(`ℹ️  ${message}`, 'blue');
};

const logWarning = (message) => {
  log(`⚠️  ${message}`, 'yellow');
};

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    logSuccess('Connected to MongoDB');
    return true;
  } catch (error) {
    logError(`Failed to connect to MongoDB: ${error.message}`);
    return false;
  }
}

// Check if required models exist
async function checkModels() {
  logSection('CHECKING MODELS');
  
  try {
    // Check User model
    const User = require('../src/models/User');
    logSuccess('User model loaded successfully');
    
    // Check if User model has new fields
    const userSchema = User.schema;
    const paths = userSchema.paths;
    
    if (paths.phoneNumber) {
      logSuccess('User model has phoneNumber field');
    } else {
      logWarning('User model missing phoneNumber field');
    }
    
    if (paths.roles) {
      logSuccess('User model has roles field');
    } else {
      logWarning('User model missing roles field');
    }
    
    if (paths.phoneVerified) {
      logSuccess('User model has phoneVerified field');
    } else {
      logWarning('User model missing phoneVerified field');
    }
    
    // Check OTP model
    const OTP = require('../src/models/OTP');
    logSuccess('OTP model loaded successfully');
    
    return true;
  } catch (error) {
    logError(`Model check failed: ${error.message}`);
    return false;
  }
}

// Check database indexes
async function checkIndexes() {
  logSection('CHECKING DATABASE INDEXES');
  
  try {
    const User = require('../src/models/User');
    const OTP = require('../src/models/OTP');
    
    // Check User indexes
    const userIndexes = await User.collection.getIndexes();
    logInfo('User collection indexes:');
    Object.keys(userIndexes).forEach(indexName => {
      log(`  - ${indexName}`, 'blue');
    });
    
    // Check OTP indexes
    const otpIndexes = await OTP.collection.getIndexes();
    logInfo('OTP collection indexes:');
    Object.keys(otpIndexes).forEach(indexName => {
      log(`  - ${indexName}`, 'blue');
    });
    
    logSuccess('Database indexes checked');
    return true;
  } catch (error) {
    logError(`Index check failed: ${error.message}`);
    return false;
  }
}

// Test OTP model functionality
async function testOTPModel() {
  logSection('TESTING OTP MODEL');
  
  try {
    const OTP = require('../src/models/OTP');
    
    // Test OTP generation
    const testIdentifier = 'test@example.com';
    logInfo(`Testing OTP generation for: ${testIdentifier}`);
    
    const { otp, otpRecord } = await OTP.generateOTP(testIdentifier);
    logSuccess(`OTP generated: ${otp}`);
    logSuccess(`OTP record created with ID: ${otpRecord._id}`);
    
    // Test OTP verification with correct OTP
    logInfo('Testing OTP verification with correct OTP');
    const verifyResult = await OTP.verifyOTP(testIdentifier, otp);
    
    if (verifyResult.success) {
      logSuccess('OTP verification successful');
    } else {
      logError(`OTP verification failed: ${verifyResult.message}`);
    }
    
    // Test OTP verification with wrong OTP
    logInfo('Testing OTP verification with wrong OTP');
    const { otp: newOtp } = await OTP.generateOTP(testIdentifier);
    const wrongVerifyResult = await OTP.verifyOTP(testIdentifier, '000000');
    
    if (!wrongVerifyResult.success) {
      logSuccess(`Correctly rejected wrong OTP: ${wrongVerifyResult.message}`);
    } else {
      logError('Should have rejected wrong OTP');
    }
    
    // Cleanup
    await OTP.deleteMany({ identifier: testIdentifier });
    logInfo('Test data cleaned up');
    
    return true;
  } catch (error) {
    logError(`OTP model test failed: ${error.message}`);
    return false;
  }
}

// Check environment variables
function checkEnvironmentVariables() {
  logSection('CHECKING ENVIRONMENT VARIABLES');
  
  const requiredVars = [
    'MONGO_URI',
    'JWT_SECRET',
    'JWT_EXPIRE',
    'JWT_REFRESH_SECRET',
    'JWT_REFRESH_EXPIRE'
  ];
  
  const optionalVars = [
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN',
    'TWILIO_PHONE_NUMBER',
    'SENDGRID_API_KEY',
    'EMAIL_FROM',
    'EMAIL_FROM_NAME',
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASS'
  ];
  
  let allRequired = true;
  
  // Check required variables
  logInfo('Required environment variables:');
  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      logSuccess(`${varName}: Set`);
    } else {
      logError(`${varName}: Missing`);
      allRequired = false;
    }
  });
  
  // Check optional variables
  logInfo('\nOptional environment variables (for production):');
  optionalVars.forEach(varName => {
    if (process.env[varName]) {
      logSuccess(`${varName}: Set`);
    } else {
      logWarning(`${varName}: Not set (development mode will be used)`);
    }
  });
  
  return allRequired;
}

// Test services
async function testServices() {
  logSection('TESTING SERVICES');
  
  try {
    // Test SMS service
    const smsService = require('../src/services/smsService');
    logInfo('Testing SMS service...');
    
    if (smsService.isConfigured()) {
      logSuccess('SMS service is configured (Twilio)');
    } else {
      logWarning('SMS service not configured (will use development mode)');
    }
    
    // Test email service
    const emailService = require('../src/services/emailService');
    logInfo('Testing email service...');
    
    if (emailService.isConfigured()) {
      logSuccess('Email service is configured');
    } else {
      logWarning('Email service not configured (will use development mode)');
    }
    
    return true;
  } catch (error) {
    logError(`Service test failed: ${error.message}`);
    return false;
  }
}

// Create test user
async function createTestUser() {
  logSection('CREATING TEST USER');
  
  try {
    const User = require('../src/models/User');
    
    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'test@grubgate.com' });
    if (existingUser) {
      logInfo('Test user already exists');
      return true;
    }
    
    // Create test user
    const testUser = await User.create({
      email: 'test@grubgate.com',
      firstName: 'Test',
      lastName: 'User',
      roles: ['customer'],
      status: 'active',
      emailVerified: true
    });
    
    logSuccess(`Test user created: ${testUser.email}`);
    logInfo(`User ID: ${testUser._id}`);
    logInfo(`Roles: ${JSON.stringify(testUser.roles)}`);
    
    return true;
  } catch (error) {
    logError(`Failed to create test user: ${error.message}`);
    return false;
  }
}

// Main setup function
async function runSetup() {
  log('🚀 GrubGate OTP Authentication Setup', 'bright');
  log('This script will verify your OTP authentication setup\n', 'blue');
  
  let allChecksPass = true;
  
  // Check environment variables
  if (!checkEnvironmentVariables()) {
    allChecksPass = false;
  }
  
  // Connect to database
  if (!await connectDB()) {
    allChecksPass = false;
    process.exit(1);
  }
  
  // Check models
  if (!await checkModels()) {
    allChecksPass = false;
  }
  
  // Check indexes
  if (!await checkIndexes()) {
    allChecksPass = false;
  }
  
  // Test OTP model
  if (!await testOTPModel()) {
    allChecksPass = false;
  }
  
  // Test services
  if (!await testServices()) {
    allChecksPass = false;
  }
  
  // Create test user
  if (!await createTestUser()) {
    allChecksPass = false;
  }
  
  // Final summary
  logSection('SETUP SUMMARY');
  
  if (allChecksPass) {
    logSuccess('🎉 OTP Authentication setup completed successfully!');
    log('\nNext steps:', 'bright');
    log('1. Start the backend server: npm run dev', 'blue');
    log('2. Test the OTP endpoints: node scripts/test-otp.js', 'blue');
    log('3. Integrate the frontend components', 'blue');
    log('4. Configure production services (Twilio, SendGrid)', 'blue');
  } else {
    logError('❌ Setup completed with warnings/errors');
    log('\nPlease address the issues above before proceeding.', 'yellow');
  }
  
  // Close database connection
  await mongoose.connection.close();
  logInfo('Database connection closed');
}

// Handle errors
process.on('unhandledRejection', (error) => {
  logError(`Unhandled rejection: ${error.message}`);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logError(`Uncaught exception: ${error.message}`);
  process.exit(1);
});

// Run setup
runSetup();
