// Quick test script to verify restaurant selection is working
const mongoose = require('mongoose');
const MealPlan = require('./src/models/MealPlan');

async function testRestaurantSelection() {
  try {
    // Connect to MongoDB (adjust connection string as needed)
    await mongoose.connect('mongodb://localhost:27017/grubgate', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Connected to MongoDB');
    
    // Test creating a meal plan with restaurant selection
    const testUserId = new mongoose.Types.ObjectId();
    
    const mealPlan = new MealPlan({
      userId: testUserId,
      weeklyPlans: {
        week0: {
          monday: { lunch: [], dinner: [] },
          tuesday: { lunch: [], dinner: [] },
          wednesday: { lunch: [], dinner: [] },
          thursday: { lunch: [], dinner: [] },
          friday: { lunch: [], dinner: [] },
          saturday: { lunch: [], dinner: [] },
          sunday: { lunch: [], dinner: [] }
        },
        week1: {
          monday: { lunch: [], dinner: [] },
          tuesday: { lunch: [], dinner: [] },
          wednesday: { lunch: [], dinner: [] },
          thursday: { lunch: [], dinner: [] },
          friday: { lunch: [], dinner: [] },
          saturday: { lunch: [], dinner: [] },
          sunday: { lunch: [], dinner: [] }
        }
      },
      totalItems: 0,
      selectedRestaurantId: '68e0bc5bff85206c636eeada',
      selectedRestaurantName: 'Ocean\'s Bounty Seafood',
      selectedRestaurantData: {
        _id: '68e0bc5bff85206c636eeada',
        name: 'Ocean\'s Bounty Seafood',
        description: 'Fresh Atlantic seafood'
      }
    });
    
    await mealPlan.save();
    console.log('✅ Meal plan with restaurant selection saved successfully');
    console.log('📊 Restaurant ID:', mealPlan.selectedRestaurantId);
    console.log('📊 Restaurant Name:', mealPlan.selectedRestaurantName);
    
    // Test updating restaurant selection
    mealPlan.selectedRestaurantId = '68e0bc5bff85206c636eead8';
    mealPlan.selectedRestaurantName = 'Chez Laurent Premium';
    await mealPlan.save();
    
    console.log('✅ Restaurant selection updated successfully');
    console.log('📊 New Restaurant ID:', mealPlan.selectedRestaurantId);
    console.log('📊 New Restaurant Name:', mealPlan.selectedRestaurantName);
    
    // Clean up test data
    await MealPlan.deleteOne({ _id: mealPlan._id });
    console.log('✅ Test data cleaned up');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

// Run the test
testRestaurantSelection();
