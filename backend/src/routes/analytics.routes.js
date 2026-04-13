// FILE: src/routes/analytics.routes.js
const express = require('express');
const { authMiddleware, roleMiddleware, restaurantOwnershipMiddleware } = require('../middlewares/auth');
const { commonValidations } = require('../middlewares/validation');
const { successResponse } = require('../utils/apiResponse');
const { asyncHandler } = require('../middlewares/errorHandler');
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const User = require('../models/User');
const Review = require('../models/Review');

// Import new analytics controller
const analyticsController = require('../controllers/analytics.controller');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

/**
 * @desc    Get restaurant analytics
 * @route   GET /api/v1/analytics/restaurant/:restaurantId
 * @access  Private (Partner)
 */
const getRestaurantAnalytics = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;
  const { startDate, endDate } = req.query;

  // Default to last 30 days if no dates provided
  const end = endDate ? new Date(endDate) : new Date();
  const start = startDate ? new Date(startDate) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Get revenue stats
  const revenueStats = await Order.getRevenueStats(restaurantId, start, end);

  // Get popular items
  const popularItems = await Order.getPopularItems(restaurantId, 10);

  // Get review stats
  const reviewStats = await Review.getStats(restaurantId);

  // Get order trends
  const orderTrends = await Order.aggregate([
    {
      $match: {
        restaurantId: mongoose.Types.ObjectId(restaurantId),
        createdAt: { $gte: start, $lte: end },
        status: { $ne: 'cancelled' }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        orders: { $sum: 1 },
        revenue: { $sum: '$total' }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);

  successResponse(res, {
    revenueStats: revenueStats[0] || {},
    popularItems,
    reviewStats: reviewStats[0] || {},
    orderTrends
  }, 'Restaurant analytics retrieved successfully');
});

/**
 * @desc    Get dashboard analytics
 * @route   GET /api/v1/analytics/dashboard
 * @access  Private (Partner/Admin)
 */
const getDashboardAnalytics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  
  // Default to last 30 days
  const end = endDate ? new Date(endDate) : new Date();
  const start = startDate ? new Date(startDate) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

  let matchQuery = {
    createdAt: { $gte: start, $lte: end }
  };

  // Filter by partner's restaurants if not admin
  if (req.user.role === 'partner') {
    const restaurants = await Restaurant.find({ ownerId: req.user._id }).select('_id');
    const restaurantIds = restaurants.map(r => r._id);
    matchQuery.restaurantId = { $in: restaurantIds };
  }

  // Get order statistics
  const orderStats = await Order.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        // Calculate true payout: subtotal + tax + deliveryFee (excludes platform fees)
        totalRevenue: { 
          $sum: { 
            $add: [
              { $ifNull: ['$subtotal', 0] },
              { $ifNull: ['$tax', 0] },
              { $ifNull: ['$deliveryFee', 0] }
            ]
          }
        },
        averageOrderValue: { 
          $avg: { 
            $add: [
              { $ifNull: ['$subtotal', 0] },
              { $ifNull: ['$tax', 0] },
              { $ifNull: ['$deliveryFee', 0] }
            ]
          }
        },
        pendingOrders: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
        deliveredOrders: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } },
        cancelledOrders: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } }
      }
    }
  ]);

  // Get customer statistics (admin only)
  let customerStats = {};
  if (req.user.role === 'admin') {
    const customers = await User.aggregate([
      {
        $group: {
          _id: null,
          totalCustomers: { $sum: { $cond: [{ $eq: ['$role', 'customer'] }, 1, 0] } },
          activeCustomers: { 
            $sum: { 
              $cond: [
                { $and: [{ $eq: ['$role', 'customer'] }, { $eq: ['$status', 'active'] }] }, 
                1, 
                0
              ] 
            } 
          },
          newCustomers: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$role', 'customer'] },
                    { $gte: ['$createdAt', start] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);
    customerStats = customers[0] || {};
  }

  successResponse(res, {
    orderStats: orderStats[0] || {},
    customerStats
  }, 'Dashboard analytics retrieved successfully');
});

/**
 * @desc    Get customer analytics
 * @route   GET /api/v1/analytics/customers
 * @access  Private (Admin)
 */
const getCustomerAnalytics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  
  const end = endDate ? new Date(endDate) : new Date();
  const start = startDate ? new Date(startDate) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Customer registration trends
  const registrationTrends = await User.aggregate([
    {
      $match: {
        role: 'customer',
        createdAt: { $gte: start, $lte: end }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        newCustomers: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);

  // Customer activity
  const customerActivity = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end }
      }
    },
    {
      $group: {
        _id: '$customerId',
        orderCount: { $sum: 1 },
        totalSpent: { $sum: '$total' },
        lastOrder: { $max: '$createdAt' }
      }
    },
    {
      $group: {
        _id: null,
        activeCustomers: { $sum: 1 },
        averageOrdersPerCustomer: { $avg: '$orderCount' },
        averageSpentPerCustomer: { $avg: '$totalSpent' }
      }
    }
  ]);

  successResponse(res, {
    registrationTrends,
    customerActivity: customerActivity[0] || {}
  }, 'Customer analytics retrieved successfully');
});

