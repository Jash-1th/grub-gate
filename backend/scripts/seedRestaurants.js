// FILE: scripts/seedRestaurants.js
const mongoose = require('mongoose');
const Restaurant = require('../src/models/Restaurant');
const User = require('../src/models/User');
require('dotenv').config();

const sampleRestaurants = [
  {
    name: 'Chez Laurent Premium',
    description: 'Top-rated French bistro with seasonal ingredients and exceptional wine selection.',
    cuisine: 'French Bistro',
    address: {
      street: '1234 Rue Sherbrooke',
      city: 'Montreal',
      province: 'QC',
      postalCode: 'H3A',
      coordinates: { lat: 45.5048, lng: -73.5772 }
    },
    phone: '(514) 555-0101',
    email: 'contact@chezlaurent.ca',
    website: 'https://chezlaurent.ca',
    logo: '/images/grub-gate-default-restaurant-img.jpg',
    images: ['/images/grub-gate-default-restaurant-img.jpg'],
    deliverySettings: {
      radius: 15,
      fee: 3.99,
      minOrderAmount: 25,
      avgDeliveryTime: 30
    },
    rating: 4.8,
    reviewCount: 2156,
    totalOrders: 5420,
    isPopular: true,
    tags: ['french', 'bistro', 'premium', 'wine', 'gluten-free', 'vegetarian'],
    status: 'active'
  },
  {
    name: 'Bella Vista Italian',
    description: 'Authentic Italian cuisine with handmade pasta and wood-fired pizzas.',
    cuisine: 'Italian',
    address: {
      street: '2468 Rue McGill',
      city: 'Montreal',
      province: 'QC',
      postalCode: 'H3A',
      coordinates: { lat: 45.5052, lng: -73.5768 }
    },
    phone: '(514) 555-0105',
    email: 'info@bellavista.ca',
    website: 'https://bellavista.ca',
    logo: '/images/grub-gate-default-restaurant-img.jpg',
    images: ['/images/grub-gate-default-restaurant-img.jpg'],
    deliverySettings: {
      radius: 12,
      fee: 2.99,
      minOrderAmount: 20,
      avgDeliveryTime: 25
    },
    rating: 4.7,
    reviewCount: 1843,
    totalOrders: 4230,
    isPopular: true,
    tags: ['italian', 'pizza', 'pasta', 'authentic', 'vegetarian'],
    status: 'active'
  },
  {
    name: "Ocean's Bounty Seafood",
    description: 'Fresh Atlantic seafood with sustainable sourcing and expert preparation.',
    cuisine: 'Seafood',
    address: {
      street: '3579 Rue de la Montagne',
      city: 'Montreal',
      province: 'QC',
      postalCode: 'H3A',
      coordinates: { lat: 45.5045, lng: -73.5775 }
    },
    phone: '(514) 555-0106',
    email: 'hello@oceansbounty.ca',
    website: 'https://oceansbounty.ca',
    logo: '/images/grub-gate-default-restaurant-img.jpg',
    images: ['/images/grub-gate-default-restaurant-img.jpg'],
    deliverySettings: {
      radius: 18,
      fee: 4.99,
      minOrderAmount: 30,
      avgDeliveryTime: 35
    },
    rating: 4.9,
    reviewCount: 2234,
    totalOrders: 3890,
    isPopular: true,
    tags: ['seafood', 'fresh', 'sustainable', 'premium', 'gluten-free', 'dairy-free'],
    status: 'active'
  },
  {
    name: 'The Steakhouse Prime',
    description: 'Premium steakhouse featuring aged beef and classic sides.',
    cuisine: 'Steakhouse',
    address: {
      street: '4680 Rue Saint-Jacques',
      city: 'Montreal',
      province: 'QC',
      postalCode: 'H3A',
      coordinates: { lat: 45.5041, lng: -73.5779 }
    },
    phone: '(514) 555-0107',
    email: 'reservations@steakhouseprime.ca',
    website: 'https://steakhouseprime.ca',
    logo: '/images/grub-gate-default-restaurant-img.jpg',
    images: ['/images/grub-gate-default-restaurant-img.jpg'],
    deliverySettings: {
      radius: 20,
      fee: 5.99,
      minOrderAmount: 35,
      avgDeliveryTime: 40
    },
    rating: 4.8,
    reviewCount: 1967,
    totalOrders: 3456,
    isPopular: true,
    tags: ['steakhouse', 'premium', 'aged beef', 'classic', 'gluten-free', 'keto'],
    status: 'active'
  },
  {
    name: 'Green Garden Vegetarian',
    description: 'Fresh vegetarian and vegan dishes made with locally sourced organic ingredients.',
    cuisine: 'Vegetarian',
    address: {
      street: '5791 Boulevard Saint-Laurent',
      city: 'Montreal',
      province: 'QC',
      postalCode: 'H2T',
      coordinates: { lat: 45.5234, lng: -73.5804 }
    },
    phone: '(514) 555-0108',
    email: 'info@greengarden.ca',
    website: 'https://greengarden.ca',
    logo: '/images/grub-gate-default-restaurant-img.jpg',
    images: ['/images/grub-gate-default-restaurant-img.jpg'],
    deliverySettings: {
      radius: 10,
      fee: 2.49,
      minOrderAmount: 18,
      avgDeliveryTime: 22
    },
    rating: 4.6,
    reviewCount: 1456,
    totalOrders: 2890,
    isPopular: false,
    tags: ['vegetarian', 'vegan', 'organic', 'healthy', 'gluten-free', 'dairy-free'],
    status: 'active'
  },
  {
    name: 'Spice Route Indian',
    description: 'Authentic Indian cuisine with traditional spices and modern presentation.',
    cuisine: 'Indian',
    address: {
      street: '6802 Rue Jean-Talon',
      city: 'Montreal',
      province: 'QC',
      postalCode: 'H2T',
      coordinates: { lat: 45.5298, lng: -73.5812 }
    },
    phone: '(514) 555-0109',
    email: 'orders@spiceroute.ca',
    website: 'https://spiceroute.ca',
    logo: '/images/grub-gate-default-restaurant-img.jpg',
    images: ['/images/grub-gate-default-restaurant-img.jpg'],
    deliverySettings: {
      radius: 14,
      fee: 3.49,
      minOrderAmount: 22,
      avgDeliveryTime: 28
    },
    rating: 4.5,
    reviewCount: 1234,
    totalOrders: 2567,
    isPopular: false,
    tags: ['indian', 'spicy', 'traditional', 'vegetarian', 'vegan', 'gluten-free'],
    status: 'active'
  },
  {
    name: 'Tokyo Sushi Bar',
    description: 'Fresh sushi and Japanese cuisine prepared by experienced sushi chefs.',
    cuisine: 'Japanese',
    address: {
      street: '7913 Rue Sainte-Catherine',
      city: 'Montreal',
      province: 'QC',
      postalCode: 'H3B',
      coordinates: { lat: 45.4995, lng: -73.5698 }
    },
    phone: '(514) 555-0110',
    email: 'info@tokyosushi.ca',
    website: 'https://tokyosushi.ca',
    logo: '/images/grub-gate-default-restaurant-img.jpg',
    images: ['/images/grub-gate-default-restaurant-img.jpg'],
    deliverySettings: {
      radius: 16,
      fee: 4.49,
      minOrderAmount: 28,
      avgDeliveryTime: 32
    },
    rating: 4.7,
    reviewCount: 1789,
    totalOrders: 3123,
    isPopular: true,
    tags: ['japanese', 'sushi', 'fresh', 'traditional', 'gluten-free', 'dairy-free'],
    status: 'active'
  },
  {
    name: 'Mediterranean Delights',
    description: 'Healthy Mediterranean cuisine with fresh ingredients and bold flavors.',
    cuisine: 'Mediterranean',
    address: {
      street: '8024 Avenue du Parc',
      city: 'Montreal',
      province: 'QC',
      postalCode: 'H3B',
      coordinates: { lat: 45.5012, lng: -73.5701 }
    },
    phone: '(514) 555-0111',
    email: 'hello@meddelights.ca',
    website: 'https://meddelights.ca',
    logo: '/images/grub-gate-default-restaurant-img.jpg',
    images: ['/images/grub-gate-default-restaurant-img.jpg'],
    deliverySettings: {
      radius: 13,
      fee: 3.29,
      minOrderAmount: 24,
      avgDeliveryTime: 26
    },
    rating: 4.4,
    reviewCount: 987,
    totalOrders: 1876,
    isPopular: false,
    tags: ['mediterranean', 'healthy', 'fresh', 'vegetarian', 'gluten-free', 'dairy-free'],
    status: 'active'
  }
];

