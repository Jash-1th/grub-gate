const express = require('express');
const {
  getUserMealCalendar,
  getSubscriptionStatus,
  getMealCalendarRange,
  updateMealStatus,
  getMealCalendarStats
} = require('../controllers/mealCalendar.controller');
const { authMiddleware, roleMiddleware } = require('../middlewares/auth');

const router = express.Router();

// Apply authentication to all routes
router.use(authMiddleware);
router.use(roleMiddleware('customer')); // Only customers can access meal calendar

// @route   GET /api/v1/meal-calendar
// @desc    Get user's active meal calendar
// @access  Private (Customer)
router.get('/', getUserMealCalendar);

// @route   GET /api/v1/meal-calendar/subscription-status
// @desc    Check subscription status and overlap
// @access  Private (Customer)
router.get('/subscription-status', getSubscriptionStatus);

// @route   GET /api/v1/meal-calendar/range
// @desc    Get meal calendar for specific date range
// @access  Private (Customer)
router.get('/range', getMealCalendarRange);

// @route   GET /api/v1/meal-calendar/stats
// @desc    Get meal calendar statistics
// @access  Private (Customer)
router.get('/stats', getMealCalendarStats);

// @route   PATCH /api/v1/meal-calendar/meals/:mealId/status
// @desc    Update meal status
// @access  Private (Customer)
router.patch('/meals/:mealId/status', updateMealStatus);

module.exports = router;
