// FILE: src/routes/partner/orders.routes.js
const express = require('express');
const { body, query, param } = require('express-validator');
const router = express.Router();

const {
  getTodaysOrders,
  getOrdersByDateRange,
  updateOrderStatus,
  getOrderAnalytics
} = require('../../controllers/partner/orders.controller');

const { authMiddleware, roleMiddleware } = require('../../middlewares/auth');

// Apply authentication and partner role middleware to all routes
router.use(authMiddleware);
router.use(roleMiddleware(['partner']));

/**
 * @route   GET /api/v1/partner/orders/today
 * @desc    Get today's orders for the partner's restaurant
 * @access  Private (Partner only)
 */
router.get('/today', getTodaysOrders);

/**
 * @route   GET /api/v1/partner/orders/analytics
 * @desc    Get order analytics for partner dashboard
 * @access  Private (Partner only)
 */
router.get('/analytics', getOrderAnalytics);

/**
 * @route   GET /api/v1/partner/orders
 * @desc    Get orders by date range and optional status filter
 * @access  Private (Partner only)
 */
router.get('/',
  [
    query('startDate')
      .isISO8601()
      .withMessage('Start date must be a valid ISO 8601 date'),
    query('endDate')
      .isISO8601()
      .withMessage('End date must be a valid ISO 8601 date'),
    query('status')
      .optional()
      .isIn(['scheduled', 'pending', 'in_progress', 'completed', 'cancelled'])
      .withMessage('Invalid status value')
  ],
  getOrdersByDateRange
);

/**
 * @route   PUT /api/v1/partner/orders/:orderId/status
 * @desc    Update order status
 * @access  Private (Partner only)
 */
router.put('/:orderId/status',
  [
    param('orderId')
      .isMongoId()
      .withMessage('Valid order ID is required'),
    body('status')
      .isIn(['pending', 'in_progress', 'completed', 'cancelled'])
      .withMessage('Invalid status. Must be one of: pending, in_progress, completed, cancelled'),
    body('notes')
      .optional()
      .isString()
      .isLength({ max: 500 })
      .withMessage('Notes must be a string with maximum 500 characters')
  ],
  updateOrderStatus
);

module.exports = router;
