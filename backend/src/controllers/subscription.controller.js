// FILE: src/controllers/subscription.controller.js
const Subscription = require('../models/Subscription');
const { 
  successResponse, 
  errorResponse,
  createdResponse,
  notFoundResponse,
  paginatedResponse
} = require('../utils/apiResponse');
const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * @desc    Get available subscription plans
 * @route   GET /api/v1/subscriptions/plans
 * @access  Public
 */
const getSubscriptionPlans = asyncHandler(async (req, res) => {
  // Static subscription plans data
  const plans = [
    {
      id: 'bi-weekly',
      name: 'Bi-Weekly',
      duration: '2 weeks',
      deliveryFrequency: 'Every 2 weeks',
      monthlyPrice: 89.99,
      features: [
        'Flexible meal selection',
        'Basic customer support',
        'Standard delivery windows',
        'Cancel anytime'
      ],
      benefits: [
        'Perfect for trying out the service',
        'Lower commitment',
        'Ideal for occasional meal planning'
      ],
      popular: false
    },
    {
      id: 'monthly',
      name: 'Monthly',
      duration: '1 month',
      deliveryFrequency: 'Weekly deliveries',
      monthlyPrice: 149.99,
      features: [
        'All Bi-Weekly features',
        'Priority customer support',
        'Extended delivery windows',
        'Meal customization options'
      ],
      benefits: [
        'Great value for regular users',
        'Consistent meal planning',
        'Enhanced flexibility'
      ],
      popular: true
    },
    {
      id: 'quarterly',
      name: 'Quarterly',
      duration: '3 months',
      deliveryFrequency: 'Weekly deliveries',
      monthlyPrice: 129.99,
      features: [
        'All Monthly features',
        'Premium customer support',
        'Multiple restaurant selection',
        'Advanced meal planning tools'
      ],
      benefits: [
        'Best value for committed users',
        'Maximum flexibility',
        'Premium experience'
      ],
      popular: false
    },
    {
      id: 'semi-annual',
      name: 'Semi-Annual',
      duration: '6 months',
      deliveryFrequency: 'Weekly deliveries',
      monthlyPrice: 119.99,
      features: [
        'All Quarterly features',
        'VIP customer support',
        'Unlimited restaurant selection',
        'Early access to new features'
      ],
      benefits: [
        'Maximum savings',
        'VIP treatment',
        'Ultimate flexibility'
      ],
      popular: false
    }
  ];

  successResponse(res, { plans }, 'Subscription plans retrieved successfully');
});

/**
 * @desc    Get user subscriptions
 * @route   GET /api/v1/subscriptions
 * @access  Private (Customer)
 */
const getUserSubscriptions = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    status,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  // Build query
  const query = { customerId: req.user._id };
  
  if (status) {
    query.status = status;
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Execute query with pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const subscriptions = await Subscription.find(query)
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Subscription.countDocuments(query);

  const pagination = {
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(total / parseInt(limit)),
    totalItems: total
  };

  paginatedResponse(res, subscriptions, pagination, 'Subscriptions retrieved successfully');
});

/**
 * @desc    Get single subscription
 * @route   GET /api/v1/subscriptions/:id
 * @access  Private (Customer)
 */
const getSubscription = asyncHandler(async (req, res) => {
  const subscription = await Subscription.findOne({
    _id: req.params.id,
    customerId: req.user._id
  });

  if (!subscription) {
    return notFoundResponse(res, 'Subscription not found');
  }

  successResponse(res, { subscription }, 'Subscription retrieved successfully');
});

/**
 * @desc    Create subscription
 * @route   POST /api/v1/subscriptions
 * @access  Private (Customer)
 */
const createSubscription = asyncHandler(async (req, res) => {
  const { 
    planId, 
    planName, 
    duration, 
    deliveryFrequency, 
    monthlyPrice, 
    features,
    paymentMethod,
    stripeSubscriptionId,
    stripeCustomerId
  } = req.body;

  // Check if user already has an active subscription
  const existingSubscription = await Subscription.findOne({
    customerId: req.user._id,
    status: 'active'
  });

  if (existingSubscription) {
    return errorResponse(res, 'You already have an active subscription', 400);
  }

  // Calculate start and next billing dates
  const startDate = new Date();
  const nextBillingDate = new Date();
  
  // Set next billing date based on plan
  switch (planId) {
    case 'bi-weekly':
      nextBillingDate.setDate(nextBillingDate.getDate() + 14);
      break;
    case 'monthly':
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
      break;
    case 'quarterly':
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 3);
      break;
    case 'semi-annual':
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 6);
      break;
    default:
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
  }

  const subscription = await Subscription.create({
    customerId: req.user._id,
    planId,
    planName,
    duration,
    deliveryFrequency,
    monthlyPrice,
    startDate,
    nextBillingDate,
    paymentMethod,
    stripeSubscriptionId,
    stripeCustomerId,
    features: features || []
  });

  // Add initial billing record
  await subscription.addBillingRecord(
    monthlyPrice,
    'paid',
    null,
    'Initial subscription payment'
  );

  createdResponse(res, { subscription }, 'Subscription created successfully');
});

