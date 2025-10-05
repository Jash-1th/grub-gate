// FILE: src/routes/search.routes.js
const express = require('express');
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const { optionalAuthMiddleware } = require('../middlewares/auth');
const { queryValidations } = require('../middlewares/validation');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { asyncHandler } = require('../middlewares/errorHandler');

const router = express.Router();

// Apply optional auth middleware
router.use(optionalAuthMiddleware);

/**
 * @desc    Search restaurants
 * @route   GET /api/v1/search/restaurants
 * @access  Public
 */
const searchRestaurants = asyncHandler(async (req, res) => {
  const {
    q: searchTerm,
    cuisine,
    location,
    rating,
    priceRange,
    limit = 20,
    page = 1
  } = req.query;

  if (!searchTerm) {
    return errorResponse(res, 'Search term is required', 400);
  }

  // Build search query
  const query = {
    status: 'active',
    $or: [
      { name: new RegExp(searchTerm, 'i') },
      { description: new RegExp(searchTerm, 'i') },
      { cuisine: new RegExp(searchTerm, 'i') },
      { tags: { $in: [new RegExp(searchTerm, 'i')] } }
    ]
  };

  // Apply filters
  if (cuisine) {
    query.cuisine = new RegExp(cuisine, 'i');
  }

  if (location) {
    query['address.city'] = new RegExp(location, 'i');
  }

  if (rating) {
    query.rating = { $gte: parseFloat(rating) };
  }

  // Execute search with pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const restaurants = await Restaurant.find(query)
    .sort({ rating: -1, totalOrders: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .select('name description cuisine address rating reviewCount totalOrders logo isPopular');

  const total = await Restaurant.countDocuments(query);

  const pagination = {
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(total / parseInt(limit)),
    totalItems: total
  };

  successResponse(res, {
    restaurants,
    pagination,
    searchTerm
  }, 'Restaurant search results retrieved successfully');
});

/**
 * @desc    Search menu items
 * @route   GET /api/v1/search/menu-items
 * @access  Public
 */
const searchMenuItems = asyncHandler(async (req, res) => {
  const {
    q: searchTerm,
    restaurantId,
    category,
    dietary,
    priceMin,
    priceMax,
    limit = 20,
    page = 1
  } = req.query;

  if (!searchTerm) {
    return errorResponse(res, 'Search term is required', 400);
  }

  // Build search query
  const query = {
    status: 'available',
    $text: { $search: searchTerm }
  };

  // Apply filters
  if (restaurantId) {
    query.restaurantId = restaurantId;
  }

  if (category) {
    query.category = category;
  }

  if (dietary) {
    const dietaryArray = Array.isArray(dietary) ? dietary : [dietary];
    query.dietaryPreferences = { $in: dietaryArray };
  }

  if (priceMin || priceMax) {
    query.price = {};
    if (priceMin) query.price.$gte = parseFloat(priceMin);
    if (priceMax) query.price.$lte = parseFloat(priceMax);
  }

  // Execute search with pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const menuItems = await MenuItem.find(query, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' }, rating: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('restaurantId', 'name cuisine address');

  const total = await MenuItem.countDocuments(query);

  const pagination = {
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(total / parseInt(limit)),
    totalItems: total
  };

  successResponse(res, {
    menuItems,
    pagination,
    searchTerm
  }, 'Menu item search results retrieved successfully');
});

/**
 * @desc    Global search (restaurants and menu items)
 * @route   GET /api/v1/search/global
 * @access  Public
 */
const globalSearch = asyncHandler(async (req, res) => {
  const {
    q: searchTerm,
    type = 'all', // 'restaurants', 'menu-items', or 'all'
    limit = 10
  } = req.query;

  if (!searchTerm) {
    return errorResponse(res, 'Search term is required', 400);
  }

  const results = {
    restaurants: [],
    menuItems: []
  };

  // Search restaurants
  if (type === 'all' || type === 'restaurants') {
    const restaurantQuery = {
      status: 'active',
      $or: [
        { name: new RegExp(searchTerm, 'i') },
        { description: new RegExp(searchTerm, 'i') },
        { cuisine: new RegExp(searchTerm, 'i') },
        { tags: { $in: [new RegExp(searchTerm, 'i')] } }
      ]
    };

    results.restaurants = await Restaurant.find(restaurantQuery)
      .sort({ rating: -1, totalOrders: -1 })
      .limit(parseInt(limit))
      .select('name description cuisine address rating reviewCount logo');
  }

  // Search menu items
  if (type === 'all' || type === 'menu-items') {
    const menuItemQuery = {
      status: 'available',
      $text: { $search: searchTerm }
    };

    results.menuItems = await MenuItem.find(menuItemQuery, { score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' }, rating: -1 })
      .limit(parseInt(limit))
      .populate('restaurantId', 'name cuisine')
      .select('name description category price rating image restaurantId');
  }

  successResponse(res, {
    ...results,
    searchTerm,
    totalResults: results.restaurants.length + results.menuItems.length
  }, 'Global search results retrieved successfully');
});

/**
 * @desc    Get search suggestions
 * @route   GET /api/v1/search/suggestions
 * @access  Public
 */
const getSearchSuggestions = asyncHandler(async (req, res) => {
  const { q: searchTerm, limit = 5 } = req.query;

  if (!searchTerm || searchTerm.length < 2) {
    return successResponse(res, { suggestions: [] }, 'Search suggestions retrieved');
  }

  // Get restaurant name suggestions
  const restaurantSuggestions = await Restaurant.find({
    status: 'active',
    name: new RegExp(searchTerm, 'i')
  })
    .limit(parseInt(limit))
    .select('name cuisine')
    .lean();

  // Get cuisine suggestions
  const cuisineSuggestions = await Restaurant.distinct('cuisine', {
    status: 'active',
    cuisine: new RegExp(searchTerm, 'i')
  }).limit(parseInt(limit));

  // Get menu item suggestions
  const menuItemSuggestions = await MenuItem.find({
    status: 'available',
    name: new RegExp(searchTerm, 'i')
  })
    .limit(parseInt(limit))
    .select('name category')
    .lean();

  const suggestions = [
    ...restaurantSuggestions.map(r => ({
      type: 'restaurant',
      text: r.name,
      subtitle: r.cuisine
    })),
    ...cuisineSuggestions.map(c => ({
      type: 'cuisine',
      text: c,
      subtitle: 'Cuisine'
    })),
    ...menuItemSuggestions.map(m => ({
      type: 'menu-item',
      text: m.name,
      subtitle: m.category
    }))
  ].slice(0, parseInt(limit));

  successResponse(res, { suggestions }, 'Search suggestions retrieved successfully');
});

/**
 * @desc    Get popular searches
 * @route   GET /api/v1/search/popular
 * @access  Public
 */
const getPopularSearches = asyncHandler(async (req, res) => {
  // TODO: Implement actual popular search tracking
  // For now, return static popular searches
  const popularSearches = [
    'Pizza',
    'Burger',
    'Sushi',
    'Italian',
    'Chinese',
    'Mexican',
    'Vegetarian',
    'Dessert',
    'Healthy',
    'Fast Food'
  ];

  successResponse(res, { 
    popularSearches: popularSearches.slice(0, 10) 
  }, 'Popular searches retrieved successfully');
});

// Routes
router.get('/restaurants', queryValidations.search, searchRestaurants);
router.get('/menu-items', queryValidations.search, searchMenuItems);
router.get('/global', queryValidations.search, globalSearch);
router.get('/suggestions', getSearchSuggestions);
router.get('/popular', getPopularSearches);

module.exports = router;
