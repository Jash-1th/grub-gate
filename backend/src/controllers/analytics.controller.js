// FILE: src/controllers/analytics.controller.js
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const User = require('../models/User');
const mongoose = require('mongoose');

/**
 * Get overview analytics for partner dashboard
 * GET /api/v1/analytics/overview
 */
exports.getOverviewAnalytics = async (req, res) => {
  try {
    const { period = 30 } = req.query;
    const restaurantId = req.user?.restaurantId;

    // Check if user has partner role and restaurant
    if (!req.user?.roles?.includes('partner')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Partner role required.'
      });
    }

    // If no restaurantId, try to find by ownerId
    let actualRestaurantId = restaurantId;
    if (!actualRestaurantId) {
      const Restaurant = require('../models/Restaurant');
      const restaurant = await Restaurant.findOne({ ownerId: req.user._id }).select('_id');
      if (restaurant) {
        actualRestaurantId = restaurant._id;
        // Update user's restaurantId for future requests
        const User = require('../models/User');
        await User.findByIdAndUpdate(req.user._id, { restaurantId: actualRestaurantId });
      }
    }

    // If still no restaurant found, return empty analytics for new partners
    if (!actualRestaurantId) {
      return res.json({
        success: true,
        data: {
          totalRevenue: { current: 0, previous: 0, growth: 0 },
          totalOrders: { current: 0, previous: 0, growth: 0 },
          activeCustomers: { current: 0, previous: 0, growth: 0 },
          avgOrderValue: { current: 0, previous: 0, growth: 0 }
        },
        message: 'No analytics data available yet. Start receiving orders to see your performance metrics.'
      });
    }

    // Calculate date ranges - make sure to include full days
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999); // End of today
    
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(period));
    startDate.setHours(0, 0, 0, 0); // Start of the day
    
    const previousEndDate = new Date(startDate);
    previousEndDate.setHours(23, 59, 59, 999);
    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousEndDate.getDate() - parseInt(period));
    previousStartDate.setHours(0, 0, 0, 0);

    // Get current period data
    const currentData = await getAnalyticsData(actualRestaurantId, startDate, endDate);
    
    // Get previous period data for growth calculation
    const previousData = await getAnalyticsData(actualRestaurantId, previousStartDate, previousEndDate);

    // Calculate growth percentages
    const analytics = {
      totalRevenue: {
        current: currentData.totalRevenue,
        previous: previousData.totalRevenue,
        growth: calculateGrowth(currentData.totalRevenue, previousData.totalRevenue)
      },
      totalOrders: {
        current: currentData.totalOrders,
        previous: previousData.totalOrders,
        growth: calculateGrowth(currentData.totalOrders, previousData.totalOrders)
      },
      activeCustomers: {
        current: currentData.activeCustomers,
        previous: previousData.activeCustomers,
        growth: calculateGrowth(currentData.activeCustomers, previousData.activeCustomers)
      },
      avgOrderValue: {
        current: currentData.avgOrderValue,
        previous: previousData.avgOrderValue,
        growth: calculateGrowth(currentData.avgOrderValue, previousData.avgOrderValue)
      },
      avgPrepTime: {
        current: currentData.avgPrepTime,
        previous: previousData.avgPrepTime,
        growth: calculateGrowth(currentData.avgPrepTime, previousData.avgPrepTime, true) // true for inverse (lower is better)
      }
      // conversionRate: Will be implemented later with analytics tracking
    };

    res.json({
      success: true,
      data: analytics,
      period: {
        days: parseInt(period),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }
    });

  } catch (error) {
    console.error('Analytics overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get analytics data for a specific time period
 */
async function getAnalyticsData(restaurantId, startDate, endDate) {
  try {
    // 1. Get revenue stats using existing Order method
    const revenueStats = await Order.getRevenueStats(restaurantId, startDate, endDate);
    const revenue = revenueStats[0] || { totalRevenue: 0, totalOrders: 0, averageOrderValue: 0 };

    // 2. Get active customers count
    const activeCustomers = await Order.aggregate([
      {
        $match: {
          restaurantId: new mongoose.Types.ObjectId(restaurantId),
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: '$customerId'
        }
      },
      {
        $count: 'activeCustomers'
      }
    ]);

    // 3. Get average prep time (weighted by order frequency)
    const prepTimeStats = await MenuItem.aggregate([
      {
        $match: {
          restaurantId: new mongoose.Types.ObjectId(restaurantId),
          status: 'available',
          totalOrders: { $gt: 0 }
        }
      },
      {
        $group: {
          _id: null,
          weightedPrepTime: {
            $sum: { $multiply: ['$prepTime', '$totalOrders'] }
          },
          totalOrdersSum: { $sum: '$totalOrders' }
        }
      }
    ]);

    const prepTime = prepTimeStats[0];
    const avgPrepTime = prepTime && prepTime.totalOrdersSum > 0 
      ? Math.round((prepTime.weightedPrepTime / prepTime.totalOrdersSum) * 10) / 10
      : 0;

    return {
      totalRevenue: revenue.totalRevenue || 0,
      totalOrders: revenue.totalOrders || 0,
      avgOrderValue: revenue.averageOrderValue || 0,
      activeCustomers: activeCustomers[0]?.activeCustomers || 0,
      avgPrepTime: avgPrepTime
    };

  } catch (error) {
    console.error('Error fetching analytics data:', error);
    throw error;
  }
}

/**
 * Calculate growth percentage between current and previous values
 */
function calculateGrowth(current, previous, inverse = false) {
  if (!previous || previous === 0) {
    return current > 0 ? 100 : 0;
  }
  
  let growth = ((current - previous) / previous) * 100;
  
  // For metrics where lower is better (like prep time), invert the growth
  if (inverse) {
    growth = -growth;
  }
  
  return Math.round(growth * 10) / 10; // Round to 1 decimal place
}

/**
 * Get revenue trend data for charts
 * GET /api/v1/analytics/revenue-trend
 */
exports.getRevenueTrend = async (req, res) => {
  try {
    const { period = 30 } = req.query;
    const restaurantId = req.user?.restaurantId;

    // For development: provide mock data if no restaurantId
    if (!restaurantId) {
      const mockData = Array.from({ length: parseInt(period) }, (_, i) => ({
        date: new Date(Date.now() - (period - i - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        revenue: Math.floor(Math.random() * 1000) + 200
      }));
      
      return res.json({
        success: true,
        data: mockData
      });
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(period));

    // Get daily revenue data
    const revenueTrend = await Order.aggregate([
      {
        $match: {
          restaurantId: new mongoose.Types.ObjectId(restaurantId),
          paymentStatus: 'paid',
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
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
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      },
      {
        $project: {
          date: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: {
                $dateFromParts: {
                  year: '$_id.year',
                  month: '$_id.month',
                  day: '$_id.day'
                }
              }
            }
          },
          value: '$revenue',  // Rename revenue to value for chart compatibility
          orders: 1,
          _id: 0
        }
      }
    ]);

    res.json({
      success: true,
      data: revenueTrend
    });

  } catch (error) {
    console.error('Revenue trend error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch revenue trend data'
    });
  }
};

/**
 * Get top performing items
 * GET /api/v1/analytics/top-items
 */
exports.getTopItems = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const restaurantId = req.user?.restaurantId;

    // For development: provide mock data if no restaurantId
    if (!restaurantId) {
      const mockItems = [
        { name: 'Classic French Burger', totalOrders: 45, revenue: 764.55 },
        { name: 'Caesar Salad', totalOrders: 38, revenue: 493.62 },
        { name: 'Grilled Chicken Breast', totalOrders: 32, revenue: 637.68 },
        { name: 'Pasta Marinara', totalOrders: 28, revenue: 419.72 },
        { name: 'French Onion Soup', totalOrders: 24, revenue: 311.76 }
      ].slice(0, parseInt(limit));
      
      return res.json({
        success: true,
        data: mockItems
      });
    }

    // Use existing Order method for popular items
    const topItems = await Order.getPopularItems(restaurantId, parseInt(limit));

    res.json({
      success: true,
      data: topItems
    });

  } catch (error) {
    console.error('Top items error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch top items data'
    });
  }
};

