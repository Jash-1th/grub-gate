// Test availability functionality with specific restaurant ID
require('dotenv').config();
const mongoose = require('mongoose');
const MenuItem = require('./src/models/MenuItem');
const Restaurant = require('./src/models/Restaurant');

// Use environment variable for MongoDB connection
const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb+srv://jaswanth:1qazxsw2QAZXSW@cluster0.gthunlu.mongodb.net/grubgate?retryWrites=true&w=majority&appName=Cluster0';

console.log('🔗 Connecting to MongoDB:', MONGODB_URI.replace(/\/\/.*@/, '//***:***@')); // Hide credentials in log

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const testAvailabilityWithRestaurant = async () => {
  try {
    console.log('🔍 Testing Menu Item Availability Issues...\n');

    const restaurantId = '68e73d168c18e7fd776a6327';
    console.log('🏪 Testing with restaurant ID:', restaurantId);

    // 1. Find the specific restaurant
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      console.log('❌ Restaurant not found with ID:', restaurantId);
      
      // Try to find any restaurant as fallback
      const anyRestaurant = await Restaurant.findOne();
      if (anyRestaurant) {
        console.log('📍 Found alternative restaurant:', anyRestaurant.name, 'ID:', anyRestaurant._id);
        return testWithRestaurant(anyRestaurant);
      } else {
        console.log('❌ No restaurants found in database');
        return;
      }
    }
    
    console.log('✅ Found restaurant:', restaurant.name);
    console.log('📊 Restaurant status:', restaurant.status);
    console.log('👤 Owner ID:', restaurant.ownerId);

    return testWithRestaurant(restaurant);

  } catch (error) {
    console.error('❌ Error during availability testing:', error);
  } finally {
    mongoose.connection.close();
  }
};

