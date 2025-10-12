// FILE: src/controllers/analytics.controller.js
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const User = require('../models/User');
const mongoose = require('mongoose');
const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * Get overview analytics for partner dashboard
 * GET /api/v1/analytics/overview
 */
exports.getOverviewAnalytics = asyncHandler(async (req, res) => {
  const { period = 30 } = req.query;
  const restaurantId = req.user?.restaurantId;

  // Check if user has partner role and restaurant
  if (!req.user?.roles?.includes('partner')) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Partner role required.'
    });
  }

  // Rest of the function remains the same...
  // [Previous implementation continues...]
});

// [All other controller methods with proper asyncHandler wrapping...]

/**
 * Get revenue trend data for charts
 * GET /api/v1/analytics/revenue-trend
 */
exports.getRevenueTrend = asyncHandler(async (req, res) => {
  const { period = 30 } = req.query;
  const restaurantId = req.user?.restaurantId;

  // Implementation...
  // [Previous implementation continues...]
});

// [Other controller methods with proper asyncHandler wrapping...]