/**
 * Get order status distribution
 * GET /api/v1/analytics/order-status
 */
exports.getOrderStatusDistribution = async (req, res) => {
  try {
    const { period = 30 } = req.query;
    const restaurantId = req.user?.restaurantId;

    // For development: provide mock data if no restaurantId
    if (!restaurantId) {
      return res.json({
        success: true,
        data: [
          { status: 'completed', count: 124, percentage: 79.5 },
          { status: 'pending', count: 18, percentage: 11.5 },
          { status: 'cancelled', count: 14, percentage: 9.0 }
        ]
      });
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(period));

    const statusDistribution = await Order.aggregate([
      {
        $match: {
          restaurantId: new mongoose.Types.ObjectId(restaurantId),
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          status: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);

    res.json({
      success: true,
      data: statusDistribution
    });

  } catch (error) {
    console.error('Order status distribution error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order status data'
    });
  }
};

/**
 * Get customer analytics data for a specific time period
 */
async function getCustomerAnalytics(restaurantId, startDate, endDate) {
  try {
    // Active customers (customers who made orders in period)
    const activeCustomers = await Order.aggregate([
      {
        $match: {
          restaurantId: new mongoose.Types.ObjectId(restaurantId),
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $ne: 'cancelled' }
        }
      },
      { $group: { _id: '$customerId' } },
      { $count: 'active' }
    ]);

    // New customers (first order in this period)
    const newCustomers = await Order.aggregate([
      {
        $match: {
          restaurantId: new mongoose.Types.ObjectId(restaurantId),
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: '$customerId',
          firstOrder: { $min: '$createdAt' }
        }
      },
      {
        $match: {
          firstOrder: { $gte: startDate, $lte: endDate }
        }
      },
      { $count: 'new' }
    ]);

    // Loyal customers (>5 orders total, with recent activity)
    const loyalCustomers = await Order.aggregate([
      {
        $match: {
          restaurantId: new mongoose.Types.ObjectId(restaurantId),
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: '$customerId',
          orderCount: { $sum: 1 },
          hasRecentOrder: {
            $sum: {
              $cond: [
                { $and: [
                  { $gte: ['$createdAt', startDate] },
                  { $lte: ['$createdAt', endDate] }
                ]},
                1, 0
              ]
            }
          }
        }
      },
      {
        $match: {
          orderCount: { $gt: 5 },
          hasRecentOrder: { $gt: 0 }
        }
      },
      { $count: 'loyal' }
    ]);

    return {
      active: activeCustomers[0]?.active || 0,
      new: newCustomers[0]?.new || 0,
      loyal: loyalCustomers[0]?.loyal || 0
    };
  } catch (error) {
    console.error('Error fetching customer analytics:', error);
    throw error;
  }
}

/**
 * Get customer overview analytics
 * GET /api/v1/analytics/customer-overview
 */
exports.getCustomerOverview = async (req, res) => {
  try {
    const { period = 30 } = req.query;
    const restaurantId = req.user?.restaurantId;

    // For development: provide mock data if no restaurantId
    if (!restaurantId) {
      return res.json({
        success: true,
        data: {
          activeCustomers: { current: 89, previous: 76, growth: 17.1 },
          newCustomers: { current: 12, previous: 8, growth: 50.0 },
          loyalCustomers: { current: 23, previous: 19, growth: 21.1 }
        }
      });
    }

    // Calculate date ranges
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(period));
    
    const previousEndDate = new Date(startDate);
    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousEndDate.getDate() - parseInt(period));

    // Get current and previous period data
    const currentCustomers = await getCustomerAnalytics(restaurantId, startDate, endDate);
    const previousCustomers = await getCustomerAnalytics(restaurantId, previousStartDate, previousEndDate);

    // Calculate growth percentages
    const analytics = {
      activeCustomers: {
        current: currentCustomers.active,
        previous: previousCustomers.active,
        growth: calculateGrowth(currentCustomers.active, previousCustomers.active)
      },
      newCustomers: {
        current: currentCustomers.new,
        previous: previousCustomers.new,
        growth: calculateGrowth(currentCustomers.new, previousCustomers.new)
      },
      loyalCustomers: {
        current: currentCustomers.loyal,
        previous: previousCustomers.loyal,
        growth: calculateGrowth(currentCustomers.loyal, previousCustomers.loyal)
      }
    };

    res.json({
      success: true,
      data: analytics,
      period: {
        days: parseInt(period),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }
    });

  } catch (error) {
    console.error('Customer overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer overview data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get top customers by spending
 * GET /api/v1/analytics/top-customers
 */
exports.getTopCustomers = async (req, res) => {
  try {
    const { limit = 5, period = 30 } = req.query;
    const restaurantId = req.user?.restaurantId;

    // For development: provide mock data if no restaurantId
    if (!restaurantId) {
      const mockTopCustomers = [
        { name: 'Marie Dubois', totalOrders: 25, totalSpent: 892.34 },
        { name: 'Sophie Tremblay', totalOrders: 12, totalSpent: 456.78 },
        { name: 'Jean-Pierre Martin', totalOrders: 8, totalSpent: 298.45 },
        { name: 'Antoine Leblanc', totalOrders: 15, totalSpent: 567.89 },
        { name: 'Claire Rousseau', totalOrders: 9, totalSpent: 234.56 }
      ].slice(0, parseInt(limit));
      
      return res.json({
        success: true,
        data: mockTopCustomers
      });
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(period));

    const topCustomers = await Order.aggregate([
      {
        $match: {
          restaurantId: new mongoose.Types.ObjectId(restaurantId),
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: '$customerId',
          totalSpent: { $sum: '$total' },
          totalOrders: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'customer'
        }
      },
      { $unwind: '$customer' },
      {
        $project: {
          name: { $concat: ['$customer.firstName', ' ', '$customer.lastName'] },
          totalSpent: 1,
          totalOrders: 1,
          _id: 0
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: parseInt(limit) }
    ]);

    res.json({
      success: true,
      data: topCustomers
    });

  } catch (error) {
    console.error('Top customers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch top customers data'
    });
  }
};

/**
 * Get customer segments data
 * GET /api/v1/analytics/customer-segments
 */
exports.getCustomerSegments = async (req, res) => {
  try {
    const { period = 30 } = req.query;
    const restaurantId = req.user?.restaurantId;

    // For development: provide mock data if no restaurantId
    if (!restaurantId) {
      return res.json({
        success: true,
        data: {
          active: 89,
          new: 12,
          loyal: 23
        }
      });
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(period));

    // Get customer segments data
    const segments = await getCustomerAnalytics(restaurantId, startDate, endDate);

    res.json({
      success: true,
      data: segments
    });

  } catch (error) {
    console.error('Customer segments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer segments data'
    });
  }
};

/**
 * Get performance analytics data for visualizations
 * GET /api/v1/analytics/performance-overview
 */
exports.getPerformanceOverview = async (req, res) => {
  try {
    const { period = 30 } = req.query;
    const restaurantId = req.user?.restaurantId;

    // For development: provide mock data if no restaurantId
    if (!restaurantId) {
      return res.json({
        success: true,
        data: {
          deliveryPerformance: {
            onTimeDeliveryRate: { current: 87.2, previous: 82.1, growth: 6.2 },
            avgDeliveryTime: { current: 35, previous: 38, growth: -7.9 },
            prepTimeAccuracy: { current: 85.5, previous: 78.2, growth: 9.3 }
          },
          orderPerformance: {
            completionRate: { current: 94.5, previous: 91.2, growth: 3.6 },
            cancelationRate: { current: 5.5, previous: 8.8, growth: -37.5 },
            avgProcessingTime: { current: 12, previous: 15, growth: -20.0 }
          }
        }
      });
    }

    // Calculate date ranges
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(period));
    
    const previousEndDate = new Date(startDate);
    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousEndDate.getDate() - parseInt(period));

    // Get current and previous period performance data
    const currentPerformance = await getPerformanceAnalytics(restaurantId, startDate, endDate);
    const previousPerformance = await getPerformanceAnalytics(restaurantId, previousStartDate, previousEndDate);

    // Calculate growth percentages
    const analytics = {
      deliveryPerformance: {
        onTimeDeliveryRate: {
          current: currentPerformance.onTimeDeliveryRate,
          previous: previousPerformance.onTimeDeliveryRate,
          growth: calculateGrowth(currentPerformance.onTimeDeliveryRate, previousPerformance.onTimeDeliveryRate)
        },
        avgDeliveryTime: {
          current: currentPerformance.avgDeliveryTime,
          previous: previousPerformance.avgDeliveryTime,
          growth: calculateGrowth(currentPerformance.avgDeliveryTime, previousPerformance.avgDeliveryTime)
        },
        prepTimeAccuracy: {
          current: currentPerformance.prepTimeAccuracy,
          previous: previousPerformance.prepTimeAccuracy,
          growth: calculateGrowth(currentPerformance.prepTimeAccuracy, previousPerformance.prepTimeAccuracy)
        }
      },
      orderPerformance: {
        completionRate: {
          current: currentPerformance.completionRate,
          previous: previousPerformance.completionRate,
          growth: calculateGrowth(currentPerformance.completionRate, previousPerformance.completionRate)
        },
        cancelationRate: {
          current: currentPerformance.cancelationRate,
          previous: previousPerformance.cancelationRate,
          growth: calculateGrowth(currentPerformance.cancelationRate, previousPerformance.cancelationRate)
        },
        avgProcessingTime: {
          current: currentPerformance.avgProcessingTime,
          previous: previousPerformance.avgProcessingTime,
          growth: calculateGrowth(currentPerformance.avgProcessingTime, previousPerformance.avgProcessingTime)
        }
      }
    };

    res.json({
      success: true,
      data: analytics,
      period: {
        days: parseInt(period),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }
    });

  } catch (error) {
    console.error('Performance overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch performance overview data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get performance analytics helper function
 */
async function getPerformanceAnalytics(restaurantId, startDate, endDate) {
  try {
    // Order completion and delivery performance
    const orderStats = await Order.aggregate([
      {
        $match: {
          restaurantId: new mongoose.Types.ObjectId(restaurantId),
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          completedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
          },
          cancelledOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          onTimeDeliveries: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ['$deliveryTime.estimated', null] },
                    { $ne: ['$deliveryTime.actual', null] },
                    { $lte: ['$deliveryTime.actual', '$deliveryTime.estimated'] }
                  ]
                },
                1, 0
              ]
            }
          },
          totalDeliveries: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ['$deliveryTime.estimated', null] },
                    { $ne: ['$deliveryTime.actual', null] }
                  ]
                },
                1, 0
              ]
            }
          },
          avgDeliveryTime: {
            $avg: {
              $cond: [
                { $ne: ['$deliveryTime.actual', null] },
                {
                  $divide: [
                    { $subtract: ['$deliveryTime.actual', '$createdAt'] },
                    1000 * 60 // Convert to minutes
                  ]
                },
                null
              ]
            }
          },
          avgProcessingTime: {
            $avg: {
              $cond: [
                { $ne: ['$deliveryTime.estimated', null] },
                {
                  $divide: [
                    { $subtract: ['$deliveryTime.estimated', '$createdAt'] },
                    1000 * 60 // Convert to minutes
                  ]
                },
                null
              ]
            }
          }
        }
      }
    ]);

    const stats = orderStats[0] || {
      totalOrders: 0,
      completedOrders: 0,
      cancelledOrders: 0,
      onTimeDeliveries: 0,
      totalDeliveries: 0,
      avgDeliveryTime: 0,
      avgProcessingTime: 0
    };

    return {
      completionRate: stats.totalOrders > 0 ? (stats.completedOrders / stats.totalOrders) * 100 : 0,
      cancelationRate: stats.totalOrders > 0 ? (stats.cancelledOrders / stats.totalOrders) * 100 : 0,
      onTimeDeliveryRate: stats.totalDeliveries > 0 ? (stats.onTimeDeliveries / stats.totalDeliveries) * 100 : 0,
      avgDeliveryTime: Math.round(stats.avgDeliveryTime || 0),
      avgProcessingTime: Math.round(stats.avgProcessingTime || 0),
      prepTimeAccuracy: stats.totalDeliveries > 0 ? (stats.onTimeDeliveries / stats.totalDeliveries) * 100 : 0
    };
  } catch (error) {
    console.error('Error fetching performance analytics:', error);
    throw error;
  }
}

