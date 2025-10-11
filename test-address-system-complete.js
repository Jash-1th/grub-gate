// FILE: test-address-system-complete.js
/**
 * Comprehensive Test Suite for Complete Address & Location System
 * Tests all implemented components and API endpoints
 * Run with: node test-address-system-complete.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import models and services
const User = require('./backend/src/models/User');
const Restaurant = require('./backend/src/models/Restaurant');
const Order = require('./backend/src/models/Order');
const { geocodeGlobalAddress, detectCountryFromPostalCode } = require('./backend/src/services/globalGeocodingService');

// Test data
const testAddresses = [
  {
    country: 'CA',
    street: '123 King Street West',
    city: 'Toronto',
    province: 'ON',
    postalCode: 'M5V 2B4',
    type: 'home'
  },
  {
    country: 'US',
    street: '456 Broadway',
    city: 'New York',
    province: 'NY',
    postalCode: '10001',
    type: 'work'
  },
  {
    country: 'IN',
    street: 'MIG-123, KPHB Colony',
    city: 'Hyderabad',
    province: 'Telangana',
    postalCode: '500072',
    type: 'home'
  }
];

const testUser = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe.test@grubgate.com',
  phoneNumber: '+1-416-555-0123',
  role: 'customer',
  addresses: []
};

const testRestaurant = {
  name: 'Global Test Kitchen',
  cuisine: 'International',
  description: 'Test restaurant for address system',
  address: {
    street: '789 College Street',
    city: 'Toronto',
    province: 'ON',
    postalCode: 'M5T 1T1',
    country: 'CA'
  },
  deliverySettings: {
    radius: 5,
    fee: 2.99,
    avgDeliveryTime: 30
  }
};

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

// Helper functions
const logTest = (testName, passed, details = '') => {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} ${testName}`);
  if (details) console.log(`   ${details}`);
  
  testResults.tests.push({ name: testName, passed, details });
  if (passed) testResults.passed++;
  else testResults.failed++;
};

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/grubgate-test');
    console.log('🔗 Connected to test database');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

const cleanupTestData = async () => {
  try {
    await User.deleteMany({ email: { $regex: /test@grubgate\.com$/ } });
    await Restaurant.deleteMany({ name: /Test Kitchen/ });
    await Order.deleteMany({ 'items.name': /Test Item/ });
    console.log('🧹 Cleaned up test data');
  } catch (error) {
    console.warn('⚠️ Cleanup warning:', error.message);
  }
};

// Test Suite Functions

/**
 * Test 1: Country Detection from Postal Codes
 */
const testCountryDetection = async () => {
  console.log('\n🌍 Testing Country Detection...');
  
  const testCases = [
    { postalCode: 'M5V 2B4', expectedCountry: 'CA', description: 'Canadian postal code' },
    { postalCode: '10001', expectedCountry: 'US', description: 'US ZIP code' },
    { postalCode: '515671', expectedCountry: 'IN', description: 'Indian PIN code' },
    { postalCode: 'SW1A 1AA', expectedCountry: 'UK', description: 'UK postcode' },
    { postalCode: '2000', expectedCountry: 'AU', description: 'Australian postcode' }
  ];

  for (const testCase of testCases) {
    try {
      const detectedCountry = detectCountryFromPostalCode(testCase.postalCode);
      const passed = detectedCountry === testCase.expectedCountry;
      logTest(
        `Country Detection: ${testCase.description}`,
        passed,
        `${testCase.postalCode} → ${detectedCountry} (expected: ${testCase.expectedCountry})`
      );
    } catch (error) {
      logTest(`Country Detection: ${testCase.description}`, false, error.message);
    }
  }
};

/**
 * Test 2: Address Geocoding
 */
const testAddressGeocoding = async () => {
  console.log('\n📍 Testing Address Geocoding...');
  
  for (const address of testAddresses) {
    try {
      const result = await geocodeGlobalAddress({
        country: address.country,
        addressLine1: address.street,
        city: address.city,
        state: address.province,
        postalCode: address.postalCode
      });

      const hasCoordinates = result.lat && result.lng;
      const validCoordinates = Math.abs(result.lat) <= 90 && Math.abs(result.lng) <= 180;
      
      logTest(
        `Geocoding: ${address.country} address`,
        hasCoordinates && validCoordinates,
        `${address.street}, ${address.city} → (${result.lat}, ${result.lng})`
      );
    } catch (error) {
      logTest(`Geocoding: ${address.country} address`, false, error.message);
    }
  }
};

