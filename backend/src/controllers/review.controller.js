// FILE: src/controllers/review.controller.js
const Review = require('../models/Review');
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const mongoose = require('mongoose');
const { 
  successResponse, 
  errorResponse,
  createdResponse,
  notFoundResponse,
  paginatedResponse
} = require('../utils/apiResponse');
const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * @desc    Get reviews with filters
 * @route   GET /api/v1/reviews
 * @access  Public
 */
const getReviews = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    restaurantId,
    menuItemId,
    rating,
    status = 'approved',
    sortBy = 'createdAt',
    sortOrder = 'desc',
    search
  } = req.query;

  // Build query
  const query = {};
  
  if (status && status !== 'all') {
    query.status = status;
  }

  if (restaurantId) {
    query.restaurantId = restaurantId;
  }

  if (menuItemId) {
    query.menuItemId = menuItemId;
  }

  if (rating) {
    query.rating = parseInt(rating);
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
  const reviews = await Review.find(query, search ? { score: { $meta: 'textScore' } } : {})
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit))
    .populate('customerId', 'firstName lastName')
    .populate('restaurantId', 'name cuisine')
    .populate('menuItemId', 'name category');

  const total = await Review.countDocuments(query);

  const pagination = {
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(total / parseInt(limit)),
    totalItems: total
  };

  paginatedResponse(res, reviews, pagination, 'Reviews retrieved successfully');
});

/**
 * @desc    Get single review
 * @route   GET /api/v1/reviews/:id
 * @access  Public
 */
const getReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id)
    .populate('customerId', 'firstName lastName')
    .populate('restaurantId', 'name cuisine')
    .populate('menuItemId', 'name category')
    .populate('orderId', 'orderNumber total');

  if (!review) {
    return notFoundResponse(res, 'Review not found');
  }

  successResponse(res, { review }, 'Review retrieved successfully');
});

/**
 * @desc    Create review
 * @route   POST /api/v1/reviews
 * @access  Private (Customer)
 */
const createReview = asyncHandler(async (req, res) => {
  const { 
    orderId, 
    restaurantId, 
    menuItemId, 
    rating, 
    title, 
    comment, 
    images 
  } = req.body;

  // Verify the order exists and belongs to the customer
  const order = await Order.findOne({
    _id: orderId,
    customerId: req.user._id,
    status: 'delivered'
  });

  if (!order) {
    return notFoundResponse(res, 'Order not found or not delivered');
  }

  // Verify restaurant matches the order
  if (order.restaurantId.toString() !== restaurantId) {
    return errorResponse(res, 'Restaurant does not match the order', 400);
  }

  // If reviewing a specific menu item, verify it was in the order
  if (menuItemId) {
    const itemInOrder = order.items.some(item => 
      item.menuItemId.toString() === menuItemId
    );
    
    if (!itemInOrder) {
      return errorResponse(res, 'Menu item was not part of this order', 400);
    }
  }

  const review = await Review.create({
    customerId: req.user._id,
    restaurantId,
    menuItemId,
    orderId,
    rating,
    title,
    comment,
    images: images || [],
    status: 'approved' // Auto-approve reviews for immediate rating calculation
  });
  
  console.log('📝 ReviewController.createReview: Created review with status', review.status, 'for menu item', review.menuItemId);

  // Populate for response
  await review.populate([
    { path: 'customerId', select: 'firstName lastName' },
    { path: 'restaurantId', select: 'name cuisine' },
    { path: 'menuItemId', select: 'name category price' }
  ]);

  createdResponse(res, { review }, 'Review created successfully');
});

/**
 * @desc    Update review
 * @route   PATCH /api/v1/reviews/:id
 * @access  Private (Customer)
 */
const updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findOne({
    _id: req.params.id,
    customerId: req.user._id
  });

  if (!review) {
    return notFoundResponse(res, 'Review not found');
  }

  // Only allow updating if review is pending or approved
  if (review.status === 'rejected') {
    return errorResponse(res, 'Cannot update rejected review', 400);
  }

  // Update allowed fields
  const allowedFields = ['rating', 'title', 'comment', 'images'];
  const updates = {};
  
  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) {
      updates[key] = req.body[key];
    }
  });

  Object.assign(review, updates);
  
  // Reset status to pending if it was approved
  if (review.status === 'approved') {
    review.status = 'pending';
  }

  await review.save();

  successResponse(res, { review }, 'Review updated successfully');
});

/**
 * @desc    Delete review
 * @route   DELETE /api/v1/reviews/:id
 * @access  Private (Customer)
 */
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findOne({
    _id: req.params.id,
    customerId: req.user._id
  });

  if (!review) {
    return notFoundResponse(res, 'Review not found');
  }

  await review.deleteOne();

  successResponse(res, null, 'Review deleted successfully');
});

/**
 * @desc    Mark review as helpful
 * @route   POST /api/v1/reviews/:id/helpful
 * @access  Private (Customer)
 */
const markHelpful = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return notFoundResponse(res, 'Review not found');
  }

  if (review.status !== 'approved') {
    return errorResponse(res, 'Can only mark approved reviews as helpful', 400);
  }

  await review.addHelpfulVote();

  successResponse(res, { review }, 'Review marked as helpful');
});