/**
 * Get delivery performance trend data for charts
 * GET /api/v1/analytics/delivery-performance-trend
 */
exports.getDeliveryPerformanceTrend = async (req, res) => {
  try {
    const { period = 30 } = req.query;
    const restaurantId = req.user?.restaurantId;

    // For development: provide mock data if no restaurantId
    if (!restaurantId) {
      const mockTrend = Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        onTimeRate: Math.round(80 + Math.random() * 20),
        avgDeliveryTime: Math.round(30 + Math.random() * 15),
        completionRate: Math.round(90 + Math.random() * 10)
      }));
      
      return res.json({
        success: true,
        data: mockTrend
      });
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(period));

    // Get daily performance trend
    const performanceTrend = await Order.aggregate([
      {
        $match: {
          restaurantId: new mongoose.Types.ObjectId(restaurantId),
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          totalOrders: { $sum: 1 },
          completedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
          },
          onTimeDeliveries: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ['$deliveryTime.estimated', null] },
                    { $ne: ['$deliveryTime.actual', null] },
                    { $lte: ['$deliveryTime.actual', '$deliveryTime.estimated'] }
                  ]
                },
                1, 0
              ]
            }
          },
          totalDeliveries: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ['$deliveryTime.estimated', null] },
                    { $ne: ['$deliveryTime.actual', null] }
                  ]
                },
                1, 0
              ]
            }
          },
          avgDeliveryTime: {
            $avg: {
              $cond: [
                { $ne: ['$deliveryTime.actual', null] },
                {
                  $divide: [
                    { $subtract: ['$deliveryTime.actual', '$createdAt'] },
                    1000 * 60
                  ]
                },
                null
              ]
            }
          }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      },
      {
        $project: {
          date: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: {
                $dateFromParts: {
                  year: '$_id.year',
                  month: '$_id.month',
                  day: '$_id.day'
                }
              }
            }
          },
          onTimeRate: {
            $cond: [
              { $gt: ['$totalDeliveries', 0] },
              { $multiply: [{ $divide: ['$onTimeDeliveries', '$totalDeliveries'] }, 100] },
              0
            ]
          },
          avgDeliveryTime: { $round: ['$avgDeliveryTime', 0] },
          completionRate: {
            $cond: [
              { $gt: ['$totalOrders', 0] },
              { $multiply: [{ $divide: ['$completedOrders', '$totalOrders'] }, 100] },
              0
            ]
          },
          _id: 0
        }
      }
    ]);

    res.json({
      success: true,
      data: performanceTrend
    });

  } catch (error) {
    console.error('Delivery performance trend error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch delivery performance trend data'
    });
  }
};

