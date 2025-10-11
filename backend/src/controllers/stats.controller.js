// FILE: src/controllers/stats.controller.js
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const User = require('../models/User');
const Order = require('../models/Order');
const { 
  successResponse, 
  errorResponse
} = require('../utils/apiResponse');
const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * @desc    Get comprehensive platform statistics for homepage
 * @route   GET /api/v1/stats/platform
 * @access  Public
 */
const getPlatformStats = asyncHandler(async (req, res) => {
  try {
    // Get restaurant statistics
    const totalRestaurants = await Restaurant.countDocuments({ 
      status: 'active' 
    });

    // Get customer statistics (users with customer role)
    const totalCustomers = await User.countDocuments({ 
      roles: 'customer',  // roles is an array, so this checks if 'customer' is in the array
      status: 'active'
    });

    // Get order statistics (total meals served)
    const totalOrders = await Order.countDocuments({
      status: { $ne: 'cancelled' }
    });

    // Get additional comprehensive stats
    const totalMenuItems = await MenuItem.countDocuments({
      restaurantId: { $in: await Restaurant.find({ status: 'active' }).distinct('_id') }
    });

    // Get average rating across all restaurants
    const avgRatingResult = await Restaurant.aggregate([
      { $match: { status: 'active', rating: { $exists: true, $ne: null } } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);

    const avgRating = avgRatingResult.length > 0 ? avgRatingResult[0].avgRating : 0;

    // Get cuisine distribution (top 5)
    const cuisineStats = await Restaurant.aggregate([
      { $match: { status: 'active' } },
      { $unwind: '$cuisine' },
      { $group: { _id: '$cuisine', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Get recent growth stats (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const recentCustomers = await User.countDocuments({
      roles: 'customer',
      createdAt: { $gte: thirtyDaysAgo }
    });

    const recentOrders = await Order.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
      status: { $ne: 'cancelled' }
    });

    const recentRestaurants = await Restaurant.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
      status: 'active'
    });

    successResponse(res, {
      // Main stats for homepage display
      totalRestaurants,
      totalCustomers,
      totalOrders,
      totalMenuItems,
      averageRating: Math.round(avgRating * 10) / 10,
      
      // Additional insights
      cuisineDistribution: cuisineStats,
      
      // Growth metrics (last 30 days)
      growth: {
        newCustomers: recentCustomers,
        newOrders: recentOrders,
        newRestaurants: recentRestaurants
      },
      
      // Metadata
      lastUpdated: new Date().toISOString(),
      dataSource: 'live'
    }, 'Platform statistics retrieved successfully');

  } catch (error) {
    console.error('Error fetching platform stats:', error);
    
    // Return fallback data in case of error
    successResponse(res, {
      totalRestaurants: 500,
      totalCustomers: 10000,
      totalOrders: 50000,
      totalMenuItems: 2500,
      averageRating: 4.5,
      cuisineDistribution: [],
      growth: {
        newCustomers: 150,
        newOrders: 1200,
        newRestaurants: 5
      },
      lastUpdated: new Date().toISOString(),
      dataSource: 'fallback'
    }, 'Platform statistics retrieved (fallback data)');
  }
});

/**
 * @desc    Get restaurant-specific statistics (already exists in restaurant controller)
 * @route   GET /api/v1/stats/restaurants
 * @access  Public
 */
const getRestaurantStats = asyncHandler(async (req, res) => {
  // Get total count of active restaurants
  const totalRestaurants = await Restaurant.countDocuments({ 
    status: 'active' 
  });

  // Get additional stats for comprehensive data
  const totalMenuItems = await MenuItem.countDocuments({
    restaurantId: { $in: await Restaurant.find({ status: 'active' }).distinct('_id') }
  });

  // Get cuisine distribution
  const cuisineStats = await Restaurant.aggregate([
    { $match: { status: 'active' } },
    { $unwind: '$cuisine' },
    { $group: { _id: '$cuisine', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  // Get restaurants by business type
  const businessTypeStats = await Restaurant.aggregate([
    { $match: { status: 'active' } },
    { $group: { _id: '$businessType', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  // Get average rating
  const avgRatingResult = await Restaurant.aggregate([
    { $match: { status: 'active', rating: { $exists: true, $ne: null } } },
    { $group: { _id: null, avgRating: { $avg: '$rating' } } }
  ]);

  const avgRating = avgRatingResult.length > 0 ? avgRatingResult[0].avgRating : 0;

  successResponse(res, {
    totalRestaurants,
    totalMenuItems,
    averageRating: Math.round(avgRating * 10) / 10,
    cuisineDistribution: cuisineStats,
    businessTypeDistribution: businessTypeStats,
    lastUpdated: new Date().toISOString()
  }, 'Restaurant statistics retrieved successfully');
});

/**
 * @desc    Get popular dishes (most ordered menu items)
 * @route   GET /api/v1/stats/popular-dishes
 * @access  Public
 */
const getPopularDishes = asyncHandler(async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    // Get most ordered menu items by aggregating order data
    const popularDishes = await Order.aggregate([
      // Match non-cancelled orders
      { $match: { status: { $ne: 'cancelled' } } },
      
      // Unwind the items array to work with individual items
      { $unwind: '$items' },
      
      // Group by menu item and count orders
      {
        $group: {
          _id: '$items.menuItemId',
          totalOrders: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
          avgPrice: { $avg: '$items.price' }
        }
      },
      
      // Sort by most ordered
      { $sort: { totalOrders: -1 } },
      
      // Limit results
      { $limit: parseInt(limit) },
      
      // Lookup menu item details
      {
        $lookup: {
          from: 'menuitems',
          localField: '_id',
          foreignField: '_id',
          as: 'menuItem'
        }
      },
      
      // Unwind menu item
      { $unwind: '$menuItem' },
      
      // Lookup restaurant details
      {
        $lookup: {
          from: 'restaurants',
          localField: 'menuItem.restaurantId',
          foreignField: '_id',
          as: 'restaurant'
        }
      },
      
      // Unwind restaurant
      { $unwind: '$restaurant' },
      
      // Project final structure
      {
        $project: {
          _id: '$menuItem._id',
          name: '$menuItem.name',
          description: '$menuItem.description',
          price: '$avgPrice',
          image: '$menuItem.image',
          category: '$menuItem.category',
          dietaryInfo: '$menuItem.dietaryInfo',
          totalOrders: 1,
          totalRevenue: 1,
          restaurant: {
            _id: '$restaurant._id',
            name: '$restaurant.name',
            cuisine: '$restaurant.cuisine'
          },
          // Calculate a popularity score (orders + revenue factor)
          popularityScore: { 
            $add: [
              '$totalOrders', 
              { $divide: ['$totalRevenue', 100] }
            ]
          }
        }
      },
      
      // Sort by popularity score
      { $sort: { popularityScore: -1 } }
    ]);

    // If no orders exist, get some random popular menu items
    if (popularDishes.length === 0) {
      const fallbackDishes = await MenuItem.aggregate([
        // Match active menu items
        { $match: { isAvailable: true } },
        
        // Lookup restaurant details
        {
          $lookup: {
            from: 'restaurants',
            localField: 'restaurantId',
            foreignField: '_id',
            as: 'restaurant'
          }
        },
        
        // Unwind restaurant
        { $unwind: '$restaurant' },
        
        // Match active restaurants
        { $match: { 'restaurant.status': 'active' } },
        
        // Sample random items
        { $sample: { size: parseInt(limit) } },
        
        // Project structure
        {
          $project: {
            _id: 1,
            name: 1,
            description: 1,
            price: 1,
            image: 1,
            category: 1,
            dietaryInfo: 1,
            totalOrders: 0,
            totalRevenue: 0,
            restaurant: {
              _id: '$restaurant._id',
              name: '$restaurant.name',
              cuisine: '$restaurant.cuisine'
            },
            popularityScore: 0
          }
        }
      ]);
      
      return successResponse(res, {
        dishes: fallbackDishes,
        total: fallbackDishes.length,
        dataSource: 'random_sample',
        message: 'No order data available, showing sample dishes'
      }, 'Popular dishes retrieved successfully (sample data)');
    }

    successResponse(res, {
      dishes: popularDishes,
      total: popularDishes.length,
      dataSource: 'order_analytics',
      message: 'Based on actual order data'
    }, 'Popular dishes retrieved successfully');

  } catch (error) {
    console.error('Error fetching popular dishes:', error);
    
    // Return fallback static data
    const fallbackDishes = [
      {
        _id: 'fallback1',
        name: 'Gourmet Burger',
        description: 'Juicy beef patty with fresh vegetables and special sauce',
        price: 12.99,
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80',
        category: 'Main Course',
        totalOrders: 50,
        restaurant: { name: 'Sample Restaurant', cuisine: ['American'] }
      },
      {
        _id: 'fallback2',
        name: 'Margherita Pizza',
        description: 'Classic Italian pizza with fresh basil and mozzarella',
        price: 14.99,
        image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=500&q=80',
        category: 'Main Course',
        totalOrders: 45,
        restaurant: { name: 'Sample Pizzeria', cuisine: ['Italian'] }
      },
      {
        _id: 'fallback3',
        name: 'Sushi Platter',
        description: 'Assorted fresh sushi with wasabi and soy sauce',
        price: 18.99,
        image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=500&q=80',
        category: 'Main Course',
        totalOrders: 40,
        restaurant: { name: 'Sample Sushi Bar', cuisine: ['Japanese'] }
      }
    ];

    successResponse(res, {
      dishes: fallbackDishes,
      total: fallbackDishes.length,
      dataSource: 'fallback',
      message: 'Using fallback data due to error'
    }, 'Popular dishes retrieved (fallback data)');
  }
});

module.exports = {
  getPlatformStats,
  getRestaurantStats,
  getPopularDishes
};
