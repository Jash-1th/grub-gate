const mongoose = require('mongoose');
const Restaurant = require('../src/models/Restaurant');
const MenuItem = require('../src/models/MenuItem');
require('dotenv').config();

// Sample menu items for different restaurants
const menuItemsData = {
  "Ocean's Bounty Seafood": [
    {
      name: "Grilled Atlantic Salmon",
      description: "Fresh Atlantic salmon grilled to perfection with lemon herb butter",
      longDescription: "Our signature Atlantic salmon is sourced daily from sustainable fisheries and grilled with our special blend of herbs and spices. Served with seasonal vegetables and your choice of rice or quinoa.",
      category: "main",
      price: 28.99,
      prepTime: 25,
      servings: 1,
      dietaryPreferences: ["gluten-free"],
      ingredients: ["Atlantic salmon", "lemon", "herbs", "butter", "olive oil"],
      allergens: ["fish"],
      nutritionInfo: {
        calories: 420,
        protein: "35g",
        carbs: "8g",
        fat: "28g"
      },
      spiceLevel: 1,
      image: "/images/grilled-salmon.jpg",
      availability: {
        monday: { lunch: true, dinner: true },
        tuesday: { lunch: true, dinner: true },
        wednesday: { lunch: true, dinner: true },
        thursday: { lunch: true, dinner: true },
        friday: { lunch: true, dinner: true },
        saturday: { lunch: true, dinner: true },
        sunday: { lunch: true, dinner: true }
      },
      status: "available",
      totalOrders: 156,
      rating: 4.7,
      reviewCount: 89
    },
    {
      name: "Seafood Paella",
      description: "Traditional Spanish paella with fresh seafood and saffron rice",
      longDescription: "A generous portion of traditional Spanish paella featuring fresh mussels, shrimp, calamari, and fish in aromatic saffron rice with bell peppers and peas.",
      category: "main",
      price: 32.99,
      prepTime: 35,
      servings: 2,
      dietaryPreferences: ["gluten-free"],
      ingredients: ["rice", "saffron", "mussels", "shrimp", "calamari", "fish", "bell peppers", "peas"],
      allergens: ["shellfish", "fish"],
      nutritionInfo: {
        calories: 580,
        protein: "42g",
        carbs: "65g",
        fat: "18g"
      },
      spiceLevel: 2,
      image: "/images/seafood-paella.jpg",
      availability: {
        monday: { lunch: false, dinner: true },
        tuesday: { lunch: false, dinner: true },
        wednesday: { lunch: false, dinner: true },
        thursday: { lunch: false, dinner: true },
        friday: { lunch: true, dinner: true },
        saturday: { lunch: true, dinner: true },
        sunday: { lunch: true, dinner: true }
      },
      status: "available",
      totalOrders: 98,
      rating: 4.8,
      reviewCount: 67
    },
    {
      name: "Fish & Chips",
      description: "Beer-battered cod with crispy fries and mushy peas",
      longDescription: "Classic British-style fish and chips featuring fresh cod in our signature beer batter, served with golden fries, mushy peas, and tartar sauce.",
      category: "main",
      price: 18.99,
      prepTime: 20,
      servings: 1,
      dietaryPreferences: [],
      ingredients: ["cod", "flour", "beer", "potatoes", "peas", "oil"],
      allergens: ["fish", "gluten"],
      nutritionInfo: {
        calories: 650,
        protein: "28g",
        carbs: "72g",
        fat: "28g"
      },
      spiceLevel: 0,
      image: "/images/fish-chips.jpg",
      availability: {
        monday: { lunch: true, dinner: true },
        tuesday: { lunch: true, dinner: true },
        wednesday: { lunch: true, dinner: true },
        thursday: { lunch: true, dinner: true },
        friday: { lunch: true, dinner: true },
        saturday: { lunch: true, dinner: true },
        sunday: { lunch: true, dinner: true }
      },
      status: "available",
      totalOrders: 234,
      rating: 4.5,
      reviewCount: 156
    },
    {
      name: "Lobster Bisque",
      description: "Rich and creamy lobster bisque with fresh herbs",
      longDescription: "Our signature lobster bisque made from fresh lobster shells and meat, cream, and aromatic vegetables, finished with a touch of sherry.",
      category: "soup",
      price: 14.99,
      prepTime: 10,
      servings: 1,
      dietaryPreferences: [],
      ingredients: ["lobster", "cream", "sherry", "onions", "celery", "herbs"],
      allergens: ["shellfish", "dairy"],
      nutritionInfo: {
        calories: 280,
        protein: "18g",
        carbs: "12g",
        fat: "18g"
      },
      spiceLevel: 0,
      image: "/images/lobster-bisque.jpg",
      availability: {
        monday: { lunch: true, dinner: true },
        tuesday: { lunch: true, dinner: true },
        wednesday: { lunch: true, dinner: true },
        thursday: { lunch: true, dinner: true },
        friday: { lunch: true, dinner: true },
        saturday: { lunch: true, dinner: true },
        sunday: { lunch: true, dinner: true }
      },
      status: "available",
      totalOrders: 87,
      rating: 4.6,
      reviewCount: 52
    }
  ],
  "Chez Laurent Premium": [
    {
      name: "Beef Wellington",
      description: "Premium beef tenderloin wrapped in puff pastry with mushroom duxelles",
      longDescription: "Our signature Beef Wellington features the finest beef tenderloin, coated with pâté and mushroom duxelles, then wrapped in golden puff pastry. Served with roasted vegetables and red wine jus.",
      category: "main",
      price: 45.99,
      prepTime: 40,
      servings: 1,
      dietaryPreferences: [],
      ingredients: ["beef tenderloin", "puff pastry", "mushrooms", "pâté", "herbs"],
      allergens: ["gluten", "eggs"],
      nutritionInfo: {
        calories: 720,
        protein: "48g",
        carbs: "32g",
        fat: "42g"
      },
      spiceLevel: 1,
      image: "/images/beef-wellington.jpg",
      availability: {
        monday: { lunch: false, dinner: true },
        tuesday: { lunch: false, dinner: true },
        wednesday: { lunch: false, dinner: true },
        thursday: { lunch: false, dinner: true },
        friday: { lunch: false, dinner: true },
        saturday: { lunch: true, dinner: true },
        sunday: { lunch: true, dinner: true }
      },
      status: "available",
      totalOrders: 78,
      rating: 4.9,
      reviewCount: 45
    },
    {
      name: "Duck Confit",
      description: "Slow-cooked duck leg with garlic and herbs, served with potato gratin",
      longDescription: "Traditional French duck confit, slow-cooked in its own fat with garlic and thyme, served with creamy potato gratin and seasonal vegetables.",
      category: "main",
      price: 38.99,
      prepTime: 30,
      servings: 1,
      dietaryPreferences: ["gluten-free"],
      ingredients: ["duck leg", "garlic", "thyme", "potatoes", "cream"],
      allergens: ["dairy"],
      nutritionInfo: {
        calories: 620,
        protein: "42g",
        carbs: "28g",
        fat: "38g"
      },
      spiceLevel: 1,
      image: "/images/duck-confit.jpg",
      availability: {
        monday: { lunch: false, dinner: true },
        tuesday: { lunch: false, dinner: true },
        wednesday: { lunch: false, dinner: true },
        thursday: { lunch: false, dinner: true },
        friday: { lunch: true, dinner: true },
        saturday: { lunch: true, dinner: true },
        sunday: { lunch: true, dinner: true }
      },
      status: "available",
      totalOrders: 92,
      rating: 4.8,
      reviewCount: 61
    },
    {
      name: "French Onion Soup",
      description: "Classic French onion soup with Gruyère cheese and croutons",
      longDescription: "Traditional French onion soup made with caramelized onions in rich beef broth, topped with melted Gruyère cheese and toasted croutons.",
      category: "soup",
      price: 12.99,
      prepTime: 15,
      servings: 1,
      dietaryPreferences: [],
      ingredients: ["onions", "beef broth", "Gruyère cheese", "bread", "wine"],
      allergens: ["dairy", "gluten"],
      nutritionInfo: {
        calories: 320,
        protein: "16g",
        carbs: "28g",
        fat: "16g"
      },
      spiceLevel: 0,
      image: "/images/french-onion-soup.jpg",
      availability: {
        monday: { lunch: true, dinner: true },
        tuesday: { lunch: true, dinner: true },
        wednesday: { lunch: true, dinner: true },
        thursday: { lunch: true, dinner: true },
        friday: { lunch: true, dinner: true },
        saturday: { lunch: true, dinner: true },
        sunday: { lunch: true, dinner: true }
      },
      status: "available",
      totalOrders: 145,
      rating: 4.7,
      reviewCount: 98
    },
    {
      name: "Crème Brûlée",
      description: "Classic vanilla custard with caramelized sugar crust",
      longDescription: "Traditional French crème brûlée with Madagascar vanilla bean custard and a perfectly caramelized sugar crust, served with fresh berries.",
      category: "dessert",
      price: 9.99,
      prepTime: 5,
      servings: 1,
      dietaryPreferences: ["vegetarian"],
      ingredients: ["cream", "vanilla", "eggs", "sugar", "berries"],
      allergens: ["dairy", "eggs"],
      nutritionInfo: {
        calories: 380,
        protein: "6g",
        carbs: "32g",
        fat: "26g"
      },
      spiceLevel: 0,
      image: "/images/creme-brulee.jpg",
      availability: {
        monday: { lunch: true, dinner: true },
        tuesday: { lunch: true, dinner: true },
        wednesday: { lunch: true, dinner: true },
        thursday: { lunch: true, dinner: true },
        friday: { lunch: true, dinner: true },
        saturday: { lunch: true, dinner: true },
        sunday: { lunch: true, dinner: true }
      },
      status: "available",
      totalOrders: 167,
      rating: 4.6,
      reviewCount: 112
    }
  ],
  "The Steakhouse Prime": [
    {
      name: "Prime Ribeye Steak",
      description: "28-day aged prime ribeye steak grilled to perfection",
      longDescription: "Our signature 16oz prime ribeye, dry-aged for 28 days for maximum flavor and tenderness. Grilled to your preference and served with garlic mashed potatoes and grilled asparagus.",
      category: "main",
      price: 52.99,
      prepTime: 25,
      servings: 1,
      dietaryPreferences: ["gluten-free"],
      ingredients: ["prime ribeye", "garlic", "potatoes", "asparagus", "herbs"],
      allergens: ["dairy"],
      nutritionInfo: {
        calories: 780,
        protein: "58g",
        carbs: "24g",
        fat: "52g"
      },
      spiceLevel: 1,
      image: "/images/prime-ribeye.jpg",
      availability: {
        monday: { lunch: false, dinner: true },
        tuesday: { lunch: false, dinner: true },
        wednesday: { lunch: false, dinner: true },
        thursday: { lunch: false, dinner: true },
        friday: { lunch: true, dinner: true },
        saturday: { lunch: true, dinner: true },
        sunday: { lunch: true, dinner: true }
      },
      status: "available",
      totalOrders: 203,
      rating: 4.9,
      reviewCount: 134
    },
    {
      name: "Filet Mignon",
      description: "Tender 8oz filet mignon with red wine reduction",
      longDescription: "The most tender cut of beef, our 8oz filet mignon is seared to perfection and finished with a rich red wine reduction. Served with roasted vegetables and your choice of potato.",
      category: "main",
      price: 48.99,
      prepTime: 20,
      servings: 1,
      dietaryPreferences: ["gluten-free"],
      ingredients: ["filet mignon", "red wine", "shallots", "butter", "herbs"],
      allergens: ["dairy"],
      nutritionInfo: {
        calories: 650,
        protein: "52g",
        carbs: "18g",
        fat: "42g"
      },
      spiceLevel: 1,
      image: "/images/filet-mignon.jpg",
      availability: {
        monday: { lunch: false, dinner: true },
        tuesday: { lunch: false, dinner: true },
        wednesday: { lunch: false, dinner: true },
        thursday: { lunch: false, dinner: true },
        friday: { lunch: true, dinner: true },
        saturday: { lunch: true, dinner: true },
        sunday: { lunch: true, dinner: true }
      },
      status: "available",
      totalOrders: 178,
      rating: 4.8,
      reviewCount: 119
    },
    {
      name: "Wagyu Burger",
      description: "Premium Wagyu beef burger with truffle aioli and aged cheddar",
      longDescription: "Our gourmet burger features premium Wagyu beef, truffle aioli, aged cheddar, arugula, and caramelized onions on a brioche bun. Served with truffle fries.",
      category: "burger",
      price: 28.99,
      prepTime: 18,
      servings: 1,
      dietaryPreferences: [],
      ingredients: ["Wagyu beef", "truffle aioli", "cheddar", "arugula", "brioche bun"],
      allergens: ["gluten", "dairy", "eggs"],
      nutritionInfo: {
        calories: 820,
        protein: "45g",
        carbs: "48g",
        fat: "52g"
      },
      spiceLevel: 1,
      image: "/images/wagyu-burger.jpg",
      availability: {
        monday: { lunch: true, dinner: true },
        tuesday: { lunch: true, dinner: true },
        wednesday: { lunch: true, dinner: true },
        thursday: { lunch: true, dinner: true },
        friday: { lunch: true, dinner: true },
        saturday: { lunch: true, dinner: true },
        sunday: { lunch: true, dinner: true }
      },
      status: "available",
      totalOrders: 267,
      rating: 4.7,
      reviewCount: 189
    },
    {
      name: "Caesar Salad",
      description: "Classic Caesar salad with house-made croutons and parmesan",
      longDescription: "Fresh romaine lettuce tossed in our house-made Caesar dressing with parmesan cheese, house-made croutons, and anchovies. Add grilled chicken or shrimp for extra protein.",
      category: "salad",
      price: 14.99,
      prepTime: 10,
      servings: 1,
      dietaryPreferences: ["vegetarian"],
      ingredients: ["romaine lettuce", "parmesan", "croutons", "Caesar dressing", "anchovies"],
      allergens: ["dairy", "gluten", "fish"],
      nutritionInfo: {
        calories: 320,
        protein: "12g",
        carbs: "18g",
        fat: "24g"
      },
      spiceLevel: 0,
      image: "/images/caesar-salad.jpg",
      availability: {
        monday: { lunch: true, dinner: true },
        tuesday: { lunch: true, dinner: true },
        wednesday: { lunch: true, dinner: true },
        thursday: { lunch: true, dinner: true },
        friday: { lunch: true, dinner: true },
        saturday: { lunch: true, dinner: true },
        sunday: { lunch: true, dinner: true }
      },
      status: "available",
      totalOrders: 198,
      rating: 4.4,
      reviewCount: 142
    }
  ],
  "Bella Vista Italian": [
    {
      name: "Osso Buco Risotto",
      description: "Braised veal shanks with saffron risotto and gremolata",
      longDescription: "Traditional Milanese osso buco with tender braised veal shanks served over creamy saffron risotto, finished with fresh gremolata and a rich bone marrow sauce.",
      category: "main",
      price: 42.99,
      prepTime: 35,
      servings: 1,
      dietaryPreferences: ["gluten-free"],
      ingredients: ["veal shanks", "risotto rice", "saffron", "bone marrow", "gremolata"],
      allergens: ["dairy"],
      nutritionInfo: {
        calories: 680,
        protein: "48g",
        carbs: "52g",
        fat: "32g"
      },
      spiceLevel: 1,
      image: "/images/osso-buco-risotto.jpg",
      availability: {
        monday: { lunch: false, dinner: true },
        tuesday: { lunch: false, dinner: true },
        wednesday: { lunch: false, dinner: true },
        thursday: { lunch: false, dinner: true },
        friday: { lunch: true, dinner: true },
        saturday: { lunch: true, dinner: true },
        sunday: { lunch: true, dinner: true }
      },
      status: "available",
      totalOrders: 89,
      rating: 4.8,
      reviewCount: 67
    },
    {
      name: "Truffle Pasta",
      description: "Fresh pasta with black truffle, parmesan, and butter sauce",
      longDescription: "House-made fresh pasta tossed in a rich butter sauce with shaved black truffles, aged parmesan, and fresh herbs. A luxurious and aromatic dish.",
      category: "pasta",
      price: 36.99,
      prepTime: 20,
      servings: 1,
      dietaryPreferences: ["vegetarian"],
      ingredients: ["fresh pasta", "black truffle", "parmesan", "butter", "herbs"],
      allergens: ["gluten", "dairy", "eggs"],
      nutritionInfo: {
        calories: 580,
        protein: "22g",
        carbs: "68g",
        fat: "28g"
      },
      spiceLevel: 0,
      image: "/images/truffle-pasta.jpg",
      availability: {
        monday: { lunch: true, dinner: true },
        tuesday: { lunch: true, dinner: true },
        wednesday: { lunch: true, dinner: true },
        thursday: { lunch: true, dinner: true },
        friday: { lunch: true, dinner: true },
        saturday: { lunch: true, dinner: true },
        sunday: { lunch: true, dinner: true }
      },
      status: "available",
      totalOrders: 156,
      rating: 4.7,
      reviewCount: 98
    },
    {
      name: "Margherita Pizza",
      description: "Classic Neapolitan pizza with San Marzano tomatoes and fresh mozzarella",
      longDescription: "Authentic Neapolitan pizza with San Marzano tomato sauce, fresh mozzarella di bufala, fresh basil, and extra virgin olive oil on our wood-fired sourdough crust.",
      category: "pizza",
      price: 22.99,
      prepTime: 15,
      servings: 1,
      dietaryPreferences: ["vegetarian"],
      ingredients: ["sourdough crust", "San Marzano tomatoes", "mozzarella di bufala", "basil", "olive oil"],
      allergens: ["gluten", "dairy"],
      nutritionInfo: {
        calories: 520,
        protein: "24g",
        carbs: "62g",
        fat: "22g"
      },
      spiceLevel: 0,
      image: "/images/margherita-pizza.jpg",
      availability: {
        monday: { lunch: true, dinner: true },
        tuesday: { lunch: true, dinner: true },
        wednesday: { lunch: true, dinner: true },
        thursday: { lunch: true, dinner: true },
        friday: { lunch: true, dinner: true },
        saturday: { lunch: true, dinner: true },
        sunday: { lunch: true, dinner: true }
      },
      status: "available",
      totalOrders: 298,
      rating: 4.6,
      reviewCount: 201
    },
    {
      name: "Tiramisu",
      description: "Classic Italian tiramisu with mascarpone and espresso",
      longDescription: "Traditional tiramisu made with ladyfingers soaked in espresso and coffee liqueur, layered with mascarpone cream and dusted with cocoa powder.",
      category: "dessert",
      price: 8.99,
      prepTime: 5,
      servings: 1,
      dietaryPreferences: ["vegetarian"],
      ingredients: ["ladyfingers", "espresso", "mascarpone", "eggs", "cocoa powder"],
      allergens: ["gluten", "dairy", "eggs", "alcohol"],
      nutritionInfo: {
        calories: 420,
        protein: "8g",
        carbs: "38g",
        fat: "26g"
      },
      spiceLevel: 0,
      image: "/images/tiramisu.jpg",
      availability: {
        monday: { lunch: true, dinner: true },
        tuesday: { lunch: true, dinner: true },
        wednesday: { lunch: true, dinner: true },
        thursday: { lunch: true, dinner: true },
        friday: { lunch: true, dinner: true },
        saturday: { lunch: true, dinner: true },
        sunday: { lunch: true, dinner: true }
      },
      status: "available",
      totalOrders: 234,
      rating: 4.5,
      reviewCount: 167
    }
  ]
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  }
};