/**
 * Get recent orders for dashboard
 * GET /api/v1/analytics/recent-orders
 */
exports.getRecentOrders = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const restaurantId = req.user?.restaurantId;

    // Check if user has partner role
    if (!req.user?.roles?.includes('partner')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Partner role required.'
      });
    }

    // If no restaurantId, try to find by ownerId
    let actualRestaurantId = restaurantId;
    if (!actualRestaurantId) {
      const Restaurant = require('../models/Restaurant');
      const restaurant = await Restaurant.findOne({ ownerId: req.user._id }).select('_id');
      if (restaurant) {
        actualRestaurantId = restaurant._id;
        // Update user's restaurantId for future requests
        const User = require('../models/User');
        await User.findByIdAndUpdate(req.user._id, { restaurantId: actualRestaurantId });
      }
    }

    // For development: provide mock data if no restaurantId
    if (!actualRestaurantId) {
      const mockRecentOrders = [
        {
          id: 'order_001',
          orderNumber: 'ORD-2024-001',
          customer: { name: 'Marie Dubois', email: 'marie@example.com' },
          items: [{ name: 'Saturday Dinner Deluxe', quantity: 1 }],
          total: 313.19,
          status: 'scheduled',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'order_002',
          orderNumber: 'ORD-2024-002',
          customer: { name: 'Jean-Pierre Martin', email: 'jp@example.com' },
          items: [{ name: 'Sunday Lunch Special', quantity: 2 }],
          total: 598.00,
          status: 'pending',
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'order_003',
          orderNumber: 'ORD-2024-003',
          customer: { name: 'Sophie Tremblay', email: 'sophie@example.com' },
          items: [{ name: 'Saturday Dinner Deluxe', quantity: 1 }],
          total: 313.19,
          status: 'scheduled',
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
        }
      ].slice(0, parseInt(limit));
      
      return res.json({
        success: true,
        data: mockRecentOrders
      });
    }

    // Get recent orders from database
    const recentOrders = await Order.aggregate([
      {
        $match: {
          restaurantId: new mongoose.Types.ObjectId(actualRestaurantId)
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'customerId',
          foreignField: '_id',
          as: 'customer'
        }
      },
      { $unwind: '$customer' },
      {
        $project: {
          orderNumber: 1,
          customer: {
            name: { $concat: ['$customer.firstName', ' ', '$customer.lastName'] },
            email: '$customer.email'
          },
          items: {
            $map: {
              input: '$items',
              as: 'item',
              in: {
                name: '$$item.name',
                quantity: '$$item.quantity'
              }
            }
          },
          total: 1,
          status: 1,
          createdAt: 1
        }
      },
      { $sort: { createdAt: -1 } },
      { $limit: parseInt(limit) }
    ]);

    res.json({
      success: true,
      data: recentOrders
    });

  } catch (error) {
    console.error('Recent orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent orders data'
    });
  }
};

