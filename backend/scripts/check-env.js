// FILE: scripts/check-env.js
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

/**
 * Check if all required environment variables are set
 */
function checkEnvironment() {
  console.log('🔍 Checking Environment Variables...');
  console.log('=' .repeat(50));
  
  const requiredVars = [
    'MONGO_URI',
    'JWT_SECRET',
    'PORT'
  ];
  
  const optionalVars = [
    'MONGODB_URI', // Alternative name
    'NODE_ENV',
    'JWT_EXPIRE',
    'RATE_LIMIT_WINDOW_MS',
    'RATE_LIMIT_MAX_REQUESTS'
  ];
  
  let allGood = true;
  
  console.log('\n✅ Required Variables:');
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      console.log(`   ${varName}: ✅ Set (${value.substring(0, 20)}...)`);
    } else {
      console.log(`   ${varName}: ❌ Missing`);
      allGood = false;
    }
  });
  
  console.log('\n📋 Optional Variables:');
  optionalVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      console.log(`   ${varName}: ✅ Set (${value.substring(0, 20)}...)`);
    } else {
      console.log(`   ${varName}: ⚪ Not set`);
    }
  });
  
  // Check MongoDB URI specifically
  console.log('\n🗄️ MongoDB Configuration:');
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (mongoUri) {
    console.log(`   MongoDB URI: ✅ Found`);
    console.log(`   URI starts with: ${mongoUri.substring(0, 20)}...`);
    
    // Check if it's a valid MongoDB URI format
    if (mongoUri.startsWith('mongodb://') || mongoUri.startsWith('mongodb+srv://')) {
      console.log(`   URI format: ✅ Valid MongoDB URI`);
    } else {
      console.log(`   URI format: ⚠️ Doesn't look like a MongoDB URI`);
    }
  } else {
    console.log(`   MongoDB URI: ❌ Not found (need MONGO_URI or MONGODB_URI)`);
    allGood = false;
  }
  
  console.log('\n' + '=' .repeat(50));
  
  if (allGood) {
    console.log('🎉 Environment looks good! You can run the test scripts.');
    console.log('\n🚀 Try running:');
    console.log('   npm run test:live');
  } else {
    console.log('❌ Environment setup incomplete.');
    console.log('\n🔧 To fix:');
    console.log('   1. Copy .env.example to .env');
    console.log('   2. Fill in the required values');
    console.log('   3. Run this check again');
    console.log('\n📝 Commands:');
    console.log('   cp .env.example .env');
    console.log('   # Edit .env file with your values');
    console.log('   npm run check:env');
  }
  
  return allGood;
}

// Run the check
checkEnvironment();