/**
 * @desc    Report review
 * @route   POST /api/v1/reviews/:id/report
 * @access  Private (Customer)
 */
const reportReview = asyncHandler(async (req, res) => {
  const { reason, description } = req.body;

  const review = await Review.findById(req.params.id);

  if (!review) {
    return notFoundResponse(res, 'Review not found');
  }

  // Check if user already reported this review
  const existingReport = review.reportReasons.find(
    report => report.reportedBy.toString() === req.user._id.toString()
  );

  if (existingReport) {
    return errorResponse(res, 'You have already reported this review', 400);
  }

  await review.reportReview(req.user._id, reason, description);

  successResponse(res, null, 'Review reported successfully');
});

/**
 * @desc    Get reviews for restaurant
 * @route   GET /api/v1/restaurants/:restaurantId/reviews
 * @access  Public
 */
const getRestaurantReviews = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;
  const {
    page = 1,
    limit = 20,
    rating,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  const options = {
    status: 'approved',
    limit: parseInt(limit),
    skip: (parseInt(page) - 1) * parseInt(limit),
    sortBy,
    sortOrder: sortOrder === 'desc' ? -1 : 1,
    rating: rating ? parseInt(rating) : null
  };

  const reviews = await Review.getForRestaurant(restaurantId, options);
  const total = await Review.countDocuments({ 
    restaurantId, 
    status: 'approved',
    ...(rating && { rating: parseInt(rating) })
  });

  const pagination = {
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(total / parseInt(limit)),
    totalItems: total
  };

  paginatedResponse(res, reviews, pagination, 'Restaurant reviews retrieved successfully');
});

/**
 * @desc    Get reviews for menu item
 * @route   GET /api/v1/menu-items/:menuItemId/reviews
 * @access  Public
 */
const getMenuItemReviews = asyncHandler(async (req, res) => {
  const { menuItemId } = req.params;
  const {
    page = 1,
    limit = 20
  } = req.query;

  const options = {
    status: 'approved',
    limit: parseInt(limit),
    skip: (parseInt(page) - 1) * parseInt(limit)
  };

  const reviews = await Review.getForMenuItem(menuItemId, options);
  const total = await Review.countDocuments({ 
    menuItemId, 
    status: 'approved'
  });

  const pagination = {
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(total / parseInt(limit)),
    totalItems: total
  };

  paginatedResponse(res, reviews, pagination, 'Menu item reviews retrieved successfully');
});

/**
 * @desc    Get review statistics
 * @route   GET /api/v1/reviews/stats
 * @access  Public
 */
const getReviewStats = asyncHandler(async (req, res) => {
  const { restaurantId, menuItemId } = req.query;

  if (!restaurantId && !menuItemId) {
    return errorResponse(res, 'Either restaurantId or menuItemId is required', 400);
  }

  const stats = await Review.getStats(restaurantId, menuItemId);

  successResponse(res, { 
    stats: stats[0] || {} 
  }, 'Review statistics retrieved successfully');
});

/**
 * @desc    Get trending reviews
 * @route   GET /api/v1/reviews/trending
 * @access  Public
 */
const getTrendingReviews = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const reviews = await Review.getTrending(parseInt(limit));

  successResponse(res, { reviews }, 'Trending reviews retrieved successfully');
});

/**
 * @desc    Approve review (Admin/Moderator)
 * @route   POST /api/v1/reviews/:id/approve
 * @access  Private (Admin)
 */
const approveReview = asyncHandler(async (req, res) => {
  const { notes } = req.body;

  const review = await Review.findById(req.params.id);

  if (!review) {
    return notFoundResponse(res, 'Review not found');
  }

  await review.approve(req.user._id, notes);

  successResponse(res, { review }, 'Review approved successfully');
});

/**
 * @desc    Reject review (Admin/Moderator)
 * @route   POST /api/v1/reviews/:id/reject
 * @access  Private (Admin)
 */
const rejectReview = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const review = await Review.findById(req.params.id);

  if (!review) {
    return notFoundResponse(res, 'Review not found');
  }

  await review.reject(req.user._id, reason);

  successResponse(res, { review }, 'Review rejected successfully');
});

/**
 * @desc    Check if order has been reviewed
 * @route   GET /api/v1/reviews/check/:orderId
 * @access  Private (Customer)
 */
const checkOrderReview = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  
  // Validate order ID
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return errorResponse(res, 'Invalid order ID', 400);
  }

  // Check if review exists for this order and customer
  const review = await Review.findOne({
    orderId,
    customerId: req.user._id
  }).select('status createdAt rating');

  if (review) {
    successResponse(res, { 
      hasReview: true, 
      reviewStatus: review.status,
      reviewedAt: review.createdAt,
      rating: review.rating
    }, 'Order has been reviewed');
  } else {
    successResponse(res, { hasReview: false }, 'Order has not been reviewed');
  }
});

module.exports = {
  getReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  markHelpful,
  reportReview,
  getRestaurantReviews,
  getMenuItemReviews,
  getReviewStats,
  getTrendingReviews,
  approveReview,
  rejectReview,
  checkOrderReview
};
