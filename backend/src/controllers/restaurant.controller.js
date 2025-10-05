// FILE: src/controllers/restaurant.controller.js
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const { 
  successResponse, 
  errorResponse,
  createdResponse,
  notFoundResponse,
  paginatedResponse
} = require('../utils/apiResponse');
const { asyncHandler } = require('../middlewares/errorHandler');

// Helper function to handle ID mapping for frontend compatibility
const findRestaurantById = async (id) => {
  // If it's a numeric ID, try to find by a mapping or use a different approach
  if (/^\d+$/.test(id)) {
    // For now, we'll create a simple mapping based on restaurant names
    // In production, you might want to store this mapping in the database
    const numericId = parseInt(id);
    const restaurantMappings = {
      1: 'Chez Laurent Premium',
      2: 'Bella Vista Italian', 
      3: 'Ocean\'s Bounty Seafood',
      4: 'The Burger Joint',
      5: 'Bella Vista Italian',
      6: 'Green Garden Vegetarian',
      7: 'Spice Route Indian',
      8: 'Mediterranean Delights'
    };
    
    const restaurantName = restaurantMappings[numericId];
    if (restaurantName) {
      return await Restaurant.findOne({ name: restaurantName, status: 'active' });
    }
    return null;
  }
  
  // If it's a MongoDB ObjectId, use findById
  try {
    return await Restaurant.findById(id);
  } catch (error) {
    return null;
  }
};

/**
 * @desc    Get all restaurants
 * @route   GET /api/v1/restaurants
 * @access  Public
 */
const getRestaurants = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    cuisine,
    postalCode,
    rating,
    isPopular,
    isTopRated,
    search,
    sortBy = 'rating',
    sortOrder = 'desc'
  } = req.query;

  // Build query
  const query = { status: 'active' };

  if (cuisine) {
    query.cuisine = new RegExp(cuisine, 'i');
  }

  if (postalCode) {
    query['address.postalCode'] = postalCode;
  }

  if (rating) {
    query.rating = { $gte: parseFloat(rating) };
  }

  if (isPopular === 'true') {
    query.isPopular = true;
  }

  if (isTopRated === 'true') {
    query.rating = { $gte: 4.5 };
    query.reviewCount = { $gte: 50 };
  }

  if (search) {
    query.$or = [
      { name: new RegExp(search, 'i') },
      { description: new RegExp(search, 'i') },
      { cuisine: new RegExp(search, 'i') },
      { tags: { $in: [new RegExp(search, 'i')] } }
    ];
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Execute query with pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const restaurants = await Restaurant.find(query)
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit))
    .populate('ownerId', 'firstName lastName email');

  const total = await Restaurant.countDocuments(query);

  const pagination = {
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(total / parseInt(limit)),
    totalItems: total
  };

  paginatedResponse(res, restaurants, pagination, 'Restaurants retrieved successfully');
});

/**
 * @desc    Get single restaurant
 * @route   GET /api/v1/restaurants/:id
 * @access  Public
 */
const getRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await findRestaurantById(req.params.id);

  if (!restaurant) {
    return notFoundResponse(res, 'Restaurant not found');
  }

  // Populate owner information
  await restaurant.populate('ownerId', 'firstName lastName email');

  successResponse(res, { restaurant }, 'Restaurant retrieved successfully');
});

/**
 * @desc    Create restaurant
 * @route   POST /api/v1/restaurants
 * @access  Private (Partner)
 */
const createRestaurant = asyncHandler(async (req, res) => {
  // Add owner ID from authenticated user
  req.body.ownerId = req.user._id;

  const restaurant = await Restaurant.create(req.body);

  createdResponse(res, { restaurant }, 'Restaurant created successfully');
});

/**
 * @desc    Update restaurant
 * @route   PATCH /api/v1/restaurants/:id
 * @access  Private (Partner/Admin)
 */
const updateRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!restaurant) {
    return notFoundResponse(res, 'Restaurant not found');
  }

  successResponse(res, { restaurant }, 'Restaurant updated successfully');
});

/**
 * @desc    Delete restaurant
 * @route   DELETE /api/v1/restaurants/:id
 * @access  Private (Partner/Admin)
 */
const deleteRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id);

  if (!restaurant) {
    return notFoundResponse(res, 'Restaurant not found');
  }

  // Soft delete - change status to inactive
  restaurant.status = 'inactive';
  await restaurant.save();

  successResponse(res, null, 'Restaurant deleted successfully');
});

/**
 * @desc    Get restaurant menu
 * @route   GET /api/v1/restaurants/:id/menu
 * @access  Public
 */