const seedMenuItems = async () => {
  try {
    console.log('🌱 Starting menu items seeding...');

    // Clear existing menu items
    await MenuItem.deleteMany({});
    console.log('🗑️  Cleared existing menu items');

    // Get all restaurants
    const restaurants = await Restaurant.find({});
    console.log(`📋 Found ${restaurants.length} restaurants`);

    let totalItemsCreated = 0;

    for (const restaurant of restaurants) {
      const restaurantMenuItems = menuItemsData[restaurant.name];
      
      if (!restaurantMenuItems) {
        console.log(`⚠️  No menu items defined for ${restaurant.name}`);
        continue;
      }

      console.log(`🍽️  Creating menu items for ${restaurant.name}...`);

      for (const itemData of restaurantMenuItems) {
        const menuItem = new MenuItem({
          ...itemData,
          restaurantId: restaurant._id
        });

        await menuItem.save();
        totalItemsCreated++;
      }

      console.log(`✅ Created ${restaurantMenuItems.length} menu items for ${restaurant.name}`);
    }

    console.log(`🎉 Successfully seeded ${totalItemsCreated} menu items!`);

    // Display summary
    const itemsByRestaurant = await MenuItem.aggregate([
      {
        $lookup: {
          from: 'restaurants',
          localField: 'restaurantId',
          foreignField: '_id',
          as: 'restaurant'
        }
      },
      {
        $unwind: '$restaurant'
      },
      {
        $group: {
          _id: '$restaurant.name',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          categories: { $addToSet: '$category' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    console.log('\n📊 Menu Items Summary:');
    itemsByRestaurant.forEach(item => {
      console.log(`   ${item._id}: ${item.count} items, avg price: $${item.avgPrice.toFixed(2)}, categories: ${item.categories.join(', ')}`);
    });

  } catch (error) {
    console.error('❌ Error seeding menu items:', error);
    process.exit(1);
  }
};

const main = async () => {
  await connectDB();
  await seedMenuItems();
  
  console.log('✅ Menu items seeding completed!');
  process.exit(0);
};

// Run the script
if (require.main === module) {
  main();
}

module.exports = { seedMenuItems };
