// FILE: src/routes/review.routes.js
const express = require('express');
const {
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
  rejectReview
} = require('../controllers/review.controller');
const { authMiddleware, roleMiddleware, optionalAuthMiddleware } = require('../middlewares/auth');
const { reviewValidations, commonValidations, queryValidations } = require('../middlewares/validation');

const router = express.Router();

// Public routes
router.get('/', queryValidations.pagination, getReviews);
router.get('/trending', getTrendingReviews);
router.get('/stats', getReviewStats);
router.get('/:id', commonValidations.mongoId, getReview);

// Restaurant and menu item specific reviews
router.get('/restaurants/:restaurantId/reviews', commonValidations.mongoId, queryValidations.pagination, getRestaurantReviews);
router.get('/menu-items/:menuItemId/reviews', commonValidations.mongoId, queryValidations.pagination, getMenuItemReviews);

// Protected routes
router.use(authMiddleware);

// Customer review routes
router.post('/', roleMiddleware('customer'), reviewValidations.create, createReview);
router.patch('/:id', commonValidations.mongoId, roleMiddleware('customer'), updateReview);
router.delete('/:id', commonValidations.mongoId, roleMiddleware('customer'), deleteReview);

// Review interactions
router.post('/:id/helpful', commonValidations.mongoId, roleMiddleware('customer'), markHelpful);
router.post('/:id/report', commonValidations.mongoId, roleMiddleware('customer'), reportReview);

// Admin/Moderator routes
router.post('/:id/approve', commonValidations.mongoId, roleMiddleware('admin'), approveReview);
router.post('/:id/reject', commonValidations.mongoId, roleMiddleware('admin'), rejectReview);

module.exports = router;