/**
 * Get subscription analytics overview
 * GET /api/v1/analytics/subscription-overview
 */
exports.getSubscriptionOverview = async (req, res) => {
  try {
    const { period = 30 } = req.query;
    const restaurantId = req.user?.restaurantId;

    // Check if user has partner role and restaurant
    if (!req.user?.roles?.includes('partner')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Partner role required.'
      });
    }

    // If no restaurantId, try to find by ownerId
    let actualRestaurantId = restaurantId;
    if (!actualRestaurantId) {
      const Restaurant = require('../models/Restaurant');
      const restaurant = await Restaurant.findOne({ ownerId: req.user._id }).select('_id');
      if (restaurant) {
        actualRestaurantId = restaurant._id;
      }
    }

    // If still no restaurant found, return empty analytics
    if (!actualRestaurantId) {
      return res.json({
        success: true,
        data: {
          monthlyRecurringRevenue: { current: 0, previous: 0, growth: 0 },
          subscriptionRevenue: { current: 0, previous: 0, growth: 0 },
          oneTimeRevenue: { current: 0, previous: 0, growth: 0 },
          subscriptionConversionRate: { current: 0, previous: 0, growth: 0 },
          averageRevenuePerUser: { current: 0, previous: 0, growth: 0 },
          customerLifetimeValue: { current: 0, previous: 0, growth: 0 },
          churnRate: { current: 0, previous: 0, growth: 0 }
        }
      });
    }

    // Calculate date ranges - make sure to include full days
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999); // End of today
    
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(period));
    startDate.setHours(0, 0, 0, 0); // Start of the day
    
    const previousEndDate = new Date(startDate);
    previousEndDate.setHours(23, 59, 59, 999);
    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousEndDate.getDate() - parseInt(period));
    previousStartDate.setHours(0, 0, 0, 0);

    // Get current and previous period subscription data
    const currentData = await getSubscriptionAnalytics(actualRestaurantId, startDate, endDate);
    const previousData = await getSubscriptionAnalytics(actualRestaurantId, previousStartDate, previousEndDate);

    // Calculate growth percentages
    const analytics = {
      monthlyRecurringRevenue: {
        current: currentData.monthlyRecurringRevenue,
        previous: previousData.monthlyRecurringRevenue,
        growth: calculateGrowth(currentData.monthlyRecurringRevenue, previousData.monthlyRecurringRevenue)
      },
      subscriptionRevenue: {
        current: currentData.subscriptionRevenue,
        previous: previousData.subscriptionRevenue,
        growth: calculateGrowth(currentData.subscriptionRevenue, previousData.subscriptionRevenue)
      },
      oneTimeRevenue: {
        current: currentData.oneTimeRevenue,
        previous: previousData.oneTimeRevenue,
        growth: calculateGrowth(currentData.oneTimeRevenue, previousData.oneTimeRevenue)
      },
      subscriptionConversionRate: {
        current: currentData.subscriptionConversionRate,
        previous: previousData.subscriptionConversionRate,
        growth: calculateGrowth(currentData.subscriptionConversionRate, previousData.subscriptionConversionRate)
      },
      averageRevenuePerUser: {
        current: currentData.averageRevenuePerUser,
        previous: previousData.averageRevenuePerUser,
        growth: calculateGrowth(currentData.averageRevenuePerUser, previousData.averageRevenuePerUser)
      },
      customerLifetimeValue: {
        current: currentData.customerLifetimeValue,
        previous: previousData.customerLifetimeValue,
        growth: calculateGrowth(currentData.customerLifetimeValue, previousData.customerLifetimeValue)
      },
      churnRate: {
        current: currentData.churnRate,
        previous: previousData.churnRate,
        growth: calculateGrowth(currentData.churnRate, previousData.churnRate, true) // Inverse - lower is better
      }
    };

    res.json({
      success: true,
      data: analytics,
      period: {
        days: parseInt(period),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }
    });

  } catch (error) {
    console.error('Subscription analytics overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription analytics data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get subscription analytics data for a specific time period
 */
async function getSubscriptionAnalytics(restaurantId, startDate, endDate) {
  try {
    const Subscription = require('../models/Subscription');
    const SubscriptionMealPlan = require('../models/SubscriptionMealPlan');

    // 1. Get subscription revenue from orders
    const subscriptionOrderStats = await Order.aggregate([
      {
        $match: {
          restaurantId: new mongoose.Types.ObjectId(restaurantId),
          isSubscriptionOrder: true,
          paymentStatus: 'paid',
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          subscriptionRevenue: { $sum: '$total' },
          subscriptionOrders: { $sum: 1 },
          uniqueSubscriptionCustomers: { $addToSet: '$customerId' }
        }
      }
    ]);

    // 2. Get one-time order revenue
    const oneTimeOrderStats = await Order.aggregate([
      {
        $match: {
          restaurantId: new mongoose.Types.ObjectId(restaurantId),
          isSubscriptionOrder: { $ne: true },
          paymentStatus: 'paid',
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          oneTimeRevenue: { $sum: '$total' },
          oneTimeOrders: { $sum: 1 },
          uniqueOneTimeCustomers: { $addToSet: '$customerId' }
        }
      }
    ]);

    // 3. Get active subscriptions and MRR from meal plans
    const subscriptionMealPlans = await SubscriptionMealPlan.aggregate([
      {
        $match: {
          restaurantId: new mongoose.Types.ObjectId(restaurantId),
          status: 'active',
          planStartDate: { $lte: endDate },
          planEndDate: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalPlanValue: { $sum: '$totalPlanValue' },
          activePlans: { $sum: 1 },
          uniqueCustomers: { $addToSet: '$customerId' }
        }
      }
    ]);

    // 4. Get subscription billing data for MRR calculation
    const subscriptionBilling = await Subscription.aggregate([
      {
        $lookup: {
          from: 'subscriptionmealplans',
          localField: '_id',
          foreignField: 'subscriptionId',
          as: 'mealPlans'
        }
      },
      {
        $match: {
          'mealPlans.restaurantId': new mongoose.Types.ObjectId(restaurantId),
          status: 'active'
        }
      },
      {
        $unwind: '$billingHistory'
      },
      {
        $match: {
          'billingHistory.status': 'paid',
          'billingHistory.date': { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          monthlyRecurringRevenue: { $sum: '$billingHistory.amount' },
          paidBillings: { $sum: 1 }
        }
      }
    ]);

    // 5. Calculate churn rate (cancelled subscriptions)
    const churnData = await Subscription.aggregate([
      {
        $lookup: {
          from: 'subscriptionmealplans',
          localField: '_id',
          foreignField: 'subscriptionId',
          as: 'mealPlans'
        }
      },
      {
        $match: {
          'mealPlans.restaurantId': new mongoose.Types.ObjectId(restaurantId)
        }
      },
      {
        $group: {
          _id: null,
          totalSubscriptions: { $sum: 1 },
          cancelledSubscriptions: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$status', 'cancelled'] },
                    { $gte: ['$cancelledAt', startDate] },
                    { $lte: ['$cancelledAt', endDate] }
                  ]
                },
                1, 0
              ]
            }
          },
          activeSubscriptions: {
            $sum: {
              $cond: [{ $eq: ['$status', 'active'] }, 1, 0]
            }
          }
        }
      }
    ]);

    // Extract results with fallbacks
    const subOrderData = subscriptionOrderStats[0] || { subscriptionRevenue: 0, subscriptionOrders: 0, uniqueSubscriptionCustomers: [] };
    const oneTimeData = oneTimeOrderStats[0] || { oneTimeRevenue: 0, oneTimeOrders: 0, uniqueOneTimeCustomers: [] };
    const mealPlanData = subscriptionMealPlans[0] || { totalPlanValue: 0, activePlans: 0, uniqueCustomers: [] };
    const billingData = subscriptionBilling[0] || { monthlyRecurringRevenue: 0, paidBillings: 0 };
    const churnInfo = churnData[0] || { totalSubscriptions: 0, cancelledSubscriptions: 0, activeSubscriptions: 0 };

    // Calculate metrics
    const totalCustomers = new Set([
      ...subOrderData.uniqueSubscriptionCustomers.map(id => id.toString()),
      ...oneTimeData.uniqueOneTimeCustomers.map(id => id.toString())
    ]).size;

    const subscriptionCustomers = subOrderData.uniqueSubscriptionCustomers.length;
    const subscriptionConversionRate = totalCustomers > 0 ? (subscriptionCustomers / totalCustomers) * 100 : 0;
    
    const totalRevenue = subOrderData.subscriptionRevenue + oneTimeData.oneTimeRevenue;
    const averageRevenuePerUser = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;
    
    // Estimate CLV: Average monthly subscription value * average subscription duration (6 months)
    const avgSubscriptionValue = mealPlanData.activePlans > 0 ? mealPlanData.totalPlanValue / mealPlanData.activePlans : 0;
    const customerLifetimeValue = avgSubscriptionValue * 6; // 6 month average
    
    const churnRate = churnInfo.activeSubscriptions > 0 ? 
      (churnInfo.cancelledSubscriptions / (churnInfo.activeSubscriptions + churnInfo.cancelledSubscriptions)) * 100 : 0;

    return {
      monthlyRecurringRevenue: billingData.monthlyRecurringRevenue || 0,
      subscriptionRevenue: subOrderData.subscriptionRevenue || 0,
      oneTimeRevenue: oneTimeData.oneTimeRevenue || 0,
      subscriptionConversionRate: Math.round(subscriptionConversionRate * 10) / 10,
      averageRevenuePerUser: Math.round(averageRevenuePerUser * 100) / 100,
      customerLifetimeValue: Math.round(customerLifetimeValue * 100) / 100,
      churnRate: Math.round(churnRate * 10) / 10
    };

  } catch (error) {
    console.error('Error fetching subscription analytics data:', error);
    throw error;
  }
}