const getRestaurantMenu = asyncHandler(async (req, res) => {
  const {
    category,
    dietary,
    available = 'true',
    sortBy = 'category',
    sortOrder = 'asc',
    userType = 'normal' // Add userType parameter
  } = req.query;

  // Check if restaurant exists
  const restaurant = await findRestaurantById(req.params.id);
  if (!restaurant) {
    return notFoundResponse(res, 'Restaurant not found');
  }

  let menuItems;

  // For normal users, only show items available for all days and all meal slots
  if (userType === 'normal') {
    menuItems = await MenuItem.findAlwaysAvailable(restaurant._id);
    
    // Apply additional filters for normal users
    if (category) {
      menuItems = menuItems.filter(item => item.category === category);
    }
    
    if (dietary) {
      const dietaryArray = Array.isArray(dietary) ? dietary : [dietary];
      menuItems = menuItems.filter(item => 
        dietaryArray.some(pref => item.dietaryPreferences.includes(pref))
      );
    }
    
    // Sort the results
    menuItems.sort((a, b) => {
      if (sortOrder === 'desc') {
        return b[sortBy] > a[sortBy] ? 1 : -1;
      }
      return a[sortBy] > b[sortBy] ? 1 : -1;
    });
  } else {
    // For pro users, show all items with regular filtering
    const query = { restaurantId: restaurant._id };

    if (available === 'true') {
      query.status = 'available';
    }

    if (category) {
      query.category = category;
    }

    if (dietary) {
      const dietaryArray = Array.isArray(dietary) ? dietary : [dietary];
      query.dietaryPreferences = { $in: dietaryArray };
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    menuItems = await MenuItem.find(query).sort(sort);
  }

  successResponse(res, { 
    restaurant: {
      id: restaurant._id,
      name: restaurant.name,
      cuisine: restaurant.cuisine
    },
    menuItems,
    userType,
    totalItems: menuItems.length
  }, `Restaurant menu retrieved successfully for ${userType} user`);
});

/**
 * @desc    Get restaurants by location
 * @route   GET /api/v1/restaurants/nearby
 * @access  Public
 */
const getNearbyRestaurants = asyncHandler(async (req, res) => {
  const { lat, lng, radius = 10 } = req.query;

  if (!lat || !lng) {
    return errorResponse(res, 'Latitude and longitude are required', 400);
  }

  const restaurants = await Restaurant.findByLocation(
    { lat: parseFloat(lat), lng: parseFloat(lng) },
    parseFloat(radius)
  );

  successResponse(res, { restaurants }, 'Nearby restaurants retrieved successfully');
});

/**
 * @desc    Get restaurants by postal code sorted by rating
 * @route   GET /api/v1/restaurants/by-postal-code
 * @access  Public
 */
const getRestaurantsByPostalCode = asyncHandler(async (req, res) => {
  const { postalCode, limit = 20, page = 1 } = req.query;
  
  if (!postalCode) {
    return errorResponse(res, 'Postal code is required', 400);
  }

  // Build query for active restaurants in the postal code area
  const query = { 
    status: 'active',
    'address.postalCode': postalCode.toUpperCase()
  };

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Find restaurants sorted by rating (descending) then by review count (descending)
  const restaurants = await Restaurant.find(query)
    .sort({ rating: -1, reviewCount: -1, totalOrders: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .select('-ownerId -commissionRate -__v')
    .lean();

  // Get total count for pagination
  const total = await Restaurant.countDocuments(query);

  // Transform data to match frontend expectations
  const transformedRestaurants = restaurants.map(restaurant => ({
    id: restaurant._id,
    name: restaurant.name,
    image: restaurant.logo || '/images/grub-gate-default-restaurant-img.jpg',
    rating: restaurant.rating,
    reviewCount: restaurant.reviewCount,
    description: restaurant.description,
    cuisine: restaurant.cuisine,
    deliveryTime: `${restaurant.deliverySettings.avgDeliveryTime - 5}-${restaurant.deliverySettings.avgDeliveryTime + 5} min`,
    deliveryFee: `$${restaurant.deliverySettings.fee.toFixed(2)}`,
    minOrder: `$${restaurant.deliverySettings.minOrderAmount}`,
    isOpen: restaurant.isOpen,
    isPopular: restaurant.isPopular,
    isTopRated: restaurant.rating >= 4.5 && restaurant.reviewCount >= 50,
    tags: restaurant.tags,
    location: `${restaurant.address.postalCode} - ${restaurant.address.city}`,
    postalCode: restaurant.address.postalCode,
    phone: restaurant.phone,
    address: restaurant.fullAddress || `${restaurant.address.street}, ${restaurant.address.city}, ${restaurant.address.province} ${restaurant.address.postalCode}`,
    coordinates: restaurant.address.coordinates,
    preferences: restaurant.tags // Using tags as preferences for now
  }));

  const pagination = {
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(total / parseInt(limit)),
    totalItems: total
  };

  paginatedResponse(res, transformedRestaurants, pagination, `Found ${total} restaurants near ${postalCode.toUpperCase()}`);
});

/**
 * @desc    Debug endpoint to test restaurant queries
 * @route   GET /api/v1/restaurants/debug
 * @access  Public
 */
const debugRestaurants = asyncHandler(async (req, res) => {
  console.log('🐛 Debug endpoint called');
  
  // Test 1: Get all restaurants
  const allRestaurants = await Restaurant.find({});
  console.log('🐛 All restaurants count:', allRestaurants.length);
  
  // Test 2: Get active restaurants
  const activeRestaurants = await Restaurant.find({ status: 'active' });
  console.log('🐛 Active restaurants count:', activeRestaurants.length);
  
  // Test 3: Get H3A restaurants
  const h3aRestaurants = await Restaurant.find({ 'address.postalCode': 'H3A' });
  console.log('🐛 H3A restaurants count:', h3aRestaurants.length);
  
  // Test 4: Get active H3A restaurants
  const activeH3aRestaurants = await Restaurant.find({ 
    status: 'active', 
    'address.postalCode': 'H3A' 
  });
  console.log('🐛 Active H3A restaurants count:', activeH3aRestaurants.length);
  
  if (allRestaurants.length > 0) {
    console.log('🐛 First restaurant sample:', {
      name: allRestaurants[0].name,
      status: allRestaurants[0].status,
      postalCode: allRestaurants[0].address.postalCode
    });
  }
  
  successResponse(res, {
    allCount: allRestaurants.length,
    activeCount: activeRestaurants.length,
    h3aCount: h3aRestaurants.length,
    activeH3aCount: activeH3aRestaurants.length,
    sample: allRestaurants.length > 0 ? {
      name: allRestaurants[0].name,
      status: allRestaurants[0].status,
      postalCode: allRestaurants[0].address.postalCode
    } : null
  }, 'Debug data retrieved');
});

/**
 * @desc    Get popular restaurants
 * @route   GET /api/v1/restaurants/popular
 * @access  Public
 */
const getPopularRestaurants = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const restaurants = await Restaurant.getPopular(parseInt(limit));

  successResponse(res, { restaurants }, 'Popular restaurants retrieved successfully');
});

/**
 * @desc    Get top-rated restaurants
 * @route   GET /api/v1/restaurants/top-rated
 * @access  Public
 */
const getTopRatedRestaurants = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const restaurants = await Restaurant.getTopRated(parseInt(limit));

  successResponse(res, { restaurants }, 'Top-rated restaurants retrieved successfully');
});

