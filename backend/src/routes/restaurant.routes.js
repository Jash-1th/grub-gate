// FILE: src/routes/restaurant.routes.js
const express = require('express');
const {
  getRestaurants,
  getRestaurant,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getRestaurantMenu,
  getNearbyRestaurants,
  getRestaurantsByPostalCode,
  debugRestaurants,
  getPopularRestaurants,
  getTopRatedRestaurants,
  getRestaurantAnalytics
} = require('../controllers/restaurant.controller');
const { authMiddleware, roleMiddleware, restaurantOwnershipMiddleware, optionalAuthMiddleware } = require('../middlewares/auth');
const { mealPlanningAuthMiddleware } = require('../middlewares/mealPlanningAuth');
const { restaurantValidations, commonValidations, queryValidations } = require('../middlewares/validation');

const router = express.Router();

// Public routes (with meal planning auth check)
router.get('/', mealPlanningAuthMiddleware, queryValidations.pagination, getRestaurants);
router.get('/nearby', mealPlanningAuthMiddleware, getNearbyRestaurants);
router.get('/by-postal-code', mealPlanningAuthMiddleware, getRestaurantsByPostalCode);
router.get('/debug', debugRestaurants);
router.get('/popular', getPopularRestaurants);
router.get('/top-rated', getTopRatedRestaurants);
router.get('/:id', mealPlanningAuthMiddleware, commonValidations.flexibleId, require('../middlewares/validation').handleValidationErrors, getRestaurant);
router.get('/:id/menu', mealPlanningAuthMiddleware, commonValidations.flexibleId, require('../middlewares/validation').handleValidationErrors, getRestaurantMenu);

// Protected routes - Partner only
router.use(authMiddleware);
router.post('/', roleMiddleware('partner'), restaurantValidations.create, createRestaurant);
router.patch('/:id', commonValidations.mongoId, roleMiddleware('partner', 'admin'), restaurantOwnershipMiddleware, restaurantValidations.update, updateRestaurant);
router.delete('/:id', commonValidations.mongoId, roleMiddleware('partner', 'admin'), restaurantOwnershipMiddleware, deleteRestaurant);

// Analytics route
router.get('/:id/analytics', commonValidations.mongoId, roleMiddleware('partner', 'admin'), restaurantOwnershipMiddleware, getRestaurantAnalytics);

module.exports = router;