/**
 * Get revenue breakdown (subscription vs one-time)
 * GET /api/v1/analytics/revenue-breakdown
 */
exports.getRevenueBreakdown = async (req, res) => {
  try {
    const { period = 30 } = req.query;
    const restaurantId = req.user?.restaurantId;

    if (!restaurantId) {
      // Mock data for development
      return res.json({
        success: true,
        data: {
          subscriptionRevenue: 4250.00,
          oneTimeRevenue: 1890.50,
          subscriptionPercentage: 69.2,
          oneTimePercentage: 30.8,
          totalRevenue: 6140.50
        }
      });
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(period));

    // Get subscription and one-time revenue
    const revenueBreakdown = await Order.aggregate([
      {
        $match: {
          restaurantId: new mongoose.Types.ObjectId(restaurantId),
          paymentStatus: 'paid',
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          subscriptionRevenue: {
            $sum: {
              $cond: [{ $eq: ['$isSubscriptionOrder', true] }, '$total', 0]
            }
          },
          oneTimeRevenue: {
            $sum: {
              $cond: [{ $ne: ['$isSubscriptionOrder', true] }, '$total', 0]
            }
          },
          totalRevenue: { $sum: '$total' }
        }
      }
    ]);

    const data = revenueBreakdown[0] || { subscriptionRevenue: 0, oneTimeRevenue: 0, totalRevenue: 0 };
    
    const subscriptionPercentage = data.totalRevenue > 0 ? (data.subscriptionRevenue / data.totalRevenue) * 100 : 0;
    const oneTimePercentage = data.totalRevenue > 0 ? (data.oneTimeRevenue / data.totalRevenue) * 100 : 0;

    res.json({
      success: true,
      data: {
        subscriptionRevenue: data.subscriptionRevenue,
        oneTimeRevenue: data.oneTimeRevenue,
        subscriptionPercentage: Math.round(subscriptionPercentage * 10) / 10,
        oneTimePercentage: Math.round(oneTimePercentage * 10) / 10,
        totalRevenue: data.totalRevenue
      }
    });

  } catch (error) {
    console.error('Revenue breakdown error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch revenue breakdown data'
    });
  }
};

