/**
 * Test script for meal plan cleanup function
 * Run with: node test-cleanup-function.js
 */

// Mock the cleanup functions locally for testing
const cleanMealItems = (mealItems) => {
  return mealItems.map(item => ({
    _id: item._id,
    name: item.name,
    price: item.price,
    image: item.image,
    planId: item.planId,
    restaurantName: item.restaurantName,
    addedAt: item.addedAt
  }));
};

const cleanMealPlanResponse = (mealPlan) => {
  const cleaned = {
    _id: mealPlan._id,
    userId: mealPlan.userId,
    weeklyPlans: {},
    totalItems: mealPlan.totalItems || 0,
    selectedRestaurantId: mealPlan.selectedRestaurantId,
    selectedRestaurantName: mealPlan.selectedRestaurantName,
    selectedRestaurantData: mealPlan.selectedRestaurantData ? {
      _id: mealPlan.selectedRestaurantData._id,
      name: mealPlan.selectedRestaurantData.name,
      cuisine: mealPlan.selectedRestaurantData.cuisine,
      rating: mealPlan.selectedRestaurantData.rating,
      logo: mealPlan.selectedRestaurantData.logo
    } : null,
    datesCalculatedAt: mealPlan.datesCalculatedAt,
    lastUpdated: mealPlan.lastUpdated,
    createdAt: mealPlan.createdAt,
    updatedAt: mealPlan.updatedAt
  };

  // Clean up weekly plans - only include days with meals
  ['week0', 'week1'].forEach(weekKey => {
    if (mealPlan.weeklyPlans && mealPlan.weeklyPlans[weekKey]) {
      cleaned.weeklyPlans[weekKey] = {};
      
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      dayNames.forEach(dayName => {
        const dayData = mealPlan.weeklyPlans[weekKey][dayName];
        if (dayData) {
          const hasLunchMeals = dayData.lunch && dayData.lunch.length > 0;
          const hasDinnerMeals = dayData.dinner && dayData.dinner.length > 0;
          
          // Only include day if it has actual meals (ignore empty arrays)
          if (hasLunchMeals || hasDinnerMeals) {
            cleaned.weeklyPlans[weekKey][dayName] = {
              date: dayData.date,
              lunch: cleanMealItems(dayData.lunch || []),
              dinner: cleanMealItems(dayData.dinner || [])
            };
          }
        }
      });
    }
  });

  return cleaned;
};

console.log('🧪 Testing Cleanup Function...\n');

// Test data similar to what you showed
const testMealPlan = {
  _id: "68ed46dd113b506f175d1563",
  userId: "68e7578c70b1ebbce509b69c",
  weeklyPlans: {
    week0: {
      monday: { lunch: [], dinner: [] },
      tuesday: { lunch: [], dinner: [] },
      wednesday: { 
        lunch: [{
          _id: "68ebea6d57874ec69ada4861",
          restaurantId: "68eb9d53b04d7c5b6086026e",
          name: "mutton",
          description: "mutton for you",
          category: "dessert",
          cuisine: "indian",
          price: 10,
          prepTime: 30,
          servings: 1,
          dietaryPreferences: ["vegetarian", "gluten-free"],
          ingredients: [],
          allergens: ["nuts", "dairy"],
          spiceLevel: 0,
          image: "https://res.cloudinary.com/dfzzgzew9/image/upload/v1760291436/grubgate…",
          images: [],
          status: "available",
          totalOrders: 0,
          rating: 0,
          reviewCount: 0,
          createdAt: "2025-10-12T17:50:37.800Z",
          updatedAt: "2025-10-12T17:50:37.800Z",
          __v: 0,
          formattedPrice: "$10.00",
          isPopular: false,
          isAvailableToday: false,
          id: "68ebea6d57874ec69ada4861",
          planId: "1760380679918-0.6812282493122892",
          restaurantName: "xyz",
          addedAt: "2025-10-13T18:37:59.918Z"
        }], 
        dinner: [] 
      },
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
  totalItems: 1,
  selectedRestaurantId: "68eb9d53b04d7c5b6086026e",
  selectedRestaurantName: "xyz",
  selectedRestaurantData: {
    _id: "68eb9d53b04d7c5b6086026e",
    name: "xyz",
    cuisine: ["Indian"],
    rating: 0,
    // ... lots of other fields that should be removed
    address: { /* big object */ },
    operatingHours: { /* big object */ },
    businessLicense: "...",
    taxId: "...",
    // etc.
  }
};

console.log('📊 Original Data:');
console.log('- Week0 days:', Object.keys(testMealPlan.weeklyPlans.week0));
console.log('- Week1 days:', Object.keys(testMealPlan.weeklyPlans.week1));
console.log('- Original size:', JSON.stringify(testMealPlan).length, 'characters');
console.log('- Restaurant data fields:', Object.keys(testMealPlan.selectedRestaurantData));

const cleaned = cleanMealPlanResponse(testMealPlan);

console.log('\n✅ Cleaned Data:');
console.log('- Week0 days:', Object.keys(cleaned.weeklyPlans.week0));
console.log('- Week1 days:', Object.keys(cleaned.weeklyPlans.week1));
console.log('- Cleaned size:', JSON.stringify(cleaned).length, 'characters');
console.log('- Restaurant data fields:', cleaned.selectedRestaurantData ? Object.keys(cleaned.selectedRestaurantData) : 'null');

const savings = JSON.stringify(testMealPlan).length - JSON.stringify(cleaned).length;
const savingsPercent = Math.round((savings / JSON.stringify(testMealPlan).length) * 100);

console.log('\n📈 Optimization Results:');
console.log('- Space saved:', savings, 'characters');
console.log('- Percentage reduction:', savingsPercent + '%');
console.log('- Days removed from week0:', 7 - Object.keys(cleaned.weeklyPlans.week0).length);
console.log('- Days removed from week1:', 7 - Object.keys(cleaned.weeklyPlans.week1).length);

console.log('\n🎯 Expected Result:');
console.log('- Should only show wednesday in week0');
console.log('- Should show no days in week1');
console.log('- Should reduce restaurant data to essential fields only');
