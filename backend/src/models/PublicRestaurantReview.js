const mongoose = require('mongoose');

const publicRestaurantReviewSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000
    }
  },
  {
    timestamps: true
  }
);

publicRestaurantReviewSchema.index({ restaurantId: 1, createdAt: -1 });

module.exports = mongoose.model('PublicRestaurantReview', publicRestaurantReviewSchema);
