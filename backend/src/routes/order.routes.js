// FILE: src/routes/order.routes.js
const express = require('express');
const {
  getOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  cancelOrder,
  getOrderTracking,
  getOrderStats
} = require('../controllers/order.controller');
const { authMiddleware, roleMiddleware, ownershipMiddleware } = require('../middlewares/auth');
const { orderValidations, commonValidations, queryValidations } = require('../middlewares/validation');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Order routes
router.get('/', queryValidations.pagination, getOrders);
router.get('/stats', roleMiddleware('partner', 'admin'), getOrderStats);
router.get('/:id', commonValidations.mongoId, getOrder);
router.post('/', roleMiddleware('customer'), orderValidations.create, createOrder);

// Order tracking (customer only)
router.get('/:id/tracking', commonValidations.mongoId, roleMiddleware('customer'), getOrderTracking);

// Order management (partner/admin)
router.patch('/:id/status', 
  commonValidations.mongoId, 
  roleMiddleware('partner', 'admin'), 
  orderValidations.updateStatus, 
  updateOrderStatus
);

// Cancel order (customer can cancel their own, partner/admin can cancel any)
router.post('/:id/cancel', commonValidations.mongoId, cancelOrder);

module.exports = router;
