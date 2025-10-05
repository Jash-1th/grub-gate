// FILE: scripts/seed-always-available-items.js
const mongoose = require('mongoose');
const Restaurant = require('../src/models/Restaurant');
const MenuItem = require('../src/models/MenuItem');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected for seeding');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const alwaysAvailableItems = [
  // Chez Laurent Premium - Always Available Items
  {
    restaurantName: 'Chez Laurent Premium',
    items: [
      {
        name: 'Classic French Burger',
        description: 'Juicy beef patty with French cheese, lettuce, tomato, and special sauce',
        longDescription: 'Our signature burger featuring a premium beef patty, aged French cheese, fresh lettuce, vine-ripened tomatoes, and our house-made special sauce on a brioche bun.',
        category: 'always-available',
        price: 16.99,
        prepTime: 15,
        servings: 1,
        dietaryPreferences: [],
        ingredients: ['beef patty', 'French cheese', 'lettuce', 'tomato', 'brioche bun', 'special sauce'],
        allergens: ['gluten', 'dairy'],
        nutritionInfo: {
          calories: 580,
          protein: '32g',
          carbs: '45g',
          fat: '28g'
        },
        spiceLevel: 0,
        image: '/images/classic-french-burger.jpg'
      },
      {
        name: 'Caesar Salad',
        description: 'Fresh romaine lettuce with parmesan, croutons, and Caesar dressing',
        longDescription: 'Crisp romaine lettuce tossed with aged parmesan cheese, house-made croutons, and our traditional Caesar dressing.',
        category: 'always-available',
        price: 12.99,
        prepTime: 10,
        servings: 1,
        dietaryPreferences: ['vegetarian'],
        ingredients: ['romaine lettuce', 'parmesan cheese', 'croutons', 'Caesar dressing'],
        allergens: ['dairy', 'gluten'],
        nutritionInfo: {
          calories: 320,
          protein: '12g',
          carbs: '18g',
          fat: '24g'
        },
        spiceLevel: 0,
        image: '/images/caesar-salad.jpg'
      },
      {
        name: 'Grilled Chicken Breast',
        description: 'Herb-seasoned grilled chicken breast with seasonal vegetables',
        longDescription: 'Tender chicken breast marinated in herbs and grilled to perfection, served with a medley of seasonal vegetables.',
        category: 'always-available',
        price: 19.99,
        prepTime: 20,
        servings: 1,
        dietaryPreferences: ['gluten-free', 'dairy-free'],
        ingredients: ['chicken breast', 'herbs', 'seasonal vegetables', 'olive oil'],
        allergens: [],
        nutritionInfo: {
          calories: 420,
          protein: '45g',
          carbs: '12g',
          fat: '18g'
        },
        spiceLevel: 1,
        image: '/images/grilled-chicken-breast.jpg'
      },
      {
        name: 'Pasta Marinara',
        description: 'Classic spaghetti with homemade marinara sauce and fresh basil',
        longDescription: 'Al dente spaghetti pasta served with our signature marinara sauce made from San Marzano tomatoes and fresh basil.',
        category: 'always-available',
        price: 14.99,
        prepTime: 15,
        servings: 1,
        dietaryPreferences: ['vegetarian'],
        ingredients: ['spaghetti', 'tomatoes', 'basil', 'garlic', 'olive oil'],
        allergens: ['gluten'],
        nutritionInfo: {
          calories: 480,
          protein: '16g',
          carbs: '72g',
          fat: '14g'
        },
        spiceLevel: 0,
        image: '/images/pasta-marinara.jpg'
      }
    ]
  },
  // Bella Vista Italian - Always Available Items
  {
    restaurantName: 'Bella Vista Italian',
    items: [
      {
        name: 'Margherita Pizza',
        description: 'Classic pizza with fresh mozzarella, tomato sauce, and basil',
        longDescription: 'Traditional Neapolitan-style pizza with San Marzano tomato sauce, fresh mozzarella di bufala, and fresh basil leaves.',
        category: 'always-available',
        price: 18.99,
        prepTime: 18,
        servings: 1,
        dietaryPreferences: ['vegetarian'],
        ingredients: ['pizza dough', 'mozzarella', 'tomato sauce', 'basil', 'olive oil'],
        allergens: ['gluten', 'dairy'],
        nutritionInfo: {
          calories: 620,
          protein: '28g',
          carbs: '68g',
          fat: '26g'
        },
        spiceLevel: 0,
        image: '/images/margherita-pizza.jpg'
      },
      {
        name: 'Chicken Parmigiana',
        description: 'Breaded chicken breast with marinara sauce and melted mozzarella',
        longDescription: 'Tender chicken breast breaded and pan-fried, topped with our house marinara sauce and melted mozzarella cheese.',
        category: 'always-available',
        price: 24.99,
        prepTime: 25,
        servings: 1,
        dietaryPreferences: [],
        ingredients: ['chicken breast', 'breadcrumbs', 'marinara sauce', 'mozzarella', 'parmesan'],
        allergens: ['gluten', 'dairy'],
        nutritionInfo: {
          calories: 720,
          protein: '52g',
          carbs: '32g',
          fat: '38g'
        },
        spiceLevel: 0,
        image: '/images/chicken-parmigiana.jpg'
      },
      {
        name: 'Caprese Salad',
        description: 'Fresh mozzarella, tomatoes, and basil with balsamic glaze',
        longDescription: 'Fresh mozzarella di bufala, vine-ripened tomatoes, and fresh basil drizzled with aged balsamic glaze and extra virgin olive oil.',
        category: 'always-available',
        price: 13.99,
        prepTime: 8,
        servings: 1,
        dietaryPreferences: ['vegetarian', 'gluten-free'],
        ingredients: ['mozzarella', 'tomatoes', 'basil', 'balsamic glaze', 'olive oil'],
        allergens: ['dairy'],
        nutritionInfo: {
          calories: 280,
          protein: '18g',
          carbs: '12g',
          fat: '20g'
        },
        spiceLevel: 0,
        image: '/images/caprese-salad.jpg'
      }
    ]
  }
];

