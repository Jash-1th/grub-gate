// FILE: src/routes/admin.routes.js
const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middlewares/auth');
const {
  getRestaurantCustomers,
  getCustomerRestaurantAnalytics,
  getAllCustomers
} = require('../controllers/admin.controller');

// Protect all admin routes
router.use(authMiddleware);
router.use(roleMiddleware('admin', 'partner'));

/**
 * @desc    Get all customers (admin overview)
 * @route   GET /api/v1/admin/customers
 * @access  Admin only
 */
router.get('/customers', roleMiddleware('admin'), getAllCustomers);

/**
 * @desc    Get customers for current user's restaurant (partners)
 * @route   GET /api/v1/admin/my-customers
 * @access  Partner
 */
router.get('/my-customers', roleMiddleware('partner'), (req, res) => {
  // Set restaurantId from user and call the main function
  req.params.restaurantId = req.user.restaurantId;
  return getRestaurantCustomers(req, res);
});

/**
 * @desc    Get customers for a specific restaurant
 * @route   GET /api/v1/admin/restaurants/:restaurantId/customers
 * @access  Admin, Partner (own restaurant only)
 */
router.get('/restaurants/:restaurantId/customers', getRestaurantCustomers);

/**
 * @desc    Get detailed analytics for a customer at a specific restaurant
 * @route   GET /api/v1/admin/restaurants/:restaurantId/customers/:customerId
 * @access  Admin, Partner (own restaurant only)
 */
router.get('/restaurants/:restaurantId/customers/:customerId', getCustomerRestaurantAnalytics);

module.exports = router;