/**
 * @desc    Update subscription
 * @route   PATCH /api/v1/subscriptions/:id
 * @access  Private (Customer)
 */
const updateSubscription = asyncHandler(async (req, res) => {
  const subscription = await Subscription.findOne({
    _id: req.params.id,
    customerId: req.user._id
  });

  if (!subscription) {
    return notFoundResponse(res, 'Subscription not found');
  }

  // Only allow updating certain fields
  const allowedFields = ['paymentMethod'];
  const updates = {};
  
  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) {
      updates[key] = req.body[key];
    }
  });

  Object.assign(subscription, updates);
  await subscription.save();

  successResponse(res, { subscription }, 'Subscription updated successfully');
});

/**
 * @desc    Cancel subscription
 * @route   POST /api/v1/subscriptions/:id/cancel
 * @access  Private (Customer)
 */
const cancelSubscription = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const subscription = await Subscription.findOne({
    _id: req.params.id,
    customerId: req.user._id
  });

  if (!subscription) {
    return notFoundResponse(res, 'Subscription not found');
  }

  try {
    await subscription.cancel(reason);
    successResponse(res, { subscription }, 'Subscription cancelled successfully');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
});

/**
 * @desc    Pause subscription
 * @route   POST /api/v1/subscriptions/:id/pause
 * @access  Private (Customer)
 */
const pauseSubscription = asyncHandler(async (req, res) => {
  const subscription = await Subscription.findOne({
    _id: req.params.id,
    customerId: req.user._id
  });

  if (!subscription) {
    return notFoundResponse(res, 'Subscription not found');
  }

  try {
    await subscription.pause();
    successResponse(res, { subscription }, 'Subscription paused successfully');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
});

/**
 * @desc    Resume subscription
 * @route   POST /api/v1/subscriptions/:id/resume
 * @access  Private (Customer)
 */
const resumeSubscription = asyncHandler(async (req, res) => {
  const subscription = await Subscription.findOne({
    _id: req.params.id,
    customerId: req.user._id
  });

  if (!subscription) {
    return notFoundResponse(res, 'Subscription not found');
  }

  try {
    await subscription.resume();
    successResponse(res, { subscription }, 'Subscription resumed successfully');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
});

/**
 * @desc    Upgrade subscription plan
 * @route   POST /api/v1/subscriptions/:id/upgrade
 * @access  Private (Customer)
 */
const upgradeSubscription = asyncHandler(async (req, res) => {
  const { newPlanId, newPlanName, newMonthlyPrice, newFeatures } = req.body;

  const subscription = await Subscription.findOne({
    _id: req.params.id,
    customerId: req.user._id
  });

  if (!subscription) {
    return notFoundResponse(res, 'Subscription not found');
  }

  if (subscription.status !== 'active') {
    return errorResponse(res, 'Only active subscriptions can be upgraded', 400);
  }

  try {
    await subscription.upgradePlan(newPlanId, newPlanName, newMonthlyPrice, newFeatures);
    successResponse(res, { subscription }, 'Subscription upgraded successfully');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
});

/**
 * @desc    Get subscription analytics (Admin)
 * @route   GET /api/v1/subscriptions/analytics
 * @access  Private (Admin)
 */
const getSubscriptionAnalytics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  // Default to last 30 days if no dates provided
  const end = endDate ? new Date(endDate) : new Date();
  const start = startDate ? new Date(startDate) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

  const analytics = await Subscription.getAnalytics(start, end);

  // Get active subscriptions count
  const activeSubscriptions = await Subscription.countDocuments({ status: 'active' });

  // Get subscriptions due for billing
  const dueForBilling = await Subscription.getDueForBilling();

  // Get expiring subscriptions
  const expiringSubscriptions = await Subscription.getExpiring(7);

  successResponse(res, {
    analytics,
    activeSubscriptions,
    dueForBilling: dueForBilling.length,
    expiringSubscriptions: expiringSubscriptions.length
  }, 'Subscription analytics retrieved successfully');
});

/**
 * @desc    Get customer lifetime value
 * @route   GET /api/v1/subscriptions/customer-ltv/:customerId
 * @access  Private (Admin)
 */
const getCustomerLifetimeValue = asyncHandler(async (req, res) => {
  const { customerId } = req.params;

  const ltv = await Subscription.getCustomerLifetimeValue(customerId);

  successResponse(res, { 
    customerLifetimeValue: ltv[0] || {} 
  }, 'Customer lifetime value retrieved successfully');
});

module.exports = {
  getSubscriptionPlans,
  getUserSubscriptions,
  getSubscription,
  createSubscription,
  updateSubscription,
  cancelSubscription,
  pauseSubscription,
  resumeSubscription,
  upgradeSubscription,
  getSubscriptionAnalytics,
  getCustomerLifetimeValue
};
