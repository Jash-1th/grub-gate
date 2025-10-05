// FILE: src/routes/subscription.routes.js
const express = require('express');
const {
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
} = require('../controllers/subscription.controller');
const { authMiddleware, roleMiddleware } = require('../middlewares/auth');
const { commonValidations, queryValidations } = require('../middlewares/validation');

const router = express.Router();

// Public routes
router.get('/plans', getSubscriptionPlans);

// Protected routes
router.use(authMiddleware);

// Customer subscription routes
router.get('/', roleMiddleware('customer'), queryValidations.pagination, getUserSubscriptions);
router.get('/:id', commonValidations.mongoId, roleMiddleware('customer'), getSubscription);
router.post('/', roleMiddleware('customer'), createSubscription);
router.patch('/:id', commonValidations.mongoId, roleMiddleware('customer'), updateSubscription);

// Subscription management
router.post('/:id/cancel', commonValidations.mongoId, roleMiddleware('customer'), cancelSubscription);
router.post('/:id/pause', commonValidations.mongoId, roleMiddleware('customer'), pauseSubscription);
router.post('/:id/resume', commonValidations.mongoId, roleMiddleware('customer'), resumeSubscription);
router.post('/:id/upgrade', commonValidations.mongoId, roleMiddleware('customer'), upgradeSubscription);

// Admin routes
router.get('/analytics', roleMiddleware('admin'), getSubscriptionAnalytics);
router.get('/customer-ltv/:customerId', commonValidations.mongoId, roleMiddleware('admin'), getCustomerLifetimeValue);

module.exports = router;
