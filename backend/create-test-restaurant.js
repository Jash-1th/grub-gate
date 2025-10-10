// Create test restaurant and test availability
const mongoose = require('mongoose');
const Restaurant = require('./src/models/Restaurant');
const MenuItem = require('./src/models/MenuItem');
const User = require('./src/models/User');

mongoose.connect('mongodb://localhost:27017/grub-gate', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const createTestData = async () => {
  try {
    console.log('🔍 Creating test restaurant and testing availability...\n');

    // 1. Create or find a test user (partner)
    let testUser = await User.findOne({ email: 'test@partner.com' });
    if (!testUser) {
      testUser = await User.create({
        firstName: 'Test',
        lastName: 'Partner',
        email: 'test@partner.com',
        password: 'password123',
        userType: 'partner',
        isEmailVerified: true
      });
      console.log('✅ Created test partner user');
    } else {
      console.log('✅ Found existing test partner user');
    }

    // 2. Create test restaurant
    let testRestaurant = await Restaurant.findOne({ name: 'Test Availability Restaurant' });
    if (!testRestaurant) {
      testRestaurant = await Restaurant.create({
        name: 'Test Availability Restaurant',
        description: 'Restaurant for testing availability functionality',
        cuisine: ['Italian', 'Mediterranean'],
        businessType: 'restaurant',
        ownerId: testUser._id,
        address: {
          street: '123 Test Street',
          city: 'Montreal',
          province: 'QC',
          postalCode: 'H3A 1A1'
        },
        phone: '+1 (514) 555-0123',
        email: 'test@restaurant.com',
        status: 'active',
        deliverySettings: {
          radius: 10,
          fee: 4.99,
          minOrderAmount: 25.00,
          avgDeliveryTime: 35
        },
        operatingHours: {
          monday: { open: '09:00', close: '22:00', closed: false },
          tuesday: { open: '09:00', close: '22:00', closed: false },
          wednesday: { open: '09:00', close: '22:00', closed: false },
          thursday: { open: '09:00', close: '22:00', closed: false },
          friday: { open: '09:00', close: '23:00', closed: false },
          saturday: { open: '10:00', close: '23:00', closed: false },
          sunday: { open: '10:00', close: '21:00', closed: false }
        }
      });
      console.log('✅ Created test restaurant');
    } else {
      console.log('✅ Found existing test restaurant');
    }

    console.log('🏪 Restaurant ID:', testRestaurant._id);
    console.log('👤 Owner ID:', testRestaurant.ownerId);

    // 3. Test availability functionality
    console.log('\n🧪 Testing Menu Item Availability...');
    
    // Test Case 1: Default availability (all true)
    console.log('\n📝 Test Case 1: Default availability (all true)');
    const defaultAvailability = {
      monday: { lunch: true, dinner: true },
      tuesday: { lunch: true, dinner: true },
      wednesday: { lunch: true, dinner: true },
      thursday: { lunch: true, dinner: true },
      friday: { lunch: true, dinner: true },
      saturday: { lunch: true, dinner: true },
      sunday: { lunch: true, dinner: true }
    };

    const defaultItem = await MenuItem.create({
      restaurantId: testRestaurant._id,
      name: 'Always Available Item',
      description: 'This item should always be available',
      category: 'main',
      cuisine: 'italian',
      price: 15.99,
      prepTime: 25,
      servings: 1,
      status: 'available',
      availability: defaultAvailability
    });

    console.log('✅ Created always-available item');
    console.log('📋 Saved availability:', JSON.stringify(defaultItem.availability, null, 2));

    // Test Case 2: Partial availability
    console.log('\n📝 Test Case 2: Partial availability');
    const partialAvailability = {
      monday: { lunch: true, dinner: false },
      tuesday: { lunch: false, dinner: true },
      wednesday: { lunch: true, dinner: true },
      thursday: { lunch: false, dinner: false },
      friday: { lunch: true, dinner: true },
      saturday: { lunch: false, dinner: true },
      sunday: { lunch: true, dinner: false }
    };

    const partialItem = await MenuItem.create({
      restaurantId: testRestaurant._id,
      name: 'Partially Available Item',
      description: 'This item has limited availability',
      category: 'main',
      cuisine: 'italian',
      price: 18.99,
      prepTime: 30,
      servings: 1,
      status: 'available',
      availability: partialAvailability
    });

    console.log('✅ Created partially-available item');
    console.log('📋 Saved availability:', JSON.stringify(partialItem.availability, null, 2));

    // Test Case 3: Test findAlwaysAvailable method
    console.log('\n🔍 Test Case 3: Testing findAlwaysAvailable method');
    const alwaysAvailableItems = await MenuItem.findAlwaysAvailable(testRestaurant._id);
    console.log(`📊 Always available items found: ${alwaysAvailableItems.length}`);
    
    alwaysAvailableItems.forEach((item, index) => {
      console.log(`${index + 1}. ${item.name}`);
    });

    // Test Case 4: Test FormData JSON parsing (simulating frontend)
    console.log('\n📤 Test Case 4: Testing FormData JSON parsing');
    
    const formDataAvailabilityString = JSON.stringify({
      monday: { lunch: false, dinner: true },
      tuesday: { lunch: true, dinner: false },
      wednesday: { lunch: false, dinner: false },
      thursday: { lunch: true, dinner: true },
      friday: { lunch: false, dinner: true },
      saturday: { lunch: true, dinner: false },
      sunday: { lunch: true, dinner: true }
    });

    console.log('📝 FormData availability string (as sent from frontend):');
    console.log(formDataAvailabilityString);

    try {
      const parsedAvailability = JSON.parse(formDataAvailabilityString);
      console.log('✅ Successfully parsed FormData availability');
      
      // Update the partial item with new availability
      const updatedItem = await MenuItem.findByIdAndUpdate(
        partialItem._id,
        { availability: parsedAvailability },
        { new: true, runValidators: true }
      );
      
      console.log('✅ Successfully updated item with parsed availability');
      console.log('📋 Final availability:', JSON.stringify(updatedItem.availability, null, 2));
      
    } catch (parseError) {
      console.log('❌ Error parsing FormData availability:', parseError.message);
    }

    // Test Case 5: Test availability validation
    console.log('\n🔍 Test Case 5: Testing availability validation');
    
    try {
      const invalidItem = await MenuItem.create({
        restaurantId: testRestaurant._id,
        name: 'Invalid Availability Item',
        description: 'Testing invalid availability structure',
        category: 'main',
        cuisine: 'italian',
        price: 12.99,
        prepTime: 20,
        servings: 1,
        status: 'available',
        availability: {
          monday: { lunch: 'invalid', dinner: true }, // Invalid boolean
          tuesday: { lunch: true }, // Missing dinner
          // Missing other days
        }
      });
      
      console.log('⚠️  Created item with invalid availability (should be handled by schema)');
      console.log('📋 Saved availability:', JSON.stringify(invalidItem.availability, null, 2));
      
    } catch (validationError) {
      console.log('✅ Validation error caught (expected):', validationError.message);
    }

    console.log('\n📊 Summary:');
    const allItems = await MenuItem.find({ restaurantId: testRestaurant._id });
    console.log(`Total menu items created: ${allItems.length}`);
    
    const alwaysAvailable = await MenuItem.findAlwaysAvailable(testRestaurant._id);
    console.log(`Always available items: ${alwaysAvailable.length}`);

    console.log('\n✅ Availability testing completed successfully!');

  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    mongoose.connection.close();
  }
};

createTestData();