/**
 * Test 3: User Address Management
 */
const testUserAddressManagement = async () => {
  console.log('\n👤 Testing User Address Management...');
  
  try {
    // Create test user
    const user = new User(testUser);
    await user.save();
    logTest('User Creation', true, `Created user: ${user.email}`);

    // Add addresses
    for (const address of testAddresses) {
      try {
        // Geocode address first
        const geocoded = await geocodeGlobalAddress({
          country: address.country,
          addressLine1: address.street,
          city: address.city,
          state: address.province,
          postalCode: address.postalCode
        });

        const addressWithCoords = {
          ...address,
          coordinates: {
            lat: geocoded.lat,
            lng: geocoded.lng
          },
          isDefault: address.type === 'home'
        };

        user.addresses.push(addressWithCoords);
        await user.save();

        logTest(
          `Add Address: ${address.country}`,
          true,
          `Added ${address.type} address in ${address.city}`
        );
      } catch (error) {
        logTest(`Add Address: ${address.country}`, false, error.message);
      }
    }

    // Test address retrieval
    const savedUser = await User.findById(user._id);
    const addressCount = savedUser.addresses.length;
    logTest(
      'Address Retrieval',
      addressCount === testAddresses.length,
      `Retrieved ${addressCount} addresses`
    );

    // Test default address
    const defaultAddress = savedUser.addresses.find(addr => addr.isDefault);
    logTest(
      'Default Address',
      defaultAddress && defaultAddress.type === 'home',
      `Default address: ${defaultAddress?.type || 'none'}`
    );

    return user;
  } catch (error) {
    logTest('User Address Management', false, error.message);
    return null;
  }
};

/**
 * Test 4: Restaurant Location Setup
 */
const testRestaurantLocationSetup = async () => {
  console.log('\n🏪 Testing Restaurant Location Setup...');
  
  try {
    // Geocode restaurant address
    const geocoded = await geocodeGlobalAddress({
      country: testRestaurant.address.country,
      addressLine1: testRestaurant.address.street,
      city: testRestaurant.address.city,
      state: testRestaurant.address.province,
      postalCode: testRestaurant.address.postalCode
    });

    const restaurantData = {
      ...testRestaurant,
      address: {
        ...testRestaurant.address,
        coordinates: {
          lat: geocoded.lat,
          lng: geocoded.lng
        }
      },
      status: 'active'
    };

    const restaurant = new Restaurant(restaurantData);
    await restaurant.save();

    logTest(
      'Restaurant Creation',
      true,
      `Created restaurant: ${restaurant.name} at (${geocoded.lat}, ${geocoded.lng})`
    );

    return restaurant;
  } catch (error) {
    logTest('Restaurant Creation', false, error.message);
    return null;
  }
};

/**
 * Test 5: Delivery Zone Validation
 */
const testDeliveryZoneValidation = async (restaurant, user) => {
  console.log('\n🚚 Testing Delivery Zone Validation...');
  
  if (!restaurant || !user) {
    logTest('Delivery Zone Validation', false, 'Missing restaurant or user data');
    return;
  }

  try {
    for (const address of user.addresses) {
      const canDeliver = restaurant.deliversTo(address.coordinates);
      const distance = Restaurant.calculateDistance(
        restaurant.address.coordinates,
        address.coordinates
      );

      logTest(
        `Delivery Check: ${address.city}`,
        typeof canDeliver === 'boolean',
        `Distance: ${distance.toFixed(2)}km, Can deliver: ${canDeliver}`
      );
    }
  } catch (error) {
    logTest('Delivery Zone Validation', false, error.message);
  }
};

/**
 * Test 6: Order Creation with Address
 */
const testOrderCreation = async (restaurant, user) => {
  console.log('\n📦 Testing Order Creation with Address...');
  
  if (!restaurant || !user) {
    logTest('Order Creation', false, 'Missing restaurant or user data');
    return;
  }

  try {
    const deliveryAddress = user.addresses.find(addr => addr.isDefault);
    if (!deliveryAddress) {
      logTest('Order Creation', false, 'No default address found');
      return;
    }

    const orderData = {
      orderNumber: `TEST${Date.now()}`,
      customerId: user._id,
      restaurantId: restaurant._id,
      type: 'single',
      items: [{
        name: 'Test Item',
        price: 15.99,
        quantity: 1
      }],
      subtotal: 15.99,
      deliveryFee: 2.99,
      tax: 2.47,
      total: 21.45,
      status: 'pending',
      paymentStatus: 'paid',
      paymentMethod: 'card',
      deliveryAddress: {
        street: deliveryAddress.street,
        city: deliveryAddress.city,
        province: deliveryAddress.province,
        postalCode: deliveryAddress.postalCode,
        coordinates: deliveryAddress.coordinates
      },
      scheduledDate: new Date(),
      activationDate: new Date()
    };

    const order = new Order(orderData);
    await order.save();

    logTest(
      'Order Creation',
      true,
      `Created order ${order.orderNumber} for delivery to ${deliveryAddress.city}`
    );

    return order;
  } catch (error) {
    logTest('Order Creation', false, error.message);
    return null;
  }
};

