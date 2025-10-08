const express = require('express');
const { body, param, query } = require('express-validator');
const {
  getMealPlan,
  updateMealPlan,
  getMealPlanById,
  getUserMealPlans,
  updateMealPlanStatus,
  updateDeliveryAddress,
  getTodaysOrders,
  createSubscriptionFromMealPlan,
  getRestaurantMealPlans
} = require('../controllers/subscriptionMealPlan.controller');
const { authMiddleware, roleMiddleware, restaurantOwnershipMiddleware } = require('../middlewares/auth');
const { validateRequest, subscriptionMealPlanSchemas } = require('../middlewares/joiValidation');

const router = express.Router();

// Customer routes (protected by auth)
router.use(authMiddleware);

// Get or create meal plan for user
router.get('/me', 
  [
    query('subscriptionId').notEmpty().withMessage('Subscription ID is required'),
    query('restaurantId').notEmpty().withMessage('Restaurant ID is required'),
    query('planType').optional().isIn(['bi-weekly', 'monthly', 'quarterly']).withMessage('Invalid plan type')
  ],
  getMealPlan
);

// Get all active meal plans for user
router.get('/me/all', getUserMealPlans);

// Create subscription meal plan from user's weekly meal plan (after payment)
router.post('/create-from-meal-plan',
  [
    body('subscriptionId').notEmpty().withMessage('Subscription ID is required'),
    body('restaurantId').isMongoId().withMessage('Valid restaurant ID is required'),
    body('planType').optional().isIn(['bi-weekly', 'monthly', 'quarterly']).withMessage('Invalid plan type'),
    body('deliveryAddress').optional().isObject().withMessage('Delivery address must be an object'),
    body('deliveryAddress.street').optional().notEmpty().withMessage('Street is required if delivery address is provided'),
    body('deliveryAddress.city').optional().notEmpty().withMessage('City is required if delivery address is provided'),
    body('deliveryAddress.province').optional().notEmpty().withMessage('Province is required if delivery address is provided'),
    body('deliveryAddress.postalCode').optional().notEmpty().withMessage('Postal code is required if delivery address is provided'),
    body('specialInstructions').optional().isString().withMessage('Special instructions must be a string'),
    body('customerPhone').optional().isMobilePhone().withMessage('Invalid phone number format')
  ],
  createSubscriptionFromMealPlan
);

// Get specific meal plan by ID
router.get('/:planId',
  [
    param('planId').isMongoId().withMessage('Invalid plan ID')
  ],
  getMealPlanById
);

// Update meal plan (add/remove meals)
router.put('/:planId',
  [
    param('planId').isMongoId().withMessage('Invalid plan ID')
  ],
  validateRequest(subscriptionMealPlanSchemas.updatePlan),
  updateMealPlan
);

// Update meal plan status
router.patch('/:planId/status',
  [
    param('planId').isMongoId().withMessage('Invalid plan ID')
  ],
  validateRequest(subscriptionMealPlanSchemas.updateStatus),
  updateMealPlanStatus
);

// Update delivery address
router.patch('/:planId/delivery-address',
  [
    param('planId').isMongoId().withMessage('Invalid plan ID')
  ],
  validateRequest(subscriptionMealPlanSchemas.updateAddress),
  updateDeliveryAddress
);

// Partner routes (protected by partner auth)
router.use('/partner', roleMiddleware('partner', 'admin'));

// Get today's orders for restaurant
router.get('/partner/orders/today', getTodaysOrders);

// Get all meal plans for restaurant
router.get('/partner/plans',
  [
    query('status').optional().isIn(['active', 'paused', 'completed', 'cancelled']).withMessage('Invalid status'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ],
  getRestaurantMealPlans
);

module.exports = router;
