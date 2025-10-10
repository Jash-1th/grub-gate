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
const { geocodeAddress } = require('../services/geocodingService');

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

  // Handle postal code search with enhanced proximity search
  let postalCodeRestaurants = null;
  if (postalCode) {
    try {
      // Use enhanced postal code search instead of exact match
      postalCodeRestaurants = await Restaurant.findNearbyByPostalCode(postalCode.trim().toUpperCase(), 10);
      console.log(`📍 Enhanced postal code search found ${postalCodeRestaurants.length} restaurants for ${postalCode}`);
    } catch (error) {
      console.error('🚨 Enhanced postal code search failed, falling back to exact match:', error.message);
      query['address.postalCode'] = postalCode.toUpperCase();
    }
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
  let restaurants, total;

  if (postalCodeRestaurants) {
    // Use enhanced postal code search results and apply additional filters
    let filteredRestaurants = postalCodeRestaurants;

    // Apply additional filters to postal code results
    if (cuisine) {
      const cuisineRegex = new RegExp(cuisine, 'i');
      filteredRestaurants = filteredRestaurants.filter(r => cuisineRegex.test(r.cuisine));
    }

    if (rating) {
      const minRating = parseFloat(rating);
      filteredRestaurants = filteredRestaurants.filter(r => r.rating >= minRating);
    }

    if (isPopular === 'true') {
      filteredRestaurants = filteredRestaurants.filter(r => r.isPopular);
    }

    if (isTopRated === 'true') {
      filteredRestaurants = filteredRestaurants.filter(r => r.rating >= 4.5 && r.reviewCount >= 50);
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filteredRestaurants = filteredRestaurants.filter(r => 
        searchRegex.test(r.name) || 
        searchRegex.test(r.description) || 
        searchRegex.test(r.cuisine) ||
        (r.tags && r.tags.some(tag => searchRegex.test(tag)))
      );
    }

    // Sort results
    filteredRestaurants.sort((a, b) => {
      if (sortOrder === 'desc') {
        return b[sortBy] > a[sortBy] ? 1 : -1;
      }
      return a[sortBy] > b[sortBy] ? 1 : -1;
    });

    total = filteredRestaurants.length;
    restaurants = filteredRestaurants.slice(skip, skip + parseInt(limit));

    // Populate owner information for postal code results
    for (let restaurant of restaurants) {
      await restaurant.populate('ownerId', 'firstName lastName email');
    }
  } else {
    // Use regular database query
    restaurants = await Restaurant.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('ownerId', 'firstName lastName email');

    total = await Restaurant.countDocuments(query);
  }

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

  // Extract address components for geocoding
  const { street, city, province, postalCode } = req.body.address || req.body;
  
  // Process tags if provided
  if (req.body.tags) {
    if (Array.isArray(req.body.tags)) {
      // If tags come as array (from form submission)
      req.body.tags = req.body.tags.filter(tag => tag && tag.trim());
    } else if (typeof req.body.tags === 'string') {
      // If tags come as comma-separated string
      req.body.tags = req.body.tags
        .split(',')
        .map(tag => tag.trim().toLowerCase())
        .filter(tag => tag.length > 0);
    }
  }

  try {
    // Attempt to geocode the address
    if (postalCode && city && province) {
      console.log(`🌍 Geocoding address: ${street}, ${city}, ${province}, ${postalCode}`);
      
      const coordinates = await geocodeAddress(postalCode, city, province, 'Canada');
      
      // Structure the address with coordinates
      req.body.address = {
        street: street || '',
        city: city,
        province: province,
        postalCode: postalCode.toUpperCase(),
        coordinates: {
          lat: coordinates.lat,
          lng: coordinates.lng
        }
      };
      
      console.log(`✅ Geocoding successful:`, coordinates);
      
    } else {
      // Create address without coordinates if geocoding info is incomplete
      req.body.address = {
        street: street || '',
        city: city || '',
        province: province || '',
        postalCode: postalCode ? postalCode.toUpperCase() : ''
      };
      
      console.log('⚠️ Incomplete address info for geocoding, creating restaurant without coordinates');
    }

    // Create the restaurant
    const restaurant = await Restaurant.create(req.body);
    
    // Populate owner information for response
    await restaurant.populate('ownerId', 'firstName lastName email');
    
    createdResponse(res, { restaurant }, 'Restaurant created successfully with location data');
    
  } catch (geocodingError) {
    console.error('🚨 Geocoding failed:', geocodingError.message);
    
    // Still create restaurant but without coordinates
    req.body.address = {
      street: street || '',
      city: city || '',
      province: province || '',
      postalCode: postalCode ? postalCode.toUpperCase() : ''
    };
    
    try {
      const restaurant = await Restaurant.create(req.body);
      await restaurant.populate('ownerId', 'firstName lastName email');
      
      // Return success but note that coordinates will be updated later
      createdResponse(res, { 
        restaurant,
        warning: 'Restaurant created successfully but location coordinates could not be determined. Please update your address for better delivery accuracy.'
      }, 'Restaurant created (coordinates will be updated later)');
      
    } catch (dbError) {
      console.error('🚨 Database error:', dbError);
      errorResponse(res, 'Failed to create restaurant', 500);
    }
  }
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
 * @desc    Get restaurants by postal code with enhanced proximity search
 * @route   GET /api/v1/restaurants/by-postal-code
 * @access  Public
 */
const getRestaurantsByPostalCode = asyncHandler(async (req, res) => {
  const { postalCode, limit = 20, page = 1, radius = 10 } = req.query;
  
  if (!postalCode) {
    return errorResponse(res, 'Postal code is required', 400);
  }

  console.log(`🔍 Enhanced postal code search for: ${postalCode} (radius: ${radius}km)`);

  try {
    // Use enhanced search method with improved MapBox geocoding and postal code range matching
    const restaurants = await Restaurant.findNearbyByPostalCode(
      postalCode.trim().toUpperCase(), 
      parseInt(radius)
    );

    console.log(`📍 Enhanced search found ${restaurants.length} restaurants for postal code: ${postalCode}`);

    // Apply pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedRestaurants = restaurants
      .slice(skip, skip + parseInt(limit))
      .map(restaurant => {
        // Remove sensitive fields
        const { ownerId, commissionRate, __v, ...publicData } = restaurant.toObject ? restaurant.toObject() : restaurant;
        return publicData;
      });

    const total = restaurants.length;

    // Transform data to match frontend expectations
    const transformedRestaurants = paginatedRestaurants.map(restaurant => ({
      id: restaurant._id,
      name: restaurant.name,
      image: restaurant.logo || '/images/grub-gate-default-restaurant-img.jpg',
      rating: restaurant.rating,
      reviewCount: restaurant.reviewCount,
      description: restaurant.description,
      cuisine: restaurant.cuisine,
      deliveryTime: restaurant.deliverySettings ? `${restaurant.deliverySettings.avgDeliveryTime - 5}-${restaurant.deliverySettings.avgDeliveryTime + 5} min` : '30-40 min',
      deliveryFee: restaurant.deliverySettings ? `$${restaurant.deliverySettings.fee.toFixed(2)}` : '$0.00',
      minOrder: restaurant.deliverySettings ? `$${restaurant.deliverySettings.minOrderAmount}` : '$0',
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

    // Enhanced success message based on search results
    let searchMessage = `Found ${total} restaurants for postal code ${postalCode.toUpperCase()}`;
    if (total > 0) {
      searchMessage += ` (using enhanced proximity search with ${radius}km radius)`;
    } else {
      searchMessage = `No restaurants found for postal code ${postalCode.toUpperCase()} within ${radius}km. Try expanding your search radius or check nearby postal codes.`;
    }

    paginatedResponse(res, transformedRestaurants, pagination, searchMessage);
    
  } catch (error) {
    console.error('🚨 Error searching restaurants by postal code:', error);
    errorResponse(res, `Failed to search restaurants for postal code ${postalCode}`, 500);
  }
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