/**
 * @desc    Get partner statistics for welcome page
 * @route   GET /api/v1/analytics/partner-stats
 * @access  Public (for welcome page)
 */
const getPartnerStats = asyncHandler(async (req, res) => {
  try {
    console.log('Analytics - getPartnerStats called');

    const Restaurant = require('../models/Restaurant');
    const Order = require('../models/Order');

    // Get active restaurants count
    const activeRestaurants = await Restaurant.countDocuments({ 
      status: 'active'
    });

    // Get monthly orders count (current month)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const monthlyOrders = await Order.countDocuments({
      createdAt: { $gte: startOfMonth },
      status: { $in: ['pending', 'confirmed', 'preparing', 'ready', 'delivered'] }
    });

    // Get average rating across all restaurants
    const ratingStats = await Restaurant.aggregate([
      { $match: { status: 'active', rating: { $gt: 0 } } },
      { $group: { _id: null, averageRating: { $avg: '$rating' } } }
    ]);

    const averageRating = ratingStats.length > 0 ? ratingStats[0].averageRating : 4.5;

    const stats = {
      activeRestaurants,
      monthlyOrders,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      lastUpdated: new Date()
    };

    console.log('Partner stats calculated:', stats);

    successResponse(res, stats, 'Partner statistics retrieved successfully');
  } catch (error) {
    console.error('Error getting partner stats:', error);
    errorResponse(res, 'Failed to get partner statistics', 500);
  }
});

module.exports = {
  getOverview,
  getRecentOrders,
  getRestaurantInfo,
  getPartnerStats
};
