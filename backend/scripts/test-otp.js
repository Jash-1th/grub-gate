// Test script for OTP authentication endpoints
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api/v1';

// Test data
const testEmail = 'test@example.com';
const testPhone = '+1234567890';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const logSection = (title) => {
  console.log('\n' + '='.repeat(50));
  log(title, 'cyan');
  console.log('='.repeat(50));
};

const logTest = (testName) => {
  log(`\n🧪 Testing: ${testName}`, 'yellow');
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

// Test OTP request endpoint
async function testOTPRequest() {
  logSection('OTP REQUEST ENDPOINT TESTS');

  // Test 1: Valid email request
  logTest('Valid email OTP request');
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/otp/request`, {
      identifier: testEmail,
      channel: 'email'
    });
    
    if (response.data.success) {
      logSuccess('Email OTP request successful');
      logInfo(`Response: ${JSON.stringify(response.data, null, 2)}`);
    } else {
      logError('Email OTP request failed');
    }
  } catch (error) {
    logError(`Email OTP request error: ${error.response?.data?.message || error.message}`);
  }

  // Test 2: Valid phone request
  logTest('Valid phone OTP request');
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/otp/request`, {
      identifier: testPhone,
      channel: 'sms'
    });
    
    if (response.data.success) {
      logSuccess('Phone OTP request successful');
      logInfo(`Response: ${JSON.stringify(response.data, null, 2)}`);
    } else {
      logError('Phone OTP request failed');
    }
  } catch (error) {
    logError(`Phone OTP request error: ${error.response?.data?.message || error.message}`);
  }

  // Test 3: Invalid identifier
  logTest('Invalid identifier');
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/otp/request`, {
      identifier: 'invalid-identifier',
      channel: 'email'
    });
    
    logError('Should have failed with invalid identifier');
  } catch (error) {
    if (error.response?.status === 400) {
      logSuccess('Correctly rejected invalid identifier');
      logInfo(`Error: ${error.response.data.message}`);
    } else {
      logError(`Unexpected error: ${error.message}`);
    }
  }

  // Test 4: Channel mismatch
  logTest('Channel mismatch (email with SMS channel)');
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/otp/request`, {
      identifier: testEmail,
      channel: 'sms'
    });
    
    logError('Should have failed with channel mismatch');
  } catch (error) {
    if (error.response?.status === 400) {
      logSuccess('Correctly rejected channel mismatch');
      logInfo(`Error: ${error.response.data.message}`);
    } else {
      logError(`Unexpected error: ${error.message}`);
    }
  }
}

// Test OTP verify endpoint
async function testOTPVerify() {
  logSection('OTP VERIFY ENDPOINT TESTS');

  // Test 1: Invalid OTP format
  logTest('Invalid OTP format');
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/otp/verify`, {
      identifier: testEmail,
      otp: '123',
      userType: 'customer',
      firstName: 'Test',
      lastName: 'User'
    });
    
    logError('Should have failed with invalid OTP format');
  } catch (error) {
    if (error.response?.status === 400) {
      logSuccess('Correctly rejected invalid OTP format');
      logInfo(`Error: ${error.response.data.message}`);
    } else {
      logError(`Unexpected error: ${error.message}`);
    }
  }

  // Test 2: Non-existent OTP
  logTest('Non-existent OTP');
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/otp/verify`, {
      identifier: 'nonexistent@example.com',
      otp: '123456',
      userType: 'customer',
      firstName: 'Test',
      lastName: 'User'
    });
    
    logError('Should have failed with non-existent OTP');
  } catch (error) {
    if (error.response?.status === 400) {
      logSuccess('Correctly rejected non-existent OTP');
      logInfo(`Error: ${error.response.data.message}`);
    } else {
      logError(`Unexpected error: ${error.message}`);
    }
  }

  // Test 3: Missing user info for new user
  logTest('Missing user info for new user');
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/otp/verify`, {
      identifier: testEmail,
      otp: '123456',
      userType: 'customer'
      // Missing firstName and lastName
    });
    
    logError('Should have failed with missing user info');
  } catch (error) {
    if (error.response?.status === 400) {
      logSuccess('Correctly rejected missing user info');
      logInfo(`Error: ${error.response.data.message}`);
    } else {
      logError(`Unexpected error: ${error.message}`);
    }
  }
}

// Test complete flow with manual OTP input
async function testCompleteFlow() {
  logSection('COMPLETE FLOW TEST (MANUAL OTP INPUT)');

  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (prompt) => {
    return new Promise((resolve) => {
      rl.question(prompt, resolve);
    });
  };

  try {
    // Step 1: Request OTP
    logTest('Step 1: Requesting OTP');
    const otpResponse = await axios.post(`${API_BASE_URL}/auth/otp/request`, {
      identifier: testEmail,
      channel: 'email'
    });

    if (otpResponse.data.success) {
      logSuccess('OTP request successful');
      logInfo('Check your console for the OTP (development mode)');
      
      // Step 2: Get OTP from user
      const otp = await question('\nEnter the 6-digit OTP from the console: ');
      
      // Step 3: Verify OTP
      logTest('Step 2: Verifying OTP');
      const verifyResponse = await axios.post(`${API_BASE_URL}/auth/otp/verify`, {
        identifier: testEmail,
        otp: otp.trim(),
        userType: 'customer',
        firstName: 'Test',
        lastName: 'User'
      });

      if (verifyResponse.data.success) {
        logSuccess('OTP verification successful!');
        logInfo(`User created/logged in: ${verifyResponse.data.data.user.firstName} ${verifyResponse.data.data.user.lastName}`);
        logInfo(`Access token: ${verifyResponse.data.data.accessToken.substring(0, 20)}...`);
        logInfo(`User roles: ${JSON.stringify(verifyResponse.data.data.user.roles)}`);
      } else {
        logError('OTP verification failed');
      }
    } else {
      logError('OTP request failed');
    }
  } catch (error) {
    logError(`Complete flow error: ${error.response?.data?.message || error.message}`);
  }

  rl.close();
}

// Main test runner
async function runTests() {
  log('🚀 Starting OTP Authentication Tests', 'bright');
  log(`Testing against: ${API_BASE_URL}`, 'blue');

  try {
    // Test if server is running
    await axios.get(`${API_BASE_URL.replace('/api/v1', '')}/health`);
    logSuccess('Server is running');
  } catch (error) {
    logError('Server is not running. Please start the backend server first.');
    process.exit(1);
  }

  // Run endpoint tests
  await testOTPRequest();
  await testOTPVerify();

  // Ask if user wants to test complete flow
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('\nDo you want to test the complete flow with manual OTP input? (y/n): ', async (answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      rl.close();
      await testCompleteFlow();
    } else {
      rl.close();
    }

    logSection('TEST SUMMARY');
    log('All automated tests completed!', 'green');
    log('Check the results above for any failures.', 'blue');
    log('\nTo test the frontend:', 'yellow');
    log('1. Start the frontend server (npm run dev)', 'blue');
    log('2. Open the OTP authentication modal', 'blue');
    log('3. Test the complete user flow', 'blue');
  });
}

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
  logError(`Unhandled rejection: ${error.message}`);
  process.exit(1);
});

// Run tests
runTests();
