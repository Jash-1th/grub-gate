// FILE: src/controllers/partner/menuItem.controller.js
const MenuItem = require('../../models/MenuItem');
const Restaurant = require('../../models/Restaurant');
const Order = require('../../models/Order');

// Helper function to find restaurant by flexible ID (mock ID or ObjectId)
const findRestaurantById = async (id, ownerId) => {
  // If it's a mock ID like 'rest_001', use name-based mapping
  if (/^[a-zA-Z0-9_]+$/.test(id) && !/^[0-9a-fA-F]{24}$/.test(id)) {
    const restaurantMappings = {
      'rest_001': 'Bistro Montreal',
      'rest_002': 'Chez Laurent Premium',
      'rest_003': 'Bella Vista Italian',
      'rest_004': 'Ocean\'s Bounty Seafood',
      'rest_005': 'The Burger Joint'
    };
    
    const restaurantName = restaurantMappings[id];
    if (restaurantName) {
      // For development, we'll create a mock restaurant if it doesn't exist
      let restaurant = await Restaurant.findOne({ name: restaurantName });
      if (!restaurant) {
        // Create a mock restaurant for development
        restaurant = await Restaurant.create({
          name: restaurantName,
          description: `Mock restaurant for development: ${restaurantName}`,
          cuisine: ['French'], // Default cuisine
          businessType: 'restaurant',
          ownerId: ownerId,
          address: {
            street: '123 Mock Street',
            city: 'Montreal',
            province: 'QC',
            postalCode: 'H1A 1A1'
          },
          phone: '+1 (514) 555-0123',
          email: `info@${restaurantName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
          status: 'active',
          // Required delivery settings with default values
          deliverySettings: {
            radius: 10, // 10 km default radius
            fee: 4.99, // $4.99 default delivery fee
            minOrderAmount: 25.00, // $25 minimum order
            avgDeliveryTime: 35 // 35 minutes average delivery time
          },
          // Optional operating hours with defaults
          operatingHours: {
            monday: { open: '09:00', close: '22:00', closed: false },
            tuesday: { open: '09:00', close: '22:00', closed: false },
            wednesday: { open: '09:00', close: '22:00', closed: false },
            thursday: { open: '09:00', close: '22:00', closed: false },
            friday: { open: '09:00', close: '23:00', closed: false },
            saturday: { open: '10:00', close: '23:00', closed: false },
            sunday: { open: '10:00', close: '21:00', closed: false }
          }
        });
        console.log('🏪 Created mock restaurant for development:', restaurant.name);
      }
      return restaurant;
    }
    return null;
  }
  
  // If it's a MongoDB ObjectId, use findById with ownership check
  try {
    return await Restaurant.findOne({ _id: id, ownerId: ownerId });
  } catch (error) {
    return null;
  }
};
const { 
  successResponse, 
  errorResponse,
  createdResponse,
  notFoundResponse,
  paginatedResponse
} = require('../../utils/apiResponse');
const { asyncHandler } = require('../../middlewares/errorHandler');
const { menuItemImageUpload, uploadToCloudinary, deleteFromCloudinary } = require('../../config/cloudinary');

/**
 * @desc    Get menu items for partner's restaurant
 * @route   GET /api/v1/partner/restaurants/:restaurantId/menu-items
 * @access  Private (Partner)
 */
const getPartnerMenuItems = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;
  const {
    page = 1,
    limit = 50,
    category,
    status,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    search
  } = req.query;

  // Verify restaurant ownership
  const restaurant = await findRestaurantById(restaurantId, req.user._id);
  
  if (!restaurant) {
    return notFoundResponse(res, 'Restaurant not found or access denied');
  }

  // Build query - use actual restaurant ObjectId for database queries
  const query = { restaurantId: restaurant._id };

  if (status && status !== 'all') {
    query.status = status;
  }

  if (category && category !== 'all') {
    query.category = category;
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

  // Execute aggregation with order counts
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  // Build aggregation pipeline
  const pipeline = [
    // Match menu items for this restaurant
    { $match: query },
    
    // Add text search score if searching
    ...(search ? [{ $addFields: { score: { $meta: 'textScore' } } }] : []),
    
    // Lookup order counts for each menu item
    {
      $lookup: {
        from: 'orders',
        let: { menuItemId: '$_id' },
        pipeline: [
          // Match non-cancelled orders
          { $match: { status: { $ne: 'cancelled' } } },
          // Unwind items array
          { $unwind: '$items' },
          // Match this specific menu item
          { $match: { $expr: { $eq: ['$items.menuItemId', '$$menuItemId'] } } },
          // Sum the quantities
          { $group: { _id: null, totalOrders: { $sum: '$items.quantity' } } }
        ],
        as: 'orderStats'
      }
    },
    
    // Add totalOrders field
    {
      $addFields: {
        totalOrders: {
          $ifNull: [{ $arrayElemAt: ['$orderStats.totalOrders', 0] }, 0]
        }
      }
    },
    
    // Remove the temporary orderStats field
    { $unset: 'orderStats' },
    
    // Sort
    { $sort: sort },
    
    // Pagination
    { $skip: skip },
    { $limit: parseInt(limit) }
  ];

  const menuItems = await MenuItem.aggregate(pipeline);
  const total = await MenuItem.countDocuments(query);

  const pagination = {
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(total / parseInt(limit)),
    totalItems: total
  };

  paginatedResponse(res, menuItems, pagination, 'Menu items with order counts retrieved successfully');
});

/**
 * @desc    Create menu item with image upload
 * @route   POST /api/v1/partner/restaurants/:restaurantId/menu-items
 * @access  Private (Partner)
 */
const createPartnerMenuItem = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;

  // Verify restaurant ownership
  const restaurant = await findRestaurantById(restaurantId, req.user._id);
  
  if (!restaurant) {
    return notFoundResponse(res, 'Restaurant not found or access denied');
  }

  // Auto-populate cuisine from restaurant's primary cuisine if not provided
  if (!req.body.cuisine && restaurant.cuisine && restaurant.cuisine.length > 0) {
    req.body.cuisine = restaurant.cuisine[0]; // Use first cuisine as default
  }

  // Add restaurant ID to request body - use actual ObjectId
  req.body.restaurantId = restaurant._id;

  // Debug: Log received data
  console.log('📥 Backend received menu item data:', req.body);
  
  // Handle availability parsing if it's a string (from FormData)
  if (req.body.availability && typeof req.body.availability === 'string') {
    try {
      console.log('📥 Parsing availability string:', req.body.availability);
      req.body.availability = JSON.parse(req.body.availability);
      console.log('📥 Parsed availability:', req.body.availability);
      
      // Ensure all values are proper booleans
      Object.keys(req.body.availability).forEach(day => {
        if (req.body.availability[day]) {
          req.body.availability[day].lunch = Boolean(req.body.availability[day].lunch);
          req.body.availability[day].dinner = Boolean(req.body.availability[day].dinner);
        }
      });
      
      console.log('📥 Cleaned availability:', req.body.availability);
    } catch (error) {
      console.error('📥 Error parsing availability:', error);
      return errorResponse(res, 'Invalid availability format', 400);
    }
  }

  // Handle image upload if provided
  if (req.file) {
    req.body.image = req.file.path; // Cloudinary URL
  }

  // Ensure numeric fields are properly converted
  if (req.body.price) {
    req.body.price = parseFloat(req.body.price);
    console.log('📥 Converted price to number:', req.body.price);
  }
  
  if (req.body.prepTime) {
    req.body.prepTime = parseInt(req.body.prepTime);
    console.log('📥 Converted prepTime to number:', req.body.prepTime);
  }
  
  if (req.body.servings) {
    req.body.servings = parseInt(req.body.servings);
    console.log('📥 Converted servings to number:', req.body.servings);
  }
  
  if (req.body.spiceLevel) {
    req.body.spiceLevel = parseInt(req.body.spiceLevel);
    console.log('📥 Converted spiceLevel to number:', req.body.spiceLevel);
  }

  console.log('📥 Final data before creating menu item:', req.body);
  const menuItem = await MenuItem.create(req.body);
  console.log('📥 Created menu item with availability:', menuItem.availability);

  createdResponse(res, { menuItem }, 'Menu item created successfully');
});

/**
 * @desc    Update menu item with optional image upload
 * @route   PATCH /api/v1/partner/restaurants/:restaurantId/menu-items/:id
 * @access  Private (Partner)
 */
const updatePartnerMenuItem = asyncHandler(async (req, res) => {
  const { restaurantId, id } = req.params;

  // Verify restaurant ownership
  const restaurant = await findRestaurantById(restaurantId, req.user._id);
  
  if (!restaurant) {
    return notFoundResponse(res, 'Restaurant not found or access denied');
  }

  // Find existing menu item - use actual ObjectId
  const existingMenuItem = await MenuItem.findOne({ _id: id, restaurantId: restaurant._id });
  if (!existingMenuItem) {
    return notFoundResponse(res, 'Menu item not found');
  }

  // Debug: Log received update data
  console.log('📥 Backend received menu item update data:', req.body);
  
  // Handle availability parsing if it's a string (from FormData)
  if (req.body.availability && typeof req.body.availability === 'string') {
    try {
      console.log('📥 Parsing availability string for update:', req.body.availability);
      req.body.availability = JSON.parse(req.body.availability);
      console.log('📥 Parsed availability for update:', req.body.availability);
      
      // Ensure all values are proper booleans
      Object.keys(req.body.availability).forEach(day => {
        if (req.body.availability[day]) {
          req.body.availability[day].lunch = Boolean(req.body.availability[day].lunch);
          req.body.availability[day].dinner = Boolean(req.body.availability[day].dinner);
        }
      });
      
      console.log('📥 Cleaned availability for update:', req.body.availability);
    } catch (error) {
      console.error('📥 Error parsing availability for update:', error);
      return errorResponse(res, 'Invalid availability format', 400);
    }
  }

  // Handle image upload if provided
  if (req.file) {
    // Delete old image from Cloudinary if exists
    if (existingMenuItem.image) {
      try {
        const publicId = existingMenuItem.image.split('/').pop().split('.')[0];
        await deleteFromCloudinary(publicId);
      } catch (error) {
        console.log('Error deleting old image:', error);
      }
    }
    req.body.image = req.file.path; // New Cloudinary URL
  }

  // Ensure numeric fields are properly converted for updates
  if (req.body.price !== undefined) {
    req.body.price = parseFloat(req.body.price);
    console.log('📥 Converted price to number for update:', req.body.price);
  }
  
  if (req.body.prepTime !== undefined) {
    req.body.prepTime = parseInt(req.body.prepTime);
    console.log('📥 Converted prepTime to number for update:', req.body.prepTime);
  }
  
  if (req.body.servings !== undefined) {
    req.body.servings = parseInt(req.body.servings);
    console.log('📥 Converted servings to number for update:', req.body.servings);
  }
  
  if (req.body.spiceLevel !== undefined) {
    req.body.spiceLevel = parseInt(req.body.spiceLevel);
    console.log('📥 Converted spiceLevel to number for update:', req.body.spiceLevel);
  }

  const menuItem = await MenuItem.findOneAndUpdate(
    { _id: id, restaurantId: restaurant._id },
    req.body,
    { new: true, runValidators: true }
  );

  successResponse(res, { menuItem }, 'Menu item updated successfully');
});

/**
 * @desc    Delete menu item
 * @route   DELETE /api/v1/partner/restaurants/:restaurantId/menu-items/:id
 * @access  Private (Partner)
 */
const deletePartnerMenuItem = asyncHandler(async (req, res) => {
  const { restaurantId, id } = req.params;

  // Verify restaurant ownership
  const restaurant = await findRestaurantById(restaurantId, req.user._id);
  
  if (!restaurant) {
    return notFoundResponse(res, 'Restaurant not found or access denied');
  }

  const menuItem = await MenuItem.findOneAndDelete({
    _id: id,
    restaurantId: restaurant._id
  });

  if (!menuItem) {
    return notFoundResponse(res, 'Menu item not found');
  }

  // Delete image from Cloudinary if exists
  if (menuItem.image) {
    try {
      const publicId = menuItem.image.split('/').pop().split('.')[0];
      await deleteFromCloudinary(publicId);
    } catch (error) {
      console.log('Error deleting image:', error);
    }
  }

  successResponse(res, null, 'Menu item deleted successfully');
});

/**
 * @desc    Toggle menu item status
 * @route   PATCH /api/v1/partner/restaurants/:restaurantId/menu-items/:id/status
 * @access  Private (Partner)
 */
const togglePartnerMenuItemStatus = asyncHandler(async (req, res) => {
  const { restaurantId, id } = req.params;
  const { status } = req.body;

  // Verify restaurant ownership
  const restaurant = await findRestaurantById(restaurantId, req.user._id);
  
  if (!restaurant) {
    return notFoundResponse(res, 'Restaurant not found or access denied');
  }

  if (!['available', 'unavailable', 'out-of-stock'].includes(status)) {
    return errorResponse(res, 'Invalid status', 400);
  }

  const menuItem = await MenuItem.findOneAndUpdate(
    { _id: id, restaurantId: restaurant._id },
    { status },
    { new: true }
  );

  if (!menuItem) {
    return notFoundResponse(res, 'Menu item not found');
  }

  successResponse(res, { menuItem }, 'Menu item status updated successfully');
});

/**
 * @desc    Update menu item availability
 * @route   PATCH /api/v1/partner/restaurants/:restaurantId/menu-items/:id/availability
 * @access  Private (Partner)
 */
const updatePartnerMenuItemAvailability = asyncHandler(async (req, res) => {
  const { restaurantId, id } = req.params;
  const { availability } = req.body;

  // Verify restaurant ownership
  const restaurant = await findRestaurantById(restaurantId, req.user._id);
  
  if (!restaurant) {
    return notFoundResponse(res, 'Restaurant not found or access denied');
  }

  const menuItem = await MenuItem.findOneAndUpdate(
    { _id: id, restaurantId: restaurant._id },
    { availability },
    { new: true, runValidators: true }
  );

  if (!menuItem) {
    return notFoundResponse(res, 'Menu item not found');
  }

  successResponse(res, { menuItem }, 'Menu item availability updated successfully');
});

/**
 * @desc    Get menu item categories for partner's restaurant
 * @route   GET /api/v1/partner/restaurants/:restaurantId/menu-items/categories
 * @access  Private (Partner)
 */
const getPartnerMenuCategories = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;

  // Verify restaurant ownership
  const restaurant = await findRestaurantById(restaurantId, req.user._id);
  
  if (!restaurant) {
    return notFoundResponse(res, 'Restaurant not found or access denied');
  }

  const categories = await MenuItem.distinct('category', {
    restaurantId: restaurant._id,
    status: { $ne: 'deleted' }
  });

  successResponse(res, { categories }, 'Menu categories retrieved successfully');
});

/**
 * @desc    Get single menu item for partner
 * @route   GET /api/v1/partner/restaurants/:restaurantId/menu-items/:id
 * @access  Private (Partner)
 */
const getPartnerMenuItem = asyncHandler(async (req, res) => {
  const { restaurantId, id } = req.params;

  // Verify restaurant ownership
  const restaurant = await findRestaurantById(restaurantId, req.user._id);
  
  if (!restaurant) {
    return notFoundResponse(res, 'Restaurant not found or access denied');
  }

  const menuItem = await MenuItem.findOne({
    _id: id,
    restaurantId: restaurant._id
  }).populate('restaurantId', 'name cuisine');

  if (!menuItem) {
    return notFoundResponse(res, 'Menu item not found');
  }

  successResponse(res, { menuItem }, 'Menu item retrieved successfully');
});

module.exports = {
  getPartnerMenuItems,
  createPartnerMenuItem,
  updatePartnerMenuItem,
  deletePartnerMenuItem,
  togglePartnerMenuItemStatus,
  updatePartnerMenuItemAvailability,
  getPartnerMenuCategories,
  getPartnerMenuItem
};
