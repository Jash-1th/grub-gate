// Unified restaurant data with embedded menu items for both normal and pro users
export const unifiedRestaurants = [
  // Restaurant ID: 1 - Chez Laurent Premium (French Bistro)
  {
    id: 1,
    name: 'Chez Laurent Premium',
    image: '/images/grub-gate-default-restaurant-img.jpg',
    rating: 4.8,
    reviewCount: 2156,
    description: 'Top-rated French bistro with seasonal ingredients and exceptional wine selection.',
    cuisine: 'French Bistro',
    deliveryTime: '25-35 min',
    deliveryFee: '$3.99',
    minOrder: '$25',
    isOpen: true,
    isPopular: true,
    isTopRated: true,
    tags: ['French', 'Bistro', 'Premium', 'Wine'],
    location: 'H3A - Downtown Montreal',
    postalCode: 'H3A',
    phone: '(514) 555-0101',
    address: '1234 Rue Sherbrooke, Montreal, QC H3A 1B2',
    coordinates: { lat: 45.5048, lng: -73.5772 },
    preferences: ['gluten-free', 'vegetarian', 'dairy-free', 'spicy'],
    foodItems: [
      // Main Courses
      {
        id: 101,
        planId: 'chez-laurent-coq-au-vin-101',
        name: 'Coq au Vin',
        price: 28.99,
        description: 'Classic French chicken braised in red wine with mushrooms.',
        longDescription: 'Traditional Burgundian dish featuring free-range chicken slowly braised in red wine with bacon, mushrooms, pearl onions, and fresh herbs. Served with creamy mashed potatoes and seasonal vegetables.',
        category: 'Main Courses',
        dietaryPreferences: ['gluten-free'],
        ingredients: ['Free-range chicken', 'Red wine', 'Bacon', 'Button mushrooms', 'Pearl onions', 'Fresh herbs'],
        nutritionInfo: { calories: 580, protein: '42g', carbs: '18g', fat: '32g' },
        spiceLevel: 0,
        preparationTime: '25-30 min',
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        availability: {
          monday: { lunch: true, dinner: true },
          tuesday: { lunch: true, dinner: true },
          wednesday: { lunch: true, dinner: true },
          thursday: { lunch: true, dinner: true },
          friday: { lunch: true, dinner: true },
          saturday: { lunch: true, dinner: true },
          sunday: { lunch: true, dinner: true }
        }
      },
      {
        id: 102,
        planId: 'chez-laurent-duck-confit-102',
        name: 'Duck Confit',
        price: 32.99,
        description: 'Slow-cooked duck leg with garlic, herbs, and crispy skin.',
        longDescription: 'Traditional duck leg slowly cooked in its own fat with garlic, thyme, and bay leaves until tender. Served with roasted potatoes and a cherry gastrique.',
        category: 'Main Courses',
        dietaryPreferences: ['gluten-free', 'dairy-free'],
        ingredients: ['Duck leg', 'Duck fat', 'Garlic', 'Thyme', 'Bay leaves', 'Cherry gastrique'],
        nutritionInfo: { calories: 650, protein: '38g', carbs: '22g', fat: '45g' },
        spiceLevel: 0,
        preparationTime: '20-25 min',
        image: 'https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        availability: {
          monday: { lunch: true, dinner: true },
          tuesday: { lunch: true, dinner: true },
          wednesday: { lunch: true, dinner: true },
          thursday: { lunch: true, dinner: true },
          friday: { lunch: true, dinner: true },
          saturday: { lunch: true, dinner: true },
          sunday: { lunch: true, dinner: true }
        }
      },
      // Vegetarian Options
      {
        id: 103,
        planId: 'chez-laurent-ratatouille-103',
        name: 'Ratatouille Provençale',
        price: 18.99,
        description: 'Traditional Provençal vegetable stew with eggplant, zucchini, and tomatoes.',
        longDescription: 'A rustic and flavorful stew from Provence featuring layers of eggplant, zucchini, bell peppers, and tomatoes, slow-cooked with herbs de Provence.',
        category: 'Vegetarian',
        dietaryPreferences: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free'],
        ingredients: ['Eggplant', 'Zucchini', 'Bell peppers', 'Tomatoes', 'Herbs de Provence', 'Olive oil'],
        nutritionInfo: { calories: 280, protein: '8g', carbs: '32g', fat: '14g' },
        spiceLevel: 0,
        preparationTime: '18-22 min',
        image: 'https://images.unsplash.com/photo-1572441713132-51c75654db73?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        availability: {
          monday: { lunch: true, dinner: true },
          tuesday: { lunch: true, dinner: true },
          wednesday: { lunch: true, dinner: true },
          thursday: { lunch: true, dinner: true },
          friday: { lunch: true, dinner: true },
          saturday: { lunch: true, dinner: true },
          sunday: { lunch: true, dinner: true }
        }
      },
      // Soups & Starters
      {
        id: 104,
        planId: 'chez-laurent-french-onion-soup-104',
        name: 'French Onion Soup',
        price: 12.99,
        description: 'Traditional soup with caramelized onions and melted Gruyère cheese.',
        longDescription: 'A timeless French classic featuring slowly caramelized onions simmered in rich beef broth, topped with toasted baguette and melted Gruyère cheese.',
        category: 'Soups & Starters',
        dietaryPreferences: ['vegetarian'],
        ingredients: ['Yellow onions', 'Beef broth', 'Gruyère cheese', 'Baguette', 'White wine'],
        nutritionInfo: { calories: 320, protein: '18g', carbs: '28g', fat: '16g' },
        spiceLevel: 0,
        preparationTime: '15-20 min',
        image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        availability: {
          monday: { lunch: true, dinner: true },
          tuesday: { lunch: true, dinner: true },
          wednesday: { lunch: true, dinner: true },
          thursday: { lunch: true, dinner: true },
          friday: { lunch: true, dinner: true },
          saturday: { lunch: true, dinner: true },
          sunday: { lunch: true, dinner: true }
        }
      },
      // Spicy Options
      {
        id: 105,
        planId: 'chez-laurent-spicy-curry-105',
        name: 'Thai Green Curry',
        price: 18.99,
        description: 'Aromatic green curry with coconut milk, vegetables, and jasmine rice.',
        longDescription: 'Authentic Thai green curry made with fresh green chilies, coconut milk, Thai basil, and seasonal vegetables. Served with fragrant jasmine rice.',
        category: 'Asian Fusion',
        dietaryPreferences: ['gluten-free', 'spicy', 'dairy-free'],
        ingredients: ['Green curry paste', 'Coconut milk', 'Thai basil', 'Seasonal vegetables', 'Jasmine rice'],
        nutritionInfo: { calories: 380, protein: '12g', carbs: '45g', fat: '18g' },
        spiceLevel: 3,
        preparationTime: '15-20 min',
        image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        availability: {
          monday: { lunch: false, dinner: true },
          tuesday: { lunch: false, dinner: true },
          wednesday: { lunch: true, dinner: true },
          thursday: { lunch: false, dinner: true },
          friday: { lunch: true, dinner: true },
          saturday: { lunch: true, dinner: true },
          sunday: { lunch: false, dinner: true }
        }
      },
      // Lunch-Only Specials
      {
        id: 106,
        planId: 'chez-laurent-croque-monsieur-106',
        name: 'Croque Monsieur',
        price: 14.99,
        description: 'Classic French grilled ham and cheese sandwich with béchamel sauce.',
        longDescription: 'Traditional Parisian café favorite with premium ham, Gruyère cheese, and creamy béchamel sauce, grilled to golden perfection. Served with mixed greens.',
        category: 'Lunch Specials',
        dietaryPreferences: [],
        ingredients: ['Ham', 'Gruyère cheese', 'Béchamel sauce', 'Brioche bread', 'Mixed greens'],
        nutritionInfo: { calories: 450, protein: '28g', carbs: '32g', fat: '24g' },
        spiceLevel: 0,
        preparationTime: '12-15 min',
        image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        availability: {
          monday: { lunch: true, dinner: false },
          tuesday: { lunch: true, dinner: false },
          wednesday: { lunch: true, dinner: false },
          thursday: { lunch: true, dinner: false },
          friday: { lunch: true, dinner: false },
          saturday: { lunch: false, dinner: false },
          sunday: { lunch: false, dinner: false }
        }
      },
      {
        id: 107,
        planId: 'chez-laurent-salade-nicoise-107',
        name: 'Salade Niçoise',
        price: 16.99,
        description: 'Traditional French salad with tuna, eggs, olives, and anchovies.',
        longDescription: 'Authentic Niçoise salad with fresh tuna, hard-boiled eggs, green beans, tomatoes, olives, and anchovies. Dressed with olive oil and herbs.',
        category: 'Lunch Specials',
        dietaryPreferences: ['gluten-free', 'pescatarian'],
        ingredients: ['Fresh tuna', 'Hard-boiled eggs', 'Green beans', 'Tomatoes', 'Olives', 'Anchovies'],
        nutritionInfo: { calories: 380, protein: '32g', carbs: '18g', fat: '22g' },
        spiceLevel: 0,
        preparationTime: '10-12 min',
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        availability: {
          monday: { lunch: true, dinner: false },
          tuesday: { lunch: true, dinner: false },
          wednesday: { lunch: true, dinner: false },
          thursday: { lunch: true, dinner: false },
          friday: { lunch: true, dinner: false },
          saturday: { lunch: true, dinner: false },
          sunday: { lunch: true, dinner: false }
        }
      },
      // Weekend Specials
      {
        id: 108,
        planId: 'chez-laurent-bouillabaisse-108',
        name: 'Bouillabaisse Marseillaise',
        price: 38.99,
        description: 'Traditional Provençal fish stew with saffron and rouille.',
        longDescription: 'Authentic bouillabaisse from Marseille with fresh Mediterranean fish, shellfish, saffron broth, and traditional rouille sauce. A weekend specialty.',
        category: 'Weekend Specials',
        dietaryPreferences: ['gluten-free', 'pescatarian', 'dairy-free'],
        ingredients: ['Mixed Mediterranean fish', 'Shellfish', 'Saffron', 'Tomatoes', 'Rouille sauce'],
        nutritionInfo: { calories: 520, protein: '45g', carbs: '28g', fat: '24g' },
        spiceLevel: 1,
        preparationTime: '35-40 min',
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        availability: {
          monday: { lunch: false, dinner: false },
          tuesday: { lunch: false, dinner: false },
          wednesday: { lunch: false, dinner: false },
          thursday: { lunch: false, dinner: false },
          friday: { lunch: false, dinner: true },
          saturday: { lunch: true, dinner: true },
          sunday: { lunch: true, dinner: true }
        }
      },
      // Dinner-Only Items
      {
        id: 109,
        planId: 'chez-laurent-beef-bourguignon-109',
        name: 'Beef Bourguignon',
        price: 34.99,
        description: 'Slow-braised beef in red wine with pearl onions and mushrooms.',
        longDescription: 'Classic Burgundian beef stew slowly braised in red wine with bacon, pearl onions, and mushrooms. Served with buttery mashed potatoes.',
        category: 'Dinner Specialties',
        dietaryPreferences: ['gluten-free'],
        ingredients: ['Beef chuck', 'Red wine', 'Bacon', 'Pearl onions', 'Mushrooms', 'Mashed potatoes'],
        nutritionInfo: { calories: 680, protein: '48g', carbs: '35g', fat: '38g' },
        spiceLevel: 0,
        preparationTime: '30-35 min',
        image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        availability: {
          monday: { lunch: false, dinner: true },
          tuesday: { lunch: false, dinner: true },
          wednesday: { lunch: false, dinner: true },
          thursday: { lunch: false, dinner: true },
          friday: { lunch: false, dinner: true },
          saturday: { lunch: false, dinner: true },
          sunday: { lunch: false, dinner: false }
        }
      }
    ]
  },

  // Restaurant ID: 5 - Bella Vista Italian (Italian)
  {
    id: 5,
    name: 'Bella Vista Italian',
    image: '/images/grub-gate-default-restaurant-img.jpg',
    rating: 4.7,
    reviewCount: 1843,
    description: 'Authentic Italian cuisine with handmade pasta and wood-fired pizzas.',
    cuisine: 'Italian',
    deliveryTime: '20-30 min',
    deliveryFee: '$2.99',
    minOrder: '$20',
    isOpen: true,
    isPopular: true,
    isTopRated: true,
    tags: ['Italian', 'Pizza', 'Pasta', 'Authentic'],
    location: 'H3A - Downtown Montreal',
    postalCode: 'H3A',
    phone: '(514) 555-0105',
    address: '2468 Rue McGill, Montreal, QC H3A 2B5',
    coordinates: { lat: 45.5052, lng: -73.5768 },
    preferences: ['vegetarian', 'dairy-free', 'gluten-free'],
    foodItems: [
      {
        id: 501,
        planId: 'bella-vista-margherita-pizza-501',
        name: 'Margherita Pizza',
        price: 18.99,
        description: 'Classic wood-fired pizza with fresh mozzarella and basil.',
        longDescription: 'Traditional Neapolitan-style pizza with San Marzano tomatoes, fresh mozzarella di bufala, fresh basil, and extra virgin olive oil on our signature wood-fired crust.',
        category: 'Pizza',
        dietaryPreferences: ['vegetarian'],
        ingredients: ['San Marzano tomatoes', 'Fresh mozzarella', 'Fresh basil', 'Extra virgin olive oil', 'Pizza dough'],
        nutritionInfo: { calories: 420, protein: '18g', carbs: '52g', fat: '16g' },
        spiceLevel: 0,
        preparationTime: '15-20 min',
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        availability: {
          monday: { lunch: true, dinner: true },
          tuesday: { lunch: true, dinner: true },
          wednesday: { lunch: true, dinner: true },
          thursday: { lunch: true, dinner: true },
          friday: { lunch: true, dinner: true },
          saturday: { lunch: true, dinner: true },
          sunday: { lunch: true, dinner: true }
        }
      },
      {
        id: 502,
        planId: 'bella-vista-carbonara-502',
        name: 'Spaghetti Carbonara',
        price: 22.99,
        description: 'Creamy pasta with pancetta, eggs, and parmesan cheese.',
        longDescription: 'Traditional Roman pasta dish with al dente spaghetti, crispy pancetta, farm-fresh eggs, aged Parmigiano-Reggiano, and freshly cracked black pepper.',
        category: 'Pasta',
        dietaryPreferences: [],
        ingredients: ['Spaghetti', 'Pancetta', 'Eggs', 'Parmigiano-Reggiano', 'Black pepper'],
        nutritionInfo: { calories: 650, protein: '28g', carbs: '68g', fat: '32g' },
        spiceLevel: 0,
        preparationTime: '12-15 min',
        image: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        availability: {
          monday: { lunch: true, dinner: true },
          tuesday: { lunch: true, dinner: true },
          wednesday: { lunch: true, dinner: true },
          thursday: { lunch: true, dinner: true },
          friday: { lunch: true, dinner: true },
          saturday: { lunch: true, dinner: true },
          sunday: { lunch: true, dinner: true }
        }
      },
      {
        id: 503,
        planId: 'bella-vista-tiramisu-503',
        name: 'Tiramisu',
        price: 8.99,
        description: 'Classic Italian dessert with coffee-soaked ladyfingers.',
        longDescription: 'Traditional tiramisu made with espresso-soaked ladyfingers, mascarpone cheese, fresh eggs, and dusted with premium cocoa powder.',
        category: 'Desserts',
        dietaryPreferences: ['vegetarian'],
        ingredients: ['Ladyfingers', 'Espresso', 'Mascarpone', 'Eggs', 'Sugar', 'Cocoa powder'],
        nutritionInfo: { calories: 320, protein: '8g', carbs: '28g', fat: '20g' },
        spiceLevel: 0,
        preparationTime: '5 min',
        image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        availability: {
          monday: { lunch: true, dinner: true },
          tuesday: { lunch: true, dinner: true },
          wednesday: { lunch: true, dinner: true },
          thursday: { lunch: true, dinner: true },
          friday: { lunch: true, dinner: true },
          saturday: { lunch: true, dinner: true },
          sunday: { lunch: true, dinner: true }
        }
      }
    ]
  },

  // Restaurant ID: 6 - Ocean's Bounty Seafood (Seafood)
  {
    id: 6,
    name: "Ocean's Bounty Seafood",
    image: '/images/grub-gate-default-restaurant-img.jpg',
    rating: 4.9,
    reviewCount: 2234,
    description: 'Fresh Atlantic seafood with sustainable sourcing and expert preparation.',
    cuisine: 'Seafood',
    deliveryTime: '30-40 min',
    deliveryFee: '$4.99',
    minOrder: '$30',
    isOpen: true,
    isPopular: true,
    isTopRated: true,
    tags: ['Seafood', 'Fresh', 'Sustainable', 'Premium'],
    location: 'H3A - Downtown Montreal',
    postalCode: 'H3A',
    phone: '(514) 555-0106',
    address: '3579 Rue de la Montagne, Montreal, QC H3A 3C7',
    coordinates: { lat: 45.5045, lng: -73.5775 },
    preferences: ['gluten-free', 'dairy-free', 'keto'],
    foodItems: [
      {
        id: 601,
        planId: 'oceans-bounty-lobster-thermidor-601',
        name: 'Lobster Thermidor',
        price: 45.99,
        description: 'Classic French lobster dish with cognac cream sauce.',
        longDescription: 'Fresh Atlantic lobster tail cooked in a rich cognac cream sauce with herbs, topped with gruyere cheese and broiled to perfection. Served with roasted vegetables.',
        category: 'Main Courses',
        dietaryPreferences: ['gluten-free'],
        ingredients: ['Atlantic lobster', 'Cognac', 'Heavy cream', 'Gruyere cheese', 'Fresh herbs', 'Butter'],
        nutritionInfo: { calories: 520, protein: '48g', carbs: '8g', fat: '32g' },
        spiceLevel: 0,
        preparationTime: '25-30 min',
        image: 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        availability: {
          monday: { lunch: false, dinner: true },
          tuesday: { lunch: false, dinner: true },
          wednesday: { lunch: false, dinner: true },
          thursday: { lunch: false, dinner: true },
          friday: { lunch: true, dinner: true },
          saturday: { lunch: true, dinner: true },
          sunday: { lunch: true, dinner: true }
        }
      },
      {
        id: 602,
        planId: 'oceans-bounty-salmon-cedar-602',
        name: 'Cedar Plank Salmon',
        price: 28.99,
        description: 'Wild Pacific salmon grilled on cedar plank with herbs.',
        longDescription: 'Wild-caught Pacific salmon fillet grilled on aromatic cedar plank with fresh dill, lemon, and garlic. Served with quinoa pilaf and seasonal vegetables.',
        category: 'Main Courses',
        dietaryPreferences: ['gluten-free', 'dairy-free', 'keto'],
        ingredients: ['Pacific salmon', 'Cedar plank', 'Fresh dill', 'Lemon', 'Garlic', 'Quinoa'],
        nutritionInfo: { calories: 480, protein: '42g', carbs: '12g', fat: '28g' },
        spiceLevel: 0,
        preparationTime: '20-25 min',
        image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        availability: {
          monday: { lunch: true, dinner: true },
          tuesday: { lunch: true, dinner: true },
          wednesday: { lunch: true, dinner: true },
          thursday: { lunch: true, dinner: true },
          friday: { lunch: true, dinner: true },
          saturday: { lunch: true, dinner: true },
          sunday: { lunch: true, dinner: true }
        }
      },
      {
        id: 603,
        planId: 'oceans-bounty-seafood-chowder-603',
        name: 'Maritime Seafood Chowder',
        price: 16.99,
        description: 'Creamy chowder with lobster, scallops, and fresh fish.',
        longDescription: 'Rich and creamy chowder featuring fresh lobster, sea scallops, Atlantic cod, and vegetables in a traditional cream base with herbs and spices.',
        category: 'Soups',
        dietaryPreferences: ['gluten-free'],
        ingredients: ['Lobster', 'Sea scallops', 'Atlantic cod', 'Heavy cream', 'Potatoes', 'Celery', 'Onions'],
        nutritionInfo: { calories: 380, protein: '24g', carbs: '18g', fat: '24g' },
        spiceLevel: 0,
        preparationTime: '15-20 min',
        image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        availability: {
          monday: { lunch: true, dinner: true },
          tuesday: { lunch: true, dinner: true },
          wednesday: { lunch: true, dinner: true },
          thursday: { lunch: true, dinner: true },
          friday: { lunch: true, dinner: true },
          saturday: { lunch: true, dinner: true },
          sunday: { lunch: true, dinner: true }
        }
      }
    ]
  },

  // Restaurant ID: 7 - The Steakhouse Prime (Steakhouse)
  {
    id: 7,
    name: 'The Steakhouse Prime',
    image: '/images/grub-gate-default-restaurant-img.jpg',
    rating: 4.8,
    reviewCount: 1967,
    description: 'Premium steakhouse featuring aged beef and classic sides.',
    cuisine: 'Steakhouse',
    deliveryTime: '35-45 min',
    deliveryFee: '$5.99',
    minOrder: '$35',
    isOpen: true,
    isPopular: true,
    isTopRated: true,
    tags: ['Steakhouse', 'Premium', 'Aged Beef', 'Classic'],
    location: 'H3A - Downtown Montreal',
    postalCode: 'H3A',
    phone: '(514) 555-0107',
    address: '4680 Rue Saint-Jacques, Montreal, QC H3A 4D8',
    coordinates: { lat: 45.5041, lng: -73.5779 },
    preferences: ['gluten-free', 'keto', 'dairy-free'],
    foodItems: [
      {
        id: 701,
        planId: 'steakhouse-prime-ribeye-701',
        name: 'Prime Ribeye Steak',
        price: 52.99,
        description: '16oz dry-aged ribeye with garlic herb butter.',
        longDescription: 'Premium 16oz dry-aged ribeye steak grilled to perfection, topped with house-made garlic herb butter. Served with your choice of potato and seasonal vegetables.',
        category: 'Steaks',
        dietaryPreferences: ['gluten-free', 'keto'],
        ingredients: ['Dry-aged ribeye', 'Garlic', 'Fresh herbs', 'Butter', 'Sea salt', 'Black pepper'],
        nutritionInfo: { calories: 720, protein: '58g', carbs: '2g', fat: '52g' },
        spiceLevel: 0,
        preparationTime: '20-25 min',
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        availability: {
          monday: { lunch: false, dinner: true },
          tuesday: { lunch: false, dinner: true },
          wednesday: { lunch: false, dinner: true },
          thursday: { lunch: false, dinner: true },
          friday: { lunch: true, dinner: true },
          saturday: { lunch: true, dinner: true },
          sunday: { lunch: true, dinner: true }
        }
      },
      {
        id: 702,
        planId: 'steakhouse-prime-filet-mignon-702',
        name: 'Filet Mignon',
        price: 48.99,
        description: '8oz tender filet with red wine reduction.',
        longDescription: 'Premium 8oz center-cut filet mignon, perfectly grilled and served with a rich red wine reduction sauce. Accompanied by truffle mashed potatoes and asparagus.',
        category: 'Steaks',
        dietaryPreferences: ['gluten-free', 'keto'],
        ingredients: ['Filet mignon', 'Red wine', 'Shallots', 'Beef stock', 'Butter', 'Fresh thyme'],
        nutritionInfo: { calories: 580, protein: '52g', carbs: '6g', fat: '38g' },
        spiceLevel: 0,
        preparationTime: '18-22 min',
        image: 'https://images.unsplash.com/photo-1558030006-450675393462?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        availability: {
          monday: { lunch: false, dinner: true },
          tuesday: { lunch: false, dinner: true },
          wednesday: { lunch: false, dinner: true },
          thursday: { lunch: false, dinner: true },
          friday: { lunch: true, dinner: true },
          saturday: { lunch: true, dinner: true },
          sunday: { lunch: true, dinner: true }
        }
      },
      {
        id: 703,
        planId: 'steakhouse-prime-lobster-tail-703',
        name: 'Surf & Turf',
        price: 65.99,
        description: '6oz filet mignon with 8oz lobster tail.',
        longDescription: 'The ultimate combination of 6oz filet mignon and 8oz cold-water lobster tail, grilled to perfection. Served with drawn butter and your choice of sides.',
        category: 'Surf & Turf',
        dietaryPreferences: ['gluten-free', 'keto'],
        ingredients: ['Filet mignon', 'Lobster tail', 'Butter', 'Lemon', 'Garlic', 'Fresh herbs'],
        nutritionInfo: { calories: 680, protein: '62g', carbs: '4g', fat: '44g' },
        spiceLevel: 0,
        preparationTime: '25-30 min',
        image: 'https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        availability: {
          monday: { lunch: false, dinner: true },
          tuesday: { lunch: false, dinner: true },
          wednesday: { lunch: false, dinner: true },
          thursday: { lunch: false, dinner: true },
          friday: { lunch: true, dinner: true },
          saturday: { lunch: true, dinner: true },
          sunday: { lunch: true, dinner: true }
        }
      }
    ]
  },

  // Restaurant ID: 8 - Mediterranean Delights (Mediterranean)
  {
    id: 8,
    name: 'Mediterranean Delights',
    image: '/images/grub-gate-default-restaurant-img.jpg',
    rating: 4.6,
    reviewCount: 1654,
    description: 'Fresh Mediterranean cuisine with authentic flavors and healthy options.',
    cuisine: 'Mediterranean',
    deliveryTime: '25-35 min',
    deliveryFee: '$3.49',
    minOrder: '$22',
    isOpen: true,
    isPopular: true,
    isTopRated: false,
    tags: ['Mediterranean', 'Healthy', 'Fresh', 'Authentic'],
    location: 'H3A - Downtown Montreal',
    postalCode: 'H3A',
    phone: '(514) 555-0108',
    address: '5791 Rue Crescent, Montreal, QC H3A 5E9',
    coordinates: { lat: 45.5038, lng: -73.5782 },
    preferences: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free'],
    foodItems: [
      {
        id: 801,
        planId: 'mediterranean-delights-lamb-souvlaki-801',
        name: 'Lamb Souvlaki Platter',
        price: 24.99,
        description: 'Grilled lamb skewers with tzatziki and pita bread.',
        longDescription: 'Tender marinated lamb skewers grilled to perfection, served with homemade tzatziki, warm pita bread, Greek salad, and lemon roasted potatoes.',
        category: 'Main Courses',
        dietaryPreferences: ['gluten-free'],
        ingredients: ['Lamb', 'Greek yogurt', 'Cucumber', 'Garlic', 'Olive oil', 'Oregano', 'Pita bread'],
        nutritionInfo: { calories: 520, protein: '38g', carbs: '28g', fat: '28g' },
        spiceLevel: 1,
        preparationTime: '20-25 min',
        image: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        availability: {
          monday: { lunch: true, dinner: true },
          tuesday: { lunch: true, dinner: true },
          wednesday: { lunch: true, dinner: true },
          thursday: { lunch: true, dinner: true },
          friday: { lunch: true, dinner: true },
          saturday: { lunch: true, dinner: true },
          sunday: { lunch: true, dinner: true }
        }
      },
      {
        id: 802,
        planId: 'mediterranean-delights-falafel-bowl-802',
        name: 'Mediterranean Falafel Bowl',
        price: 18.99,
        description: 'Crispy falafel with hummus, tabbouleh, and vegetables.',
        longDescription: 'House-made crispy falafel served over quinoa with fresh hummus, tabbouleh, roasted vegetables, and tahini dressing.',
        category: 'Bowls',
        dietaryPreferences: ['vegetarian', 'vegan', 'gluten-free'],
        ingredients: ['Chickpeas', 'Quinoa', 'Tahini', 'Parsley', 'Tomatoes', 'Cucumber', 'Red onion'],
        nutritionInfo: { calories: 420, protein: '18g', carbs: '52g', fat: '16g' },
        spiceLevel: 1,
        preparationTime: '15-20 min',
        image: 'https://images.unsplash.com/photo-1565299585323-38174c4a6471?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        availability: {
          monday: { lunch: true, dinner: true },
          tuesday: { lunch: true, dinner: true },
          wednesday: { lunch: true, dinner: true },
          thursday: { lunch: true, dinner: true },
          friday: { lunch: true, dinner: true },
          saturday: { lunch: true, dinner: true },
          sunday: { lunch: true, dinner: true }
        }
      },
      {
        id: 803,
        planId: 'mediterranean-delights-baklava-803',
        name: 'Honey Baklava',
        price: 7.99,
        description: 'Traditional Greek pastry with nuts and honey.',
        longDescription: 'Layers of crispy phyllo pastry filled with mixed nuts and sweetened with honey syrup, finished with a sprinkle of pistachios.',
        category: 'Desserts',
        dietaryPreferences: ['vegetarian'],
        ingredients: ['Phyllo pastry', 'Mixed nuts', 'Honey', 'Butter', 'Cinnamon', 'Pistachios'],
        nutritionInfo: { calories: 280, protein: '6g', carbs: '32g', fat: '16g' },
        spiceLevel: 0,
        preparationTime: '5 min',
        image: 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        availability: {
          monday: { lunch: true, dinner: true },
          tuesday: { lunch: true, dinner: true },
          wednesday: { lunch: true, dinner: true },
          thursday: { lunch: true, dinner: true },
          friday: { lunch: true, dinner: true },
          saturday: { lunch: true, dinner: true },
          sunday: { lunch: true, dinner: true }
        }
      }
    ]
  },

  // Restaurant ID: 2 - Sakura Sushi House (Japanese)
  {
    id: 2,
    name: 'Sakura Sushi House',
    image: '/images/grub-gate-default-restaurant-img.jpg',
    rating: 4.7,
    reviewCount: 1834,
    description: 'Authentic Japanese cuisine with fresh sushi and traditional dishes.',
    cuisine: 'Japanese',
    deliveryTime: '30-40 min',
    deliveryFee: '$4.99',
    minOrder: '$22',
    isOpen: true,
    isPopular: true,
    isTopRated: true,
    tags: ['Japanese', 'Sushi', 'Fresh', 'Authentic'],
    location: 'H3B - Financial District Montreal',
    postalCode: 'H3B',
    phone: '(514) 555-0102',
    address: '5678 Rue Peel, Montreal, QC H3B 2B4',
    coordinates: { lat: 45.5056, lng: -73.5789 },
    preferences: ['gluten-free', 'dairy-free', 'pescatarian'],
    foodItems: [
      {
        id: 201,
        planId: 'sakura-teriyaki-salmon-201',
        name: 'Teriyaki Salmon',
        price: 22.99,
        description: 'Grilled salmon glazed with teriyaki sauce, served with steamed rice.',
        longDescription: 'Fresh Atlantic salmon fillet grilled to perfection and glazed with house-made teriyaki sauce. Served with steamed jasmine rice and seasonal vegetables.',
        category: 'Main Courses',
        dietaryPreferences: ['gluten-free', 'dairy-free', 'pescatarian'],
        ingredients: ['Atlantic salmon', 'Teriyaki sauce', 'Jasmine rice', 'Seasonal vegetables'],
        nutritionInfo: { calories: 480, protein: '35g', carbs: '42g', fat: '18g' },
        spiceLevel: 0,
        preparationTime: '15-18 min',
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        availability: {
          monday: { lunch: true, dinner: true },
          tuesday: { lunch: true, dinner: true },
          wednesday: { lunch: true, dinner: true },
          thursday: { lunch: true, dinner: true },
          friday: { lunch: true, dinner: true },
          saturday: { lunch: true, dinner: true },
          sunday: { lunch: true, dinner: true }
        }
      },
      {
        id: 202,
        planId: 'sakura-california-roll-202',
        name: 'California Roll (8 pieces)',
        price: 12.99,
        description: 'Classic sushi roll with crab, avocado, and cucumber.',
        longDescription: 'Signature California roll featuring fresh crab meat, creamy avocado, and crisp cucumber wrapped in seasoned sushi rice and nori seaweed.',
        category: 'Sushi & Rolls',
        dietaryPreferences: ['gluten-free', 'pescatarian'],
        ingredients: ['Crab meat', 'Avocado', 'Cucumber', 'Sushi rice', 'Nori seaweed'],
        nutritionInfo: { calories: 280, protein: '12g', carbs: '38g', fat: '8g' },
        spiceLevel: 0,
        preparationTime: '8-10 min',
        image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        availability: {
          monday: { lunch: true, dinner: true },
          tuesday: { lunch: true, dinner: true },
          wednesday: { lunch: true, dinner: true },
          thursday: { lunch: true, dinner: true },
          friday: { lunch: true, dinner: true },
          saturday: { lunch: true, dinner: true },
          sunday: { lunch: true, dinner: true }
        }
      },
      {
        id: 203,
        planId: 'sakura-salmon-sashimi-203',
        name: 'Fresh Salmon Sashimi (6 pieces)',
        price: 18.99,
        description: 'Premium fresh salmon sashimi, expertly sliced.',
        longDescription: 'Six pieces of the finest Atlantic salmon, carefully selected and sliced by our master sushi chef. Served with wasabi, pickled ginger, and soy sauce.',
        category: 'Sashimi',
        dietaryPreferences: ['gluten-free', 'dairy-free', 'pescatarian'],
        ingredients: ['Fresh Atlantic salmon', 'Wasabi', 'Pickled ginger', 'Soy sauce'],
        nutritionInfo: { calories: 220, protein: '28g', carbs: '0g', fat: '12g' },
        spiceLevel: 0,
        preparationTime: '5-8 min',
        image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        availability: {
          monday: { lunch: true, dinner: true },
          tuesday: { lunch: true, dinner: true },
          wednesday: { lunch: true, dinner: true },
          thursday: { lunch: true, dinner: true },
          friday: { lunch: true, dinner: true },
          saturday: { lunch: true, dinner: true },
          sunday: { lunch: true, dinner: true }
        }
      },
      {
        id: 204,
        planId: 'sakura-miso-soup-204',
        name: 'Traditional Miso Soup',
        price: 4.99,
        description: 'Classic Japanese soup with tofu, seaweed, and green onions.',
        longDescription: 'Traditional miso soup made with fermented soybean paste, silky tofu, wakame seaweed, and fresh green onions. A perfect start to any Japanese meal.',
        category: 'Soups & Appetizers',
        dietaryPreferences: ['vegetarian', 'gluten-free', 'dairy-free'],
        ingredients: ['Miso paste', 'Tofu', 'Wakame seaweed', 'Green onions', 'Dashi broth'],
        nutritionInfo: { calories: 80, protein: '6g', carbs: '8g', fat: '3g' },
        spiceLevel: 0,
        preparationTime: '5-8 min',
        image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        availability: {
          monday: { lunch: true, dinner: true },
          tuesday: { lunch: true, dinner: true },
          wednesday: { lunch: true, dinner: true },
          thursday: { lunch: true, dinner: true },
          friday: { lunch: true, dinner: true },
          saturday: { lunch: true, dinner: true },
          sunday: { lunch: true, dinner: true }
        }
      },
      // Lunch-Only Bento Boxes
      {
        id: 205,
        planId: 'sakura-chicken-bento-205',
        name: 'Chicken Teriyaki Bento Box',
        price: 16.99,
        description: 'Complete lunch box with chicken teriyaki, rice, and sides.',
        longDescription: 'Traditional Japanese bento box featuring chicken teriyaki, steamed rice, pickled vegetables, edamame, and miso soup. Perfect lunch portion.',
        category: 'Bento Boxes',
        dietaryPreferences: ['gluten-free', 'dairy-free'],
        ingredients: ['Chicken teriyaki', 'Steamed rice', 'Pickled vegetables', 'Edamame', 'Miso soup'],
        nutritionInfo: { calories: 520, protein: '32g', carbs: '58g', fat: '18g' },
        spiceLevel: 0,
        preparationTime: '12-15 min',
        image: 'https://images.unsplash.com/photo-1563379091339-03246963d388?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        availability: {
          monday: { lunch: true, dinner: false },
          tuesday: { lunch: true, dinner: false },
          wednesday: { lunch: true, dinner: false },
          thursday: { lunch: true, dinner: false },
          friday: { lunch: true, dinner: false },
          saturday: { lunch: false, dinner: false },
          sunday: { lunch: false, dinner: false }
        }
      },
      {
        id: 206,
        planId: 'sakura-salmon-bento-206',
        name: 'Grilled Salmon Bento Box',
        price: 19.99,
        description: 'Premium bento with grilled salmon, rice, and traditional sides.',
        longDescription: 'Deluxe bento box with grilled salmon fillet, sushi rice, tempura vegetables, pickled daikon, and green tea. A complete Japanese lunch experience.',
        category: 'Bento Boxes',
        dietaryPreferences: ['gluten-free', 'pescatarian', 'dairy-free'],
        ingredients: ['Grilled salmon', 'Sushi rice', 'Tempura vegetables', 'Pickled daikon', 'Green tea'],
        nutritionInfo: { calories: 580, protein: '38g', carbs: '52g', fat: '22g' },
        spiceLevel: 0,
        preparationTime: '15-18 min',
        image: 'https://images.unsplash.com/photo-1563379091339-03246963d388?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        availability: {
          monday: { lunch: true, dinner: false },
          tuesday: { lunch: true, dinner: false },
          wednesday: { lunch: true, dinner: false },
          thursday: { lunch: true, dinner: false },
          friday: { lunch: true, dinner: false },
          saturday: { lunch: true, dinner: false },
          sunday: { lunch: true, dinner: false }
        }
      },
      // Dinner-Only Premium Items
      {
        id: 207,
        planId: 'sakura-omakase-dinner-207',
        name: 'Chef\'s Omakase Experience',
        price: 85.99,
        description: 'Premium chef\'s selection of seasonal sashimi and nigiri.',
        longDescription: 'Exclusive dinner experience featuring the chef\'s selection of the finest seasonal fish, expertly prepared sashimi and nigiri, served in traditional courses.',
        category: 'Premium Experiences',
        dietaryPreferences: ['gluten-free', 'pescatarian', 'dairy-free'],
        ingredients: ['Seasonal premium fish', 'Sushi rice', 'Wasabi', 'Pickled ginger', 'Soy sauce'],
        nutritionInfo: { calories: 650, protein: '58g', carbs: '42g', fat: '28g' },
        spiceLevel: 0,
        preparationTime: '45-60 min',
        image: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        availability: {
          monday: { lunch: false, dinner: false },
          tuesday: { lunch: false, dinner: true },
          wednesday: { lunch: false, dinner: true },
          thursday: { lunch: false, dinner: true },
          friday: { lunch: false, dinner: true },
          saturday: { lunch: false, dinner: true },
          sunday: { lunch: false, dinner: false }
        }
      },
      // Weekend Special Rolls
      {
        id: 208,
        planId: 'sakura-weekend-special-208',
        name: 'Dragon Roll Deluxe',
        price: 24.99,
        description: 'Premium weekend special with eel, avocado, and tobiko.',
        longDescription: 'Weekend exclusive featuring grilled eel, avocado, cucumber inside, topped with fresh salmon, avocado, and flying fish roe. Drizzled with eel sauce.',
        category: 'Weekend Specials',
        dietaryPreferences: ['gluten-free', 'pescatarian'],
        ingredients: ['Grilled eel', 'Fresh salmon', 'Avocado', 'Cucumber', 'Tobiko', 'Eel sauce'],
        nutritionInfo: { calories: 420, protein: '28g', carbs: '32g', fat: '22g' },
        spiceLevel: 0,
        preparationTime: '20-25 min',
        image: 'https://images.unsplash.com/photo-1617196034183-421b4917abd8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        availability: {
          monday: { lunch: false, dinner: false },
          tuesday: { lunch: false, dinner: false },
          wednesday: { lunch: false, dinner: false },
          thursday: { lunch: false, dinner: false },
          friday: { lunch: false, dinner: true },
          saturday: { lunch: true, dinner: true },
          sunday: { lunch: true, dinner: true }
        }
      }
    ]
  },

  // Restaurant ID: 3 - Spice Garden Indian (Indian)
  {
    id: 3,
    name: 'Spice Garden Indian',
    image: '/images/grub-gate-default-restaurant-img.jpg',
    rating: 4.5,
    reviewCount: 1456,
    description: 'Authentic Indian cuisine with aromatic spices and traditional cooking methods.',
    cuisine: 'Indian',
    deliveryTime: '35-45 min',
    deliveryFee: '$3.99',
    minOrder: '$20',
    isOpen: true,
    isPopular: true,
    tags: ['Indian', 'Spicy', 'Authentic', 'Vegetarian-Friendly'],
    location: 'H2Y - Quartier des Spectacles Montreal',
    postalCode: 'H2Y',
    phone: '(514) 555-0103',
    address: '9012 Rue University, Montreal, QC H2Y 3C6',
    coordinates: { lat: 45.5064, lng: -73.5801 },
    preferences: ['vegetarian', 'vegan', 'gluten-free', 'spicy'],
    foodItems: [
      {
        id: 301,
        planId: 'spice-garden-butter-chicken-301',
        name: 'Butter Chicken',
        price: 19.99,
        description: 'Tender chicken in creamy tomato-based curry sauce with aromatic spices.',
        longDescription: 'Succulent pieces of marinated chicken cooked in a rich, creamy tomato-based sauce with butter, cream, and traditional Indian spices. Served with basmati rice.',
        category: 'Main Courses',
        dietaryPreferences: ['gluten-free'],
        ingredients: ['Chicken', 'Tomatoes', 'Cream', 'Butter', 'Garam masala', 'Basmati rice'],
        nutritionInfo: { calories: 580, protein: '32g', carbs: '45g', fat: '28g' },
        spiceLevel: 2,
        preparationTime: '20-25 min',
        image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        availability: {
          monday: { lunch: true, dinner: true },
          tuesday: { lunch: true, dinner: true },
          wednesday: { lunch: true, dinner: true },
          thursday: { lunch: true, dinner: true },
          friday: { lunch: true, dinner: true },
          saturday: { lunch: true, dinner: true },
          sunday: { lunch: true, dinner: true }
        }
      },
      {
        id: 302,
        planId: 'spice-garden-palak-paneer-302',
        name: 'Palak Paneer',
        price: 17.99,
        description: 'Fresh spinach curry with cubes of cottage cheese in aromatic spices.',
        longDescription: 'Creamy spinach curry cooked with fresh paneer cubes and traditional Indian spices including cumin, coriander, and garam masala. Served with naan bread.',
        category: 'Main Courses',
        dietaryPreferences: ['vegetarian', 'gluten-free'],
        ingredients: ['Fresh spinach', 'Paneer', 'Onions', 'Tomatoes', 'Indian spices', 'Naan bread'],
        nutritionInfo: { calories: 420, protein: '18g', carbs: '32g', fat: '24g' },
        spiceLevel: 2,
        preparationTime: '18-22 min',
        image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        availability: {
          monday: { lunch: true, dinner: true },
          tuesday: { lunch: true, dinner: true },
          wednesday: { lunch: true, dinner: true },
          thursday: { lunch: true, dinner: true },
          friday: { lunch: true, dinner: true },
          saturday: { lunch: true, dinner: true },
          sunday: { lunch: true, dinner: true }
        }
      },
      {
        id: 303,
        planId: 'spice-garden-dal-tadka-303',
        name: 'Dal Tadka',
        price: 14.99,
        description: 'Yellow lentils tempered with cumin, garlic, and aromatic spices.',
        longDescription: 'Traditional yellow lentil curry tempered with cumin seeds, garlic, onions, and fresh herbs. A comforting and nutritious dish served with rice.',
        category: 'Vegetarian',
        dietaryPreferences: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free'],
        ingredients: ['Yellow lentils', 'Cumin seeds', 'Garlic', 'Onions', 'Turmeric', 'Basmati rice'],
        nutritionInfo: { calories: 320, protein: '16g', carbs: '48g', fat: '8g' },
        spiceLevel: 1,
        preparationTime: '15-20 min',
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        availability: {
          monday: { lunch: true, dinner: true },
          tuesday: { lunch: true, dinner: true },
          wednesday: { lunch: true, dinner: true },
          thursday: { lunch: true, dinner: true },
          friday: { lunch: true, dinner: true },
          saturday: { lunch: true, dinner: true },
          sunday: { lunch: true, dinner: true }
        }
      },
      // Lunch Thali Specials
      {
        id: 304,
        planId: 'spice-garden-lunch-thali-304',
        name: 'Vegetarian Thali',
        price: 18.99,
        description: 'Complete Indian lunch platter with variety of curries, rice, and bread.',
        longDescription: 'Traditional thali featuring dal, seasonal vegetable curry, raita, pickle, papad, basmati rice, and fresh naan bread. A complete Indian lunch experience.',
        category: 'Thali Specials',
        dietaryPreferences: ['vegetarian', 'gluten-free'],
        ingredients: ['Dal', 'Vegetable curry', 'Raita', 'Pickle', 'Papad', 'Basmati rice', 'Naan'],
        nutritionInfo: { calories: 650, protein: '22g', carbs: '85g', fat: '24g' },
        spiceLevel: 2,
        preparationTime: '18-22 min',
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        availability: {
          monday: { lunch: true, dinner: false },
          tuesday: { lunch: true, dinner: false },
          wednesday: { lunch: true, dinner: false },
          thursday: { lunch: true, dinner: false },
          friday: { lunch: true, dinner: false },
          saturday: { lunch: true, dinner: false },
          sunday: { lunch: false, dinner: false }
        }
      },
      {
        id: 305,
        planId: 'spice-garden-chicken-thali-305',
        name: 'Chicken Thali',
        price: 22.99,
        description: 'Non-vegetarian thali with chicken curry, dal, rice, and accompaniments.',
        longDescription: 'Hearty thali featuring chicken curry, dal tadka, vegetable of the day, raita, pickle, basmati rice, and butter naan. Perfect for lunch.',
        category: 'Thali Specials',
        dietaryPreferences: ['gluten-free'],
        ingredients: ['Chicken curry', 'Dal tadka', 'Mixed vegetables', 'Raita', 'Basmati rice', 'Butter naan'],
        nutritionInfo: { calories: 780, protein: '38g', carbs: '72g', fat: '32g' },
        spiceLevel: 2,
        preparationTime: '20-25 min',
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        availability: {
          monday: { lunch: true, dinner: false },
          tuesday: { lunch: true, dinner: false },
          wednesday: { lunch: true, dinner: false },
          thursday: { lunch: true, dinner: false },
          friday: { lunch: true, dinner: false },
          saturday: { lunch: true, dinner: false },
          sunday: { lunch: true, dinner: false }
        }
      },
      // Dinner Specialties
      {
        id: 306,
        planId: 'spice-garden-lamb-biryani-306',
        name: 'Hyderabadi Lamb Biryani',
        price: 28.99,
        description: 'Aromatic basmati rice layered with spiced lamb and slow-cooked to perfection.',
        longDescription: 'Authentic Hyderabadi-style biryani with tender lamb pieces, fragrant basmati rice, saffron, and traditional spices. Served with raita and shorba.',
        category: 'Biryani & Rice',
        dietaryPreferences: ['gluten-free', 'dairy-free'],
        ingredients: ['Lamb', 'Basmati rice', 'Saffron', 'Biryani spices', 'Raita', 'Shorba'],
        nutritionInfo: { calories: 720, protein: '42g', carbs: '68g', fat: '28g' },
        spiceLevel: 3,
        preparationTime: '35-40 min',
        image: 'https://images.unsplash.com/photo-1563379091339-03246963d388?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        availability: {
          monday: { lunch: false, dinner: true },
          tuesday: { lunch: false, dinner: true },
          wednesday: { lunch: false, dinner: true },
          thursday: { lunch: false, dinner: true },
          friday: { lunch: false, dinner: true },
          saturday: { lunch: false, dinner: true },
          sunday: { lunch: false, dinner: true }
        }
      },
      // Weekend Specials
      {
        id: 307,
        planId: 'spice-garden-weekend-feast-307',
        name: 'Royal Feast Platter',
        price: 45.99,
        description: 'Grand weekend platter with multiple curries, biryanis, and desserts.',
        longDescription: 'Luxurious weekend feast featuring lamb curry, chicken tikka masala, vegetable biryani, assorted naan, desserts, and traditional accompaniments.',
        category: 'Weekend Specials',
        dietaryPreferences: ['gluten-free'],
        ingredients: ['Lamb curry', 'Chicken tikka masala', 'Vegetable biryani', 'Assorted naan', 'Desserts'],
        nutritionInfo: { calories: 1200, protein: '58g', carbs: '95g', fat: '52g' },
        spiceLevel: 3,
        preparationTime: '45-50 min',
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        availability: {
          monday: { lunch: false, dinner: false },
          tuesday: { lunch: false, dinner: false },
          wednesday: { lunch: false, dinner: false },
          thursday: { lunch: false, dinner: false },
          friday: { lunch: false, dinner: true },
          saturday: { lunch: true, dinner: true },
          sunday: { lunch: true, dinner: true }
        }
      }
    ]
  },

  // Restaurant ID: 4 - Healthy Bowl Co. (Healthy)
  {
    id: 4,
    name: 'Healthy Bowl Co.',
    image: '/images/grub-gate-default-restaurant-img.jpg',
    rating: 4.8,
    reviewCount: 234,
    description: 'Nutritious bowls packed with superfoods and fresh ingredients.',
    cuisine: 'Healthy',
    deliveryTime: '20-30 min',
    deliveryFee: '$1.99',
    minOrder: '$18',
    isOpen: true,
    isPopular: true,
    isTopRated: true,
    tags: ['Healthy', 'Organic', 'Superfood', 'Fresh'],
    location: 'H2T - Mile End Montreal',
    postalCode: 'H2T',
    phone: '(514) 555-0104',
    address: '3456 Rue McGill, Montreal, QC H2T 4D8',
    coordinates: { lat: 45.5072, lng: -73.5813 },
    preferences: ['vegan', 'vegetarian', 'gluten-free', 'organic', 'dairy-free'],
    foodItems: [
      {
        id: 401,
        planId: 'healthy-acai-bowl-401',
        name: 'Superfood Acai Bowl',
        price: 16.99,
        description: 'Antioxidant-rich acai bowl topped with fresh fruits and granola.',
        longDescription: 'Organic acai puree blended with banana and coconut milk, topped with fresh berries, granola, chia seeds, and coconut flakes. A nutritious and energizing meal.',
        category: 'Superfood Bowls',
        dietaryPreferences: ['vegan', 'vegetarian', 'gluten-free', 'organic', 'dairy-free'],
        ingredients: ['Organic acai', 'Banana', 'Coconut milk', 'Mixed berries', 'Granola', 'Chia seeds'],
        nutritionInfo: { calories: 380, protein: '8g', carbs: '65g', fat: '12g' },
        spiceLevel: 0,
        preparationTime: '8-10 min',
        image: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        availability: {
          monday: { lunch: true, dinner: false },
          tuesday: { lunch: true, dinner: false },
          wednesday: { lunch: true, dinner: false },
          thursday: { lunch: true, dinner: false },
          friday: { lunch: true, dinner: false },
          saturday: { lunch: true, dinner: true },
          sunday: { lunch: true, dinner: true }
        }
      },
      {
        id: 402,
        planId: 'healthy-quinoa-power-bowl-402',
        name: 'Quinoa Power Bowl',
        price: 18.99,
        description: 'Protein-packed quinoa bowl with roasted vegetables and tahini dressing.',
        longDescription: 'Fluffy quinoa served with roasted sweet potato, chickpeas, kale, avocado, and drizzled with creamy tahini dressing. A complete protein-rich meal.',
        category: 'Power Bowls',
        dietaryPreferences: ['vegan', 'vegetarian', 'gluten-free', 'organic'],
        ingredients: ['Quinoa', 'Sweet potato', 'Chickpeas', 'Kale', 'Avocado', 'Tahini dressing'],
        nutritionInfo: { calories: 520, protein: '18g', carbs: '68g', fat: '22g' },
        spiceLevel: 0,
        preparationTime: '12-15 min',
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        availability: {
          monday: { lunch: true, dinner: true },
          tuesday: { lunch: true, dinner: true },
          wednesday: { lunch: true, dinner: true },
          thursday: { lunch: true, dinner: true },
          friday: { lunch: true, dinner: true },
          saturday: { lunch: true, dinner: true },
          sunday: { lunch: true, dinner: true }
        }
      },
      {
        id: 403,
        planId: 'healthy-green-smoothie-403',
        name: 'Green Goddess Smoothie',
        price: 12.99,
        description: 'Nutrient-dense green smoothie with spinach, mango, and coconut.',
        longDescription: 'Refreshing blend of organic spinach, mango, pineapple, coconut water, and spirulina powder. Packed with vitamins and minerals for natural energy.',
        category: 'Smoothies & Juices',
        dietaryPreferences: ['vegan', 'vegetarian', 'gluten-free', 'organic', 'dairy-free'],
        ingredients: ['Organic spinach', 'Mango', 'Pineapple', 'Coconut water', 'Spirulina'],
        nutritionInfo: { calories: 180, protein: '4g', carbs: '42g', fat: '2g' },
        spiceLevel: 0,
        preparationTime: '5-8 min',
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        availability: {
          monday: { lunch: true, dinner: false },
          tuesday: { lunch: true, dinner: false },
          wednesday: { lunch: true, dinner: false },
          thursday: { lunch: true, dinner: false },
          friday: { lunch: true, dinner: false },
          saturday: { lunch: true, dinner: false },
          sunday: { lunch: true, dinner: false }
        }
      },
      // Breakfast/Lunch Items
      {
        id: 404,
        planId: 'healthy-overnight-oats-404',
        name: 'Overnight Oats Parfait',
        price: 9.99,
        description: 'Creamy overnight oats with fresh berries and almond butter.',
        longDescription: 'Organic rolled oats soaked overnight in almond milk, topped with fresh seasonal berries, almond butter, and chia seeds. Perfect morning fuel.',
        category: 'Breakfast & Light Meals',
        dietaryPreferences: ['vegan', 'vegetarian', 'gluten-free', 'organic', 'dairy-free'],
        ingredients: ['Organic oats', 'Almond milk', 'Fresh berries', 'Almond butter', 'Chia seeds'],
        nutritionInfo: { calories: 320, protein: '12g', carbs: '45g', fat: '14g' },
        spiceLevel: 0,
        preparationTime: '3-5 min',
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        availability: {
          monday: { lunch: true, dinner: false },
          tuesday: { lunch: true, dinner: false },
          wednesday: { lunch: true, dinner: false },
          thursday: { lunch: true, dinner: false },
          friday: { lunch: true, dinner: false },
          saturday: { lunch: true, dinner: false },
          sunday: { lunch: true, dinner: false }
        }
      },
      // Dinner Bowls
      {
        id: 405,
        planId: 'healthy-buddha-bowl-405',
        name: 'Buddha Bowl Supreme',
        price: 21.99,
        description: 'Nourishing dinner bowl with roasted vegetables, grains, and tahini.',
        longDescription: 'Hearty dinner bowl featuring roasted seasonal vegetables, quinoa, brown rice, chickpeas, avocado, and creamy tahini dressing. A complete nutritious meal.',
        category: 'Dinner Bowls',
        dietaryPreferences: ['vegan', 'vegetarian', 'gluten-free', 'organic'],
        ingredients: ['Roasted vegetables', 'Quinoa', 'Brown rice', 'Chickpeas', 'Avocado', 'Tahini dressing'],
        nutritionInfo: { calories: 580, protein: '22g', carbs: '78g', fat: '24g' },
        spiceLevel: 0,
        preparationTime: '15-18 min',
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        availability: {
          monday: { lunch: false, dinner: true },
          tuesday: { lunch: false, dinner: true },
          wednesday: { lunch: false, dinner: true },
          thursday: { lunch: false, dinner: true },
          friday: { lunch: false, dinner: true },
          saturday: { lunch: true, dinner: true },
          sunday: { lunch: true, dinner: true }
        }
      },
      // Weekend Detox Specials
      {
        id: 406,
        planId: 'healthy-detox-platter-406',
        name: 'Weekend Detox Platter',
        price: 28.99,
        description: 'Cleansing weekend special with raw vegetables, sprouts, and superfoods.',
        longDescription: 'Detoxifying platter featuring raw vegetable salads, sprouted legumes, fermented vegetables, superfood smoothie, and herbal tea. Perfect for weekend cleansing.',
        category: 'Detox Specials',
        dietaryPreferences: ['vegan', 'vegetarian', 'gluten-free', 'organic', 'dairy-free'],
        ingredients: ['Raw vegetables', 'Sprouted legumes', 'Fermented vegetables', 'Superfood smoothie', 'Herbal tea'],
        nutritionInfo: { calories: 420, protein: '18g', carbs: '68g', fat: '12g' },
        spiceLevel: 0,
        preparationTime: '12-15 min',
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        availability: {
          monday: { lunch: false, dinner: false },
          tuesday: { lunch: false, dinner: false },
          wednesday: { lunch: false, dinner: false },
          thursday: { lunch: false, dinner: false },
          friday: { lunch: false, dinner: false },
          saturday: { lunch: true, dinner: true },
          sunday: { lunch: true, dinner: true }
        }
      },
      // Weekday Energy Bowls
      {
        id: 407,
        planId: 'healthy-energy-bowl-407',
        name: 'Weekday Energy Bowl',
        price: 17.99,
        description: 'High-protein bowl designed for busy weekdays with sustained energy.',
        longDescription: 'Power-packed bowl with lentils, quinoa, roasted sweet potato, spinach, hemp seeds, and energizing green goddess dressing. Fuel for your busy day.',
        category: 'Energy Bowls',
        dietaryPreferences: ['vegan', 'vegetarian', 'gluten-free', 'organic', 'dairy-free'],
        ingredients: ['Lentils', 'Quinoa', 'Roasted sweet potato', 'Spinach', 'Hemp seeds', 'Green goddess dressing'],
        nutritionInfo: { calories: 520, protein: '24g', carbs: '68g', fat: '18g' },
        spiceLevel: 0,
        preparationTime: '12-15 min',
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        availability: {
          monday: { lunch: true, dinner: true },
          tuesday: { lunch: true, dinner: true },
          wednesday: { lunch: true, dinner: true },
          thursday: { lunch: true, dinner: true },
          friday: { lunch: true, dinner: true },
          saturday: { lunch: false, dinner: false },
          sunday: { lunch: false, dinner: false }
        }
      }
    ]
  }
];

// Helper functions for location-based filtering
export const getRestaurantsByPostalCode = (postalCode) => {
  return unifiedRestaurants.filter(restaurant => 
    restaurant.postalCode === postalCode.toUpperCase()
  ).sort((a, b) => b.rating - a.rating); // Sort by rating descending
};

export const getTopRatedRestaurantsNear = (postalCode) => {
  return getRestaurantsByPostalCode(postalCode).filter(restaurant => 
    restaurant.isTopRated || restaurant.rating >= 4.5
  );
};

// Legacy exports for backward compatibility
export const featuredRestaurants = unifiedRestaurants.slice(0, 6);
export const nearbyRestaurants = unifiedRestaurants.slice(0, 4);

// Export as default for easy importing
export default unifiedRestaurants;
