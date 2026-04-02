const express = require('express');
const {
  getPositiveRestaurantReviews,
  createPublicRestaurantReview
} = require('../controllers/publicRestaurantReview.controller');
const { commonValidations, handleValidationErrors } = require('../middlewares/validation');

const router = express.Router();

router.get(
  '/:id/reviews/positive',
  commonValidations.mongoId,
  handleValidationErrors,
  getPositiveRestaurantReviews
);

router.post(
  '/:id/reviews',
  commonValidations.mongoId,
  handleValidationErrors,
  createPublicRestaurantReview
);

module.exports = router;