const testWithRestaurant = async (restaurant) => {
  // 2. Check existing menu items and their availability structure
  const existingItems = await MenuItem.find({ restaurantId: restaurant._id }).limit(5);
  
  console.log(`\n📋 Found ${existingItems.length} existing menu items`);
  
  if (existingItems.length > 0) {
    console.log('\n📋 Existing Menu Items Availability Structure:');
    existingItems.forEach((item, index) => {
      console.log(`\n${index + 1}. ${item.name}`);
      console.log('   Status:', item.status);
      console.log('   Category:', item.category);
      
      if (item.availability) {
        console.log('   Availability structure:');
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        
        days.forEach(day => {
          if (item.availability[day]) {
            console.log(`     ${day}: lunch=${item.availability[day].lunch}, dinner=${item.availability[day].dinner}`);
          } else {
            console.log(`     ${day}: ❌ MISSING`);
          }
        });
        
        // Check if availability follows expected structure
        const hasCorrectStructure = days.every(day => 
          item.availability[day] && 
          typeof item.availability[day].lunch === 'boolean' &&
          typeof item.availability[day].dinner === 'boolean'
        );
        
        console.log('   ✅ Correct structure:', hasCorrectStructure);
      } else {
        console.log('   ❌ NO AVAILABILITY DATA');
      }
    });
  }

  // 3. Test creating a new menu item with availability (simulating partner portal)
  console.log('\n🧪 Testing Menu Item Creation (Partner Portal Simulation)...');
  
  // This simulates the availability data structure from the partner portal
  const frontendAvailability = {
    monday: { lunch: true, dinner: false },
    tuesday: { lunch: true, dinner: true },
    wednesday: { lunch: false, dinner: true },
    thursday: { lunch: true, dinner: true },
    friday: { lunch: true, dinner: false },
    saturday: { lunch: false, dinner: false },
    sunday: { lunch: true, dinner: true }
  };

  console.log('📝 Frontend availability data:');
  console.log(JSON.stringify(frontendAvailability, null, 2));

  // Simulate FormData processing (as done in createMenuItemFormData)
  const formDataString = JSON.stringify(frontendAvailability);
  console.log('\n📤 FormData string (as sent from partner portal):', formDataString);

  try {
    const parsedAvailability = JSON.parse(formDataString);
    console.log('✅ Successfully parsed FormData availability');

    const testMenuItem = {
      restaurantId: restaurant._id,
      name: 'Test Availability Item - ' + new Date().toISOString(),
      description: 'Testing availability functionality from partner portal',
      category: 'main',
      cuisine: restaurant.cuisine[0] || 'italian',
      price: 15.99,
      prepTime: 25,
      servings: 1,
      status: 'available',
      availability: parsedAvailability
    };

    const createdItem = await MenuItem.create(testMenuItem);
    console.log('✅ Menu item created successfully');
    console.log('📋 Saved availability:', JSON.stringify(createdItem.availability, null, 2));

    // 4. Test updating availability (simulating partner portal edit)
    console.log('\n🔄 Testing Availability Update...');
    
    const updatedAvailability = {
      monday: { lunch: false, dinner: true },
      tuesday: { lunch: false, dinner: false },
      wednesday: { lunch: true, dinner: false },
      thursday: { lunch: false, dinner: true },
      friday: { lunch: true, dinner: true },
      saturday: { lunch: true, dinner: true },
      sunday: { lunch: false, dinner: false }
    };

    const updatedFormDataString = JSON.stringify(updatedAvailability);
    const updatedParsedAvailability = JSON.parse(updatedFormDataString);

    const updatedItem = await MenuItem.findByIdAndUpdate(
      createdItem._id,
      { availability: updatedParsedAvailability },
      { new: true, runValidators: true }
    );

    console.log('📝 Updated availability to:');
    console.log(JSON.stringify(updatedAvailability, null, 2));
    console.log('📋 Saved updated availability:', JSON.stringify(updatedItem.availability, null, 2));

    // 5. Test the findAlwaysAvailable method (used by customer app)
    console.log('\n🔍 Testing findAlwaysAvailable method (Customer App)...');
    
    const alwaysAvailableItems = await MenuItem.findAlwaysAvailable(restaurant._id);
    console.log(`📊 Found ${alwaysAvailableItems.length} always-available items for this restaurant`);
    
    if (alwaysAvailableItems.length > 0) {
      alwaysAvailableItems.forEach((item, index) => {
        console.log(`${index + 1}. ${item.name}`);
      });
    } else {
      console.log('⚠️  No always-available items found (this might be the issue!)');
    }

    // 6. Check if our test item appears in always-available (it shouldn't)
    const testItemInAlwaysAvailable = alwaysAvailableItems.some(item => item._id.equals(createdItem._id));
    console.log(`📋 Test item in always-available: ${testItemInAlwaysAvailable} (should be false)`);

    // 7. Create an always-available item for comparison
    console.log('\n✅ Creating always-available item for comparison...');
    
    const alwaysAvailableData = {
      monday: { lunch: true, dinner: true },
      tuesday: { lunch: true, dinner: true },
      wednesday: { lunch: true, dinner: true },
      thursday: { lunch: true, dinner: true },
      friday: { lunch: true, dinner: true },
      saturday: { lunch: true, dinner: true },
      sunday: { lunch: true, dinner: true }
    };

    const alwaysAvailableItem = await MenuItem.create({
      restaurantId: restaurant._id,
      name: 'Always Available Test Item - ' + new Date().toISOString(),
      description: 'This item should always be available',
      category: 'main',
      cuisine: restaurant.cuisine[0] || 'italian',
      price: 12.99,
      prepTime: 20,
      servings: 1,
      status: 'available',
      availability: alwaysAvailableData
    });

    console.log('✅ Created always-available item');

    // Test again
    const newAlwaysAvailableItems = await MenuItem.findAlwaysAvailable(restaurant._id);
    console.log(`📊 Now found ${newAlwaysAvailableItems.length} always-available items`);
    
    const newItemInAlwaysAvailable = newAlwaysAvailableItems.some(item => item._id.equals(alwaysAvailableItem._id));
    console.log(`📋 New always-available item found: ${newItemInAlwaysAvailable} (should be true)`);

    // 8. Clean up test items
    await MenuItem.findByIdAndDelete(createdItem._id);
    await MenuItem.findByIdAndDelete(alwaysAvailableItem._id);
    console.log('\n🧹 Cleaned up test menu items');

    console.log('\n✅ Availability testing completed!');
    
    // 9. Summary of potential issues
    console.log('\n📊 POTENTIAL ISSUES ANALYSIS:');
    console.log('1. Check if availability structure is correctly saved from partner portal');
    console.log('2. Verify FormData parsing in createMenuItemFormData function');
    console.log('3. Ensure availability validation in backend routes');
    console.log('4. Check if findAlwaysAvailable method works correctly');

  } catch (parseError) {
    console.log('❌ Error parsing FormData availability:', parseError.message);
  }
};

testAvailabilityWithRestaurant();
