const mongoose = require('mongoose');

const mealEntrySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    index: true
  },
  mealType: {
    type: String,
    required: true,
    enum: ['breakfast', 'lunch', 'dinner'],
    index: true
  },
  mealName: {
    type: String,
    required: true,
    trim: true
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'preparing', 'ready', 'delivered', 'cancelled'],
    default: 'scheduled',
    index: true
  },
  deliveryTime: {
    start: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:MM format
    },
    end: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:MM format
    }
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    index: true
  }
}, {
  _id: true,
  timestamps: true
});

const userMealCalendarSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  subscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubscriptionMealPlan',
    required: true,
    index: true
  },
  weeklyPlanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MealPlan',
    required: false, // Make it optional since it might not always exist
    index: true
  },
  calendarEntries: [mealEntrySchema],
  subscriptionPeriod: {
    startDate: {
      type: Date,
      required: true,
      index: true
    },
    endDate: {
      type: Date,
      required: true,
      index: true
    },
    planType: {
      type: String,
      required: true,
      enum: ['bi-weekly', 'monthly', '3-months'],
      index: true
    }
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  totalMeals: {
    type: Number,
    default: 0
  },
  deliveredMeals: {
    type: Number,
    default: 0
  },
  metadata: {
    totalCost: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'USD'
    },
    timezone: {
      type: String,
      default: 'UTC'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
userMealCalendarSchema.index({ userId: 1, isActive: 1 });
userMealCalendarSchema.index({ userId: 1, 'subscriptionPeriod.startDate': 1, 'subscriptionPeriod.endDate': 1 });
userMealCalendarSchema.index({ 'calendarEntries.date': 1, 'calendarEntries.status': 1 });

// Virtual for progress percentage
userMealCalendarSchema.virtual('progressPercentage').get(function() {
  if (this.totalMeals === 0) return 0;
  return Math.round((this.deliveredMeals / this.totalMeals) * 100);
});

// Virtual for remaining days
userMealCalendarSchema.virtual('remainingDays').get(function() {
  const now = new Date();
  const endDate = new Date(this.subscriptionPeriod.endDate);
  const diffTime = endDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
});

// Static method to find active subscription for user
userMealCalendarSchema.statics.findActiveSubscription = function(userId) {
  const now = new Date();
  return this.findOne({
    userId,
    isActive: true,
    // Include future subscriptions (starts within next 30 days) and current active ones
    $or: [
      // Current active subscriptions
      {
        'subscriptionPeriod.startDate': { $lte: now },
        'subscriptionPeriod.endDate': { $gte: now }
      },
      // Future subscriptions starting within 30 days
      {
        'subscriptionPeriod.startDate': { 
          $gte: now,
          $lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
        }
      }
    ]
  }).populate('weeklyPlanId subscriptionId');
};

// Static method to check subscription overlap
userMealCalendarSchema.statics.checkSubscriptionOverlap = function(userId, startDate, endDate) {
  return this.findOne({
    userId,
    isActive: true,
    $or: [
      {
        'subscriptionPeriod.startDate': { $lte: startDate },
        'subscriptionPeriod.endDate': { $gte: startDate }
      },
      {
        'subscriptionPeriod.startDate': { $lte: endDate },
        'subscriptionPeriod.endDate': { $gte: endDate }
      },
      {
        'subscriptionPeriod.startDate': { $gte: startDate },
        'subscriptionPeriod.endDate': { $lte: endDate }
      }
    ]
  });
};

// Instance method to get meals for date range
userMealCalendarSchema.methods.getMealsForDateRange = function(startDate, endDate) {
  return this.calendarEntries.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate >= startDate && entryDate <= endDate;
  }).sort((a, b) => new Date(a.date) - new Date(b.date));
};

// Instance method to update meal status
userMealCalendarSchema.methods.updateMealStatus = function(mealId, newStatus) {
  const meal = this.calendarEntries.id(mealId);
  if (meal) {
    const oldStatus = meal.status;
    meal.status = newStatus;
    
    // Update delivered count
    if (oldStatus !== 'delivered' && newStatus === 'delivered') {
      this.deliveredMeals += 1;
    } else if (oldStatus === 'delivered' && newStatus !== 'delivered') {
      this.deliveredMeals = Math.max(0, this.deliveredMeals - 1);
    }
    
    return this.save();
  }
  return Promise.reject(new Error('Meal not found'));
};

// Pre-save middleware to calculate total meals
userMealCalendarSchema.pre('save', function(next) {
  if (this.isModified('calendarEntries')) {
    this.totalMeals = this.calendarEntries.length;
    this.deliveredMeals = this.calendarEntries.filter(entry => entry.status === 'delivered').length;
  }
  next();
});

// Pre-save middleware to validate date ranges
userMealCalendarSchema.pre('save', function(next) {
  if (this.subscriptionPeriod.startDate >= this.subscriptionPeriod.endDate) {
    return next(new Error('Subscription start date must be before end date'));
  }
  next();
});

const UserMealCalendar = mongoose.model('UserMealCalendar', userMealCalendarSchema);

module.exports = UserMealCalendar;
