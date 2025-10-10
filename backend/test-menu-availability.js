// Test script to debug menu item availability issues in partner portal
const mongoose = require('mongoose');
const MenuItem = require('./src/models/MenuItem');
const Restaurant = require('./src/models/Restaurant');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/grub-gate', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const testAvailabilityIssue = async () => {
  try {
    console.log('🔍 Testing Menu Item Availability Issues...\n');

    // 1. Find a restaurant to test with
    const restaurant = await Restaurant.findOne({ status: 'active' });
    if (!restaurant) {
      console.log('❌ No active restaurant found');
      return;
    }
    
    console.log('🏪 Testing with restaurant:', restaurant.name);
    console.log('🏪 Restaurant ID:', restaurant._id);

    // 2. Check existing menu items and their availability structure
    const existingItems = await MenuItem.find({ restaurantId: restaurant._id }).limit(3);
    
    console.log('\n📋 Existing Menu Items Availability Structure:');
    existingItems.forEach((item, index) => {
      console.log(`\n${index + 1}. ${item.name}`);
      console.log('   Availability:', JSON.stringify(item.availability, null, 2));
      
      // Check if availability follows expected structure
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      const hasCorrectStructure = days.every(day => 
        item.availability[day] && 
        typeof item.availability[day].lunch === 'boolean' &&
        typeof item.availability[day].dinner === 'boolean'
      );
      
      console.log('   ✅ Correct structure:', hasCorrectStructure);
    });

    // 3. Test creating a new menu item with availability
    console.log('\n🧪 Testing Menu Item Creation with Availability...');
    
    const testAvailability = {
      monday: { lunch: true, dinner: false },
      tuesday: { lunch: true, dinner: true },
      wednesday: { lunch: false, dinner: true },
      thursday: { lunch: true, dinner: true },
      friday: { lunch: true, dinner: false },
      saturday: { lunch: false, dinner: false },
      sunday: { lunch: true, dinner: true }
    };

    const testMenuItem = {
      restaurantId: restaurant._id,
      name: 'Test Availability Item',
      description: 'Testing availability functionality',
      category: 'main',
      cuisine: 'test',
      price: 15.99,
      prepTime: 25,
      servings: 1,
      status: 'available',
      availability: testAvailability
    };

    console.log('📝 Creating test menu item with availability:');
    console.log(JSON.stringify(testAvailability, null, 2));

    const createdItem = await MenuItem.create(testMenuItem);
    console.log('✅ Menu item created successfully');
    console.log('📋 Saved availability:', JSON.stringify(createdItem.availability, null, 2));

    // 4. Test updating availability
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

    const updatedItem = await MenuItem.findByIdAndUpdate(
      createdItem._id,
      { availability: updatedAvailability },
      { new: true, runValidators: true }
    );

    console.log('📝 Updated availability to:');
    console.log(JSON.stringify(updatedAvailability, null, 2));
    console.log('📋 Saved updated availability:', JSON.stringify(updatedItem.availability, null, 2));

    // 5. Test the findAlwaysAvailable method
    console.log('\n🔍 Testing findAlwaysAvailable method...');
    
    const alwaysAvailableItems = await MenuItem.findAlwaysAvailable(restaurant._id);
    console.log(`📊 Found ${alwaysAvailableItems.length} always-available items for this restaurant`);
    
    alwaysAvailableItems.forEach((item, index) => {
      console.log(`${index + 1}. ${item.name} - Always available: ${item.name !== 'Test Availability Item'}`);
    });

    // 6. Test FormData parsing (simulate frontend data)
    console.log('\n📤 Testing FormData-like availability parsing...');
    
    const formDataAvailability = JSON.stringify({
      monday: { lunch: true, dinner: true },
      tuesday: { lunch: true, dinner: false },
      wednesday: { lunch: false, dinner: true },
      thursday: { lunch: true, dinner: true },
      friday: { lunch: false, dinner: false },
      saturday: { lunch: true, dinner: false },
      sunday: { lunch: false, dinner: true }
    });

    console.log('📝 FormData availability string:', formDataAvailability);
    
    try {
      const parsedAvailability = JSON.parse(formDataAvailability);
      console.log('✅ Successfully parsed FormData availability');
      console.log('📋 Parsed structure:', JSON.stringify(parsedAvailability, null, 2));
      
      // Test updating with parsed data
      const formDataUpdatedItem = await MenuItem.findByIdAndUpdate(
        createdItem._id,
        { availability: parsedAvailability },
        { new: true, runValidators: true }
      );
      
      console.log('✅ Successfully updated with FormData-parsed availability');
      console.log('📋 Final saved availability:', JSON.stringify(formDataUpdatedItem.availability, null, 2));
      
    } catch (parseError) {
      console.log('❌ Error parsing FormData availability:', parseError.message);
    }

    // 7. Clean up test item
    await MenuItem.findByIdAndDelete(createdItem._id);
    console.log('\n🧹 Cleaned up test menu item');

    console.log('\n✅ Availability testing completed!');

  } catch (error) {
    console.error('❌ Error during availability testing:', error);
  } finally {
    mongoose.connection.close();
  }
};

testAvailabilityIssue();
