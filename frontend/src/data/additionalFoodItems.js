// Additional food items to extend the existing data
export const additionalFoodItems = {
  7: { // Pizza Artisan
    lunch: [
      {
        id: 'pizza-1',
        name: 'Margherita Pizza',
        description: 'Classic tomato sauce, fresh mozzarella, and basil on wood-fired crust',
        price: 16.99,
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        preferences: ['vegetarian'],
        category: 'Classic Pizzas',
        rating: 4.7,
        isPopular: true
      },
      {
        id: 'pizza-2',
        name: 'Caesar Salad',
        description: 'Crisp romaine lettuce, parmesan, croutons, and house Caesar dressing',
        price: 12.99,
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        preferences: ['vegetarian'],
        category: 'Salads',
        rating: 4.4,
        isPopular: false
      },
      {
        id: 'pizza-3',
        name: 'Garlic Bread',
        description: 'Wood-fired bread with garlic butter, herbs, and parmesan',
        price: 8.99,
        image: 'https://images.unsplash.com/photo-1573821663912-6df460f9c684?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        preferences: ['vegetarian'],
        category: 'Appetizers',
        rating: 4.5,
        isPopular: true
      }
    ],
    dinner: [
      {
        id: 'pizza-4',
        name: 'Truffle Mushroom Pizza',
        description: 'Wild mushrooms, truffle oil, mozzarella, and arugula',
        price: 24.99,
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        preferences: ['vegetarian'],
        category: 'Gourmet Pizzas',
        rating: 4.8,
        isPopular: true
      },
      {
        id: 'pizza-5',
        name: 'Halal Pepperoni Pizza',
        description: 'Halal pepperoni, mozzarella, and tomato sauce on crispy crust',
        price: 19.99,
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        preferences: ['halal'],
        category: 'Meat Pizzas',
        rating: 4.6,
        isPopular: true
      },
      {
        id: 'pizza-6',
        name: 'Tiramisu',
        description: 'Classic Italian dessert with coffee-soaked ladyfingers and mascarpone',
        price: 9.99,
        image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        preferences: ['vegetarian'],
        category: 'Desserts',
        rating: 4.7,
        isPopular: false
      }
    ]
  },
  8: { // Healthy Bowl Co.
    lunch: [
      {
        id: 'healthy-1',
        name: 'Acai Power Bowl',
        description: 'Acai base with granola, fresh berries, coconut, and honey',
        price: 14.99,
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        preferences: ['vegetarian', 'gluten-free', 'organic'],
        category: 'Smoothie Bowls',
        rating: 4.8,
        isPopular: true
      },
      {
        id: 'healthy-2',
        name: 'Keto Chicken Bowl',
        description: 'Grilled chicken, avocado, spinach, and cauliflower rice',
        price: 17.99,
        image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        preferences: ['keto', 'gluten-free', 'dairy-free'],
        category: 'Protein Bowls',
        rating: 4.7,
        isPopular: true
      },
      {
        id: 'healthy-3',
        name: 'Green Detox Juice',
        description: 'Kale, spinach, cucumber, apple, lemon, and ginger',
        price: 8.99,
        image: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        preferences: ['vegan', 'vegetarian', 'gluten-free', 'organic'],
        category: 'Fresh Juices',
        rating: 4.5,
        isPopular: false
      },
      {
        id: 'healthy-4',
        name: 'Chia Pudding Parfait',
        description: 'Vanilla chia pudding layered with fresh fruit and nuts',
        price: 11.99,
        image: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        preferences: ['vegan', 'vegetarian', 'gluten-free', 'organic'],
        category: 'Healthy Desserts',
        rating: 4.6,
        isPopular: true
      }
    ],
    dinner: [
      {
        id: 'healthy-5',
        name: 'Buddha Bowl Supreme',
        description: 'Quinoa, roasted vegetables, tahini dressing, and hemp seeds',
        price: 18.99,
        image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        preferences: ['vegan', 'vegetarian', 'gluten-free', 'organic'],
        category: 'Buddha Bowls',
        rating: 4.9,
        isPopular: true
      },
      {
        id: 'healthy-6',
        name: 'Paleo Salmon Bowl',
        description: 'Wild salmon, sweet potato, broccoli, and avocado',
        price: 22.99,
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        preferences: ['paleo', 'gluten-free', 'dairy-free'],
        category: 'Paleo Bowls',
        rating: 4.8,
        isPopular: true
      }
    ]
  },
  9: { // Steakhouse Prime
    lunch: [
      {
        id: 'steak-1',
        name: 'Steak Sandwich',
        description: 'Grilled sirloin with caramelized onions and horseradish aioli',
        price: 19.99,
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        preferences: ['halal'],
        category: 'Sandwiches',
        rating: 4.6,
        isPopular: true
      },
      {
        id: 'steak-2',
        name: 'Beef Carpaccio',
        description: 'Thinly sliced raw beef with arugula, capers, and parmesan',
        price: 16.99,
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        preferences: ['keto', 'gluten-free'],
        category: 'Appetizers',
        rating: 4.7,
        isPopular: false
      }
    ],
    dinner: [
      {
        id: 'steak-3',
        name: 'Prime Ribeye (12oz)',
        description: 'Premium aged ribeye with garlic mashed potatoes and asparagus',
        price: 45.99,
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        preferences: ['halal', 'keto'],
        category: 'Premium Steaks',
        rating: 4.9,
        isPopular: true
      },
      {
        id: 'steak-4',
        name: 'Surf & Turf',
        description: 'Filet mignon with lobster tail, drawn butter, and vegetables',
        price: 52.99,
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        preferences: ['halal', 'keto'],
        category: 'Signature Dishes',
        rating: 4.8,
        isPopular: true
      },
      {
        id: 'steak-5',
        name: 'Chocolate Lava Cake',
        description: 'Warm chocolate cake with molten center and vanilla ice cream',
        price: 12.99,
        image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        preferences: ['vegetarian'],
        category: 'Desserts',
        rating: 4.7,
        isPopular: true
      }
    ]
  },
  10: { // Noodle Express
    lunch: [
      {
        id: 'noodle-1',
        name: 'Pad Thai',
        description: 'Stir-fried rice noodles with shrimp, tofu, bean sprouts, and peanuts',
        price: 13.99,
        image: 'https://images.unsplash.com/photo-1555126634-323283e090fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        preferences: ['gluten-free'],
        category: 'Thai Noodles',
        rating: 4.5,
        isPopular: true
      },
      {
        id: 'noodle-2',
        name: 'Vegetable Lo Mein',
        description: 'Soft noodles with mixed vegetables in savory soy-based sauce',
        price: 11.99,
        image: 'https://images.unsplash.com/photo-1555126634-323283e090fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        preferences: ['vegetarian', 'vegan'],
        category: 'Chinese Noodles',
        rating: 4.3,
        isPopular: true
      },
      {
        id: 'noodle-3',
        name: 'Spring Rolls (4 pieces)',
        description: 'Fresh vegetables wrapped in rice paper with peanut dipping sauce',
        price: 8.99,
        image: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        preferences: ['vegetarian', 'vegan', 'gluten-free'],
        category: 'Appetizers',
        rating: 4.4,
        isPopular: false
      }
    ],
    dinner: [
      {
        id: 'noodle-4',
        name: 'Spicy Dan Dan Noodles',
        description: 'Sichuan noodles with ground pork, preserved vegetables, and chili oil',
        price: 16.99,
        image: 'https://images.unsplash.com/photo-1555126634-323283e090fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        preferences: ['spicy', 'dairy-free'],
        category: 'Sichuan Noodles',
        rating: 4.6,
        isPopular: true
      },
      {
        id: 'noodle-5',
        name: 'Singapore Rice Noodles',
        description: 'Curry-flavored rice noodles with shrimp, char siu, and vegetables',
        price: 15.99,
        image: 'https://images.unsplash.com/photo-1555126634-323283e090fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        preferences: ['gluten-free', 'spicy'],
        category: 'Southeast Asian',
        rating: 4.4,
        isPopular: true
      },
      {
        id: 'noodle-6',
        name: 'Mango Sticky Rice',
        description: 'Sweet sticky rice with fresh mango and coconut milk',
        price: 9.99,
        image: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        preferences: ['vegetarian', 'vegan', 'gluten-free'],
        category: 'Thai Desserts',
        rating: 4.5,
        isPopular: false
      }
    ]
  }
};
