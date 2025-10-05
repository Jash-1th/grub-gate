// FILE: src/controllers/menuItem.controller.js
const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');
const { 
  successResponse, 
  errorResponse,
  createdResponse,
  notFoundResponse,
  paginatedResponse
} = require('../utils/apiResponse');
const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * @desc    Get menu items for a restaurant
 * @route   GET /api/v1/restaurants/:restaurantId/menu-items
 * @access  Public
 */
const getMenuItems = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;
  const {
    page = 1,
    limit = 50,
    category,
    dietary,
    status = 'available',
    sortBy = 'category',
    sortOrder = 'asc',
    search
  } = req.query;

  // Check if restaurant exists
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) {
    return notFoundResponse(res, 'Restaurant not found');
  }

  // Build query
  const query = { restaurantId };

  if (status && status !== 'all') {
    query.status = status;
  }

  if (category) {
    query.category = category;
  }

  if (dietary) {
    const dietaryArray = Array.isArray(dietary) ? dietary : [dietary];
    query.dietaryPreferences = { $in: dietaryArray };
  }

  if (search) {
    query.$text = { $search: search };
  }

  // Build sort object
  const sort = {};
  if (search) {
    sort.score = { $meta: 'textScore' };
  } else {
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
  }

  // Execute query with pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const menuItems = await MenuItem.find(query, search ? { score: { $meta: 'textScore' } } : {})
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await MenuItem.countDocuments(query);

  const pagination = {
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(total / parseInt(limit)),
    totalItems: total
  };

  paginatedResponse(res, menuItems, pagination, 'Menu items retrieved successfully');
});

/**
 * @desc    Get single menu item
 * @route   GET /api/v1/restaurants/:restaurantId/menu-items/:id
 * @access  Public
 */
const getMenuItem = asyncHandler(async (req, res) => {
  const { restaurantId, id } = req.params;

  const menuItem = await MenuItem.findOne({
    _id: id,
    restaurantId
  }).populate('restaurantId', 'name cuisine');

  if (!menuItem) {
    return notFoundResponse(res, 'Menu item not found');
  }

  successResponse(res, { menuItem }, 'Menu item retrieved successfully');
});

/**
 * @desc    Create menu item
 * @route   POST /api/v1/restaurants/:restaurantId/menu-items
 * @access  Private (Partner)
 */
const createMenuItem = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;

  // Check if restaurant exists and user owns it
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) {
    return notFoundResponse(res, 'Restaurant not found');
  }

  // Add restaurant ID to request body
  req.body.restaurantId = restaurantId;

  const menuItem = await MenuItem.create(req.body);

  createdResponse(res, { menuItem }, 'Menu item created successfully');
});

/**
 * @desc    Update menu item
 * @route   PATCH /api/v1/restaurants/:restaurantId/menu-items/:id
 * @access  Private (Partner)
 */
const updateMenuItem = asyncHandler(async (req, res) => {
  const { restaurantId, id } = req.params;

  const menuItem = await MenuItem.findOneAndUpdate(
    { _id: id, restaurantId },
    req.body,
    { new: true, runValidators: true }
  );

  if (!menuItem) {
    return notFoundResponse(res, 'Menu item not found');
  }

  successResponse(res, { menuItem }, 'Menu item updated successfully');
});

/**
 * @desc    Delete menu item
 * @route   DELETE /api/v1/restaurants/:restaurantId/menu-items/:id
 * @access  Private (Partner)
 */
const deleteMenuItem = asyncHandler(async (req, res) => {
  const { restaurantId, id } = req.params;

  const menuItem = await MenuItem.findOneAndDelete({
    _id: id,
    restaurantId
  });

  if (!menuItem) {
    return notFoundResponse(res, 'Menu item not found');
  }

  successResponse(res, null, 'Menu item deleted successfully');
});

/**
 * @desc    Update menu item availability
 * @route   PATCH /api/v1/restaurants/:restaurantId/menu-items/:id/availability
 * @access  Private (Partner)
 */
