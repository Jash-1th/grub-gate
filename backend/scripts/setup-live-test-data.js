// FILE: scripts/setup-live-test-data.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../src/models/User');
const Restaurant = require('../src/models/Restaurant');
const MenuItem = require('../src/models/MenuItem');
const MealPlan = require('../src/models/MealPlan');
const SubscriptionMealPlan = require('../src/models/SubscriptionMealPlan');

/**
 * Setup live test data for customer meal planning and partner orders
 */
async function setupLiveTestData() {
  try {
    console.log('🚀 Setting up live test data...');
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    
    if (!mongoUri) {
      throw new Error('MongoDB URI not found. Please set MONGODB_URI or MONGO_URI in your .env file');
    }
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
    
    // Customer and Restaurant IDs
    const customerId = '68e60bc544b875ac6aaf9526';
    const restaurantId = '68e60c9d44b875ac6aaf953d';
    
    // Verify customer exists
    const customer = await User.findById(customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }
    console.log(`✅ Found customer: ${customer.firstName} ${customer.lastName}`);
    
    // Verify restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      throw new Error('Restaurant not found');
    }
    console.log(`✅ Found restaurant: ${restaurant.name}`);
    
    // Step 1: Add menu items to the restaurant
    console.log('\n📋 Step 1: Adding menu items to restaurant...');
    
    const menuItems = [
      {
        restaurantId: restaurantId,
        name: 'Chicken Biryani',
        description: 'Aromatic basmati rice cooked with tender chicken pieces and traditional spices',
        category: 'main',
        cuisine: 'indian',
        price: 299,
        prepTime: 25,
        dietaryPreferences: ['gluten-free'],
        ingredients: ['Basmati Rice', 'Chicken', 'Onions', 'Spices', 'Yogurt'],
        allergens: ['dairy'],
        nutritionInfo: {
          calories: 450,
          protein: '25g',
          carbs: '55g',
          fat: '12g'
        },
        spiceLevel: 3,
        images: ['https://example.com/chicken-biryani.jpg'],
        availability: {
          monday: { lunch: true, dinner: true },
          tuesday: { lunch: true, dinner: true },
          wednesday: { lunch: true, dinner: true },
          thursday: { lunch: true, dinner: true },
          friday: { lunch: true, dinner: true },
          saturday: { lunch: true, dinner: true },
          sunday: { lunch: true, dinner: true }
        },
        status: 'available'
      },
      {
        restaurantId: restaurantId,
        name: 'Paneer Butter Masala',
        description: 'Creamy tomato-based curry with soft paneer cubes',
        category: 'main',
        cuisine: 'indian',
        price: 249,
        prepTime: 20,
        dietaryPreferences: ['vegetarian'],
        ingredients: ['Paneer', 'Tomatoes', 'Cream', 'Butter', 'Spices'],
        allergens: ['dairy'],
        nutritionInfo: {
          calories: 320,
          protein: '15g',
          carbs: '12g',
          fat: '22g'
        },
        spiceLevel: 2,
        images: ['https://example.com/paneer-butter-masala.jpg'],
        availability: {
          monday: { lunch: true, dinner: true },
          tuesday: { lunch: true, dinner: true },
          wednesday: { lunch: true, dinner: true },
          thursday: { lunch: true, dinner: true },
          friday: { lunch: true, dinner: true },
          saturday: { lunch: true, dinner: true },
          sunday: { lunch: true, dinner: true }
        },
        status: 'available'
      },
      {
        restaurantId: restaurantId,
        name: 'Dal Tadka',
        description: 'Yellow lentils tempered with cumin, garlic and spices',
        category: 'main',
        cuisine: 'indian',
        price: 179,
        prepTime: 15,
        dietaryPreferences: ['vegetarian', 'vegan', 'gluten-free'],
        ingredients: ['Yellow Lentils', 'Onions', 'Tomatoes', 'Cumin', 'Garlic'],
        allergens: [],
        nutritionInfo: {
          calories: 180,
          protein: '12g',
          carbs: '28g',
          fat: '4g'
        },
        spiceLevel: 3,
        images: ['https://example.com/dal-tadka.jpg'],
        availability: {
          monday: { lunch: true, dinner: true },
          tuesday: { lunch: true, dinner: true },
          wednesday: { lunch: true, dinner: true },
          thursday: { lunch: true, dinner: true },
          friday: { lunch: true, dinner: true },
          saturday: { lunch: true, dinner: true },
          sunday: { lunch: true, dinner: true }
        },
        status: 'available'
      },
      {
        restaurantId: restaurantId,
        name: 'Garlic Naan',
        description: 'Soft bread topped with garlic and herbs',
        category: 'main',
        cuisine: 'indian',
        price: 89,
        prepTime: 10,
        dietaryPreferences: ['vegetarian'],
        ingredients: ['Flour', 'Garlic', 'Butter', 'Herbs'],
        allergens: ['gluten', 'dairy'],
        nutritionInfo: {
          calories: 220,
          protein: '6g',
          carbs: '35g',
          fat: '7g'
        },
        spiceLevel: 1,
        images: ['https://example.com/garlic-naan.jpg'],
        availability: {
          monday: { lunch: true, dinner: true },
          tuesday: { lunch: true, dinner: true },
          wednesday: { lunch: true, dinner: true },
          thursday: { lunch: true, dinner: true },
          friday: { lunch: true, dinner: true },
          saturday: { lunch: true, dinner: true },
          sunday: { lunch: true, dinner: true }
        },
        status: 'available'
      },
      {
        restaurantId: restaurantId,
        name: 'Mango Lassi',
        description: 'Refreshing yogurt-based drink with mango',
        category: 'beverage',
        cuisine: 'indian',
        price: 129,
        prepTime: 5,
        dietaryPreferences: ['vegetarian', 'gluten-free'],
        ingredients: ['Yogurt', 'Mango', 'Sugar', 'Cardamom'],
        allergens: ['dairy'],
        nutritionInfo: {
          calories: 150,
          protein: '4g',
          carbs: '28g',
          fat: '3g'
        },
        spiceLevel: 0,
        images: ['https://example.com/mango-lassi.jpg'],
        availability: {
          monday: { lunch: true, dinner: true },
          tuesday: { lunch: true, dinner: true },
          wednesday: { lunch: true, dinner: true },
          thursday: { lunch: true, dinner: true },
          friday: { lunch: true, dinner: true },
          saturday: { lunch: true, dinner: true },
          sunday: { lunch: true, dinner: true }
        },
        status: 'available'
      }
    ];
    
    // Clear existing menu items for this restaurant
    await MenuItem.deleteMany({ restaurantId: restaurantId });
    console.log('🗑️ Cleared existing menu items');
    
    // Insert new menu items
    const createdItems = await MenuItem.insertMany(menuItems);
    console.log(`✅ Added ${createdItems.length} menu items to restaurant`);
    
    createdItems.forEach(item => {
      console.log(`   - ${item.name} (₹${item.price}) - ${item._id}`);
    });
    
    // Step 2: Create a subscription meal plan for the customer
    console.log('\n🍽️ Step 2: Creating subscription meal plan...');
    
    // Clear existing meal plans for this customer
    await SubscriptionMealPlan.deleteMany({ customerId: customerId });
    await MealPlan.deleteMany({ userId: customerId });
    console.log('🗑️ Cleared existing meal plans');
    
    // Create subscription meal plan
    const today = new Date();
    const planStartDate = new Date(today);
    planStartDate.setHours(0, 0, 0, 0);
    const planEndDate = new Date(planStartDate);
    planEndDate.setDate(planStartDate.getDate() + 30); // 30-day plan
    
    // Create weeks array for the subscription
    const weeks = [];
    const currentWeekStart = new Date(planStartDate);
    
    // Create 4 weeks of meal plans
    for (let weekIndex = 0; weekIndex < 4; weekIndex++) {
      const weekStart = new Date(currentWeekStart);
      weekStart.setDate(currentWeekStart.getDate() + (weekIndex * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      const weekMeals = {
        monday: {
          lunch: {
            menuItemId: createdItems[0]._id, // Chicken Biryani
            name: createdItems[0].name,
            price: createdItems[0].price,
            specialInstructions: 'Medium spice level'
          },
          dinner: {
            menuItemId: createdItems[1]._id, // Paneer Butter Masala
            name: createdItems[1].name,
            price: createdItems[1].price,
            specialInstructions: 'Extra naan'
          }
        },
        tuesday: {
          lunch: {
            menuItemId: createdItems[2]._id, // Dal Tadka
            name: createdItems[2].name,
            price: createdItems[2].price,
            specialInstructions: 'Less oil'
          },
          dinner: {
            menuItemId: createdItems[0]._id, // Chicken Biryani
            name: createdItems[0].name,
            price: createdItems[0].price,
            specialInstructions: 'Mild spice'
          }
        },
        wednesday: {
          lunch: {
            menuItemId: createdItems[1]._id, // Paneer Butter Masala
            name: createdItems[1].name,
            price: createdItems[1].price,
            specialInstructions: 'Extra gravy'
          },
          dinner: {
            menuItemId: createdItems[2]._id, // Dal Tadka
            name: createdItems[2].name,
            price: createdItems[2].price,
            specialInstructions: 'With rice'
          }
        }
      };
      
      weeks.push({
        weekNumber: weekIndex + 1,
        weekStartDate: weekStart,
        weekEndDate: weekEnd,
        meals: weekMeals
      });
    }
    
    const subscriptionMealPlan = new SubscriptionMealPlan({
      customerId: customerId,
      restaurantId: restaurantId,
      subscriptionId: new mongoose.Types.ObjectId(), // Mock subscription ID
      planType: 'bi-weekly',
      planStartDate: planStartDate,
      planEndDate: planEndDate,
      weeks: weeks,
      deliveryAddress: {
        street: '123 Test Street',
        city: 'Chennai',
        province: 'Tamil Nadu',
        postalCode: '600001',
        instructions: 'Ring the doorbell'
      },
      deliveryPreferences: {
        timeSlot: 'lunch: 12:00-14:00, dinner: 19:00-21:00',
        specialInstructions: 'Call before delivery'
      },
      billingCycle: 'monthly',
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'active',
      generatedOrders: [],
      isOrdersGenerated: false
    });
    
    await subscriptionMealPlan.save();
    console.log(`✅ Created subscription meal plan: ${subscriptionMealPlan._id}`);
    console.log(`   - Plan Type: ${subscriptionMealPlan.planType}`);
    console.log(`   - Duration: ${subscriptionMealPlan.planStartDate.toDateString()} to ${subscriptionMealPlan.planEndDate.toDateString()}`);
    console.log(`   - Weeks: ${subscriptionMealPlan.weeks.length}`);
    console.log(`   - Status: ${subscriptionMealPlan.status}`);
    
    // Step 3: Create regular meal plan as backup
    console.log('\n📅 Step 3: Creating regular meal plan...');
    
    const regularMealPlan = new MealPlan({
      userId: customerId,
      weeklyPlans: {
        week0: {
          monday: {
            lunch: [{
              id: createdItems[0]._id.toString(),
              name: createdItems[0].name,
              price: createdItems[0].price,
              restaurantName: restaurant.name,
              specialInstructions: 'Medium spice',
              planId: new mongoose.Types.ObjectId().toString()
            }],
            dinner: [{
              id: createdItems[1]._id.toString(),
              name: createdItems[1].name,
              price: createdItems[1].price,
              restaurantName: restaurant.name,
              specialInstructions: 'Extra naan',
              planId: new mongoose.Types.ObjectId().toString()
            }]
          },
          tuesday: {
            lunch: [{
              id: createdItems[2]._id.toString(),
              name: createdItems[2].name,
              price: createdItems[2].price,
              restaurantName: restaurant.name,
              specialInstructions: 'Less oil',
              planId: new mongoose.Types.ObjectId().toString()
            }],
            dinner: [{
              id: createdItems[0]._id.toString(),
              name: createdItems[0].name,
              price: createdItems[0].price,
              restaurantName: restaurant.name,
              specialInstructions: 'Mild spice',
              planId: new mongoose.Types.ObjectId().toString()
            }]
          }
        }
      }
    });
    
    await regularMealPlan.save();
    console.log(`✅ Created regular meal plan: ${regularMealPlan._id}`);
    
    console.log('\n🎯 Test Data Setup Complete!');
    console.log('=' .repeat(60));
    console.log('📊 Summary:');
    console.log(`   Customer: ${customer.firstName} ${customer.lastName} (${customer.email})`);
    console.log(`   Restaurant: ${restaurant.name}`);
    console.log(`   Menu Items: ${createdItems.length} items added`);
    console.log(`   Subscription Plan: Active with ${weeks.length} weeks`);
    console.log(`   Regular Meal Plan: Created as backup`);
    
    console.log('\n🚀 Next Steps:');
    console.log('   1. Run order generation: node scripts/test-order-generation.js');
    console.log('   2. Check partner orders page to see generated orders');
    console.log('   3. Test order status updates in partner portal');
    
    console.log('\n📋 API Test Commands:');
    console.log('   Generate Orders: POST /api/v1/orders/generate/daily');
    console.log('   View Orders: GET /api/v1/orders');
    console.log('   Order Status: GET /api/v1/orders/generate/status');
    
  } catch (error) {
    console.error('💥 Setup failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Handle script termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Setup interrupted');
  await mongoose.connection.close();
  process.exit(0);
});

// Run the setup
setupLiveTestData();
