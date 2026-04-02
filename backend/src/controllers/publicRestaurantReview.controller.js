const vader = require('vader-sentiment');
const PublicRestaurantReview = require('../models/PublicRestaurantReview');
const Restaurant = require('../models/Restaurant');
const { successResponse, createdResponse, errorResponse } = require('../utils/apiResponse');
const { asyncHandler } = require('../middlewares/errorHandler');

const getPositiveRestaurantReviews = asyncHandler(async (req, res) => {
  const { id: restaurantId } = req.params;

  const reviews = await PublicRestaurantReview.find({ restaurantId })
    .sort({ createdAt: -1 })
    .limit(200);

  const positive = reviews
    .map((r) => {
      const scores = vader.SentimentIntensityAnalyzer.polarity_scores(r.comment || '');
      return {
        review: r,
        sentiment: scores
      };
    })
    .filter((x) => (x.sentiment?.compound ?? 0) > 0.05)
    .map((x) => ({
      _id: x.review._id,
      restaurantId: x.review.restaurantId,
      rating: x.review.rating,
      comment: x.review.comment,
      createdAt: x.review.createdAt,
      sentiment: x.sentiment
    }));

  successResponse(res, { reviews: positive }, 'Positive reviews retrieved successfully');
});

const createPublicRestaurantReview = asyncHandler(async (req, res) => {
  const { id: restaurantId } = req.params;
  const { rating, comment } = req.body;

  const parsedRating = Number(rating);
  if (!Number.isFinite(parsedRating) || parsedRating < 1 || parsedRating > 5) {
    return errorResponse(res, 'Rating must be between 1 and 5', 400);
  }

  if (!comment || typeof comment !== 'string' || comment.trim().length === 0) {
    return errorResponse(res, 'Comment is required', 400);
  }

  const created = await PublicRestaurantReview.create({
    restaurantId,
    rating: parsedRating,
    comment: comment.trim()
  });

  const restaurant = await Restaurant.findById(restaurantId);
  if (restaurant) {
    await restaurant.updateRating();
  }

  createdResponse(res, { review: created }, 'Review submitted successfully');
});

module.exports = {
  getPositiveRestaurantReviews,
  createPublicRestaurantReview
};