const seedAlwaysAvailableItems = async () => {
  try {
    console.log('🌱 Starting to seed always-available menu items...');

    for (const restaurantData of alwaysAvailableItems) {
      console.log(`\n📍 Processing ${restaurantData.restaurantName}...`);
      
      // Find the restaurant
      const restaurant = await Restaurant.findOne({ 
        name: restaurantData.restaurantName,
        status: 'active'
      });

      if (!restaurant) {
        console.log(`❌ Restaurant "${restaurantData.restaurantName}" not found`);
        continue;
      }

      console.log(`✅ Found restaurant: ${restaurant.name} (ID: ${restaurant._id})`);

      // Process each menu item
      for (const itemData of restaurantData.items) {
        // Check if item already exists
        const existingItem = await MenuItem.findOne({
          restaurantId: restaurant._id,
          name: itemData.name
        });

        if (existingItem) {
          console.log(`⚠️  Item "${itemData.name}" already exists, skipping...`);
          continue;
        }

        // Create the menu item with full availability
        const menuItem = new MenuItem({
          ...itemData,
          restaurantId: restaurant._id,
          availability: {
            monday: { lunch: true, dinner: true },
            tuesday: { lunch: true, dinner: true },
            wednesday: { lunch: true, dinner: true },
            thursday: { lunch: true, dinner: true },
            friday: { lunch: true, dinner: true },
            saturday: { lunch: true, dinner: true },
            sunday: { lunch: true, dinner: true }
          },
          status: 'available',
          totalOrders: Math.floor(Math.random() * 100) + 50, // Random order count
          rating: 4.0 + Math.random() * 1.0, // Random rating between 4.0-5.0
          reviewCount: Math.floor(Math.random() * 50) + 20 // Random review count
        });

        await menuItem.save();
        console.log(`✅ Added "${itemData.name}" - $${itemData.price}`);
      }
    }

    console.log('\n🎉 Successfully seeded always-available menu items!');
    
    // Show summary
    const totalAlwaysAvailable = await MenuItem.countDocuments({
      'availability.monday.lunch': true,
      'availability.monday.dinner': true,
      'availability.tuesday.lunch': true,
      'availability.tuesday.dinner': true,
      'availability.wednesday.lunch': true,
      'availability.wednesday.dinner': true,
      'availability.thursday.lunch': true,
      'availability.thursday.dinner': true,
      'availability.friday.lunch': true,
      'availability.friday.dinner': true,
      'availability.saturday.lunch': true,
      'availability.saturday.dinner': true,
      'availability.sunday.lunch': true,
      'availability.sunday.dinner': true
    });

    console.log(`\n📊 Total always-available items in database: ${totalAlwaysAvailable}`);

  } catch (error) {
    console.error('❌ Error seeding menu items:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the seeding function
const runSeeder = async () => {
  await connectDB();
  await seedAlwaysAvailableItems();
};

runSeeder();
