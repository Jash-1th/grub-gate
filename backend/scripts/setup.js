// FILE: scripts/setup.js
const mongoose = require('mongoose');
require('dotenv').config();

// Import models to ensure they're registered
require('../src/models/User');
require('../src/models/Restaurant');
require('../src/models/MenuItem');
require('../src/models/Order');
require('../src/models/SubscriptionMealPlan');
require('../src/models/Subscription');
require('../src/models/Review');
require('../src/models/ContactMessage');

const setupDatabase = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    console.log('🔄 Setting up database indexes...');
    
    // Create indexes for better performance
    const User = mongoose.model('User');
    const Restaurant = mongoose.model('Restaurant');
    const MenuItem = mongoose.model('MenuItem');
    const Order = mongoose.model('Order');
    const Review = mongoose.model('Review');

    // User indexes
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ phoneNumber: 1 });
    await User.collection.createIndex({ role: 1 });

    // Restaurant indexes
    await Restaurant.collection.createIndex({ owner: 1 });
    await Restaurant.collection.createIndex({ 'address.city': 1 });
    await Restaurant.collection.createIndex({ cuisineType: 1 });
    await Restaurant.collection.createIndex({ isActive: 1 });
    await Restaurant.collection.createIndex({ averageRating: -1 });

    // MenuItem indexes
    await MenuItem.collection.createIndex({ restaurant: 1 });
    await MenuItem.collection.createIndex({ category: 1 });
    await MenuItem.collection.createIndex({ isAvailable: 1 });
    await MenuItem.collection.createIndex({ price: 1 });

    // Order indexes
    await Order.collection.createIndex({ customer: 1 });
    await Order.collection.createIndex({ restaurant: 1 });
    await Order.collection.createIndex({ status: 1 });
    await Order.collection.createIndex({ createdAt: -1 });

    // Review indexes
    await Review.collection.createIndex({ restaurant: 1 });
    await Review.collection.createIndex({ menuItem: 1 });
    await Review.collection.createIndex({ customer: 1 });
    await Review.collection.createIndex({ rating: -1 });

    console.log('✅ Database indexes created successfully');
    console.log('🎉 Database setup completed!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('📡 Database connection closed');
  }
};

// Run setup if this file is executed directly
if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase;