/**
 * @desc    Get restaurant analytics
 * @route   GET /api/v1/restaurants/:id/analytics
 * @access  Private (Partner/Admin)
 */
const getRestaurantAnalytics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const restaurantId = req.params.id;

  // Default to last 30 days if no dates provided
  const end = endDate ? new Date(endDate) : new Date();
  const start = startDate ? new Date(startDate) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

  const Order = require('../models/Order');
  const Review = require('../models/Review');

  // Get revenue stats
  const revenueStats = await Order.getRevenueStats(restaurantId, start, end);

  // Get popular items
  const popularItems = await Order.getPopularItems(restaurantId, 10);

  // Get review stats
  const reviewStats = await Review.getStats(restaurantId);

  // Get order trends (daily)
  const orderTrends = await Order.aggregate([
    {
      $match: {
        restaurantId: mongoose.Types.ObjectId(restaurantId),
        createdAt: { $gte: start, $lte: end },
        status: { $ne: 'cancelled' }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        orders: { $sum: 1 },
        revenue: { $sum: '$total' }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
    }
  ]);

  successResponse(res, {
    revenueStats: revenueStats[0] || {},
    popularItems,
    reviewStats: reviewStats[0] || {},
    orderTrends
  }, 'Restaurant analytics retrieved successfully');
});

module.exports = {
  getRestaurants,
  getRestaurant,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getRestaurantMenu,
  getNearbyRestaurants,
  getRestaurantsByPostalCode,
  debugRestaurants,
  getPopularRestaurants,
  getTopRatedRestaurants,
  getRestaurantAnalytics
};
