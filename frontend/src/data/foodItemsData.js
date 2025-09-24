// Import additional food items
import { additionalFoodItems } from './additionalFoodItems';

// Food items data for each restaurant
export const foodItemsData = {
  1: { // Sakura Sushi Bar
    lunch: [
      {
        id: 'sushi-1',
        name: 'California Roll',
        description: 'Fresh crab, avocado, and cucumber wrapped in seasoned rice',
        price: 12.99,
        image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        preferences: ['gluten-free', 'pescatarian'],
        category: 'Sushi Rolls',
        rating: 4.8,
        isPopular: true
      },
      {
        id: 'sushi-2',
        name: 'Salmon Teriyaki Bowl',
        description: 'Grilled salmon with teriyaki glaze over steamed rice and vegetables',
        price: 16.99,
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        preferences: ['gluten-free', 'pescatarian', 'dairy-free'],
        category: 'Rice Bowls',
        rating: 4.9,
        isPopular: true
      },
      {
        id: 'sushi-3',
        name: 'Vegetable Tempura',
        description: 'Lightly battered and fried seasonal vegetables with dipping sauce',
        price: 10.99,
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        preferences: ['vegetarian'],
        category: 'Appetizers',
        rating: 4.6,
        isPopular: false
      }
    ],
    dinner: [
      {
        id: 'sushi-4',
        name: 'Omakase Platter',
        description: "Chef's selection of 12 pieces of premium sashimi and nigiri",
        price: 45.99,
        image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        preferences: ['gluten-free', 'pescatarian', 'dairy-free'],
        category: 'Premium Selection',
        rating: 4.9,
        isPopular: true
      },
      {
        id: 'sushi-5',
        name: 'Dragon Roll',
        description: 'Eel and cucumber inside, topped with avocado and eel sauce',
        price: 18.99,
        image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        preferences: ['pescatarian'],
        category: 'Specialty Rolls',
        rating: 4.7,
        isPopular: true
      }
    ]
  },
  2: { // Burger Palace
    lunch: [
      {
        id: 'burger-1',
        name: 'Classic Beef Burger',
        description: 'Juicy beef patty with lettuce, tomato, onion, and special sauce',
        price: 14.99,
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        preferences: ['halal'],
        category: 'Burgers',
        rating: 4.6,
        isPopular: true
      },
      {
        id: 'burger-2',
        name: 'Veggie Deluxe Burger',
        description: 'House-made veggie patty with avocado, sprouts, and herb mayo',
        price: 13.99,
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        preferences: ['vegetarian'],
        category: 'Burgers',
        rating: 4.4,
        isPopular: true
      },
      {
        id: 'burger-3',
        name: 'Sweet Potato Fries',
        description: 'Crispy sweet potato fries with garlic aioli dipping sauce',
        price: 7.99,
        image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        preferences: ['vegetarian', 'gluten-free'],
        category: 'Sides',
        rating: 4.5,
        isPopular: false
      }
    ],
    dinner: [
      {
        id: 'burger-4',
        name: 'Premium Wagyu Burger',
        description: 'Wagyu beef patty with truffle mayo, arugula, and aged cheddar',
        price: 24.99,
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        preferences: ['halal'],
        category: 'Premium Burgers',
        rating: 4.8,
        isPopular: true
      },
      {
        id: 'burger-5',
        name: 'BBQ Bacon Burger',
        description: 'Double beef patty with crispy bacon, BBQ sauce, and onion rings',
        price: 18.99,
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        preferences: ['halal'],
        category: 'Specialty Burgers',
        rating: 4.7,
        isPopular: true
      }
    ]
  },
  3: { // Green Garden Bistro
    lunch: [
      {
        id: 'green-1',
        name: 'Quinoa Power Bowl',
        description: 'Organic quinoa with roasted vegetables, avocado, and tahini dressing',
        price: 15.99,
        image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        preferences: ['vegan', 'vegetarian', 'gluten-free', 'organic'],
        category: 'Power Bowls',
        rating: 4.9,
        isPopular: true
      },
      {
        id: 'green-2',
        name: 'Mediterranean Wrap',
        description: 'Hummus, grilled vegetables, feta, and fresh herbs in whole wheat wrap',
        price: 12.99,
        image: 'https://images.unsplash.com/photo-1565299585323-38174c4a6471?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        preferences: ['vegetarian', 'organic'],
        category: 'Wraps',
        rating: 4.7,
        isPopular: true
      },
      {
        id: 'green-3',
        name: 'Green Goddess Smoothie',
        description: 'Spinach, mango, banana, coconut milk, and chia seeds',
        price: 8.99,
        image: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        preferences: ['vegan', 'vegetarian', 'gluten-free', 'organic'],
        category: 'Beverages',
        rating: 4.6,
        isPopular: false
      }
    ],
    dinner: [
      {
        id: 'green-4',
        name: 'Stuffed Portobello Mushroom',
        description: 'Grilled portobello stuffed with quinoa, herbs, and cashew cream',
        price: 19.99,
        image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        preferences: ['vegan', 'vegetarian', 'gluten-free', 'organic'],
        category: 'Main Courses',
        rating: 4.8,
        isPopular: true
      },
      {
        id: 'green-5',
        name: 'Lentil Walnut Bolognese',
        description: 'House-made pasta with rich lentil and walnut bolognese sauce',
        price: 17.99,
        image: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        preferences: ['vegan', 'vegetarian', 'organic'],
        category: 'Pasta',
        rating: 4.9,
        isPopular: true
      }
    ]
  },
  4: { // Ramen House Tokyo
    lunch: [
      {
        id: 'ramen-1',
        name: 'Tonkotsu Ramen',
        description: 'Rich pork bone broth with chashu, soft-boiled egg, and green onions',
        price: 16.99,
        image: 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        preferences: ['dairy-free', 'spicy'],
        category: 'Ramen',
        rating: 4.8,
        isPopular: true
      },
      {
        id: 'ramen-2',
        name: 'Vegetarian Miso Ramen',
        description: 'Savory miso broth with tofu, corn, bamboo shoots, and nori',
        price: 14.99,
        image: 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        preferences: ['vegetarian', 'dairy-free'],
        category: 'Ramen',
        rating: 4.6,
        isPopular: true
      },
      {
        id: 'ramen-3',
        name: 'Gyoza (6 pieces)',
        description: 'Pan-fried pork and vegetable dumplings with dipping sauce',
        price: 9.99,
        image: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        preferences: ['dairy-free'],
        category: 'Appetizers',
        rating: 4.7,
        isPopular: false
      }
    ],
    dinner: [
      {
        id: 'ramen-4',
        name: 'Spicy Tantanmen',
        description: 'Sesame and chili oil broth with ground pork and bok choy',
        price: 18.99,
        image: 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        preferences: ['spicy', 'dairy-free'],
        category: 'Specialty Ramen',
        rating: 4.9,
        isPopular: true
      },
      {
        id: 'ramen-5',
        name: 'Seafood Ramen',
        description: 'Clear broth with shrimp, scallops, and mixed vegetables',
        price: 21.99,
        image: 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        preferences: ['pescatarian', 'dairy-free'],
        category: 'Premium Ramen',
        rating: 4.8,
        isPopular: true
      },
      {
        id: 'ramen-5',
        name: 'Seafood Ramen',
        description: 'Clear broth with shrimp, scallops, and mixed vegetables',
        price: 21.99,
        image: 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        preferences: ['pescatarian', 'dairy-free'],
        category: 'Premium Ramen',
        rating: 4.8,
        isPopular: true
      },
      {
        id: 'ramen-5',
        name: 'Seafood Ramen',
        description: 'Clear broth with shrimp, scallops, and mixed vegetables',
        price: 21.99,
        image: 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        preferences: ['pescatarian', 'dairy-free'],
        category: 'Premium Ramen',
        rating: 4.8,
        isPopular: true
      },
      {
        id: 'ramen-5',
        name: 'Seafood Ramen',
        description: 'Clear broth with shrimp, scallops, and mixed vegetables',
        price: 21.99,
        image: 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        preferences: ['pescatarian', 'dairy-free'],
        category: 'Premium Ramen',
        rating: 4.8,
        isPopular: true
      },
      {
        id: 'ramen-5',
        name: 'Seafood Ramen',
        description: 'Clear broth with shrimp, scallops, and mixed vegetables',
        price: 21.99,
        image: 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        preferences: ['pescatarian', 'dairy-free'],
        category: 'Premium Ramen',
        rating: 4.8,
        isPopular: true
      },
      {
        id: 'ramen-5',
        name: 'Seafood Ramen',
        description: 'Clear broth with shrimp, scallops, and mixed vegetables',
        price: 21.99,
        image: 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        preferences: ['pescatarian', 'dairy-free'],
        category: 'Premium Ramen',
        rating: 4.8,
        isPopular: true
      },
      {
        id: 'ramen-5',
        name: 'Seafood Ramen',
        description: 'Clear broth with shrimp, scallops, and mixed vegetables',
        price: 21.99,
        image: 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        preferences: ['pescatarian', 'dairy-free'],
        category: 'Premium Ramen',
        rating: 4.8,
        isPopular: true
      },
      {
        id: 'ramen-5',
        name: 'Seafood Ramen',
        description: 'Clear broth with shrimp, scallops, and mixed vegetables',
        price: 21.99,
        image: 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        preferences: ['pescatarian', 'dairy-free'],
        category: 'Premium Ramen',
        rating: 4.8,
        isPopular: true
      },
      {
        id: 'ramen-5',
        name: 'Seafood Ramen',
        description: 'Clear broth with shrimp, scallops, and mixed vegetables',
        price: 21.99,
        image: 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        preferences: ['pescatarian', 'dairy-free'],
        category: 'Premium Ramen',
        rating: 4.8,
        isPopular: true
      },
      {
        id: 'ramen-5',
        name: 'Seafood Ramen',
        description: 'Clear broth with shrimp, scallops, and mixed vegetables',
        price: 21.99,
        image: 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        preferences: ['pescatarian', 'dairy-free'],
        category: 'Premium Ramen',
        rating: 4.8,
        isPopular: true
      },
      {
        id: 'ramen-5',
        name: 'Seafood Ramen',
        description: 'Clear broth with shrimp, scallops, and mixed vegetables',
        price: 21.99,
        image: 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        preferences: ['pescatarian', 'dairy-free'],
        category: 'Premium Ramen',
        rating: 4.8,
        isPopular: true
      }
    ]
  },
  5: { // Mediterranean Delight
    lunch: [
      {
        id: 'med-1',
        name: 'Greek Chicken Souvlaki',
        description: 'Grilled chicken skewers with tzatziki, pita, and Greek salad',
        price: 17.99,
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        preferences: ['halal', 'gluten-free', 'dairy-free'],
        category: 'Grilled Specialties',
        rating: 4.7,
        isPopular: true
      },
      {
        id: 'med-2',
        name: 'Falafel Wrap',
        description: 'Crispy falafel with hummus, vegetables, and tahini in pita',
        price: 13.99,
        image: 'https://images.unsplash.com/photo-1565299585323-38174c4a6471?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        preferences: ['vegetarian', 'vegan'],
        category: 'Wraps',
        rating: 4.5,
        isPopular: true
      }
    ],
    dinner: [
      {
        id: 'med-3',
        name: 'Lamb Moussaka',
        description: 'Traditional Greek casserole with lamb, eggplant, and béchamel',
        price: 24.99,
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        preferences: ['halal'],
        category: 'Traditional Dishes',
        rating: 4.8,
        isPopular: true
      }
    ]
  },
  6: { // Taco Fiesta
    lunch: [
      {
        id: 'taco-1',
        name: 'Street Tacos (3 pack)',
        description: 'Authentic corn tortillas with carnitas, onions, and cilantro',
        price: 11.99,
        image: 'https://images.unsplash.com/photo-1565299585323-38174c4a6471?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        preferences: ['gluten-free', 'spicy'],
        category: 'Tacos',
        rating: 4.6,
        isPopular: true
      }
    ],
    dinner: [
      {
        id: 'taco-2',
        name: 'Veggie Burrito Bowl',
        description: 'Black beans, rice, peppers, avocado, and salsa verde',
        price: 14.99,
        image: 'https://images.unsplash.com/photo-1565299585323-38174c4a6471?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        preferences: ['vegetarian', 'vegan', 'gluten-free'],
        category: 'Bowls',
        rating: 4.4,
        isPopular: true
      }
    ]
  },
  // Merge additional food items
  ...additionalFoodItems
};

// Helper functions for food items
export const getFoodItemsByRestaurant = (restaurantId) => {
  return foodItemsData[restaurantId] || { lunch: [], dinner: [] };
};

export const getFoodItemsByMealType = (restaurantId, mealType) => {
  const restaurantItems = foodItemsData[restaurantId];
  if (!restaurantItems) return [];
  return restaurantItems[mealType] || [];
};

export const filterFoodItemsByPreferences = (items, preferences) => {
  if (!preferences || preferences.length === 0) return items;
  
  return items.filter(item => 
    preferences.some(preference => 
      item.preferences.includes(preference)
    )
  );
};

export const getFoodItemsByCategory = (items) => {
  const categories = {};
  items.forEach(item => {
    if (!categories[item.category]) {
      categories[item.category] = [];
    }
    categories[item.category].push(item);
  });
  return categories;
};
