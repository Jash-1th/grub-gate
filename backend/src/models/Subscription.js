// FILE: src/models/Subscription.js
const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Customer ID is required']
  },
  planId: {
    type: String,
    required: [true, 'Plan ID is required'],
    enum: ['bi-weekly', 'monthly', 'quarterly']
  },
  planName: {
    type: String,
    required: [true, 'Plan name is required'],
    trim: true
  },
  duration: {
    type: String,
    required: [true, 'Duration is required'],
    trim: true
  },
  deliveryFrequency: {
    type: String,
    required: [true, 'Delivery frequency is required'],
    trim: true
  },
  monthlyPrice: {
    type: Number,
    required: [true, 'Monthly price is required'],
    min: [0, 'Monthly price cannot be negative']
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'paused', 'expired'],
    default: 'active'
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date
  },
  nextBillingDate: {
    type: Date,
    required: [true, 'Next billing date is required']
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'digital-wallet'],
    default: 'card'
  },
  stripeSubscriptionId: {
    type: String,
    trim: true
  },
  stripeCustomerId: {
    type: String,
    trim: true
  },
  features: [{
    type: String,
    trim: true
  }],
  billingHistory: [{
    date: {
      type: Date,
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: [0, 'Amount cannot be negative']
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      required: true
    },
    stripeInvoiceId: String,
    description: String
  }],
  cancelReason: {
    type: String,
    trim: true
  },
  cancelledAt: Date,
  pausedAt: Date,
  resumedAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for is active
subscriptionSchema.virtual('isActive').get(function() {
  return this.status === 'active' && (!this.endDate || this.endDate > new Date());
});

// Virtual for days until next billing
subscriptionSchema.virtual('daysUntilNextBilling').get(function() {
  if (!this.nextBillingDate) return null;
  const now = new Date();
  const diffTime = this.nextBillingDate - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for total paid amount
subscriptionSchema.virtual('totalPaidAmount').get(function() {
  return this.billingHistory
    .filter(bill => bill.status === 'paid')
    .reduce((total, bill) => total + bill.amount, 0);
});

// Virtual for subscription age in days
subscriptionSchema.virtual('subscriptionAge').get(function() {
  const now = new Date();
  const diffTime = now - this.startDate;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
});

// Indexes for performance
subscriptionSchema.index({ customerId: 1, status: 1 });
subscriptionSchema.index({ status: 1, nextBillingDate: 1 });
subscriptionSchema.index({ stripeSubscriptionId: 1 });
subscriptionSchema.index({ planId: 1, status: 1 });

// Pre-save middleware to set end date for non-recurring plans
subscriptionSchema.pre('save', function(next) {
  if (this.isNew && !this.endDate) {
    const durationMap = {
      'bi-weekly': 14,
      'monthly': 30,
      'quarterly': 90
    };
    
    if (durationMap[this.planId]) {
      this.endDate = new Date(this.startDate);
      this.endDate.setDate(this.endDate.getDate() + durationMap[this.planId]);
    }
  }
  next();
});

// Pre-save middleware to validate dates
subscriptionSchema.pre('save', function(next) {
  if (this.endDate && this.startDate >= this.endDate) {
    return next(new Error('End date must be after start date'));
  }
  
  if (this.nextBillingDate && this.nextBillingDate <= this.startDate) {
    return next(new Error('Next billing date must be after start date'));
  }
  
  next();
});

// Instance method to cancel subscription
subscriptionSchema.methods.cancel = function(reason = 'Cancelled by customer') {
  if (this.status === 'cancelled') {
    throw new Error('Subscription is already cancelled');
  }
  
  this.status = 'cancelled';
  this.cancelReason = reason;
  this.cancelledAt = new Date();
  
  return this.save();
};

// Instance method to pause subscription
subscriptionSchema.methods.pause = function() {
  if (this.status !== 'active') {
    throw new Error('Only active subscriptions can be paused');
  }
  
  this.status = 'paused';
  this.pausedAt = new Date();
  
  return this.save();
};

// Instance method to resume subscription
subscriptionSchema.methods.resume = function() {
  if (this.status !== 'paused') {
    throw new Error('Only paused subscriptions can be resumed');
  }
  
  this.status = 'active';
  this.resumedAt = new Date();
  
  // Adjust next billing date based on pause duration
  if (this.pausedAt) {
    const pauseDuration = Date.now() - this.pausedAt.getTime();
    this.nextBillingDate = new Date(this.nextBillingDate.getTime() + pauseDuration);
  }
  
  return this.save();
};

// Instance method to add billing record
subscriptionSchema.methods.addBillingRecord = function(amount, status, stripeInvoiceId = null, description = '') {
  this.billingHistory.push({
    date: new Date(),
    amount,
    status,
    stripeInvoiceId,
    description
  });
  
  // Update next billing date if payment successful
  if (status === 'paid') {
    const billingCycleMap = {
      'bi-weekly': 14,
      'monthly': 30,
      'quarterly': 90
    };
    
    const cycleDays = billingCycleMap[this.planId] || 30;
    this.nextBillingDate = new Date(this.nextBillingDate);
    this.nextBillingDate.setDate(this.nextBillingDate.getDate() + cycleDays);
  }
  
  return this.save();
};

// Instance method to upgrade plan
subscriptionSchema.methods.upgradePlan = function(newPlanId, newPlanName, newMonthlyPrice, newFeatures) {
  this.planId = newPlanId;
  this.planName = newPlanName;
  this.monthlyPrice = newMonthlyPrice;
  this.features = newFeatures;
  
  return this.save();
};

// Instance method to check if feature is available
subscriptionSchema.methods.hasFeature = function(featureName) {
  return this.features.includes(featureName);
};

// Static method to get active subscriptions
subscriptionSchema.statics.getActive = function() {
  return this.find({
    status: 'active',
    $or: [
      { endDate: { $exists: false } },
      { endDate: { $gt: new Date() } }
    ]
  });
};

// Static method to get subscriptions due for billing
subscriptionSchema.statics.getDueForBilling = function(date = new Date()) {
  return this.find({
    status: 'active',
    nextBillingDate: { $lte: date }
  });
};

// Static method to get expiring subscriptions
subscriptionSchema.statics.getExpiring = function(days = 7) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    status: 'active',
    endDate: {
      $gte: new Date(),
      $lte: futureDate
    }
  });
};

// Static method to get subscription analytics
subscriptionSchema.statics.getAnalytics = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$planId',
        count: { $sum: 1 },
        totalRevenue: { $sum: '$monthlyPrice' },
        averagePrice: { $avg: '$monthlyPrice' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

// Static method to get customer lifetime value
subscriptionSchema.statics.getCustomerLifetimeValue = function(customerId) {
  return this.aggregate([
    {
      $match: { customerId: mongoose.Types.ObjectId(customerId) }
    },
    {
      $unwind: '$billingHistory'
    },
    {
      $match: { 'billingHistory.status': 'paid' }
    },
    {
      $group: {
        _id: '$customerId',
        totalValue: { $sum: '$billingHistory.amount' },
        subscriptionCount: { $addToSet: '$_id' },
        averageMonthlySpend: { $avg: '$monthlyPrice' }
      }
    },
    {
      $project: {
        totalValue: 1,
        subscriptionCount: { $size: '$subscriptionCount' },
        averageMonthlySpend: 1
      }
    }
  ]);
};

module.exports = mongoose.model('Subscription', subscriptionSchema);
