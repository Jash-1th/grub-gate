// FILE: src/routes/partner/statistics.routes.js
const express = require('express');
const router = express.Router();

const {
  getPlatformStatistics,
  getSuccessStories
} = require('../../controllers/partner/statistics.controller');

const { authMiddleware, roleMiddleware } = require('../../middlewares/auth');

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @route   GET /api/v1/partner/statistics/platform
 * @desc    Get platform statistics for welcome page
 * @access  Private (Authenticated users)
 */
router.get('/platform', getPlatformStatistics);

/**
 * @route   GET /api/v1/partner/statistics/success-stories
 * @desc    Get success stories from top-performing restaurants
 * @access  Private (Authenticated users)
 */
router.get('/success-stories', getSuccessStories);

module.exports = router;
