// FILE: src/models/Review.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Customer ID is required']
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: [true, 'Restaurant ID is required']
  },
  menuItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem'
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: [true, 'Order ID is required']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5']
  },
  title: {
    type: String,
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  comment: {
    type: String,
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  images: [{
    type: String,
    trim: true
  }],
  isVerifiedPurchase: {
    type: Boolean,
    default: true
  },
  helpfulVotes: {
    type: Number,
    default: 0,
    min: [0, 'Helpful votes cannot be negative']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  moderatorNotes: {
    type: String,
    trim: true
  },
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  moderatedAt: Date,
  reportCount: {
    type: Number,
    default: 0,
    min: [0, 'Report count cannot be negative']
  },
  reportReasons: [{
    reason: {
      type: String,
      enum: ['inappropriate', 'spam', 'fake', 'offensive', 'other']
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reportedAt: {
      type: Date,
      default: Date.now
    },
    description: String
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for customer name (populated)
reviewSchema.virtual('customerName').get(function() {
  return this.customerId && this.customerId.fullName ? this.customerId.fullName : 'Anonymous';
});

// Virtual for is recent (within last 30 days)
reviewSchema.virtual('isRecent').get(function() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return this.createdAt > thirtyDaysAgo;
});

// Virtual for helpful ratio
reviewSchema.virtual('helpfulRatio').get(function() {
  const totalVotes = this.helpfulVotes + (this.unhelpfulVotes || 0);
  return totalVotes > 0 ? (this.helpfulVotes / totalVotes) * 100 : 0;
});

// Virtual for review age in days
reviewSchema.virtual('ageInDays').get(function() {
  const now = new Date();
  const diffTime = now - this.createdAt;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
});

// Indexes for performance
reviewSchema.index({ restaurantId: 1, status: 1 });
reviewSchema.index({ menuItemId: 1, status: 1 });
reviewSchema.index({ customerId: 1 });
reviewSchema.index({ orderId: 1 });
reviewSchema.index({ rating: 1, status: 1 });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ helpfulVotes: -1 });

// Compound indexes
reviewSchema.index({ restaurantId: 1, rating: -1, createdAt: -1 });
reviewSchema.index({ status: 1, createdAt: -1 });

// Text index for search
reviewSchema.index({
  title: 'text',
  comment: 'text'
});

// Pre-save middleware to verify purchase
reviewSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const Order = mongoose.model('Order');
      const order = await Order.findOne({
        _id: this.orderId,
        customerId: this.customerId,
        restaurantId: this.restaurantId,
        status: 'delivered'
      });
      
      if (!order) {
        return next(new Error('Review can only be created for delivered orders'));
      }
      
      // If menuItemId is provided, verify it was in the order
      if (this.menuItemId) {
        const itemInOrder = order.items.some(item => 
          item.menuItemId.toString() === this.menuItemId.toString()
        );
        
        if (!itemInOrder) {
          return next(new Error('Menu item was not part of this order'));
        }
      }
      
      this.isVerifiedPurchase = true;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Pre-save middleware to prevent duplicate reviews
reviewSchema.pre('save', async function(next) {
  if (this.isNew) {
    const query = {
      customerId: this.customerId,
      orderId: this.orderId
    };
    
    // If reviewing specific menu item, check for duplicate item review
    if (this.menuItemId) {
      query.menuItemId = this.menuItemId;
    } else {
      // If reviewing restaurant, check for duplicate restaurant review for this order
      query.restaurantId = this.restaurantId;
      query.menuItemId = { $exists: false };
    }
    
    const existingReview = await this.constructor.findOne(query);
    if (existingReview) {
      return next(new Error('Review already exists for this order'));
    }
  }
  next();
});

// Post-save middleware to update restaurant/menu item ratings
reviewSchema.post('save', async function() {
  console.log('🔄 Review.postSave: Review saved with status', this.status, 'for menu item', this.menuItemId);
  if (this.status === 'approved') {
    try {
      console.log('⚙️ Review.postSave: Updating ratings for approved review');
      // Update restaurant rating
      const Restaurant = mongoose.model('Restaurant');
      const restaurant = await Restaurant.findById(this.restaurantId);
      if (restaurant) {
        console.log('🏪 Review.postSave: Updating restaurant rating', restaurant._id);
        await restaurant.updateRating();
      }
      
      // Update menu item rating if applicable
      if (this.menuItemId) {
        const MenuItem = mongoose.model('MenuItem');
        const menuItem = await MenuItem.findById(this.menuItemId);
        if (menuItem) {
          console.log('🍽️ Review.postSave: Updating menu item rating', menuItem._id);
          await menuItem.updateRating();
        }
      }
    } catch (error) {
      console.error('💥 Review.postSave: Error updating ratings after review save:', error);
    }
  } else {
    console.log('⏭️ Review.postSave: Skipping rating update - review not approved');
  }
});

// Instance method to approve review
reviewSchema.methods.approve = function(moderatorId, notes = '') {
  this.status = 'approved';
  this.moderatedBy = moderatorId;
  this.moderatedAt = new Date();
  this.moderatorNotes = notes;
  
  return this.save();
};

// Instance method to reject review
reviewSchema.methods.reject = function(moderatorId, reason) {
  this.status = 'rejected';
  this.moderatedBy = moderatorId;
  this.moderatedAt = new Date();
  this.moderatorNotes = reason;
  
  return this.save();
};

// Instance method to add helpful vote
reviewSchema.methods.addHelpfulVote = function() {
  this.helpfulVotes += 1;
  return this.save();
};

// Instance method to report review
reviewSchema.methods.reportReview = function(reportedBy, reason, description = '') {
  this.reportReasons.push({
    reason,
    reportedBy,
    description
  });
  this.reportCount += 1;
  
  // Auto-moderate if too many reports
  if (this.reportCount >= 5 && this.status === 'approved') {
    this.status = 'pending';
  }
  
  return this.save();
};

// Instance method to check if user can review
reviewSchema.methods.canUserReview = async function(customerId, orderId) {
  const Order = mongoose.model('Order');
  const order = await Order.findOne({
    _id: orderId,
    customerId: customerId,
    status: 'delivered'
  });
  
  return !!order;
};

// Static method to get reviews for restaurant
reviewSchema.statics.getForRestaurant = function(restaurantId, options = {}) {
  const {
    status = 'approved',
    limit = 20,
    skip = 0,
    sortBy = 'createdAt',
    sortOrder = -1,
    rating = null
  } = options;
  
  const query = { restaurantId, status };
  if (rating) {
    query.rating = rating;
  }
  
  return this.find(query)
    .populate('customerId', 'firstName lastName')
    .sort({ [sortBy]: sortOrder })
    .limit(limit)
    .skip(skip);
};

// Static method to get reviews for menu item
reviewSchema.statics.getForMenuItem = function(menuItemId, options = {}) {
  const {
    status = 'approved',
    limit = 20,
    skip = 0
  } = options;
  
  return this.find({ menuItemId, status })
    .populate('customerId', 'firstName lastName')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

// Static method to get review statistics
reviewSchema.statics.getStats = function(restaurantId, menuItemId = null) {
  const matchQuery = { status: 'approved' };
  
  if (menuItemId) {
    matchQuery.menuItemId = mongoose.Types.ObjectId(menuItemId);
  } else {
    matchQuery.restaurantId = mongoose.Types.ObjectId(restaurantId);
  }
  
  return this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    },
    {
      $project: {
        averageRating: { $round: ['$averageRating', 1] },
        totalReviews: 1,
        ratingDistribution: {
          $reduce: {
            input: [1, 2, 3, 4, 5],
            initialValue: {},
            in: {
              $mergeObjects: [
                '$$value',
                {
                  $arrayToObject: [[
                    { k: { $toString: '$$this' }, v: {
                      $size: {
                        $filter: {
                          input: '$ratingDistribution',
                          cond: { $eq: ['$$item', '$$this'] }
                        }
                      }
                    }}
                  ]]
                }
              ]
            }
          }
        }
      }
    }
  ]);
};

// Static method to get trending reviews (most helpful recent reviews)
reviewSchema.statics.getTrending = function(limit = 10) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  return this.find({
    status: 'approved',
    createdAt: { $gte: thirtyDaysAgo }
  })
    .populate('customerId', 'firstName lastName')
    .populate('restaurantId', 'name')
    .sort({ helpfulVotes: -1, createdAt: -1 })
    .limit(limit);
};

// Static method to search reviews
reviewSchema.statics.searchReviews = function(searchTerm, options = {}) {
  const {
    restaurantId = null,
    rating = null,
    limit = 20,
    skip = 0
  } = options;
  
  const query = {
    status: 'approved',
    $text: { $search: searchTerm }
  };
  
  if (restaurantId) {
    query.restaurantId = restaurantId;
  }
  
  if (rating) {
    query.rating = rating;
  }
  
  return this.find(query, { score: { $meta: 'textScore' } })
    .populate('customerId', 'firstName lastName')
    .sort({ score: { $meta: 'textScore' }, createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

module.exports = mongoose.model('Review', reviewSchema);