const updateAvailability = asyncHandler(async (req, res) => {
  const { restaurantId, id } = req.params;
  const { availability } = req.body;

  const menuItem = await MenuItem.findOneAndUpdate(
    { _id: id, restaurantId },
    { availability },
    { new: true, runValidators: true }
  );

  if (!menuItem) {
    return notFoundResponse(res, 'Menu item not found');
  }

  successResponse(res, { menuItem }, 'Menu item availability updated successfully');
});

/**
 * @desc    Toggle menu item status
 * @route   PATCH /api/v1/restaurants/:restaurantId/menu-items/:id/status
 * @access  Private (Partner)
 */
const toggleStatus = asyncHandler(async (req, res) => {
  const { restaurantId, id } = req.params;
  const { status } = req.body;

  if (!['available', 'unavailable', 'out-of-stock'].includes(status)) {
    return errorResponse(res, 'Invalid status', 400);
  }

  const menuItem = await MenuItem.findOneAndUpdate(
    { _id: id, restaurantId },
    { status },
    { new: true }
  );

  if (!menuItem) {
    return notFoundResponse(res, 'Menu item not found');
  }

  successResponse(res, { menuItem }, 'Menu item status updated successfully');
});

/**
 * @desc    Get menu items by dietary preferences
 * @route   GET /api/v1/menu-items/dietary
 * @access  Public
 */
const getByDietaryPreferences = asyncHandler(async (req, res) => {
  const { preferences, restaurantId, limit = 20 } = req.query;

  if (!preferences) {
    return errorResponse(res, 'Dietary preferences are required', 400);
  }

  const preferencesArray = Array.isArray(preferences) ? preferences : [preferences];
  
  const menuItems = await MenuItem.findByDietaryPreferences(
    preferencesArray,
    restaurantId
  ).limit(parseInt(limit));

  successResponse(res, { menuItems }, 'Menu items retrieved successfully');
});

/**
 * @desc    Get popular menu items
 * @route   GET /api/v1/menu-items/popular
 * @access  Public
 */
const getPopularItems = asyncHandler(async (req, res) => {
  const { restaurantId, limit = 10 } = req.query;

  const menuItems = await MenuItem.getPopular(restaurantId, parseInt(limit));

  successResponse(res, { menuItems }, 'Popular menu items retrieved successfully');
});

/**
 * @desc    Search menu items
 * @route   GET /api/v1/menu-items/search
 * @access  Public
 */
const searchMenuItems = asyncHandler(async (req, res) => {
  const { q: searchTerm, restaurantId, limit = 20 } = req.query;

  if (!searchTerm) {
    return errorResponse(res, 'Search term is required', 400);
  }

  const menuItems = await MenuItem.searchItems(searchTerm, restaurantId)
    .limit(parseInt(limit));

  successResponse(res, { menuItems }, 'Search results retrieved successfully');
});

/**
 * @desc    Get menu items by price range
 * @route   GET /api/v1/menu-items/price-range
 * @access  Public
 */
const getByPriceRange = asyncHandler(async (req, res) => {
  const { minPrice, maxPrice, restaurantId, limit = 20 } = req.query;

  if (!minPrice || !maxPrice) {
    return errorResponse(res, 'Min and max price are required', 400);
  }

  const menuItems = await MenuItem.findByPriceRange(
    parseFloat(minPrice),
    parseFloat(maxPrice),
    restaurantId
  ).limit(parseInt(limit));

  successResponse(res, { menuItems }, 'Menu items retrieved successfully');
});

/**
 * @desc    Get menu categories for a restaurant
 * @route   GET /api/v1/restaurants/:restaurantId/menu-items/categories
 * @access  Public
 */
const getCategories = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;

  const categories = await MenuItem.distinct('category', {
    restaurantId,
    status: 'available'
  });

  successResponse(res, { categories }, 'Menu categories retrieved successfully');
});

module.exports = {
  getMenuItems,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  updateAvailability,
  toggleStatus,
  getByDietaryPreferences,
  getPopularItems,
  searchMenuItems,
  getByPriceRange,
  getCategories
};