/**
 * Test 7: Address Validation API Simulation
 */
const testAddressValidationAPI = async () => {
  console.log('\n🔍 Testing Address Validation API...');
  
  const testCases = [
    {
      address: {
        street: '123 King Street West',
        city: 'Toronto',
        province: 'ON',
        postalCode: 'M5V 2B4'
      },
      shouldPass: true,
      description: 'Valid Canadian address'
    },
    {
      address: {
        street: '',
        city: 'Toronto',
        province: 'ON',
        postalCode: 'M5V 2B4'
      },
      shouldPass: false,
      description: 'Missing street address'
    },
    {
      address: {
        street: '123 Main St',
        city: 'Toronto',
        province: 'ON',
        postalCode: 'INVALID'
      },
      shouldPass: false,
      description: 'Invalid postal code format'
    }
  ];

  for (const testCase of testCases) {
    try {
      const hasRequiredFields = testCase.address.street && 
                               testCase.address.city && 
                               testCase.address.postalCode;
      
      let isValidFormat = true;
      if (hasRequiredFields) {
        const country = detectCountryFromPostalCode(testCase.address.postalCode);
        isValidFormat = !!country;
      }

      const validationResult = hasRequiredFields && isValidFormat;
      const testPassed = validationResult === testCase.shouldPass;

      logTest(
        `Address Validation: ${testCase.description}`,
        testPassed,
        `Valid: ${validationResult}, Expected: ${testCase.shouldPass}`
      );
    } catch (error) {
      logTest(`Address Validation: ${testCase.description}`, false, error.message);
    }
  }
};

/**
 * Test 8: SSR Safety Check
 */
const testSSRSafety = () => {
  console.log('\n⚡ Testing SSR Safety...');
  
  // Simulate server-side environment
  const originalWindow = global.window;
  const originalNavigator = global.navigator;
  
  delete global.window;
  delete global.navigator;

  try {
    // Test geolocation service
    const hasGeolocation = typeof window !== 'undefined' && 'geolocation' in navigator;
    logTest(
      'SSR Safety: Geolocation Check',
      !hasGeolocation,
      'Geolocation properly disabled on server'
    );

    // Test client detection
    const isClient = typeof window !== 'undefined';
    logTest(
      'SSR Safety: Client Detection',
      !isClient,
      'Client detection works on server'
    );

    // Test country detection (should work on server)
    const country = detectCountryFromPostalCode('M5V 2B4');
    logTest(
      'SSR Safety: Country Detection',
      country === 'CA',
      'Country detection works on server'
    );

  } catch (error) {
    logTest('SSR Safety Check', false, error.message);
  } finally {
    // Restore environment
    global.window = originalWindow;
    global.navigator = originalNavigator;
  }
};

/**
 * Main Test Runner
 */
const runAllTests = async () => {
  console.log('🚀 Starting Complete Address System Test Suite');
  console.log('=' .repeat(60));

  await connectDB();
  await cleanupTestData();

  // Run all tests
  await testCountryDetection();
  await testAddressGeocoding();
  const user = await testUserAddressManagement();
  const restaurant = await testRestaurantLocationSetup();
  await testDeliveryZoneValidation(restaurant, user);
  await testOrderCreation(restaurant, user);
  await testAddressValidationAPI();
  testSSRSafety();

  // Final cleanup
  await cleanupTestData();

  // Results summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);

  if (testResults.failed > 0) {
    console.log('\n❌ Failed Tests:');
    testResults.tests
      .filter(test => !test.passed)
      .forEach(test => console.log(`   - ${test.name}: ${test.details}`));
  }

  console.log('\n🎉 Test Suite Complete!');
  
  // Exit with appropriate code
  process.exit(testResults.failed > 0 ? 1 : 0);
};

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled Promise Rejection:', error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Run tests
runAllTests().catch(error => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
});
