// FILE: scripts/test-customer-analytics.js
const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../src/models/User');
const Order = require('../src/models/Order');
const Restaurant = require('../src/models/Restaurant');

const connectDB = require('../src/config/database');

const testCustomerAnalytics = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log('✅ Connected to database');

    // Test 1: Find a restaurant
    const restaurant = await Restaurant.findOne();
    if (!restaurant) {
      console.log('❌ No restaurants found. Please create a restaurant first.');
      return;
    }
    console.log(`✅ Found restaurant: ${restaurant.name} (ID: ${restaurant._id})`);

    // Test 2: Test the customer analytics aggregation
    console.log('\n🔍 Testing customer analytics aggregation...');
    
    const customers = await User.aggregate([
      // Match users with search criteria
      { $match: { roles: { $in: ['customer'] } } },
      
      // Lookup orders for this specific restaurant
      {
        $lookup: {
          from: 'orders',
          let: { userId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$customerId', '$$userId'] },
                    { $eq: ['$restaurantId', restaurant._id] },
                    { $eq: ['$paymentStatus', 'paid'] }
                  ]
                }
              }
            },
            { $sort: { createdAt: -1 } }
          ],
          as: 'restaurantOrders'
        }
      },
      
      // Only include customers who have ordered from this restaurant
      {
        $match: {
          'restaurantOrders.0': { $exists: true }
        }
      },
      
      // Calculate restaurant-specific analytics
      {
        $addFields: {
          totalOrders: { $size: '$restaurantOrders' },
          totalSpent: { 
            $round: [{ $sum: '$restaurantOrders.total' }, 2]
          },
          averageOrderValue: { 
            $round: [{ $avg: '$restaurantOrders.total' }, 2]
          },
          lastOrderDate: { $max: '$restaurantOrders.createdAt' },
          firstOrderDate: { $min: '$restaurantOrders.createdAt' }
        }
      },
      
      // Clean up sensitive fields
      {
        $project: {
          restaurantOrders: 0,
          passwordHash: 0,
          emailVerificationToken: 0,
          passwordResetToken: 0,
          passwordResetExpires: 0
        }
      },
      
      // Sort by total spent (highest spenders first)
      { $sort: { totalSpent: -1 } },
      
      // Limit for testing
      { $limit: 5 }
    ]);

    console.log(`✅ Found ${customers.length} customers for restaurant ${restaurant.name}`);
    
    if (customers.length > 0) {
      console.log('\n📊 Sample customer analytics:');
      customers.forEach((customer, index) => {
        console.log(`${index + 1}. ${customer.fullName || `${customer.firstName} ${customer.lastName}`}`);
        console.log(`   📧 ${customer.email}`);
        console.log(`   📱 ${customer.phoneNumber || customer.phone || 'No phone'}`);
        console.log(`   🛒 Orders: ${customer.totalOrders}`);
        console.log(`   💰 Total Spent: $${customer.totalSpent}`);
        console.log(`   📈 Avg Order: $${customer.averageOrderValue}`);
        console.log(`   📅 Last Order: ${customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString() : 'N/A'}`);
        console.log(`   ✅ Status: ${customer.status}`);
        console.log('');
      });

      // Test 3: Calculate summary statistics
      const summary = {
        totalCustomers: customers.length,
        totalRevenue: customers.reduce((sum, customer) => sum + customer.totalSpent, 0),
        totalOrders: customers.reduce((sum, customer) => sum + customer.totalOrders, 0),
        averageCustomerValue: customers.length > 0 
          ? Math.round((customers.reduce((sum, customer) => sum + customer.totalSpent, 0) / customers.length) * 100) / 100
          : 0
      };

      console.log('📈 Summary Statistics:');
      console.log(`   👥 Total Customers: ${summary.totalCustomers}`);
      console.log(`   💰 Total Revenue: $${summary.totalRevenue.toFixed(2)}`);
      console.log(`   🛒 Total Orders: ${summary.totalOrders}`);
      console.log(`   📊 Avg Customer Value: $${summary.averageCustomerValue.toFixed(2)}`);
    } else {
      console.log('ℹ️  No customers found for this restaurant. This could mean:');
      console.log('   - No orders have been placed for this restaurant');
      console.log('   - All orders are unpaid or cancelled');
      console.log('   - Customer data needs to be created');
    }

    console.log('\n✅ Customer analytics test completed successfully!');

  } catch (error) {
    console.error('❌ Error testing customer analytics:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the test
if (require.main === module) {
  testCustomerAnalytics();
}

module.exports = testCustomerAnalytics;