/**
 * @desc    Get order analytics
 * @route   GET /api/v1/analytics/orders
 * @access  Private (Partner/Admin)
 */
const getOrderAnalytics = asyncHandler(async (req, res) => {
  const { startDate, endDate, restaurantId } = req.query;
  
  const end = endDate ? new Date(endDate) : new Date();
  const start = startDate ? new Date(startDate) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

  let matchQuery = {
    createdAt: { $gte: start, $lte: end }
  };

  // Add restaurant filter
  if (req.user.role === 'partner') {
    const restaurants = await Restaurant.find({ ownerId: req.user._id }).select('_id');
    const restaurantIds = restaurants.map(r => r._id);
    matchQuery.restaurantId = { $in: restaurantIds };
  } else if (restaurantId) {
    matchQuery.restaurantId = mongoose.Types.ObjectId(restaurantId);
  }

  // Order status distribution
  const statusDistribution = await Order.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalValue: { $sum: '$total' }
      }
    }
  ]);

  // Order type distribution
  const typeDistribution = await Order.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalValue: { $sum: '$total' }
      }
    }
  ]);

  // Hourly order patterns
  const hourlyPatterns = await Order.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: { $hour: '$createdAt' },
        orderCount: { $sum: 1 },
        revenue: { $sum: '$total' }
      }
    },
    { $sort: { '_id': 1 } }
  ]);

  successResponse(res, {
    statusDistribution,
    typeDistribution,
    hourlyPatterns
  }, 'Order analytics retrieved successfully');
});

/**
 * @desc    Get revenue analytics
 * @route   GET /api/v1/analytics/revenue
 * @access  Private (Partner/Admin)
 */
const getRevenueAnalytics = asyncHandler(async (req, res) => {
  const { startDate, endDate, restaurantId } = req.query;
  
  const end = endDate ? new Date(endDate) : new Date();
  const start = startDate ? new Date(startDate) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

  let matchQuery = {
    createdAt: { $gte: start, $lte: end },
    paymentStatus: 'paid'
  };

  // Add restaurant filter
  if (req.user.role === 'partner') {
    const restaurants = await Restaurant.find({ ownerId: req.user._id }).select('_id');
    const restaurantIds = restaurants.map(r => r._id);
    matchQuery.restaurantId = { $in: restaurantIds };
  } else if (restaurantId) {
    matchQuery.restaurantId = mongoose.Types.ObjectId(restaurantId);
  }

  // Daily revenue trends
  const dailyRevenue = await Order.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        revenue: { $sum: '$total' },
        orders: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);

  // Revenue breakdown
  const revenueBreakdown = await Order.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$total' },
        totalSubtotal: { $sum: '$subtotal' },
        totalDeliveryFees: { $sum: '$deliveryFee' },
        totalTax: { $sum: '$tax' },
        orderCount: { $sum: 1 }
      }
    }
  ]);

  successResponse(res, {
    dailyRevenue,
    revenueBreakdown: revenueBreakdown[0] || {}
  }, 'Revenue analytics retrieved successfully');
});

// Routes

// New analytics routes for partner dashboard
router.get('/overview', roleMiddleware('partner'), analyticsController.getOverviewAnalytics);
router.get('/revenue-trend', roleMiddleware('partner'), analyticsController.getRevenueTrend);
router.get('/top-items', roleMiddleware('partner'), analyticsController.getTopItems);
router.get('/order-status', roleMiddleware('partner'), analyticsController.getOrderStatusDistribution);

// Customer analytics routes
router.get('/customer-overview', roleMiddleware('partner'), analyticsController.getCustomerOverview);
router.get('/top-customers', roleMiddleware('partner'), analyticsController.getTopCustomers);
router.get('/customer-segments', roleMiddleware('partner'), analyticsController.getCustomerSegments);

// Performance analytics routes
router.get('/performance-overview', roleMiddleware('partner'), analyticsController.getPerformanceOverview);
router.get('/delivery-performance-trend', roleMiddleware('partner'), analyticsController.getDeliveryPerformanceTrend);

// Dashboard specific routes
router.get('/recent-orders', roleMiddleware('partner'), analyticsController.getRecentOrders);
router.get('/restaurant-info', roleMiddleware('partner'), analyticsController.getRestaurantInfo);

// Subscription analytics routes
router.get('/subscription-overview', roleMiddleware('partner'), analyticsController.getSubscriptionOverview);
router.get('/revenue-breakdown', roleMiddleware('partner'), analyticsController.getRevenueBreakdown);

// Existing routes
router.get('/restaurant/:restaurantId', 
  commonValidations.mongoId, 
  roleMiddleware('partner', 'admin'), 
  restaurantOwnershipMiddleware, 
  getRestaurantAnalytics
);

router.get('/dashboard', roleMiddleware('partner', 'admin'), getDashboardAnalytics);
router.get('/customers', roleMiddleware('admin'), getCustomerAnalytics);
router.get('/orders', roleMiddleware('partner', 'admin'), getOrderAnalytics);
router.get('/revenue', roleMiddleware('partner', 'admin'), getRevenueAnalytics);

module.exports = router;