async function seedRestaurants() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/grubgate');
    console.log('Connected to MongoDB');

    // Find or create a default owner (partner user)
    let defaultOwner = await User.findOne({ role: 'partner' });
    
    if (!defaultOwner) {
      console.log('Creating default partner user...');
      defaultOwner = await User.create({
        firstName: 'Restaurant',
        lastName: 'Owner',
        email: 'partner@grubgate.com',
        passwordHash: 'password123', // This will be hashed by the pre-save middleware
        role: 'partner',
        emailVerified: true,
        status: 'active'
      });
      console.log('Default partner user created');
    }

    // Clear existing restaurants
    await Restaurant.deleteMany({});
    console.log('Cleared existing restaurants');

    // Add ownerId to each restaurant
    const restaurantsWithOwner = sampleRestaurants.map(restaurant => ({
      ...restaurant,
      ownerId: defaultOwner._id
    }));

    // Insert sample restaurants
    const insertedRestaurants = await Restaurant.insertMany(restaurantsWithOwner);
    console.log(`Successfully seeded ${insertedRestaurants.length} restaurants`);

    // Display summary
    console.log('\n=== SEEDED RESTAURANTS ===');
    insertedRestaurants.forEach((restaurant, index) => {
      console.log(`${index + 1}. ${restaurant.name} (${restaurant.address.postalCode}) - Rating: ${restaurant.rating}`);
    });

    console.log('\n=== POSTAL CODE DISTRIBUTION ===');
    const postalCodes = {};
    insertedRestaurants.forEach(restaurant => {
      const postal = restaurant.address.postalCode;
      postalCodes[postal] = (postalCodes[postal] || 0) + 1;
    });
    
    Object.entries(postalCodes).forEach(([postal, count]) => {
      console.log(`${postal}: ${count} restaurants`);
    });

    console.log('\n✅ Restaurant seeding completed successfully!');
    console.log('\nYou can now test the API endpoints:');
    console.log('- GET /api/v1/restaurants/by-postal-code?postalCode=H3A');
    console.log('- GET /api/v1/restaurants/by-postal-code?postalCode=H2T');
    console.log('- GET /api/v1/restaurants/by-postal-code?postalCode=H3B');

  } catch (error) {
    console.error('Error seeding restaurants:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the seeder
if (require.main === module) {
  seedRestaurants();
}

module.exports = seedRestaurants;
